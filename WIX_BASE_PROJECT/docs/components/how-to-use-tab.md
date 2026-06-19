# HowToUseTab

The "How to Use" dashboard tab. Contains:

1. An FAQ accordion answering common questions about the app
2. A help/contact card with a support email button

Optionally includes an embedded interactive guide (e.g. GuideJar) — commented out by default until you have an embed URL.

---

## File structure

```
HowToUseTab/
  index.tsx
  styles/
    index.ts       (optional — only needed if you add custom layout styles)
```

---

## `index.tsx`

Replace `FAQ_ITEMS` with questions and answers relevant to your app, and update the support email.

```tsx
import { type FC } from "react";
import {
  Box,
  Text,
  Heading,
  Card,
  Accordion,
  Button,
  accordionItemBuilder,
} from "@wix/design-system";
import * as Icons from "@wix/wix-ui-icons-common";

// ─── Replace with your app's Q&A ─────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    title: "How do I add a new item?",
    answer:
      'Click the "+ Add Item" button at the top of the Manage Items tab. Fill in the required fields and click Save.',
  },
  {
    title: "How many items can I have on the free plan?",
    answer:
      "The free plan allows up to [N] items. Upgrade to Premium to add unlimited items.",
  },
  {
    title: "How do I display items on my website?",
    answer:
      "Add the widget to any page in your Wix Editor. Once placed, it stays in sync with your items automatically.",
  },
  {
    title: "Can I edit or delete existing items?",
    answer:
      "Yes. Each item has an Edit (pencil) and a Delete (trash) button. Edits are saved immediately.",
  },
  {
    title: "Why are my items not showing on my site?",
    answer:
      "Make sure you have placed the widget on your page in the Wix Editor and published your site.",
  },
  {
    title: "What do I get with the Premium plan?",
    answer:
      "Premium removes the item limit, removes the watermark, and unlocks priority support.",
  },
];

// ─── Replace with your support email ─────────────────────────────────────────
const SUPPORT_EMAIL = "support@yourdomain.com";

// ─── Optional: paste your GuideJar (or similar) embed URL here ───────────────
// const GUIDE_EMBED_URL = 'https://app.guidejar.com/embed/YOUR_ID';
// ─────────────────────────────────────────────────────────────────────────────

export const HowToUseTab: FC = () => (
  <Box direction="vertical" gap="SP5" marginTop="SP5">
    {/* Optional interactive guide — uncomment once you have an embed URL */}
    {/*
    <Card>
      <Card.Header
        title={<Heading size="small">Interactive Guide</Heading>}
        subtitle="Follow along step by step"
      />
      <Card.Divider />
      <Card.Content>
        <div
          style={{
            position: 'relative',
            height: 0,
            width: '100%',
            overflow: 'hidden',
            borderRadius: '6px',
            paddingBottom: 'calc(54.07% + 32px)',
          }}
        >
          <iframe
            src={GUIDE_EMBED_URL}
            width="100%"
            height="100%"
            style={{ position: 'absolute', inset: 0 }}
            allowFullScreen
            frameBorder="0"
            title="Interactive Guide"
          />
        </div>
      </Card.Content>
    </Card>
    */}

    {/* FAQ Accordion */}
    <Card>
      <Card.Header
        title={<Heading size="small">Frequently Asked Questions</Heading>}
      />
      <Card.Divider />
      <Card.Content>
        <Accordion
          multiple
          size="small"
          items={FAQ_ITEMS.map(({ title, answer }) =>
            accordionItemBuilder({
              title,
              children: (
                <Text size="small" secondary>
                  {answer}
                </Text>
              ),
            }),
          )}
        />
      </Card.Content>
    </Card>

    {/* Help / contact card */}
    <Card>
      <Card.Content>
        <Box direction="horizontal" verticalAlign="middle" gap="12px">
          <Icons.ChatFilled style={{ flexShrink: 0, width: 20, height: 20 }} />
          <Box flex="1" direction="vertical" gap="2px">
            <Text size="small" weight="bold">
              Need Help?
            </Text>
            <Text size="tiny" secondary>
              Having trouble? Our support team is here to help.
            </Text>
          </Box>
          <Button
            size="small"
            priority="secondary"
            as="a"
            href={`mailto:${SUPPORT_EMAIL}`}
            prefixIcon={<Icons.Email />}
          >
            {SUPPORT_EMAIL}
          </Button>
        </Box>
      </Card.Content>
    </Card>
  </Box>
);
```

---

## Wiring in the dashboard page

```tsx
import { HowToUseTab } from "./HowToUseTab";

{
  activeTab === 2 && <HowToUseTab />;
}
```
