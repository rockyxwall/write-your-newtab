/**
 * Tab Management Module
 * Handles switching between HTML, CSS, and JavaScript editors
 */

export class TabManager {
  /**
   * @param {NodeListOf<HTMLButtonElement>} tabElements - Tab buttons
   * @param {NodeListOf<HTMLElement>} panelElements - All tab panels
   */
  constructor(tabElements, panelElements) {
    this.tabs = tabElements;
    this.panels = panelElements;
    this.init();
  }

  /**
   * Initialize tab switching
   */
  init() {
    this.tabs.forEach((tab) => {
      tab.addEventListener('click', () => this.switchTab(tab));
    });
  }

  /**
   * Switch to a specific tab
   * @param {HTMLButtonElement} tab - The tab element to activate
   */
  switchTab(tab) {
    const target = tab.dataset.tab;

    // Deactivate all tabs
    this.tabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');

    // Hide all panels
    this.panels.forEach((p) => p.classList.add('hidden'));

    // Show selected panel
    const panel = document.getElementById(`tab-${target}`);
    if (panel) {
      panel.classList.remove('hidden');

      // Focus textarea if panel contains one
      const textarea = panel.querySelector('textarea');
      if (textarea) {
        textarea.focus();
      }
    }
  }
}

