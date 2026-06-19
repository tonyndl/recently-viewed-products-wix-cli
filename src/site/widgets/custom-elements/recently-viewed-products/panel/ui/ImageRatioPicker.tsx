import type { FC } from "react";
import { Text } from "@wix/design-system";
import * as Icons from "@wix/wix-ui-icons-common";
import { FREE_RATIOS, type RatioKind } from "../../constants";
import { ImageRatioThumb } from "./ImageRatioThumb";
import {
  styles,
  SHAPE,
  SHAPE_SELECTED,
  LAYOUT_PICKER_CSS,
} from "./styles/LayoutPicker";

// Card backgrounds — used as the "contrast" tone so the sun/mountains read
// against the photo fill (matches the other pickers).
const CARD_BG = "#EAF1FB";
const CARD_BG_SELECTED = "#116DFF";

// Free ratios first (Original, then Portrait); Square & Landscape are premium.
const OPTIONS: { id: RatioKind; label: string }[] = [
  { id: "original", label: "Original" },
  { id: "portrait", label: "Portrait" },
  { id: "square", label: "Square" },
  { id: "landscape", label: "Landscape" },
];

interface Props {
  value: RatioKind;
  isPremium: boolean;
  onChange: (value: RatioKind) => void;
  onUpgrade: () => void;
}

// Visual chooser for the image ratio — each cell shows a photo glyph at that
// proportion. Square & Landscape are premium: locked tiles open the upgrade flow.
export const ImageRatioPicker: FC<Props> = ({
  value,
  isPremium,
  onChange,
  onUpgrade,
}) => {
  // Free users effectively use a free ratio regardless of any premium ratio
  // saved during a previous premium session.
  const effectiveValue =
    isPremium || FREE_RATIOS.includes(value) ? value : FREE_RATIOS[0];

  return (
    <div style={styles.grid}>
      <style>{LAYOUT_PICKER_CSS}</style>
      {OPTIONS.map((o) => {
        const locked = !isPremium && !FREE_RATIOS.includes(o.id);
        const selected = o.id === effectiveValue;

        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={selected}
            aria-label={locked ? `${o.label} (Premium)` : o.label}
            className={locked ? "rv-lock-cell" : undefined}
            onClick={() => (locked ? onUpgrade() : onChange(o.id))}
            style={styles.cell}
          >
            <div
              style={
                selected
                  ? styles.thumbSelected
                  : locked
                    ? styles.thumbLocked
                    : styles.thumb
              }
            >
              {locked ? (
                <div style={styles.thumbDim}>
                  <ImageRatioThumb
                    kind={o.id}
                    color={SHAPE}
                    contrast={CARD_BG}
                  />
                </div>
              ) : (
                <ImageRatioThumb
                  kind={o.id}
                  color={selected ? SHAPE_SELECTED : SHAPE}
                  contrast={selected ? CARD_BG_SELECTED : CARD_BG}
                />
              )}
            </div>
            <div style={styles.labelWrap}>
              <div style={styles.labelRow}>
                {locked && (
                  <Icons.PremiumFilled
                    size="12px"
                    style={{ color: "#9D5CFF" }}
                  />
                )}
                <Text
                  size="tiny"
                  secondary={!selected}
                  weight={selected ? "bold" : "normal"}
                >
                  {o.label}
                </Text>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ImageRatioPicker;
