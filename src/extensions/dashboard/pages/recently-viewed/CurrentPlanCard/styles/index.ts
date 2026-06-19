import type { CSSProperties } from "react";

export const styles = {
  card: {
    border: "1px solid #E5E5E5",
    borderRadius: "8px",
    padding: "20px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
  } as CSSProperties,
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  } as CSSProperties,
  featuresRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
    marginTop: "8px",
  } as CSSProperties,
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  } as CSSProperties,
  circleCheck: {
    color: "#116DFF",
    fontSize: "14px",
    fontWeight: 700,
    flexShrink: 0,
    lineHeight: 1,
  } as CSSProperties,
};
