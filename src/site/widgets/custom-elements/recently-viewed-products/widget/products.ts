import { httpClient } from "@wix/essentials";
import type { RecentlyViewedItem } from "../types";
import {
  TRACKING_STORAGE_KEY,
  MAX_TRACKED_SLUGS,
} from "../../../../../constants";

const baseApiUrl = new URL(import.meta.url).origin;

// Wix site-scoped local storage (`@wix/site-storage`). Unlike raw `localStorage`
// (which is per-frame, so the widget's iframe can't see what other frames wrote),
// this is host-proxied and SITE-scoped — every widget instance on every page
// shares it, regardless of which iframe it runs in. That's what makes the
// self-tracking work without an embedded script.
//
// Dynamically imported (like @wix/site-location) — a static import of a
// @wix/site-* host module can break the custom element. All methods are async.
const getSiteLocal = async () => {
  const { local } = await import("@wix/site-storage");
  return local;
};

// Read the visitor's recently-viewed product slugs (most-recent-first).
export const readTrackedSlugs = async (): Promise<string[]> => {
  try {
    const local = await getSiteLocal();
    const raw = await local.getItem(TRACKING_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((s): s is string => typeof s === "string")
      .slice(0, MAX_TRACKED_SLUGS);
  } catch {
    return [];
  }
};

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

// Prepend `slug` (most-recent-first, de-duped, capped) into the tracked list.
const writeSlug = async (slug: string): Promise<void> => {
  try {
    const local = await getSiteLocal();
    const raw = await local.getItem(TRACKING_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(parsed)
      ? (parsed as string[]).filter((s) => s !== slug)
      : [];
    list.unshift(slug);
    await local.setItem(
      TRACKING_STORAGE_KEY,
      JSON.stringify(list.slice(0, MAX_TRACKED_SLUGS)),
    );
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
  try {
    const { location } = await import("@wix/site-location");
    const url = await location.url();
    const slug = slugFromUrl(url);
    if (!slug) return false;
    await writeSlug(slug);
    return true;
  } catch {
    return false;
  }
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
  const res = await httpClient.fetchWithAuth(
    `${baseApiUrl}/api/products?${query}`,
  );
  const data = (await res.json()) as RecentlyViewedItem[] | { error: string };
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
