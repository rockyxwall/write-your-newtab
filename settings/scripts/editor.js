/**
 * Main Editor Module
 * Orchestrates all editor functionality
 */

import { StorageManager } from './storage.js';
import { TabManager } from './tabs.js';
import { PreviewManager } from './preview.js';
import { ActionsManager } from './actions.js';
import { ResizerManager } from './resizer.js';

/**
 * Main Editor Module
 * Orchestrates all editor functionality
 */
class NewTabEditor {
  constructor() {
    // DOM Elements: core editors + preview frame
    this.htmlInput = /** @type {HTMLTextAreaElement} */ (document.getElementById('html-editor'));
    this.cssInput = /** @type {HTMLTextAreaElement} */ (document.getElementById('css-editor'));
    this.jsInput = /** @type {HTMLTextAreaElement} */ (document.getElementById('js-editor'));
    this.previewFrame = /** @type {HTMLIFrameElement} */ (document.getElementById('preview-frame'));

    // Core managers (storage, tabs, preview, file actions, resizer)
    this.storage = new StorageManager();
    this.tabs = new TabManager(
      document.querySelectorAll('.tab'),
      document.querySelectorAll('.editor-panel')
    );
    this.preview = new PreviewManager(
      this.htmlInput,
      this.cssInput,
      this.jsInput,
      this.previewFrame
    );
    this.actions = new ActionsManager(
      this.storage,
      { html: this.htmlInput, css: this.cssInput, js: this.jsInput },
      document.getElementById('save-btn'),
      document.getElementById('export-btn'),
      document.getElementById('import-btn'),
      document.getElementById('file-input')
    );
    this.resizer = new ResizerManager(
      document.getElementById('resizer'),
      document.querySelector('.editor-pane'),
      document.querySelector('.main-content')
    );

    this.init();
  }

  /**
   * Initialize the application
   */
  async init() {
    // Load saved code into editors
    await this.loadState();

    // Setup live preview on input with a fixed debounce delay
    const DEFAULT_PREVIEW_DELAY = 400;
    [this.htmlInput, this.cssInput, this.jsInput].forEach((el) => {
      el.addEventListener('input', () => {
        this.preview.queueUpdate(DEFAULT_PREVIEW_DELAY);
      });
    });

    // Render initial preview
    this.preview.update();
  }

  /**
   * Load state from storage
   */
  async loadState() {
    const data = await this.storage.get(['html', 'css', 'js']);

    this.htmlInput.value = data.html || '';
    this.cssInput.value = data.css || '';
    this.jsInput.value = data.js || '';
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new NewTabEditor();
});

