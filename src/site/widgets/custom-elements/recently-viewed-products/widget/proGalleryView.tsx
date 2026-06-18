import { useEffect, useMemo, useRef, useState, type CSSProperties, type FC } from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - pro-gallery ships loose types
import { ProGallery, GALLERY_CONSTS } from 'pro-gallery';
import 'pro-gallery/dist/statics/main.css';
import type { RecentlyViewedItem, WidgetProps } from '../types';
import { STRIP_ITEM_WIDTH, LAYOUTS_WITH_COLUMNS, type LayoutKind } from '../constants';

// GALLERY_CONSTS is loosely typed — alias to any for ergonomic enum access.
const C = GALLERY_CONSTS as any;
const Gallery = ProGallery as any;

// Typography for the product name/price text, from the Text settings.
interface TextStyleOpts {
  textSize: number;
  textColor: string; // '' = default colors
}

// Pro Gallery's core renders NO title/description text on its own — it only
// shows an info element when the host supplies `customInfoRenderer`. This one
// renders the product name + price; styling adapts to where Pro Gallery places
// it (OVERLAY on the image vs BELOW it).
const renderItemInfo = (itemProps: any, placement: string, ts: TextStyleOpts) => {
  const title: string = itemProps?.title || '';
  const price: string = itemProps?.description || '';
  if (!title && !price) return null;
  const onImage = placement === C.layoutParams_info_placement.OVERLAY;
  const nameStyle: CSSProperties = {
    margin: 0,
    fontSize: `${ts.textSize}px`,
    fontWeight: 500,
    // On-image text stays light for contrast against the gradient; below/above
    // honors the chosen text color (or the theme default when unset).
    color: onImage ? '#fff' : ts.textColor || 'var(--wix-color-text, #2b2b2b)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };
  const priceStyle: CSSProperties = {
    margin: '2px 0 0 0',
    fontSize: `${Math.max(10, ts.textSize - 1)}px`,
    color: onImage
      ? 'rgba(255,255,255,0.9)'
      : ts.textColor || 'var(--wix-color-text-secondary, #6b6b6b)',
  };
  const text = (
    <>
      {title ? <p style={nameStyle}>{title}</p> : null}
      {price ? <p style={priceStyle}>{price}</p> : null}
    </>
  );
  // OVERLAY: Pro Gallery's hover element fills the whole image, so we pin the
  // caption to the bottom with our own gradient (the rest of the image stays
  // clear). BELOW: a simple text strip under the image.
  if (onImage) {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            boxSizing: 'border-box',
            width: '100%',
            padding: '20px 10px 10px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0))',
          }}
        >
          {text}
        </div>
      </div>
    );
  }
  const above = placement === C.layoutParams_info_placement.ABOVE;
  return (
    <div style={{ boxSizing: 'border-box', width: '100%', padding: above ? '0 2px 8px' : '8px 2px 0' }}>
      {text}
    </div>
  );
};

// BELOW info goes through customInfoRenderer; OVERLAY (on-image) info goes
// through customHoverRenderer — Pro Gallery uses different slots for each. Built
// per-render so the renderers capture the current text size/color.
const makeCustomComponents = (ts: TextStyleOpts) => ({
  customInfoRenderer: (itemProps: any, placement: string) =>
    renderItemInfo(itemProps, placement, ts),
  customHoverRenderer: (itemProps: any) =>
    renderItemInfo(itemProps, C.layoutParams_info_placement.OVERLAY, ts),
});

// Space-filling mosaic layouts pack tiles edge-to-edge with no room for text
// below each item, so their name/price must render on the image instead.
const OVERLAY_ONLY_LAYOUTS: readonly LayoutKind[] = ['collage', 'bricks', 'mix', 'alternate'];

const RATIO_VAL: Record<WidgetProps['ratio'], number> = {
  square: 1,
  portrait: 0.75,
  landscape: 4 / 3,
  original: 1,
};

// Each Style maps to a Pro Gallery layout preset. Setting `galleryLayout` makes
// the library apply that preset's full behavior (scroll direction, navigation,
// crop, spacing, etc.) on top of the generic options below. "Strip" reuses the
// GRID preset but is forced into a single horizontal scrolling row.
const LAYOUT_PRESET: Record<LayoutKind, string> = {
  strip: 'GRID',
  grid: 'GRID',
  masonry: 'MASONRY',
  collage: 'COLLAGE',
  thumbnails: 'THUMBNAIL',
  slider: 'SLIDER',
  slideshow: 'SLIDESHOW',
  column: 'COLUMN',
  bricks: 'BRICKS',
  mix: 'MIX',
  alternate: 'ALTERNATE',
};

const buildOptions = (p: WidgetProps): Record<string, unknown> => {
  const isStrip = p.layout === 'strip';
  const usesColumns = LAYOUTS_WITH_COLUMNS.includes(p.layout) && p.columns > 0;
  // Draw the name/price on the image when the user picks "on image", or when the
  // layout is a space-filling mosaic that has no room for text below each tile.
  const useOverlay = p.textPosition === 'onimage' || OVERLAY_ONLY_LAYOUTS.includes(p.layout);
  const o: Record<string, unknown> = {
    layoutParams_structure_galleryLayout:
      C.layoutParams_structure_galleryLayout[LAYOUT_PRESET[p.layout]],
    layoutParams_structure_scrollDirection: isStrip
      ? C.layoutParams_structure_scrollDirection.HORIZONTAL
      : C.layoutParams_structure_scrollDirection.VERTICAL,
    layoutParams_structure_itemSpacing: p.spacing,
    layoutParams_crop_enable: p.ratio !== 'original',
    layoutParams_crop_method:
      // Staggered layouts (Masonry/Collage) rely on FILL to crop square products
      // into varied cells, so they always fill regardless of the Image-fit setting.
      p.imageFit === 'fit' && !STAGGER_LAYOUTS.includes(p.layout)
        ? C.layoutParams_crop_method.FIT
        : C.layoutParams_crop_method.FILL,
    layoutParams_crop_ratios: [RATIO_VAL[p.ratio]],
    // Render the title/price text. Without an explicit info layout + a fixed
    // pixel height the info element collapses and nothing shows. OVERLAY draws
    // the text on the image (always visible, our own gradient); BELOW is a plain
    // text strip under it. Mosaic layouts have no room below, so they overlay.
    layoutParams_info_placement: useOverlay
      ? C.layoutParams_info_placement.OVERLAY
      : p.textPosition === 'top'
        ? C.layoutParams_info_placement.ABOVE
        : C.layoutParams_info_placement.BELOW,
    // Our renderer supplies its own background/gradient, so use NO_BACKGROUND.
    layoutParams_info_layout: C.layoutParams_info_layout.NO_BACKGROUND,
    layoutParams_info_sizeUnits: C.layoutParams_info_sizeUnits.PIXEL,
    // Reserve enough height for the (text-size-driven) name + price lines.
    // Matches the previous 56 / 32 at the default text size of 14.
    layoutParams_info_height:
      (p.showTitle ? p.textSize + 10 : 0) + (p.showPrice ? p.textSize + 8 : 0) + 10,
    behaviourParams_item_overlay_hoveringBehaviour: useOverlay
      ? C.behaviourParams_item_overlay_hoveringBehaviour.ALWAYS_SHOW
      : C.behaviourParams_item_overlay_hoveringBehaviour.NEVER_SHOW,
    // Keep Pro Gallery's own overlay fill transparent — the renderer above pins
    // a gradient caption to the bottom and leaves the rest of the image clear.
    // (This option is a plain color STRING, not a { value } object — the default
    // is an opaque dark scrim 'rgba(8,8,8,0.75)' that would darken the image.)
    behaviourParams_item_overlay_backgroundColor: 'rgba(0, 0, 0, 0)',
    // ACTION (not LINK): emit ITEM_ACTION_TRIGGERED on click so we route through
    // Wix's router (location.to) instead of pro-gallery's <a href>, which would
    // resolve the product path against the parastorage preview origin (403).
    behaviourParams_item_clickAction: C.behaviourParams_item_clickAction.ACTION,
    behaviourParams_item_content_hoverAnimation:
      p.hoverEffect === 'zoom'
        ? C.behaviourParams_item_content_hoverAnimation.ZOOM_IN
        : p.hoverEffect === 'fade'
          ? C.behaviourParams_item_content_hoverAnimation.DARKENED
          : C.behaviourParams_item_content_hoverAnimation.NO_EFFECT,
    stylingParams_itemBorderRadius: p.cornerRadius,
    stylingParams_itemBorderWidth: p.imageBorder ? 1 : 0,
    stylingParams_itemBorderColor: { value: '#e3e3e3' },
    // Navigation arrows — small, faint chevrons sitting on the far-end images
    // (no button container), centered on the image. They're subtle so they don't
    // distract from the products.
    layoutParams_navigationArrows_size: 16,
    layoutParams_navigationArrows_padding: 12,
    layoutParams_navigationArrows_container_type:
      C.layoutParams_navigationArrows_container_type.NONE,
    layoutParams_navigationArrows_position:
      C.layoutParams_navigationArrows_position.ON_GALLERY,
    layoutParams_navigationArrows_verticalAlignment:
      C.layoutParams_navigationArrows_verticalAlignment.IMAGE_CENTER,
    stylingParams_arrowsColor: { value: 'rgba(0, 0, 0, 0.4)' },
    // Don't loop — so Pro Gallery hides the left arrow at the start and the
    // right arrow once the end is reached, instead of always showing both.
    behaviourParams_gallery_horizontal_loop: false,
  };

  // Pinterest-style masonry packs items into fixed-width VERTICAL columns so
  // they vary in height. Without this the masonry preset defaults to HORIZONTAL
  // and justifies each row to one height (equal heights, varied widths) — which
  // looks like a grid.
  if (p.layout === 'masonry') {
    o.layoutParams_structure_layoutOrientation =
      C.layoutParams_structure_layoutOrientation.VERTICAL;
  }

  // A target item size only takes effect when its unit is PIXEL — otherwise the
  // preset's "smart" size wins (e.g. Masonry multiplies it to ~1700px, which
  // collapses the gallery to a single column).
  if (isStrip) {
    o.layoutParams_structure_numberOfGridRows = 1;
    o.layoutParams_structure_responsiveMode = C.layoutParams_structure_responsiveMode.FIT_TO_SCREEN;
    o.layoutParams_targetItemSize_value = STRIP_ITEM_WIDTH;
  } else if (usesColumns) {
    o.layoutParams_structure_responsiveMode = C.layoutParams_structure_responsiveMode.SET_ITEMS_PER_ROW;
    o.layoutParams_structure_numberOfColumns = p.columns;
  } else if (p.layout === 'collage') {
    // Collage builds its mosaic — large feature tiles mixed with smaller ones —
    // from its own smart sizing. Forcing a fixed pixel size flattens every tile
    // to the same width and it collapses into a Masonry-like grid, so we let the
    // preset choose the target size and keep its group types intact.
    o.layoutParams_structure_responsiveMode = C.layoutParams_structure_responsiveMode.FIT_TO_SCREEN;
  } else {
    // Grid/Masonry on Auto, plus the other preset-driven layouts (slider,
    // slideshow, thumbnails, column, bricks, mix, alternate). The preset
    // overrides whatever it needs; this just sets a sensible column width.
    o.layoutParams_structure_responsiveMode = C.layoutParams_structure_responsiveMode.FIT_TO_SCREEN;
    o.layoutParams_targetItemSize_unit = C.layoutParams_targetItemSize_unit.PIXEL;
    o.layoutParams_targetItemSize_value = 220;
  }
  return o;
};

// Vertical layouts self-size from a 0 starting height (the gallery reports its
// real height via GALLERY_CHANGE), so they avoid the big empty box on first
// paint. Horizontal layouts (slider/slideshow) and thumbnails can't lay out in a
// zero-height viewport, so they get a modest seed height that GALLERY_CHANGE then
// corrects to the true value.
const SEED_HEIGHT: Partial<Record<LayoutKind, number>> = {
  slider: 320,
  slideshow: 320,
  thumbnails: 320,
};

type SizeMap = Record<string, { width: number; height: number }>;

const itemKey = (it: RecentlyViewedItem) => it.id || it.slug;

// Layouts that need a synthetic stagger: they build their varied look from each
// image's aspect ratio (cropping off), so square product photos collapse them
// into a plain grid. We give near-square items rotating ratios instead.
const STAGGER_LAYOUTS: readonly LayoutKind[] = ['masonry'];

// Rotating aspect ratios (width / height) used to stagger square images — a mix
// of portrait, square and landscape so cells end up at different heights, like
// the native Masonry/Collage previews.
const STAGGER_RATIOS = [0.72, 1.35, 0.95, 1.55, 0.82, 1.2, 0.68, 1.45];

const isNearSquare = (w: number, h: number) => w > 0 && h > 0 && Math.abs(w / h - 1) <= 0.15;

// Resolve the width/height we declare to the gallery for an item. Order of
// preference: measured natural size → catalog size → square fallback. For
// staggered Masonry, near-square images get a rotating ratio instead so the
// layout varies (FILL then crops their margins); genuinely non-square images
// keep their real ratio so true masonry still works.
const displaySize = (
  it: RecentlyViewedItem,
  sizes: SizeMap,
  index: number,
  stagger: boolean,
): { width: number; height: number } => {
  const measured = sizes[itemKey(it)];
  const width = measured?.width || (it.width && it.width > 0 ? it.width : 1000);
  const height = measured?.height || (it.height && it.height > 0 ? it.height : 1000);
  if (stagger && isNearSquare(width, height)) {
    const ratio = STAGGER_RATIOS[index % STAGGER_RATIOS.length];
    return { width: 1000, height: Math.round(1000 / ratio) };
  }
  return { width, height };
};

const toGalleryItems = (
  items: RecentlyViewedItem[],
  sizes: SizeMap,
  layout: LayoutKind,
  showTitle: boolean,
  showPrice: boolean,
) => {
  const stagger = STAGGER_LAYOUTS.includes(layout);
  return items.map((it, index) => {
    const { width, height } = displaySize(it, sizes, index, stagger);
    return {
      itemId: itemKey(it),
      mediaUrl: it.imageUrl,
      metaData: {
        type: 'image',
        height,
        width,
        title: showTitle ? it.name : '',
        description: showPrice ? it.formattedPrice : '',
        ...(it.productUrl ? { link: { url: it.productUrl, target: '_self' } } : {}),
      },
    };
  });
};

// Measure each image's natural size in the browser so layouts that depend on
// aspect ratio render correctly even when the catalog doesn't report dimensions.
// Items that already have dimensions are skipped; a timeout guards against a
// slow/broken image blocking the gallery indefinitely.
const useNaturalSizes = (items: RecentlyViewedItem[]): SizeMap | null => {
  const [sizes, setSizes] = useState<SizeMap | null>(null);

  useEffect(() => {
    let cancelled = false;
    const pending = items.filter((it) => it.imageUrl && !(it.width && it.height));
    if (pending.length === 0) {
      setSizes({});
      return;
    }

    const measured: SizeMap = {};
    let done = 0;
    const finish = () => {
      if (!cancelled) setSizes({ ...measured });
    };
    const timer = setTimeout(finish, 2000);

    pending.forEach((it) => {
      const img = new window.Image();
      const onDone = () => {
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          measured[itemKey(it)] = { width: img.naturalWidth, height: img.naturalHeight };
        }
        done += 1;
        if (done === pending.length) {
          clearTimeout(timer);
          finish();
        }
      };
      img.onload = onDone;
      img.onerror = onDone;
      img.src = it.imageUrl;
    });

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [items]);

  return sizes;
};

interface ProGalleryViewProps {
  items: RecentlyViewedItem[];
  props: WidgetProps;
  onNavigate?: (item: RecentlyViewedItem) => void;
}

// Renders the real Wix Pro Gallery. Pro Gallery needs an explicit container
// size, so we measure the host width (ResizeObserver) and read the laid-out
// height from its GALLERY_CHANGE event to auto-fit.
export const ProGalleryView: FC<ProGalleryViewProps> = ({ items, props, onNavigate }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(SEED_HEIGHT[props.layout] ?? 0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const sizes = useNaturalSizes(items);
  const galleryItems = useMemo(
    () => toGalleryItems(items, sizes ?? {}, props.layout, props.showTitle, props.showPrice),
    [items, sizes, props.layout, props.showTitle, props.showPrice],
  );
  const options = useMemo(() => buildOptions(props), [props]);
  const customComponents = useMemo(
    () => makeCustomComponents({ textSize: props.textSize, textColor: props.textColor }),
    [props.textSize, props.textColor],
  );

  // Map each gallery itemId back to its item so a click can be routed through
  // Wix's router (onNavigate → location.to) instead of pro-gallery's own <a
  // href>, which resolves against the parastorage preview origin (403).
  const itemById = useMemo(() => {
    const m = new Map<string, RecentlyViewedItem>();
    items.forEach((it) => m.set(itemKey(it), it));
    return m;
  }, [items]);

  const eventsListener = (eventName: string, eventData: any) => {
    if (eventName === C.events.GALLERY_CHANGE && eventData) {
      const h = eventData.layoutHeight ?? eventData.height ?? eventData.scrollHeight;
      if (typeof h === 'number' && h > 0 && Math.abs(h - height) > 1) {
        setHeight(Math.ceil(h));
      }
      return;
    }
    if (eventName === C.events.ITEM_ACTION_TRIGGERED || eventName === C.events.ITEM_CLICKED) {
      const item = itemById.get(eventData?.id ?? eventData?.itemId ?? '');
      if (item) onNavigate?.(item);
    }
  };

  // Wait for the host width and the natural-size measurement before laying out,
  // so the gallery never renders with the square fallback and then reflows.
  return (
    <div ref={ref}>
      {width > 0 && sizes !== null && (
        <Gallery
          items={galleryItems}
          options={options}
          container={{ width, height }}
          scrollingElement={typeof window !== 'undefined' ? window : undefined}
          eventsListener={eventsListener}
          customComponents={customComponents}
        />
      )}
    </div>
  );
};
