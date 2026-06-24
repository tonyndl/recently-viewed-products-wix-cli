import { auth } from "@wix/essentials";
import { appInstances, embeddedScripts } from "@wix/app-management";
import { siteProperties } from "@wix/business-tools";
import { getSupabase } from "../../../../backend/_shared/supabase-client";

const elevatedGetAppInstance = auth.elevate(appInstances.getAppInstance);
const elevatedGetSiteProps = auth.elevate(siteProperties.getSiteProperties);
const elevatedEmbedScript = auth.elevate(embeddedScripts.embedScript);

export default appInstances.onAppInstanceInstalled(async (event) => {
  // Inject the Recently Viewed tracker onto the site. Defining the embeddedScript
  // extension is NOT enough — Wix only injects it once embedScript() is called.
  // Our tracker has no dynamic parameters, so pass an empty `parameters` object;
  // it's the only embedded script, so we don't pass a componentId.
  try {
    await elevatedEmbedScript({ parameters: {} });
    console.log("[app-installed] tracker embedded script injected");
  } catch (err) {
    console.error("[app-installed] embedScript failed:", err);
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
