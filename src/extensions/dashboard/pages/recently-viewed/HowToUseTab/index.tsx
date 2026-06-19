import type { FC } from "react";
import {
  Accordion,
  accordionItemBuilder,
  Box,
  Button,
  Card,
  Cell,
  Heading,
  Layout,
  Text,
} from "@wix/design-system";
import * as Icons from "@wix/wix-ui-icons-common";
import { openRatePopup } from "../../../_shared/rate-popup";

const SUPPORT_EMAIL = "apps-support@prpl.io";

const STEPS = [
  'In the Editor, open Add Elements → App Widgets and add "Recently Viewed Products" to your page.',
  'Select the widget and click "Widget Settings" in its action bar to choose what shows when there are no items (Show Text or Hide Widget).',
  "Publish your site. As visitors browse product pages, their history is saved privately in their browser.",
  "The widget automatically shows each visitor the products they recently viewed.",
  'To remove the "Powered by PURPLE" watermark, click "Remove Watermark" in the action bar and upgrade to Premium.',
];

const FAQ = [
  {
    title: "Where does the recently-viewed data come from?",
    answer:
      "It is stored privately in each visitor’s browser (localStorage). Nothing is sent to a server, so it works instantly and respects privacy.",
  },
  {
    title: "Why is the widget not showing on a page?",
    answer:
      'The widget hides itself when a visitor has not viewed any products yet, or when none of the viewed products are still available in your store. You can switch this to "Show Text" in the widget settings.',
  },
  {
    title: "How do I remove the watermark?",
    answer:
      'Click "Remove Watermark" in the widget’s action bar (or the Plan & Upgrade tab) and upgrade to Premium. The "Powered by PURPLE" badge is removed automatically.',
  },
  {
    title: "How many products are tracked?",
    answer:
      "Up to 26 of the most recently viewed products are kept per visitor.",
  },
];

export const HowToUseTab: FC = () => (
  <Layout>
    <Cell span={12}>
      <Card>
        <Card.Header title="How it works" />
        <Card.Divider />
        <Card.Content>
          <Box direction="vertical" gap="16px">
            {STEPS.map((step, i) => (
              <Box key={i} gap="10px" verticalAlign="top">
                <Text weight="bold" size="small">
                  {i + 1}.
                </Text>
                <Text size="small">{step}</Text>
              </Box>
            ))}
          </Box>
        </Card.Content>
      </Card>
    </Cell>

    <Cell span={12}>
      <Card>
        <Card.Header title="Frequently asked questions" />
        <Card.Divider />
        <Card.Content>
          <Accordion
            multiple
            items={FAQ.map((item) =>
              accordionItemBuilder({
                title: item.title,
                children: (
                  <Text size="small" secondary>
                    {item.answer}
                  </Text>
                ),
              }),
            )}
          />
        </Card.Content>
      </Card>
    </Cell>

    <Cell span={12}>
      <Card>
        <Card.Content>
          <Box verticalAlign="middle" gap="12px">
            <Icons.ChatFilled />
            <Box flex="1" direction="vertical">
              <Text weight="bold">Need help?</Text>
              <Text size="small" secondary>
                We usually reply within one business day.
              </Text>
            </Box>
            <Button
              as="a"
              href={`mailto:${SUPPORT_EMAIL}`}
              prefixIcon={<Icons.Email />}
              priority="secondary"
            >
              {SUPPORT_EMAIL}
            </Button>
          </Box>
        </Card.Content>
      </Card>
    </Cell>
  </Layout>
);
