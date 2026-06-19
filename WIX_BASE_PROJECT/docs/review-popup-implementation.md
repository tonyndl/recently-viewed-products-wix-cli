# Review Popup Implementation Guide

How we built the review popup for the FAQ app and wired it to show over the full editor page. Use this as a reference to replicate in other Wix CLI app projects (e.g. countdown timer).

---

## Overview

The review popup is a custom web component (`<rate-popup>`) that renders a full-screen overlay with an iframe pointing to the Wix App Market review page. It can be triggered from two contexts:

- **Dashboard** — renders directly over the dashboard page
- **Editor panel** — must go through `modals.openDashboardModal` to escape the panel iframe and render over the full editor

---

## 1. The `rate-popup` Web Component

**File:** `src/extensions/dashboard/_shared/rate-popup.ts`

A self-contained custom element that:

- Mounts itself as a shadow DOM portal into `document.body`
- Renders an overlay + dialog + close button + iframe
- Supports an `is-editor` attribute that shrinks the dialog for the editor context
- Handles Escape key, backdrop click, and focus trap

**Key exports:**

```ts
// Registers the custom element if not already registered, then opens the popup
export function openRatePopup(
  reviewUrl?: string,
  options?: { isEditor?: boolean },
): void;

// Just ensures the element is registered — call if you want to pre-register
export function ensureRatePopupRegistered(): void;
```

**Usage in dashboard context:**

```ts
import { openRatePopup } from "../../_shared/rate-popup";

const REVIEW_URL = "https://www.wix.com/app-market/add-review/<your-app-id>";
openRatePopup(REVIEW_URL);
```

---

## 2. Triggering from the Dashboard Page

**File:** `src/extensions/dashboard/pages/faq-manager/faq-manager.tsx`

### Constants

```ts
const APP_ID = // your app ID
const REVIEW_URL = `https://www.wix.com/app-market/add-review/${APP_ID}`;
const REVIEW_SHOWN_KEY = // localStorage key
```

### One-time trigger helper

```ts
const triggerReviewPopupOnce = useCallback(() => {
  try {
    if (localStorage.getItem(REVIEW_SHOWN_KEY)) return;
    localStorage.setItem(REVIEW_SHOWN_KEY, "1");
    setTimeout(() => openRatePopup(REVIEW_URL), 2000);
  } catch {}
}, []);
```

### Call it after the user creates their first item

```ts
// Inside the save success handler:
if (!editingFaq && faqs.length === 0) triggerReviewPopupOnce();
```

`faqs.length === 0` is evaluated before the async save, so it correctly identifies the first item being created.

### Handle the `?tab=review` param (for editor-triggered flow — see section 4)

```ts
useEffect(() => {
  dashboard.observeState((pageParams: any) => {
    const search = pageParams?.location?.search ?? "";
    const params = new URLSearchParams(search);
    if (params.get("tab") === "review") {
      openRatePopup(REVIEW_URL);
    }
  });
}, []);
```

---

## 3. Why the Editor Panel Needs a Different Approach

The editor settings panel runs inside an **iframe**. Calling `openRatePopup` directly from panel code appends the popup to `document.body` of that iframe — so it is clipped to the panel's frame, not the full editor page.

The `@wix/editor` package's `modals` API provides the escape hatch:

```ts
import { modals } from "@wix/editor";

modals.openDashboardModal({ url: "/your-dashboard-page?tab=review" });
```

This opens a dashboard page as a **full-editor-level overlay** — it escapes the panel iframe entirely and renders over the whole Wix editor. The dashboard page then calls `openRatePopup` internally.

---

## 4. Editor Panel — Triggering on First Item Creation

**File:** `src/site/widgets/custom-elements/faq-widget/components/faqsSection.tsx`

### Imports

```ts
import { widget, modals } from "@wix/editor";
```

### Module-level key (same key as dashboard — they share localStorage)

```ts
const REVIEW_SHOWN_KEY = "faq_app_review_shown_v1";
```

### Guard in the save handler

> **Important:** call `modals.openDashboardModal` in `.finally()`, not inside `.then()`.
> If it is inside `.then()` and throws, the `.catch(() => {})` right after will silently
> swallow the error and the popup never appears. `.finally()` runs after the catch, so
> errors from `openDashboardModal` are no longer suppressed.

```ts
const saveNew = () => {
  const isFirstFaq = faqs.length === 0; // capture before async
  let savedSuccessfully = false;
  setSaving(true);
  apiPostFaq(...)
    .then((saved) => {
      // ... update state, widget prop, etc.
      savedSuccessfully = true;
    })
    .catch(() => {})
    .finally(() => {
      setSaving(false);
      if (savedSuccessfully && isFirstFaq && !localStorage.getItem(REVIEW_SHOWN_KEY)) {
        localStorage.setItem(REVIEW_SHOWN_KEY, '1');
        modals.openDashboardModal({
          url: '/your-dashboard-page?tab=review',
        });
      }
    });
};
```

---

## 5. Editor Panel — Manual "Rate Us" Button

**File:** `src/site/widgets/custom-elements/faq-widget/panel.tsx`

```tsx
import { modals } from "@wix/editor";

<TextButton
  size="tiny"
  onClick={() =>
    modals.openDashboardModal({
      url: "/your-dashboard-page?tab=review",
    })
  }
>
  Rate us
</TextButton>;
```

---

## 6. Full Flow Diagram

```
DASHBOARD CONTEXT
─────────────────
User creates first item
  → triggerReviewPopupOnce()
    → localStorage check (REVIEW_SHOWN_KEY)
    → openRatePopup(REVIEW_URL)
      → popup renders over dashboard page ✓

EDITOR CONTEXT
──────────────
User creates first item in panel   OR   User clicks "Rate us" button
  → isFirstFaq && !localStorage check
  → modals.openDashboardModal({ url: '...?tab=review' })
    → Dashboard page loads as full-editor overlay
    → observeState detects tab=review
    → openRatePopup(REVIEW_URL)
      → popup renders inside dashboard modal (covers full editor) ✓
```

---

## 7. Checklist to Replicate in Another Project

- [ ] Copy `src/extensions/dashboard/_shared/rate-popup.ts` as-is
- [ ] Define `APP_ID`, `REVIEW_URL`, `REVIEW_SHOWN_KEY` constants (module-level)
- [ ] In the dashboard page: add `triggerReviewPopupOnce` and call it on first item creation
- [ ] In the dashboard page: add `observeState` handler for `?tab=review` → `openRatePopup`
- [ ] In the editor panel component: import `modals` from `@wix/editor`
- [ ] In the editor panel component: add `REVIEW_SHOWN_KEY` constant (same string as dashboard)
- [ ] In the panel save handler: check `isFirstItem && !localStorage.getItem(REVIEW_SHOWN_KEY)` → set key → call `modals.openDashboardModal`
- [ ] In the panel footer: add a "Rate us" `TextButton` that calls `modals.openDashboardModal`
- [ ] Confirm the dashboard page URL slug matches across all `openDashboardModal` calls
