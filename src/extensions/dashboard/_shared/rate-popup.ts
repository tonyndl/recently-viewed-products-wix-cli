// Ported from the original Blocks app's public/custom-elements/popup.js.
// Defines a shadow-DOM <rate-popup> dialog that embeds the App Market review
// page in an iframe, and exposes openRatePopup() to show it on demand.
//
// The custom-element class is defined lazily (client-only) so importing this
// module never references HTMLElement during server-side rendering.
import { REVIEW_URL } from "../../../constants";

const TAG = "rate-popup";
let defined = false;

const ensureDefined = () => {
  if (defined || typeof window === "undefined" || !window.customElements)
    return;
  if (customElements.get(TAG)) {
    defined = true;
    return;
  }

  class RatePopup extends HTMLElement {
    private rendered = false;
    private $overlay!: HTMLDivElement;
    private $dialog!: HTMLDivElement;
    private $close!: HTMLButtonElement;
    private $iframe!: HTMLIFrameElement;
    private lastFocused: Element | null = null;

    private onKeyDown = (e: KeyboardEvent) => {
      if (!this.isOpen()) return;
      if (e.key === "Escape") {
        e.preventDefault();
        this.close();
      }
      if (e.key === "Tab") this.trapFocus(e);
    };

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
      if (!this.rendered) this.render();
    }

    disconnectedCallback() {
      document.removeEventListener("keydown", this.onKeyDown, true);
    }

    render() {
      this.shadowRoot!.innerHTML = `
        <style>
          :host { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; }
          .overlay { position: fixed; inset: 0; z-index: 999999; background: rgba(0,0,0,0.55);
            display: none; align-items: center; justify-content: center; padding: 24px; box-sizing: border-box; }
          .overlay[data-open="true"] { display: flex; }
          .overlay[data-editor="true"] { padding: 16px; }
          .dialog { width: min(770px, calc(100vw - 48px)); height: min(650px, calc(100vh - 48px));
            background: #fff; border: 1px solid rgba(0,0,0,0.12); border-radius: 16px;
            box-shadow: 0 18px 60px rgba(0,0,0,0.25); overflow: hidden; display: grid; grid-template-rows: auto 1fr; }
          .overlay[data-editor="true"] .dialog { width: min(460px, calc(100vw - 32px)); height: min(480px, calc(100vh - 32px)); }
          .header { display: flex; align-items: center; justify-content: space-between;
            padding: 14px 14px 12px 16px; border-bottom: 1px solid rgba(0,0,0,0.12); gap: 12px; }
          .title { font-size: 14px; font-weight: 600; }
          button.icon { appearance: none; border: 1px solid rgba(0,0,0,0.12); background: transparent;
            width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center; cursor: pointer; }
          button.icon:hover { background: rgba(0,0,0,0.04); }
          .body { position: relative; }
          iframe { width: 100%; height: 100%; border: 0; display: block; background: #fff; }
        </style>
        <div class="overlay" aria-hidden="true">
          <div class="dialog" role="dialog" aria-modal="true" aria-label="Rate this app">
            <div class="header">
              <div class="title">How are you liking our app?</div>
              <button class="icon" type="button" aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M4 4l8 8M12 4L4 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
            <div class="body"><iframe referrerpolicy="no-referrer-when-downgrade"></iframe></div>
          </div>
        </div>`;

      this.$overlay = this.shadowRoot!.querySelector(".overlay")!;
      this.$dialog = this.shadowRoot!.querySelector(".dialog")!;
      this.$close = this.shadowRoot!.querySelector("button.icon")!;
      this.$iframe = this.shadowRoot!.querySelector("iframe")!;

      this.$close.addEventListener("click", () => this.close());
      this.$overlay.addEventListener("mousedown", (e) => {
        if (e.target === this.$overlay) this.close();
      });
      this.$dialog.addEventListener("mousedown", (e) => e.stopPropagation());
      this.rendered = true;
    }

    open(src: string, isEditor = false) {
      if (!this.rendered) this.render();
      this.$iframe.src = src;
      this.$overlay.dataset.editor = isEditor ? "true" : "false";
      if (this.isOpen()) return;
      this.lastFocused = document.activeElement;
      this.$overlay.dataset.open = "true";
      this.$overlay.setAttribute("aria-hidden", "false");
      document.addEventListener("keydown", this.onKeyDown, true);
      queueMicrotask(() => this.$close?.focus?.());
    }

    private close() {
      if (!this.isOpen()) return;
      this.$overlay.dataset.open = "false";
      this.$overlay.setAttribute("aria-hidden", "true");
      this.$iframe.removeAttribute("src");
      document.removeEventListener("keydown", this.onKeyDown, true);
      queueMicrotask(() => {
        (this.lastFocused as HTMLElement | null)?.focus?.();
        this.lastFocused = null;
      });
    }

    private isOpen() {
      return this.$overlay?.dataset.open === "true";
    }

    private trapFocus(e: KeyboardEvent) {
      const nodes = this.shadowRoot!.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const focusable = Array.from(nodes).filter(
        (el) => !el.hasAttribute("disabled"),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = this.shadowRoot!.activeElement || document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  customElements.define(TAG, RatePopup);
  defined = true;
};

// Show the rate popup, defining the element and a single instance on demand.
// Pass `{ isEditor: true }` from a widget settings panel to render the smaller
// dialog (460×480) suited to the editor panel context.
export const openRatePopup = (
  reviewUrl: string = REVIEW_URL,
  options?: { isEditor?: boolean },
) => {
  if (typeof window === "undefined") return;
  ensureDefined();
  type RatePopupEl = HTMLElement & {
    open: (src: string, isEditor?: boolean) => void;
  };
  let el = document.querySelector(TAG) as RatePopupEl | null;
  if (!el) {
    el = document.createElement(TAG) as RatePopupEl;
    document.body.appendChild(el);
  }
  el.open(reviewUrl, options?.isEditor ?? false);
};
