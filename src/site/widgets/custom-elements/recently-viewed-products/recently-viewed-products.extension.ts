import { extensions } from "@wix/astro/builders";

// Site-facing "Recently Viewed Products" widget. `presets` is required for the
// widget to appear in the editor's Add Elements → App Widgets list.
export default extensions.customElement({
  id: "1ae44e00-2fc7-407d-94c2-f6b5e0229b2d",
  name: "Recently Viewed Products",
  tagName: "recently-viewed-products",
  element:
    "./site/widgets/custom-elements/recently-viewed-products/element.tsx",
  settings:
    "./site/widgets/custom-elements/recently-viewed-products/panel/index.tsx",
  // `autoAdd: true` auto-places the widget on the site when the app is installed
  // (or updated), so the user lands in the editor with the widget already on the
  // page — no manual "Add" needed. They can still move, resize, or delete it.
  // NOTE: this only takes effect at real install/update time after `wix release`;
  // it does NOT apply in `wix dev` preview or to sites that already had the app.
  // TRADE-OFF: auto-adding drops the widget into its own new Section, which Wix
  // sizes to a tall default (not to the widget's content). Since a custom-element
  // box grows but never shrinks, the shortest layout (strip) can leave empty
  // space below it that the site builder must drag away once. We accept this so
  // the widget is present on install without a manual add step.
  // (Wix's docs mention a newer `staticContainer: 'HOMEPAGE'` replacement, but it
  // isn't shipped in any published @wix/astro version yet — 2.55.0 still uses
  // `autoAdd`. Switch to `staticContainer` once the SDK types support it.)
  installation: { autoAdd: true },
  width: { defaultWidth: 720, allowStretch: true },
  // `defaultHeight` is tuned to the default STRIP layout (the layout a fresh
  // widget shows), so a newly added widget starts at the right height with no
  // empty space below. The strip is: heading (~44px) + caption above the image
  // (~41px) + the 170px square image + watermark (~38px) ≈ 300px.
  // `heightMode: 'AUTO'` lets taller layouts (multi-row grid, masonry, etc.) grow
  // the box so they're never clipped; it only grows, never shrinks below this
  // value, which is why we size the default to the SHORTEST common layout.
  height: { defaultHeight: 200, heightMode: "AUTO" },
  presets: [
    {
      id: "5634ef5e-2594-45d4-8d1b-65eb0a6a2953",
      name: "Recently Viewed Products",
      // Direct image URL (imgur page https://imgur.com/4jTbYwc → i.imgur.com asset).
      thumbnailUrl: "https://i.imgur.com/4jTbYwc.png",
    },
  ],
});
