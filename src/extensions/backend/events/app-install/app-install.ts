import { auth } from "@wix/essentials";
import { appInstances, embeddedScripts } from "@wix/app-management";
import { siteProperties } from "@wix/business-tools";
import { getSupabase } from "../../../../backend/_shared/supabase-client";

const elevatedGetAppInstance = auth.elevate(appInstances.getAppInstance);
const elevatedGetSiteProps = auth.elevate(siteProperties.getSiteProperties);
const elevatedEmbedScript = auth.elevate(embeddedScripts.embedScript);

export default appInstances.onAppInstanceInstalled(async (event) => {
  // Inject the Recently Viewed tracker onto the site automatically on install —
  // NO dashboard visit required. Defining the embeddedScript extension only
  // registers it; Wix injects it only once embedScript() is called. Running it
  // here means every new install gets the tracker with no manual step.
  // No dynamic parameters → empty object; single script → no componentId.
  //
  // On a brand-new install the app's components may not be fully provisioned at
  // the instant this event fires, so embedScript() can fail with a transient
  // "not found / not ready" error. We retry with a short backoff so the very
  // FIRST install reliably gets the script (not only updates/reinstalls).
  const EMBED_MAX_ATTEMPTS = 5;
  const EMBED_RETRY_MS = 2000;
  for (let attempt = 1; attempt <= EMBED_MAX_ATTEMPTS; attempt++) {
    try {
      await elevatedEmbedScript({ parameters: {} });
      console.log(
        `[app-installed] tracker embedded script injected (attempt ${attempt})`,
      );
      break;
    } catch (err) {
      if (attempt === EMBED_MAX_ATTEMPTS) {
        console.error(
          `[app-installed] embedScript failed after ${EMBED_MAX_ATTEMPTS} attempts:`,
          err,
        );
      } else {
        console.warn(
          `[app-installed] embedScript attempt ${attempt} failed, retrying in ${EMBED_RETRY_MS}ms`,
        );
        await new Promise((resolve) => setTimeout(resolve, EMBED_RETRY_MS));
      }
    }
  }

  try {
    const instanceId = event.metadata?.instanceId;
    if (!instanceId) {
      console.warn("[app-installed] no instanceId in event, skipping");
      return;
    }
    const siteId = event.metadata?.accountInfo?.siteId;

    const { instance, site } = await elevatedGetAppInstance();

    let businessName: string | null = null;
    let phone: string | null = null;
    let country: string | null = null;
    let city: string | null = null;
    let category: string | null = null;
    let subCategory: string | null = null;
    try {
      const props = await elevatedGetSiteProps();
      const p = props as any;
      businessName = p?.properties?.businessName ?? null;
      phone = p?.properties?.phone ?? null;
      country = p?.properties?.address?.country ?? null;
      city = p?.properties?.address?.city ?? null;
      category = p?.properties?.categories?.primary ?? null;
      subCategory = p?.properties?.categories?.secondary?.[0] ?? null;
    } catch (err) {
      console.warn("[app-installed] getSiteProperties failed:", err);
    }

    const supabase = getSupabase();

    await supabase.from("app_installations").upsert(
      {
        instance_id: instanceId,
        app_name: (instance as any)?.appName ?? null,
        site_id: site?.siteId ?? siteId,
        owner_email: site?.ownerInfo?.email ?? null,
        business_name: businessName,
        phone,
        country,
        city,
        category,
        sub_category: subCategory,
        site_display_name: site?.siteDisplayName ?? null,
        site_url: (site as any)?.url ?? null,
        site_locale: (site as any)?.locale ?? null,
        is_free: (instance as any)?.isFree ?? true,
        package_name: (instance as any)?.billing?.packageName ?? null,
        billing_cycle: (instance as any)?.billing?.billingCycle ?? null,
        billing_started_at: (instance as any)?.billing?.timeStamp ?? null,
        billing_expiration_date:
          (instance as any)?.billing?.expirationDate ?? null,
        auto_renewing: (instance as any)?.billing?.autoRenewing ?? null,
        free_trial_status:
          (instance as any)?.billing?.freeTrialInfo?.status ?? null,
        installed_at: new Date().toISOString(),
        removed_at: null,
        is_active: true,
      },
      { onConflict: "instance_id" },
    );

    console.log("[app-installed] tracked:", instanceId);
  } catch (error) {
    console.error("[app-installed] failed:", error);
  }
});
