import type { APIRoute } from 'astro';
import { auth } from '@wix/essentials';
import { appInstances } from '@wix/app-management';
import { customJson } from '../../utils/customJson';
import { APP_ID, FALLBACK_UPGRADE_URL } from '../../constants';

// Returns the site's premium status and an upgrade URL when on the free plan.
// Premium removes the watermark from the site widget.
export const GET: APIRoute = () => {
  const elevatedGetAppInstance = auth.elevate(appInstances.getAppInstance);
  return elevatedGetAppInstance()
    .then(({ instance }) => {
      const isPremium = instance ? !instance.isFree : false;
      const packageName = (instance?.billing?.packageName ?? '').toLowerCase();
      const instanceId = instance?.instanceId;
      const upgradeUrl = !isPremium
        ? instanceId
          ? `https://www.wix.com/apps/upgrade/${APP_ID}?appInstanceId=${instanceId}`
          : FALLBACK_UPGRADE_URL
        : undefined;
      return customJson({ isPremium, packageName, upgradeUrl });
    })
    .catch(() =>
      customJson({
        isPremium: false,
        packageName: '',
        upgradeUrl: FALLBACK_UPGRADE_URL,
      }),
    );
};
