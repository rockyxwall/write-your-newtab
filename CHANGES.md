# Changelog

## [0.4.2] - 2026-05-11
### Added
- **Component Extraction**: Refactored the Dashboard by extracting `TemplateCard` into a dedicated, reusable component in `src/components/`, improving code maintainability.
- **Enhanced Onboarding Icons**: Updated feature cards in the onboarding flow with more descriptive icons (`Library`, `Code2`) and added interactive hover animations.
### Changed
- **Hybrid Rounding Strategy**: Introduced a contextual rounding approach—using "sharp" `rounded-sm` corners for technical tools (Live Editor) to emphasize precision, while maintaining "soft" `rounded-2xl` curves for general UI elements for brand friendliness.
- **Dashboard Refinement**: Simplified the sidebar by removing the redundant "New Template" button and consolidated card rendering into the `TemplateCard` component. Also relocated the version indicator to follow the brand name ("WYNTab vX.X.X") for better brand association and a cleaner layout.

## [0.4.1] - 2026-05-11
### Changed
- **UI Refinement**: Standardized corner roundness to `rounded-2xl` (16px) across all Dashboard cards, modals, and sidebar elements for a more balanced professional aesthetic.
- **CSP Compatibility Fix**: Removed inline scripts from all built-in templates to ensure full compatibility with strict browser extension Content Security Policies (MV3).
- **Template Stability**: Templates like Matrix and Pomodoro now use static placeholders, preventing script-block errors on the New Tab page.
- **Premium Card Design**: Overhauled the template gallery cards with a new high-polish aesthetic featuring external corner glow accents, refined typography, and data-driven metadata layouts.
- **Brand Consistency**: Replaced the generic Sparkles icon with the official extension icon across the Dashboard and Onboarding screens.
- **Builtin Expansion**: Added 3 new high-quality, purely static (HTML/CSS) templates:
    - **Links**: A modern bento-style grid for your favorite shortcuts.
    - **Minimal**: A clean, typography-focused layout with subtle background patterns.
    - **Atmosphere**: A tranquil, animated CSS gradient background for a calm start.
- **Builtin Cleanup**: Moved interactive templates (Matrix, Bento, Pomodoro, Zen, Kanban, Focus) to `temp/builtins/` until the Widget API is implemented. Only purely static templates remain active in the gallery.
- **Minor Text Fix**: Updated the New Tab empty state message to "pick a builtin" for better clarity.
- **Preview Refinement**: Removed scrollbars and disabled all interactivity in template previews (cards and modal) to ensure a consistent, non-distracting visual experience.
- **Onboarding Polish**: Updated logo and card styles to match the new design standards.

## [0.4.0] - 2026-05-11
### Phase 3: Visual Polish & Built-in Expansion
### Added
- **Major Dashboard Redesign**: Implemented a professional Sidebar + Content layout with glassmorphism effects and modern typography (Inter-style).
- **Tabbed Navigation**: Separate views for "Built-in Gallery", "Your Uploads", and "Settings" for better organization.
- **Large Preview Modal**: Added a dedicated preview modal to visualize templates in high resolution before activation.
- **5 New Built-in Templates**:
    - **Matrix**: Classic hacker-style falling characters with a digital clock.
    - **Bento Grid**: Modern Apple-style bento layout with shortcuts and weather placeholders.
    - **Pomodoro**: Functional productivity timer with mode-switching and dynamic themes.
    - **Zen**: Minimalist atmosphere with a pulse animation and tranquil messaging.
    - **Kanban Lite**: Lightweight task board with local persistence in the sandbox.
- **Animated Transitions**: Added smooth fade and slide animations for all UI interactions.

## [0.3.9] - 2026-05-11
### Changed
- **Unified Actions Dropdown**: Consolidated Upload, Import, and Export buttons into a single "Manage" dropdown menu for a cleaner header UI.
- **Improved UX**: Added click-outside behavior to automatically close the management menu.
- **UI Polish**: Updated header layout with Lucide icons (Plus, ChevronDown) for better visual hierarchy.

## [0.3.8] - Phase 2: Enhanced User Experience
### Added
- **Integrated Code Editor**: Built-in CodeMirror 6 editor in the Dashboard for direct HTML/CSS modification.
- **Live Preview**: Real-time preview panel while editing template source code.
- **Template Renaming**: Ability to rename custom templates directly from the Dashboard.
- **Template Duplication**: Clone any template (including built-ins) to use as a starting point.
### Fixed
- Versioning display in Dashboard footer.

## [0.3.4] - Phase 1: Core Stability & Data Safety
### Added
- **Data Portability**: Full Export and Import functionality for custom templates and settings via JSON files.
- **Onboarding Flow**: Automated welcome page for first-time installers.
- **Template Guide**: Documentation for users on how to create compliant HTML templates.
- **Sanitization Engine**: Manual DOM-based sanitization for user uploads to ensure security compliance.
