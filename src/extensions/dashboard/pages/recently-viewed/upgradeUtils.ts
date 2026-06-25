export const FREE_FEATURES = [
  "Recently viewed products widget",
  "Strip & Thumbnails layouts",
  '"Powered by PURPLE" watermark',
];

// Canonical Premium benefits. These drive the dashboard's Plan & Upgrade card.
// Keep the plan's "benefits" in the Wix Dev Center → Pricing IDENTICAL to this
// list so the App Market upgrade page shows the same benefits as the dashboard.
export const PREMIUM_FEATURES = [
  "All gallery layouts (Grid, Masonry, Slider & more)",
  "All image ratios & text positions",
  "Custom heading, text & background colors",
  'Remove the "Powered by PURPLE" watermark',
  "Priority support",
];

export const openUpgradeUrl = (url: string | undefined) => {
  if (!url) return;
  window.open(url, "_blank");
};

// "Trial · 8 days left" — WDS Badge uppercases it to "TRIAL · 8 DAYS LEFT".
export const freeTrialLabel = (daysLeft: number): string =>
  `Trial · ${daysLeft} ${daysLeft === 1 ? "day" : "days"} left`;

export const formatPrice = (raw: string, currency: string): string => {
  const num = parseFloat(raw);
  if (isNaN(num)) return raw;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(num);
};
