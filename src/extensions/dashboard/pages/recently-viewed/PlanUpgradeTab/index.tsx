import { type FC, useState } from 'react';
import { Box, Card, Loader } from '@wix/design-system';
import CurrentPlanCard from '../CurrentPlanCard';
import { styles } from './styles';
import { buildPricingTiers } from './utils';
import PricingCardHeader from './ui/cardHeader';
import PricingTierCard from './ui/pricingTierCard';

type Props = {
  isPremium: boolean;
  upgradeUrl: string | undefined;
  planPricing: PlanPricing | null;
};

export const PlanUpgradeTab: FC<Props> = ({ isPremium, upgradeUrl, planPricing }) => {
  const [isYearly, setIsYearly] = useState(false);
  const plansLoading = planPricing === null;
  const pricingTiers = buildPricingTiers(planPricing);
  const resolvedUpgradeUrl = upgradeUrl ?? '';
  const currency = planPricing?.currency ?? 'USD';
  const hasYearlyOption = pricingTiers.some((t) => t.yearlyPrice);
  const savingsPercent = pricingTiers.find((t) => t.savingsPercent)?.savingsPercent;
  const currentTier = pricingTiers.find((tier) => {
    const isFreeOrBasic = ['free', 'basic'].includes(tier.name.toLowerCase());
    return isFreeOrBasic ? !isPremium : isPremium;
  });

  return (
    <Box marginTop="SP5" direction="vertical" gap="SP4">
      <div>
        <CurrentPlanCard
          isPremium={isPremium}
          currentTier={currentTier}
          upgradeUrl={resolvedUpgradeUrl}
        />
      </div>
      <div>
        <Card>
          <PricingCardHeader
            plansLoading={plansLoading}
            hasYearlyOption={hasYearlyOption}
            isYearly={isYearly}
            savingsPercent={savingsPercent}
            onSetYearly={setIsYearly}
          />
          <Card.Divider />
          <Card.Content>
            {plansLoading ? (
              <Box align="center" padding="40px">
                <Loader size="small" />
              </Box>
            ) : (
              <div style={styles.plansGrid}>
                {pricingTiers.map((tier) => (
                  <PricingTierCard
                    key={tier.name}
                    tier={tier}
                    isPremium={isPremium}
                    isYearly={isYearly}
                    currency={currency}
                    resolvedUpgradeUrl={resolvedUpgradeUrl}
                  />
                ))}
              </div>
            )}
          </Card.Content>
        </Card>
      </div>
    </Box>
  );
};

export default PlanUpgradeTab;
