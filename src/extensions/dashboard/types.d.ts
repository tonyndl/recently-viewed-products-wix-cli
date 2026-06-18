// Shared dashboard types — declared globally (no import needed in-folder).

interface PlanPrice {
  priceBeforeTax: string;
  totalPrice: string;
  billingCycle: {
    cycleType: string;
    cycleDuration?: { unit: string; count: number };
  };
}

interface AppPlan {
  _id: string;
  name: string;
  benefits: string[];
  prices: PlanPrice[];
}

interface PlanPricing {
  plans: AppPlan[];
  currency: string;
  showPriceWithTax: boolean;
}

interface PricingTier {
  name: string;
  planId?: string;
  yearlyPlanId?: string;
  monthlyPrice?: string;
  yearlyPrice?: string;
  savingsPercent?: number;
  features: string[];
  popular?: boolean;
}

// Premium / plan status returned by /api/check-plan.
interface PlanStatus {
  isPremium: boolean;
  packageName?: string;
  upgradeUrl?: string;
}

// Global default appearance for the site widget, edited in the dashboard.
interface WidgetSettingsData {
  _id: string;
  displayMode: 'gallery' | 'text';
  heading: string;
  maxItems: number;
  showPrice: boolean;
}
