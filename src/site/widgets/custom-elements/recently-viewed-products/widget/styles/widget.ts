import type { CSSProperties } from "react";
import type { WidgetProps } from "../../types";

export const styles = {
  root: {
    width: "100%",
    boxSizing: "border-box",
    fontFamily:
      'var(--wix-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif)',
  } as CSSProperties,
  heading: {
    margin: "0 0 16px 0",
    textAlign: "center",
    fontSize: "22px",
    fontWeight: 600,
    color: "var(--wix-color-text, #2b2b2b)",
  } as CSSProperties,
  watermarkWrap: {
    marginTop: "16px",
    display: "flex",
    justifyContent: "center",
  } as CSSProperties,
  message: {
    margin: 0,
    padding: "24px 16px",
    textAlign: "center",
    color: "var(--wix-color-text-secondary, #888)",
    fontSize: "14px",
  } as CSSProperties,
  // Caption shown above the featured products in the "Show Store Products" empty
  // state — lighter and tighter than `message` so it reads as a subtitle.
  caption: {
    margin: "0 0 12px 0",
    textAlign: "center",
    color: "var(--wix-color-text-secondary, #888)",
    fontSize: "13px",
  } as CSSProperties,
} as const;

// Heading style driven by the Text settings (size / color / alignment). An empty
// headingColor falls back to the theme text color.
export const headingStyle = (p: WidgetProps): CSSProperties => ({
  margin: "0 0 16px 0",
  textAlign: p.headingAlign,
  fontSize: `${p.headingSize}px`,
  fontWeight: 600,
  color: p.headingColor || "var(--wix-color-text, #2b2b2b)",
});

// Container style for the chosen layout. `columns: 0` means responsive auto-fill.
export const containerStyle = (
  layout: WidgetProps["layout"],
  columns: number,
  spacing: number,
): CSSProperties => {
  if (layout === "strip") {
    return {
      display: "flex",
      gap: `${spacing}px`,
      overflowX: "auto",
      scrollSnapType: "x proximity",
      WebkitOverflowScrolling: "touch",
    };
  }
  if (layout === "masonry") {
    return columns > 0
      ? { columnCount: columns, columnGap: `${spacing}px` }
      : { columnWidth: "170px", columnGap: `${spacing}px` };
  }
  return {
    display: "grid",
    gridTemplateColumns:
      columns > 0
        ? `repeat(${columns}, 1fr)`
        : "repeat(auto-fill, minmax(150px, 1fr))",
    gap: `${spacing}px`,
  };
};
