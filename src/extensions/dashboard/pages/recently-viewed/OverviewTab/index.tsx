import type { FC } from 'react';
import {
  Badge,
  Box,
  Card,
  Cell,
  Heading,
  Layout,
  Text,
  TextButton,
} from '@wix/design-system';
import * as Icons from '@wix/wix-ui-icons-common';
import { SetupCard } from './ui/setupCard';
import { LivePreview } from './ui/livePreview';

interface OverviewTabProps {
  isPremium: boolean;
  upgradeUrl: string | undefined;
  editorUrl: string | null;
  productCount: number | null;
}

const StatCard: FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  footer?: React.ReactNode;
}> = ({ title, value, icon, footer }) => (
  <Card stretchVertically>
    <Card.Content>
      <Box direction="vertical" gap="6px" height="100%">
        <Box verticalAlign="middle" gap="8px">
          {icon}
          <Text size="small" secondary>
            {title}
          </Text>
        </Box>
        <Heading size="medium">{value}</Heading>
        <Box flex="1" />
        {footer}
      </Box>
    </Card.Content>
  </Card>
);

export const OverviewTab: FC<OverviewTabProps> = ({
  isPremium,
  upgradeUrl,
  editorUrl,
  productCount,
}) => (
  <Layout>
    <Cell span={6}>
      <StatCard
        title="Store products"
        value={productCount == null ? '—' : String(productCount)}
        icon={<Icons.Catalog />}
      />
    </Cell>
    <Cell span={6}>
      <StatCard
        title="Plan"
        value={isPremium ? 'Premium' : 'Free'}
        icon={<Icons.PremiumFilled />}
        footer={
          !isPremium && upgradeUrl ? (
            <TextButton size="small" onClick={() => window.open(upgradeUrl, '_blank')}>
              Upgrade
            </TextButton>
          ) : (
            <Badge skin="success" size="small">
              Active
            </Badge>
          )
        }
      />
    </Cell>

    <Cell span={6}>
      <SetupCard editorUrl={editorUrl} />
    </Cell>
    <Cell span={6}>
      <Card>
        <Card.Header
          title="Preview"
          subtitle="How the gallery looks on your storefront."
        />
        <Card.Divider />
        <Card.Content>
          <LivePreview />
        </Card.Content>
      </Card>
    </Cell>
  </Layout>
);
