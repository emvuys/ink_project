# INK Admin Project Setup Guide

Complete setup guide for the INK Admin system with backend API and frontend dashboard.

## Project Structure

```
ink_admin/
├── backend/           # Node.js Express API
│   ├── src/
│   ├── prisma/
│   ├── package.json
│   └── README.md
├── lovable/          # React frontend (rename to 'frontend')
│   ├── src/
│   ├── package.json
│   └── README.md
└── SETUP_GUIDE.md    # This file
```

## Step 1: Reorganize Directories

**Rename `lovable` to `frontend`:**

```bash
# On Windows
cd E:\upwork\ink_project\ink_admin
# Close any IDE/terminal that has lovable directory open
# Then rename in File Explorer or use:
ren lovable frontend
```

Final structure:
```
ink_admin/
├── backend/
└── frontend/
```

## Step 2: Backend Setup

### Install Dependencies

```bash
cd backend
npm install
```

### Configure Environment

```bash
# Copy environment file
cp env.example .env
```

Edit `.env` file:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/ink_admin?schema=public"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars-long"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"
MAX_FILE_SIZE=1048576
UPLOAD_DIR="uploads"
```

### Setup Database

1. **Install PostgreSQL** (if not installed)
   - Download from: https://www.postgresql.org/download/

2. **Create Database**

```sql
CREATE DATABASE ink_admin;
```

3. **Run Migrations**

```bash
npm run prisma:generate
npm run prisma:migrate
```

4. **Seed Database**

```bash
npm run prisma:seed
```

This creates:
- Admin user: `admin@in.ink` / `Admin123!`
- Sample merchants (MAAP, Kylie Cosmetics)
- Sample orders
- Sample videos

### Start Backend

```bash
# Development mode (with hot reload)
npm run dev

# The API will be available at http://localhost:3001
# Health check: http://localhost:3001/health
```

## Step 3: Frontend Setup

### Update API Configuration

Navigate to frontend directory:

```bash
cd ../frontend  # or ../lovable if not renamed yet
```

Create `.env.local`:

```env
VITE_API_URL=http://localhost:3001/api
```

### Update API Calls

The frontend currently uses mock data. You need to replace mock data calls with real API calls.

#### Example: Update Auth Page

```typescript
// frontend/src/pages/Auth.tsx

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    localStorage.setItem('token', data.token);
    navigate('/');
  } catch (error) {
    console.error('Login failed:', error);
  } finally {
    setIsLoading(false);
  }
};
```

### Install Dependencies & Run

```bash
npm install
npm run dev

# Frontend will be available at http://localhost:5173
```

## Step 4: Connect Frontend to Backend

### Create API Service

Create `frontend/src/services/api.ts`:

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const api = {
  // Auth
  login: (email: string, password: string) =>
    fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(r => r.json()),

  // Merchants
  getMerchants: (query?: string) =>
    fetch(`${API_URL}/merchants${query || ''}`, {
      headers: getHeaders(),
    }).then(r => r.json()),

  getMerchant: (id: string) =>
    fetch(`${API_URL}/merchants/${id}`, {
      headers: getHeaders(),
    }).then(r => r.json()),

  // Orders
  getOrders: () =>
    fetch(`${API_URL}/orders`, {
      headers: getHeaders(),
    }).then(r => r.json()),

  updateOrderStatus: (id: string, status: string) =>
    fetch(`${API_URL}/orders/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    }).then(r => r.json()),

  // Videos
  getVideos: () =>
    fetch(`${API_URL}/videos`, {
      headers: getHeaders(),
    }).then(r => r.json()),

  uploadVideo: (formData: FormData) =>
    fetch(`${API_URL}/videos`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    }).then(r => r.json()),

  // Stats
  getDashboardStats: () =>
    fetch(`${API_URL}/stats/dashboard`, {
      headers: getHeaders(),
    }).then(r => r.json()),
};
```

### Update Components

Replace mock data imports with API calls using React Query:

```typescript
// Example: frontend/src/components/dashboard/StatCards.tsx
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

export function StatCards() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: api.getDashboardStats,
  });

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="stat-card p-4">
        <p className="text-xs text-muted-foreground">Total Merchants</p>
        <p className="text-2xl font-semibold">{stats.totalMerchants}</p>
      </div>
      {/* ... other stat cards */}
    </div>
  );
}
```

## Step 5: Firebase Deployment

### Backend (Cloud Run)

1. **Build Docker image:**

```bash
cd backend
docker build -t gcr.io/YOUR_PROJECT_ID/ink-admin-api .
docker push gcr.io/YOUR_PROJECT_ID/ink-admin-api
```

2. **Deploy to Cloud Run:**

```bash
gcloud run deploy ink-admin-api \
  --image gcr.io/YOUR_PROJECT_ID/ink-admin-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=$DATABASE_URL,JWT_SECRET=$JWT_SECRET
```

### Frontend (Firebase Hosting)

1. **Install Firebase CLI:**

```bash
npm install -g firebase-tools
firebase login
```

2. **Initialize Firebase:**

```bash
cd frontend
firebase init hosting
# Select your project
# Public directory: dist
# Single-page app: Yes
# Set up automatic builds: No
```

3. **Update API URL:**

Edit `frontend/.env.production`:

```env
VITE_API_URL=https://your-api-url.run.app/api
```

4. **Build & Deploy:**

```bash
npm run build
firebase deploy --only hosting
```

## Step 6: Database (Cloud SQL)

### Create Cloud SQL Instance

```bash
gcloud sql instances create ink-admin-db \
  --database-version=POSTGRES_14 \
  --tier=db-f1-micro \
  --region=us-central1
```

### Create Database & User

```bash
gcloud sql databases create ink_admin --instance=ink-admin-db

gcloud sql users create ink_admin_user \
  --instance=ink-admin-db \
  --password=YOUR_SECURE_PASSWORD
```

### Run Migrations

```bash
# Get connection string
gcloud sql instances describe ink-admin-db

# Set DATABASE_URL and run migrations
DATABASE_URL="postgresql://ink_admin_user:password@/ink_admin?host=/cloudsql/PROJECT:REGION:ink-admin-db" \
npx prisma migrate deploy
```

## Step 7: Metabase Setup

### Option 1: Metabase Cloud (Recommended)

1. Sign up at https://www.metabase.com/start/
2. Connect to Cloud SQL database
3. Get embeddable dashboard URL
4. Update frontend Analytics component

### Option 2: Self-hosted (Railway/Heroku)

1. Deploy Metabase Docker image
2. Configure database connection
3. Create dashboards
4. Embed in frontend

## Testing

### Backend Tests

```bash
cd backend

# Test health endpoint
curl http://localhost:3001/health

# Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@in.ink","password":"Admin123!"}'

# Test authenticated endpoint
curl http://localhost:3001/api/merchants \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Frontend Tests

1. Open http://localhost:5173
2. Login with `admin@in.ink` / `Admin123!`
3. Test all features:
   - View merchants
   - Update order status
   - Upload videos
   - Check statistics

## Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

**Database connection failed:**
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Check firewall settings

### Frontend Issues

**API calls failing:**
- Check CORS settings in backend
- Verify VITE_API_URL is correct
- Check browser console for errors

**Build fails:**
```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. ✅ Backend API completed
2. ✅ Database schema designed
3. ✅ Seed data created
4. ⏳ Connect frontend to backend
5. ⏳ Deploy to Firebase
6. ⏳ Setup Metabase

## Support

For issues, check:
- Backend logs: `backend/combined.log`
- Frontend console: Browser DevTools
- Database: `npm run prisma:studio`
