import type { CSSProperties } from "react";

export const styles = {
  plansGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  } as CSSProperties,
};
