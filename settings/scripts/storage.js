/**
 * Storage Management Module
 * Handles both Chrome Extension storage and localStorage fallback
 */

export class StorageManager {
  constructor() {
    this.isChromeExtension = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
  }

  /**
   * Get values from storage
   * @param {string[]} keys - Keys to retrieve
   * @returns {Promise<Object>}
   */
  async get(keys) {
    return new Promise((resolve) => {
      if (this.isChromeExtension) {
        chrome.storage.local.get(keys, resolve);
      } else {
        const result = {};
        keys.forEach(key => {
          result[key] = localStorage.getItem(`editor_${key}`) || "";
        });
        resolve(result);
      }
    });
  }

  /**
   * Set values in storage
   * @param {Object} data - Key-value pairs to store
   * @returns {Promise<void>}
   */
  async set(data) {
    return new Promise((resolve) => {
      if (this.isChromeExtension) {
        chrome.storage.local.set(data, resolve);
      } else {
        Object.entries(data).forEach(([key, val]) => {
          localStorage.setItem(`editor_${key}`, val);
        });
        resolve();
      }
    });
  }

  /**
   * Clear all editor data
   * @returns {Promise<void>}
   */
  async clear() {
    return new Promise((resolve) => {
      if (this.isChromeExtension) {
        chrome.storage.local.remove(['html', 'css', 'js'], resolve);
      } else {
        localStorage.removeItem('editor_html');
        localStorage.removeItem('editor_css');
        localStorage.removeItem('editor_js');
        resolve();
      }
    });
  }
}

