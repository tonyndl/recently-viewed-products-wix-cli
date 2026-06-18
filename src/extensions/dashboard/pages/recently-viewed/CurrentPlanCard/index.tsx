import { type FC } from 'react';
import { Text, Button, Badge } from '@wix/design-system';
import * as Icons from '@wix/wix-ui-icons-common';
import { openUpgradeUrl } from '../upgradeUtils';
import { styles } from './styles';

type Props = {
  isPremium: boolean;
  currentTier: PricingTier | undefined;
  upgradeUrl: string;
};

const CurrentPlanCard: FC<Props> = ({ isPremium, currentTier, upgradeUrl }) => {
  const features = currentTier?.features ?? [];

  return (
    <div style={styles.card}>
      <div>
        <div style={styles.infoRow}>
          <Text weight="bold">Your Current Plan:</Text>
          <Badge skin={isPremium ? 'premium' : 'standard'} size="tiny">
            {isPremium ? 'PREMIUM' : 'FREE'}
          </Badge>
          <Text secondary>{isPremium ? currentTier?.name ?? 'Premium' : '$0 forever'}</Text>
        </div>
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
          Upgrade to Premium
        </Button>
      )}
    </div>
  );
};

export default CurrentPlanCard;
