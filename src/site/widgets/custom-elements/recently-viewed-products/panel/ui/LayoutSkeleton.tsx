import type { FC } from "react";
import {
  SkeletonGroup,
  SkeletonLine,
  SkeletonRectangle,
} from "@wix/design-system";
import { styles } from "./styles/LayoutSkeleton";
import "./LayoutSkeleton.css";

// 5 tab placeholders (Layout, Items, Text, Design, More) and a 3×3 grid of
// layout-style tiles — matching the panel's first paint.
const TABS = Array.from({ length: 4 });
const CELLS = Array.from({ length: 9 });

// Skeleton shown while the panel loads its saved widget props + plan. Mirrors the
// tab bar and the Layout tab's Style-picker boxes so the structure is in place
// immediately and the real controls drop into the same positions.
export const LayoutSkeleton: FC = () => (
  <SkeletonGroup skin="light" className="rv-skeleton-fill">
    {/* Tab bar */}
    <div style={styles.tabWrapper}>
      <div style={styles.tabContainer}>
        {TABS.map((_, i) => (
          <div key={i} style={styles.tab}>
            <SkeletonRectangle width="20px" height="20px" />
            <SkeletonLine width="80%" />
          </div>
        ))}
      </div>
    </div>

    {/* Layout-style picker boxes — full-width rectangles, one per grid cell. */}
    <div style={styles.section}>
      <div style={styles.grid}>
        {CELLS.map((_, i) => (
          <SkeletonRectangle key={i} width="100%" height="100%" />
        ))}
      </div>
    </div>
  </SkeletonGroup>
);

export default LayoutSkeleton;
