import { extensions } from "@wix/astro/builders";

// Injects the product-view tracker on every storefront page, so tracking does
// NOT depend on the widget being placed on product pages.
//
// `scriptType: "ESSENTIAL"` so it always runs (FUNCTIONAL/ANALYTICS/ADVERTISING
// are gated behind cookie consent). The script only stores product slugs in the
// visitor's own site storage — first-party, no personal data, no third parties.
//
// This extension only DEFINES the script; it's injected onto each site when the
// app calls embedScript(), which we do automatically in the app-install event
// handler (no dashboard visit required). See WIX_BASE_PROJECT/docs.
export default extensions.embeddedScript({
  id: "d2f55331-670c-4460-b183-ee70d7e10fc5",
  name: "Recently Viewed Tracker",
  placement: "BODY_END",
  scriptType: "ESSENTIAL",
  source: "./extensions/embedded-scripts/recently-viewed-tracker/embed.html",
});
