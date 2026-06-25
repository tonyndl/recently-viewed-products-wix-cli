import type { FC } from "react";
import {
  Box,
  Button,
  Card,
  Cell,
  Heading,
  Layout,
  SkeletonGroup,
  SkeletonLine,
  Text,
} from "@wix/design-system";
import * as Icons from "@wix/wix-ui-icons-common";
import { SetupCard } from "./ui/setupCard";
import { PlanCard } from "./ui/planCard";

interface OverviewTabProps {
  isPremium: boolean;
  upgradeUrl: string | undefined;
  editorUrl: string | null;
  productCount: number | null;
  freeTrialAvailable?: boolean;
  onFreeTrial?: boolean;
  freeTrialDaysLeft?: number;
  planLoaded?: boolean;
}

const StatCard: FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  footer?: React.ReactNode;
  loading?: boolean;
}> = ({ title, value, icon, footer, loading }) => (
  <Card stretchVertically>
    <Card.Content>
      <Box direction="vertical" gap="6px" height="100%">
        <Box verticalAlign="middle" gap="8px">
          {icon}
          <Text size="small" secondary>
            {title}
          </Text>
        </Box>
        {loading ? (
          <SkeletonGroup>
            <SkeletonLine width="90px" />
          </SkeletonGroup>
        ) : (
          <Heading size="medium">{value}</Heading>
        )}
        <Box flex="1" />
        {/* A plain horizontal Box keeps the badge/button at its natural width —
            a vertical Box stretches its children, which is what turned the
            status badge into a full-width bar. */}
        {loading ? (
          <SkeletonGroup>
            <SkeletonLine width="64px" />
          </SkeletonGroup>
        ) : (
          footer && <Box gap="6px">{footer}</Box>
        )}
      </Box>
    </Card.Content>
  </Card>
);

export const OverviewTab: FC<OverviewTabProps> = ({
  isPremium,
  upgradeUrl,
  editorUrl,
  productCount,
  freeTrialAvailable,
  onFreeTrial,
  freeTrialDaysLeft,
  planLoaded,
}) => (
  <Layout>
    {/* Only paid/trial plans get the rich purple benefits card. On the free plan
        (or while still loading) the plan box is a plain card the same size as the
        Store products box beside it. */}
    {planLoaded && isPremium ? (
      <>
        <Cell span={8}>
          <PlanCard
            isPremium={isPremium}
            onFreeTrial={onFreeTrial}
            freeTrialDaysLeft={freeTrialDaysLeft}
            freeTrialAvailable={freeTrialAvailable}
            upgradeUrl={upgradeUrl}
          />
        </Cell>
        <Cell span={4}>
          <StatCard
            title="Store products"
            value={productCount == null ? "—" : String(productCount)}
            loading={productCount == null}
            icon={<Icons.Catalog />}
          />
        </Cell>
      </>
    ) : (
      <>
        <Cell span={6}>
          <StatCard
            title="Your Plan"
            value="Free"
            loading={!planLoaded}
            icon={<Icons.PremiumFilled />}
            footer={
              upgradeUrl ? (
                <Button
                  size="small"
                  skin="premium"
                  prefixIcon={<Icons.PremiumFilled />}
                  onClick={() => window.open(upgradeUrl, "_blank")}
                >
                  {freeTrialAvailable ? "Start Free Trial" : "Upgrade"}
                </Button>
              ) : undefined
            }
          />
        </Cell>
        <Cell span={6}>
          <StatCard
            title="Store products"
            value={productCount == null ? "—" : String(productCount)}
            loading={productCount == null}
            icon={<Icons.Catalog />}
          />
        </Cell>
      </>
    )}

    <Cell span={12}>
      <SetupCard editorUrl={editorUrl} />
    </Cell>
  </Layout>
);
