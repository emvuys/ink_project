# Web-Backend Integration Guide

## Overview

The web frontend is now fully integrated with the Firebase backend API.

## Architecture

### API Client (`src/lib/api.ts`)
- `verifyDelivery()` - POST /verify
- `retrieveProof()` - GET /retrieve/:proofId
- `checkHealth()` - GET /health

### Type Definitions (`src/lib/types.ts`)
- `VerifyRequest` / `VerifyResponse`
- `ProofRecord`
- `GpsCoordinates`

### Geolocation (`src/lib/geolocation.ts`)
- `getCurrentPosition()` - Browser geolocation API wrapper
- `getDeviceInfo()` - User agent parsing

## Routes

| Route | Purpose | Backend Call |
|-------|---------|--------------|
| `/t/:token` | NFC tap entry point | POST /verify |
| `/verify/:proofId` | Proof record display | GET /retrieve/:proofId |
| `/record/:proofId` | Alias for verify | GET /retrieve/:proofId |

## Verification Flow

1. User taps NFC tag → redirected to `/t/{token}`
2. Page loads → requests geolocation permission
3. If GPS granted:
   - Calls `/verify` with token + coordinates
   - Distance ≤100m → auto-verify → success
   - Distance >100m → requires phone verification
4. If GPS denied or distance check fails:
   - Shows phone input screen
   - Submits last 4 digits with `/verify`
5. On success → shows success screen with "View Record" button
6. Clicking button → navigates to `/verify/{proof_id}`

## Error Handling

| Error | Status | UI State |
|-------|--------|----------|
| Invalid token | 404 | InvalidLinkState |
| Already verified | 400 | FailedState |
| Phone mismatch | 403 | PhoneVerificationState (with error) |
| Network error | 0 | FailedState |

## Configuration

Set API base URL in `src/lib/config.ts`:

```typescript
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://193.57.137.90:8000';
```

For production, create `.env.local`:

```
VITE_API_BASE_URL=https://us-central1-ink-nfs.cloudfunctions.net/api
```

## Testing

### Local Development
```bash
npm run dev
```

### Test URLs
- Success flow: `http://localhost:5173/t/{valid_token}`
- Proof display: `http://localhost:5173/verify/{proof_id}`

### API Health Check
```bash
curl http://193.57.137.90:8000/health
```

## Security Notes

- All API calls use HTTPS in production
- Phone numbers only stored as last 4 digits
- GPS coordinates rounded for privacy in display
- No authentication tokens stored client-side
- Rate limiting handled by backend (100 req/hour)

## Browser Compatibility

- Geolocation API: Chrome 50+, Safari 10+, Firefox 55+
- Fetch API: All modern browsers
- Vibration API: Android Chrome (optional enhancement)

## Production Checklist

- [ ] Update `VITE_API_BASE_URL` to production endpoint
- [ ] Test NFC tag redirects to correct domain
- [ ] Verify HTTPS certificates
- [ ] Test on iOS Safari and Android Chrome
- [ ] Confirm geolocation permissions work
- [ ] Test phone verification flow
- [ ] Verify proof record display with real data

