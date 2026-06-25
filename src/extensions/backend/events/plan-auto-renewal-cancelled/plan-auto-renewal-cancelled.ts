import { appInstances } from "@wix/app-management";
import { syncBillingToSupabase } from "../../../../backend/_shared/sync-billing";

// Fires when a user turns off auto-renewal — most importantly, when they cancel a
// free trial before the card is charged (Wix sends no event when a trial simply
// converts to paid, so this is how we learn a trial won't convert). Re-syncs the
// instance's billing so `auto_renewing` / `free_trial_status` reflect the cancel.
export default appInstances.onAppInstancePaidPlanAutoRenewalCancelled(
  async (event) => {
    try {
      const instanceId = event.metadata?.instanceId;
      if (!instanceId) {
        console.warn("[plan-auto-renewal-cancelled] no instanceId in event");
        return;
      }
      await syncBillingToSupabase(instanceId, "plan-auto-renewal-cancelled");
    } catch (error) {
      console.error("[plan-auto-renewal-cancelled] failed:", error);
    }
  },
);
