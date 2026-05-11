## Overview
This release introduces a major dashboard redesign, an integrated code editor for live
template creation, and strict MV3 security compliance.
 ## Changes

**UI & Navigation**
* Implemented a new Sidebar + Content dashboard layout with tabbed navigation.
* Added an automated onboarding flow for new installations.
* Refactored core UI elements into modular components.
* Updated brand identity to a black-glyph icon with theme-aware contrast.
* Added a script for automated brand icon generation.
   12
**Template Management & Editor**
* Integrated a CodeMirror 6 editor with real-time previews for custom templates.
* Added template management features: duplicate, rename, and delete.
* Introduced a large, high-resolution preview modal.
* Added 8 new static templates to the built-in gallery.
* Added JSON export and import functionality for custom templates.

**Security**
* Implemented a strict `sanitizeHtml` engine for all user-uploaded content.
* Purged inline scripts from built-in templates to ensure full MV3 CSP compliance.