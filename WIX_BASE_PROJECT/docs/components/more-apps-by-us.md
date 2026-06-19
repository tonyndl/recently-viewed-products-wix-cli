# MoreAppsByUs

A footer card shown at the bottom of the first dashboard tab. Promotes your other Wix apps with icons, names, descriptions, and "Get App" links. Includes a branded "Powered by" footer and an "Explore more apps" link.

---

## File structure

```
MoreAppsByUs/
  index.tsx
  styles/
    index.ts
  ui/
    appCard.tsx
    styles/
      appCard.ts
```

---

## `styles/index.ts`

```ts
import type { CSSProperties } from "react";

export const styles = {
  appsGrid: {
    display: "flex",
    gap: "24px",
    alignItems: "stretch",
  } as CSSProperties,
  poweredByRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  } as CSSProperties,
  exploreLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    color: "#3B6AEA",
    textDecoration: "none",
    fontSize: 13,
    fontWeight: 500,
    fontFamily:
      "HelveticaNeueW01-55Roma, HelveticaNeueW02-55Roma, HelveticaNeueW10-55Roma, Helvetica Neue, Helvetica, Arial, sans-serif",
    letterSpacing: "0.2px",
  } as CSSProperties,
  poweredByText: {
    fontSize: "10px",
    color: "#aaa",
    letterSpacing: "1.2px",
    lineHeight: 1,
    fontFamily:
      "HelveticaNeueW01-55Roma, HelveticaNeueW02-55Roma, HelveticaNeueW10-55Roma, Helvetica Neue, Helvetica, Arial, sans-serif",
    fontWeight: 500,
    textTransform: "uppercase",
  } as CSSProperties,
  poweredByLogo: {
    height: 20,
    display: "block",
  } as CSSProperties,
};
```

---

## `ui/styles/appCard.ts`

```ts
import type { CSSProperties } from "react";

export const styles = {
  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    padding: "12px",
    border: "1px solid #E5E5E5",
    borderRadius: "8px",
    flex: 1,
    minWidth: 0,
  } as CSSProperties,
  image: {
    width: "48px",
    height: "48px",
    borderRadius: "8px",
    objectFit: "cover",
  } as CSSProperties,
  descriptionWrapper: {
    flex: 1,
    display: "flex",
    alignItems: "center",
  } as CSSProperties,
};
```

---

## `ui/appCard.tsx`

```tsx
import type { FC } from "react";
import { Button, Text } from "@wix/design-system";
import { styles } from "./styles/appCard";

interface AppCardProps {
  name: string;
  description: string;
  icon: string;
  url: string;
}

export const AppCard: FC<AppCardProps> = ({ name, description, icon, url }) => (
  <div style={styles.card}>
    <img src={icon} alt={name} style={styles.image} />
    <Text size="small" weight="bold" style={{ textAlign: "center" }}>
      {name}
    </Text>
    <div style={styles.descriptionWrapper}>
      <Text size="tiny" secondary>
        {description}
      </Text>
    </div>
    <Button size="tiny" priority="secondary" as="a" href={url} target="_blank">
      Get App
    </Button>
  </div>
);
```

---

## `index.tsx`

Replace the `APPS` array and logo/explore-link with your own data. Keep the component structure identical.

```tsx
import type { FC } from "react";
import { Box, Card, Cell, Layout, Text } from "@wix/design-system";
import "@wix/design-system/styles.global.css";
import * as Icons from "@wix/wix-ui-icons-common";
import { styles } from "./styles";
import { AppCard } from "./ui/appCard";

// ─── Replace with your actual app data ───────────────────────────────────────
// Use direct CDN URLs for app icons — get them from the app's og:image on the
// Wix App Market page (e.g. https://www.wix.com/app-market/<app-id>).
// PRPL app icon CDN URLs:
//   Frequently Bought Together — https://static.wixstatic.com/media/1fff64_8e60357c0b134468a6c6f4c7e4570de5~mv2.png
//   360° Product Viewer        — https://static.wixstatic.com/media/1fff64_b3b04fc957894b29a0129bbc599baf03~mv2.png
//   Shipping Address Verifier  — https://static.wixstatic.com/media/1fff64_13f16a4f398e4a26b9d223ef37c3cd5f~mv2.png
//   Google Drive Content       — https://static.wixstatic.com/media/1fff64_333756fc4b2a4d6c8f9612d38b9298d7~mv2.png
import brandLogoImg from "../assets/purple-logo.png";

const resolve = (img: string | { src: string }) =>
  typeof img === "string" ? img : img.src;

const APPS = [
  {
    name: "Frequently Bought Together",
    description:
      "Boost sales by showing related products that customers often buy together.",
    icon: "https://static.wixstatic.com/media/1fff64_8e60357c0b134468a6c6f4c7e4570de5~mv2.png",
    url: "https://www.wix.com/app-market/17d75b11-b574-4b49-9708-4ffa8be777a6",
  },
  {
    name: "360° Product Viewer",
    description: "Let shoppers spin and explore products from every angle.",
    icon: "https://static.wixstatic.com/media/1fff64_b3b04fc957894b29a0129bbc599baf03~mv2.png",
    url: "https://www.wix.com/app-market/dd2b43ee-f3e5-4ca2-bb87-73f41be78d18",
  },
  {
    name: "Shipping Address Verifier",
    description:
      "Validate shipping addresses at checkout to reduce failed deliveries.",
    icon: "https://static.wixstatic.com/media/1fff64_13f16a4f398e4a26b9d223ef37c3cd5f~mv2.png",
    url: "https://www.wix.com/app-market/shipping-address-verifier",
  },
  {
    name: "Google Drive Content",
    description:
      "Display Google Drive files and folders directly on your site.",
    icon: "https://static.wixstatic.com/media/1fff64_333756fc4b2a4d6c8f9612d38b9298d7~mv2.png",
    url: "https://www.wix.com/app-market/6d396a1f-1145-4feb-9531-3b520ab4389e",
  },
];

const brandLogo = resolve(brandLogoImg);

// ─── "Explore more" link — your developer/brand page on the Wix App Market ──
const EXPLORE_URL = "https://www.wix.com/app-market/developer/purple";
// ─────────────────────────────────────────────────────────────────────────────

export const MoreAppsByUs: FC = () => (
  <Box marginTop="24px">
    <Layout>
      <Cell span={12}>
        <Card>
          <Card.Content>
            <Box direction="vertical" gap="18px">
              <Text size="medium" weight="bold">
                More apps by us
              </Text>

              <div style={styles.appsGrid}>
                {APPS.map((app) => (
                  <AppCard key={app.url} {...app} />
                ))}
              </div>

              <Box
                direction="horizontal"
                verticalAlign="middle"
                marginTop="6px"
              >
                <Box flex="1">
                  <a
                    href={EXPLORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.exploreLink}
                  >
                    Explore more apps <Icons.ExternalLink size="16px" />
                  </a>
                </Box>
                <div style={styles.poweredByRow}>
                  <span style={styles.poweredByText}>Powered by</span>
                  <img
                    src={brandLogo}
                    alt="Brand"
                    style={styles.poweredByLogo}
                  />
                </div>
              </Box>
            </Box>
          </Card.Content>
        </Card>
      </Cell>
    </Layout>
  </Box>
);
```

---

## Wiring in the dashboard page

Render below Tab 0 content only:

```tsx
import { MoreAppsByUs } from "./MoreAppsByUs";

{
  activeTab === 0 && <MoreAppsByUs />;
}
```
