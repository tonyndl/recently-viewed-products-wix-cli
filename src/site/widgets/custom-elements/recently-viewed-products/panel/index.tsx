import { useEffect, useRef, useState, type FC } from "react";
import {
  Box,
  Button,
  Dropdown,
  FormField,
  Input,
  Slider,
  SidePanel,
  Text,
  TextButton,
  ToggleSwitch,
  WixDesignSystemProvider,
} from "@wix/design-system";
import "@wix/design-system/styles.global.css";
import * as Icons from "@wix/wix-ui-icons-common";
import { widget, inputs, modals } from "@wix/editor";
import { httpClient } from "@wix/essentials";
import { REVIEW_URL, DASHBOARD_APP_SLUG } from "../../../../../constants";
import {
  PROP,
  DEFAULTS,
  LAYOUT_KINDS,
  LAYOUTS_WITH_COLUMNS,
  FREE_LAYOUTS,
  WIDGET_DEFAULT_WIDTH,
} from "../constants";
import type { WidgetProps } from "../types";
import TabBar, { type TabItem } from "./ui/TabBar";
import { LayoutSkeleton } from "./ui/LayoutSkeleton";
import { LayoutPicker } from "./ui/LayoutPicker";
import { ImageRatioPicker } from "./ui/ImageRatioPicker";
import { PremiumNudge } from "./ui/premiumNudge";
import { TextPositionPicker } from "./ui/TextPositionPicker";

// After this many distinct setting changes in the panel we prompt for a review.
const REVIEW_ACTION_THRESHOLD = 3;
// localStorage key gating the review prompt so it only ever opens once per browser.
const REVIEW_SHOWN_KEY = "recently_viewed_review_shown_v1";

const COLUMN_OPTIONS = [
  { id: "0", value: "Auto" },
  ...[2, 3, 4, 5, 6].map((n) => ({ id: String(n), value: String(n) })),
];

// Bounded numeric control. Using a Slider (instead of a free-typing NumberInput)
// guarantees the value can never leave [min, max], so users can't enter an
// extreme number that breaks the widget layout. The live value is shown in the
// label since the slider itself has no persistent readout.
const NumberSlider: FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (value: number) => void;
}> = ({ label, value, min, max, unit = "px", onChange }) => (
  <FormField label={`${label} (${value}${unit})`}>
    <Slider
      min={min}
      max={max}
      step={1}
      value={value}
      displayMarks={false}
      displayTooltip
      onChange={(v: number | number[]) => onChange(Array.isArray(v) ? v[0] : v)}
    />
  </FormField>
);
const HOVER_OPTIONS = [
  { id: "none", value: "None" },
  { id: "zoom", value: "Zoom" },
  { id: "fade", value: "Fade" },
];
const ALIGN_OPTIONS = [
  { id: "left", value: "Left" },
  { id: "center", value: "Center" },
  { id: "right", value: "Right" },
];
const BEHAVIOR_OPTIONS = [
  { id: "text", value: "Show Text" },
  { id: "hide", value: "Hide Widget" },
];

// By default Dropdown appends its options list to the parent element — i.e.
// inside the scrollable settings panel — so scrolling the panel to reveal the
// options closes the dropdown. Appending to the viewport floats the list above
// the panel with fixed positioning: it isn't clipped, panel scrolling no longer
// closes it, and (unlike `window`) it doesn't grow the document body, so the
// panel keeps a single scrollbar.
const DROPDOWN_POPOVER_PROPS = { appendTo: "viewport" } as const;

const svg = (children: React.ReactNode) => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
    {children}
  </svg>
);

const TABS: TabItem[] = [
  {
    id: "layout",
    label: "Layout",
    icon: svg(
      <>
        <rect
          x="2"
          y="2"
          width="7"
          height="7"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <rect
          x="11"
          y="2"
          width="7"
          height="7"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <rect
          x="2"
          y="11"
          width="7"
          height="7"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <rect
          x="11"
          y="11"
          width="7"
          height="7"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.7"
        />
      </>,
    ),
  },
  {
    id: "items",
    label: "Items",
    icon: svg(
      <>
        <rect
          x="2"
          y="4"
          width="16"
          height="12"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <circle
          cx="7"
          cy="8.5"
          r="1.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M2 14l4-4 3 3 3-3 6 5"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>,
    ),
  },
  {
    id: "text",
    label: "Text",
    icon: svg(
      <>
        <path
          d="M4 5.5h12"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path
          d="M10 5.5V16"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path
          d="M6.5 16h7"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </>,
    ),
  },
  {
    id: "design",
    label: "Design",
    icon: svg(
      <path
        d="M10 2C10 2 4 9 4 13a6 6 0 0012 0C16 9 10 2 10 2z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />,
    ),
  },
  {
    id: "more",
    label: "More",
    icon: svg(
      <>
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
      </>,
    ),
  },
];

const sectionStyle = { padding: "8px 20px 16px" } as const;

// Small reusable color field — a swatch that opens the Wix color picker, plus a
// reset back to the default (theme) color. An empty value means "use default".
const ColorSwatch: FC<{
  value: string;
  label: string;
  onChange: (v: string) => void;
}> = ({ value, label, onChange }) => (
  <Box gap="8px" verticalAlign="middle">
    <button
      type="button"
      aria-label={label}
      onClick={async () => {
        const color = await inputs.selectColor(value || undefined, {
          onChange: (v) => onChange(v ?? ""),
        });
        if (color != null) onChange(color);
      }}
      style={{
        width: "30px",
        height: "30px",
        borderRadius: "6px",
        border: "1px solid #cdd0d4",
        background: value || "#dcdfe3",
        cursor: "pointer",
      }}
    />
    {value ? (
      <TextButton size="tiny" onClick={() => onChange("")}>
        Reset
      </TextButton>
    ) : (
      <Text size="tiny" secondary>
        Default
      </Text>
    )}
  </Box>
);

// Premium-locked version of a color field — a gradient swatch + upgrade link,
// matching the Background color control on the Design tab.
const LockedColorSwatch: FC<{
  label: string;
  onUpgrade: () => void;
  disabled?: boolean;
}> = ({ label, onUpgrade, disabled }) => (
  <Box gap="8px" verticalAlign="middle">
    <button
      type="button"
      aria-label={`${label} (Premium)`}
      onClick={onUpgrade}
      style={{
        width: "30px",
        height: "30px",
        borderRadius: "6px",
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        background: "linear-gradient(135deg, #B98BFF, #6B46FF)",
        boxShadow: "0 2px 8px rgba(107, 70, 255, 0.4)",
        cursor: "pointer",
      }}
    >
      <Icons.PremiumFilled size="16px" />
    </button>
    <TextButton size="tiny" disabled={disabled} onClick={onUpgrade}>
      Upgrade to unlock
    </TextButton>
  </Box>
);

const Panel: FC = () => {
  const [activeTab, setActiveTab] = useState("layout");
  const [values, setValues] = useState<WidgetProps>({ ...DEFAULTS });
  const [isPremium, setIsPremium] = useState(false);
  const [upgradeUrl, setUpgradeUrl] = useState<string | undefined>();
  const [helpUrl, setHelpUrl] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  // Review prompt (per WIX_BASE_PROJECT/docs/RATE_POPUP_IMPLEMENTATION.md): track
  // how many distinct settings the user changes and, once they cross
  // REVIEW_ACTION_THRESHOLD, open the App Market review popup. The settings panel
  // runs on an authenticated wix.com origin, so the embedded review page loads
  // here (unlike the sandboxed widget canvas). We count distinct settings (not
  // raw onChange events) so a single slider/color drag — which fires continuously
  // — counts as one action. Gated by a ref (per session) and localStorage (once
  // per browser).
  const changedSettings = useRef(new Set<string>());
  const reviewShown = useRef(
    typeof window !== "undefined" &&
      localStorage.getItem(REVIEW_SHOWN_KEY) === "1",
  );

  const maybePromptReview = (key: string) => {
    if (reviewShown.current) return;
    changedSettings.current.add(key);
    if (changedSettings.current.size < REVIEW_ACTION_THRESHOLD) return;
    reviewShown.current = true;
    try {
      localStorage.setItem(REVIEW_SHOWN_KEY, "1");
    } catch {}
    // Open the App Market review page as its own popup window, sized to the
    // widget's width and ~70% of the screen height, centred. A real top-level
    // window is authenticated (the review page loads) and sits on top of the
    // editor. `width=`/`height=` make the browser open a window rather than a
    // background tab; a named target reuses it if reopened.
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

  // "Need Help" on the More tab — open the app's dashboard How to Use tab as an
  // overlay ON TOP of the editor (not a new browser tab). `openDashboardModal`
  // resolves its `url` relative to the dashboard root `/dashboard/{metaSiteId}/`,
  // so the route is this app's dashboard SLUG (the segment after the site id in
  // the live URL), not a full URL or the app id — both of those 404 inside the
  // overlay. `?tab=how-to-use` deep-links to the How to Use tab. If the overlay
  // can't open, fall back to the full dashboard URL in a new browser tab.
  const openHelp = () => {
    // Send the "open How to Use" signal through both the query and the hash — the
    // dashboard shell may strip one but not the other, and the page reads either
    // via observeState (see recently-viewed.tsx).
    const url = `/${DASHBOARD_APP_SLUG}?rvtab=how-to-use#rvtab=how-to-use`;
    void modals
      .openDashboardModal({ url, closeOtherPanels: true })
      .catch(
        () => helpUrl && window.open(helpUrl, "_blank", "noopener,noreferrer"),
      );
  };

  // Free users only get the free layouts, so the panel reflects a free layout as
  // the active one (for the columns control) regardless of any layout saved
  // during a previous premium session.
  const effectiveLayout =
    isPremium || FREE_LAYOUTS.includes(values.layout)
      ? values.layout
      : FREE_LAYOUTS[0];

  useEffect(() => {
    const init = async () => {
      const get = (name: string) => widget.getProp(name);
      const [
        layout,
        columns,
        spacing,
        ratio,
        showTitle,
        showPrice,
        textPosition,
        cornerRadius,
        imageBorder,
        hoverEffect,
        bgColor,
        behavior,
        emptyText,
        headingText,
        headingShow,
        headingSize,
        headingColor,
        headingAlign,
        textSize,
        textColor,
      ] = await Promise.all([
        get(PROP.layout),
        get(PROP.columns),
        get(PROP.spacing),
        get(PROP.ratio),
        get(PROP.showTitle),
        get(PROP.showPrice),
        get(PROP.textPosition),
        get(PROP.cornerRadius),
        get(PROP.imageBorder),
        get(PROP.hoverEffect),
        get(PROP.bgColor),
        get(PROP.behavior),
        get(PROP.emptyText),
        get(PROP.headingText),
        get(PROP.headingShow),
        get(PROP.headingSize),
        get(PROP.headingColor),
        get(PROP.headingAlign),
        get(PROP.textSize),
        get(PROP.textColor),
      ]);

      const intOr = (v: string, d: number) => {
        const n = parseInt(v, 10);
        return Number.isFinite(n) && n >= 0 ? n : d;
      };

      setValues({
        layout: (LAYOUT_KINDS as readonly string[]).includes(layout)
          ? (layout as WidgetProps["layout"])
          : DEFAULTS.layout,
        columns: columns ? intOr(columns, DEFAULTS.columns) : DEFAULTS.columns,
        spacing: spacing ? intOr(spacing, DEFAULTS.spacing) : DEFAULTS.spacing,
        ratio: (
          ["square", "portrait", "landscape", "original"] as const
        ).includes(ratio as never)
          ? (ratio as WidgetProps["ratio"])
          : DEFAULTS.ratio,
        showTitle: showTitle ? showTitle === "true" : DEFAULTS.showTitle,
        showPrice: showPrice ? showPrice === "true" : DEFAULTS.showPrice,
        textPosition: (["below", "top", "onimage"] as const).includes(
          textPosition as never,
        )
          ? (textPosition as WidgetProps["textPosition"])
          : DEFAULTS.textPosition,
        cornerRadius: cornerRadius
          ? intOr(cornerRadius, DEFAULTS.cornerRadius)
          : DEFAULTS.cornerRadius,
        imageBorder: imageBorder
          ? imageBorder === "true"
          : DEFAULTS.imageBorder,
        hoverEffect: (["none", "zoom", "fade"] as const).includes(
          hoverEffect as never,
        )
          ? (hoverEffect as WidgetProps["hoverEffect"])
          : DEFAULTS.hoverEffect,
        bgColor: bgColor || DEFAULTS.bgColor,
        behavior:
          behavior === "text"
            ? "text"
            : behavior === "hide"
              ? "hide"
              : DEFAULTS.behavior,
        emptyText: emptyText ?? DEFAULTS.emptyText,
        isPremium: false,
        headingText: headingText || DEFAULTS.headingText,
        headingShow: headingShow
          ? headingShow === "true"
          : DEFAULTS.headingShow,
        headingSize: headingSize
          ? intOr(headingSize, DEFAULTS.headingSize)
          : DEFAULTS.headingSize,
        headingColor: headingColor || DEFAULTS.headingColor,
        headingAlign: (["left", "center", "right"] as const).includes(
          headingAlign as never,
        )
          ? (headingAlign as WidgetProps["headingAlign"])
          : DEFAULTS.headingAlign,
        textSize: textSize
          ? intOr(textSize, DEFAULTS.textSize)
          : DEFAULTS.textSize,
        textColor: textColor || DEFAULTS.textColor,
      });

      const plan = await httpClient
        .fetchWithAuth("/api/check-plan")
        .then((r) => r.json())
        .catch(() => ({ isPremium: false, upgradeUrl: undefined }));
      setIsPremium(plan.isPremium);
      setUpgradeUrl(plan.upgradeUrl);
      void widget.setProp(PROP.isPremium, String(plan.isPremium));
      setLoading(false);

      // Resolve the dashboard "How to Use" URL for the More tab's Need Help button
      // (best-effort — the button is simply hidden until it's available).
      httpClient
        .fetchWithAuth("/api/help-url")
        .then((r) => r.json())
        .then((d) => setHelpUrl(d?.url ?? undefined))
        .catch(() => {});
    };

    void init();
  }, []);

  // Slider drag-release fix. The settings panel runs inside an iframe, so when a
  // user drags a Slider and releases the mouse button OUTSIDE the iframe, the
  // iframe's document never receives the `mouseup` and rc-slider (which Slider is
  // built on) stays in "dragging" mode — the handle then keeps following the
  // cursor on any later movement. We synthesize a `mouseup` whenever the pointer
  // leaves the document or the window loses focus, which makes rc-slider's own
  // document-level listener fire and release the handle. Harmless when not
  // dragging (no listener is attached, so the dispatched event is ignored).
  useEffect(() => {
    const releaseDrag = () => {
      document.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
    };
    document.addEventListener("mouseleave", releaseDrag);
    window.addEventListener("blur", releaseDrag);
    return () => {
      document.removeEventListener("mouseleave", releaseDrag);
      window.removeEventListener("blur", releaseDrag);
    };
  }, []);

  const set = <K extends keyof WidgetProps>(key: K, value: WidgetProps[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    const attr = PROP[key as keyof typeof PROP];
    if (attr) void widget.setProp(attr, String(value));
    maybePromptReview(key as string);
  };

  return (
    <WixDesignSystemProvider>
      <SidePanel width="300" height="100vh">
        <SidePanel.Content noPadding stretchVertically>
          {loading ? (
            // Skeleton that mirrors the panel's first paint (tab bar + Layout
            // tab's Style boxes), so the structure is in place immediately
            // instead of a bare spinner.
            <LayoutSkeleton />
          ) : (
            <>
              <TabBar
                tabs={TABS}
                activeTab={activeTab}
                onSelect={setActiveTab}
              />

              {activeTab === "layout" && (
                <div style={sectionStyle}>
                  <Box direction="vertical" gap="18px">
                    <FormField label="Style">
                      <LayoutPicker
                        value={values.layout}
                        isPremium={isPremium}
                        onChange={(v) => set("layout", v)}
                        onUpgrade={() =>
                          upgradeUrl && window.open(upgradeUrl, "_blank")
                        }
                      />
                    </FormField>
                    {LAYOUTS_WITH_COLUMNS.includes(effectiveLayout) && (
                      <FormField label="Columns">
                        <Dropdown
                          selectedId={String(values.columns)}
                          options={COLUMN_OPTIONS}
                          popoverProps={DROPDOWN_POPOVER_PROPS}
                          onSelect={(o) => set("columns", Number(o.id))}
                        />
                      </FormField>
                    )}
                    <NumberSlider
                      label="Spacing"
                      value={values.spacing}
                      min={0}
                      max={40}
                      onChange={(v) => set("spacing", v)}
                    />
                    {!isPremium && (
                      <PremiumNudge
                        onUpgrade={() =>
                          upgradeUrl && window.open(upgradeUrl, "_blank")
                        }
                        disabled={!upgradeUrl}
                      />
                    )}
                  </Box>
                </div>
              )}

              {activeTab === "items" && (
                <div style={sectionStyle}>
                  <Box direction="vertical" gap="18px">
                    <FormField label="Image ratio">
                      <ImageRatioPicker
                        value={values.ratio}
                        isPremium={isPremium}
                        onChange={(v) => set("ratio", v)}
                        onUpgrade={() =>
                          upgradeUrl && window.open(upgradeUrl, "_blank")
                        }
                      />
                    </FormField>
                    <FormField label="Text position">
                      <TextPositionPicker
                        value={values.textPosition}
                        isPremium={isPremium}
                        onChange={(v) => set("textPosition", v)}
                        onUpgrade={() =>
                          upgradeUrl && window.open(upgradeUrl, "_blank")
                        }
                      />
                    </FormField>
                    <Box verticalAlign="middle">
                      <Box flex="1">
                        <Text size="small">Show title</Text>
                      </Box>
                      <ToggleSwitch
                        size="small"
                        checked={values.showTitle}
                        onChange={(e) => set("showTitle", e.target.checked)}
                      />
                    </Box>
                    <Box verticalAlign="middle">
                      <Box flex="1">
                        <Text size="small">Show price</Text>
                      </Box>
                      <ToggleSwitch
                        size="small"
                        checked={values.showPrice}
                        onChange={(e) => set("showPrice", e.target.checked)}
                      />
                    </Box>
                  </Box>
                </div>
              )}

              {activeTab === "text" && (
                <div style={sectionStyle}>
                  <Box direction="vertical" gap="18px">
                    <Text size="small" weight="bold">
                      Heading
                    </Text>
                    <Box verticalAlign="middle">
                      <Box flex="1">
                        <Text size="small">Show heading</Text>
                      </Box>
                      <ToggleSwitch
                        size="small"
                        checked={values.headingShow}
                        onChange={(e) => set("headingShow", e.target.checked)}
                      />
                    </Box>
                    <FormField label="Heading text">
                      <Input
                        value={values.headingText}
                        disabled={!values.headingShow}
                        placeholder={DEFAULTS.headingText}
                        onChange={(e) => set("headingText", e.target.value)}
                      />
                    </FormField>
                    <NumberSlider
                      label="Heading size"
                      value={values.headingSize}
                      min={14}
                      max={50}
                      onChange={(v) => set("headingSize", v)}
                    />
                    <FormField label="Heading alignment">
                      <Dropdown
                        selectedId={values.headingAlign}
                        options={ALIGN_OPTIONS}
                        popoverProps={DROPDOWN_POPOVER_PROPS}
                        onSelect={(o) =>
                          set(
                            "headingAlign",
                            o.id as WidgetProps["headingAlign"],
                          )
                        }
                      />
                    </FormField>
                    <FormField label="Heading color">
                      {isPremium ? (
                        <ColorSwatch
                          value={values.headingColor}
                          label="Heading color"
                          onChange={(v) => set("headingColor", v)}
                        />
                      ) : (
                        <LockedColorSwatch
                          label="Heading color"
                          disabled={!upgradeUrl}
                          onUpgrade={() =>
                            upgradeUrl && window.open(upgradeUrl, "_blank")
                          }
                        />
                      )}
                    </FormField>

                    <Text size="small" weight="bold">
                      Product name &amp; price
                    </Text>
                    <NumberSlider
                      label="Text size"
                      value={values.textSize}
                      min={12}
                      max={24}
                      onChange={(v) => set("textSize", v)}
                    />
                    <FormField
                      label="Text color"
                      infoContent="Applies to the name &amp; price below or above the image. On-image text stays light for contrast."
                    >
                      {isPremium ? (
                        <ColorSwatch
                          value={values.textColor}
                          label="Product text color"
                          onChange={(v) => set("textColor", v)}
                        />
                      ) : (
                        <LockedColorSwatch
                          label="Product text color"
                          disabled={!upgradeUrl}
                          onUpgrade={() =>
                            upgradeUrl && window.open(upgradeUrl, "_blank")
                          }
                        />
                      )}
                    </FormField>
                  </Box>
                </div>
              )}

              {activeTab === "design" && (
                <div style={sectionStyle}>
                  <Box direction="vertical" gap="18px">
                    <NumberSlider
                      label="Image corners"
                      value={values.cornerRadius}
                      min={0}
                      max={24}
                      onChange={(v) => set("cornerRadius", v)}
                    />
                    <FormField label="Hover effect">
                      <Dropdown
                        selectedId={values.hoverEffect}
                        options={HOVER_OPTIONS}
                        popoverProps={DROPDOWN_POPOVER_PROPS}
                        onSelect={(o) =>
                          set("hoverEffect", o.id as WidgetProps["hoverEffect"])
                        }
                      />
                    </FormField>
                    <FormField label="Background color">
                      {isPremium ? (
                        <Box gap="8px" verticalAlign="middle">
                          <button
                            type="button"
                            aria-label="Pick background color"
                            onClick={async () => {
                              const color = await inputs.selectColor(
                                values.bgColor || undefined,
                                {
                                  onChange: (v) => set("bgColor", v ?? ""),
                                },
                              );
                              if (color != null) set("bgColor", color);
                            }}
                            style={{
                              width: "30px",
                              height: "30px",
                              borderRadius: "6px",
                              border: "1px solid #cdd0d4",
                              background: values.bgColor || "transparent",
                              cursor: "pointer",
                            }}
                          />
                          {values.bgColor ? (
                            <TextButton
                              size="tiny"
                              onClick={() => set("bgColor", "")}
                            >
                              Reset
                            </TextButton>
                          ) : (
                            <Text size="tiny" secondary>
                              Transparent
                            </Text>
                          )}
                        </Box>
                      ) : (
                        <Box gap="8px" verticalAlign="middle">
                          <button
                            type="button"
                            aria-label="Background color (Premium)"
                            onClick={() =>
                              upgradeUrl && window.open(upgradeUrl, "_blank")
                            }
                            style={{
                              width: "30px",
                              height: "30px",
                              borderRadius: "6px",
                              border: "none",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#fff",
                              background:
                                "linear-gradient(135deg, #B98BFF, #6B46FF)",
                              boxShadow: "0 2px 8px rgba(107, 70, 255, 0.4)",
                              cursor: "pointer",
                            }}
                          >
                            <Icons.PremiumFilled size="16px" />
                          </button>
                          <TextButton
                            size="tiny"
                            disabled={!upgradeUrl}
                            onClick={() =>
                              upgradeUrl && window.open(upgradeUrl, "_blank")
                            }
                          >
                            Upgrade to unlock
                          </TextButton>
                        </Box>
                      )}
                    </FormField>
                    <Box verticalAlign="middle">
                      <Box flex="1">
                        <Text size="small">Image border</Text>
                      </Box>
                      <ToggleSwitch
                        size="small"
                        checked={values.imageBorder}
                        onChange={(e) => set("imageBorder", e.target.checked)}
                      />
                    </Box>
                  </Box>
                </div>
              )}

              {activeTab === "more" && (
                <div style={sectionStyle}>
                  <FormField
                    label="When no items to display"
                    infoContent="What to show when the visitor hasn't viewed any products yet."
                  >
                    <Dropdown
                      selectedId={values.behavior}
                      options={BEHAVIOR_OPTIONS}
                      popoverProps={DROPDOWN_POPOVER_PROPS}
                      onSelect={(o) =>
                        set("behavior", o.id as WidgetProps["behavior"])
                      }
                    />
                  </FormField>
                  {values.behavior === "text" && (
                    <Box marginTop="SP3">
                      <FormField label="Text to show">
                        <Input
                          value={values.emptyText}
                          placeholder={DEFAULTS.emptyText}
                          onChange={(e) => set("emptyText", e.target.value)}
                        />
                      </FormField>
                    </Box>
                  )}
                </div>
              )}

              {activeTab === "more" && !isPremium && (
                <Box padding="8px 20px 16px">
                  <div
                    style={{
                      background: "#FFF8E1",
                      border: "1px solid #FFE082",
                      borderRadius: "8px",
                      padding: "12px",
                    }}
                  >
                    <Box direction="vertical" gap="8px">
                      <Text size="small" weight="bold">
                        Remove the watermark
                      </Text>
                      <Text size="tiny" secondary>
                        Upgrade to Premium to hide the "Powered by PURPLE"
                        badge.
                      </Text>
                      <Button
                        size="small"
                        skin="premium"
                        prefixIcon={<Icons.PremiumFilled />}
                        disabled={!upgradeUrl}
                        onClick={() =>
                          upgradeUrl && window.open(upgradeUrl, "_blank")
                        }
                      >
                        Remove Watermark
                      </Button>
                    </Box>
                  </div>
                </Box>
              )}

              {activeTab === "more" && (
                <Box padding="8px 20px 16px">
                  <TextButton
                    weight="bold"
                    prefixIcon={<Icons.ChatFilled />}
                    onClick={openHelp}
                  >
                    Need help ?
                  </TextButton>
                </Box>
              )}
            </>
          )}
        </SidePanel.Content>
      </SidePanel>
    </WixDesignSystemProvider>
  );
};

export default Panel;
