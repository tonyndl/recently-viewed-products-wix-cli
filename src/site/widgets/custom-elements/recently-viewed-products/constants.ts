// Widget tag + prop names. HTML attributes are lower-cased, so every prop
// the panel sets via `widget.setProp` must use an all-lowercase name here.
export const TAG_NAME = "recently-viewed-products";

// Gallery-customization props (recreating the ProGallery Layout/Items controls)
// plus `behavior` (empty state) and the premium flag (watermark).
export const PROP = {
  layout: "layout",
  columns: "columns",
  spacing: "spacing",
  ratio: "ratio",
  showTitle: "showtitle",
  showPrice: "showprice",
  textPosition: "textposition",
  cornerRadius: "cornerradius",
  imageBorder: "imageborder",
  hoverEffect: "hovereffect",
  bgColor: "bgcolor",
  behavior: "behavior",
  emptyText: "emptytext",
  isPremium: "ispremium",
  // Text settings
  headingText: "headingtext",
  headingShow: "headingshow",
  headingSize: "headingsize",
  headingColor: "headingcolor",
  headingAlign: "headingalign",
  textSize: "textsize",
  textColor: "textcolor",
} as const;

export type LayoutKind =
  | "strip"
  | "grid"
  | "masonry"
  | "collage"
  | "thumbnails"
  | "slider"
  | "slideshow"
  | "column"
  | "bricks"
  | "mix"
  | "alternate";
export type RatioKind = "square" | "portrait" | "landscape" | "original";
export type TextPosition = "below" | "top" | "onimage";
export type HoverEffect = "none" | "zoom" | "fade";
export type EmptyBehavior = "hide" | "text";
export type TextAlign = "left" | "center" | "right";

// Every layout the Style picker offers, with the copy shown beneath it. Order
// here drives the dropdown order. These map to Pro Gallery layout presets in
// proGalleryView.tsx (the preset fills in each layout's full behavior).
export const LAYOUT_OPTIONS: {
  id: LayoutKind;
  value: string;
  description: string;
}[] = [
  {
    id: "strip",
    value: "Strip",
    description: "Products show in a single horizontal row that scrolls.",
  },
  {
    id: "grid",
    value: "Grid",
    description: "Equal-sized products arranged in a clean grid.",
  },
  {
    id: "masonry",
    value: "Masonry",
    description: "Products of varying heights packed together.",
  },
  {
    id: "collage",
    value: "Collage",
    description: "Mixed sizes arranged in a dynamic collage.",
  },
  {
    id: "thumbnails",
    value: "Thumbnails",
    description: "One large product with a thumbnail strip.",
  },
  {
    id: "slider",
    value: "Slider",
    description: "A swipeable row of products with arrows.",
  },
  {
    id: "slideshow",
    value: "Slideshow",
    description: "One product at a time, full-width.",
  },
  {
    id: "column",
    value: "Column",
    description: "Products stacked in a single vertical column.",
  },
  {
    id: "bricks",
    value: "Bricks",
    description: "Products laid out like a brick wall.",
  },
  {
    id: "mix",
    value: "Mix",
    description: "A blend of grid and collage styles.",
  },
  {
    id: "alternate",
    value: "Alternate",
    description: "Products alternating in an offset pattern.",
  },
];

// All valid layout values, derived from LAYOUT_OPTIONS — used to validate the
// raw attribute both in the panel and the custom element.
export const LAYOUT_KINDS = LAYOUT_OPTIONS.map(
  (o) => o.id,
) as readonly LayoutKind[];

// Layouts where the "Columns" control is meaningful. Other layouts derive their
// structure from the Pro Gallery preset, so the control is hidden for them.
export const LAYOUTS_WITH_COLUMNS: readonly LayoutKind[] = ["grid", "masonry"];

// Width of each item in the horizontally-scrolling Strip layout.
export const STRIP_ITEM_WIDTH = 170;

// Layouts available on the free plan. Every other layout is premium; the first
// free layout is the fallback for free users.
export const FREE_LAYOUTS: readonly LayoutKind[] = ["strip", "grid"];

// Image ratios available on the free plan (in display order). Square & Landscape
// are premium. Order matters — the first free ratio is the fallback for free
// users and the default.
export const FREE_RATIOS: readonly RatioKind[] = ["original", "portrait"];

// Text positions available on the free plan. Below & On image are premium; the
// first free value is the fallback for free users and the default.
export const FREE_TEXT_POSITIONS: readonly TextPosition[] = ["top"];

// Default gallery heading, matching the reference app. Used as the fallback
// when the user hasn't customized the heading text.
export const HEADING = "Recently Viewed Products";

// Default empty-state message shown when behavior === 'text' (editable per widget
// via the `emptyText` prop).
export const EMPTY_MESSAGE = "No recently viewed products yet.";

export const DEFAULTS = {
  layout: "strip" as LayoutKind,
  columns: 0, // 0 = auto (responsive)
  spacing: 16,
  ratio: "original" as RatioKind,
  showTitle: true,
  showPrice: true,
  textPosition: "top" as TextPosition,
  cornerRadius: 8,
  imageBorder: false,
  hoverEffect: "zoom" as HoverEffect,
  bgColor: "", // empty = transparent (use the widget's native Fill)
  behavior: "hide" as EmptyBehavior,
  emptyText: EMPTY_MESSAGE,
  isPremium: false,
  // Text settings — empty color string means "use the theme/default color".
  headingText: HEADING,
  headingShow: true,
  headingSize: 22,
  headingColor: "",
  headingAlign: "center" as TextAlign,
  textSize: 14,
  textColor: "",
};

// Watermark link shown to free-plan users — the Purple App Market developer page.
export const WATERMARK_URL = "https://www.wix.com/app-market/developer/purple";

// Square Purple logo (PNG data-URI) shown next to a "POWERED BY" label.
// Sourced from WIX_BASE_PROJECT/docs/check-plan-in-panel.md (the canonical watermark).
export const WATERMARK_LOGO =
  "data:image/png;base64,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AQCIIFwBAIggXAEAiCBcAQCIIFwBAIggXAEAiCBcAQCIIFwBAIggXAEAiCBcAQCIIFwBAIggXAEAiCBcAQCIIFwBAIggXAEAiCBcAQCIIFwBAIggXAEAiCBcAQCIIFwBAIggXAEAiCBcAQCIIFwBAIggXAEAiCBcAQCIIFwBAIggXAEAiCBcAQCIIFwBAIggXAEAiCBcAQCIIFwBAIggXAEAiCBcAQCIIFwBAIggXAEAiCBcAQCIIFwBAIggXAEAiCBcAQCIIFwBAIggXAEAiCBcAQCIIFwBAIggXAEAiCBcAQCIIFwBAIggXAEAiCBcAQCIIFwBAIggXAEAiCBcAQCIIFwBAIggXAEAiCBcAQCIIFwBAIggXAEAiCBcAQCIIFwBAIggXAEAiCBcAQCIIFwBAIggXAEAiCBcAQCIIFwBAIggXAEAiCBcAQCIIFwBAIggXAEAiCBcAQCIIFwBAIggXAEAiCBcAQCIIFwBAIggXAEAiCBcAQCIIFwBAIggXAEAiCBcAQCIIFwBAIggXAEAiCBcAQCIIFwBAIggXAEAiCBcAQCIIFwBAIggXAEAiCBcAQCIIFwBAIggXAEAiCBcAQCIIFwBAIggXAEAiCBcAQCIIFwBAIggXAEAiCBcAQCIIFwBAIggXAEAiCBcAQCIIFwBAIhwZ+gFALfD1172fzc32ddfHg29BOAW8DcJMBd//4/fGHoJAIQzKgAAQAThCgBABOEKAEAE4QoAQAThCgBABOEKAEAE4QoAQAThCgBABOEKAEAE4QoAQAThCgBABOEKAEAE4QoAQAThCgBABOEKAEAE4QoAQAThCgBABOEKAEAE4QoAQAThCgBABOEKAEAE4QoAQAThCgBABOEKAEAE4QoAQAThCgBABOEKAEAE4QoAQAThCgBABOEKAEAE4QoAQAThCgBABOEKAEAE4QoAQAThCgBABOEKAEAE4QoAQAThCgBABOEKAEAE4QoAQAThCgBABOEKAEAE4QoAQAThCgBABOEKAEAE4QoAQAThCgBABOEKAEAE4QoAQAThCgBABOEKAEAE4QoAQAThCgBABOEKAEAE4QoAQAThCgBABOEKAEAE4QoAQAThCgBABOEKAEAE4QoAQAThCgBABOEKAEAE4QoAQAThCgBABOEKAEAE4QoAQAThCgBABOEKAEAE4QoAQAThCgBABOEKAEAE4QoAQAThCgBABOEKAEAE4QoAQAThCgBABOEKAEAE4QoAQAThCgBABOEKAEAE4QoAQAThCgBABOEKAEAE4QoAQAThCgBABOEKAEAE4QoAQAThCgBABOEKAEAE4QoAQAThCgBABOEKAEAE4QoAQAThCgBABOEKAEAE4QoAQAThCgBABOEKAEAE4QoAQAThCgBABOEKAEAE4QoAQAThCgBABOEKAEAE4QoAQAThCgBABOEKAEAE4QoAQAThCgBABOEKAEAE4QoAQAThCgBABOEKAEAE4QoAQAThCgBABOEKAEAE4QoAQAThCgBABOEKAEAE4QoAQIQ7Qy8AuB1+/E+/G3oJwBV88dsnQy8BhCswHz/+oXAF4GqMCgAAEEG4AgAQQbgCABBBuAIAEEG4AgAQQbgCABBBuAIAEEG4AgAQQbgCABBBuAIAEEG4AgAQQbgCABBBuAIAEEG4AgAQQbgCABBBuAIAEEG4AgAQQbgCABBBuAIAEEG4AgAQQbgCABBBuAIAEEG4AgAQQbgCABBBuAIAEEG4AgAQQbgCABBBuAIAEEG4AgAQQbgCABBBuAIAEEG4AgAQQbgCABBBuAIAEEG4AgAQQbgCABBBuAIAEEG4AgAQQbgCABBBuAIAEEG4AgAQQbgCABBBuAIAEEG4AgAQQbgCABBBuAIAEEG4AgAQQbgCABBBuAIAEEG4AgAQQbgCABBBuAIAEEG4AgAQQbgCABBBuAIAEEG4AgAQQbgCABBBuAIAEEG4AgAQQbgCABBBuAIAEEG4AgAQQbgCABBBuAIAEEG4AgAQQbgCABBBuAIAEEG4AgAQQbgCABBBuAIAEEG4AgAQQbgCABBBuAIAEEG4AgAQQbgCABBBuAIAEEG4AgAQQbgCABBBuAIAEEG4AgAQQbgCABBBuAIAEEG4AgAQQbgCABBBuAIAEEG4AgAQQbgCABBBuAIAEEG4AgAQQbgCABBBuAIAEEG4AgAQQbgCABBBuAIAEEG4AgAQQbgCABBBuAIAEEG4AgAQQbgCABBBuAIAEEG4AgAQQbgCABBBuAIAEEG4AgAQQbgCABBBuAIAEEG4AgAQQbgCABBBuAIAEEG4AgAQQbgCABBBuAIAEEG4AgAQQbgCABBBuAIAEEG4AgAQQbgCABBBuAIAEEG4AgAQQbgCABBBuAIAEOHO0AuAXT/86L+GXgIAsOB2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";
