// Widget tag + prop names. HTML attributes are lower-cased, so every prop
// the panel sets via `widget.setProp` must use an all-lowercase name here.
export const TAG_NAME = 'recently-viewed-products';

// Gallery-customization props (recreating the ProGallery Layout/Items controls)
// plus `behavior` (empty state) and the premium flag (watermark).
export const PROP = {
  layout: 'layout',
  columns: 'columns',
  spacing: 'spacing',
  ratio: 'ratio',
  imageFit: 'imagefit',
  showTitle: 'showtitle',
  showPrice: 'showprice',
  textPosition: 'textposition',
  cornerRadius: 'cornerradius',
  imageBorder: 'imageborder',
  hoverEffect: 'hovereffect',
  bgColor: 'bgcolor',
  behavior: 'behavior',
  isPremium: 'ispremium',
  // Text settings
  headingText: 'headingtext',
  headingShow: 'headingshow',
  headingSize: 'headingsize',
  headingColor: 'headingcolor',
  headingAlign: 'headingalign',
  textSize: 'textsize',
  textColor: 'textcolor',
} as const;

export type LayoutKind =
  | 'strip'
  | 'grid'
  | 'masonry'
  | 'collage'
  | 'thumbnails'
  | 'slider'
  | 'slideshow'
  | 'column'
  | 'bricks'
  | 'mix'
  | 'alternate';
export type RatioKind = 'square' | 'portrait' | 'landscape' | 'original';
export type ImageFit = 'crop' | 'fit';
export type TextPosition = 'below' | 'top' | 'onimage';
export type HoverEffect = 'none' | 'zoom' | 'fade';
export type EmptyBehavior = 'hide' | 'text';
export type TextAlign = 'left' | 'center' | 'right';

// Every layout the Style picker offers, with the copy shown beneath it. Order
// here drives the dropdown order. These map to Pro Gallery layout presets in
// proGalleryView.tsx (the preset fills in each layout's full behavior).
export const LAYOUT_OPTIONS: { id: LayoutKind; value: string; description: string }[] = [
  { id: 'strip', value: 'Strip', description: 'Products show in a single horizontal row that scrolls.' },
  { id: 'grid', value: 'Grid', description: 'Equal-sized products arranged in a clean grid.' },
  { id: 'masonry', value: 'Masonry', description: 'Products of varying heights packed together.' },
  { id: 'collage', value: 'Collage', description: 'Mixed sizes arranged in a dynamic collage.' },
  { id: 'thumbnails', value: 'Thumbnails', description: 'One large product with a thumbnail strip.' },
  { id: 'slider', value: 'Slider', description: 'A swipeable row of products with arrows.' },
  { id: 'slideshow', value: 'Slideshow', description: 'One product at a time, full-width.' },
  { id: 'column', value: 'Column', description: 'Products stacked in a single vertical column.' },
  { id: 'bricks', value: 'Bricks', description: 'Products laid out like a brick wall.' },
  { id: 'mix', value: 'Mix', description: 'A blend of grid and collage styles.' },
  { id: 'alternate', value: 'Alternate', description: 'Products alternating in an offset pattern.' },
];

// All valid layout values, derived from LAYOUT_OPTIONS — used to validate the
// raw attribute both in the panel and the custom element.
export const LAYOUT_KINDS = LAYOUT_OPTIONS.map((o) => o.id) as readonly LayoutKind[];

// Layouts where the "Columns" control is meaningful. Other layouts derive their
// structure from the Pro Gallery preset, so the control is hidden for them.
export const LAYOUTS_WITH_COLUMNS: readonly LayoutKind[] = ['grid', 'masonry'];

// Width of each item in the horizontally-scrolling Strip layout.
export const STRIP_ITEM_WIDTH = 170;

// Layouts available on the free plan. Every other layout is premium; the first
// free layout is the fallback for free users.
export const FREE_LAYOUTS: readonly LayoutKind[] = ['strip', 'grid'];

// Image ratios available on the free plan (in display order). Square & Landscape
// are premium. Order matters — the first free ratio is the fallback for free
// users and the default.
export const FREE_RATIOS: readonly RatioKind[] = ['original', 'portrait'];

// Text positions available on the free plan. Below & On image are premium; the
// first free value is the fallback for free users and the default.
export const FREE_TEXT_POSITIONS: readonly TextPosition[] = ['top'];

// Default gallery heading, matching the reference app. Used as the fallback
// when the user hasn't customized the heading text.
export const HEADING = 'Recently Viewed Products';

export const DEFAULTS = {
  layout: 'strip' as LayoutKind,
  columns: 0, // 0 = auto (responsive)
  spacing: 16,
  ratio: 'original' as RatioKind,
  imageFit: 'crop' as ImageFit,
  showTitle: true,
  showPrice: true,
  textPosition: 'top' as TextPosition,
  cornerRadius: 8,
  imageBorder: false,
  hoverEffect: 'zoom' as HoverEffect,
  bgColor: '', // empty = transparent (use the widget's native Fill)
  behavior: 'hide' as EmptyBehavior,
  isPremium: false,
  // Text settings — empty color string means "use the theme/default color".
  headingText: HEADING,
  headingShow: true,
  headingSize: 22,
  headingColor: '',
  headingAlign: 'center' as TextAlign,
  textSize: 14,
  textColor: '',
};

// Watermark link shown to free-plan users (from the original watermark.js).
export const WATERMARK_URL = 'https://dub.sh/purple-wix-app';

// "Powered by Purple" badge — the official inline SVG from the Wix Blocks
// app custom element, encoded as a self-contained data-URI.
export const WATERMARK_LOGO =
  'data:image/svg+xml,%3Csvg%20preserveAspectRatio%3D%22xMidYMid%20meet%22%20data-bbox%3D%220%200%20180.312%2032%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20180.312%2032%22%20height%3D%2233%22%20width%3D%22180%22%20data-type%3D%22color%22%20role%3D%22presentation%22%20aria-hidden%3D%22true%22%20aria-label%3D%22%22%3E%3Cg%3E%3Cpath%20fill-opacity%3D%22.3%22%20fill%3D%22%23000000%22%20d%3D%22M180.312%204v24a4%204%200%200%201-4%204H4a4%204%200%200%201-4-4V4a4%204%200%200%201%204-4h172.312a4%204%200%200%201%204%204%22%20data-color%3D%221%22%3E%3C%2Fpath%3E%3Cpath%20fill%3D%22%23ffffff%22%20d%3D%22M15.888%2022H14.24V10.56h4.272q1.105%200%201.936.416a3.13%203.13%200%200%201%201.296%201.168q.465.736.464%201.744%200%20.992-.464%201.76a3.13%203.13%200%200%201-1.296%201.168q-.831.416-1.936.416h-2.624zm2.624-10.016h-2.624v3.824h2.624q.945%200%201.488-.512.544-.511.544-1.408%200-.895-.544-1.392-.543-.512-1.488-.512m8.711%2010.272q-1.183%200-2.112-.544a3.9%203.9%200%200%201-1.44-1.504q-.512-.96-.512-2.176%200-1.232.512-2.192a3.9%203.9%200%200%201%201.44-1.504q.912-.544%202.096-.544%201.2%200%202.112.544a3.76%203.76%200%200%201%201.44%201.504q.528.96.528%202.192%200%201.216-.528%202.176a3.8%203.8%200%200%201-1.424%201.504q-.912.544-2.112.544m0-1.376q1.073%200%201.728-.784.657-.8.656-2.064%200-1.28-.656-2.064-.655-.8-1.744-.8-1.056%200-1.712.8-.656.784-.656%202.064%200%201.264.656%202.064.657.784%201.728.784M41.632%2022h-1.664l-1.728-5.84L36.544%2022h-1.68l-2.336-7.952h1.6l1.632%206.224%201.792-6.224h1.44l1.792%206.256%201.648-6.256H44zm10.197-2.336.944%201.008a4.1%204.1%200%200%201-1.488%201.184q-.848.4-1.856.4-1.248%200-2.192-.544a3.87%203.87%200%200%201-1.456-1.504q-.528-.96-.528-2.176t.512-2.176a3.83%203.83%200%200%201%201.408-1.504%203.73%203.73%200%200%201%202.016-.56q1.087%200%201.92.544.832.528%201.296%201.472.48.945.48%202.16v.576h-5.952q.144%201.088.816%201.744.672.64%201.76.64%201.44%200%202.32-1.264m-2.656-4.544q-.896%200-1.504.624-.591.608-.72%201.648h4.32q-.096-1.056-.656-1.664-.544-.608-1.44-.608m10.322-1.2v1.504h-.336q-1.087%200-1.84.784-.752.768-.752%202.448V22h-1.6v-7.952h1.584v1.68q.384-1.008%201.136-1.408.768-.4%201.52-.4zm7.537%205.744.944%201.008a4.1%204.1%200%200%201-1.488%201.184q-.848.4-1.856.4-1.248%200-2.192-.544a3.87%203.87%200%200%201-1.456-1.504q-.528-.96-.528-2.176t.512-2.176%201.408-1.504a3.73%203.73%200%200%201%202.016-.56q1.089%200%201.92.544.832.528%201.296%201.472.48.945.48%202.16v.576h-5.952q.144%201.088.816%201.744.672.64%201.76.64%201.44%200%202.32-1.264m-2.656-4.544q-.895%200-1.504.624-.591.608-.72%201.648h4.32q-.095-1.056-.656-1.664-.543-.608-1.44-.608M76.186%2022v-1.152a2.9%202.9%200%200%201-1.104%201.024q-.687.384-1.584.384-1.072%200-1.936-.528a3.96%203.96%200%200%201-1.36-1.504q-.495-.96-.496-2.192%200-1.232.496-2.192a3.96%203.96%200%200%201%201.36-1.504%203.53%203.53%200%200%201%201.92-.544q.897%200%201.584.416.705.4%201.104%201.072v-4.8h1.6V22zm-4.8-3.968q0%20.832.304%201.488.321.64.864%201.008.56.368%201.28.368.816%200%201.44-.464.64-.48.896-1.232v-1.024q0-1.344-.672-2.176-.656-.832-1.712-.832-.704%200-1.248.368a2.46%202.46%200%200%200-.848%201.008q-.303.64-.304%201.488M85.473%2022h-1.584V10.48h1.6v4.864q.4-.72%201.104-1.136a3.2%203.2%200%200%201%201.632-.416q1.073%200%201.904.544a3.7%203.7%200%200%201%201.328%201.504q.496.96.496%202.192t-.512%202.192a3.8%203.8%200%200%201-1.36%201.504q-.847.528-1.92.528-.895%200-1.6-.384a2.96%202.96%200%200%201-1.088-1.024zm.016-3.824V19.2q.256.752.88%201.232.64.464%201.456.464.735%200%201.28-.368.56-.367.864-1.008a3.35%203.35%200%200%200%20.32-1.488q0-1.264-.656-2.064-.64-.8-1.696-.8-.704%200-1.264.384-.56.367-.88%201.056-.304.671-.304%201.568m13.67-4.128h1.617l-3.68%209.136q-.368.928-.944%201.424-.56.495-1.648.496h-.992V23.76h.944q.544%200%20.832-.24t.448-.72l.288-.768-3.216-7.984h1.68l2.32%206.288zM108.06%2022h-1.648V10.56h4.272q1.104%200%201.936.416.833.416%201.296%201.168.464.736.464%201.744%200%20.992-.464%201.76-.463.751-1.296%201.168-.832.416-1.936.416h-2.624zm2.624-10.016h-2.624v3.824h2.624q.944%200%201.488-.512.544-.511.544-1.408%200-.895-.544-1.392-.544-.512-1.488-.512m14.776-1.424v6.928q0%202.256-1.184%203.52-1.183%201.248-3.264%201.248t-3.28-1.248c-.789-.843-1.184-3.52-1.184-10.448h1.648v6.928q0%201.552.736%202.416.752.864%202.08.864t2.064-.864q.752-.864.752-2.416V10.56zm4.6%2011.44h-1.648V10.56h4.272q1.104%200%201.936.416.833.416%201.296%201.168t.464%201.744q0%201.248-.72%202.112t-1.936%201.12l3.744%204.88h-2.048l-3.536-4.768h-1.824zm2.624-10.016h-2.624v3.824h2.624q.944%200%201.488-.512.544-.511.544-1.408%200-.895-.544-1.392-.544-.512-1.488-.512M141.248%2022H139.6V10.56h4.272q1.104%200%201.936.416t1.296%201.168q.464.736.464%201.744%200%20.992-.464%201.76-.465.751-1.296%201.168-.832.416-1.936.416h-2.624zm2.624-10.016h-2.624v3.824h2.624q.944%200%201.488-.512.544-.511.544-1.408%200-.895-.544-1.392-.544-.512-1.488-.512M156.983%2022h-7.04V10.56h1.648v10h5.392zm9.508%200h-7.36V10.56h7.36v1.424h-5.712v3.472h5.424v1.424h-5.424v3.696h5.712z%22%20data-color%3D%222%22%3E%3C%2Fpath%3E%3C%2Fg%3E%3C%2Fsvg%3E';

// Empty-state message used when behavior === 'text'.
export const EMPTY_MESSAGE = 'No recently viewed products yet.';
