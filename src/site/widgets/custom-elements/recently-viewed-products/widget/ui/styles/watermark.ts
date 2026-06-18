import type { CSSProperties } from 'react';

export const styles = {
  link: {
    display: 'inline-flex',
    alignItems: 'center',
    textDecoration: 'none',
    zIndex: 9999999,
  } as CSSProperties,
  logo: {
    height: '33px',
    width: '180px',
    display: 'block',
  } as CSSProperties,
} as const;
