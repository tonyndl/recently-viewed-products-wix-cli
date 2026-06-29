import type {
  LayoutKind,
  RatioKind,
  TextPosition,
  HoverEffect,
  TextAlign,
} from "./constants";

// A single product rendered in the gallery.
export interface RecentlyViewedItem {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  productUrl: string; // relative path, e.g. /product-page/<slug> — used by location.to()
  productUrlAbsolute?: string; // absolute URL — used to open in a new tab in preview
  formattedPrice: string;
  description?: string; // plain-text product description (shown in the detail panel)
  // Natural image dimensions, when the catalog provides them. Drive the varied
  // look of Masonry/Collage/Bricks/Mix/Alternate; default to square if absent.
  width?: number;
  height?: number;
}

// Props the widget receives (already parsed from string attributes).
export interface WidgetProps {
  layout: LayoutKind;
  columns: number; // 0 = auto
  spacing: number;
  ratio: RatioKind;
  showTitle: boolean;
  showPrice: boolean;
  textPosition: TextPosition;
  cornerRadius: number;
  imageBorder: boolean;
  hoverEffect: HoverEffect;
  bgColor: string;
  emptyText: string; // empty-state caption text
  isPremium: boolean;
  // Text settings — heading typography + product name/price typography.
  headingText: string;
  headingShow: boolean;
  headingSize: number;
  headingColor: string; // '' = theme default
  headingAlign: TextAlign;
  textSize: number;
  textColor: string; // '' = default colors
}
