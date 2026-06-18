import { extensions } from '@wix/astro/builders';

// Injects the product-view tracker on every storefront page.
export default extensions.embeddedScript({
  id: 'd2f55331-670c-4460-b183-ee70d7e10fc5',
  name: 'Recently Viewed Tracker',
  placement: 'BODY_END',
  scriptType: 'FUNCTIONAL',
  source: './extensions/embedded-scripts/recently-viewed-tracker/embed.html',
});
