import { useCallback, useEffect, useRef, useState, type FC } from 'react';
import { window as siteWindow } from '@wix/site-window';
import type { RecentlyViewedItem, WidgetProps } from '../types';
import { readTrackedSlugs, fetchRecentlyViewed, fetchDefaultProducts } from './products';
import { ProGalleryView } from './proGalleryView';
import { StripView } from './ui/stripView';
import { Watermark } from './ui/watermark';
import { ProductDetail } from './ui/productModal';
import { EMPTY_MESSAGE, FREE_LAYOUTS, FREE_RATIOS, FREE_TEXT_POSITIONS } from '../constants';
import { styles, headingStyle } from './styles/widget';

// Site-facing widget — renders the visitor's recently-viewed products with the
// real Wix Pro Gallery. `behavior` controls the empty state; in the
// editor/preview it falls back to sample products (the original showDefault()).
export const RecentlyViewedWidget: FC<WidgetProps> = (props) => {
  const { behavior, isPremium, bgColor } = props;
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditor, setIsEditor] = useState(false);
  const [previewItem, setPreviewItem] = useState<RecentlyViewedItem | null>(null);
  const locationRef = useRef<{ to: (url: string) => Promise<void> } | null>(null);

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
        const mod = await import('@wix/site-location');
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

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const mode = await siteWindow.viewMode().catch(() => 'Site');
      const editor = mode === 'Editor' || mode === 'Preview';
      if (cancelled) return;
      setIsEditor(editor);

      try {
        let result = await fetchRecentlyViewed(readTrackedSlugs());
        if (result.length === 0 && editor) {
          result = await fetchDefaultProducts();
        }
        if (!cancelled) setItems(result);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    const onNav = () => void load();
    window.addEventListener('popstate', onNav);
    return () => {
      cancelled = true;
      window.removeEventListener('popstate', onNav);
    };
  }, []);

  if (loading) return null;

  // Strip & Grid are the only free layouts; Square/Landscape ratios and
  // Below/On-image text positions are premium — enforce them at render time so a
  // free plan can't show a premium option saved during a previous premium
  // session. Heading/text COLOR is premium too (the rest of Text is free).
  const effectiveProps: WidgetProps = isPremium
    ? props
    : {
        ...props,
        layout: FREE_LAYOUTS.includes(props.layout) ? props.layout : FREE_LAYOUTS[0],
        ratio: FREE_RATIOS.includes(props.ratio) ? props.ratio : FREE_RATIOS[0],
        textPosition: FREE_TEXT_POSITIONS.includes(props.textPosition)
          ? props.textPosition
          : FREE_TEXT_POSITIONS[0],
        headingColor: '', // premium — '' falls back to the theme color
        textColor: '', // premium — '' falls back to the default colors
      };

  const heading = effectiveProps.headingShow ? (
    <h2 style={headingStyle(effectiveProps)}>{effectiveProps.headingText}</h2>
  ) : null;

  if (items.length === 0) {
    if (!isEditor && behavior !== 'text') return null;
    return (
      <div style={styles.root}>
        {heading}
        <p style={styles.message}>{EMPTY_MESSAGE}</p>
      </div>
    );
  }

  // Background color is premium — free plans render transparent.
  const effectiveBgColor = isPremium ? bgColor : '';
  const rootStyle = effectiveBgColor
    ? { ...styles.root, background: effectiveBgColor, padding: '16px', borderRadius: '12px' }
    : styles.root;

  return (
    <div style={rootStyle}>
      {heading}
      {previewItem ? (
        // Inline detail view replaces the grid until the visitor clicks Back.
        // In the editor preview navigation is impossible, so the "View Product"
        // button is hidden (a note is shown); on the published site it navigates.
        <ProductDetail
          item={previewItem}
          onBack={() => setPreviewItem(null)}
          onViewProduct={isEditor ? undefined : handleViewProduct}
        />
      ) : effectiveProps.layout === 'strip' ? (
        <StripView items={items} props={effectiveProps} onNavigate={handleSelect} />
      ) : (
        <ProGalleryView items={items} props={effectiveProps} onNavigate={handleSelect} />
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
