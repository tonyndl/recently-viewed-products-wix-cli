

class RatePopup extends HTMLElement {
  static get observedAttributes() {
    return ["open"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._rendered = false;

    this._onKeyDown = (e) => {
      if (!this._isOpen()) return;
      if (e.key === "Escape") {
        e.preventDefault();
        this._close();
      }
      if (e.key === "Tab") this._trapFocus(e);
    };

    this._lastFocused = null;
  }

  connectedCallback() {
    if (!this._rendered) this._render();
    // this._syncFromSrc();
  }

  disconnectedCallback() {
    document.removeEventListener("keydown", this._onKeyDown, true);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this._rendered) return;
    if (name === "open") this._syncFromSrc();
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          /* Wix-ish tokens if present, graceful fallbacks */
          --font: var(--wix-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif);
          --text: var(--wix-color-text, var(--color_15, #111));
          --bg: var(--wix-color-surface, var(--color_11, #fff));
          --border: var(--wix-color-border, rgba(0,0,0,0.12));
          --overlay: rgba(0,0,0,0.55);
          --radius: 16px;
          --shadow: 0 18px 60px rgba(0,0,0,0.25);
          --z: 999999;
          font-family: var(--font);
        }

        .overlay {
          position: fixed;
          inset: 0;
          z-index: var(--z);
          background: var(--overlay);
          display: none;
          align-items: center;
          justify-content: center;
          padding: 24px;
          box-sizing: border-box;
        }
        .overlay[data-open="true"] { display: flex; }

        .dialog {
          width: min(770px, calc(100vw - 48px));
          height: min(650px, calc(100vh - 48px));
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          overflow: hidden;
          display: grid;
          grid-template-rows: auto 1fr;
        }

        .header {
          background: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 14px 12px 16px;
          border-bottom: 1px solid var(--border);
          color: var(--text);
          gap: 12px;
        }

        .title {
          font-size: 14px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          min-width: 0;
        }

        button.icon {
          appearance: none;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text);
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          cursor: pointer;
        }
        button.icon:hover { background: rgba(0,0,0,0.04); }
        button.icon:focus { outline: none; box-shadow: 0 0 0 3px rgba(0,0,0,0.10); }

        .body { position: relative; }
        iframe { width: 100%; height: 100%; border: 0; display: block; background: #fff; }

        @media (max-width: 520px) {
          .overlay { padding: 12px; }
          .dialog {
            width: calc(100vw - 24px);
            height: calc(100vh - 24px);
            border-radius: 14px;
          }
        }
      </style>

      <div class="overlay" aria-hidden="true">
        <div class="dialog" role="dialog" aria-modal="true" aria-label="Preview">
          <div class="header">
            <div class="title">How are you liking our app?</div>
            <button class="icon" type="button" aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M4 4l8 8M12 4L4 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <div class="body">
            <iframe referrerpolicy="no-referrer-when-downgrade"></iframe>
          </div>
        </div>
      </div>
    `;

    this.$overlay = this.shadowRoot.querySelector(".overlay");
    this.$dialog = this.shadowRoot.querySelector(".dialog");
    this.$close = this.shadowRoot.querySelector("button.icon");
    this.$iframe = this.shadowRoot.querySelector("iframe");

    // Close on button
    this.$close.addEventListener("click", () => this._close());

    // Close on click outside
    this.$overlay.addEventListener("mousedown", (e) => {
      if (e.target === this.$overlay) this._close();
    });

    // Prevent bubbling from inside dialog
    this.$dialog.addEventListener("mousedown", (e) => e.stopPropagation());

    this._rendered = true;
  }

  _syncFromSrc() {
    const src = "https://www.wix.com/app-market/add-review/b2f7d72d-6a8a-4dd2-bade-f237268658bc";

    if (!src) {
      this._close();
      // optional: unload iframe when closed
      this.$iframe?.removeAttribute("src");
      return;
    }

    // Set iframe first, then open
    this.$iframe.src = src;
    this._open();
  }

  _open() {
    if (this._isOpen()) return;

    this._lastFocused = document.activeElement;
    this.$overlay.dataset.open = "true";
    this.$overlay.setAttribute("aria-hidden", "false");

    document.addEventListener("keydown", this._onKeyDown, true);

    queueMicrotask(() => {
      this.$close?.focus?.();
    });
  }

  _close() {
    if (!this._isOpen()) return;

    this.$overlay.dataset.open = "false";
    this.$overlay.setAttribute("aria-hidden", "true");

    document.removeEventListener("keydown", this._onKeyDown, true);

    queueMicrotask(() => {
      this._lastFocused?.focus?.();
      this._lastFocused = null;
    });
  }

  _isOpen() {
    return this.$overlay?.dataset.open === "true";
  }

  _getFocusable() {
    const nodes = this.shadowRoot.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    return Array.from(nodes).filter((el) => !el.hasAttribute("disabled"));
  }

  _trapFocus(e) {
    const focusable = this._getFocusable();
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = this.shadowRoot.activeElement || document.activeElement;

    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

customElements.define("rate-popup", RatePopup);
