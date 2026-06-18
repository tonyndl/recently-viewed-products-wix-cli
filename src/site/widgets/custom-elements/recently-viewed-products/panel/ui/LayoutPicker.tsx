import type { FC } from 'react';
import { Text } from '@wix/design-system';
import * as Icons from '@wix/wix-ui-icons-common';
import { LAYOUT_OPTIONS, FREE_LAYOUTS, type LayoutKind } from '../../constants';
import { LayoutThumb } from './LayoutThumb';
import { styles, SHAPE, SHAPE_SELECTED, LAYOUT_PICKER_CSS } from './styles/LayoutPicker';

interface Props {
  value: LayoutKind;
  isPremium: boolean;
  onChange: (value: LayoutKind) => void;
  onUpgrade: () => void;
}

// Visual layout chooser — a grid of thumbnail previews with labels, mirroring
// the native Wix Pro Gallery picker. On the free plan only the free layouts
// (Strip, Grid) are usable; every other layout is a premium-locked tile that
// opens the upgrade flow when clicked.
export const LayoutPicker: FC<Props> = ({ value, isPremium, onChange, onUpgrade }) => {
  // Free users effectively use a free layout regardless of any premium layout
  // saved during a previous premium session.
  const effectiveValue = isPremium || FREE_LAYOUTS.includes(value) ? value : FREE_LAYOUTS[0];

  return (
    <div style={styles.grid}>
      <style>{LAYOUT_PICKER_CSS}</style>
      {LAYOUT_OPTIONS.map((o) => {
        const locked = !isPremium && !FREE_LAYOUTS.includes(o.id);
        const selected = o.id === effectiveValue;

      return (
        <button
          key={o.id}
          type="button"
          aria-pressed={selected}
          aria-label={locked ? `${o.value} (Premium)` : o.value}
          className={locked ? 'rv-lock-cell' : undefined}
          onClick={() => (locked ? onUpgrade() : onChange(o.id))}
          style={styles.cell}
        >
          <div style={selected ? styles.thumbSelected : locked ? styles.thumbLocked : styles.thumb}>
            {locked ? (
              <div style={styles.thumbDim}>
                <LayoutThumb kind={o.id} color={SHAPE} />
              </div>
            ) : (
              <LayoutThumb kind={o.id} color={selected ? SHAPE_SELECTED : SHAPE} />
            )}
          </div>
          <div style={styles.labelWrap}>
            <div style={styles.labelRow}>
              {locked && <Icons.PremiumFilled size="12px" style={{ color: '#9D5CFF' }} />}
              <Text size="tiny" secondary={!selected} weight={selected ? 'bold' : 'normal'}>
                {o.value}
              </Text>
            </div>
          </div>
          </button>
        );
      })}
    </div>
  );
};

export default LayoutPicker;
