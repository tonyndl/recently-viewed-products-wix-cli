import type { FC } from "react";
import { Card, TextButton } from "@wix/design-system";
import { AppCard } from "./ui/appCard";
import { styles } from "./styles/index";

const APPS = [
  {
    name: "Frequently Bought Together",
    description: "Boost order value with smart product bundles.",
    icon: "https://static.wixstatic.com/media/1fff64_8e60357c0b134468a6c6f4c7e4570de5~mv2.png",
    url: "https://www.wix.com/app-market/17d75b11-b574-4b49-9708-4ffa8be777a6",
  },
  {
    name: "360° Product Viewer",
    description: "Let shoppers spin products in interactive 360°.",
    icon: "https://static.wixstatic.com/media/1fff64_8e60357c0b134468a6c6f4c7e4570de5~mv2.png",
    url: "https://www.wix.com/app-market/dd2b43ee-f3e5-4ca2-bb87-73f41be78d18",
  },
  {
    name: "Shipping Address Verifier",
    description: "Reduce failed deliveries by validating addresses.",
    icon: "https://static.wixstatic.com/media/1fff64_8e60357c0b134468a6c6f4c7e4570de5~mv2.png",
    url: "https://www.wix.com/app-market/shipping-address-verifier",
  },
  {
    name: "Google Drive Content",
    description: "Embed and sync content straight from Google Drive.",
    icon: "https://static.wixstatic.com/media/1fff64_8e60357c0b134468a6c6f4c7e4570de5~mv2.png",
    url: "https://www.wix.com/app-market/6d396a1f-1145-4feb-9531-3b520ab4389e",
  },
];

const EXPLORE_URL = "https://www.wix.com/app-market";

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
      <TextButton as="a" href={EXPLORE_URL} target="_blank" size="small">
        Explore more apps
      </TextButton>
    </Card.Content>
  </Card>
);
