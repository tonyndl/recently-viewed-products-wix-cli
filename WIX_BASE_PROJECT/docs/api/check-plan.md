# check-plan API

`src/pages/api/check-plan.ts`

A `GET` endpoint that returns the current site's premium status, package name, contact limit, and an upgrade URL when not premium. Uses `auth.elevate` so no special Wix permission grant is required from the calling client.

---

## Response shape

```ts
// 200 OK
{
  isPremium: boolean;
  packageName: string;         // e.g. 'starter', 'pro' — empty string on free
  contactLimit: number | null; // null = unlimited (Pro tier)
  upgradeUrl?: string;         // only present when isPremium is false
  _debug?: Record<string, unknown>;
}

// 500 (fallback — never throws)
{ isPremium: false; packageName: ''; upgradeUrl: string }
```

---

## Full implementation

```ts
// src/pages/api/check-plan.ts
import type { APIRoute } from 'astro';
import { auth } from '@wix/essentials';
import { appInstances } from '@wix/app-management';
import { customJson } from '../../utils/customJson';
import { FREE_CONTACT_LIMIT, PLAN_LIMITS } from '../../backend/_shared/plan-limits';

const APP_ID = 'e24ccf8c-8cd5-4e03-b1bc-00a93a4b265d';
const FALLBACK_UPGRADE_URL = `https://www.wix.com/apps/upgrade/${APP_ID}`;

export const GET: APIRoute = () => {
  const elevatedGetAppInstance = auth.elevate(appInstances.getAppInstance);
  return elevatedGetAppInstance()
    .then(({ instance }) => {
      const isPremium = instance ? !instance.isFree : false;
      const packageName = (instance?.billing?.packageName ?? '').toLowerCase();
      const instanceId = instance?.instanceId;
      const rawLimit = isPremium
        ? (PLAN_LIMITS[packageName] ?? FREE_CONTACT_LIMIT)
        : FREE_CONTACT_LIMIT;
      const contactLimit = isFinite(rawLimit) ? rawLimit : null; // null = unlimited
      const upgradeUrl = !isPremium
        ? instanceId
          ? `https://www.wix.com/apps/upgrade/${APP_ID}?appInstanceId=${instanceId}`
          : FALLBACK_UPGRADE_URL
        : undefined;
      return customJson({ isPremium, packageName, contactLimit, upgradeUrl });
    })
    .catch(() =>
      customJson({ isPremium: false, packageName: '', upgradeUrl: FALLBACK_UPGRADE_URL }),
    );
};
```

---

## Using in the dashboard component

Wrap the fetch in `useCallback` so it can be shared between the initial load effect and the visibility listener. Call it in both places — once on mount, and again each time the user returns to the tab after completing a payment flow that opened in a new tab.

```tsx
import { useCallback, useEffect, useState } from 'react';
import { httpClient } from '@wix/essentials';

const [isPremium, setIsPremium] = useState(false);
const [packageName, setPackageName] = useState('');
const [upgradeUrl, setUpgradeUrl] = useState<string | undefined>();
const [contactLimit, setContactLimit] = useState<number>(100);

const loadPlan = useCallback(async () => {
  try {
    const data = await httpClient
      .fetchWithAuth('/api/check-plan')
      .then((r) => r.json()) as {
        isPremium: boolean;
        packageName: string;
        upgradeUrl?: string;
        contactLimit?: number;
      };
    setIsPremium(data.isPremium);
    setPackageName(data.packageName ?? '');
    setUpgradeUrl(data.upgradeUrl);
    if (data.contactLimit != null) setContactLimit(data.contactLimit);
  } catch (err) {
    console.error('[loadPlan] failed:', err);
  }
}, []);

// Initial load
useEffect(() => {
  void loadPlan();
}, [loadPlan]);

// Re-fetch when the user returns to this tab after completing an upgrade
// in a new tab — without this the premium state stays stale until reload.
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      void loadPlan();
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, [loadPlan]);
```

Then gate premium features with `isPremium` and pass `upgradeUrl` to any upgrade button:

```tsx
{!isPremium && upgradeUrl && (
  <Button
    skin="premium"
    prefixIcon={<Icons.PremiumFilled />}
    onClick={() => window.open(upgradeUrl, '_blank')}
  >
    Upgrade to Premium
  </Button>
)}
```

When the user completes the upgrade and returns to the dashboard tab, `visibilitychange` fires, `loadPlan` re-runs, and the premium button disappears automatically — no manual reload required.
