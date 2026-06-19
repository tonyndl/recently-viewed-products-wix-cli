# Panel Tab Bar Component

A sticky icon + label tab navigation bar for Wix editor panels. Matches the native Wix Settings panel look (segmented control pill style).

---

## Visual result

A gray pill container sits at the top of the panel. Each tab has a centered SVG icon above an ALL-CAPS label. The active tab lifts to white with a subtle shadow; inactive tabs are `#6B7280`.

---

## Files to create

```
panel/
├── ui/
│   ├── TabBar.tsx
│   └── styles/
│       └── TabBar.ts
```

---

## `panel/ui/styles/TabBar.ts`

Copy this file as-is — it never changes between projects.

```ts
import type { CSSProperties } from "react";

export const styles = {
  stickyWrapper: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    background: "#fff",
    padding: "10px 12px 8px",
  } as CSSProperties,
  container: {
    display: "flex",
    background: "#EBEBEC",
    borderRadius: "10px",
    padding: "3px",
    gap: "2px",
  } as CSSProperties,
  tab: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "3px",
    padding: "6px 2px",
    border: "none",
    borderRadius: "8px",
    background: "transparent",
    cursor: "pointer",
    transition: "all 0.15s ease",
    outline: "none",
  } as CSSProperties,
  tabActive: {
    background: "#FFFFFF",
    boxShadow: "0 1px 4px rgba(0,0,0,0.14), 0 1px 2px rgba(0,0,0,0.08)",
  } as CSSProperties,
  label: {
    fontSize: "7px",
    fontWeight: 600,
    letterSpacing: "0.3px",
    textTransform: "uppercase" as const,
    lineHeight: 1,
  } as CSSProperties,
};
```

**Font rules (do not change these):**

- `fontSize: "7px"` — fits under icons without wrapping at any tab count
- `fontWeight: 600` — semi-bold so labels read at tiny size
- `letterSpacing: "0.3px"` — breathing room between uppercase letters
- `textTransform: "uppercase"` — always all-caps regardless of the string passed
- `lineHeight: 1` — label sits tight under the icon with no extra gap

---

## `panel/ui/TabBar.tsx`

The component itself never changes between projects. The only thing you supply is the `tabs` prop — an array you define in the parent panel.

```tsx
import type { FC } from "react";
import type { ReactNode } from "react";
import { styles } from "./styles/TabBar";

export interface TabItem {
  id: string; // unique key, used to track which tab is active
  label: string; // display text — rendered uppercase by CSS
  icon: ReactNode; // 16×16 SVG (use stroke="currentColor" so color is inherited)
}

interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onSelect: (id: string) => void;
}

const TabBar: FC<TabBarProps> = ({ tabs, activeTab, onSelect }) => (
  <div style={styles.stickyWrapper}>
    <div style={styles.container}>
      {tabs.map(({ id, label, icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            style={{
              ...styles.tab,
              ...(isActive ? styles.tabActive : {}),
              color: isActive ? "#116DFF" : "#6B7280",
            }}
            onClick={() => onSelect(id)}
          >
            {icon}
            <span
              style={{
                ...styles.label,
                color: isActive ? "#116DFF" : "#6B7280",
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  </div>
);

export default TabBar;
```

---

## Wiring it into `panel/index.tsx`

Define your tabs here — labels and ids are whatever makes sense for your app.

```tsx
import { useState } from "react";
import TabBar, { type TabItem } from "./ui/TabBar";

// Define tabs for THIS app — change ids, labels, and icons freely
const TABS: TabItem[] = [
  {
    id: "content", // <-- your id
    label: "Content", // <-- your label (CSS uppercases it automatically)
    icon: (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
        {/* your SVG paths — see icon guidelines below */}
        <path
          d="M4 7h12M4 10.5h12M4 14h8"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "settings",
    label: "Settings",
    icon: (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
        <circle
          cx="10"
          cy="10"
          r="2.5"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path
          d="M10 3v2M10 15v2M3 10h2M15 10h2"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  // add as many tabs as your app needs
];

export default function Panel() {
  const [activeTab, setActiveTab] = useState(TABS[0].id); // default to first tab

  return (
    <div style={{ fontFamily: "Madefor, sans-serif" }}>
      <TabBar tabs={TABS} activeTab={activeTab} onSelect={setActiveTab} />

      {/* Render the matching tab content */}
      {activeTab === "content" && <ContentTab />}
      {activeTab === "settings" && <SettingsTab />}
    </div>
  );
}
```

---

## Tab definition rules

| Field   | Type        | Rule                                                                               |
| ------- | ----------- | ---------------------------------------------------------------------------------- |
| `id`    | `string`    | Unique, lowercase, no spaces — e.g. `"colors"`, `"button"`, `"layout"`             |
| `label` | `string`    | Write in Title Case — CSS transforms it to uppercase automatically                 |
| `icon`  | `ReactNode` | 16×16 SVG — must use `stroke="currentColor"` so active/inactive color is inherited |

Any number of tabs works — each button has `flex: 1` so they always fill the pill evenly.

---

## Reusable SVG icons

These icons are generic enough to reuse across any project. All follow the same stroke rules.

```tsx
// Content / text lines
<svg width="16" height="16" viewBox="0 0 20 20" fill="none">
  <path d="M4 7h12M4 10.5h12M4 14h8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
</svg>

// Clock / timer
<svg width="16" height="16" viewBox="0 0 20 20" fill="none">
  <circle cx="10" cy="11.5" r="6" stroke="currentColor" strokeWidth="1.7" />
  <path d="M10 8v3.5l2 1.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M8 3h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
</svg>

// Style / overlapping squares
<svg width="16" height="16" viewBox="0 0 20 20" fill="none">
  <rect x="2" y="5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
  <rect x="10" y="7" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
</svg>

// Text / typography (T)
<svg width="16" height="16" viewBox="0 0 20 20" fill="none">
  <path d="M3 5h14M10 5v10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  <path d="M7 15h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
</svg>

// Colors / water drop
<svg width="16" height="16" viewBox="0 0 20 20" fill="none">
  <path d="M10 2C10 2 4 9 4 13a6 6 0 0012 0C16 9 10 2 10 2z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
</svg>

// Button / pill rectangle
<svg width="16" height="16" viewBox="0 0 20 20" fill="none">
  <rect x="2" y="7" width="16" height="6" rx="3" stroke="currentColor" strokeWidth="1.7" />
  <path d="M7 10h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
</svg>

// Settings / gear (simple)
<svg width="16" height="16" viewBox="0 0 20 20" fill="none">
  <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.7" />
  <path d="M10 3v2M10 15v2M3 10h2M15 10h2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
</svg>

// Layout / grid
<svg width="16" height="16" viewBox="0 0 20 20" fill="none">
  <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
  <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
  <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
  <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
</svg>

// Image / photo
<svg width="16" height="16" viewBox="0 0 20 20" fill="none">
  <rect x="2" y="4" width="16" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
  <circle cx="7" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
  <path d="M2 14l4-4 3 3 3-3 6 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
</svg>
```

---

## SVG icon guidelines (when drawing your own)

```
width="16" height="16" viewBox="0 0 20 20" fill="none"
stroke="currentColor"
strokeWidth="1.7"
strokeLinecap="round"
strokeLinejoin="round"   ← add this on paths with sharp corners
```

- Always `fill="none"` + `stroke="currentColor"` — the button's `color` prop drives the icon color automatically
- Draw in a 20×20 viewBox — the element renders at 16×16, so you get 2px natural padding
- Keep it to 2–3 strokes maximum — icons must read clearly at 16px
- Use `rx` on `<rect>` for rounded corners (`rx="1.5"` = subtle, `rx="3"` = pill)

---

## Color tokens

| Token           | Value                                                    | Usage                          |
| --------------- | -------------------------------------------------------- | ------------------------------ |
| Active          | `#116DFF`                                                | Icon + label when selected     |
| Inactive        | `#6B7280`                                                | Icon + label when not selected |
| Pill background | `#EBEBEC`                                                | Container behind all tabs      |
| Active tab bg   | `#FFFFFF`                                                | Selected tab background        |
| Active shadow   | `0 1px 4px rgba(0,0,0,0.14), 0 1px 2px rgba(0,0,0,0.08)` | Lift effect on selected tab    |
