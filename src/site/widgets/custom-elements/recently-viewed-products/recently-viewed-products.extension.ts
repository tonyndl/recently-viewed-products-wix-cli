import { extensions } from '@wix/astro/builders';

// Site-facing "Recently Viewed Products" widget. `presets` is required for the
// widget to appear in the editor's Add Elements → App Widgets list.
export default extensions.customElement({
  id: '1ae44e00-2fc7-407d-94c2-f6b5e0229b2d',
  name: 'Recently Viewed Products',
  tagName: 'recently-viewed-products',
  element: './site/widgets/custom-elements/recently-viewed-products/element.tsx',
  settings: './site/widgets/custom-elements/recently-viewed-products/panel/index.tsx',
  installation: { autoAdd: true },
  width: { defaultWidth: 720, allowStretch: true },
  // Wix custom-element boxes auto-GROW to fit content but never auto-SHRINK back
  // (platform behavior — there's no widget/panel API to resize the host box). So
  // switching from a tall layout to a shorter one leaves empty space the site
  // builder must drag away. `heightMode: 'AUTO'` keeps the grow behavior (so tall
  // layouts aren't clipped); `defaultHeight` is just the first-install size,
  // tuned to the default strip layout (heading + one card row + watermark).
  height: { defaultHeight: 300, heightMode: 'AUTO' },
  presets: [
    {
      id: '5634ef5e-2594-45d4-8d1b-65eb0a6a2953',
      name: 'Recently Viewed Products',
      thumbnailUrl: '{{BASE_URL}}/public/recently-viewed-thumbnail.png',
    },
  ],
});
