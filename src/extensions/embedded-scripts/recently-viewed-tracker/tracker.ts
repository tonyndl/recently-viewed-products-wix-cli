// Product-view tracker, injected on every storefront page (BODY_END). It runs in
// the SITE's own document, so it reads the URL and writes localStorage
// SYNCHRONOUSLY — the just-viewed product is recorded the instant the page loads,
// BEFORE (and independent of) the widget mounting. That's what stops a fast
// click-through from being missed. The widget shares this same site-origin
// localStorage, so it reads exactly what this writes. No async, no
// @wix/site-storage — pure synchronous localStorage, Blocks-style.
const STORAGE_KEY = "pagesplugin";
const MAX_TRACKED = 26;
const PRODUCT_PATH_MARKER = "/product-page/";

const currentProductSlug = (): string | null => {
  const path = window.location.pathname;
  const idx = path.indexOf(PRODUCT_PATH_MARKER);
  if (idx === -1) return null;
  const rest = path.slice(idx + PRODUCT_PATH_MARKER.length);
  const slug = rest.split("/")[0]?.split("?")[0]?.split("#")[0] ?? "";
  if (!slug) return null;
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
};

const track = (): void => {
  const slug = currentProductSlug();
  // TEMP debug — show the page URL and the slug recorded.
  console.log(
    "[rv-tracker] url:",
    window.location.href,
    "| product slug:",
    slug,
  );
  if (!slug) return;
  let list: string[] = [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed))
      list = parsed.filter((s): s is string => typeof s === "string");
  } catch {
    /* ignore */
  }
  if (list[0] === slug) return; // already most-recent
  list = [slug, ...list.filter((s) => s !== slug)].slice(0, MAX_TRACKED);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable */
  }
};

// Record the current page immediately (synchronous, as soon as the script runs),
// then on every client-side navigation (Wix sites navigate without a full
// reload). pushState/replaceState update the URL synchronously, so we read the
// new slug right after them — no setTimeout, no deferral.
track();

const wrap = (type: "pushState" | "replaceState") => {
  const original = history[type];
  history[type] = function (
    this: History,
    ...args: Parameters<History["pushState"]>
  ) {
    const result = original.apply(this, args);
    track();
    return result;
  };
};
wrap("pushState");
wrap("replaceState");
window.addEventListener("popstate", track);

// Dev/testing helper — clear the recently-viewed list, then reload.
(window as unknown as { __rvClearHistory?: () => void }).__rvClearHistory =
  () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    console.log("[rv-tracker] cleared recently-viewed — reload to see it.");
  };
