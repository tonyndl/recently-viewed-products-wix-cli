import type { CSSProperties } from "react";

export const styles = {
  stepRow: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
  } as CSSProperties,
  stepNumber: {
    flexShrink: 0,
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    background: "#116DFF",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: 600,
  } as CSSProperties,
} as const;
