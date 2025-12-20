/**
 * Options Management Module
 * -------------------------
 * Responsible for:
 *  - Loading and saving editor options (auto-save + preview delay)
 *  - Wiring up the controls in the Options tab
 *  - Clearing stored HTML/CSS/JS data
 */

export class OptionsManager {
  /**
   * @param {import('./storage.js').StorageManager} storage - Storage handler
   * @param {HTMLInputElement|null} autoSaveCheckbox - "Auto-save" checkbox
   * @param {HTMLInputElement|null} previewDelayInput - Preview delay number input
   * @param {HTMLButtonElement|null} clearBtn - "Clear All Data" button
   * @param {HTMLTextAreaElement} htmlInput - HTML editor
   * @param {HTMLTextAreaElement} cssInput - CSS editor
   * @param {HTMLTextAreaElement} jsInput - JS editor
   * @param {import('./preview.js').PreviewManager} preview - Preview manager (to re-render after clear)
   */
  constructor(
    storage,
    autoSaveCheckbox,
    previewDelayInput,
    clearBtn,
    htmlInput,
    cssInput,
    jsInput,
    preview
  ) {
    this.storage = storage;
    this.autoSaveCheckbox = autoSaveCheckbox;
    this.previewDelayInput = previewDelayInput;
    this.clearBtn = clearBtn;
    this.htmlInput = htmlInput;
    this.cssInput = cssInput;
    this.jsInput = jsInput;
    this.preview = preview;

    // Internal option state
    this._autoSaveEnabled = false;
    this._previewDelay = 400;

    this.initListeners();
  }

  /**
   * Expose current auto-save setting
   */
  get autoSaveEnabled() {
    return this._autoSaveEnabled;
  }

  /**
   * Expose current preview delay in ms
   */
  get previewDelay() {
    return this._previewDelay;
  }

  /**
   * Load options values from storage and update UI.
   */
  async loadOptions() {
    try {
      const data = await this.storage.get(['autoSave', 'previewDelay']);
      this._autoSaveEnabled = data.autoSave === 'true' || data.autoSave === true;
      this._previewDelay = Number(data.previewDelay) || 400;

      if (this.autoSaveCheckbox) {
        this.autoSaveCheckbox.checked = this._autoSaveEnabled;
      }
      if (this.previewDelayInput) {
        this.previewDelayInput.value = this._previewDelay;
      }
    } catch (err) {
      console.warn('Failed to load options from storage:', err);
    }
  }

  /**
   * Set up event listeners for the Options tab controls.
   */
  initListeners() {
    if (this.autoSaveCheckbox) {
      this.autoSaveCheckbox.addEventListener('change', async () => {
        this._autoSaveEnabled = this.autoSaveCheckbox.checked;
        try {
          await this.storage.set({ autoSave: this._autoSaveEnabled });
        } catch (err) {
          console.warn('Failed to save autoSave option:', err);
        }
      });
    }

    if (this.previewDelayInput) {
      this.previewDelayInput.addEventListener('change', async () => {
        const value = Number(this.previewDelayInput.value);
        const clamped = Math.min(2000, Math.max(100, value || 400));
        this._previewDelay = clamped;
        this.previewDelayInput.value = clamped;
        try {
          await this.storage.set({ previewDelay: clamped });
        } catch (err) {
          console.warn('Failed to save previewDelay option:', err);
        }
      });
    }

    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', async () => {
        if (!confirm('Are you sure? This will permanently delete all saved code.')) {
          return;
        }
        try {
          await this.storage.clear();
          this.htmlInput.value = '';
          this.cssInput.value = '';
          this.jsInput.value = '';
          this.preview.update();
          alert('All data cleared');
        } catch (err) {
          console.error('Failed to clear storage:', err);
          alert('Failed to clear data');
        }
      });
    }
  }
}


