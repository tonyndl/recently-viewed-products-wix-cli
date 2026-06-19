import type { FC } from "react";
import { Box, Button, Card, Text } from "@wix/design-system";
import * as Icons from "@wix/wix-ui-icons-common";
import { styles } from "../styles/index";

interface SetupCardProps {
  editorUrl: string | null;
}

const STEPS = [
  "Open your site in the Wix Editor.",
  "Click Add Elements → App Widgets → Recently Viewed Products.",
  "Drag the widget onto any page (your product page works great).",
  "Publish. The gallery fills in automatically as visitors browse products.",
];

export const SetupCard: FC<SetupCardProps> = ({ editorUrl }) => (
  <Card stretchVertically>
    <Card.Header title="Add the widget to your site" />
    <Card.Divider />
    <Card.Content>
      <Box direction="vertical" gap="16px">
        {STEPS.map((step, i) => (
          <div key={i} style={styles.stepRow}>
            <span style={styles.stepNumber}>{i + 1}</span>
            <Text size="small">{step}</Text>
          </div>
        ))}
        <Box align="left">
          <Button
            skin="inverted"
            prefixIcon={<Icons.Edit />}
            disabled={!editorUrl}
            onClick={() => editorUrl && window.open(editorUrl, "_blank")}
          >
            Open in Editor
          </Button>
        </Box>
      </Box>
    </Card.Content>
  </Card>
);
