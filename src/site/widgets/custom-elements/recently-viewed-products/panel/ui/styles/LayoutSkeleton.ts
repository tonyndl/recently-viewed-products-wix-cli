import type { CSSProperties } from "react";

// Skeleton that mirrors the panel's first paint: the tab bar + the Layout tab's
// Style-picker grid, so nothing shifts when the real controls load in.
export const styles = {
  // Tab bar — matches TabBar's sticky wrapper + grey rounded container.
  tabWrapper: {
    padding: "10px 12px 8px",
    flexShrink: 0,
  } as CSSProperties,
  tabContainer: {
    display: "flex",
    background: "#EBEBEC",
    borderRadius: "10px",
    padding: "3px",
    gap: "2px",
  } as CSSProperties,
  tab: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    padding: "8px 2px",
  } as CSSProperties,

  // Layout-style picker grid. The section flexes to fill the height left under
  // the tab bar, and the grid splits it into 3 equal rows so the boxes spread to
  // fill the whole space instead of clustering at the top.
  section: {
    flex: 1,
    minHeight: 0,
    boxSizing: "border-box",
    padding: "8px 20px 16px",
  } as CSSProperties,
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gridTemplateRows: "repeat(3, 1fr)",
    gap: "12px",
    height: "100%",
  } as CSSProperties,
} as const;
