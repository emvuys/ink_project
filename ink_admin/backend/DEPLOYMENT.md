# Firebase Cloud Run Deployment Guide

Step-by-step guide to deploy INK Admin Backend to Google Cloud Run.

## Prerequisites

- Google Cloud Platform account
- gcloud CLI installed
- Docker installed (optional, can use Cloud Build)
- Firebase project created

## Step 1: Setup GCP Project

```bash
# Install gcloud CLI if not installed
# https://cloud.google.com/sdk/docs/install

# Login to GCP
gcloud auth login

# Create new project or use existing
gcloud projects create ink-admin-2026 --name="INK Admin"

# Set project
gcloud config set project ink-admin-2026

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable storage-api.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

## Step 2: Create Cloud SQL Instance

```bash
# Create PostgreSQL instance
gcloud sql instances create ink-admin-db \
  --database-version=POSTGRES_14 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --root-password=CHANGE_THIS_PASSWORD \
  --backup

# Create database
gcloud sql databases create ink_admin \
  --instance=ink-admin-db

# Create user
gcloud sql users create ink_admin_user \
  --instance=ink-admin-db \
  --password=SECURE_PASSWORD_HERE

# Get connection name
gcloud sql instances describe ink-admin-db --format="value(connectionName)"
# Output: PROJECT_ID:REGION:INSTANCE_NAME
```

## Step 3: Setup Cloud Storage for Videos

```bash
# Create bucket for video uploads
gsutil mb -p ink-admin-2026 -c STANDARD -l us-central1 gs://ink-admin-videos

# Set public read access for videos
gsutil iam ch allUsers:objectViewer gs://ink-admin-videos

# Create service account for backend
gcloud iam service-accounts create ink-admin-backend \
  --display-name="INK Admin Backend"

# Grant storage access
gcloud projects add-iam-policy-binding ink-admin-2026 \
  --member="serviceAccount:ink-admin-backend@ink-admin-2026.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"

# Download service account key
gcloud iam service-accounts keys create gcs-key.json \
  --iam-account=ink-admin-backend@ink-admin-2026.iam.gserviceaccount.com
```

## Step 4: Build and Deploy Backend

### Option A: Using Cloud Build (Recommended)

Create `cloudbuild.yaml`:

```yaml
steps:
  # Build the container image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/ink-admin-api', '.']

  # Push the container image to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/ink-admin-api']

  # Deploy container image to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'ink-admin-api'
      - '--image'
      - 'gcr.io/$PROJECT_ID/ink-admin-api'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'

images:
  - 'gcr.io/$PROJECT_ID/ink-admin-api'
```

Deploy:

```bash
gcloud builds submit --config cloudbuild.yaml
```

### Option B: Manual Docker Build

```bash
# Build image
docker build -t gcr.io/ink-admin-2026/ink-admin-api .

# Push to Container Registry
docker push gcr.io/ink-admin-2026/ink-admin-api

# Deploy to Cloud Run
gcloud run deploy ink-admin-api \
  --image gcr.io/ink-admin-2026/ink-admin-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances ink-admin-2026:us-central1:ink-admin-db \
  --set-env-vars "DATABASE_URL=postgresql://ink_admin_user:SECURE_PASSWORD@localhost/ink_admin?host=/cloudsql/ink-admin-2026:us-central1:ink-admin-db" \
  --set-env-vars "JWT_SECRET=$(openssl rand -base64 32)" \
  --set-env-vars "NODE_ENV=production" \
  --set-env-vars "ALLOWED_ORIGINS=https://your-app.web.app" \
  --set-env-vars "GCS_BUCKET_NAME=ink-admin-videos" \
  --set-env-vars "GCS_PROJECT_ID=ink-admin-2026" \
  --memory 512Mi \
  --max-instances 10
```

## Step 5: Run Database Migrations

```bash
# Connect to Cloud SQL via proxy
cloud_sql_proxy -instances=ink-admin-2026:us-central1:ink-admin-db=tcp:5432 &

# Set environment variable
export DATABASE_URL="postgresql://ink_admin_user:SECURE_PASSWORD@localhost:5432/ink_admin"

# Run migrations
npx prisma migrate deploy

# Seed database
npx prisma db seed
```

## Step 6: Setup Custom Domain (Optional)

```bash
# Map custom domain to Cloud Run
gcloud run domain-mappings create \
  --service ink-admin-api \
  --domain api.ink-admin.com \
  --region us-central1

# Follow instructions to add DNS records
```

## Step 7: Setup Monitoring

### Enable Logging

```bash
# View logs
gcloud run services logs read ink-admin-api \
  --region us-central1 \
  --limit 50

# Tail logs
gcloud run services logs tail ink-admin-api \
  --region us-central1
```

### Create Alerts

```bash
# Alert for high error rate
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="High API Error Rate" \
  --condition-display-name="Error rate > 5%" \
  --condition-threshold-value=5 \
  --condition-threshold-duration=60s
```

## Step 8: Security Hardening

### Setup Cloud Armor (Optional DDoS Protection)

```bash
# Create security policy
gcloud compute security-policies create ink-admin-policy \
  --description "Rate limiting and DDoS protection"

# Add rate limiting rule
gcloud compute security-policies rules create 1000 \
  --security-policy ink-admin-policy \
  --expression "true" \
  --action "rate-based-ban" \
  --rate-limit-threshold-count 100 \
  --rate-limit-threshold-interval-sec 60 \
  --ban-duration-sec 600
```

### Enable Secret Manager

```bash
# Store JWT secret
echo -n "your-jwt-secret" | gcloud secrets create jwt-secret --data-file=-

# Grant access to Cloud Run
gcloud secrets add-iam-policy-binding jwt-secret \
  --member="serviceAccount:ink-admin-backend@ink-admin-2026.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Update Cloud Run to use secret
gcloud run services update ink-admin-api \
  --update-secrets JWT_SECRET=jwt-secret:latest \
  --region us-central1
```

## Step 9: CI/CD Setup

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - id: 'auth'
        uses: 'google-github-actions/auth@v1'
        with:
          credentials_json: '${{ secrets.GCP_SA_KEY }}'

      - name: 'Set up Cloud SDK'
        uses: 'google-github-actions/setup-gcloud@v1'

      - name: 'Build and Deploy'
        run: |
          gcloud builds submit --config cloudbuild.yaml
```

## Step 10: Connect Metabase

### Allow Metabase IP

```bash
# Get Cloud SQL authorized networks
gcloud sql instances patch ink-admin-db \
  --authorized-networks=METABASE_IP_ADDRESS
```

### Connection Details for Metabase

- **Host**: Cloud SQL Public IP
- **Port**: 5432
- **Database**: ink_admin
- **Username**: metabase_readonly (create this)
- **Password**: (set secure password)

Create read-only user:

```sql
CREATE USER metabase_readonly WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE ink_admin TO metabase_readonly;
GRANT USAGE ON SCHEMA public TO metabase_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO metabase_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO metabase_readonly;
```

## Estimated Costs

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Cloud Run | 1M requests | ~$0-5 |
| Cloud SQL | db-f1-micro | ~$7 |
| Cloud Storage | 10GB | ~$0.20 |
| **Total** | | **~$7-12/month** |

Free tier covers most development usage.

## Production Checklist

- [ ] Change default admin password
- [ ] Set strong JWT_SECRET
- [ ] Enable Cloud SQL backups
- [ ] Setup monitoring alerts
- [ ] Configure CORS properly
- [ ] Enable Cloud Armor
- [ ] Setup custom domain
- [ ] Configure CDN for static files
- [ ] Enable audit logging
- [ ] Setup CI/CD pipeline
- [ ] Test disaster recovery

## Troubleshooting

### Cloud Run service won't start

```bash
# Check logs
gcloud run services logs read ink-admin-api --limit 100

# Common issues:
# - DATABASE_URL incorrect
# - Missing environment variables
# - Port not set to 8080
```

### Database connection timeout

```bash
# Verify Cloud SQL instance is running
gcloud sql instances list

# Check connection name is correct
gcloud sql instances describe ink-admin-db

# Test connection via proxy
cloud_sql_proxy -instances=CONNECTION_NAME=tcp:5432
psql -h 127.0.0.1 -U ink_admin_user ink_admin
```

### Out of memory errors

```bash
# Increase memory limit
gcloud run services update ink-admin-api \
  --memory 1Gi \
  --region us-central1
```

## Useful Commands

```bash
# View service details
gcloud run services describe ink-admin-api --region us-central1

# Update environment variable
gcloud run services update ink-admin-api \
  --update-env-vars KEY=VALUE \
  --region us-central1

# Scale service
gcloud run services update ink-admin-api \
  --max-instances 20 \
  --region us-central1

# Rollback deployment
gcloud run services update-traffic ink-admin-api \
  --to-revisions REVISION_NAME=100 \
  --region us-central1
```
