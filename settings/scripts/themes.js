/**
 * Theme Management Module
 * -----------------------
 * Responsible for:
 *  - Loading the theme manifest (themes/themes.json)
 *  - Rendering the list of themes in the Themes tab
 *  - Applying selected themes into the HTML/CSS/JS editors
 *
 * IMPORTANT:
 *  - THEME_BASE_PATH and THEME_MANIFEST_PATH below point to the "themes" folder.
 *  - Change these if you move or rename your themes folder.
 */

export class ThemeManager {
  /**
   * @param {HTMLElement|null} themesListEl - Container element for theme cards
   * @param {HTMLTextAreaElement} htmlInput - HTML editor element
   * @param {HTMLTextAreaElement} cssInput - CSS editor element
   * @param {HTMLTextAreaElement} jsInput - JS editor element
   * @param {import('./preview.js').PreviewManager} preview - Preview manager instance
   * @param {() => number} getPreviewDelay - Function returning the current preview delay
   */
  constructor(themesListEl, htmlInput, cssInput, jsInput, preview, getPreviewDelay) {
    this.themesListEl = themesListEl;
    this.htmlInput = htmlInput;
    this.cssInput = cssInput;
    this.jsInput = jsInput;
    this.preview = preview;
    this.getPreviewDelay = getPreviewDelay;

    // ====== THEME FOLDER LOCATION (EDIT THIS IF YOU MOVE YOUR THEMES) ======
    // Base path for all themes; each theme lives inside this folder.
    this.THEME_BASE_PATH = 'themes';
    // Manifest file listing all themes; by default: /themes/themes.json
    this.THEME_MANIFEST_PATH = `${this.THEME_BASE_PATH}/themes.json`;
    // =======================================================================

    /** @type {Array<{id:string,name:string,description?:string,folder:string}>} */
    this.themes = [];
  }

  /**
   * Load theme metadata from the manifest JSON file.
   * Default location: /themes/themes.json
   */
  async loadThemes() {
    if (!this.themesListEl) return;

    try {
      const response = await fetch(this.THEME_MANIFEST_PATH, { cache: 'no-cache' });
      if (!response.ok) {
        console.warn('Unable to load themes manifest:', response.status, response.statusText);
        this.renderEmpty('Could not load themes manifest.');
        return;
      }

      const themes = await response.json();

      this.themes = Array.isArray(themes)
        ? themes
            .filter((t) => t && t.id && t.folder)
            .map((t) => ({
              id: t.id,
              name: t.name || t.id,
              description: t.description || '',
              // normalize folder path and make sure it stays under THEME_BASE_PATH
              folder: t.folder.replace(/\/+$/, ''),
            }))
        : [];

      this.renderThemes();
    } catch (err) {
      console.warn('Failed to load themes manifest:', err);
      this.renderEmpty('No themes found or manifest failed to load.');
    }
  }

  /**
   * Render a "no themes" message in the Themes tab.
   * @param {string} message
   */
  renderEmpty(message) {
    if (!this.themesListEl) return;
    this.themesListEl.innerHTML = '';
    const empty = document.createElement('div');
    empty.className = 'theme-description';
    empty.textContent = message;
    this.themesListEl.appendChild(empty);
  }

  /**
   * Render all themes into the Themes tab as clickable cards.
   */
  renderThemes() {
    if (!this.themesListEl) return;

    this.themesListEl.innerHTML = '';

    if (!this.themes.length) {
      this.renderEmpty('No themes found in the themes folder.');
      return;
    }

    this.themes.forEach((theme) => {
      const card = document.createElement('button');
      card.className = 'theme-card';
      card.type = 'button';
      card.title = theme.description || theme.name;

      card.innerHTML = `
        <div class="theme-card-header">
          <div class="theme-name">${theme.name}</div>
          <div class="theme-path">${theme.folder}/index.html</div>
        </div>
        <div class="theme-card-body">
          <div class="theme-preview-lines">
            <span>&lt;index.html&gt;</span>
            <span>&lt;style.css&gt;</span>
            <span>&lt;script.js&gt;</span>
          </div>
          <div class="theme-description">
            ${theme.description || ''}
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        this.applyTheme(theme);
      });

      this.themesListEl.appendChild(card);
    });
  }

  /**
   * Apply a theme's files into the editors by loading from its folder.
   * Each theme folder must contain: index.html, style.css, script.js
   * This ONLY updates the editor textareas and then refreshes the preview.
   * @param {{id:string, folder:string}} theme
   */
  async applyTheme(theme) {
    if (!theme || !theme.folder) return;

    // Normalize folder path (e.g. "themes/minimal-dark")
    const base = theme.folder.replace(/\/+$/, '');

    try {
      // Fetch the three theme files in parallel
      const [htmlResp, cssResp, jsResp] = await Promise.all([
        fetch(`${base}/index.html`, { cache: 'no-cache' }),
        fetch(`${base}/style.css`, { cache: 'no-cache' }),
        fetch(`${base}/script.js`, { cache: 'no-cache' }),
      ]);

      if (!htmlResp.ok || !cssResp.ok || !jsResp.ok) {
        console.error('One or more theme files could not be loaded for', theme.id);
        return;
      }

      // Read raw file contents
      const [html, css, js] = await Promise.all([
        htmlResp.text(),
        cssResp.text(),
        jsResp.text(),
      ]);

      // Directly inject file contents into the three editors
      this.htmlInput.value = html;
      this.cssInput.value = css;
      this.jsInput.value = js;

      // Immediately update the preview (no debounce, no extra work)
      this.preview.update();
    } catch (err) {
      console.error('Failed to apply theme', theme.id, err);
    }
  }
}


