---
name: wix-editor-pick-app
description: Build Wix CLI apps to Editor's Pick quality. Covers dashboard UX (onboarding, stats cards, search, pagination, skeletons, celebration, pricing plans, support section, "More Apps by Us"), settings panel patterns, premium upgrade system, widget auto-detection, and data collection setup. Use when building a new Wix app, creating a dashboard page, settings panel, or site widget.
---

# Wix Editor's Pick App — Quality Patterns

Apply these patterns when building any Wix CLI app to achieve Editor's Pick quality.

## Project Setup

### Assets Folder
Always create `src/dashboard/pages/assets/` for app icons and branding:
```
src/dashboard/pages/assets/
├── purple-logo.png                    # Company logo
├── frequently-bought-together.png     # "More apps" icon — https://www.wix.com/app-market/17d75b11-b574-4b49-9708-4ffa8be777a6
├── 360-product-viewer.png             # "More apps" icon — https://www.wix.com/app-market/dd2b43ee-f3e5-4ca2-bb87-73f41be78d18
├── verifying-shipping-addresses.png   # "More apps" icon — https://www.wix.com/app-market/shipping-address-verifier
└── google-drive-content.png           # "More apps" icon — https://www.wix.com/app-market/6d396a1f-1145-4feb-9531-3b520ab4389e
```
Tell the user: "Add your app icons to `src/dashboard/pages/assets/`. I've created the folder and imports."

### Required Imports
Dashboard pages need these WDS components at minimum:
```typescript
import {
  Badge, Box, Button, Card, Cell, Divider, EmptyState, FormField,
  Heading, Input, InputArea, Layout, LinearProgressBar, Loader,
  NumberInput, Page, Search, Table, TableActionCell, Tabs, Text,
  TextButton, ToggleSwitch, Modal, CustomModalLayout,
  WixDesignSystemProvider,
} from '@wix/design-system';
import '@wix/design-system/styles.global.css';
import * as Icons from '@wix/wix-ui-icons-common';
```

---

## Dashboard Page Structure

Build the dashboard in this exact section order:

### 1. Celebration Banner (conditional)
Show on first-ever saved config. Auto-scroll to top. Auto-dismiss after 8s.
```tsx
{showCelebration && (
  <Cell span={12}>
    <Box backgroundColor="#E8F5E9" border="1px solid #A5D6A7" padding="16px 24px" borderRadius="8px">
      <!-- Party emoji + congrats message + dismiss button -->
    </Box>
  </Cell>
)}
```

### 2. Stats Overview Cards (4 cards, span={3} each)
All cards use `stretchVertically` + `<Box flex="1" />` spacer for equal height.
- Card 1: Item count (e.g. "Store Products") with `<Icons.Catalog />`
- Card 2: Configured count with `<LinearProgressBar />` 
- Card 3: Total data metric (e.g. "Total Frames") with `<Icons.Image />`
- Card 4: Current Plan with upgrade `<TextButton>` for free users

### 3. Onboarding Slideshow (conditional)
Show when `savedConfigs.length === 0 && !loading && !onboardingDismissed`.
Hides the entire dashboard until dismissed. Uses states: `onboardingStep` (0-3), `onboardingDismissed`.

**4 slides inside a fixed-height container** (`minHeight: 340px`) so dots/buttons don't jump:

- **Slide 1 (Welcome)**: Heading, subtitle, auto-rotating mini preview using example images (square container, `objectFit: 'cover'`, no badge overlay). Wide "Get Started" button (`size="medium"`, `minWidth: 200`) — no Back button on this step.
- **Slide 2 (How It Works)**: 4 steps in a row (`flex: 1 1 0` for equal width), each with a blue circle icon, title, and label.
- **Slide 3 (Features)**: 4 feature cards in a grid with icons, titles, descriptions.
- **Slide 4 (Ready to Start)**: "Configure Your First Product" + "Try a Demo" buttons. Both set `onboardingDismissed = true` before their action.

**Navigation (below slides):**
- Dot indicators: active dot wider (24px vs 8px), clickable, with CSS transition
- Step 1: Single wide "Get Started" button (covers full nav width)
- Steps 2-3: Back + Next buttons (small)
- Step 4: Back + "Skip to Dashboard" (`skin="standard" priority="secondary"` — must be visible without hover)

**Auto-rotating mini preview component** for Slide 1:
```tsx
const OnboardingPreview: FC = () => {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setFrame(f => (f + 1) % EXAMPLE_IMAGES.length), 120);
    return () => clearInterval(interval);
  }, []);
  return (
    <div style={{ width: 200, height: 200, borderRadius: 12, overflow: 'hidden', border: '2px solid #e0e3e8' }}>
      <img src={EXAMPLE_IMAGES[frame]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  );
};
```

**Persist dismissed state in localStorage** so onboarding doesn't reappear on refresh:
```tsx
const [onboardingDismissed, setOnboardingDismissedRaw] = useState(() => {
  try { return localStorage.getItem('APPNAME_onboarding_done') === '1'; } catch { return false; }
});
const setOnboardingDismissed = useCallback((val: boolean) => {
  setOnboardingDismissedRaw(val);
  if (val) {
    try { localStorage.setItem('APPNAME_onboarding_done', '1'); } catch { /* ignore */ }
  }
}, []);
```

**Wrap all dashboard content** (Store Products through More Apps) in:
```tsx
{(!isFirstTime || onboardingDismissed || storeProductsLoading) && (<> ... </>)}
```

### 4. Main Data Table
- **Search bar**: Show when items > 3 using `<Search />` component
- **Skeleton loading**: Use animated shimmer rows, not `<Loader />`
- **Pagination**: 10 items per page with Prev/Next buttons. Reset page on search.
- **Limit warning banner**: Yellow `#FFF8E1` with `#FFE082` border. "Upgrade" scrolls to pricing section.
- **Status badges**: Green "Configured", neutral "Not set"
- **Action buttons**: "Limit reached" scrolls to pricing (not disabled)

### 5. Saved Configurations Table
With Load and Delete actions. Delete triggers a confirmation Modal:
```tsx
<Modal isOpen={deleteConfirmId !== null} onRequestClose={close}>
  <CustomModalLayout
    title="Delete Configuration"
    subtitle="Are you sure? This cannot be undone."
    primaryButtonText="Delete"
    primaryButtonOnClick={handleDelete}
    secondaryButtonText="Cancel"
    secondaryButtonOnClick={close}
  />
</Modal>
```

### 6. Configuration Form
- Dynamic title: "Configure — [Item Name]" when item selected
- "Clear Selection" button in header suffix
- Tabs for different input methods (e.g. "Paste URLs" / "URL Pattern Generator")

### 7. Save Section
- Product limit warning banner (same yellow style) when at limit
- Save button with loading state: `prefixIcon={saving ? <Loader size="tiny" /> : <Icons.Confirm />}`
- Shows "Update" vs "Save" based on existing config

### 8. Live Preview + Details Grid
`<Cell span={7}>` for preview, `<Cell span={5}>` for details. Both use `stretchVertically`.

### 9. How to Use + Tips (2 columns)
`<Cell span={6}>` each. Numbered steps and bullet points.

### 10. Pricing Plans Card
4-tier comparison: Free, Starter ($4.99), Standard ($9.99), Advanced ($19.99).
- "MOST POPULAR" badge on Standard (green)
- "CURRENT PLAN" badge on active plan (blue)
- Each tier: name, price, product limit badge, feature list, CTA button
- Use `popular: false` on all tiers to avoid TypeScript `as const` issues

### 11. Need Help / Support Section
```tsx
<Card>
  <Card.Content>
    <Box direction="horizontal" verticalAlign="middle">
      <Icons.ChatFilled /> <Text weight="bold">Need Help?</Text>
      <Button as="a" href="mailto:apps-support@prpl.io" prefixIcon={<Icons.Email />}>
        apps-support@prpl.io
      </Button>
    </Box>
  </Card.Content>
</Card>
```

### 12. "More Apps by Us" Section
Always include. 4 app cards in a flex row with equal width (`flex: 1 1 0`).
Each card: icon, name, description, "Get App" button aligned at bottom.
Footer: "Explore more apps" link + "POWERED BY" logo.
```tsx
<div style={{ display: 'flex', gap: '24px', alignItems: 'stretch' }}>
  {apps.map(app => (
    <div style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column' }}>
      <img src={app.icon} style={{ width: 48, height: 48, borderRadius: 10 }} />
      <Text weight="bold">{app.name}</Text>
      <div style={{ flex: 1 }}><Text secondary>{app.description}</Text></div>
      <Button size="tiny" priority="secondary" as="a" href={app.url}>Get App</Button>
    </div>
  ))}
</div>
```

---

## Skeleton Loading Pattern

Replace all `<Loader />` in tables with animated skeleton rows:
```tsx
const SkeletonRow: FC<{ rows?: number }> = ({ rows = 3 }) => (
  <>
    <style>{`@keyframes skeletonShimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }`}</style>
    {Array.from({ length: rows }).map((_, i) => (
      <div style={{ display: 'flex', gap: 16, padding: '12px 0', borderBottom: '1px solid #f0f4f7' }}>
        <div style={{ width: 44, height: 44, borderRadius: 6, background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '400px 100%', animation: 'skeletonShimmer 1.5s infinite' }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ width: '60%', height: 12, borderRadius: 4, background: '...shimmer...' }} />
          <div style={{ width: '35%', height: 10, borderRadius: 4, background: '...shimmer...' }} />
        </div>
      </div>
    ))}
  </>
);
```

---

## Image Validation in Thumbnail Grids

Track `loadedIndexes` and `failedIndexes` via `onLoad` and `onError`.
Show summary: "32 loaded, 4 failed, 0 loading..."
Green border + checkmark on loaded. Red border + X on failed.

---

## Settings Panel Structure

Organize into clear sections with icons:
1. **Tip banner** (blue `#EDF3FF`): "Configure in Dashboard for best experience" + "Open Dashboard" button
2. **Upgrade banner** (yellow `#FFF8E1`): For free users
3. **CONNECTION** section (`<Icons.Globe />`): Product name input + connection status badge (Linked/Manual/Not set)
4. **MANUAL OVERRIDE** section (`<Icons.Replace />`): Image URLs with frame count badge
5. **BEHAVIOR** section (`<Icons.Refresh />`): Toggle rows with description subtitles. Speed as range slider (not number input).
6. **APPEARANCE** section (`<Icons.ColorDrop />`): Transparent BG toggle + color picker with Reset button
7. **Help footer**: Support email link

Toggle layout pattern (label + subtitle on left, switch on right):
```tsx
<Box direction="horizontal" verticalAlign="middle">
  <Box flex="1">
    <Text size="small">Auto-Rotate</Text>
    <Text size="tiny" secondary>Spin automatically on load</Text>
  </Box>
  <ToggleSwitch checked={value} onChange={handler} size="small" />
</Box>
```

---

## Premium / Upgrade System

### Backend web method (`check-premium.web.ts`)

**CRITICAL — `"Anyone" as any` permission rule:** ALWAYS use the string literal `"Anyone" as any` for the webMethod permission parameter, NEVER use `Permissions.Anyone` from the `@wix/web-methods` import. Versions `@wix/web-methods@^1.0.0` through at least `^1.0.5` do NOT export `Permissions`, making `Permissions.Anyone` evaluate to `undefined`. This causes the Wix CLI runtime's `checkPermission` function to crash with `TypeError: Cannot read properties of undefined (reading 'includes')`, which makes the entire web method fail silently — the frontend `.catch()` swallows the error, and you see fallback/empty data with no obvious reason. This applies to ALL `.web.ts` files (check-premium, app-plans, settings, tracking, etc.), not just check-premium.

```typescript
import { webMethod } from '@wix/web-methods';
import { appInstances } from '@wix/app-management';
import { auth } from '@wix/essentials';

export interface PremiumResult {
  isPremium: boolean;
  planStatus: 'premium' | 'cancelled' | 'free';
  instanceId?: string;
}

const elevatedGetAppInstance = auth.elevate(appInstances.getAppInstance);

export const checkPremium = webMethod(
  "Anyone" as any,
  async (): Promise<PremiumResult> => {
    try {
      const data = await elevatedGetAppInstance();
      const instance = (data as any)?.instance;
      const instanceId: string | undefined = instance?.instanceId ?? undefined;
      const isFree: boolean = instance?.isFree !== false;
      const billing = instance?.billing;

      if (!isFree && billing?.packageName) {
        return { isPremium: true, planStatus: 'premium', instanceId };
      }

      if (isFree && billing?.packageName) {
        return { isPremium: false, planStatus: 'cancelled', instanceId };
      }

      return { isPremium: false, planStatus: 'free', instanceId };
    } catch (err) {
      console.error('[check-premium] failed:', err);
      return { isPremium: false, planStatus: 'free' };
    }
  },
);
```

// Returns: { isPremium, planStatus, instanceId }
// For multi-tier plans: extend with plan name + maxItems mapping based on billing.packageName

### Dashboard integration
- Header: Loader while checking → Badge with plan + count → Upgrade button for free/cancelled
- Warning banners: scroll to pricing section (don't open external link)
- Save handler: block new configs if at limit (allow updates)

### Panel integration
- Header suffix: Plan badge (always shown, even for free)
- Upgrade banner for non-premium users

---

## Dynamic Pricing Plans (`app-plans.web.ts`)

Fetch real plan prices and currency from the Wix Dev Center instead of hardcoding `$3.99`. Prices are localized to the site's currency (e.g. `₪14.58` for ILS, `€3.99` for EUR).

### Backend: `app-plans.web.ts`

**IMPORTANT:** Use `"Anyone" as any` for the permission (see rule above). Use `appInstances.getAppInstance()` to get the site's `paymentCurrency` as a reliable fallback — the `appPlans.listAppPlansByAppId` response may not always include `currencySymbol`.

```typescript
import { webMethod } from '@wix/web-methods';
import { appPlans, appInstances } from '@wix/app-management';
import { auth } from '@wix/essentials';

const APP_ID = 'your-app-id';

function currencyCodeToSymbol(code: string): string {
  try {
    const parts = new Intl.NumberFormat('en', { style: 'currency', currency: code }).formatToParts(0);
    return parts.find(p => p.type === 'currency')?.value ?? '$';
  } catch { return '$'; }
}

async function getSiteCurrency(): Promise<{ currency: string; currencySymbol: string } | null> {
  try {
    const elevatedGetInstance = auth.elevate(appInstances.getAppInstance);
    const data = await elevatedGetInstance();
    const paymentCurrency = (data as any)?.site?.paymentCurrency;
    if (paymentCurrency && typeof paymentCurrency === 'string') {
      return { currency: paymentCurrency, currencySymbol: currencyCodeToSymbol(paymentCurrency) };
    }
  } catch { /* fall through */ }
  return null;
}

export const getAppPlans = webMethod(
  "Anyone" as any,
  async () => {
    const [plansResponse, siteCurrency] = await Promise.all([
      (async () => {
        try {
          return await auth.elevate(appPlans.listAppPlansByAppId)([APP_ID]);
        } catch {
          return await appPlans.listAppPlansByAppId([APP_ID]);
        }
      })(),
      getSiteCurrency(),
    ]);

    const fallbackSymbol = siteCurrency?.currencySymbol ?? '$';
    const currencySymbol = plansResponse.currencySymbol ?? fallbackSymbol;
    // ... map plans to response
  },
);
```

**Key points:**
- `getAppInstance().site.paymentCurrency` returns a 3-letter ISO code (e.g. `"ILS"`) — convert to symbol with `Intl.NumberFormat`
- Fetch plans and site currency in **parallel** with `Promise.all` to avoid latency
- In the catch block, still try `getSiteCurrency()` so even a failed plans call returns the correct currency symbol
- The `listAppPlansByAppId` response may return `cycleType: "RECURRING"` for all prices without distinguishing monthly/yearly — use a size-based heuristic (higher price = monthly, lower = yearly) as fallback

### Frontend: Price sorting with NaN safety

Always add `|| 0` when parsing prices for sorting, otherwise `NaN` from unparseable prices corrupts the sort:
```typescript
// WRONG — breaks if price string can't be parsed
.sort((a, b) => parseFloat(a.monthlyPrice.replace(/[^0-9.]/g, '')) - parseFloat(b.monthlyPrice.replace(/[^0-9.]/g, '')))

// CORRECT — NaN becomes 0
.sort((a, b) => {
  const aPrice = parseFloat(a.monthlyPrice.replace(/[^0-9.]/g, '')) || 0;
  const bPrice = parseFloat(b.monthlyPrice.replace(/[^0-9.]/g, '')) || 0;
  return aPrice - bPrice;
})
```

### Debugging dynamic pricing issues

When prices show wrong currency or fallback values, add a temporary debug banner in the Plan tab to inspect raw API responses:
```tsx
<Card>
  <Card.Header title="DEBUG: Raw API Parameters" />
  <Card.Content>
    <pre>{JSON.stringify(rawApiResponse, null, 2)}</pre>
  </Card.Content>
</Card>
```
Check: (1) is `getAppPlans()` resolving or catching? (2) what `currencySymbol` is returned? (3) is the `Permissions.Anyone` bug silently crashing the call?

---

## Widget Best Practices

- **Auto-detect product**: Extract slug from `window.location.pathname`, query data collection
- **Hide when empty**: Return `null` if no config found (don't show empty placeholder)
- **Inline styles only**: No external CSS files for site widgets
- **Use `react-to-webcomponent`** to convert React to custom element
- **Fallback chain**: configName prop → URL slug auto-detect → manual image URLs

---

## API Patterns

### Support both Catalog v1 and v3
```typescript
try {
  const result = await productsV3.queryProducts().limit(100).find();
  // use v3 result
} catch {
  const result = await products.queryProducts().limit(100).find();
  // fallback to v1
}
```

### Paginate through all items
```typescript
let result = await query.limit(100).find();
all.push(...result.items);
while (result.hasNext?.()) {
  result = await result.next();
  all.push(...result.items);
}
```

---

## Scroll Behavior

- **First save celebration**: `window.scrollTo({ top: 0, behavior: 'smooth' })` + walk up DOM parents
- **"Try Demo" button**: Scroll to preview section
- **"Limit reached" / "Upgrade"**: Scroll to pricing section
- **"Configure product"**: Scroll to config form section
- Use refs + `scrollIntoView({ behavior: 'smooth', block: 'start' })` for all scroll targets

---

## TypeScript Tips

- Use `as 'neutral' | 'standard' | 'success' | 'premium'` for Badge skin arrays (avoid `as const` issues)
- WDS Input has no `'valid'` status — only `'error'` and `'warning'`
- WDS `LinearProgressBar` skin: `'success' | 'warning' | 'standard' | 'premium' | 'neutral'` (no `'error'`)
- Tabs onClick: `(tab) => setActiveTab(Number(tab.id))`
- Always cast Wix API results: `result.items as unknown as YourType[]`

---

## Troubleshooting: `@wix/cli` and `@wix/cli-app` Version Mismatch

**Error:** `✖ The versions of @wix/cli (X.X.X) and @wix/cli-app (Y.Y.Y) dependencies do not match`

**Root cause:** The `wix` binary in `$PATH` is a **global** install at a different version than the project's local `@wix/cli-app`. This typically happens when `@wix/cli` was installed globally to `/usr/local/` at some point, but the user's npm global prefix has since changed (e.g. to `~/.npm-global`). Running `npm install -g @wix/cli@latest` updates the *current prefix* but leaves the stale `/usr/local/bin/wix` binary untouched.

**Diagnosis steps (run all in parallel):**
1. `which wix` — check which binary the shell resolves (usually `/usr/local/bin/wix`)
2. `ls -la /usr/local/bin/wix` — confirm it symlinks to `/usr/local/lib/node_modules/@wix/cli/bin/wix.cjs`
3. `node -e "console.log(require('/usr/local/lib/node_modules/@wix/cli/package.json').version)"` — get the actual version of the stale global
4. `npm config get prefix` — check the user's npm global prefix (often `~/.npm-global`, NOT `/usr/local`)
5. `npm ls @wix/cli @wix/cli-app --depth=0` — verify the local project versions match

**Fix:** The stale global lives under `/usr/local/` but npm's prefix points elsewhere, so a normal `sudo npm install -g` won't overwrite it. The user must run:
```bash
sudo npm install -g @wix/cli@<TARGET_VERSION> --prefix /usr/local
```
Replace `<TARGET_VERSION>` with the version that matches the project's `@wix/cli-app`.

**Quick workaround:** `npx wix app dev` always uses the local project's version and bypasses the global binary entirely.

**Prevention:** After fixing, suggest the user remove the orphaned global install to avoid future drift:
```bash
sudo npm uninstall -g @wix/cli --prefix /usr/local
```
Then `wix` will resolve from `~/.npm-global` (or via `npx`) and stay in sync automatically.

---

## Troubleshooting: Invalid JSON in Translation Files (Curly/Smart Quotes)

**Error during `wix build`:**
```
[vite:json] [plugin vite:json] src/intl/messages/de.json (142:47): Failed to parse JSON file, invalid JSON syntax found at position XXXX
```

**Root cause:** Translation files (`src/intl/messages/*.json`) contain Unicode curly/smart quotes (`„"`, `""`, `«»`) instead of straight single quotes or escaped characters. These are valid in natural language but **invalid inside JSON string values** because the JSON parser interprets them as unescaped control characters or structural delimiters.

Common offenders by language:
- **German (`de.json`):** `„` (U+201E) and `"` (U+201C) — e.g. `„Verwalten"`
- **Chinese (`zh.json`):** `"` (U+201C) and `"` (U+201D) — e.g. `"管理"`
- **French (`fr.json`):** `«` (U+00AB) and `»` (U+00BB)
- **Russian/Ukrainian:** `«»` or `„"`

**Fix:** Replace curly/smart quotes with straight single quotes `'...'` inside JSON string values:
```diff
- "howTo.step1": "Verwende den Tab „Verwalten", um deine Feed-Konfiguration einzurichten."
+ "howTo.step1": "Verwende den Tab 'Verwalten', um deine Feed-Konfiguration einzurichten."
```

**Prevention — validate ALL translation files after generating or editing them:**
```bash
for f in src/intl/messages/*.json; do
  node -e "JSON.parse(require('fs').readFileSync('$f','utf8'))" 2>&1 && echo "$f: ok" || echo "$f: INVALID"
done
```

Run this validation after every bulk translation generation or manual edit to catch issues before they reach `wix build`.

---

## Troubleshooting: Backend Event Webhooks Fail ("The webhook server returned an error")

**Error in Wix dev dashboard:** "The webhook server returned an error" when testing app installed/removed/plan changed events. No rows appear in Supabase or any external service.

**Root cause:** Astro 5+ enables CSRF origin checking by default (`security.checkOrigin: true`). Wix sends webhook POST requests from its own servers, so the `Origin` header doesn't match the app's URL. Astro rejects every incoming webhook with a 403 before it reaches the event handler.

**Fix:** Add `security: { checkOrigin: false }` to `astro.config.mjs`:

```javascript
export default defineConfig({
  output: "server",
  adapter: cloudflare(),
  integrations: [wix(), react()],
  security: { checkOrigin: false },
  // ...rest of config
});
```

**CRITICAL:** This line must be present in every Wix CLI app that uses backend event extensions. Without it, no event webhooks (app installed, app removed, plan changed, contact created, order placed, etc.) will work. Always verify this setting when setting up a new project or adding event extensions.
