import type { CSSProperties } from "react";

// Canonical watermark styles — "POWERED BY" label + Purple logo, per
// WIX_BASE_PROJECT/docs/check-plan-in-panel.md.
export const styles = {
  link: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    textDecoration: "none",
    zIndex: 9999999,
  } as CSSProperties,
  label: {
    fontSize: "10px",
    letterSpacing: "0.1em",
    color: "#c4c4c4",
    fontWeight: 500,
  } as CSSProperties,
  logo: {
    height: "20px",
    display: "block",
  } as CSSProperties,
} as const;
