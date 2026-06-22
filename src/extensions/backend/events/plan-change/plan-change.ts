import { appInstances } from "@wix/app-management";
import { syncBillingToSupabase } from "../../../../backend/_shared/sync-billing";

export default appInstances.onAppInstancePaidPlanChanged(async (event) => {
  try {
    const instanceId = event.metadata?.instanceId;
    if (!instanceId) {
      console.warn("[plan-changed] no instanceId in event");
      return;
    }
    await syncBillingToSupabase(instanceId, "plan-changed");
  } catch (error) {
    console.error("[plan-changed] failed:", error);
  }
});
