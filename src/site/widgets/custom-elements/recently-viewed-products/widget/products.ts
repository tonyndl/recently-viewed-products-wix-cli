import { httpClient } from '@wix/essentials';
import type { RecentlyViewedItem } from '../types';
import { TRACKING_STORAGE_KEY, MAX_TRACKED_SLUGS } from '../../../../../constants';

const baseApiUrl = new URL(import.meta.url).origin;

// Read the visitor's recently-viewed product slugs from localStorage.
// Mirrors the original Blocks app (key `pagesplugin`, most-recent-first).
export const readTrackedSlugs = (): string[] => {
  try {
    const raw = localStorage.getItem(TRACKING_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((s): s is string => typeof s === 'string')
      .slice(0, MAX_TRACKED_SLUGS);
  } catch {
    return [];
  }
};

// Product reads run through the app backend with elevated permissions
// (/api/products), the modern equivalent of the original's suppressAuth.
const fetchFromApi = async (query: string): Promise<RecentlyViewedItem[]> => {
  const res = await httpClient.fetchWithAuth(`${baseApiUrl}/api/products?${query}`);
  const data = (await res.json()) as RecentlyViewedItem[] | { error: string };
  return Array.isArray(data) ? data : [];
};

// Query the store for the tracked products, preserving recency order.
export const fetchRecentlyViewed = async (
  slugs: string[],
): Promise<RecentlyViewedItem[]> => {
  if (slugs.length === 0) return [];

  const items = await fetchFromApi(`slugs=${encodeURIComponent(slugs.join(','))}`);
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
