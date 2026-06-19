import type { APIRoute } from "astro";
import { auth } from "@wix/essentials";
import { appInstances } from "@wix/app-management";
import { customJson } from "../../utils/customJson";
import { DASHBOARD_APP_SLUG } from "../../constants";

// Returns the absolute URL of this app's dashboard "How to Use" tab so the
// settings panel's "Need Help" button can open it in a new browser tab. The
// dashboard slug is fixed per app; only the metaSiteId is per-site, which we read
// from the app instance. The `?tab=how-to-use` query tells the dashboard page to
// open the How to Use tab.
export const GET: APIRoute = () => {
  const elevatedGetAppInstance = auth.elevate(appInstances.getAppInstance);
  return elevatedGetAppInstance()
    .then(({ site }) => {
      const siteId = site?.siteId;
      const url = siteId
        ? `https://manage.wix.com/dashboard/${siteId}/${DASHBOARD_APP_SLUG}?rvtab=how-to-use`
        : null;
      return customJson({ url });
    })
    .catch(() => customJson({ url: null }));
};
