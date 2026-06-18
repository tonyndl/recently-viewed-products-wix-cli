# FreeLimitBanner

`src/extensions/dashboard/pages/<page-name>/ManageItemsTab/ui/freeLimitBanner.tsx`

A banner shown inside the "Manage Items" tab when the user has reached their free plan item limit. Displays a message explaining the limit and an "Upgrade Now" button that opens the upgrade URL.

---

## File structure

```
ManageItemsTab/
  ui/
    freeLimitBanner.tsx
    styles/
      freeLimitBanner.ts
```

---

## `ui/styles/freeLimitBanner.ts`

```ts
import type { CSSProperties } from 'react';

export const styles = {
  banner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: '#FFF7E6',
    border: '1px solid #FFD166',
    borderRadius: '8px',
    gap: '12px',
  } as CSSProperties,
  textGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
  } as CSSProperties,
  upgradeButton: {
    flexShrink: 0,
  } as CSSProperties,
};
```

---

## `ui/freeLimitBanner.tsx`

Replace the copy with wording relevant to your app's free limit.

```tsx
import type { FC } from 'react';
import { Box, Button, Text } from '@wix/design-system';
import { PremiumFilled } from '@wix/wix-ui-icons-common';
import { styles } from './styles/freeLimitBanner';

interface FreeLimitBannerProps {
  upgradeUrl: string | undefined;
}

export const FreeLimitBanner: FC<FreeLimitBannerProps> = ({ upgradeUrl }) => (
  <Box style={styles.banner}>
    <Box direction="vertical" style={styles.textGroup}>
      <Text weight="bold" size="small">
        You've reached the [N] item limit
      </Text>
      <Text size="small" secondary>
        Upgrade to Premium to add unlimited items and remove the watermark.
      </Text>
    </Box>
    {upgradeUrl && (
      <Button
        skin="inverted"
        size="small"
        prefixIcon={<PremiumFilled />}
        onClick={() => window.open(upgradeUrl, '_blank')}
        style={styles.upgradeButton}
      >
        Upgrade Now
      </Button>
    )}
  </Box>
);
```

---

## Wiring in ManageItemsTab

Show the banner when the user has hit the free limit:

```tsx
import { FreeLimitBanner } from './ui/freeLimitBanner';

// In ManageItemsTab/index.tsx:
const atFreeLimit = !isPremium && items.length >= FREE_LIMIT;

{atFreeLimit && <FreeLimitBanner upgradeUrl={upgradeUrl} />}
```
