# Integration Test Plan

## Prerequisites

1. Backend API running at `http://193.57.137.90:8000`
2. Valid test data in Firestore
3. Frontend dev server running: `npm run dev`

## Test Scenarios

### 1. Health Check
```bash
curl http://193.57.137.90:8000/health
```
Expected: `{"status":"ok","timestamp":"..."}`

### 2. Create Test Enrollment

First, enroll a test package:

```bash
curl -X POST http://193.57.137.90:8000/enroll \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "TEST-001",
    "nfc_uid": "04:AA:BB:CC:DD:EE:FF",
    "nfc_token": "test_token_12345",
    "photo_urls": [
      "https://picsum.photos/400/400?random=1",
      "https://picsum.photos/400/400?random=2",
      "https://picsum.photos/400/400?random=3",
      "https://picsum.photos/400/400?random=4"
    ],
    "photo_hashes": [
      "hash1234567890abcdef",
      "hash2234567890abcdef",
      "hash3234567890abcdef",
      "hash4234567890abcdef"
    ],
    "shipping_address_gps": {
      "lat": 40.7128,
      "lng": -74.0060
    },
    "customer_phone_last4": "5678",
    "warehouse_gps": {
      "lat": 40.7580,
      "lng": -73.9855
    }
  }'
```

Save the returned `proof_id`.

### 3. Test Delivery Verification (Auto-Pass)

Visit: `http://localhost:5173/t/test_token_12345`

**Expected Flow:**
1. Loading screen appears
2. Browser requests location permission
3. If within 100m of shipping address → Success screen
4. Click "View Record" → Shows proof page

**Manual Test:**
- Grant location permission
- Verify loading → success transition
- Check console for API calls
- Verify proof_id in URL after clicking button

### 4. Test Phone Verification Flow

To force phone verification, use coordinates >100m away:

```bash
curl -X POST http://193.57.137.90:8000/verify \
  -H "Content-Type: application/json" \
  -d '{
    "nfc_token": "test_token_12345",
    "delivery_gps": {
      "lat": 40.7500,
      "lng": -74.0200
    },
    "device_info": "Test Browser"
  }'
```

Expected: `{"error":"Phone verification required","requires_phone":true}`

**Frontend Test:**
1. Visit `/t/test_token_12345` with location >100m away
2. Should show phone input screen
3. Enter correct last 4 digits: `5678`
4. Should verify successfully
5. Enter wrong digits → Should show error

### 5. Test Proof Retrieval

Visit: `http://localhost:5173/verify/{proof_id}`

**Expected:**
- Shows "Delivery Record" header
- Displays 4 photos
- Shows order ID (masked)
- Shows GPS coordinates
- Shows delivery status if verified
- Shows signature and key_id

### 6. Error Cases

#### Invalid Token
Visit: `http://localhost:5173/t/invalid_token_xyz`
Expected: "Invalid Link" screen

#### Already Verified
Try verifying same token twice:
Expected: "Unable to confirm" with error message

#### Network Error
1. Stop backend server
2. Try verification
Expected: "Network error" message

## API Response Examples

### Successful Verification
```json
{
  "proof_id": "proof_abc123",
  "verification_status": "verified",
  "gps_verdict": "pass",
  "distance_meters": 45,
  "signature": "ed25519_signature_here",
  "verify_url": "https://in.ink/verify/proof_abc123"
}
```

### Phone Required
```json
{
  "error": "Phone verification required",
  "requires_phone": true
}
```

### Phone Mismatch
```json
{
  "error": "Phone verification failed"
}
```

### Proof Record
```json
{
  "proof_id": "proof_abc123",
  "order_id": "TEST***001",
  "enrollment": {
    "timestamp": "2024-01-01T12:00:00Z",
    "shipping_address_gps": {"lat": 40.7128, "lng": -74.0060},
    "photo_urls": ["..."],
    "photo_hashes": ["..."]
  },
  "delivery": {
    "timestamp": "2024-01-01T14:30:00Z",
    "delivery_gps": {"lat": 40.7130, "lng": -74.0062},
    "device_info": "Chrome on Android",
    "gps_verdict": "pass",
    "phone_verified": false
  },
  "signature": "...",
  "public_key": "...",
  "key_id": "key_001"
}
```

## Checklist

- [ ] Backend health check passes
- [ ] Can enroll test package
- [ ] Delivery verification with GPS works
- [ ] Phone verification flow works
- [ ] Proof record displays correctly
- [ ] Error states render properly
- [ ] Loading states show correctly
- [ ] Navigation between pages works
- [ ] Mobile responsive design works
- [ ] Geolocation permission handling works

## Known Issues

1. Windows PowerShell doesn't support `&&` - use separate commands
2. CORS may need configuration for local testing
3. Geolocation requires HTTPS in production

## Production Testing

Before deploying to production:

1. Update `VITE_API_BASE_URL` to production endpoint
2. Test with real NFC tags
3. Test on actual mobile devices (iOS Safari, Android Chrome)
4. Verify HTTPS works correctly
5. Test geolocation on mobile networks
6. Verify webhook delivery to Shopify

