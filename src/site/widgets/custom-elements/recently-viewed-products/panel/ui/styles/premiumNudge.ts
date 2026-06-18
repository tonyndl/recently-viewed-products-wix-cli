import type { CSSProperties } from 'react';

export const styles = {
  banner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, rgba(157, 92, 255, 0.10), rgba(17, 109, 255, 0.07))',
    border: '1px solid rgba(157, 92, 255, 0.25)',
  } as CSSProperties,
  badge: {
    flexShrink: 0,
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    background: 'linear-gradient(135deg, #B98BFF, #6B46FF)',
    boxShadow: '0 3px 10px rgba(107, 70, 255, 0.4)',
  } as CSSProperties,
  copy: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
  } as CSSProperties,
};
