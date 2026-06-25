import type { FC } from "react";
import { Text, Button } from "@wix/design-system";
import * as Icons from "@wix/wix-ui-icons-common";
import { FREE_TRIAL_DAYS } from "../../../../../../constants";
import { styles } from "./styles/premiumNudge";

interface Props {
  onUpgrade: () => void;
  disabled?: boolean;
  freeTrialAvailable?: boolean;
}

// Compact upgrade CTA shown under the layout picker for free-plan users —
// reinforces that every layout beyond Strip is unlocked with Premium. When the
// user is eligible for a free trial, lead with the trial instead.
export const PremiumNudge: FC<Props> = ({
  onUpgrade,
  disabled,
  freeTrialAvailable,
}) => (
  <div style={styles.banner}>
    {/* <div style={styles.badge}>
      <Icons.PremiumFilled size="18px" />
    </div> */}
    <div style={styles.copy}>
      <Text size="tiny" weight="bold">
        {freeTrialAvailable
          ? `Try Premium free for ${FREE_TRIAL_DAYS} days`
          : "Unlock every layout"}
      </Text>
      <Text size="tiny" secondary>
        Go Premium for every layout & full design control.
      </Text>
    </div>
    <Button
      size="tiny"
      skin="premium"
      prefixIcon={<Icons.PremiumFilled />}
      disabled={disabled}
      onClick={onUpgrade}
    >
      {freeTrialAvailable ? "Start Free Trial" : "Upgrade"}
    </Button>
  </div>
);

export default PremiumNudge;
