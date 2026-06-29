# Free Trial — Implementation Guide

A **7-day, Wix-managed free trial** of Premium. Wix runs the actual trial
(payment capture, reminder emails, auto-charge at the end); the app's job is to
(1) turn it on in the Dev Center, (2) detect the trial state, and (3) reflect it
in the UI. During a trial the instance is treated as **paying**, so Premium
features unlock automatically.

> **One number drives everything:** `FREE_TRIAL_DAYS` in `src/constants/index.ts`.
> Keep it equal to the trial length configured in the Dev Center.

---

## 1. Dev Center setup (this is what actually enables the trial)

The trial is **not** a code setting — it's configured on the recurring plan.

1. Dev Center → your app → **Pricing**.
2. Ensure a **recurring** plan exists (monthly/yearly, Wix billing). Trials only
   work on recurring Wix-billing plans.
3. Enable **Free Trial** → enter **7** days → **Save**.
4. **`wix release`** + submit/approve/publish a new version. Trials apply only
   after a new app version is published.

Once live, Wix shows "Start Free Trial" on the App Market + upgrade page, takes
payment details up front, emails the user, and charges automatically when the
trial ends.

> **Benefits shown on the upgrade page** come from the **plan's benefits** in
> Dev Center → Pricing — keep them identical to `PREMIUM_FEATURES`
> (`upgradeUtils.ts`) so the upgrade page matches the dashboard. See
> [`PREMIUM_FEATURES`](#benefits-single-source).

---

## 2. Detecting the trial — `src/pages/api/check-plan.ts`

`getAppInstance()` returns the trial state. The raw instance during a trial:

```jsonc
{
  "isFree": false, // ← trial counts as PAID → isPremium = true
  "billing": {
    "packageName": "premium",
    "freeTrialInfo": {
      "status": "IN_PROGRESS",
      "endDate": "2026-07-03T10:43:34.278Z", // ← days-left is computed from this
    },
  },
  "freeTrialAvailable": false, // already using a trial → not eligible to start
}
```

`check-plan` derives and returns:

| Field                | Meaning                                                          |
| -------------------- | ---------------------------------------------------------------- |
| `isPremium`          | `!instance.isFree` — **true during a trial** (features unlock)   |
| `freeTrialAvailable` | Eligible to **start** a trial (never used; one per account)      |
| `onFreeTrial`        | Currently in the trial window (`freeTrialInfo` + endDate future) |
| `freeTrialDaysLeft`  | `ceil((endDate − now) / 1 day)` while `onFreeTrial`              |
| `upgradeUrl`         | Set only when not premium                                        |

```ts
const trial = inst?.billing?.freeTrialInfo;
const trialEndMs = trial?.endDate ? new Date(trial.endDate).getTime() : 0;
const onFreeTrial = !!trial && trialEndMs > Date.now();
const freeTrialDaysLeft = onFreeTrial
  ? Math.max(0, Math.ceil((trialEndMs - Date.now()) / 86_400_000))
  : undefined;
const freeTrialAvailable = !isPremium && !!inst?.freeTrialAvailable;
```

The `PlanStatus` type (`src/extensions/dashboard/types.d.ts`) carries these
fields to the dashboard.

---

## 3. Premium gating is automatic

Everything already gates on `isPremium` (watermark, premium layouts/ratios/
colours, etc.). Because **`isFree` is `false` during a trial**, `isPremium` is
`true`, so **no gating code changed** — trial users get full Premium.

---

## 4. The three UI states

All copy/badges derive from `check-plan`. Nothing renders until `planLoaded`
(set in `loadPlan`'s `finally`) to avoid a Free→Premium flash.

| State           | Condition            | What the UI shows                                                                                                            |
| --------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Eligible**    | `freeTrialAvailable` | Yellow `FreeTrialBanner` under the tabs + every "Upgrade" CTA becomes **"Start Free Trial"**                                 |
| **On trial**    | `onFreeTrial`        | Green **"TRIAL · N DAYS LEFT"** badges (header, Your Plan card, Plan & Settings card); the eligibility banner/CTAs disappear |
| **Paid / free** | else                 | Normal "Upgrade" / "✓ Active" / "Free"                                                                                       |

### State flow

`recently-viewed.tsx` → `loadPlan()` → state
(`isPremium`, `freeTrialAvailable`, `onFreeTrial`, `freeTrialDaysLeft`,
`planLoaded`) → threaded into `OverviewTab`, `PlanUpgradeTab` →
`CurrentPlanCard`, `PlanCard`, `pricingTierCard`. The **settings panel**
(`panel/index.tsx`) does its own `/api/check-plan` fetch and reads
`freeTrialAvailable`.

`loadPlan` is also re-run on `visibilitychange`, so returning from the upgrade
tab refreshes the state.

---

## 5. UI building blocks

### `freeTrialLabel(daysLeft)` — `upgradeUtils.ts`

```ts
freeTrialLabel(8); // "Trial · 8 days left"  → WDS Badge uppercases to "TRIAL · 8 DAYS LEFT"
```

Used wherever the days-left badge appears. WDS `Badge skin="success"` renders it
green.

### Trial-aware CTAs

When `freeTrialAvailable`, the label flips from "Upgrade"/"Upgrade to Premium" to
**"Start Free Trial"**. Applied in:

- Header action bar — `recently-viewed.tsx`
- `OverviewTab` PlanCard + free-state StatCard
- `CurrentPlanCard` (Plan & Settings)
- `PlanUpgradeTab/ui/pricingTierCard.tsx`
- Panel: `PremiumNudge`, locked colour swatches, watermark banner

### `FreeTrialBanner` — under the tabs (eligible only)

`FreeTrialBanner/` (index + styles + `FreeTrialBanner.css`). Yellow promo banner
with a tailored body and a purple "Start {FREE_TRIAL_DAYS}-Day Free Trial"
button. Rendered only while eligible:

```tsx
{
  planLoaded && freeTrialAvailable && upgradeUrl && (
    <FreeTrialBanner onStart={() => window.open(upgradeUrl, "_blank")} />
  );
}
```

> WDS `Text` ignores `style` but accepts `className` — the banner's body
> line-height is set via `.rv-trial-body` in `FreeTrialBanner.css`.

### `PlanCard` — Overview "Your Plan" card

`OverviewTab/ui/planCard.tsx`. Shown **only on paid/trial** plans: a purple
panel with the status badge (TRIAL · N DAYS LEFT / ✓ Active) on the left and the
`PREMIUM_FEATURES` checklist on the right. On the **free** plan the Overview tab
instead renders a plain `StatCard` the same width as "Store products" (no purple
card):

```tsx
{planLoaded && isPremium ? (
  <><Cell span={8}><PlanCard …/></Cell><Cell span={4}><StatCard …/></Cell></>
) : (
  <><Cell span={6}><StatCard title="Your Plan" …/></Cell><Cell span={6}><StatCard …/></Cell></>
)}
```

### Days-left badge spots (`onFreeTrial`)

- **Header** (`recently-viewed.tsx`) — green badge before the action buttons.
- **PlanCard** status (Overview).
- **CurrentPlanCard** (Plan & Settings) — badge + the line _"You're on a free
  trial with full Premium access. Your subscription begins when the trial ends,
  unless you cancel."_

<a id="benefits-single-source"></a>

### `PREMIUM_FEATURES` — single source for benefits

`upgradeUtils.ts` holds the canonical Premium benefit list. The dashboard's
Plan & Upgrade card and the Overview PlanCard both render it (the dashboard no
longer falls back to raw Wix plan benefits). **Mirror this exact list into Dev
Center → Pricing → plan benefits** so the App Market upgrade page matches.

---

## 6. Webhooks — `src/extensions/backend/events/`

| Event handler                                                               | Fires when                                       | Why                                 |
| --------------------------------------------------------------------------- | ------------------------------------------------ | ----------------------------------- |
| `plan-purchased` (`onAppInstancePaidPlanPurchased`)                         | A trial **starts** (Wix treats it as a purchase) | Sync billing to Supabase            |
| `plan-auto-renewal-cancelled` (`onAppInstancePaidPlanAutoRenewalCancelled`) | User cancels before the card is charged          | Track trials that **won't** convert |
| `plan-change` (`onAppInstancePaidPlanChanged`)                              | Plan changes                                     | Sync billing                        |

> Wix sends **no** event when a trial silently converts to paid; the
> auto-renewal-cancelled event is how you learn a trial was abandoned.

All are registered in `src/extensions.ts` and only take effect after
`wix release`.

---

## 7. Testing

1. `wix release` with the trial enabled, install on a site.
2. App Instance: `isFree` should be `true` (eligible) → UI shows the trial CTAs.
3. Start the trial via the upgrade page → `Paid Plan Purchased` fires; re-fetch
   shows `onFreeTrial: true` and the days-left badges.

> ⚠️ **Wix-managed trials are new-users-only, once per app per Wix account.** If
> you've already test-**purchased** the app on an account, you can't test the
> trial from it — use a fresh test app/account.

> ⚠️ The trial only appears after **publishing a new app version** (a plain
> `wix dev`/site publish isn't enough).

---

## 8. File map

| File                                               | Role                                                                       |
| -------------------------------------------------- | -------------------------------------------------------------------------- |
| `src/constants/index.ts`                           | `FREE_TRIAL_DAYS`                                                          |
| `src/pages/api/check-plan.ts`                      | Detects trial → `freeTrialAvailable` / `onFreeTrial` / `freeTrialDaysLeft` |
| `src/extensions/dashboard/types.d.ts`              | `PlanStatus` fields                                                        |
| `…/recently-viewed.tsx`                            | Plan state, header badge, FreeTrialBanner, threading                       |
| `…/upgradeUtils.ts`                                | `freeTrialLabel()`, `PREMIUM_FEATURES`                                     |
| `…/FreeTrialBanner/`                               | Eligible-state promo banner                                                |
| `…/OverviewTab/ui/planCard.tsx`                    | Purple "Your Plan" benefits card (paid/trial)                              |
| `…/OverviewTab/index.tsx`                          | Free vs paid/trial layout switch                                           |
| `…/CurrentPlanCard/index.tsx`                      | Plan & Settings status + days-left                                         |
| `…/PlanUpgradeTab/ui/pricingTierCard.tsx`          | Trial-aware pricing CTAs                                                   |
| `…/PlanUpgradeTab/utils.ts`                        | Builds tiers from `PREMIUM_FEATURES`                                       |
| `site/.../panel/index.tsx` + `ui/premiumNudge.tsx` | Trial-aware editor-panel CTAs                                              |
| `src/extensions/backend/events/plan-*`             | Purchase / cancel / change webhooks                                        |

## Related docs

- `WIX_BASE_PROJECT/docs/check-plan-in-panel.md` — premium check in the panel
- `WIX_BASE_PROJECT/docs/components/plan-upgrade-tab.md`
