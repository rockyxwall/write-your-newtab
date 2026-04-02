# GEMINI.md - WYNTab (Write Your New Tab)

## Project Overview
**WYNTab** is a browser extension that allows users to fully customize their New Tab page by uploading and activating their own HTML templates. It is built using the [WXT (Web Extension Toolbox)](https://wxt.dev/) framework with **React 19**, **TypeScript**, and **Tailwind CSS 4**.

### Core Components
- **New Tab (`src/entrypoints/newtab/`)**: The custom new tab page. It retrieves the active template's HTML from `browser.storage.local` and renders it inside an `iframe` using a **Blob URL**. This approach allows the custom HTML's scripts to execute naturally within a sandboxed environment.
- **Dashboard (`src/entrypoints/dashboard/`)**: A React-based interface for managing templates. Users can upload HTML files, preview them, and set them as the active new tab. It uses **shadcn/ui** and **Lucide Icons** for a modern interface.
- **Background (`src/entrypoints/background.ts`)**: Handles the extension's "action" (icon click) to open or focus the Dashboard page.
- **Lib (`src/lib/`)**: Shared utility functions and core logic:
  - `storage.ts`: Strongly-typed storage definitions using `@wxt-dev/storage`.
  - `templates.ts`: Logic for discovering built-in templates and managing template metadata.
  - `sanitize.ts`: Manual `DOMParser`-based sanitization for user-uploaded HTML to ensure compliance with browser extension security standards.

### Key Technologies
- **Framework**: [WXT](https://wxt.dev/)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with **shadcn/ui**.
- **Storage**: `@wxt-dev/storage` (wraps `browser.storage.local`) for persisting templates and settings.

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
- **State Management**: React `useState` and `useEffect` are used for local component state. Persistent data is handled by `@wxt-dev/storage` keys defined in `src/lib/storage.ts`.
- **Styling**: Tailwind CSS 4 is the primary styling solution. Shared UI components are located in `src/components/ui/`.
- **Built-in Templates**: Any `.html` file added to `src/builtins/` is automatically discovered and made available in the Dashboard using Vite's `import.meta.glob`.

### Coding Standards
- **TypeScript**: Strictly typed interfaces for storage and templates (see `src/lib/storage.ts` and `src/lib/templates.ts`).
- **React**: Functional components and Hooks are required.
- **Safety**: User-uploaded HTML is sanitized in `src/lib/sanitize.ts` before storage to remove `<script>`, `<iframe>`, and `on*` attributes, as required for Chrome Web Store safety.

---

## Usage
- **Active Template**: `activeTemplateId` and `activeTemplateHtml` in local storage track the current selection.
- **Template Library**: Users can manage a library of templates, including built-ins and custom uploads, via the Dashboard.
