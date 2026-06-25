import { type FC } from "react";
import { Text, Button, Badge } from "@wix/design-system";
import * as Icons from "@wix/wix-ui-icons-common";
import { openUpgradeUrl, freeTrialLabel } from "../upgradeUtils";
import { styles } from "./styles";

type Props = {
  isPremium: boolean;
  currentTier: PricingTier | undefined;
  upgradeUrl: string;
  freeTrialAvailable?: boolean;
  onFreeTrial?: boolean;
  freeTrialDaysLeft?: number;
};

const CurrentPlanCard: FC<Props> = ({
  isPremium,
  currentTier,
  upgradeUrl,
  freeTrialAvailable,
  onFreeTrial,
  freeTrialDaysLeft,
}) => {
  const features = currentTier?.features ?? [];

  return (
    <div style={styles.card}>
      <div>
        <div style={styles.infoRow}>
          <Text weight="bold">Your Current Plan:</Text>
          {onFreeTrial && typeof freeTrialDaysLeft === "number" ? (
            <Badge skin="success" size="tiny">
              {freeTrialLabel(freeTrialDaysLeft)}
            </Badge>
          ) : (
            <Badge skin={isPremium ? "premium" : "standard"} size="tiny">
              {isPremium ? "PREMIUM" : "FREE"}
            </Badge>
          )}
        </div>
        {onFreeTrial && (
          <Text size="tiny" secondary>
            You're on a free trial with full Premium access. Your subscription
            begins when the trial ends, unless you cancel.
          </Text>
        )}
        {features.length > 0 && (
          <div style={styles.featuresRow}>
            {features.map((f) => (
              <div key={f} style={styles.featureItem}>
                <span style={styles.circleCheck}>✓</span>
                <Text size="small" secondary>
                  {f}
                </Text>
              </div>
            ))}
          </div>
        )}
      </div>
      {!isPremium && (
        <Button
          skin="premium"
          prefixIcon={<Icons.PremiumFilled />}
          onClick={() => openUpgradeUrl(upgradeUrl)}
        >
          {freeTrialAvailable ? "Start Free Trial" : "Upgrade to Premium"}
        </Button>
      )}
    </div>
  );
};

export default CurrentPlanCard;
