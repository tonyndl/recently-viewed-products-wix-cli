import { useCallback, useEffect, useState, type FC } from 'react';
import { Box, Button, Page, Tabs, WixDesignSystemProvider } from '@wix/design-system';
import '@wix/design-system/styles.global.css';
import * as Icons from '@wix/wix-ui-icons-common';
import {
  fetchPlan,
  fetchEditorUrl,
  loadAppPlans,
  fetchStoreProductCount,
} from './recently-viewed-actions';
import { OverviewTab } from './OverviewTab';
import { PlanUpgradeTab } from './PlanUpgradeTab';
import { HowToUseTab } from './HowToUseTab';
import { MoreAppsByUs } from './MoreAppsByUs';

const DashboardPage: FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [upgradeUrl, setUpgradeUrl] = useState<string | undefined>();
  const [planPricing, setPlanPricing] = useState<PlanPricing | null>(null);
  const [productCount, setProductCount] = useState<number | null>(null);

  const editorUrl = fetchEditorUrl();

  const loadPlan = useCallback(async () => {
    try {
      const plan = await fetchPlan();
      setIsPremium(plan.isPremium);
      setUpgradeUrl(plan.upgradeUrl);
    } catch (err) {
      console.error('[loadPlan] failed:', err);
    }
  }, []);

  useEffect(() => {
    void loadPlan();
    void loadAppPlans().then(setPlanPricing);
    void fetchStoreProductCount().then(setProductCount);
  }, [loadPlan]);

  // Re-check premium when returning from an upgrade flow opened in a new tab.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') void loadPlan();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [loadPlan]);

  return (
    <WixDesignSystemProvider>
      <Page>
        <Page.Header
          title="Recently Viewed Products"
          subtitle="Show shoppers the products they recently viewed — automatically."
          actionsBar={
            <Box gap="12px" align="center">
              {!isPremium && upgradeUrl && (
                <Button
                  skin="premium"
                  prefixIcon={<Icons.PremiumFilled />}
                  onClick={() => window.open(upgradeUrl, '_blank')}
                >
                  Upgrade to Premium
                </Button>
              )}
              <Button
                skin="inverted"
                prefixIcon={<Icons.Edit />}
                disabled={!editorUrl}
                onClick={() => editorUrl && window.open(editorUrl, '_blank')}
              >
                Open in Editor
              </Button>
            </Box>
          }
        />
        <Page.Content>
          <Box direction="vertical" gap="24px">
            <Tabs
              activeId={activeTab + 1}
              onClick={({ id }) => setActiveTab((id as number) - 1)}
              items={[
                { id: 1, title: 'Overview' },
                { id: 2, title: 'Plan & Upgrade' },
                { id: 3, title: 'How to Use' },
              ]}
            />

            {activeTab === 0 && (
              <OverviewTab
                isPremium={isPremium}
                upgradeUrl={upgradeUrl}
                editorUrl={editorUrl}
                productCount={productCount}
              />
            )}

            {activeTab === 1 && (
              <PlanUpgradeTab
                isPremium={isPremium}
                upgradeUrl={upgradeUrl}
                planPricing={planPricing}
              />
            )}

            {activeTab === 2 && <HowToUseTab />}

            {activeTab === 0 && <MoreAppsByUs />}
          </Box>
        </Page.Content>
      </Page>
    </WixDesignSystemProvider>
  );
};

export default DashboardPage;
