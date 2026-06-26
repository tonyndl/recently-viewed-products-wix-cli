// Site-wide embedded script. Runs on EVERY storefront page (top page context),
// detects product pages, and records the slug into Wix site-scoped storage
// (`@wix/site-storage` `local`). Crucially, it writes to the SAME store the
// widget reads — so the widget (which runs in its own iframe) sees the data
// regardless of frame. This is what lets tracking work everywhere without the
// widget being on product pages, and without the cross-frame localStorage
// mismatch that raw `localStorage` caused.
import { local } from "@wix/site-storage";

const STORAGE_KEY = "pagesplugin";
const MAX_TRACKED = 26;
const PRODUCT_PATH_MARKER = "/product-page/";

const currentProductSlug = (): string | null => {
  const path = window.location.pathname;
  const idx = path.indexOf(PRODUCT_PATH_MARKER);
  if (idx === -1) return null;
  const rest = path.slice(idx + PRODUCT_PATH_MARKER.length);
  const slug = rest.split("/")[0]?.split("?")[0] ?? "";
  if (!slug) return null;
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
};

const track = async (): Promise<void> => {
  const slug = currentProductSlug();
  if (!slug) return;
  try {
    const raw = await local.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const next = Array.isArray(parsed)
      ? (parsed as string[]).filter((s) => s !== slug)
      : [];
    next.unshift(slug);
    await local.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, MAX_TRACKED)));
  } catch {
    /* storage unavailable — skip */
  }
};

// Track the initial page, then on every client-side navigation (Wix sites
// navigate without a full reload).
void track();

const wrap = (type: "pushState" | "replaceState") => {
  const original = history[type];
  history[type] = function (
    this: History,
    ...args: Parameters<History["pushState"]>
  ) {
    const result = original.apply(this, args);
    window.setTimeout(() => void track(), 0);
    return result;
  };
};
wrap("pushState");
wrap("replaceState");
window.addEventListener("popstate", () => window.setTimeout(() => void track(), 0));
