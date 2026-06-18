import type { CSSProperties } from 'react';

export const styles = {
  previewFrame: {
    border: '1px solid #E5E5E5',
    borderRadius: '8px',
    padding: '20px',
    background: '#fff',
  } as CSSProperties,
  previewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  } as CSSProperties,
  previewCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  } as CSSProperties,
  previewThumb: {
    width: '100%',
    aspectRatio: '1 / 1',
    borderRadius: '6px',
    background: 'linear-gradient(135deg, #EDF3FF 0%, #DCE7FF 100%)',
  } as CSSProperties,
  previewBarWide: {
    height: '10px',
    width: '80%',
    borderRadius: '4px',
    background: '#E5E5E5',
  } as CSSProperties,
  previewBarNarrow: {
    height: '8px',
    width: '50%',
    borderRadius: '4px',
    background: '#EFEFEF',
  } as CSSProperties,
  stepRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  } as CSSProperties,
  stepNumber: {
    flexShrink: 0,
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: '#116DFF',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 600,
  } as CSSProperties,
} as const;
