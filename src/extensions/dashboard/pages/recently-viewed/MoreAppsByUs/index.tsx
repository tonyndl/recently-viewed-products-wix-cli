import type { FC } from "react";
import { Card, TextButton } from "@wix/design-system";
import { PURPLE_LOGO_URL } from "../../../../../constants";
// Reuse the live widget's canonical watermark so the dashboard footer mark is
// identical to the one shown on the site (same Purple logo + App Market link).
import {
  WATERMARK_URL,
  WATERMARK_LOGO,
} from "../../../../../site/widgets/custom-elements/recently-viewed-products/constants";
import { AppCard } from "./ui/appCard";
import { styles } from "./styles/index";

const APPS = [
  {
    name: "Frequently Bought Together",
    description: "Boost order value with smart product bundles.",
    icon: PURPLE_LOGO_URL,
    url: "https://www.wix.com/app-market/17d75b11-b574-4b49-9708-4ffa8be777a6",
  },
  {
    name: "360° Product Viewer",
    description: "Let shoppers spin products in interactive 360°.",
    icon: PURPLE_LOGO_URL,
    url: "https://www.wix.com/app-market/dd2b43ee-f3e5-4ca2-bb87-73f41be78d18",
  },
  {
    name: "Shipping Address Verifier",
    description: "Reduce failed deliveries by validating addresses.",
    icon: PURPLE_LOGO_URL,
    url: "https://www.wix.com/app-market/shipping-address-verifier",
  },
  {
    name: "Google Drive Content",
    description: "Embed and sync content straight from Google Drive.",
    icon: PURPLE_LOGO_URL,
    url: "https://www.wix.com/app-market/6d396a1f-1145-4feb-9531-3b520ab4389e",
  },
];

export const MoreAppsByUs: FC = () => (
  <Card>
    <Card.Header title="More apps by us" />
    <Card.Divider />
    <Card.Content>
      <div style={styles.row}>
        {APPS.map((app) => (
          <AppCard key={app.name} {...app} />
        ))}
      </div>
      <div style={styles.footer}>
        <TextButton as="a" href={WATERMARK_URL} target="_blank" size="small">
          Explore more apps
        </TextButton>
        <a
          href={WATERMARK_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.watermarkLink}
          aria-label="More apps by Purple on the Wix App Market"
        >
          <span style={styles.watermarkLabel}>POWERED BY</span>
          <img src={WATERMARK_LOGO} alt="Purple" style={styles.watermarkLogo} />
        </a>
      </div>
    </Card.Content>
  </Card>
);
