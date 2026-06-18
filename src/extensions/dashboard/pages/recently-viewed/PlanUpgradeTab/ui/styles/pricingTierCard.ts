import type { CSSProperties } from 'react';

export const getCardStyle = (isPremiumCard: boolean): CSSProperties => ({
  border: isPremiumCard ? '2px solid #116DFF' : '1px solid #E5E5E5',
  borderRadius: '8px',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

export const styles = {
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  } as CSSProperties,
  priceRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
  } as CSSProperties,
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
  } as CSSProperties,
  featureRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as CSSProperties,
  circleCheck: {
    color: '#116DFF',
    fontSize: '14px',
    fontWeight: 700,
    flexShrink: 0,
    lineHeight: 1,
  } as CSSProperties,
};
