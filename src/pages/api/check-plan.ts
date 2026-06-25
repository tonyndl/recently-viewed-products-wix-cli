import type { APIRoute } from "astro";
import { auth } from "@wix/essentials";
import { appInstances } from "@wix/app-management";
import { customJson } from "../../utils/customJson";
import { APP_ID, FALLBACK_UPGRADE_URL } from "../../constants";

// Returns the site's premium status and an upgrade URL when on the free plan.
// Premium removes the watermark from the site widget.
export const GET: APIRoute = () => {
  const elevatedGetAppInstance = auth.elevate(appInstances.getAppInstance);
  return elevatedGetAppInstance()
    .then(({ instance }) => {
      // During a Wix-managed free trial the instance is treated as a paying
      // customer, so `isFree` is false and `isPremium` is already true — premium
      // features unlock automatically. The fields below just let the UI tell the
      // difference (eligible-to-start vs. currently-on-trial vs. paid).
      const inst = instance as unknown as {
        freeTrialAvailable?: boolean;
        billing?: { freeTrialInfo?: { status?: string; endDate?: string } };
      };
      const isPremium = instance ? !instance.isFree : false;
      const packageName = (instance?.billing?.packageName ?? "").toLowerCase();
      const instanceId = instance?.instanceId;

      // `freeTrialInfo` only appears while a trial is active. Use its endDate to
      // compute days remaining; treat the trial as over once the end date passes.
      const trial = inst?.billing?.freeTrialInfo;
      const trialEndMs = trial?.endDate ? new Date(trial.endDate).getTime() : 0;
      const onFreeTrial = !!trial && trialEndMs > Date.now();
      const freeTrialDaysLeft = onFreeTrial
        ? Math.max(0, Math.ceil((trialEndMs - Date.now()) / 86_400_000))
        : undefined;
      // Eligible to START a trial (one per app per account, never used before).
      const freeTrialAvailable = !isPremium && !!inst?.freeTrialAvailable;

      const upgradeUrl = !isPremium
        ? instanceId
          ? `https://www.wix.com/apps/upgrade/${APP_ID}?appInstanceId=${instanceId}`
          : FALLBACK_UPGRADE_URL
        : undefined;
      return customJson({
        isPremium,
        packageName,
        upgradeUrl,
        freeTrialAvailable,
        onFreeTrial,
        freeTrialDaysLeft,
      });
    })
    .catch(() =>
      customJson({
        isPremium: false,
        packageName: "",
        upgradeUrl: FALLBACK_UPGRADE_URL,
        freeTrialAvailable: false,
        onFreeTrial: false,
      }),
    );
};
