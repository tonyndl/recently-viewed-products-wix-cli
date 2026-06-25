import { app } from "@wix/astro/builders";
import recentlyViewedPage from "./extensions/dashboard/pages/recently-viewed/recently-viewed.extension.ts";
import recentlyViewedWidget from "./site/widgets/custom-elements/recently-viewed-products/recently-viewed-products.extension.ts";
import recentlyViewedTracker from "./extensions/embedded-scripts/recently-viewed-tracker/recently-viewed-tracker.extension.ts";

import appInstall from "./extensions/backend/events/app-install/app-install.extension.ts";

import appRemove from "./extensions/backend/events/app-remove/app-remove.extension.ts";

import planPurchased from "./extensions/backend/events/plan-purchased/plan-purchased.extension.ts";

import planChange from "./extensions/backend/events/plan-change/plan-change.extension.ts";

import planAutoRenewalCancelled from "./extensions/backend/events/plan-auto-renewal-cancelled/plan-auto-renewal-cancelled.extension.ts";

export default app()
  .use(recentlyViewedPage)
  .use(recentlyViewedWidget)
  .use(recentlyViewedTracker)
  .use(appInstall)
  .use(appRemove)
  .use(planPurchased)
  .use(planChange)
  .use(planAutoRenewalCancelled);
