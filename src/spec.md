# Specification

## Summary
**Goal:** Show a mobile-number entry gate on first load, persist the number as the user’s phone/username when possible, fix the menu overlay behavior, and apply an orange/pink background across the app.

**Planned changes:**
- Add an initial mobile-number entry screen (input + Continue/Skip) that appears on fresh sessions and blocks access to the main app and menu until a choice is made.
- Remember the Continue/Skip choice for the current session so the entry screen doesn’t reappear during navigation in that session.
- On Continue, persist the entered mobile number and save it into the user profile phone number field (DatingProfile.phoneNumber); if the user/profile isn’t ready yet, store locally and apply automatically once profile saving is possible.
- On Skip, do not save or overwrite any phone number.
- Ensure the main app experience after Continue/Skip is unchanged (same pages/content and existing menu button/navigation).
- Fix/remove any persistent click-blocking/blur overlay so the menu overlay/backdrop exists only while the menu is open and is fully removed/disabled when closed.
- Apply a consistent orange-and-pink background theme across all pages, including the initial mobile-number screen and existing main pages.

**User-visible outcome:** On first visit in a session, users must enter a mobile number or skip before seeing the app; after that they see the same app as before with a working menu (no stuck overlay), and all pages use an orange/pink background.
