# Deployment Guide

## Backend Status

Backend is deployed and running at:
```
https://us-central1-inink-c76d3.cloudfunctions.net/api
```

### Verified Endpoints
- ✅ GET /health
- ✅ GET /.well-known/jwks.json
- ✅ POST /enroll
- ✅ POST /verify
- ✅ GET /retrieve/:proofId

## Frontend Configuration

The frontend is configured to use the production backend:

```typescript
// src/lib/config.ts
export const API_BASE_URL = 'https://us-central1-inink-c76d3.cloudfunctions.net/api';
```

## Local Development

```bash
cd ink_web
npm install
npm run dev
```

Frontend will run at `http://localhost:5173`

## Build for Production

```bash
npm run build
```

Output: `dist/` directory

## Deployment Options

### Option 1: Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize hosting (if not done)
firebase init hosting

# Deploy
firebase deploy --only hosting
```

### Option 2: Netlify

1. Connect GitHub repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Deploy

### Option 3: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Option 4: Static Hosting

Upload `dist/` contents to any static host:
- AWS S3 + CloudFront
- Google Cloud Storage
- Azure Static Web Apps
- GitHub Pages

## Environment Variables

For different environments, create:

### `.env.local` (local development)
```
VITE_API_BASE_URL=http://localhost:5001/inink-c76d3/us-central1/api
```

### `.env.production` (production)
```
VITE_API_BASE_URL=https://us-central1-inink-c76d3.cloudfunctions.net/api
```

## Domain Setup

For production domain `in.ink`:

1. Configure DNS:
   - A record or CNAME pointing to hosting provider
   
2. Update NFC tags to redirect to:
   - `https://in.ink/t/{token}`

3. SSL Certificate:
   - Most hosting providers auto-provision SSL
   - Ensure HTTPS is enforced

## Testing Production

### Test Endpoints

```bash
# Health check
curl https://us-central1-inink-c76d3.cloudfunctions.net/api/health

# Public key
curl https://us-central1-inink-c76d3.cloudfunctions.net/api/.well-known/jwks.json
```

### Test Frontend Flow

1. Create test enrollment via backend
2. Visit `https://your-domain.com/t/{test_token}`
3. Grant location permission
4. Verify delivery flow works
5. Check proof page displays correctly

## CORS Configuration

Backend already configured with CORS enabled for all origins.

If you need to restrict origins, update `functions/app.js`:

```javascript
app.use(cors({
  origin: ['https://in.ink', 'https://www.in.ink'],
  credentials: true
}));
```

## Monitoring

### Backend Logs
```bash
firebase functions:log
```

### Frontend Analytics

Add analytics to `src/main.tsx`:

```typescript
// Google Analytics
import ReactGA from 'react-ga4';
ReactGA.initialize('G-XXXXXXXXXX');
```

## Security Checklist

- ✅ HTTPS enforced
- ✅ Rate limiting enabled (100 req/hour)
- ✅ CORS configured
- ✅ Input validation on backend
- ✅ Phone numbers stored as last 4 digits only
- ✅ GPS coordinates rounded for privacy
- ✅ Ed25519 signatures for proof integrity

## Performance Optimization

### Frontend
- ✅ Code splitting (React Router)
- ✅ Lazy loading components
- ✅ Optimized images
- ✅ Minified production build

### Backend
- Firebase Functions auto-scales
- Firestore indexes configured
- Webhook retry logic implemented

## Troubleshooting

### Issue: CORS errors
**Solution:** Verify backend CORS configuration allows frontend domain

### Issue: Geolocation not working
**Solution:** Ensure HTTPS is enabled (required for geolocation API)

### Issue: 404 on routes
**Solution:** Configure hosting for SPA routing:

**Firebase:** `firebase.json`
```json
{
  "hosting": {
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

**Netlify:** `_redirects`
```
/*    /index.html   200
```

**Vercel:** `vercel.json`
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## Next Steps

1. Deploy frontend to hosting provider
2. Configure custom domain `in.ink`
3. Update NFC tags with production URLs
4. Test end-to-end with real NFC tags
5. Monitor logs and analytics
6. Set up error tracking (Sentry, etc.)

## Support

For issues or questions:
- Check backend logs: `firebase functions:log`
- Check browser console for frontend errors
- Verify API endpoints are accessible
- Test with curl commands from TEST_PLAN.md

