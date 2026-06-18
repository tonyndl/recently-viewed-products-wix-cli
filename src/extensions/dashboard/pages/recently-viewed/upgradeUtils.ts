export const FREE_FEATURES = [
  'Recently viewed products widget',
  'Strip & Grid layouts',
  'Powered by PURPLE watermark',
];

export const PREMIUM_FEATURES = [
  'Full design control',
  'Unlimited widgets',
  'No watermark',
  'Priority support',
];

export const openUpgradeUrl = (url: string | undefined) => {
  if (!url) return;
  window.open(url, '_blank');
};

export const formatPrice = (raw: string, currency: string): string => {
  const num = parseFloat(raw);
  if (isNaN(num)) return raw;
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(num);
};
