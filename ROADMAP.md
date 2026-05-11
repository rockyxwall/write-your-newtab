# WYNTab Roadmap

This roadmap outlines the planned features and improvements for WYNTab, ranked by priority and user impact.

## Phase 1: Core Stability & Data Safety (P0 - Completed ✅) v0.3.4
*   **[x] Data Portability (Export/Import):** Users can now export their custom templates and settings to a JSON file and import them back.
*   **[x] Onboarding Experience:** A "Welcome" page now opens automatically upon installation to guide users.
*   **[x] Project Documentation:** Created `docs/TEMPLATE_GUIDE.md` explaining HTML/CSS limitations and template creation.

## Phase 2: Enhanced User Experience (P1 - Completed ✅) v0.3.8
*   **[x] Integrated Code Editor:** Added a built-in CodeMirror editor to the Dashboard with live previews.
*   **[x] Template Management Improvements:** 
    *   **Rename:** Users can now rename custom templates.
    *   **Duplicate:** Users can clone any template (including built-ins).
*   **[x] Versioning:** Extension version is now visible in the Dashboard footer.


## Phase 3: Professional Standards & Reach (P2) v0.4.0
*   **[ ] Internationalization (i18n):** Move all hardcoded strings to `_locales/` to support multiple languages.
*   **[ ] Remote Template Gallery:** Create a curated online gallery where users can browse, preview, and install community-made templates with a single click.
*   **[ ] Widget API (Safe Scripts):** Introduce a way to add dynamic content (Clock, Weather, RSS) via safe, pre-vetted components that don't violate Chrome Web Store CSP policies.

## Phase 4: Polish & Performance (P3) v0.4.5
*   **[ ] Keyboard Shortcuts:** Add hotkeys for common Dashboard actions (Upload, Toggle Theme, Save).
*   **[ ] Performance Audit:** Optimize the storage and retrieval of very large HTML templates to ensure instant New Tab loading.
*   **[ ] Mobile Preview:** Add a toggle in the Dashboard to preview how templates look on different screen sizes.
