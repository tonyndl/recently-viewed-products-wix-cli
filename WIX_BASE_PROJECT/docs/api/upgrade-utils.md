# upgradeUtils

`src/extensions/dashboard/pages/<page-name>/upgradeUtils.ts`

A small collection of upgrade-related constants and helpers used by the dashboard and `PlanUpgradeTab`. Adapt the feature lists to describe your app's free and premium tiers.

---

## Full implementation

```ts
// upgradeUtils.ts

// ─── Replace with your app's actual feature lists ─────────────────────────────
export const FREE_FEATURES = [
  "Up to [N] items",
  "[Core feature available on free]",
];

export const PREMIUM_FEATURES = [
  "Unlimited items",
  "[Core feature]",
  "Remove watermark",
  "Priority support",
];
// ─────────────────────────────────────────────────────────────────────────────

export const openUpgradeUrl = (url: string | undefined) => {
  if (!url) return;
  window.open(url, "_blank");
};

export const formatPrice = (raw: string, currency: string): string => {
  const num = parseFloat(raw);
  if (isNaN(num)) return raw;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(num);
};
```

---

## Usage

```ts
import {
  FREE_FEATURES,
  PREMIUM_FEATURES,
  openUpgradeUrl,
  formatPrice,
} from "../upgradeUtils";

// In PlanUpgradeTab/utils.ts — buildPricingTiers uses FREE_FEATURES / PREMIUM_FEATURES
// In PricingTierCard — openUpgradeUrl() opens the upgrade page in a new tab
// In PricingTierCard — formatPrice() renders a currency-formatted price string
```
