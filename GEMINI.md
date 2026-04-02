# GEMINI.md - WYNTab (Write Your New Tab)

## Project Overview
**WYNTab** is a browser extension that allows users to fully customize their New Tab page by uploading and activating their own HTML templates. It is built using the [WXT (Web Extension Toolbox)](https://wxt.dev/) framework with **React 19** and **TypeScript**.

### Core Components
- **New Tab (`src/entrypoints/newtab/`)**: The custom new tab page. it retrieves stored HTML from `browser.storage.local` and injects it into the DOM. It also handles re-executing `<script>` tags found within the injected HTML.
- **Dashboard (`src/entrypoints/dashboard/`)**: A React-based interface for managing templates. Users can upload HTML files, preview them, and set them as the active new tab.
- **Background (`src/entrypoints/background.ts`)**: Handles the extension's "action" (icon click) to open or focus the Dashboard page.
- **Content Script (`src/entrypoints/content.ts`)**: A placeholder content script that currently runs on all matches.

### Key Technologies
- **Framework**: [WXT](https://wxt.dev/)
- **UI Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Storage**: `browser.storage.local` is used to persist HTML templates and settings.

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
- **State Management**: React `useState` and `useEffect` are used for local component state, while `browser.storage.local` handles persistent data across the extension.
- **Styling**: Standard CSS is used (e.g., `src/entrypoints/dashboard/style.css`).

### Coding Standards
- **TypeScript**: Strictly typed interfaces should be defined for storage and state (e.g., `WxtStorage`).
- **React**: Functional components and Hooks are preferred.
- **Safety**: Injected HTML uses `dangerouslySetInnerHTML`, which is intentional for this extension's purpose but requires careful handling of scripts (managed in `main.tsx`).

---

## Usage
- **Active Template**: The `activeTemplateHtml` key in local storage holds the HTML currently rendered in the New Tab.
- **Template Library**: (Planned) Multiple templates can be stored and swapped via the Dashboard.
