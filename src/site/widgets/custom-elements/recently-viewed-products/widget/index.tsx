import { useCallback, useEffect, useRef, useState, type FC } from "react";
import { window as siteWindow } from "@wix/site-window";
import type { RecentlyViewedItem, WidgetProps } from "../types";
import {
  readTrackedSlugs,
  fetchRecentlyViewed,
  fetchDefaultProducts,
  recordCurrentProduct,
  onSiteLocationChange,
  clearTrackedSlugs,
  SAMPLE_PRODUCTS,
  readCachedItems,
  writeCachedItems,
} from "./products";
import { ProGalleryView } from "./proGalleryView";
import { StripView } from "./ui/stripView";
import { Watermark } from "./ui/watermark";
import { ProductDetail } from "./ui/productModal";
import { Skeleton } from "./ui/skeleton";
import {
  EMPTY_MESSAGE,
  FREE_LAYOUTS,
  FREE_RATIOS,
  FREE_TEXT_POSITIONS,
} from "../constants";
import { styles, headingStyle } from "./styles/widget";

// Detect the Editor DESIGN CANVAS (where Wix does not run real data fetches).
// `viewMode()` is the documented signal, but the editor2 renderer can report
// "Site" for a custom element, so we also check the top frame's URL — the canvas
// carries `isEditor=true`, while Preview and the live site do not.
const detectEditorCanvas = (mode: string): boolean => {
  if (mode === "Editor") return true;
  try {
    const href = window.top?.location?.href ?? "";
    const query = href.includes("?") ? href.slice(href.indexOf("?") + 1) : "";
    return new URLSearchParams(query).get("isEditor") === "true";
  } catch {
    return false; // cross-origin top — can't inspect; treat as live
  }
};

// Site-facing widget — renders the visitor's recently-viewed products with the
// real Wix Pro Gallery. When the visitor has no history the widget shows featured
// store products (samples in the editor) with an editable caption.
export const RecentlyViewedWidget: FC<WidgetProps> = (props) => {
  const { isPremium, bgColor } = props;
  // Hydrate from the stale-while-revalidate cache so repeat views paint the last
  // products INSTANTLY (no skeleton) while fresh data is fetched in the background.
  const cacheRef = useRef<RecentlyViewedItem[] | null>(null);
  if (cacheRef.current === null) cacheRef.current = readCachedItems();
  const [items, setItems] = useState<RecentlyViewedItem[]>(cacheRef.current);
  const [loading, setLoading] = useState(cacheRef.current.length === 0);
  const [isEditor, setIsEditor] = useState(false);
  // True when `items` are featured store products shown because the visitor has
  // no history yet (drives the "Show Store Products" caption).
  const [isFallback, setIsFallback] = useState(false);
  const [previewItem, setPreviewItem] = useState<RecentlyViewedItem | null>(
    null,
  );
  const locationRef = useRef<{ to: (url: string) => Promise<void> } | null>(
    null,
  );

  // The widget renders inside a sandboxed preview iframe that blocks ALL
  // navigation — no 'allow-popups' (window.open) and no 'allow-top-navigation'
  // (top-frame links). So a product click cannot open the product page in the
  // editor preview by any means. Instead, clicking opens an in-widget quick-view
  // box (ProductModal) that lives entirely within our own frame. On the
  // PUBLISHED site, the box's "View Product" button routes to the real page via
  // Wix's router (`@wix/site-location` `location.to()`), the CLI equivalent of
  // the Blocks app's Pro Gallery `link`.
  //
  // location is loaded via a guarded DYNAMIC import — a static import of
  // @wix/site-location can break the custom element entirely.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mod = await import("@wix/site-location");
        if (!cancelled) locationRef.current = mod.location;
      } catch {
        /* "View Product" falls back to a direct assign */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Click a product → open the quick-view box (works in every environment).
  const handleSelect = useCallback((item: RecentlyViewedItem) => {
    setPreviewItem(item);
  }, []);

  // "View Product" button (published site only) → navigate to the product page.
  const handleViewProduct = useCallback((item: RecentlyViewedItem) => {
    setPreviewItem(null);
    const loc = locationRef.current;
    if (loc && item.productUrl) {
      void loc.to(item.productUrl).catch(() => {});
      return;
    }
    const fallback = item.productUrl || item.productUrlAbsolute;
    if (fallback) {
      try {
        window.location.assign(fallback);
      } catch {
        /* ignore */
      }
    }
  }, []);

  // Load history first; fall back to featured store products when empty (samples
  // in the editor) — mirrors the original Blocks app's empty state.
  const load = useCallback(async (isCancelled: () => boolean) => {
    const mode = await siteWindow.viewMode().catch(() => "Site");
    // "Editor" is the design canvas; "Preview" renders like the live site.
    const editorCanvas = detectEditorCanvas(mode);
    if (isCancelled()) return;
    // isEditor hides the "View Product" navigation in both Editor and Preview,
    // where the sandbox blocks it.
    setIsEditor(editorCanvas || mode === "Preview");

    // Editor design canvas: Wix does not run real data fetches here, so the
    // backend query would come back empty. Show static sample products instead
    // so the merchant always has a populated widget to design against.
    if (editorCanvas) {
      if (!isCancelled()) {
        setItems(SAMPLE_PRODUCTS);
        setIsFallback(true);
        setLoading(false);
      }
      return;
    }

    try {
      const slugs = await readTrackedSlugs();
      let result = await fetchRecentlyViewed(slugs);
      let fallback = false;
      // No history yet → show featured store products as a browsing nudge.
      if (result.length === 0) {
        result = await fetchDefaultProducts();
        fallback = result.length > 0;
      }
      // Refresh the cache with the freshly resolved products so the next page
      // load paints them instantly. Only on success — a failed fetch (catch)
      // keeps the previous cache rather than wiping it.
      writeCachedItems(result);
      if (!isCancelled()) {
        setItems(result);
        setIsFallback(fallback);
      }
    } catch {
      if (!isCancelled()) {
        setItems([]);
        setIsFallback(false);
      }
    } finally {
      if (!isCancelled()) setLoading(false);
    }
  }, []);

  // The navigation subscription is wired up once; route the reload through a ref
  // so it always calls the current `load`.
  const loadRef = useRef(load);
  loadRef.current = load;

  // Mount once: expose the dev clear, record the current product BEFORE the first
  // load (so it's included when the widget sits on a product page — it reads the
  // slug from the URL and writes its own localStorage synchronously), then
  // re-record + reload on every client-side navigation (Wix navigates without a
  // full reload). Same-frame localStorage means the just-viewed product is
  // available instantly on the next page — no polling, no cross-frame wait.
  useEffect(() => {
    (
      window as unknown as { __rvClearHistory?: () => Promise<void> }
    ).__rvClearHistory = clearTrackedSlugs;

    let cancelled = false;
    const isCancelled = () => cancelled;

    void (async () => {
      await recordCurrentProduct();
      if (cancelled) return;
      await loadRef.current(isCancelled);
      void onSiteLocationChange(() => {
        void (async () => {
          await recordCurrentProduct();
          if (!cancelled) await loadRef.current(isCancelled);
        })();
      });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Strip & Grid are the only free layouts; Square/Landscape ratios and
  // Below/On-image text positions are premium — enforce them at render time so a
  // free plan can't show a premium option saved during a previous premium
  // session. Heading/text COLOR is premium too (the rest of Text is free).
  const effectiveProps: WidgetProps = isPremium
    ? props
    : {
        ...props,
        layout: FREE_LAYOUTS.includes(props.layout)
          ? props.layout
          : FREE_LAYOUTS[0],
        ratio: FREE_RATIOS.includes(props.ratio) ? props.ratio : FREE_RATIOS[0],
        textPosition: FREE_TEXT_POSITIONS.includes(props.textPosition)
          ? props.textPosition
          : FREE_TEXT_POSITIONS[0],
        headingColor: "", // premium — '' falls back to the theme color
        textColor: "", // premium — '' falls back to the default colors
      };

  const heading = effectiveProps.headingShow ? (
    <h2 style={headingStyle(effectiveProps)}>{effectiveProps.headingText}</h2>
  ) : null;

  // Background color is premium — free plans render transparent.
  const effectiveBgColor = isPremium ? bgColor : "";
  const rootStyle = effectiveBgColor
    ? {
        ...styles.root,
        background: effectiveBgColor,
        padding: "16px",
        borderRadius: "12px",
      }
    : styles.root;

  // While loading, render the heading (instant — no data needed) plus shimmering
  // card placeholders so the widget reserves its space instead of showing an
  // empty gap until the products arrive.
  if (loading) {
    return (
      <div style={rootStyle}>
        {heading}
        <Skeleton props={effectiveProps} />
        {!isPremium && (
          <div style={styles.watermarkWrap}>
            <Watermark />
          </div>
        )}
      </div>
    );
  }

  // No history AND no featured products (store has none) — show just the caption.
  if (items.length === 0) {
    return (
      <div style={styles.root}>
        {heading}
        <p style={styles.message}>
          {effectiveProps.emptyText || EMPTY_MESSAGE}
        </p>
      </div>
    );
  }

  // When showing featured products (not real history), show the editable caption
  // above them as a nudge.
  const showFallbackCaption = isFallback;

  return (
    <div style={rootStyle}>
      {heading}
      {showFallbackCaption && !previewItem && (
        <p style={styles.caption}>
          {effectiveProps.emptyText || EMPTY_MESSAGE}
        </p>
      )}
      {previewItem ? (
        // Inline detail view replaces the grid until the visitor clicks Back.
        // In the editor preview navigation is impossible, so the "View Product"
        // button is hidden (a note is shown); on the published site it navigates.
        <ProductDetail
          item={previewItem}
          onBack={() => setPreviewItem(null)}
          onViewProduct={isEditor ? undefined : handleViewProduct}
        />
      ) : effectiveProps.layout === "strip" ? (
        <StripView
          items={items}
          props={effectiveProps}
          onNavigate={handleSelect}
        />
      ) : (
        <ProGalleryView
          items={items}
          props={effectiveProps}
          onNavigate={handleSelect}
        />
      )}
      {!isPremium && (
        <div style={styles.watermarkWrap}>
          <Watermark />
        </div>
      )}
    </div>
  );
};

export default RecentlyViewedWidget;
