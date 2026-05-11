# WYNTab Template Guide

WYNTab allows you to use your own HTML and CSS as your browser's New Tab page. This guide explains how to build compatible templates and what limitations apply.

## How it Works
When you upload an HTML file, WYNTab:
1.  **Sanitizes** the HTML to remove dangerous elements (for security).
2.  **Stores** the HTML in your browser's local storage.
3.  **Renders** the HTML inside a sandboxed `iframe` using `srcDoc`.

## Security & Sanitization
To comply with browser extension security policies and protect your data, WYNTab automatically removes the following from uploaded files:
*   `<script>` tags (JavaScript is not allowed in uploaded templates).
*   `<iframe>`, `<object>`, `<embed>`, and `<base>` tags.
*   Inline event handlers (e.g., `onclick`, `onmouseover`).
*   `javascript:` links in `href` or `src` attributes.

**Note:** If you want dynamic content (like a clock), use the built-in templates or wait for our upcoming Widget API.

## Building Your Template

### HTML Structure
You should provide a complete HTML document or a fragment. If you provide a fragment, WYNTab will wrap it in standard `<html>` and `<body>` tags.

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            background: #111;
            color: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            font-family: sans-serif;
        }
        h1 { font-weight: 900; letter-spacing: -2px; }
    </style>
</head>
<body>
    <h1>HELLO WORLD</h1>
</body>
</html>
```

### CSS Guidelines
*   **Viewport:** Use `100vh` and `100vw` for full-page layouts.
*   **Fonts:** You can use standard system fonts or link to external fonts (e.g., Google Fonts) as long as the Content Security Policy (CSP) allows it.
*   **Images:** Use absolute URLs for images (e.g., `https://example.com/image.png`). Local file paths will not work.

### Best Practices
1.  **Mobile Friendly:** Even though it's a "New Tab" page, remember that you might resize your browser window. Use flexible layouts.
2.  **Dark Mode:** Consider using CSS media queries (`@media (prefers-color-scheme: dark)`) to support browser-level dark mode settings.
3.  **Minimalism:** Keep it fast! Large images or complex CSS can slow down the "New Tab" experience.
