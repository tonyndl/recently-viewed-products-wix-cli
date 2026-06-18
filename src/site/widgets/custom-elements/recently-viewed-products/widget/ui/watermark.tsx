import type { FC } from 'react';
import { WATERMARK_URL, WATERMARK_LOGO } from '../../constants';
import { styles } from './styles/watermark';

// Free-plan watermark — the official "Powered by Purple" badge from the
// Wix Blocks app custom element. Removed automatically for premium visitors.
export const Watermark: FC = () => (
  <a href={WATERMARK_URL} target="_blank" rel="noopener noreferrer" style={styles.link}>
    <img src={WATERMARK_LOGO} alt="Powered by Purple" style={styles.logo} />
  </a>
);
