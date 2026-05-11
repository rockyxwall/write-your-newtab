# GEMINI.md - WYNTab

## Project Overview
**WYNTab** is a browser extension that allows users to fully customize their New Tab page by uploading and activating their own HTML templates. It is built using the [WXT (Web Extension Toolbox)](https://wxt.dev/) framework with **React 19**, **TypeScript**, and **Tailwind CSS 4**.

### Core Components
- **New Tab (`src/entrypoints/newtab/`)**: The custom new tab page. It retrieves the active template's HTML from `browser.storage.local` and renders it inside an `iframe` using the `srcDoc` attribute. This avoids `blob:` URL blocks by extension CSP while allowing scripts to run in a sandboxed environment.
- **Dashboard (`src/entrypoints/dashboard/`)**: A React-based interface for managing templates. Users can upload HTML files, preview them (using `blob:` URLs), and set them as the active new tab. It includes **Export/Import** functionality for data portability.
- **Onboarding (`src/entrypoints/onboarding/`)**: A welcome page that opens automatically on installation to guide new users.
- **Background (`src/entrypoints/background.ts`)**: Handles the extension's "action" (icon click) and listens for `onInstalled` events to trigger the onboarding flow.
- **Lib (`src/lib/`)**: Shared utility functions and core logic:
  - `storage.ts`: Strongly-typed storage definitions using `@wxt-dev/storage`. Uses `unlimitedStorage` permission to handle large HTML templates.
  - `templates.ts`: Logic for discovering built-in templates using Vite's `import.meta.glob` and managing template metadata.
  - `sanitize.ts`: Manual `DOMParser`-based sanitization for user-uploaded HTML to remove dangerous tags (`<script>`, `<iframe>`, `<object>`, etc.) and `on*` attributes, ensuring compliance with browser extension security standards.
- **Theme Management**: Uses `public/theme-init.js` to apply the correct theme (dark/light) immediately on page load to prevent "white flash" during React initialization.

### Key Technologies
- **Framework**: [WXT](https://wxt.dev/)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with **lucide-react** for iconography.
- **Storage**: `@wxt-dev/storage` (wraps `browser.storage.local`).

---

## Building and Running

### Development
Start the development server with hot-reloading:
```bash
bun dev
```
For Firefox:
```bash
bun dev:firefox
```

### Production Build
Build the extension for production:
```bash
bun build
```
For Firefox:
```bash
bun build:firefox
```

### Packaging
Create a zip file for distribution:
```bash
bun zip
```

### Type Checking
```bash
bun compile
```

---

## Development Conventions

### Architecture
- **Entrypoints**: WXT entrypoints are located in `src/entrypoints/`.
- **State Management**: React `useState` and `useEffect` for local state; `@wxt-dev/storage` for persistent data.
- **Template Rendering**: 
    - Main New Tab: `iframe` with `srcDoc`.
    - Dashboard Preview: `iframe` with `blob:` URL (scaled down for preview).
- **Built-in Templates**: Any `.html` file added to `src/builtins/` is automatically discovered via `import.meta.glob`.

### Coding Standards
- **TypeScript**: Strict typing for all interfaces.
- **React**: Functional components and Hooks.
- **Safety**: All user-uploaded HTML **must** be passed through `sanitizeHtml` in `src/lib/sanitize.ts` before being stored.
- **Permissions**: The extension requires `storage` and `unlimitedStorage` to persist user templates.

---

## Usage
- **Active Template**: `activeTemplateId` tracks the selected template; `activeTemplateHtml` stores its content for fast retrieval by the New Tab page.
- **Template Library**: Managed via the Dashboard, accessible by clicking the extension icon.
