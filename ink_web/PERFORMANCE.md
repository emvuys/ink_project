# Performance & CDN

## Firebase Hosting = CDN by default

Firebase Hosting serves your static files (HTML, JS, CSS, images) over **Google’s global CDN**. You don’t need to add a separate CDN: every deploy is cached at edge locations worldwide. Users get assets from the nearest edge, so first load and repeat visits are faster.

## What’s already done

### 1. Cache headers (firebase.json)

- **index.html**: `no-cache, no-store, must-revalidate` so users always get the latest HTML and new asset URLs after a deploy.
- **JS/CSS/fonts/images**: `public, max-age=31536000, immutable` so hashed files are cached for 1 year. Deploys use new hashes, so cache is invalidated via HTML.

### 2. Preconnect to API (index.html)

- `preconnect` and `dns-prefetch` to your Cloud Functions origin (e.g. `https://us-central1-inink-c76d3.cloudfunctions.net`) so the first API request starts sooner (DNS/TLS already in progress).
- If you use a different API base URL (e.g. custom domain), update these `<link>` tags in `index.html` to match.

### 3. Frontend build (Vite)

- **Lazy routes**: Pages are loaded on demand with `React.lazy()`, so the initial JS bundle is smaller and the app becomes interactive faster.
- **Chunk splitting**: Vendor chunks (React, React Router, Radix, TanStack Query) are split so the browser can cache them across deploys.
- **Production**: `console` / `debugger` are stripped in production builds to reduce size and noise.

### 4. Suspense fallback

- Route chunks load asynchronously; the fallback is a minimal black screen so there’s no heavy “loading” UI.

## Optional: make it even faster

### Frontend

- **Analyze bundle**: `npm run build` then use e.g. `rollup-plugin-visualizer` to see what’s in each chunk and trim large dependencies.
- **Image/asset optimization**: Compress images and use modern formats (WebP, AVIF) where possible.
- **Critical CSS**: If you add a lot of global CSS, consider inlining above-the-fold critical CSS (Vite doesn’t do this by default).

### Backend (Cloud Functions)

- **Region**: Functions run in one region (e.g. `us-central1`). If most users are in another continent, consider deploying a second function in a closer region and routing traffic (e.g. via a proxy or different API URL per region).
- **Cold starts**: First request after idle can be slower. To reduce it:
  - **Min instances** (paid): Set `minInstances: 1` for the API function so one instance stays warm. See [Firebase docs](https://firebase.google.com/docs/functions/manage-functions#min_max_instances).
  - **Warm-up ping**: Use a cron (e.g. every 5 minutes) to call `/health` so the function stays warm (less predictable than min instances).
- **Bundle size**: Keep `functions/` dependencies minimal so cold start and deploy stay fast.

### API behind a CDN (advanced)

- Cloud Functions are **not** behind a CDN by default; each request hits the function. To put the API behind a CDN:
  - Use **Cloud Run** instead of (or in front of) Cloud Functions, then put **Cloud CDN** in front of the load balancer.
  - Or use **Firebase App Hosting** (if applicable) and its built-in behavior.
- For many apps, Firebase Hosting CDN for the frontend + a single region for Functions is enough; only consider this if you need very low latency for API globally.

## Summary

| Layer            | CDN / speed behavior                                      |
|-----------------|------------------------------------------------------------|
| Static (Hosting)| ✅ Served from Google CDN; long-lived cache for assets   |
| index.html      | ✅ No-cache so users get latest entrypoint                |
| API (Functions) | ❌ No CDN; one region; optional min instances / warm-up  |
| First API call  | ✅ Preconnect in HTML reduces DNS/TLS time                |
| First JS load   | ✅ Lazy routes + chunk split = smaller initial bundle     |

After deploying (`npm run build` then `firebase deploy --only hosting`), the site should load and feel faster; the main lever for “API feels faster” is preconnect + optional warm instances or multi-region if needed.
