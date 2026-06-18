import { type FC } from 'react';
import { Text, Badge } from '@wix/design-system';
import { styles } from './styles/cardHeader';

type Props = {
  plansLoading: boolean;
  hasYearlyOption: boolean;
  isYearly: boolean;
  savingsPercent: number | undefined;
  onSetYearly: (value: boolean) => void;
};

const PricingCardHeader: FC<Props> = ({
  plansLoading,
  hasYearlyOption,
  isYearly,
  savingsPercent,
  onSetYearly,
}) => (
  <div style={styles.header}>
    <div style={styles.titleSection}>
      <Text weight="bold">Plans & Pricing</Text>
      <Text size="small" secondary>
        Choose the plan that fits your needs.
      </Text>
    </div>
    {!plansLoading && hasYearlyOption && (
      <div style={styles.pillToggle}>
        <div style={styles.segmentedControl}>
          <div
            style={isYearly ? styles.pill : styles.pillActive}
            onClick={() => onSetYearly(false)}
          >
            <Text size="small" weight={isYearly ? 'normal' : 'bold'}>
              Monthly
            </Text>
          </div>
          <div
            style={{
              ...styles.pill,
              ...(isYearly ? styles.pillActive : {}),
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onClick={() => onSetYearly(true)}
          >
            <Text size="small" weight={isYearly ? 'bold' : 'normal'}>
              Yearly
            </Text>
            {savingsPercent !== undefined && (
              <Badge skin="success" size="tiny">
                Save {savingsPercent}%
              </Badge>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
);

export default PricingCardHeader;
