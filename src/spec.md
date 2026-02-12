# Specification

## Summary
**Goal:** Remove the production `createActor` console warning and update the Navbar so the menu icon is visible and usable on desktop.

**Planned changes:**
- Adjust the frontend actor creation flow to ensure only one of `agent` or `agentOptions` is passed to `createActor`, including the authenticated identity path in `frontend/src/hooks/useActor.ts`.
- Update the global Navbar header so a hamburger/menu icon appears on desktop at the top-right and opens the existing right-side navigation sheet (matching current mobile behavior).

**User-visible outcome:** The app no longer logs the `createActor` agent/agentOptions warning in production, and desktop users can open the same right-side navigation menu via a top-right menu icon (with mobile behavior unchanged).
