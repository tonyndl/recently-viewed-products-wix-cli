import type { FC } from 'react';
import { styles } from '../styles/index';

// Static visual approximation of the storefront gallery.
export const LivePreview: FC = () => (
  <div style={styles.previewFrame}>
    <div style={styles.previewGrid}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} style={styles.previewCard}>
          <div style={styles.previewThumb} />
          <div style={styles.previewBarWide} />
          <div style={styles.previewBarNarrow} />
        </div>
      ))}
    </div>
  </div>
);
