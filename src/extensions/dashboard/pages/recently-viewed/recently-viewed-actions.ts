import { dashboard } from "@wix/dashboard";
import { appPlans } from "@wix/app-management";
import { productsV3, products } from "@wix/stores";
import { httpGet } from "../../../../utils/request";
import { APP_ID } from "../../../../constants";

const baseApiUrl = new URL(import.meta.url).origin;

export const fetchPlan = (): Promise<PlanStatus> =>
  httpGet(`${baseApiUrl}/api/check-plan`).then(
    (r) => r.json() as Promise<PlanStatus>,
  );

// Synchronous — reads directly from the Dashboard SDK. The SDK's `editorUrl`
// is already a complete, valid editor link (it carries its own query string,
// e.g. `?metaSiteId=...`), so use it as-is. Appending another `?param` produced
// a malformed double-`?` URL that the editor rejected with a 400.
export const fetchEditorUrl = (): string | null =>
  dashboard.getSiteInfo()?.editorUrl ?? null;

// Real plan pricing from the Wix Dev Center for the Plan & Upgrade tab.
export const loadAppPlans = (): Promise<PlanPricing> =>
  appPlans
    .listAppPlansByAppId([APP_ID])
    .then((result) => {
      const plans = (result as any).appPlans?.[0]?.plans ?? [];
      return {
        plans: plans as AppPlan[],
        currency: (result as any).currency ?? "USD",
        showPriceWithTax:
          (result as any).taxSettings?.showPriceWithTax ?? false,
      };
    })
    .catch(() => ({ plans: [], currency: "USD", showPriceWithTax: false }));

// Total number of products in the store (for the overview stats card).
// Supports both catalog versions: tries V3, falls back to the V1 catalog.
// Best-effort — falls back to 0 (shown as "—") if neither is readable.
export const fetchStoreProductCount = async (): Promise<number> => {
  try {
    // Use the dedicated count endpoint — it returns the true catalog total.
    // (A query with .limit(1) caps res.items.length at 1, so falling back to it
    // would always report "1" when the response omits a total count.)
    const res = await productsV3.countProducts();
    const count = (res as { count?: number }).count ?? 0;
    if (count > 0) return count;
  } catch {
    /* fall through to V1 */
  }
  try {
    // V1 catalog fallback — the query result's totalCount is the real total,
    // independent of the page limit.
    const res = await products.queryProducts().limit(1).find();
    return (res as { totalCount?: number }).totalCount ?? res.items.length ?? 0;
  } catch {
    return 0;
  }
};
