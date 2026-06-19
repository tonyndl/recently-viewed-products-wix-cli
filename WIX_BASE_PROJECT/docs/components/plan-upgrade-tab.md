# PlanUpgradeTab

The "Plan & Upgrade" dashboard tab. Shows the user's current plan status and a grid of pricing tier cards. Fetches live plan pricing from `@wix/app-management`. Supports monthly/yearly segmented toggle with savings badge inside the Yearly pill.

---

## File structure

```
PlanUpgradeTab/
  index.tsx
  utils.ts
  styles/
    index.ts
  ui/
    cardHeader.tsx
    pricingTierCard.tsx
    styles/
      cardHeader.ts
      pricingTierCard.ts
```

Also depends on:

- `CurrentPlanCard/` (sibling component — see below)
- `upgradeUtils.ts` (sibling file — see `WIX_BASE_PROJECT/docs/api/upgrade-utils.md`)
- `src/extensions/dashboard/types.d.ts` for `PlanPricing`, `AppPlan`, `PricingTier` types

---

## `src/extensions/dashboard/types.d.ts` — required global types

These must be declared globally (no `export`):

```ts
interface PlanPrice {
  priceBeforeTax: string;
  totalPrice: string;
  billingCycle: {
    cycleType: string;
    cycleDuration?: { unit: string; count: number };
  };
}

interface AppPlan {
  _id: string;
  name: string;
  benefits: string[];
  prices: PlanPrice[];
}

interface PlanPricing {
  plans: AppPlan[];
  currency: string;
  showPriceWithTax: boolean;
}

interface PricingTier {
  name: string;
  planId?: string;
  yearlyPlanId?: string;
  monthlyPrice?: string;
  yearlyPrice?: string;
  savingsPercent?: number;
  features: string[];
  popular?: boolean;
}
```

---

## `utils.ts`

Transforms the raw `PlanPricing` from the Wix API into `PricingTier[]` for rendering. Adapt `FREE_FEATURES` and `PREMIUM_FEATURES` to your app.

**Important:** Both `monthlyPrice` and `yearlyPrice` are monthly-equivalent amounts from the Wix API. Do NOT divide `yearlyPrice` by 12 for display — it is already the per-month price when billed yearly.

When `plans.length === 0` (API not configured or fetch failed), a static fallback Premium card is returned with mock prices so the upgrade path is never broken.

```ts
// PlanUpgradeTab/utils.ts
import { FREE_FEATURES, PREMIUM_FEATURES } from "../upgradeUtils";

export const buildPricingTiers = (
  planPricing: PlanPricing | null,
): PricingTier[] => {
  if (!planPricing) return [];

  const { plans, showPriceWithTax } = planPricing;

  const freeTier: PricingTier = { name: "Free", features: FREE_FEATURES };

  if (!plans.length) {
    // API returned no plans (not yet configured in Dev Center, or fetch failed).
    // Show a static fallback premium card so the upgrade path is never broken.
    // yearlyPrice is the monthly-equivalent price when billed yearly (same unit as monthlyPrice).
    const fallbackPremium: PricingTier = {
      name: "Premium",
      features: PREMIUM_FEATURES,
      popular: true,
      monthlyPrice: "2.0",
      yearlyPrice: "2.99",
      savingsPercent: 20,
      // No planId/yearlyPlanId — PricingTierCard falls through to the upgrade URL.
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
```

---

## `styles/index.ts`

```ts
import type { CSSProperties } from "react";

export const styles = {
  plansGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  } as CSSProperties,
};
```

---

## `ui/styles/cardHeader.ts`

The header has a title/subtitle on the left and a segmented Monthly/Yearly control on the right. The active pill gets a white background + blue border; the inactive pill is transparent on the gray container. The Save badge lives inside the Yearly pill.

```ts
import type { CSSProperties } from "react";

export const styles = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 24px",
  } as CSSProperties,
  titleSection: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  } as CSSProperties,
  pillToggle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  } as CSSProperties,
  segmentedControl: {
    display: "flex",
    alignItems: "center",
    background: "#F3F3F3",
    borderRadius: "8px",
    padding: "3px",
    gap: "2px",
  } as CSSProperties,
  pill: {
    padding: "5px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    userSelect: "none",
    background: "transparent",
  } as CSSProperties,
  pillActive: {
    padding: "5px 14px",
    borderRadius: "6px",
    border: "2px solid #116DFF",
    background: "#fff",
    cursor: "pointer",
    userSelect: "none",
  } as CSSProperties,
};
```

---

## `ui/cardHeader.tsx`

Title "Plans & Pricing" with subtitle on the left. Segmented control on the right with Monthly/Yearly pills inside a gray rounded container. The active pill has a white background + blue border. The Save % badge lives inside the Yearly pill. No `ToggleSwitch` — use the custom segmented control below.

```tsx
import { type FC } from "react";
import { Text, Badge } from "@wix/design-system";
import { styles } from "./styles/cardHeader";

type Props = {
  plansLoading: boolean;
  hasYearlyOption: boolean;
  isYearly: boolean;
  savingsPercent: number | undefined;
  onSetYearly: (value: boolean) => void;
};

const PricingCardHeader: FC<Props> = ({
  plansLoading,
  hasYearlyOption,
  isYearly,
  savingsPercent,
  onSetYearly,
}) => (
  <div style={styles.header}>
    <div style={styles.titleSection}>
      <Text weight="bold">Plans & Pricing</Text>
      <Text size="small" secondary>
        Choose the plan that fits your needs.
      </Text>
    </div>
    {!plansLoading && hasYearlyOption && (
      <div style={styles.pillToggle}>
        <div style={styles.segmentedControl}>
          <div
            style={isYearly ? styles.pill : styles.pillActive}
            onClick={() => onSetYearly(false)}
          >
            <Text size="small" weight={isYearly ? "normal" : "bold"}>
              Monthly
            </Text>
          </div>
          <div
            style={{
              ...styles.pill,
              ...(isYearly ? styles.pillActive : {}),
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
            onClick={() => onSetYearly(true)}
          >
            <Text size="small" weight={isYearly ? "bold" : "normal"}>
              Yearly
            </Text>
            {savingsPercent !== undefined && (
              <Badge skin="success" size="tiny">
                Save {savingsPercent}%
              </Badge>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
);

export default PricingCardHeader;
```

---

## `ui/styles/pricingTierCard.ts`

Non-free cards always get a blue border (`2px solid #116DFF`). Free card gets a gray border. Badges are inline with the plan name. Features use a plain blue `✓` checkmark (no icon component, no circle border).

```ts
import type { CSSProperties } from "react";

export const getCardStyle = (isPremiumCard: boolean): CSSProperties => ({
  border: isPremiumCard ? "2px solid #116DFF" : "1px solid #E5E5E5",
  borderRadius: "8px",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
});

export const styles = {
  nameRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  } as CSSProperties,
  priceRow: {
    display: "flex",
    alignItems: "baseline",
    gap: "4px",
  } as CSSProperties,
  featureList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: 1,
  } as CSSProperties,
  featureRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  } as CSSProperties,
  circleCheck: {
    color: "#116DFF",
    fontSize: "14px",
    fontWeight: 700,
    flexShrink: 0,
    lineHeight: 1,
  } as CSSProperties,
};
```

---

## `ui/pricingTierCard.tsx`

Card design rules:

- Non-free cards always have a blue border (`getCardStyle(!isFree)`).
- Plan name + `Current Plan` (blue) or `Most Popular` (green) badge are on the same row.
- Free card shows `$0 forever`. Premium shows `{price} /month`. No price shows `See pricing →`.
- Both `monthlyPrice` and `yearlyPrice` are already monthly-equivalent — display directly, do NOT divide by 12.
- Features rendered with a plain `<span>✓</span>` styled blue — no icon component, no circle border.
- Buttons are full width (no `size="small"`).

```tsx
import { type FC } from "react";
import { Text, Button, Badge } from "@wix/design-system";
import * as Icons from "@wix/wix-ui-icons-common";
import { formatPrice, openUpgradeUrl } from "../../upgradeUtils";
import { getCardStyle, styles } from "./styles/pricingTierCard";

type Props = {
  tier: PricingTier;
  isPremium: boolean;
  isYearly: boolean;
  resolvedUpgradeUrl: string;
};

const PricingTierCard: FC<Props> = ({
  tier,
  isPremium,
  isYearly,
  resolvedUpgradeUrl,
}) => {
  const isFree = tier.name.toLowerCase() === "free";
  const isCurrentPlan = isFree ? !isPremium : isPremium;
  const price = isYearly ? tier.yearlyPrice : tier.monthlyPrice;
  // Both monthlyPrice and yearlyPrice are already monthly-equivalent amounts from the API.
  const displayPrice = price ? formatPrice(price, "USD") : null;

  return (
    <div style={getCardStyle(!isFree)}>
      <div style={styles.nameRow}>
        <Text weight="bold">{tier.name}</Text>
        {isCurrentPlan && (
          <Badge skin="standard" size="tiny">
            Current Plan
          </Badge>
        )}
        {tier.popular && !isFree && !isCurrentPlan && (
          <Badge skin="success" size="tiny">
            Most Popular
          </Badge>
        )}
      </div>

      <div style={styles.priceRow}>
        {isFree ? (
          <>
            <Text weight="bold">$0</Text>
            <Text size="small" secondary>
              forever
            </Text>
          </>
        ) : displayPrice ? (
          <>
            <Text weight="bold">{displayPrice}</Text>
            <Text size="small" secondary>
              /month
            </Text>
          </>
        ) : (
          <Text size="small" secondary>
            See pricing →
          </Text>
        )}
      </div>

      <div style={styles.featureList}>
        {tier.features.map((feature) => (
          <div key={feature} style={styles.featureRow}>
            <span style={styles.circleCheck}>✓</span>
            <Text size="small">{feature}</Text>
          </div>
        ))}
      </div>

      {isCurrentPlan ? (
        <Button priority="secondary" disabled>
          Current Plan
        </Button>
      ) : isFree ? null : (
        <Button
          skin="premium"
          prefixIcon={<Icons.PremiumFilled />}
          onClick={() => openUpgradeUrl(resolvedUpgradeUrl)}
        >
          Upgrade
        </Button>
      )}
    </div>
  );
};

export default PricingTierCard;
```

---

## `CurrentPlanCard/styles/index.ts`

```ts
import type { CSSProperties } from "react";

export const styles = {
  card: {
    border: "1px solid #E5E5E5",
    borderRadius: "8px",
    padding: "20px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
  } as CSSProperties,
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  } as CSSProperties,
  featuresRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
    marginTop: "8px",
  } as CSSProperties,
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  } as CSSProperties,
  circleCheck: {
    color: "#116DFF",
    fontSize: "14px",
    fontWeight: 700,
    flexShrink: 0,
    lineHeight: 1,
  } as CSSProperties,
};
```

---

## `CurrentPlanCard/index.tsx`

Shows "Your Current Plan: [FREE/PREMIUM badge] $0 forever" on one row, features with blue `✓` checkmarks below, and "Upgrade to Premium" button on the right (hidden when already premium).

```tsx
import { type FC } from "react";
import { Text, Button, Badge } from "@wix/design-system";
import * as Icons from "@wix/wix-ui-icons-common";
import { openUpgradeUrl } from "../upgradeUtils";
import { styles } from "./styles";

type Props = {
  isPremium: boolean;
  currentTier: PricingTier | undefined;
  upgradeUrl: string;
};

const CurrentPlanCard: FC<Props> = ({ isPremium, currentTier, upgradeUrl }) => {
  const features = currentTier?.features ?? [];

  return (
    <div style={styles.card}>
      <div>
        <div style={styles.infoRow}>
          <Text weight="bold">Your Current Plan:</Text>
          <Badge skin={isPremium ? "premium" : "standard"} size="tiny">
            {isPremium ? "PREMIUM" : "FREE"}
          </Badge>
          <Text secondary>
            {isPremium ? (currentTier?.name ?? "Premium") : "$0 forever"}
          </Text>
        </div>
        {features.length > 0 && (
          <div style={styles.featuresRow}>
            {features.map((f) => (
              <div key={f} style={styles.featureItem}>
                <span style={styles.circleCheck}>✓</span>
                <Text size="small" secondary>
                  {f}
                </Text>
              </div>
            ))}
          </div>
        )}
      </div>
      {!isPremium && (
        <Button
          skin="premium"
          prefixIcon={<Icons.PremiumFilled />}
          onClick={() => openUpgradeUrl(upgradeUrl)}
        >
          Upgrade to Premium
        </Button>
      )}
    </div>
  );
};

export default CurrentPlanCard;
```

---

## `index.tsx`

```tsx
import { type FC, useState } from "react";
import { Box, Card, Loader } from "@wix/design-system";
import CurrentPlanCard from "../CurrentPlanCard";
import { styles } from "./styles";
import { buildPricingTiers } from "./utils";
import PricingCardHeader from "./ui/cardHeader";
import PricingTierCard from "./ui/pricingTierCard";

type Props = {
  isPremium: boolean;
  upgradeUrl: string | undefined;
  planPricing: PlanPricing | null;
};

const PlanUpgradeTab: FC<Props> = ({ isPremium, upgradeUrl, planPricing }) => {
  const [isYearly, setIsYearly] = useState(false);
  const plansLoading = planPricing === null;
  const pricingTiers = buildPricingTiers(planPricing);
  const resolvedUpgradeUrl = upgradeUrl ?? "";
  const hasYearlyOption = pricingTiers.some((t) => t.yearlyPrice);
  const savingsPercent = pricingTiers.find(
    (t) => t.savingsPercent,
  )?.savingsPercent;
  const currentTier = pricingTiers.find((tier) => {
    const isFreeOrBasic = ["free", "basic"].includes(tier.name.toLowerCase());
    return isFreeOrBasic ? !isPremium : isPremium;
  });

  return (
    <Box marginTop="SP5" direction="vertical" gap="SP4">
      <div>
        <CurrentPlanCard
          isPremium={isPremium}
          currentTier={currentTier}
          upgradeUrl={resolvedUpgradeUrl}
        />
      </div>
      <div>
        <Card>
          <PricingCardHeader
            plansLoading={plansLoading}
            hasYearlyOption={hasYearlyOption}
            isYearly={isYearly}
            savingsPercent={savingsPercent}
            onSetYearly={setIsYearly}
          />
          <Card.Divider />
          <Card.Content>
            {plansLoading ? (
              <Box align="center" padding="40px">
                <Loader size="small" />
              </Box>
            ) : (
              <div style={styles.plansGrid}>
                {pricingTiers.map((tier) => (
                  <PricingTierCard
                    key={tier.name}
                    tier={tier}
                    isPremium={isPremium}
                    isYearly={isYearly}
                    resolvedUpgradeUrl={resolvedUpgradeUrl}
                  />
                ))}
              </div>
            )}
          </Card.Content>
        </Card>
      </div>
    </Box>
  );
};

export default PlanUpgradeTab;
```

---

## Loading plan pricing in the dashboard page

```tsx
import { appPlans } from "@wix/app-management";

const APP_ID = "<your-app-id>";

const loadAppPlans = useCallback(
  () =>
    appPlans
      .listAppPlansByAppId([APP_ID])
      .then((result) => {
        const plans = result.appPlans?.[0]?.plans ?? [];
        setPlanPricing({
          plans: plans as AppPlan[],
          currency: result.currency ?? "USD",
          showPriceWithTax: result.taxSettings?.showPriceWithTax ?? false,
        });
      })
      .catch(() =>
        setPlanPricing({ plans: [], currency: "USD", showPriceWithTax: false }),
      ),
  [],
);

useEffect(() => {
  loadAppPlans();
}, [loadAppPlans]);
```

Then pass `planPricing` as a prop:

```tsx
{
  activeTab === 1 && (
    <PlanUpgradeTab
      isPremium={isPremium}
      upgradeUrl={upgradeUrl}
      planPricing={planPricing}
    />
  );
}
```
