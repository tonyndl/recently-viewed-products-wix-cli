import { useEffect, useState, type FC } from 'react';
import {
  Box,
  Button,
  Dropdown,
  FormField,
  Input,
  Loader,
  NumberInput,
  SegmentedToggle,
  SidePanel,
  Text,
  TextButton,
  ToggleSwitch,
  WixDesignSystemProvider,
} from '@wix/design-system';
import '@wix/design-system/styles.global.css';
import * as Icons from '@wix/wix-ui-icons-common';
import { widget, inputs } from '@wix/editor';
import { httpClient } from '@wix/essentials';
import { PROP, DEFAULTS, LAYOUT_KINDS, LAYOUTS_WITH_COLUMNS, FREE_LAYOUTS } from '../constants';
import type { WidgetProps } from '../types';
import TabBar, { type TabItem } from './ui/TabBar';
import { LayoutPicker } from './ui/LayoutPicker';
import { ImageRatioPicker } from './ui/ImageRatioPicker';
import { PremiumNudge } from './ui/premiumNudge';
import { TextPositionPicker } from './ui/TextPositionPicker';

const COLUMN_OPTIONS = [
  { id: '0', value: 'Auto' },
  ...[2, 3, 4, 5, 6].map((n) => ({ id: String(n), value: String(n) })),
];
const HOVER_OPTIONS = [
  { id: 'none', value: 'None' },
  { id: 'zoom', value: 'Zoom' },
  { id: 'fade', value: 'Fade' },
];
const ALIGN_OPTIONS = [
  { id: 'left', value: 'Left' },
  { id: 'center', value: 'Center' },
  { id: 'right', value: 'Right' },
];
const BEHAVIOR_OPTIONS = [
  { id: 'text', value: 'Show Text' },
  { id: 'hide', value: 'Hide Widget' },
];

const svg = (children: React.ReactNode) => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
    {children}
  </svg>
);

const TABS: TabItem[] = [
  {
    id: 'layout',
    label: 'Layout',
    icon: svg(
      <>
        <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
        <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
        <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
        <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      </>,
    ),
  },
  {
    id: 'items',
    label: 'Items',
    icon: svg(
      <>
        <rect x="2" y="4" width="16" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="7" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 14l4-4 3 3 3-3 6 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </>,
    ),
  },
  {
    id: 'text',
    label: 'Text',
    icon: svg(
      <>
        <path d="M4 5.5h12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M10 5.5V16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M6.5 16h7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </>,
    ),
  },
  {
    id: 'design',
    label: 'Design',
    icon: svg(
      <path d="M10 2C10 2 4 9 4 13a6 6 0 0012 0C16 9 10 2 10 2z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />,
    ),
  },
  {
    id: 'more',
    label: 'More',
    icon: svg(
      <>
        <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M10 3v2M10 15v2M3 10h2M15 10h2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </>,
    ),
  },
];

const sectionStyle = { padding: '8px 20px 16px' } as const;

// Small reusable color field — a swatch that opens the Wix color picker, plus a
// reset back to the default (theme) color. An empty value means "use default".
const ColorSwatch: FC<{ value: string; label: string; onChange: (v: string) => void }> = ({
  value,
  label,
  onChange,
}) => (
  <Box gap="8px" verticalAlign="middle">
    <button
      type="button"
      aria-label={label}
      onClick={async () => {
        const color = await inputs.selectColor(value || undefined, {
          onChange: (v) => onChange(v ?? ''),
        });
        if (color != null) onChange(color);
      }}
      style={{
        width: '30px',
        height: '30px',
        borderRadius: '6px',
        border: '1px solid #cdd0d4',
        background: value || '#dcdfe3',
        cursor: 'pointer',
      }}
    />
    {value ? (
      <TextButton size="tiny" onClick={() => onChange('')}>
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
const LockedColorSwatch: FC<{ label: string; onUpgrade: () => void; disabled?: boolean }> = ({
  label,
  onUpgrade,
  disabled,
}) => (
  <Box gap="8px" verticalAlign="middle">
    <button
      type="button"
      aria-label={`${label} (Premium)`}
      onClick={onUpgrade}
      style={{
        width: '30px',
        height: '30px',
        borderRadius: '6px',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        background: 'linear-gradient(135deg, #B98BFF, #6B46FF)',
        boxShadow: '0 2px 8px rgba(107, 70, 255, 0.4)',
        cursor: 'pointer',
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
  const [activeTab, setActiveTab] = useState('layout');
  const [values, setValues] = useState<WidgetProps>({ ...DEFAULTS });
  const [isPremium, setIsPremium] = useState(false);
  const [upgradeUrl, setUpgradeUrl] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  // Free users only get the free layouts, so the panel reflects a free layout as
  // the active one (for the columns control) regardless of any layout saved
  // during a previous premium session.
  const effectiveLayout =
    isPremium || FREE_LAYOUTS.includes(values.layout) ? values.layout : FREE_LAYOUTS[0];

  useEffect(() => {
    const init = async () => {
      const get = (name: string) => widget.getProp(name);
      const [
        layout,
        columns,
        spacing,
        ratio,
        imageFit,
        showTitle,
        showPrice,
        textPosition,
        cornerRadius,
        imageBorder,
        hoverEffect,
        bgColor,
        behavior,
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
        get(PROP.imageFit),
        get(PROP.showTitle),
        get(PROP.showPrice),
        get(PROP.textPosition),
        get(PROP.cornerRadius),
        get(PROP.imageBorder),
        get(PROP.hoverEffect),
        get(PROP.bgColor),
        get(PROP.behavior),
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
          ? (layout as WidgetProps['layout'])
          : DEFAULTS.layout,
        columns: columns ? intOr(columns, DEFAULTS.columns) : DEFAULTS.columns,
        spacing: spacing ? intOr(spacing, DEFAULTS.spacing) : DEFAULTS.spacing,
        ratio: (['square', 'portrait', 'landscape', 'original'] as const).includes(ratio as never)
          ? (ratio as WidgetProps['ratio'])
          : DEFAULTS.ratio,
        imageFit: imageFit === 'fit' ? 'fit' : DEFAULTS.imageFit,
        showTitle: showTitle ? showTitle === 'true' : DEFAULTS.showTitle,
        showPrice: showPrice ? showPrice === 'true' : DEFAULTS.showPrice,
        textPosition: (['below', 'top', 'onimage'] as const).includes(textPosition as never)
          ? (textPosition as WidgetProps['textPosition'])
          : DEFAULTS.textPosition,
        cornerRadius: cornerRadius ? intOr(cornerRadius, DEFAULTS.cornerRadius) : DEFAULTS.cornerRadius,
        imageBorder: imageBorder ? imageBorder === 'true' : DEFAULTS.imageBorder,
        hoverEffect: (['none', 'zoom', 'fade'] as const).includes(hoverEffect as never)
          ? (hoverEffect as WidgetProps['hoverEffect'])
          : DEFAULTS.hoverEffect,
        bgColor: bgColor || DEFAULTS.bgColor,
        behavior: behavior === 'text' ? 'text' : DEFAULTS.behavior,
        isPremium: false,
        headingText: headingText || DEFAULTS.headingText,
        headingShow: headingShow ? headingShow === 'true' : DEFAULTS.headingShow,
        headingSize: headingSize ? intOr(headingSize, DEFAULTS.headingSize) : DEFAULTS.headingSize,
        headingColor: headingColor || DEFAULTS.headingColor,
        headingAlign: (['left', 'center', 'right'] as const).includes(headingAlign as never)
          ? (headingAlign as WidgetProps['headingAlign'])
          : DEFAULTS.headingAlign,
        textSize: textSize ? intOr(textSize, DEFAULTS.textSize) : DEFAULTS.textSize,
        textColor: textColor || DEFAULTS.textColor,
      });

      const plan = await httpClient
        .fetchWithAuth('/api/check-plan')
        .then((r) => r.json())
        .catch(() => ({ isPremium: false, upgradeUrl: undefined }));
      setIsPremium(plan.isPremium);
      setUpgradeUrl(plan.upgradeUrl);
      void widget.setProp(PROP.isPremium, String(plan.isPremium));
      setLoading(false);
    };

    void init();
  }, []);

  const set = <K extends keyof WidgetProps>(key: K, value: WidgetProps[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    const attr = PROP[key as keyof typeof PROP];
    if (attr) void widget.setProp(attr, String(value));
  };

  return (
    <WixDesignSystemProvider>
      <SidePanel width="300" height="100vh">
        <SidePanel.Content noPadding stretchVertically>
          {loading ? (
            <Box align="center" verticalAlign="middle" height="160px">
              <Loader size="small" />
            </Box>
          ) : (
            <>
              <TabBar tabs={TABS} activeTab={activeTab} onSelect={setActiveTab} />

              {activeTab === 'layout' && (
                <div style={sectionStyle}>
                  <Box direction="vertical" gap="18px">
                    <FormField label="Style">
                      <LayoutPicker
                        value={values.layout}
                        isPremium={isPremium}
                        onChange={(v) => set('layout', v)}
                        onUpgrade={() => upgradeUrl && window.open(upgradeUrl, '_blank')}
                      />
                    </FormField>
                                       {LAYOUTS_WITH_COLUMNS.includes(effectiveLayout) && (
                      <FormField label="Columns">
                        <Dropdown
                          selectedId={String(values.columns)}
                          options={COLUMN_OPTIONS}
                          onSelect={(o) => set('columns', Number(o.id))}
                        />
                      </FormField>
                    )}
                    <FormField label="Spacing (px)">
                      <NumberInput
                        value={values.spacing}
                        min={0}
                        max={40}
                        onChange={(v) => set('spacing', v ?? 0)}
                      />
                    </FormField>
                    {!isPremium && (
                      <PremiumNudge
                        onUpgrade={() => upgradeUrl && window.open(upgradeUrl, '_blank')}
                        disabled={!upgradeUrl}
                      />
                    )}
                  </Box>
                </div>
              )}

              {activeTab === 'items' && (
                <div style={sectionStyle}>
                  <Box direction="vertical" gap="18px">
                    <FormField label="Image ratio">
                      <ImageRatioPicker
                        value={values.ratio}
                        isPremium={isPremium}
                        onChange={(v) => set('ratio', v)}
                        onUpgrade={() => upgradeUrl && window.open(upgradeUrl, '_blank')}
                      />
                    </FormField>
                    <FormField label="Text position">
                      <TextPositionPicker
                        value={values.textPosition}
                        isPremium={isPremium}
                        onChange={(v) => set('textPosition', v)}
                        onUpgrade={() => upgradeUrl && window.open(upgradeUrl, '_blank')}
                      />
                    </FormField>
                    <FormField label="Image fit">
                      <SegmentedToggle
                        selected={values.imageFit}
                        onClick={(_e, v) => set('imageFit', v as WidgetProps['imageFit'])}
                      >
                        <SegmentedToggle.Button value="crop">Crop</SegmentedToggle.Button>
                        <SegmentedToggle.Button value="fit">Fit</SegmentedToggle.Button>
                      </SegmentedToggle>
                    </FormField>
                    <Box verticalAlign="middle">
                      <Box flex="1">
                        <Text size="small">Show title</Text>
                      </Box>
                      <ToggleSwitch
                        size="small"
                        checked={values.showTitle}
                        onChange={(e) => set('showTitle', e.target.checked)}
                      />
                    </Box>
                    <Box verticalAlign="middle">
                      <Box flex="1">
                        <Text size="small">Show price</Text>
                      </Box>
                      <ToggleSwitch
                        size="small"
                        checked={values.showPrice}
                        onChange={(e) => set('showPrice', e.target.checked)}
                      />
                    </Box>
                  </Box>
                </div>
              )}

              {activeTab === 'text' && (
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
                          onChange={(e) => set('headingShow', e.target.checked)}
                        />
                      </Box>
                      <FormField label="Heading text">
                        <Input
                          value={values.headingText}
                          disabled={!values.headingShow}
                          placeholder={DEFAULTS.headingText}
                          onChange={(e) => set('headingText', e.target.value)}
                        />
                      </FormField>
                      <FormField label="Heading size (px)">
                        <NumberInput
                          value={values.headingSize}
                          min={12}
                          max={60}
                          onChange={(v) => set('headingSize', v ?? DEFAULTS.headingSize)}
                        />
                      </FormField>
                      <FormField label="Heading alignment">
                        <Dropdown
                          selectedId={values.headingAlign}
                          options={ALIGN_OPTIONS}
                          onSelect={(o) => set('headingAlign', o.id as WidgetProps['headingAlign'])}
                        />
                      </FormField>
                      <FormField label="Heading color">
                        {isPremium ? (
                          <ColorSwatch
                            value={values.headingColor}
                            label="Heading color"
                            onChange={(v) => set('headingColor', v)}
                          />
                        ) : (
                          <LockedColorSwatch
                            label="Heading color"
                            disabled={!upgradeUrl}
                            onUpgrade={() => upgradeUrl && window.open(upgradeUrl, '_blank')}
                          />
                        )}
                      </FormField>

                      <Text size="small" weight="bold">
                        Product name &amp; price
                      </Text>
                      <FormField label="Text size (px)">
                        <NumberInput
                          value={values.textSize}
                          min={10}
                          max={24}
                          onChange={(v) => set('textSize', v ?? DEFAULTS.textSize)}
                        />
                      </FormField>
                      <FormField
                        label="Text color"
                        infoContent="Applies to the name &amp; price below or above the image. On-image text stays light for contrast."
                      >
                        {isPremium ? (
                          <ColorSwatch
                            value={values.textColor}
                            label="Product text color"
                            onChange={(v) => set('textColor', v)}
                          />
                        ) : (
                          <LockedColorSwatch
                            label="Product text color"
                            disabled={!upgradeUrl}
                            onUpgrade={() => upgradeUrl && window.open(upgradeUrl, '_blank')}
                          />
                        )}
                      </FormField>
                  </Box>
                </div>
              )}

              {activeTab === 'design' && (
                <div style={sectionStyle}>
                  <Box direction="vertical" gap="18px">
                    <FormField label="Image corners (px)">
                      <NumberInput
                        value={values.cornerRadius}
                        min={0}
                        max={24}
                        onChange={(v) => set('cornerRadius', v ?? 0)}
                      />
                    </FormField>
                    <FormField label="Hover effect">
                      <Dropdown
                        selectedId={values.hoverEffect}
                        options={HOVER_OPTIONS}
                        onSelect={(o) => set('hoverEffect', o.id as WidgetProps['hoverEffect'])}
                      />
                    </FormField>
                    <FormField label="Background color">
                      {isPremium ? (
                        <Box gap="8px" verticalAlign="middle">
                          <button
                            type="button"
                            aria-label="Pick background color"
                            onClick={async () => {
                              const color = await inputs.selectColor(values.bgColor || undefined, {
                                onChange: (v) => set('bgColor', v ?? ''),
                              });
                              if (color != null) set('bgColor', color);
                            }}
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '6px',
                              border: '1px solid #cdd0d4',
                              background: values.bgColor || 'transparent',
                              cursor: 'pointer',
                            }}
                          />
                          {values.bgColor ? (
                            <TextButton size="tiny" onClick={() => set('bgColor', '')}>
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
                            onClick={() => upgradeUrl && window.open(upgradeUrl, '_blank')}
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '6px',
                              border: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              background: 'linear-gradient(135deg, #B98BFF, #6B46FF)',
                              boxShadow: '0 2px 8px rgba(107, 70, 255, 0.4)',
                              cursor: 'pointer',
                            }}
                          >
                            <Icons.PremiumFilled size="16px" />
                          </button>
                          <TextButton
                            size="tiny"
                            disabled={!upgradeUrl}
                            onClick={() => upgradeUrl && window.open(upgradeUrl, '_blank')}
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
                        onChange={(e) => set('imageBorder', e.target.checked)}
                      />
                    </Box>
                  </Box>
                </div>
              )}

              {activeTab === 'more' && (
                <div style={sectionStyle}>
                  <FormField
                    label="When no items to display"
                    infoContent="What to show when the visitor hasn't viewed any products yet."
                  >
                    <Dropdown
                      selectedId={values.behavior}
                      options={BEHAVIOR_OPTIONS}
                      onSelect={(o) => set('behavior', o.id as WidgetProps['behavior'])}
                    />
                  </FormField>
                </div>
              )}

              {activeTab === 'more' && !isPremium && (
                <Box padding="8px 20px 16px">
                  <div
                    style={{
                      background: '#FFF8E1',
                      border: '1px solid #FFE082',
                      borderRadius: '8px',
                      padding: '12px',
                    }}
                  >
                    <Box direction="vertical" gap="8px">
                      <Text size="small" weight="bold">
                        Remove the watermark
                      </Text>
                      <Text size="tiny" secondary>
                        Upgrade to Premium to hide the "Powered by PURPLE" badge.
                      </Text>
                      <Button
                        size="small"
                        skin="premium"
                        prefixIcon={<Icons.PremiumFilled />}
                        disabled={!upgradeUrl}
                        onClick={() => upgradeUrl && window.open(upgradeUrl, '_blank')}
                      >
                        Remove Watermark
                      </Button>
                    </Box>
                  </div>
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
