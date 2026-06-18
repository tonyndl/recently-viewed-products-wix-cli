import type { FC } from 'react';
import type { RecentlyViewedItem } from '../../types';
import { styles } from './styles/productModal';

interface ProductDetailProps {
  item: RecentlyViewedItem;
  // When the product page can be navigated to (published site), this opens it.
  // Omitted in the editor preview, where navigation is blocked by the sandbox.
  onViewProduct?: (item: RecentlyViewedItem) => void;
  onBack: () => void;
}

// In-widget product detail view. The custom element renders inside a sandboxed
// preview iframe (shadow DOM + transformed wrappers) where fixed/absolute
// overlays get clipped or pushed off-screen, so instead of a modal we render the
// detail INLINE in the widget's normal flow — guaranteed visible. It replaces
// the product grid until the visitor clicks "Back".
export const ProductDetail: FC<ProductDetailProps> = ({ item, onViewProduct, onBack }) => (
  <div style={styles.panel}>
    <button type="button" style={styles.back} onClick={onBack}>
      <span style={styles.backArrow} aria-hidden="true">
        ‹
      </span>
      Back
    </button>

    <div style={styles.card}>
      <div style={styles.imageWrap}>
        {item.imageUrl ? <img src={item.imageUrl} alt={item.name} style={styles.image} /> : null}
      </div>

      <div style={styles.body}>
        <p style={styles.name}>{item.name}</p>
        {item.formattedPrice ? <p style={styles.price}>{item.formattedPrice}</p> : null}
        {item.description ? <p style={styles.description}>{item.description}</p> : null}

        {onViewProduct ? (
          <button type="button" style={styles.button} onClick={() => onViewProduct(item)}>
            View Product
          </button>
        ) : (
          <p style={styles.note}>Opens the product page on your published site.</p>
        )}
      </div>
    </div>
  </div>
);
