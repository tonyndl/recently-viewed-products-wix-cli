import type { CSSProperties } from "react";

// Yellow promo banner shown under the dashboard tabs while a free trial is
// available. Mirrors Wix's own free-trial banner styling.
export const styles = {
  banner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    background: "#FFF8E1",
    border: "1px solid #FFE7A0",
    borderRadius: "8px",
    padding: "16px 20px",
  } as CSSProperties,
  left: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: 1,
    minWidth: 0,
  } as CSSProperties,
  crown: {
    display: "flex",
    flexShrink: 0,
    color: "#F0A732",
  } as CSSProperties,
  buttonWrap: {
    flexShrink: 0,
  } as CSSProperties,
} as const;
