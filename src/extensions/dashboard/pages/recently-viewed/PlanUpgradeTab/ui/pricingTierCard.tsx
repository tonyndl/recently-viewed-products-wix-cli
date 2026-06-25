import { type FC } from "react";
import { Text, Button, Badge } from "@wix/design-system";
import * as Icons from "@wix/wix-ui-icons-common";
import { formatPrice, openUpgradeUrl } from "../../upgradeUtils";
import { getCardStyle, styles } from "./styles/pricingTierCard";

type Props = {
  tier: PricingTier;
  isPremium: boolean;
  isYearly: boolean;
  currency: string;
  resolvedUpgradeUrl: string;
  freeTrialAvailable?: boolean;
};

const PricingTierCard: FC<Props> = ({
  tier,
  isPremium,
  isYearly,
  currency,
  resolvedUpgradeUrl,
  freeTrialAvailable,
}) => {
  const isFree = tier.name.toLowerCase() === "free";
  const isCurrentPlan = isFree ? !isPremium : isPremium;
  const price = isYearly ? tier.yearlyPrice : tier.monthlyPrice;
  // Both monthlyPrice and yearlyPrice are already monthly-equivalent amounts from the API.
  const displayPrice = price ? formatPrice(price, currency) : null;

  return (
    <div style={getCardStyle(isCurrentPlan)}>
      <div style={styles.nameRow}>
        <Text weight="bold">{tier.name}</Text>
        {isCurrentPlan && (
          <Badge skin="standard" size="tiny">
            Current Plan
          </Badge>
        )}
        {tier.popular && !isFree && !isCurrentPlan && (
          <Badge skin="success" size="tiny">
            Most Popular
          </Badge>
        )}
      </div>

      <div style={styles.priceRow}>
        {isFree ? (
          <>
            <Text weight="bold">$0</Text>
            <Text size="small" secondary>
              forever
            </Text>
          </>
        ) : displayPrice ? (
          <>
            <Text weight="bold">{displayPrice}</Text>
            <Text size="small" secondary>
              /month
            </Text>
          </>
        ) : (
          <Text size="small" secondary>
            See pricing →
          </Text>
        )}
      </div>

      <div style={styles.featureList}>
        {tier.features.map((feature) => (
          <div key={feature} style={styles.featureRow}>
            <span style={styles.circleCheck}>✓</span>
            <Text size="small">{feature}</Text>
          </div>
        ))}
      </div>

      {isCurrentPlan ? (
        <Button priority="secondary" disabled>
          Current Plan
        </Button>
      ) : isFree ? null : (
        <Button
          skin="premium"
          prefixIcon={<Icons.PremiumFilled />}
          onClick={() => openUpgradeUrl(resolvedUpgradeUrl)}
        >
          {freeTrialAvailable ? "Start Free Trial" : "Upgrade"}
        </Button>
      )}
    </div>
  );
};

export default PricingTierCard;
