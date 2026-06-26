import { useCallback, useEffect, useRef, useState, type FC } from "react";
import type { RecentlyViewedItem, WidgetProps } from "../../types";
import { STRIP_ITEM_WIDTH } from "../../constants";
import { ProductCard } from "./productCard";
import { styles, STRIP_CSS } from "./styles/stripView";

const Chevron: FC<{ dir: "left" | "right" }> = ({ dir }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {dir === "left" ? (
      <polyline points="15 18 9 12 15 6" />
    ) : (
      <polyline points="9 18 15 12 9 6" />
    )}
  </svg>
);

interface StripViewProps {
  items: RecentlyViewedItem[];
  props: WidgetProps;
  onNavigate?: (item: RecentlyViewedItem) => void;
}

// Native horizontal product strip. Pro Gallery's one-row mode virtualizes and
// won't reliably scroll to the last item, so the strip layout renders here
// instead: a real overflow-scroll track (every item reachable) with faint
// chevrons that hide once their end is reached.
export const StripView: FC<StripViewProps> = ({ items, props, onNavigate }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);
  // Measured vertical center of a card's image, relative to the wrap top. The
  // arrows sit here so they're centered on the image regardless of caption
  // position/height or image ratio (estimating these from pixels drifts).
  const [arrowTop, setArrowTop] = useState<number | null>(null);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setShowLeft(el.scrollLeft > 1);
    setShowRight(max > 1 && el.scrollLeft < max - 1);

    const wrap = wrapRef.current;
    const img = wrap?.querySelector<HTMLElement>("[data-rv-image]");
    if (wrap && img) {
      const wrapRect = wrap.getBoundingClientRect();
      const imgRect = img.getBoundingClientRect();
      setArrowTop(imgRect.top - wrapRect.top + imgRect.height / 2);
    }
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update, items]);

  const scrollByPage = (dir: -1 | 1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  // Until the first measurement lands, fall back to the wrap's vertical center.
  const arrowTopStyle = arrowTop != null ? `${arrowTop}px` : "50%";

  return (
    <div ref={wrapRef} style={styles.wrap}>
      <style>{STRIP_CSS}</style>
      <div
        ref={ref}
        className="rv-strip-scroller"
        style={{ ...styles.scroller, gap: `${props.spacing}px` }}
        onScroll={update}
      >
        {items.map((it) => (
          <div
            key={it.id || it.slug}
            style={{ ...styles.cardWrap, width: STRIP_ITEM_WIDTH }}
          >
            <ProductCard
              item={it}
              ratio={props.ratio}
              showTitle={props.showTitle}
              showPrice={props.showPrice}
              textPosition={props.textPosition}
              cornerRadius={props.cornerRadius}
              imageBorder={props.imageBorder}
              hoverEffect={props.hoverEffect}
              textSize={props.textSize}
              textColor={props.textColor}
              onNavigate={onNavigate}
            />
          </div>
        ))}
      </div>

      {showLeft && (
        <button
          type="button"
          aria-label="Previous"
          className="rv-strip-arrow"
          onClick={() => scrollByPage(-1)}
          style={{ ...styles.arrow, left: "6px", top: arrowTopStyle }}
        >
          <Chevron dir="left" />
        </button>
      )}
      {showRight && (
        <button
          type="button"
          aria-label="Next"
          className="rv-strip-arrow"
          onClick={() => scrollByPage(1)}
          style={{ ...styles.arrow, right: "6px", top: arrowTopStyle }}
        >
          <Chevron dir="right" />
        </button>
      )}
    </div>
  );
};
