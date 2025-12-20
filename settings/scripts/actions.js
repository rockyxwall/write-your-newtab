/**
 * File Actions Module
 * Handles export, import, and save operations
 */

export class ActionsManager {
  constructor(storage, editors, saveBtn, exportBtn, importBtn, fileInput) {
    this.storage = storage;
    this.editors = {
      html: editors.html,
      css: editors.css,
      js: editors.js
    };
    this.saveBtn = saveBtn;
    this.exportBtn = exportBtn;
    this.importBtn = importBtn;
    this.fileInput = fileInput;
    this.init();
  }

  /**
   * Initialize action handlers
   */
  init() {
    this.saveBtn.addEventListener('click', () => this.save());
    this.exportBtn.addEventListener('click', () => this.export());
    this.importBtn.addEventListener('click', () => this.fileInput.click());
    this.fileInput.addEventListener('change', (e) => this.import(e));
  }

  /**
   * Save current code to storage
   */
  async save() {
    try {
      await this.storage.set({
        html: this.editors.html.value,
        css: this.editors.css.value,
        js: this.editors.js.value
      });

      // Visual feedback
      const originalText = this.saveBtn.innerText;
      this.saveBtn.innerText = "Saved!";
      this.saveBtn.classList.add('btn-success');

      setTimeout(() => {
        this.saveBtn.innerText = originalText;
        this.saveBtn.classList.remove('btn-success');
      }, 1500);
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save code');
    }
  }

  /**
   * Export code as JSON file
   */
  export() {
    try {
      const data = {
        html: this.editors.html.value,
        css: this.editors.css.value,
        js: this.editors.js.value,
        exportedAt: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `newtab-backup-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export code');
    }
  }

  /**
   * Import code from JSON file
   * @param {Event} event - File input change event
   */
  import(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        this.editors.html.value = data.html || "";
        this.editors.css.value = data.css || "";
        this.editors.js.value = data.js || "";

        // Trigger preview update
        this.editors.html.dispatchEvent(new Event('input', { bubbles: true }));
      } catch (err) {
        console.error('Import failed:', err);
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }
}

