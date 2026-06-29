import type { FC } from "react";
import type { WidgetProps } from "../../types";
import { STRIP_ITEM_WIDTH } from "../../constants";
import { SKELETON_CSS, styles } from "./styles/skeleton";

// Image-box aspect ratios, mirroring productCard's RATIO (original → square) so
// the skeleton reserves the same height as the real cards — no layout shift when
// the products load in.
const RATIO: Record<WidgetProps["ratio"], string> = {
  square: "1 / 1",
  portrait: "3 / 4",
  landscape: "4 / 3",
  original: "1 / 1",
};

const CARD_COUNT = 6;

// Loading placeholder shown in place of the gallery while products are fetched,
// so the widget reserves its space instead of collapsing to nothing. Respects the
// chosen ratio / spacing / corner radius / title+price visibility so it closely
// matches the final layout.
export const Skeleton: FC<{ props: WidgetProps }> = ({ props }) => {
  const onImage = props.textPosition === "onimage";
  return (
    <>
      <style>{SKELETON_CSS}</style>
      <div style={{ ...styles.row, gap: `${props.spacing}px` }}>
        {Array.from({ length: CARD_COUNT }).map((_, i) => (
          <div
            key={i}
            style={{ ...styles.card, width: `${STRIP_ITEM_WIDTH}px` }}
          >
            <div
              className="rv-skel"
              style={{
                ...styles.image,
                aspectRatio: RATIO[props.ratio],
                borderRadius: `${props.cornerRadius}px`,
              }}
            />
            {!onImage && props.showTitle && (
              <div className="rv-skel" style={styles.titleBar} />
            )}
            {!onImage && props.showPrice && (
              <div className="rv-skel" style={styles.priceBar} />
            )}
          </div>
        ))}
      </div>
    </>
  );
};
