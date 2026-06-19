import type { CSSProperties } from "react";

export const styles = {
  wrap: {
    position: "relative",
  } as CSSProperties,
  scroller: {
    display: "flex",
    overflowX: "auto",
    scrollSnapType: "x proximity",
    WebkitOverflowScrolling: "touch",
    // Hide the native scrollbar (Firefox / IE); webkit handled via injected CSS.
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  } as CSSProperties,
  cardWrap: {
    flex: "0 0 auto",
    scrollSnapAlign: "start",
  } as CSSProperties,
  // Faint chevron sitting directly on the far-end image — no button container, so
  // it stays subtle. A soft white glow keeps it legible over dark product photos.
  arrow: {
    position: "absolute",
    transform: "translateY(-50%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "28px",
    height: "28px",
    border: "none",
    background: "transparent",
    padding: 0,
    cursor: "pointer",
    color: "rgba(0, 0, 0, 0.4)",
    filter: "drop-shadow(0 0 1.5px rgba(255, 255, 255, 0.7))",
    transition: "color 0.2s ease",
    zIndex: 5,
  } as CSSProperties,
} as const;

// Injected once per widget — hover zoom/fade for the cards (the rv-hover-*
// classes ProductCard sets) plus webkit scrollbar hiding and arrow hover.
export const STRIP_CSS = `
.rv-strip-scroller::-webkit-scrollbar{display:none}
.rv-strip-arrow:hover{color:rgba(0,0,0,0.75)}
.rv-hover-zoom img{transition:transform .4s ease}
.rv-hover-zoom:hover img{transform:scale(1.06)}
.rv-hover-fade img{transition:filter .3s ease}
.rv-hover-fade:hover img{filter:brightness(.85)}
`;
