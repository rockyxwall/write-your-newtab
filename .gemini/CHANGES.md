# Changelog

## [0.4.0] - 2026-05-11
### Added
- **Major Dashboard Redesign**: Implemented a professional Sidebar + Content layout with glassmorphism effects and modern typography.
- **Custom Library Workflow**: Introduced a comprehensive management hub (formerly "Your Uploads") supporting both file uploads and a new "Create Live" feature for direct in-browser development.
- **Integrated Code Editor**: Built-in CodeMirror 6 editor in the Dashboard with real-time preview and draft-based saving for new templates.
- **Large Preview Modal**: Added a high-resolution visualization mode for templates before activation.
- **Componentized Architecture**: Extracted `TemplateCard` and other core UI elements into modular components for improved maintainability.
- **Icon Generation Suite**: Added `scripts/generate_brand_icons.ps1` to automatically transform master assets into the official black brand aesthetic across all required sizes.
- **Dynamic Brand Visibility**: Implemented theme-aware icon contrast in the Dashboard and Onboarding screens to ensure the black brand glyph remains visible on both light and dark primary backgrounds.
- **Expanded Built-in Gallery**: Added 8 high-quality, purely static (HTML/CSS) templates including Links, Minimal, Atmosphere, and static versions of Matrix, Bento, Pomodoro, Zen, and Kanban.
- **Data Portability**: Full Export and Import functionality for custom templates and settings via JSON backups.
- **Onboarding Flow**: Automated welcome page and interactive guide for first-time installers.
- **Template Management**: Added support for duplicating, renaming, and deleting custom templates.

### Changed
- **Hybrid Rounding Strategy**: Contextual corner language—sharp `rounded-sm` for technical tools (Editor) and soft `rounded-2xl` for consumer UI (Cards, Modals).
- **UI Refinement**: Standardized a high-polish professional aesthetic with glassmorphism, animated transitions, and data-driven metadata layouts.
- **CSP & Security**: Purged all inline scripts from built-in templates and implemented a robust `sanitizeHtml` engine for all user content to ensure full MV3 compliance.
- **Onboarding Polish**: Overhauled the first-run experience with brand-consistent iconography and dark-theme optimization.
- **Brand Consistency**: Consolidated the "WYNTab" brand identity across the browser UI and extension pages using the official black-glyph icon.
- **Navigation**: Tabbed views for "Built-in Gallery", "Custom Library", and "Settings" for better organization.
