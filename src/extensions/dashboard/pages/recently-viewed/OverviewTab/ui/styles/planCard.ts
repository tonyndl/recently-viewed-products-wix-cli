import type { CSSProperties } from "react";

// Prominent "Your Plan" card: a soft purple panel with the plan status on the
// left and the Premium benefit checklist on the right.
export const styles = {
  card: {
    display: "flex",
    gap: "24px",
    alignItems: "stretch",
    height: "100%",
    boxSizing: "border-box",
    padding: "24px",
    borderRadius: "8px",
    background: "linear-gradient(135deg, #F4EEFF 0%, #FCFAFF 100%)",
    border: "1px solid #ECE3FF",
  } as CSSProperties,
  left: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    minWidth: "150px",
    textAlign: "center",
  } as CSSProperties,
  crown: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #B98BFF, #6B46FF)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(107,70,255,0.35)",
  } as CSSProperties,
  divider: {
    width: "1px",
    alignSelf: "stretch",
    background: "#E7DBFF",
  } as CSSProperties,
  benefits: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: "11px",
  } as CSSProperties,
  benefitRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  } as CSSProperties,
  check: {
    flexShrink: 0,
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    background: "#7C4DFF",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  } as CSSProperties,
} as const;
