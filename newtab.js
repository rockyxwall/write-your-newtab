/**
 * newtab.js — The Rendering Engine
 *
 * WHAT DOES THIS FILE DO?
 * Every time you open a new tab, this script runs.
 * Its job is simple:
 *   1. Ask Chrome storage: "What HTML should I show?"
 *   2. Take that HTML string and put it on the page.
 *
 * That's it. This file is intentionally tiny and focused.
 * All the complex logic (uploading, sanitizing, managing templates)
 * lives in dashboard.js.
 */

/**
 * STORAGE KEY CONSTANTS
 * Instead of typing the string "activeTemplateHtml" everywhere
 * (which is error-prone — one typo and nothing works), we store it
 * in a constant. If we ever need to rename it, we change it once here.
 */
const STORAGE_KEY_ACTIVE_HTML = "activeTemplateHtml";

/**
 * renderActiveTemplate()
 *
 * This function asks Chrome for the saved HTML and renders it.
 *
 * WHAT IS chrome.storage.local?
 * It's like a mini-database built into Chrome, specifically for your extension.
 * It stores data as key-value pairs, similar to a dictionary:
 *   { "activeTemplateHtml": "<html>...</html>" }
 *
 * WHY NOT USE localStorage?
 * localStorage is per-website. chrome.storage.local belongs to the extension
 * itself and is shared across all extension pages (newtab.html, dashboard.html).
 * This means when the dashboard saves a template, newtab.html can read it.
 *
 * WHAT IS A CALLBACK FUNCTION?
 * chrome.storage.local.get() is "asynchronous" — it doesn't return data
 * immediately (it has to fetch from disk). Instead, you give it a callback:
 * a function that Chrome will call once the data is ready.
 * Think of it like ordering food: you give them your number (callback),
 * and they call you when the food is ready.
 */
function renderActiveTemplate() {

  // Ask storage for the value stored under our key
  chrome.storage.local.get([STORAGE_KEY_ACTIVE_HTML], function (result) {

    /*
      result is an object like: { activeTemplateHtml: "<html>...</html>" }
      We use bracket notation result[STORAGE_KEY_ACTIVE_HTML] to get the value.
      If nothing has been saved yet, this will be `undefined`.
    */
    const savedHtml = result[STORAGE_KEY_ACTIVE_HTML];

    // Find our container div in the page
    const appContainer = document.getElementById("app");

    if (savedHtml) {
      /*
        INJECT THE HTML
        innerHTML = "set the inside of this element to this HTML string"
        This is like pasting the user's entire HTML file inside the #app div.

        IS THIS SAFE?
        Yes — but ONLY because we sanitized the HTML in dashboard.js before
        saving it. We stripped all <script> tags and event handlers (onclick, etc.)
        so there's nothing dangerous left to inject.
      */
      appContainer.innerHTML = savedHtml;

      /*
        EXECUTE SCRIPTS INSIDE THE INJECTED HTML
        There's a subtle problem: when you set innerHTML, any <script> tags
        in that HTML are NOT executed by the browser automatically.
        (This is a browser security feature.)

        To fix this, we find every <script> tag in the injected content,
        create a brand new <script> element, copy the code into it,
        and add it to the page. New <script> elements DO execute.

        NOTE: Our sanitizer removes <script> tags from user-uploaded files.
        But the default templates we wrote ourselves ARE safe, so we allow
        them to run here.
      */
      const injectedScripts = appContainer.querySelectorAll("script");

      injectedScripts.forEach(function (oldScript) {
        const newScript = document.createElement("script");
        newScript.textContent = oldScript.textContent;
        document.body.appendChild(newScript);
        // Remove the old non-executing script tag
        oldScript.remove();
      });

    } else {
      /*
        NO TEMPLATE SAVED YET
        This happens on first install before the user has visited the dashboard.
        Show a friendly welcome message.
      */
      appContainer.innerHTML = `
        <style>
          body { background: #1a1a1a; }
          .welcome {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            font-family: system-ui, sans-serif;
            color: #888;
            text-align: center;
            gap: 1rem;
          }
          .welcome h1 { color: #ccc; font-size: 1.5rem; font-weight: 300; }
          .welcome p { font-size: 0.9rem; opacity: 0.6; }
        </style>
        <div class="welcome">
          <h1>TabCraft is installed! 🎉</h1>
          <p>Click the extension icon to open the dashboard and choose a template.</p>
        </div>
      `;
    }

  }); // End of chrome.storage.local.get callback

} // End of renderActiveTemplate()


// ─────────────────────────────────────────────────────────────────────────────
// RUN IT
// Call the function as soon as this script loads.
// Since newtab.html uses `defer`, the #app div already exists at this point.
// ─────────────────────────────────────────────────────────────────────────────
renderActiveTemplate();
