# Embedded Scripts Require an `embedScript()` Call

**TL;DR — Defining an `embeddedScript` extension does NOT inject it. Wix only runs
the script on a site after the app calls `embedScript()`. Without that call the
script never appears in the page (`<script>` tag is absent), so anything that
depends on it silently does nothing.**

This cost a long debugging session: the Recently Viewed tracker was registered,
built, released, and the app reinstalled — yet `document.scripts` showed no
embedded script and `localStorage["pagesplugin"]` stayed `null`. The fix was not
a code/consent/path issue; it was the missing `embedScript()` call.

---

## How embedded scripts actually get onto a site

1. **Define** the extension (`extensions.embeddedScript({...})`) — this only
   _registers_ the script in the app.
2. **Release** the app (`wix release`) — this registers the script **component**
   in the app's configuration. `embedScript()` will not work until you've done a
   release (a plain `wix dev`/`preview`/site publish is not enough).
3. **Call `embedScript()`** at runtime — this is what injects the `<script>` into
   the site's pages. **Until this is called, the script is never on the site.**

Reinstalling the app or republishing the site does **not** inject the script on
its own — `embedScript()` must run.

---

## How it's wired in this project

The tracker ([recently-viewed-tracker.extension.ts](../../src/extensions/embedded-scripts/recently-viewed-tracker/recently-viewed-tracker.extension.ts))
is embedded from **two** places so both new and existing installs are covered:

### 1. App-install event (auto, for new installs)

[`src/extensions/backend/events/app-install/app-install.ts`](../../src/extensions/backend/events/app-install/app-install.ts)

```ts
import { auth } from "@wix/essentials";
import { appInstances, embeddedScripts } from "@wix/app-management";

const elevatedEmbedScript = auth.elevate(embeddedScripts.embedScript);

export default appInstances.onAppInstanceInstalled(async (event) => {
  try {
    await elevatedEmbedScript({ parameters: {} });
  } catch (err) {
    console.error("[app-installed] embedScript failed:", err);
  }
  // …rest of install handler…
});
```

### 2. Dashboard page mount (covers already-installed sites)

[`src/extensions/dashboard/pages/recently-viewed/recently-viewed.tsx`](../../src/extensions/dashboard/pages/recently-viewed/recently-viewed.tsx)

```tsx
import { embeddedScripts } from "@wix/app-management";

useEffect(() => {
  embeddedScripts
    .embedScript({ parameters: {} })
    .catch((err) => console.error("[embedScript] failed:", err));
}, []);
```

`embedScript()` is **idempotent**, so calling it from both places is safe. The
dashboard call runs as the site owner (no `auth.elevate` needed); the event
handler runs server-side, so it uses `auth.elevate`.

---

## The `parameters` argument

- `embedScript({ parameters: {...} })` — `parameters` must contain **every**
  dynamic parameter (`{{Name}}`) referenced in the script's HTML. **Omitting one
  errors and the script is not embedded.**
- Our tracker has **no** dynamic parameters, so we pass `parameters: {}`.

## `componentId` — only for multiple scripts

- If the app has **more than one** embedded script, you must pass the script's
  `id` as `componentId`:
  `embedScript({ parameters: {...} }, { options: { componentId: "<id>" } })`.
- We have **one** embedded script, so we **do not** pass `componentId`. Passing it
  for a single-script app can break the app in production (per the Wix docs).

---

## Verifying on a live site

On a live storefront page (after release + the dashboard/install embed ran):

```js
// Is the script injected?
document.querySelector('script[src*="embedded-scripts"]')?.src ?? "NOT FOUND";

// Did the tracker record a product view? (visit a /product-page/<slug> first)
localStorage.getItem("pagesplugin");
```

- `NOT FOUND` → `embedScript()` hasn't run (or release wasn't done). Open the app
  dashboard once, or reinstall, after a `wix release`.
- A URL + slugs → working.

---

## Gotchas seen along the way

- **`scriptType` and consent:** `FUNCTIONAL` / `ANALYTICS` / `ADVERTISING` scripts
  are gated behind cookie consent and silently don't run until the visitor
  accepts cookies. The tracker uses **`ESSENTIAL`** so it always runs (it only
  stores a product slug in the visitor's own localStorage — first-party, no
  personal data). See [recently-viewed-tracker.extension.ts](../../src/extensions/embedded-scripts/recently-viewed-tracker/recently-viewed-tracker.extension.ts).
- **`wix release` is mandatory** before `embedScript()` works — it registers the
  component. Editing/`wix dev`/site-publish alone won't make the call succeed.
- **Reinstalling/republishing is not the fix by itself** — the install handler
  only embeds because it now _calls_ `embedScript()`; the call is the thing that
  matters, not the reinstall.

## Sources

- About Embedded Scripts — <https://dev.wix.com/docs/build-apps/develop-your-app/extensions/site-extensions/embedded-scripts/about-embedded-scripts>
- Add an Embedded Script Extension with the Wix CLI — <https://dev.wix.com/docs/wix-cli/guides/extensions/site-extensions/embedded-scripts/add-an-embedded-script-extension>
- Embed Script API reference — <https://dev.wix.com/docs/api-reference/app-management/embedded-scripts/embed-script>
