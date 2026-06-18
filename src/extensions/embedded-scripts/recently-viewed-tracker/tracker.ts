// Site-wide embedded script. Runs on every storefront page, detects product
// pages, and records the product slug into localStorage so the Recently Viewed
// widget can display them. Replaces the original Wix Blocks `startEmbed` flow.
//
// NOTE: this file is bundled as a standalone browser script — keep it
// dependency-free. The key/cap below mirror src/constants/index.ts.
(() => {
  const STORAGE_KEY = 'pagesplugin';
  const MAX_TRACKED = 26;
  const PRODUCT_PATH_MARKER = '/product-page/';

  const currentProductSlug = (): string | null => {
    const path = window.location.pathname;
    const idx = path.indexOf(PRODUCT_PATH_MARKER);
    if (idx === -1) return null;
    const rest = path.slice(idx + PRODUCT_PATH_MARKER.length);
    const slug = rest.split('/')[0]?.split('?')[0] ?? '';
    if (!slug) return null;
    try {
      return decodeURIComponent(slug);
    } catch {
      return slug;
    }
  };

  const track = (): void => {
    const slug = currentProductSlug();
    if (!slug) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list: string[] = raw ? JSON.parse(raw) : [];
      const next = Array.isArray(list)
        ? list.filter((s) => s !== slug)
        : [];
      next.unshift(slug);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, MAX_TRACKED)));
    } catch {
      /* localStorage unavailable — silently skip */
    }
  };

  // Track the initial page, then on every client-side navigation (Wix sites
  // navigate without a full reload).
  track();

  const wrap = (type: 'pushState' | 'replaceState') => {
    const original = history[type];
    history[type] = function (this: History, ...args: Parameters<History['pushState']>) {
      const result = original.apply(this, args);
      window.setTimeout(track, 0);
      return result;
    };
  };
  wrap('pushState');
  wrap('replaceState');
  window.addEventListener('popstate', () => window.setTimeout(track, 0));
})();
