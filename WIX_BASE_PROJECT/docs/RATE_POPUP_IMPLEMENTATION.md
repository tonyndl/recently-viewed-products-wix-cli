# Rate Popup Implementation

A custom iframe-based review popup that loads the Wix App Market review page. Shows once per browser, triggered by the Save button on the image picker dashboard page.

---

## Files

| File                                                           | Role                                   |
| -------------------------------------------------------------- | -------------------------------------- |
| `src/extensions/dashboard/_shared/rate-popup.ts`               | Web component + `openRatePopup` helper |
| `src/extensions/dashboard/pages/image-picker/image-picker.tsx` | Triggers the popup on Save             |

---

## How It Works

The popup is a custom HTML element (`<rate-popup>`) that renders into a fixed portal using Shadow DOM, completely isolated from the host page's styles. It loads the Wix App Market review page in an `<iframe>`.

### Why a custom element instead of a WDS Modal?

Wix's `dashboard.requestFeedback()` requires a `formSetId` provisioned by Wix. The custom element approach works out of the box by loading the review URL directly:

```
https://www.wix.com/app-market/add-review/<APP_ID>
```

---

## Usage

### 1. Import the helper

```ts
import { openRatePopup } from "../../_shared/rate-popup";
```

### 2. Define constants

```ts
const APP_ID = "b10a8749-4bac-431f-acbd-e426588176d7";
const REVIEW_URL = `https://www.wix.com/app-market/add-review/${APP_ID}`;
const REVIEW_SHOWN_KEY = "before_after_slider_review_shown_v1";
```

### 3. Track whether the popup has been shown

```tsx
const [reviewShown, setReviewShown] = useState(
  () =>
    typeof window !== "undefined" &&
    localStorage.getItem(REVIEW_SHOWN_KEY) === "1",
);
```

### 4. Trigger on Save (once only)

```tsx
const handleSave = useCallback(() => {
  try {
    localStorage.setItem(REVIEW_SHOWN_KEY, "1");
    setReviewShown(true);
    setTimeout(() => openRatePopup(REVIEW_URL), 2000);
  } catch {}
}, []);
```

### 5. Conditionally render the Save button

```tsx
actionsBar={
  !reviewShown ? <Button onClick={handleSave}>Save</Button> : undefined
}
```

The Save button hides itself after being clicked and stays hidden on subsequent visits because the state initializer reads from `localStorage` on mount.

---

## `openRatePopup` API

```ts
openRatePopup(reviewUrl?: string, options?: { isEditor?: boolean })
```

| Parameter          | Type                 | Description                                                                   |
| ------------------ | -------------------- | ----------------------------------------------------------------------------- |
| `reviewUrl`        | `string` (optional)  | Override the review URL. Defaults to the app's market review page.            |
| `options.isEditor` | `boolean` (optional) | Renders a smaller dialog (460×480px) suited for the Wix editor panel context. |

---

## Popup Behaviour

- **Backdrop click** — closes the popup
- **Escape key** — closes the popup
- **Focus trap** — keyboard focus is locked inside the dialog while open; returns to the previously focused element on close
- **Single instance** — only one `<rate-popup>` element is ever added to the DOM; subsequent calls to `openRatePopup` reuse it

---

## Show-Once Logic

The popup is gated by a `localStorage` key so it only ever appears once per browser:

```
Key:   before_after_slider_review_shown_v1
Value: '1'  (set immediately when Save is clicked, before the popup opens)
```

The Save button itself is also hidden once the key is set, so users who have already reviewed are not prompted again.

### Testing: reset the popup

The `localStorage.clear()` command must be run **inside the dashboard iframe's context**, not the editor's main window. In Chrome DevTools:

1. Open the **Console** tab
2. Click the frame selector dropdown (top-left of the console)
3. Select the dashboard iframe
4. Run:

```js
localStorage.removeItem("before_after_slider_review_shown_v1");
```

Then reload the dashboard page — the Save button will reappear.

---

## Dialog Sizes

| Context                   | Width                    | Height                   |
| ------------------------- | ------------------------ | ------------------------ |
| Dashboard (default)       | min(770px, 100vw − 48px) | min(650px, 100vh − 48px) |
| Editor (`isEditor: true`) | min(460px, 100vw − 32px) | min(480px, 100vh − 32px) |
