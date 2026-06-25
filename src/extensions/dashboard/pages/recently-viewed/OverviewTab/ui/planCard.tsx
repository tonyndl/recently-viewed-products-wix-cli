import type { FC } from "react";
import {
  Badge,
  Button,
  SkeletonGroup,
  SkeletonLine,
  Text,
} from "@wix/design-system";
import * as Icons from "@wix/wix-ui-icons-common";
import { PREMIUM_FEATURES, freeTrialLabel } from "../../upgradeUtils";
import { styles } from "./styles/planCard";

type Props = {
  isPremium: boolean;
  onFreeTrial?: boolean;
  freeTrialDaysLeft?: number;
  freeTrialAvailable?: boolean;
  upgradeUrl?: string;
  loading?: boolean;
};

// "Your Plan" card for the Overview tab — shows the current plan status (Free /
// Trial · N days left / Premium) alongside the Premium benefit checklist.
export const PlanCard: FC<Props> = ({
  isPremium,
  onFreeTrial,
  freeTrialDaysLeft,
  freeTrialAvailable,
  upgradeUrl,
  loading,
}) => (
  <div style={styles.card}>
    <div style={styles.left}>
      <div style={styles.crown}>
        <Icons.PremiumFilled size="26px" />
      </div>
      <Text weight="bold">Your Plan</Text>

      {loading ? (
        <SkeletonGroup>
          <SkeletonLine width="80px" />
        </SkeletonGroup>
      ) : onFreeTrial && typeof freeTrialDaysLeft === "number" ? (
        <Badge skin="success" size="small">
          {freeTrialLabel(freeTrialDaysLeft)}
        </Badge>
      ) : isPremium ? (
        <Badge skin="premium" size="small" prefixIcon={<Icons.ConfirmSmall />}>
          Active
        </Badge>
      ) : (
        <Badge skin="standard" size="small">
          Free
        </Badge>
      )}

      {!loading && !isPremium && upgradeUrl && (
        <Button
          size="small"
          skin="premium"
          prefixIcon={<Icons.PremiumFilled />}
          onClick={() => window.open(upgradeUrl, "_blank")}
        >
          {freeTrialAvailable ? "Start Free Trial" : "Upgrade"}
        </Button>
      )}
    </div>

    <div style={styles.divider} />

    <div style={styles.benefits}>
      {PREMIUM_FEATURES.map((feature) => (
        <div key={feature} style={styles.benefitRow}>
          <span style={styles.check}>
            <Icons.ConfirmSmall size="14px" />
          </span>
          <Text size="small">{feature}</Text>
        </div>
      ))}
    </div>
  </div>
);

export default PlanCard;
