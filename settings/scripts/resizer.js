/**
 * Resizer Module
 * Handles draggable divider between editor and preview panes
 */

export class ResizerManager {
  constructor(resizerElement, editorPane, mainContent) {
    this.resizer = resizerElement;
    this.editorPane = editorPane;
    this.mainContent = mainContent;

    // Internal state
    this.isResizing = false;
    this.isVertical = window.innerWidth <= 768;

    // Last pointer event (used for smoother dragging)
    this.lastEvent = null;
    this.rafId = null;

    this.init();
  }

  /**
   * Initialize resizer functionality
   */
  init() {
    // Use mousedown so it works across browsers; we still listen on document
    this.resizer.addEventListener('mousedown', (e) => this.startResize(e));
    document.addEventListener('mousemove', (e) => this.handleMove(e));
    document.addEventListener('mouseup', () => this.stopResize());
    window.addEventListener('resize', () => this.updateLayout());
  }

  /**
   * Start resize operation
   * @param {MouseEvent} e
   */
  startResize(e) {
    e.preventDefault();
    this.isResizing = true;
    this.isVertical = window.innerWidth <= 768;

    // Visual + UX tweaks while dragging
    document.body.style.cursor = this.isVertical ? 'row-resize' : 'col-resize';
    document.body.style.userSelect = 'none';
    this.resizer.style.background = 'var(--color-accent)';

    // Capture initial event
    this.lastEvent = e;
  }

  /**
   * Handle mousemove and throttle actual resize with requestAnimationFrame
   * @param {MouseEvent} e
   */
  handleMove(e) {
    if (!this.isResizing) return;
    this.lastEvent = e;

    if (this.rafId == null) {
      this.rafId = requestAnimationFrame(() => {
        this.rafId = null;
        this.doResize(this.lastEvent);
      });
    }
  }

  /**
   * Apply resize based on the latest pointer position
   * @param {MouseEvent} e
   */
  doResize(e) {
    if (!this.isResizing || !e) return;

    const container = this.mainContent;
    const rect = container.getBoundingClientRect();

    // Minimum pixel sizes for both panes so they never collapse:
    // this keeps the divider always visible and prevents layout breakage.
    const minPaneSize = 220; // px

    if (this.isVertical) {
      // Vertical resize (stacked layout on small screens)
      const cursorY = e.clientY - rect.top;
      const maxHeightPx = rect.height - minPaneSize;
      const clampedY = Math.max(minPaneSize, Math.min(cursorY, maxHeightPx));

      const newHeightPercent = (clampedY / rect.height) * 100;
      this.editorPane.style.flex = `0 0 ${newHeightPercent}%`;
    } else {
      // Horizontal resize (side‑by‑side layout on larger screens)
      const cursorX = e.clientX - rect.left;
      const maxWidthPx = rect.width - minPaneSize;
      const clampedX = Math.max(minPaneSize, Math.min(cursorX, maxWidthPx));

      const newWidthPercent = (clampedX / rect.width) * 100;
      this.editorPane.style.flex = `0 0 ${newWidthPercent}%`;
    }
  }

  /**
   * Stop resize operation
   */
  stopResize() {
    if (!this.isResizing) return;

    this.isResizing = false;
    this.lastEvent = null;

    // Reset UI tweaks
    document.body.style.cursor = 'default';
    document.body.style.userSelect = '';
    this.resizer.style.background = '';

    // Cancel any pending animation frame
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Update layout orientation on window resize
   * (we only flip orientation when not actively dragging)
   */
  updateLayout() {
    if (!this.isResizing) {
      this.isVertical = window.innerWidth <= 768;
    }
  }
}

