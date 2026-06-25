import type { FC } from "react";
import { Box, Button, Text } from "@wix/design-system";
import * as Icons from "@wix/wix-ui-icons-common";
import { FREE_TRIAL_DAYS } from "../../../../../constants";
import { styles } from "./styles";
import "./FreeTrialBanner.css";

type Props = {
  onStart: () => void;
};

// Promo banner under the dashboard tabs, shown only while the site is eligible
// for a free trial. Copy is tailored to Recently Viewed Products' Premium
// features (every layout/ratio, custom colours, watermark removal).
export const FreeTrialBanner: FC<Props> = ({ onStart }) => (
  <div style={styles.banner}>
    <div style={styles.left}>
      <span style={styles.crown}>
        <Icons.PremiumFilled size="24px" />
      </span>
      <Box direction="vertical" gap="6px">
        <Text size="medium" weight="bold">
          Start your {FREE_TRIAL_DAYS}-day free trial
        </Text>
        <Text size="small" secondary className="rv-trial-body">
          Try every Premium feature free for {FREE_TRIAL_DAYS} days through Wix
          checkout — every gallery layout (Grid, Masonry, Slider &amp; more),
          image ratios, custom heading &amp; text colours, background colour,
          and no &quot;Powered by PURPLE&quot; watermark.
        </Text>
      </Box>
    </div>
    <div style={styles.buttonWrap}>
      <Button
        skin="premium"
        prefixIcon={<Icons.PremiumFilled />}
        onClick={onStart}
      >
        Start {FREE_TRIAL_DAYS}-Day Free Trial
      </Button>
    </div>
  </div>
);

export default FreeTrialBanner;
