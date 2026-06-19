import type { CSSProperties } from "react";

export const styles = {
  card: {
    display: "flex",
    flexDirection: "column",
    textDecoration: "none",
    color: "inherit",
  } as CSSProperties,
  imageWrap: {
    position: "relative",
    width: "100%",
    overflow: "hidden",
    borderRadius: "8px",
    background: "#f3f3f3",
  } as CSSProperties,
  image: {
    width: "100%",
    display: "block",
  } as CSSProperties,
  aboveText: {
    margin: "0 0 8px 0",
  } as CSSProperties,
  name: {
    margin: "8px 0 2px 0",
    fontSize: "14px",
    fontWeight: 500,
    color: "var(--wix-color-text, #2b2b2b)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  } as CSSProperties,
  price: {
    margin: 0,
    fontSize: "13px",
    color: "var(--wix-color-text-secondary, #6b6b6b)",
  } as CSSProperties,
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: "20px 10px 8px",
    background: "linear-gradient(to top, rgba(0,0,0,0.62), rgba(0,0,0,0))",
    color: "#fff",
  } as CSSProperties,
  overlayName: {
    margin: 0,
    fontSize: "13px",
    fontWeight: 600,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  } as CSSProperties,
  overlayPrice: {
    margin: "2px 0 0 0",
    fontSize: "12px",
    opacity: 0.9,
  } as CSSProperties,
} as const;
