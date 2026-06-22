# New-Tab Review Prompt

After a user makes a few edits in the widget's **settings panel**, the app opens
the Wix App Market **review page** in its own **popup window** (a separate
browser window, sized to the widget's width and ~70% of the screen height,
centred on screen). It only ever appears once per browser.

This doc records how it works and — just as importantly — **why** it's done this
way, since several more obvious approaches do not work inside the Wix editor.

---

## Behaviour

| Aspect    | Value                                                                    |
| --------- | ------------------------------------------------------------------------ |
| Trigger   | 3 **distinct** settings changed in the panel (`REVIEW_ACTION_THRESHOLD`) |
| Target    | `REVIEW_URL` = `https://www.wix.com/app-market/add-review/<APP_ID>`      |
| Surface   | A real top-level **popup window** (`window.open` with `width/height`)    |
| Width     | `WIDGET_DEFAULT_WIDTH` (matches the widget's editor box width)           |
| Height    | `Math.round(window.screen.availHeight * 0.7)` (≈70% of screen)           |
| Position  | Centred on screen                                                        |
| Frequency | Once per browser (`localStorage` key, never re-shown)                    |

---

## Files

| File                                                                                              | Role                                                                        |
| ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `src/site/widgets/custom-elements/recently-viewed-products/panel/index.tsx`                       | Counts edits, gates, opens the popup                                        |
| `src/site/widgets/custom-elements/recently-viewed-products/constants.ts`                          | `WIDGET_DEFAULT_WIDTH`                                                      |
| `src/site/widgets/custom-elements/recently-viewed-products/recently-viewed-products.extension.ts` | Uses `WIDGET_DEFAULT_WIDTH` for the widget's `defaultWidth` (single source) |
| `src/constants/index.ts`                                                                          | `REVIEW_URL`, `APP_ID`                                                      |

---

## How it works

### 1. Constants (top of `panel/index.tsx`)

```ts
// After this many distinct setting changes in the panel we prompt for a review.
const REVIEW_ACTION_THRESHOLD = 3;
// localStorage key gating the review prompt so it only ever opens once per browser.
const REVIEW_SHOWN_KEY = "recently_viewed_review_shown_v1";
```

### 2. Counting distinct edits + the once-per-browser gate

```tsx
const changedSettings = useRef(new Set<string>());
const reviewShown = useRef(
  typeof window !== "undefined" &&
    localStorage.getItem(REVIEW_SHOWN_KEY) === "1",
);

const maybePromptReview = (key: string) => {
  if (reviewShown.current) return;
  changedSettings.current.add(key); // distinct keys only
  if (changedSettings.current.size < REVIEW_ACTION_THRESHOLD) return;
  reviewShown.current = true;
  try {
    localStorage.setItem(REVIEW_SHOWN_KEY, "1");
  } catch {}

  // Open the App Market review page as its own popup window, sized to the
  // widget's width and ~70% of the screen height, centred.
  const w = WIDGET_DEFAULT_WIDTH;
  const h = Math.max(480, Math.round(window.screen.availHeight * 0.7));
  const left = Math.max(0, Math.round((window.screen.width - w) / 2));
  const top = Math.max(0, Math.round((window.screen.availHeight - h) / 2));
  window.open(
    REVIEW_URL,
    "rvReview",
    `popup=yes,width=${w},height=${h},left=${left},top=${top}`,
  );
};
```

**Why count distinct keys (a `Set`), not raw `onChange` events?** A single
slider/colour drag fires `onChange` continuously. Counting distinct setting keys
means one drag = one action, so the prompt can't trip mid-drag.

### 3. Wiring into the panel's `set()`

Every control writes through one helper, so the counter sees every edit:

```tsx
const set = <K extends keyof WidgetProps>(key: K, value: WidgetProps[K]) => {
  setValues((prev) => ({ ...prev, [key]: value }));
  const attr = PROP[key as keyof typeof PROP];
  if (attr) void widget.setProp(attr, String(value));
  maybePromptReview(key as string); // ← the only addition
};
```

### 4. Width is single-sourced with the widget box

```ts
// constants.ts
export const WIDGET_DEFAULT_WIDTH = 720;
```

```ts
// recently-viewed-products.extension.ts
import { WIDGET_DEFAULT_WIDTH } from "./constants";
// ...
width: { defaultWidth: WIDGET_DEFAULT_WIDTH, allowStretch: true },
```

So the popup width and the widget's editor box width can never drift apart.

---

## Why a popup window — and not the “nicer” options

The requirement was "a review modal on top of the editor." Every in-editor
overlay was tried and hit a hard platform limit. **The popup window is the only
approach that is reliable, clickable, and authenticated.**

| Approach                                                                    | Result                                                                                                                                                                                                |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Render the review **page in an `<iframe>`** (custom `<rate-popup>` element) | **Blank.** `…/add-review/<APP_ID>` 302-redirects to `users.wix.com/signin`, and wix.com sign-in refuses to be framed (`X-Frame-Options`/`frame-ancestors`).                                           |
| Show the iframe popup **on the widget canvas**                              | Editor steals pointer events to select the component — nothing inside the widget is **clickable** while editing.                                                                                      |
| Show the iframe popup **in the settings panel**                             | Works and even loads (the panel is an authenticated wix.com origin), but it's physically **trapped in the 300px panel iframe** — can't cover the editor.                                              |
| **`modals.openDashboardModal({ url })`** from the panel                     | **Silently no-ops.** It resolves to `panels.openDashboardPanel`, a dashboard-context API the editor host doesn't implement from a custom-element settings panel (the promise never resolves/rejects). |
| **`window.open(REVIEW_URL, …)`** new popup window                           | ✅ A real top-level wix.com window: authenticated (page loads, no sign-in redirect/blank), sits on top of the editor, fully interactive. This is what we ship.                                        |

Key detail: `width=`/`height=` in the features string make browsers open a
**window** rather than a background tab. It's fired inside the user's gesture
(the 3rd setting change), so it isn't popup-blocked.

---

## Testing / resetting

The prompt is gated to once per browser. To make it fire again:

1. DevTools → **Console** → select the **settings-panel iframe** in the frame
   dropdown.
2. Run:
   ```js
   localStorage.removeItem("recently_viewed_review_shown_v1");
   ```
3. Change **3 different** controls in the panel.

> ⚠️ **`wix dev` gotcha:** each `wix dev` run mints a new `versionOverrideId`.
> After restarting `wix dev`, **re-open the editor from the new session's
> `Editor` link** — refreshing the old editor tab loads the previous (now stale)
> override and silently falls back to the last _released_ app, so none of your
> dev changes run.

---

## Known limitations

- **Width = the widget's _configured_ width (`WIDGET_DEFAULT_WIDTH`), not its
  live on-canvas width.** The editor SDK (`@wix/editor` `widget`) exposes
  `getProp`/`setProp` but **no component dimensions**, so a user-resized widget
  width can't be read from the panel. If a user stretches the widget, the popup
  stays at `WIDGET_DEFAULT_WIDTH`.
- The browser ultimately decides window vs. tab; with `width=/height=` it opens a
  window for the vast majority of setups.

---

## Related

- `WIX_BASE_PROJECT/docs/RATE_POPUP_IMPLEMENTATION.md` — the earlier in-iframe
  `<rate-popup>` approach (works on the **dashboard** page, where the iframe is
  first-party authenticated; not in the editor).
