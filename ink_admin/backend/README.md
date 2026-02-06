# INK Admin Backend API

Backend API for INK Admin Dashboard built with Node.js, Express, TypeScript, and PostgreSQL.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **File Upload**: Multer
- **Validation**: Zod
- **Logging**: Winston

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env with your database credentials and JWT secret
```

### Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database with initial data
npm run prisma:seed
```

### Development

```bash
# Start development server with hot reload
npm run dev
```

The server will start on `http://localhost:3001`

### Production

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## API Endpoints

### Authentication

```
POST   /api/auth/login       - Login with email/password
POST   /api/auth/logout      - Logout (authenticated)
GET    /api/auth/me          - Get current user (authenticated)
```

### Merchants

```
GET    /api/merchants              - List merchants (with filters, search, pagination)
GET    /api/merchants/:id          - Get merchant details
POST   /api/merchants              - Create merchant
PUT    /api/merchants/:id          - Update merchant
DELETE /api/merchants/:id          - Delete merchant
PUT    /api/merchants/:id/threshold - Update alert threshold
GET    /api/merchants/:id/usage    - Get usage history
GET    /api/merchants/:id/refills  - Get refill history
```

### Orders

```
GET    /api/orders           - List orders (with filters)
GET    /api/orders/:id       - Get order details
POST   /api/orders           - Create order
PUT    /api/orders/:id/status - Update order status
```

### Videos

```
GET    /api/videos           - List videos
GET    /api/videos/:id       - Get video details
POST   /api/videos           - Upload video (multipart/form-data)
PUT    /api/videos/:id       - Update video
DELETE /api/videos/:id       - Delete video
```

### Statistics

```
GET    /api/stats/dashboard  - Get dashboard statistics
```

## Authentication

All endpoints except `/api/auth/login` and `/health` require authentication.

Include JWT token in Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Default Credentials

After seeding the database:

- Email: `admin@in.ink`
- Password: `Admin123!`

**Change this in production!**

## Environment Variables

See `env.example` for all available configuration options.

Key variables:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT signing (min 32 characters)
- `PORT` - Server port (default: 3001)
- `ALLOWED_ORIGINS` - CORS allowed origins (comma-separated)

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Seed data
├── src/
│   ├── config/              # Configuration files
│   ├── controllers/         # Route controllers
│   ├── middlewares/         # Express middlewares
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   ├── types/               # TypeScript types
│   ├── utils/               # Utility functions
│   ├── app.ts               # Express app setup
│   └── server.ts            # Server entry point
├── uploads/                 # Uploaded files (gitignored)
├── .env                     # Environment variables (gitignored)
└── package.json
```

## Firebase Cloud Run Deployment

### Build Docker Image

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY prisma ./prisma
RUN npx prisma generate

COPY dist ./dist

EXPOSE 8080
CMD ["node", "dist/server.js"]
```

### Deploy

```bash
# Build
npm run build

# Build and push to Cloud Run
gcloud run deploy ink-admin-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

## Database Migrations

```bash
# Create new migration
npm run prisma:migrate

# Apply migrations in production
DATABASE_URL=<prod-url> npx prisma migrate deploy

# Open Prisma Studio
npm run prisma:studio
```

## Metabase Integration

Metabase can connect directly to the PostgreSQL database using read-only credentials.

Create read-only user:

```sql
CREATE USER metabase_readonly WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE ink_admin TO metabase_readonly;
GRANT USAGE ON SCHEMA public TO metabase_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO metabase_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO metabase_readonly;
```

## License

ISC
