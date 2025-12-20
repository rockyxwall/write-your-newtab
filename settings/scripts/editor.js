/**
 * Main Editor Module
 * Orchestrates all editor functionality
 */

import { StorageManager } from './storage.js';
import { TabManager } from './tabs.js';
import { PreviewManager } from './preview.js';
import { ActionsManager } from './actions.js';
import { ResizerManager } from './resizer.js';
import { ThemeManager } from './themes.js';
import { OptionsManager } from './options.js';

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

    // Options controls (in Options tab)
    this.autoSaveCheckbox = /** @type {HTMLInputElement|null} */ (document.getElementById('auto-save'));
    this.previewDelayInput = /** @type {HTMLInputElement|null} */ (document.getElementById('preview-delay'));
    this.clearBtn = /** @type {HTMLButtonElement|null} */ (document.getElementById('clear-btn'));

    // Themes container (in Themes tab)
    this.themesListEl = /** @type {HTMLElement|null} */ (document.getElementById('themes-list'));

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

    // Options manager handles all "Options" tab logic and state
    this.options = new OptionsManager(
      this.storage,
      this.autoSaveCheckbox,
      this.previewDelayInput,
      this.clearBtn,
      this.htmlInput,
      this.cssInput,
      this.jsInput,
      this.preview
    );

    // Theme manager handles discovery + application of themes from /themes
    this.themeManager = new ThemeManager(
      this.themesListEl,
      this.htmlInput,
      this.cssInput,
      this.jsInput,
      this.preview,
      () => this.options.previewDelay
    );

    this.init();
  }

  /**
   * Initialize the application
   */
  async init() {
    // Load saved code into editors
    await this.loadState();

    // Load options (auto-save + preview delay) and sync controls
    await this.options.loadOptions();

    // Load themes from the /themes folder and render the Themes tab
    await this.themeManager.loadThemes();

    // Setup live preview on input with configurable delay
    [this.htmlInput, this.cssInput, this.jsInput].forEach((el) => {
      el.addEventListener('input', () => {
        // Debounced preview with current delay from OptionsManager
        this.preview.queueUpdate(this.options.previewDelay);

        // Optional auto‑save, also managed by OptionsManager
        if (this.options.autoSaveEnabled) {
          this.actions.save();
        }
      });
    });

    // Render initial preview
    this.preview.update();
  }

  /**
   * Load state from storage
   */
  async loadState() {
    // Load only code here; options are handled by OptionsManager
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

