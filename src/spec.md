# Specification

## Summary
**Goal:** Improve the app’s swipe-to-match-to-chat flow and refresh UI styling while fixing mobile overlap issues and adding a transparent, full-viewport menu overlay.

**Planned changes:**
- Update the side menu (Sheet) to render a full-viewport transparent overlay (non-darkening) that blocks interaction with the page, including the menu icon area, and closes the menu on tap/click.
- Fix mobile responsive layout so Home content (including Like/Pass controls) is not overlapped by any header/footer/navigation on common mobile breakpoints, without introducing horizontal scrolling.
- Make swipe cards functional end-to-end by ensuring each discover card carries a real backend Principal identifier; wire Like/Pass to call likeProfile/rejectProfile for the current card and advance on success, excluding the caller’s own profile and showing user-visible errors on failure.
- Add a real match screen/modal shown immediately on mutual match with actions to start chat with the matched user or continue swiping without resetting the deck position.
- Implement/restore backend-backed Matches fetching so the Matches page lists real matches (with principals) and selecting a match opens Chat with correct identity and messages load.
- Fix backend match/chat identity by using a deterministic, collision-resistant match/chat ID derived from both principals (order-independent) and apply it consistently across matchStore/chatStore/signalingStore, including correct unmatch behavior.
- Apply a cohesive “Tinder-like UI style 2” refresh across Home (cards), Matches (list items), and Chat (header/bubbles) using consistent light-theme colors, spacing, typography, and animations, keeping all user-facing text in English.

**User-visible outcome:** The user can swipe through profiles and Like/Pass reliably; mutual likes show an “It’s a match” screen with a direct path to chat; Matches lists real matched users and opens the correct chat; the menu opens with a transparent full-page overlay that closes on tap; and mobile Home no longer has overlapping UI.
