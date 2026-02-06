# Quick Reference Card

## 🚀 Start Development

```bash
# Backend
cd backend
npm run dev         # http://localhost:3001

# Frontend  
cd frontend
npm run dev         # http://localhost:5173
```

## 🔑 Default Login

```
Email: admin@in.ink
Password: Admin123!
```

## 📡 API Base URL

Development: `http://localhost:3001/api`

## 🗄️ Database

```bash
# View/Edit database in browser
cd backend
npm run prisma:studio    # http://localhost:5555

# Reset database
npm run prisma:migrate reset

# Reseed data
npm run prisma:seed
```

## 📦 Key Commands

### Backend

```bash
npm run dev              # Start with hot reload
npm run build            # Build for production
npm start                # Run production build
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open database GUI
```

### Frontend

```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
```

## 📁 Important Files

### Backend Configuration
- `backend/.env` - Environment variables
- `backend/prisma/schema.prisma` - Database schema
- `backend/src/config/env.ts` - Config validation

### Frontend Configuration
- `frontend/.env.local` - API URL
- `frontend/src/lib/mockData.ts` - Mock data (replace with API)

## 🔌 API Quick Test

```bash
# Login and get token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@in.ink","password":"Admin123!"}'

# Use token
TOKEN="your-token-here"

# Get merchants
curl http://localhost:3001/api/merchants \
  -H "Authorization: Bearer $TOKEN"

# Get dashboard stats
curl http://localhost:3001/api/stats/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check PostgreSQL is running
# Windows: services.msc → PostgreSQL

# Verify database connection
cd backend
npx prisma db push
```

### Frontend API errors
```bash
# Check CORS settings in backend
# backend/src/app.ts line 12

# Verify API URL
cat frontend/.env.local
```

### Database connection failed
```bash
# Check DATABASE_URL in backend/.env
# Format: postgresql://user:pass@localhost:5432/dbname
```

### Port already in use
```bash
# Windows - Kill process on port 3001
netstat -ano | findstr :3001
taskkill /PID [PID_NUMBER] /F
```

## 📚 Documentation

- **Setup**: `SETUP_GUIDE.md` - Complete setup instructions
- **Backend**: `backend/README.md` - API documentation
- **Database**: `backend/DATABASE_DESIGN.md` - Schema design
- **Deploy**: `backend/DEPLOYMENT.md` - Cloud deployment
- **Tests**: `backend/API_TESTS.http` - API test examples
- **Summary**: `PROJECT_SUMMARY.md` - Project overview

## 🎯 Common Tasks

### Add New API Endpoint

1. Create service method in `backend/src/services/`
2. Create controller method in `backend/src/controllers/`
3. Add route in `backend/src/routes/`
4. Add validation schema in `backend/src/utils/validation.ts`

### Add New Database Table

1. Edit `backend/prisma/schema.prisma`
2. Run `npm run prisma:migrate`
3. Update seed file if needed

### Connect Frontend Component to API

```typescript
// 1. Create API service
// frontend/src/services/api.ts
export const api = {
  getItems: () => 
    fetch(`${API_URL}/items`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json())
};

// 2. Use in component with React Query
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

const { data } = useQuery({
  queryKey: ['items'],
  queryFn: api.getItems
});
```

## 🔐 Security Checklist

- [ ] Change default admin password
- [ ] Set strong JWT_SECRET (32+ chars)
- [ ] Update ALLOWED_ORIGINS for production
- [ ] Enable HTTPS in production
- [ ] Never commit .env files
- [ ] Use environment-specific configs

## 📊 Database Stats

- 5 tables
- 25 API endpoints
- 2 sample merchants
- 10 usage records
- 2 orders
- 2 videos

## 💾 Backup Database

```bash
# Export
pg_dump -U postgres ink_admin > backup.sql

# Import
psql -U postgres ink_admin < backup.sql
```

## 🌐 Environment Variables

### Required

```env
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=min-32-characters-long-secret
```

### Optional

```env
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
MAX_FILE_SIZE=1048576
UPLOAD_DIR=uploads
```

## 📞 Need Help?

1. Check logs: `backend/combined.log`
2. Check Prisma Studio: `npm run prisma:studio`
3. Test API: Use `API_TESTS.http` file
4. Read docs: Start with `SETUP_GUIDE.md`
