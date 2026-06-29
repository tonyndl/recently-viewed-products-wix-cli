import { httpClient } from "@wix/essentials";
import type { RecentlyViewedItem } from "../types";
import {
  TRACKING_STORAGE_KEY,
  MAX_TRACKED_SLUGS,
} from "../../../../../constants";

const baseApiUrl = new URL(import.meta.url).origin;

// Blocks-style storage. The original Wix Blocks app ran in the site's own
// context, so a synchronous `localStorage` write on a product page was instantly
// readable on the page with the widget. We reproduce that here using the widget's
// OWN frame: a custom element's iframe has the SAME origin on every page, so its
// `localStorage` is shared across all pages the widget appears on — synchronous
// and instant, with no cross-frame proxy. The only requirement (which Blocks gave
// implicitly) is that the widget is present on the product pages so it records
// the view there. No `@wix/site-storage`, no embedded script.
const parseSlugList = (raw: string | null): string[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed
          .filter((s): s is string => typeof s === "string")
          .slice(0, MAX_TRACKED_SLUGS)
      : [];
  } catch {
    return [];
  }
};

// Dev/testing helper — clears the tracked list. Exposed on
// `window.__rvClearHistory` by the widget so it's callable from the console.
export const clearTrackedSlugs = async (): Promise<void> => {
  try {
    window.localStorage.removeItem(TRACKING_STORAGE_KEY);
    window.localStorage.removeItem(CACHE_KEY); // also drop the rendered-items cache
  } catch {
    /* ignore */
  }
};

// Read the visitor's recently-viewed product slugs (most-recent-first).
// Synchronous read of the widget's own localStorage — instant.
export const readTrackedSlugs = async (): Promise<string[]> =>
  parseSlugList(window.localStorage.getItem(TRACKING_STORAGE_KEY));

// --- Self-tracking -----------------------------------------------------------
// The widget records product views itself (no separate embedded script). Because
// the same widget both writes and reads `localStorage`, there's no per-site
// embed step and no cross-frame storage mismatch. Requires the widget to be on
// the product pages so it can record the view there.

const PRODUCT_PATH_MARKER = "/product-page/";

// Pull the product slug out of a full URL, e.g.
// "https://site.com/product-page/my-soap?x=1" → "my-soap".
const slugFromUrl = (rawUrl: string): string | null => {
  const idx = rawUrl.indexOf(PRODUCT_PATH_MARKER);
  if (idx === -1) return null;
  const rest = rawUrl.slice(idx + PRODUCT_PATH_MARKER.length);
  const slug = rest.split("/")[0]?.split("?")[0]?.split("#")[0] ?? "";
  if (!slug) return null;
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
};

// Prepend `slug` (most-recent-first, de-duped, capped) into the tracked list —
// synchronous localStorage write, instant.
const writeSlug = (slug: string): void => {
  let current: string[] = [];
  try {
    current = parseSlugList(window.localStorage.getItem(TRACKING_STORAGE_KEY));
  } catch {
    /* ignore */
  }
  if (current[0] === slug) return; // already most-recent
  const next = [slug, ...current.filter((s) => s !== slug)].slice(
    0,
    MAX_TRACKED_SLUGS,
  );
  try {
    window.localStorage.setItem(TRACKING_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — silently skip */
  }
};

// Read the visitor's current page via @wix/site-location (works across the
// widget's iframe boundary — it talks to the host) and record it if it's a
// product page. Returns true if a product slug was recorded.
//
// `@wix/site-location` is imported DYNAMICALLY on purpose — a static import can
// break the custom element entirely (same reason the navigation code does it).
export const recordCurrentProduct = async (): Promise<boolean> => {
  // FAST PATH (instant): when the widget shares the site's origin, the top page's
  // URL is readable synchronously — no async module load, no host round-trip. This
  // is what makes the slug land in localStorage the moment the product page opens.
  let url: string | null = null;
  try {
    url = window.top?.location?.href ?? null; // throws if cross-origin
  } catch {
    url = null; // cross-origin top — fall back to the async host API below
  }
  // Fallback (async) — only when the sync read isn't allowed (different origin).
  if (!url) {
    try {
      const { location } = await import("@wix/site-location");
      url = await location.url();
    } catch {
      return false;
    }
  }
  const slug = slugFromUrl(url);
  // TEMP debug — show the page URL the widget sees and the slug it extracts.
  console.log("[rv-widget] url:", url, "| product slug:", slug);
  if (!slug) return false;
  writeSlug(slug);
  return true;
};

// Subscribe to site navigations so views are recorded as the visitor moves
// between product pages without a full reload (Wix sites navigate client-side).
export const onSiteLocationChange = async (
  handler: () => void,
): Promise<void> => {
  try {
    const { location } = await import("@wix/site-location");
    (location as { onChange?: (cb: () => void) => void }).onChange?.(() =>
      handler(),
    );
  } catch {
    /* onChange unsupported / location unavailable — initial record still ran */
  }
};

// Product reads run through the app backend with elevated permissions
// (/api/products), the modern equivalent of the original's suppressAuth.
const fetchFromApi = async (query: string): Promise<RecentlyViewedItem[]> => {
  const url = `${baseApiUrl}/api/products?${query}`;
  // TEMP debug — remove once the widget shows again.
  console.log("[rv-widget] GET", url);
  const res = await httpClient.fetchWithAuth(url);
  console.log("[rv-widget] api status:", res.status, res.ok);
  const data = (await res.json()) as RecentlyViewedItem[] | { error: string };
  console.log("[rv-widget] api data:", data);
  return Array.isArray(data) ? data : [];
};

// Query the store for the tracked products, preserving recency order.
export const fetchRecentlyViewed = async (
  slugs: string[],
): Promise<RecentlyViewedItem[]> => {
  if (slugs.length === 0) return [];

  const items = await fetchFromApi(
    `slugs=${encodeURIComponent(slugs.join(","))}`,
  );
  const bySlug = new Map<string, RecentlyViewedItem>();
  for (const item of items) {
    if (item.slug && !bySlug.has(item.slug)) bySlug.set(item.slug, item);
  }

  // Re-order to match the visitor's browsing recency.
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((item): item is RecentlyViewedItem => item != null);
};

// Editor/preview fallback so the merchant can see the gallery before any
// product has been browsed (mirrors the original Blocks app's `showDefault()`).
export const fetchDefaultProducts = (): Promise<RecentlyViewedItem[]> =>
  fetchFromApi(`limit=${MAX_TRACKED_SLUGS}`);

// Stale-while-revalidate cache for the resolved products. The widget shares the
// site origin, so this same-frame localStorage read is synchronous — the last
// rendered products paint INSTANTLY on the next page load while fresh data is
// fetched in the background. Removes the load wait entirely on repeat views.
const CACHE_KEY = "rv-cache";

export const readCachedItems = (): RecentlyViewedItem[] => {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? (parsed as RecentlyViewedItem[]) : [];
  } catch {
    return [];
  }
};

export const writeCachedItems = (items: RecentlyViewedItem[]): void => {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(items));
  } catch {
    /* storage full / unavailable — cache is best-effort */
  }
};

// Soft background + accent pairs so each sample card looks distinct.
const SAMPLE_BG = [
  "#EEF2F7",
  "#F4EEF7",
  "#EAF6EF",
  "#FBF1E9",
  "#E9F3F7",
  "#F8EEF0",
];
const SAMPLE_FG = [
  "#9FB1C9",
  "#B4A0C7",
  "#8FC3A6",
  "#D6B48C",
  "#8FB8CC",
  "#CFA0AB",
];

// A self-contained SVG placeholder (a generic "image" glyph on a soft tint),
// inlined as a data-URI so it needs NO network request — it can't be blocked or
// go down, unlike a third-party image host. Sized 600×600 to match the items.
const samplePlaceholder = (i: number): string => {
  const bg = SAMPLE_BG[i % SAMPLE_BG.length];
  const fg = SAMPLE_FG[i % SAMPLE_FG.length];
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">` +
    `<rect width="600" height="600" fill="${bg}"/>` +
    `<g fill="none" stroke="${fg}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">` +
    `<rect x="170" y="190" width="260" height="200" rx="18"/>` +
    `<circle cx="240" cy="255" r="24"/>` +
    `<path d="M185 380l78-78 54 50 64-70 44 44"/>` +
    `</g></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

// Static sample products shown ONLY in the Editor design canvas. Wix does not run
// real data fetches inside the Editor (see CUSTOM_ELEMENT_WIDGET.md — "fetching
// data inside the Editor produces empty results"), so the backend query comes back
// empty there. These give the merchant a populated widget to design against — the
// Pro Gallery's built-in stock images were the Blocks-era equivalent. The live and
// Preview site fetch real products instead. Images are inline SVG placeholders and
// carry width/height so the gallery skips natural-size probing.
export const SAMPLE_PRODUCTS: RecentlyViewedItem[] = [
  "$24.00",
  "$32.00",
  "$18.50",
  "$45.00",
  "$59.00",
  "$29.00",
].map((price, i) => ({
  id: `sample-${i + 1}`,
  slug: `sample-${i + 1}`,
  name: `Item ${i + 1}`,
  imageUrl: samplePlaceholder(i),
  productUrl: "", // no navigation — samples are editor-only
  formattedPrice: price,
  description: "Sample product shown in the editor preview.",
  width: 600,
  height: 600,
}));
