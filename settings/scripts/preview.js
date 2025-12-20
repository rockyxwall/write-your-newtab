/**
 * Preview Generation Module
 * Handles live preview updates with error handling
 */

export class PreviewManager {
  constructor(htmlInput, cssInput, jsInput, previewFrame) {
    this.htmlInput = htmlInput;
    this.cssInput = cssInput;
    this.jsInput = jsInput;
    this.previewFrame = previewFrame;
    this.updateTimeout = null;
  }

  /**
   * Queue a preview update with debouncing
   * @param {number} delay - Debounce delay in milliseconds
   */
  queueUpdate(delay = 400) {
    clearTimeout(this.updateTimeout);
    this.updateTimeout = setTimeout(() => this.update(), delay);
  }

  /**
   * Generate and inject preview HTML
   */
  update() {
    try {
      const html = this.htmlInput.value;
      const css = this.cssInput.value;
      const js = this.jsInput.value;

      const combinedSource = this.generateDocument(html, css, js);
      this.previewFrame.srcdoc = combinedSource;
    } catch (err) {
      console.error('Preview update failed:', err);
      this.showError(err.message);
    }
  }

  /**
   * Generate the complete HTML document
   * @param {string} html - User HTML
   * @param {string} css - User CSS
   * @param {string} js - User JavaScript
   * @returns {string}
   */
  generateDocument(html, css, js) {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${css}</style>
</head>
<body>
  ${html}
  <script>
    (function() {
      try {
        ${js}
      } catch (err) {
        console.error('Script execution error:', err);
        document.body.innerHTML += '<div style="color: red; padding: 10px; font-family: monospace;">Error: ' + err.message + '</div>';
      }
    })();
  <\/script>
</body>
</html>`;
  }

  /**
   * Display error in preview
   * @param {string} message - Error message
   */
  showError(message) {
    const errorHtml = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { background: #1e1e1e; color: #f48771; padding: 20px; font-family: monospace; }
  </style>
</head>
<body>
  <strong>Error:</strong> ${message}
</body>
</html>`;
    this.previewFrame.srcdoc = errorHtml;
  }
}

