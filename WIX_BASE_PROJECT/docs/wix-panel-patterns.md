# Wix Widget Settings Panel — Patterns & Conventions

A reusable reference for building consistent, well-structured settings panels for Wix custom element widgets. All patterns here are framework-agnostic and apply to any Wix app.

---

## 1. Panel Shell Structure

Every panel wraps its content in `WixDesignSystemProvider` and `SidePanel` from `@wix/design-system`. The panel is a fixed-width sidebar (300px) that renders inside the Wix editor.

```tsx
import { widget } from "@wix/editor";
import { SidePanel, WixDesignSystemProvider, Box } from "@wix/design-system";
import "@wix/design-system/styles.global.css"; // import ONCE, at the root panel only

const Panel: FC = () => {
  const [activeTab, setActiveTab] = useState("content");

  return (
    <WixDesignSystemProvider>
      <SidePanel width="300" height="100vh">
        <SidePanel.Content noPadding stretchVertically>
          <TabBar activeTab={activeTab} onSelect={setActiveTab} />
          <Box direction="vertical">
            {activeTab === "content" && <ContentTab ... />}
            {activeTab === "style"   && <StyleTab ... />}
            {/* ... */}
          </Box>
        </SidePanel.Content>
      </SidePanel>
    </WixDesignSystemProvider>
  );
};
```

**Rules:**

- Import `@wix/design-system/styles.global.css` only in the root panel file — never in sub-components.
- Use a `TabBar` to split settings into logical groups (Content, Style, Colors, Button, etc.).
- Each tab renders its own component. Pass only the props that tab needs.

---

## 2. TabBar

Build a custom `TabBar` using plain `<button>` elements — do **not** use the WDS `Tabs` component inside a panel, as it is designed for page-level navigation and does not fit the panel's compact layout.

```tsx
const TABS = [
  { id: "content", label: "Content", icon: <svg>...</svg> },
  { id: "style", label: "Style", icon: <svg>...</svg> },
  // ...
];

const TabBar: FC<{ activeTab: string; onSelect: (id: string) => void }> = ({
  activeTab,
  onSelect,
}) => (
  <div
    style={{
      position: "sticky",
      top: 0,
      zIndex: 10,
      background: "#fff",
      borderBottom: "1px solid #e8e8e8",
    }}
  >
    <div style={{ display: "flex", overflowX: "auto" }}>
      {TABS.map(({ id, label, icon }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
            style={{
              flex: "1 0 auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              padding: "10px 4px",
              border: "none",
              background: "none",
              cursor: "pointer",
              color: active ? "#116DFF" : "#6B7280",
              borderBottom: active
                ? "2px solid #116DFF"
                : "2px solid transparent",
            }}
          >
            {icon}
            <span style={{ fontSize: "10px", fontWeight: 500 }}>{label}</span>
          </button>
        );
      })}
    </div>
  </div>
);
```

---

## 3. PanelField — The Basic Row Container

`PanelField` is a simple wrapper that applies consistent horizontal padding (20px) and an optional bottom divider. Use it around every setting row.

```tsx
const PanelField: FC<{ children: React.ReactNode; noDivider?: boolean }> = ({
  children,
  noDivider = false,
}) => (
  <div
    style={{
      paddingTop: "12px",
      paddingLeft: "20px",
      paddingRight: "20px",
      paddingBottom: noDivider ? "12px" : 0,
    }}
  >
    {children}
    {!noDivider && (
      <div
        style={{ height: "1px", background: "#e8e8e8", marginTop: "12px" }}
      />
    )}
  </div>
);
```

- Use `noDivider` when the next item already has its own top spacing or when multiple fields are grouped inside one `PanelField`.
- Use the WDS `<Divider />` component between distinct logical sections (e.g. between sliders and toggles).

---

## 4. Toggle Rows with Info Icon + Tooltip

### Layout

Every toggle setting follows this vertical layout — label + tooltip icon on top, toggle switch below. This matches Wix's own panel patterns.

```
Label text  (i)
[toggle]
```

### Implementation

```tsx
import React, { type FC, useState } from "react";
import { Box, Text, ToggleSwitch, Tooltip } from "@wix/design-system";
import { InfoCircleSmall } from "@wix/wix-ui-icons-common";
import PanelField from "./PanelField";

interface ToggleRowProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  tooltip?: string; // shown as (i) icon when provided
  noField?: boolean; // skip PanelField wrapper (for inline use)
}

const ToggleRow: FC<ToggleRowProps> = ({
  label,
  checked,
  onChange,
  tooltip,
  noField,
}) => {
  const [iconHovered, setIconHovered] = useState(false);

  const content = (
    <Box direction="vertical" gap="SP2">
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <Text size="small">{label}</Text>
        {tooltip && (
          <Tooltip content={tooltip} appendTo="window" maxWidth={220}>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "default",
                color: iconHovered ? "#116dff" : "#999",
              }}
              onMouseEnter={() => setIconHovered(true)}
              onMouseLeave={() => setIconHovered(false)}
            >
              <InfoCircleSmall />
            </span>
          </Tooltip>
        )}
      </div>
      <ToggleSwitch
        size="medium"
        checked={checked}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange(e.target.checked)
        }
      />
    </Box>
  );

  return noField ? content : <PanelField noDivider>{content}</PanelField>;
};
```

### Tooltip Color Override

The WDS `Tooltip` has a hardcoded dark background. To make it white with black text, inject a CSS variable override once in the panel's root `useEffect`:

```tsx
// in Panel component
useEffect(() => {
  const style = document.createElement("style");
  style.id = "wds-tooltip-light";
  style.textContent = `
    :root {
      --wds-tooltip-background-fill: #ffffff;
      --wds-tooltip-text-fill: #000000;
    }
  `;
  if (!document.getElementById("wds-tooltip-light")) {
    document.head.appendChild(style);
  }
  return () => document.getElementById("wds-tooltip-light")?.remove();
}, []);
```

This overrides the two CSS variables the WDS Tooltip reads at render time. It affects all tooltips in the panel, which is the desired behaviour.

---

## 5. Color Picker with Site Theme Integration

Wix provides `inputs.selectColor` from `@wix/editor` which opens the editor's native color picker — including the site's own theme palette. This means users can pick any color from their brand colors without having to copy/paste hex codes.

### ColorPickerField component

```tsx
import React, { type FC } from "react";
import { inputs } from "@wix/editor";
import { Box, Text, FillPreview } from "@wix/design-system";
import PanelField from "./PanelField";

interface ColorPickerFieldProps {
  label: string;
  value: string; // hex or rgba string, e.g. "#4f46e5"
  onChange: (value: string) => void;
}

const ColorPickerField: FC<ColorPickerFieldProps> = ({
  label,
  value,
  onChange,
}) => (
  <PanelField noDivider>
    <Box align="space-between" verticalAlign="middle">
      <Box direction="vertical" gap="2px">
        <Text size="small">{label}</Text>
        <Text size="tiny" secondary>
          {value}
        </Text>
      </Box>
      <div
        style={{
          width: "38px",
          height: "38px",
          borderRadius: "8px",
          overflow: "hidden",
          cursor: "pointer",
          border: "1.5px solid rgba(0,0,0,0.14)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          flexShrink: 0,
        }}
        onClick={() =>
          inputs.selectColor(value, {
            onChange: (val) => {
              if (val) onChange(val);
            },
          })
        }
      >
        <FillPreview fill={value} />
      </div>
    </Box>
  </PanelField>
);

export default ColorPickerField;
```

**How it works:**

- `inputs.selectColor(currentValue, { onChange })` opens the editor's built-in color picker.
- The picker includes the site's theme palette (the colors the site owner defined in their theme), recent colors, and a custom hex/rgba input.
- `onChange` fires live as the user drags the color wheel — wire it directly to `widget.setProp` for real-time preview.

**Usage:**

```tsx
<ColorPickerField
  label="Button background"
  value={buttonBgColor}
  onChange={(v) => {
    setButtonBgColor(v);
    set("button-bg-color", v);
  }}
/>
```

---

## 6. Checking if User is Premium

### Backend API route — `src/pages/api/check-plan.ts`

```ts
import type { APIRoute } from "astro";
import { auth } from "@wix/essentials";
import { appInstances } from "@wix/app-management";
import { customJson } from "../../utils/customJson";

const APP_ID = "your-app-id-here";
const FALLBACK_UPGRADE_URL = `https://www.wix.com/apps/upgrade/${APP_ID}`;

export const GET: APIRoute = () => {
  const elevatedGetAppInstance = auth.elevate(appInstances.getAppInstance);
  return elevatedGetAppInstance()
    .then(({ instance }) => {
      const isPremium = instance ? !instance.isFree : false;
      const instanceId = instance?.instanceId;
      const upgradeUrl = !isPremium
        ? instanceId
          ? `https://www.wix.com/apps/upgrade/${APP_ID}?appInstanceId=${instanceId}`
          : FALLBACK_UPGRADE_URL
        : undefined;
      return customJson({ isPremium, upgradeUrl });
    })
    .catch(() =>
      customJson({ isPremium: false, upgradeUrl: FALLBACK_UPGRADE_URL }),
    );
};
```

### Fetching from the panel

Use `httpClient.fetchWithAuth` from `@wix/essentials` — this attaches the Wix auth token automatically.

```ts
import { httpClient } from "@wix/essentials";

const baseApiUrl = new URL(import.meta.url).origin;

const checkPlan = () =>
  httpClient
    .fetchWithAuth(`${baseApiUrl}/api/check-plan`)
    .then(
      (r) => r.json() as Promise<{ isPremium: boolean; upgradeUrl?: string }>,
    );
```

Then call it in the panel's `useEffect` alongside the widget prop fetches:

```tsx
const [isPremium, setIsPremium] = useState(false);
const [upgradeUrl, setUpgradeUrl] = useState<string | undefined>();

useEffect(() => {
  Promise.all([checkPlan(), widget.getProp("title"), ...])
    .then(([plan, title, ...]) => {
      setIsPremium(plan.isPremium);
      setUpgradeUrl(plan.upgradeUrl);
      widget.setProp("ispremium", String(plan.isPremium)); // push to widget
      // ... other setters
    })
    .catch(() => setIsPremium(false));
}, []);
```

### Propagating to the widget

Push `ispremium` to the widget prop so it can gate features on the live site too:

```ts
// In panel useEffect after plan check:
widget.setProp("ispremium", String(plan.isPremium));
```

```tsx
// In widget/index.tsx:
const CountdownWidget: FC<WidgetProps> = ({
  ispremium = "false",
  // ...
}) => {
  const isPremium = ispremium === "true";
  // use isPremium to gate features
};
```

### Premium-gated toggle pattern

For a feature that requires premium, show an Upgrade button next to the label, grey out the toggle, and add a tooltip explaining what the feature does.

```tsx
import { Button } from "@wix/design-system";
import { PremiumFilled } from "@wix/wix-ui-icons-common";

interface PremiumToggleRowProps {
  label: string;
  tooltip: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  isPremium: boolean;
  upgradeUrl?: string;
}

const PremiumToggleRow: FC<PremiumToggleRowProps> = ({
  label,
  tooltip,
  checked,
  onChange,
  isPremium,
  upgradeUrl,
}) => (
  <PanelField noDivider>
    <Box direction="vertical" gap="SP1">
      <Box align="space-between" verticalAlign="middle">
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Text size="small">{label}</Text>
          {/* info icon + tooltip — same pattern as ToggleRow */}
        </div>
        {!isPremium && (
          <Button
            size="tiny"
            skin="premium"
            prefixIcon={<PremiumFilled />}
            onClick={() => upgradeUrl && window.open(upgradeUrl, "_blank")}
          >
            Upgrade
          </Button>
        )}
      </Box>
      <ToggleSwitch
        size="medium"
        checked={isPremium ? checked : false}
        disabled={!isPremium}
        onChange={(e) => {
          if (isPremium) onChange(e.target.checked);
        }}
      />
    </Box>
  </PanelField>
);
```

**Visual behaviour:**

- Free user: label + purple "Upgrade" button, greyed-out disabled toggle.
- Premium user: label only, normal active toggle.

---

## 7. Prop Flow Summary

```
Panel (useEffect)
  ├── widget.getProp("some-prop")  →  local state
  └── widget.setProp("some-prop", value)  →  widget re-renders

Widget (web component)
  ├── receives props as strings (web component limitation)
  ├── parse booleans:  prop !== "false"  or  prop === "true"
  └── parse numbers:   parseInt(prop) || defaultValue
```

Always store booleans as the string `"true"` / `"false"` in widget props, never as actual booleans. The web component boundary converts everything to strings.
