import type { CSSProperties } from "react";

export const styles = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 24px",
  } as CSSProperties,
  titleSection: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  } as CSSProperties,
  pillToggle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  } as CSSProperties,
  segmentedControl: {
    display: "flex",
    alignItems: "center",
    background: "#F3F3F3",
    borderRadius: "8px",
    padding: "3px",
    gap: "2px",
  } as CSSProperties,
  pill: {
    padding: "5px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    userSelect: "none",
    background: "transparent",
  } as CSSProperties,
  pillActive: {
    padding: "5px 14px",
    borderRadius: "6px",
    border: "2px solid #116DFF",
    background: "#fff",
    cursor: "pointer",
    userSelect: "none",
  } as CSSProperties,
};
