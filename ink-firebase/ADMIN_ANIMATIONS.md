# Admin Panel & Merchant Animations

## Overview

- **Admin panel**: You log in at `/admin/login`, then manage merchant animations at `/admin`.
- **NFC tap**: When a customer taps an NFC sticker, the app looks up the proof’s **merchant name**, then the **animation** for that merchant. If an animation exists, it plays (loop, during load) instead of the default spinner; then the app navigates to the delivery record.

## Backend env

In Firebase Functions config (or `.env` for local):

- **`ADMIN_PASSWORD`** – Password for admin login. Required for `/admin/login` to work.

Example (Firebase):

```bash
firebase functions:config:set app.admin_password="YOUR_SECRET_PASSWORD"
```

Then in code read via `functions.config().app.admin_password` or set in `.env` as `ADMIN_PASSWORD` for local runs.

## Firebase Storage

Merchant animation files are stored in Firebase Storage. Ensure:

1. Storage is enabled for your Firebase project.
2. Default bucket is available (Firebase Admin uses the default bucket).

If you use a custom bucket, set `storageBucket` in `admin.initializeApp()` in `index.js`.

## API summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/merchant-by-token?nfc_token=xxx` | No | Returns `{ merchant }` for the proof with that NFC token. |
| GET | `/merchant-animation/:merchantName` | No | Returns `{ animation_url }` for that merchant (404 if none). |
| POST | `/admin/login` | No | Body `{ password }`. Returns `{ token }` (JWT). |
| GET | `/admin/merchant-animations` | Bearer | List all merchant animations. |
| POST | `/admin/merchant-animation` | Bearer | Form: `merchant` (string), `animation` (file). Max 10MB. Allowed: .mp4, .webm, .gif, .mov. |

## Flow

1. **Enroll**: Merchant name is stored on the proof (`enroll` body must include `merchant`).
2. **Admin**: You add a merchant name and upload an animation; it’s stored by slug (e.g. "Walmart" → `walmart`).
3. **NFC tap**: App calls `GET /merchant-by-token?nfc_token=...` → gets `merchant` → `GET /merchant-animation/:merchant` → gets `animation_url` → plays video/gif during load, then navigates to delivery record.
