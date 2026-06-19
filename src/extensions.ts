import { app } from "@wix/astro/builders";
import recentlyViewedPage from "./extensions/dashboard/pages/recently-viewed/recently-viewed.extension.ts";
import recentlyViewedWidget from "./site/widgets/custom-elements/recently-viewed-products/recently-viewed-products.extension.ts";
import recentlyViewedTracker from "./extensions/embedded-scripts/recently-viewed-tracker/recently-viewed-tracker.extension.ts";

export default app()
  .use(recentlyViewedPage)
  .use(recentlyViewedWidget)
  .use(recentlyViewedTracker);
