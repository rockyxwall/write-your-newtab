# Changelog

All notable changes to this project will be documented in this file.

## [0.2.1] - 2026-05-04

### Added
- **Extension Assets:** Added new high-resolution extension icons (16, 32, 48, 128px) and a full set of favicons.
- **License:** Added Apache 2.0 license to the project.
- **Project Renaming:** Renamed the project to **WYNTab** (Write Your NewTab).
- **Core Functionality:** Implemented custom HTML template rendering for the New Tab page via a sandboxed `iframe` using Blob URLs.
- **Dashboard UI:** Initialized a modern React-based Dashboard with Tailwind CSS 4 theme support for template management.
- **Robustness:** Added manual HTML sanitization for user uploads and enhanced storage handling with `unlimitedStorage` permissions.
- **Documentation:** Added `GEMINI.md` for technical guidance and updated `README.md` with a clean, professional design inspired by MAL-Sync.
- **Initial Structure:** Initial implementation of core WXT-based extension structure.

### Changed
- **UI Refactor:** Significantly simplified the UI by removing `shadcn/ui`, `radix-ui`, and `class-variance-authority` dependencies in favor of pure Tailwind CSS implementations.
- **README Polish:** Reorganized `README.md` to feature core capabilities, built-in templates, and a direct Chrome Web Store download link.
- **Background Logic:** Refined the background script to more reliably focus an existing dashboard tab or open a new one, improving behavior for Chrome Web Store installations.

### Fixed
- **Extension Action Bug:** Fixed an issue where clicking the extension icon failed to open the dashboard in Manifest V3 environments.
- **Build & Zip:** Corrected the build and packaging process to ensure successful `.zip` creation for distribution.
- **License Badge:** Fixed broken license and status badges in the README.

## [0.2.0] - 2026-04-19
- Initial release with basic project structure and name/logo.
