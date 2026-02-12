# Specification

## Summary
**Goal:** Fix the production blank white page by ensuring the correct production entry loads and restore valid PWA icon assets so the manifest has no icon errors.

**Planned changes:**
- Correct the production startup/loading path so the deployed app does not attempt to import the dev-only entry `/src/main.tsx`, and the React app reliably mounts on the live URL.
- Add a visible in-`#root` error screen/fallback if the JS bundle fails to load, avoiding a silent blank page.
- Ensure all manifest and index-referenced icon files exist under `frontend/public/assets/generated/` and are valid PNGs served successfully.
- Update `frontend/index.html` PWA meta tags to include `<meta name="mobile-web-app-capable" content="yes">` while retaining Apple-specific tags as needed.

**User-visible outcome:** Opening the live URL renders the app UI (or a clear error screen if loading fails), and the browser manifest/application view shows no PWA icon download/validation errors or related deprecation warnings.
