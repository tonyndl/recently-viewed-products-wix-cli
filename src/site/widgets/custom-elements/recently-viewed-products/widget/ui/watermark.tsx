import type { FC } from "react";
import { WATERMARK_URL, WATERMARK_LOGO } from "../../constants";
import { styles } from "./styles/watermark";

// Free-plan watermark — the canonical "POWERED BY" label + Purple logo from
// WIX_BASE_PROJECT/docs/check-plan-in-panel.md. Removed automatically for premium.
export const Watermark: FC = () => (
  <a
    href={WATERMARK_URL}
    target="_blank"
    rel="noopener noreferrer"
    style={styles.link}
  >
    <span style={styles.label}>POWERED BY</span>
    <img src={WATERMARK_LOGO} alt="Purple" style={styles.logo} />
  </a>
);
