import type { FC } from "react";
import { Text } from "@wix/design-system";
import * as Icons from "@wix/wix-ui-icons-common";
import { FREE_TEXT_POSITIONS, type TextPosition } from "../../constants";
import { TextPositionThumb } from "./TextPositionThumb";
import {
  styles,
  SHAPE,
  SHAPE_SELECTED,
  LAYOUT_PICKER_CSS,
} from "./styles/LayoutPicker";

// Card background colors (from the shared LayoutPicker styles) — reused as the
// "contrast" tone for the on-image text so it reads against the image block.
const CARD_BG = "#EAF1FB";
const CARD_BG_SELECTED = "#116DFF";

// Top is free; Below & On image are premium.
const OPTIONS: { id: TextPosition; label: string }[] = [
  { id: "top", label: "Top" },
  { id: "below", label: "Below" },
  { id: "onimage", label: "On image" },
];

interface Props {
  value: TextPosition;
  isPremium: boolean;
  onChange: (value: TextPosition) => void;
  onUpgrade: () => void;
}

// Visual chooser for where the title/price render — each cell shows a schematic
// of the text relative to the image. Below & On image are premium: locked tiles
// open the upgrade flow.
export const TextPositionPicker: FC<Props> = ({
  value,
  isPremium,
  onChange,
  onUpgrade,
}) => {
  // Free users effectively use a free position regardless of any premium
  // position saved during a previous premium session.
  const effectiveValue =
    isPremium || FREE_TEXT_POSITIONS.includes(value)
      ? value
      : FREE_TEXT_POSITIONS[0];

  return (
    <div style={styles.grid}>
      <style>{LAYOUT_PICKER_CSS}</style>
      {OPTIONS.map((o) => {
        const locked = !isPremium && !FREE_TEXT_POSITIONS.includes(o.id);
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
                  <TextPositionThumb
                    kind={o.id}
                    color={SHAPE}
                    contrast={CARD_BG}
                  />
                </div>
              ) : (
                <TextPositionThumb
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

export default TextPositionPicker;
