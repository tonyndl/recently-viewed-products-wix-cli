// App-wide constants for the Recently Viewed Products app.

// The Wix App ID — taken from wix.config.json. Used for premium checks,
// upgrade URLs and review/rate links.
export const APP_ID = "cff08b9e-2702-40ed-ac02-1071ef5dabbd";

// Fallback upgrade URL when the App Market upgrade URL can't be resolved.
export const FALLBACK_UPGRADE_URL = `https://www.wix.com/apps/upgrade/${APP_ID}`;

// In-app review popup target.
export const REVIEW_URL = `https://www.wix.com/app-market/add-review/${APP_ID}`;

// Free-trial length, in days. Must match the value configured on the recurring
// plan in the Wix Dev Center → Pricing → Free Trial (Wix runs the actual trial;
// this is only used for in-app copy like "Start your 7-day free trial").
export const FREE_TRIAL_DAYS = 7;

// Slug of this app's dashboard page, taken from the live dashboard URL
// (manage.wix.com/dashboard/{metaSiteId}/{slug}). The slug is fixed per app —
// only the metaSiteId varies per site — so the help-url API route just prepends
// the current site's id. Used to deep-link the panel's "Need Help" button to the
// dashboard's How to Use tab.
export const DASHBOARD_APP_SLUG = "purple-recently-viewed-store-prod-pro";

// Shared Purple icon used by the "More apps by us" cards. (The footer watermark
// reuses the widget's canonical WATERMARK_LOGO/WATERMARK_URL instead, so it stays
// identical to the watermark shown on the live widget.)
export const PURPLE_LOGO_URL =
  "https://static.wixstatic.com/media/1fff64_8e60357c0b134468a6c6f4c7e4570de5~mv2.png";

// localStorage key the visitor's browsing history is stored under.
// Kept identical to the original Wix Blocks app for a seamless migration.
export const TRACKING_STORAGE_KEY = "pagesplugin";

// Maximum number of recently-viewed slugs we retain in localStorage.
export const MAX_TRACKED_SLUGS = 26;
