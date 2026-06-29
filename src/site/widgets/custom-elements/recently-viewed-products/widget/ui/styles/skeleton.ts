import type { CSSProperties } from "react";

// Shimmer animation for the loading placeholders. Injected as a <style> tag (the
// same pattern stripView uses for STRIP_CSS) because keyframes can't be inlined.
export const SKELETON_CSS = `
@keyframes rv-shimmer{0%{background-position:-468px 0}100%{background-position:468px 0}}
.rv-skel{background:#ececec;background-image:linear-gradient(90deg,#ececec 0px,#f5f5f5 40px,#ececec 80px);background-size:600px 100%;animation:rv-shimmer 1.3s linear infinite}
`;

export const styles = {
  row: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
  } as CSSProperties,
  card: {
    display: "flex",
    flexDirection: "column",
    flex: "0 0 auto",
  } as CSSProperties,
  image: {
    width: "100%",
  } as CSSProperties,
  titleBar: {
    height: "12px",
    width: "75%",
    marginTop: "10px",
    borderRadius: "6px",
  } as CSSProperties,
  priceBar: {
    height: "12px",
    width: "45%",
    marginTop: "6px",
    borderRadius: "6px",
  } as CSSProperties,
};
