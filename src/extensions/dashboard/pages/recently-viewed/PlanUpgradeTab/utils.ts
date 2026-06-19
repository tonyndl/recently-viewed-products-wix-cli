import { FREE_FEATURES, PREMIUM_FEATURES } from "../upgradeUtils";

// Transforms the raw `PlanPricing` from the Wix API into `PricingTier[]`.
//
// Important: both `monthlyPrice` and `yearlyPrice` are monthly-equivalent
// amounts from the Wix API — do NOT divide `yearlyPrice` by 12 for display.
export const buildPricingTiers = (
  planPricing: PlanPricing | null,
): PricingTier[] => {
  if (!planPricing) return [];

  const { plans, showPriceWithTax } = planPricing;

  const freeTier: PricingTier = { name: "Free", features: FREE_FEATURES };

  if (!plans.length) {
    // API returned no plans (not yet configured in Dev Center, or fetch failed).
    // Show a static fallback premium card so the upgrade path is never broken.
    const fallbackPremium: PricingTier = {
      name: "Premium",
      features: PREMIUM_FEATURES,
      popular: true,
      monthlyPrice: "2.0",
      yearlyPrice: "2.99",
      savingsPercent: 20,
    };
    return [freeTier, fallbackPremium];
  }

  const premiumTiers: PricingTier[] = plans.map((plan) => {
    const monthlyPrice = plan.prices.find(
      (p) => p.billingCycle.cycleType === "MONTHLY",
    );
    const yearlyPrice = plan.prices.find(
      (p) => p.billingCycle.cycleType === "YEARLY",
    );
    const priceKey = showPriceWithTax ? "totalPrice" : "priceBeforeTax";
    const monthly = monthlyPrice?.[priceKey];
    const yearly = yearlyPrice?.[priceKey];

    // Both monthly and yearly prices are monthly-equivalent amounts from the API.
    let savingsPercent: number | undefined;
    if (monthly && yearly) {
      const m = parseFloat(monthly);
      const y = parseFloat(yearly);
      if (m > 0) savingsPercent = Math.round(((m - y) / m) * 100);
    }

    return {
      name: plan.name,
      planId: monthlyPrice ? plan._id : undefined,
      yearlyPlanId: yearlyPrice ? plan._id : undefined,
      monthlyPrice: monthly,
      yearlyPrice: yearly,
      savingsPercent,
      features: plan.benefits.length ? plan.benefits : PREMIUM_FEATURES,
      popular: true,
    };
  });

  return [freeTier, ...premiumTiers];
};
