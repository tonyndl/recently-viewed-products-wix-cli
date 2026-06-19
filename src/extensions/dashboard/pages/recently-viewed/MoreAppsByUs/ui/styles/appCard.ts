import type { CSSProperties } from "react";

export const styles = {
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
} as const;
