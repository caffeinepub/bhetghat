# Specification

## Summary
**Goal:** Fix the deployment/build “System configuration error” by validating build inputs across frontend static assets/PWA references, service worker caching, and backend Motoko compilation so the app builds and deploys successfully.

**Planned changes:**
- Diagnose and correct the root cause of the build/deploy failure affecting frontend asset resolution and/or backend canister compilation.
- Ensure all PWA/HTML referenced static files (manifest + icons) exist under `frontend/public` and are correctly referenced so they are included in build output and serve with HTTP 200.
- Update `frontend/public/sw.js` to avoid pre-caching non-public/source paths (e.g., `/src/*.tsx`), and harden install/offline behavior to prevent unhandled failures when assets are missing or paths differ between dev and production.

**User-visible outcome:** Deployment completes without “System configuration error”; the frontend loads and mounts after deploy, the backend compiles successfully, the manifest/icons are served correctly, and offline navigation provides a functional fallback instead of a blank screen.
