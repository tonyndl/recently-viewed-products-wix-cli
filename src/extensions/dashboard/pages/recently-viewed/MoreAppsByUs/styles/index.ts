import type { CSSProperties } from "react";

export const styles = {
  row: {
    display: "flex",
    gap: "24px",
    alignItems: "stretch",
    flexWrap: "wrap",
    marginBottom: "16px",
  } as CSSProperties,
  card: {
    flex: "1 1 0",
    minWidth: "180px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    padding: "20px",
    border: "1px solid #E5E5E5",
    borderRadius: "10px",
  } as CSSProperties,
  icon: {
    width: "48px",
    height: "48px",
    borderRadius: "10px",
    objectFit: "cover",
  } as CSSProperties,
  descriptionWrapper: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    textAlign: "center",
  } as CSSProperties,
  // Footer row: "Explore more apps" on the left, the Purple watermark far right.
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
  } as CSSProperties,
  // Mirrors the live widget's watermark — "POWERED BY" label + Purple logo.
  watermarkLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    textDecoration: "none",
  } as CSSProperties,
  watermarkLabel: {
    fontSize: "10px",
    letterSpacing: "0.1em",
    color: "#c4c4c4",
    fontWeight: 500,
  } as CSSProperties,
  watermarkLogo: {
    height: "20px",
    display: "block",
  } as CSSProperties,
} as const;
