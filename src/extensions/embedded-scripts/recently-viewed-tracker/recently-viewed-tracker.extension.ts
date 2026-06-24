import { extensions } from "@wix/astro/builders";

// Injects the product-view tracker on every storefront page.
// `scriptType: "ESSENTIAL"` so it ALWAYS runs. "FUNCTIONAL"/"ANALYTICS"/
// "ADVERTISING" are gated behind cookie consent, which silently blocks the
// tracker (and the whole Recently Viewed feature) until a visitor accepts
// cookies. The tracker only stores a product slug in the visitor's own
// localStorage (first-party, no personal data, no third parties), so treating
// it as strictly necessary for the feature is appropriate.
export default extensions.embeddedScript({
  id: "d2f55331-670c-4460-b183-ee70d7e10fc5",
  name: "Recently Viewed Tracker",
  placement: "BODY_END",
  scriptType: "ESSENTIAL",
  source: "./extensions/embedded-scripts/recently-viewed-tracker/embed.html",
});
