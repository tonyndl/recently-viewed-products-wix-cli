import type { CSSProperties } from 'react';

// Shape colors inside the thumbnails: muted blue on a light card, white when
// the card is selected (matching the native Wix Pro Gallery layout picker).
export const SHAPE = '#A9C3F0';
export const SHAPE_SELECTED = '#FFFFFF';

export const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
  } as CSSProperties,
  cell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    padding: 0,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  } as CSSProperties,
  thumb: {
    width: '100%',
    aspectRatio: '4 / 3',
    background: '#EAF1FB',
    borderRadius: '8px',
    border: '1px solid transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as CSSProperties,
  thumbSelected: {
    width: '100%',
    aspectRatio: '4 / 3',
    background: '#116DFF',
    borderRadius: '8px',
    border: '1px solid #116DFF',
    boxShadow: '0 0 0 2px rgba(17, 109, 255, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as CSSProperties,
  // Locked (premium-only) tile — the schematic stays visible (slightly muted).
  // No premium ring; the crown next to the label is the only premium marker.
  thumbLocked: {
    position: 'relative',
    width: '100%',
    aspectRatio: '4 / 3',
    background: '#EAF1FB',
    borderRadius: '8px',
    border: '1px solid transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as CSSProperties,
  thumbDim: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.65,
  } as CSSProperties,
  labelWrap: {
    textAlign: 'center',
  } as CSSProperties,
  labelRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3px',
  } as CSSProperties,
} as const;

// Injected once — a subtle hover lift on locked tiles (inline styles can't
// express :hover, hence a <style>).
export const LAYOUT_PICKER_CSS = `
.rv-lock-cell{transition:transform .15s ease}
.rv-lock-cell:hover{transform:translateY(-2px)}
`;
