<div align="center">

<a href="https://github.com/rockyxwall/write-your-newtab">
    <img src="./public/icon/128.png" alt="WYNTab logo" height="128px" width="128px" />
</a>

# Write Your New Tab

</div>

<div align="center">

A fully customizable browser extension that lets you write and activate your own New Tab page.

[![Framework: WXT](https://img.shields.io/badge/framework-WXT-blue.svg?labelColor=27303D)](https://wxt.dev/)
[![Library: React 19](https://img.shields.io/badge/library-React_19-61DAFB.svg?labelColor=27303D&logo=react)](https://react.dev/)
[![Styling: Tailwind CSS 4](https://img.shields.io/badge/styling-Tailwind_CSS_4-38B2AC.svg?labelColor=27303D&logo=tailwind-css)](https://tailwindcss.com/)

<!-- <img src="./.github/readme-images/screens.gif" alt="WYNTab screenshots" /> -->

## Overview

**WYNTab** is a browser extension built with the [WXT](https://wxt.dev/) framework that allows users to fully customize their New Tab experience. Instead of being stuck with a static or limited New Tab page, you can upload your own HTML, CSS, and JavaScript templates to create a personalized dashboard, a minimalist clock, or anything you can imagine.

## Features

<div align="left">

<details open="">
    <summary><h3>Core Functionality</h3></summary>

- [x] **Built-in Templates**: Comes with pre-configured templates like "Focus" and "Terminal".
- [x] **Sandboxed Rendering**: Templates are rendered inside a sandboxed `iframe` using `srcDoc` for security.
- [ ] **Custom HTML Templates**: Ability to upload and manage your own HTML files.
- [ ] **Automatic Sanitization**: Security layer to strip dangerous elements (scripts, nested iframes) from user uploads.
- [ ] **Live Previews**: Preview templates in the dashboard before activating them.
- [ ] **Template Editor**: A built-in code editor to tweak templates directly in the browser.

</details>

</div>

## Getting Started

### Prerequisites
[Bun](https://bun.sh/) (Recommended) or Node.js

### Development
Start the development server with hot-reloading:
```bash
bun dev
```

### Production Build
Build the extension for production:
```bash
bun build
```

### Packaging
Create a zip file for distribution:
```bash
bun zip
```

---

<div align="center">
Made with ❤️ for a better New Tab experience.
</div>

</div>
