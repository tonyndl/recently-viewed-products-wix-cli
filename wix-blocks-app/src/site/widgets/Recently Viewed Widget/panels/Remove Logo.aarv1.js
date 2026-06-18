import wixApplication from 'wix-application';

$w.onReady(async function () {
    let instance = await wixApplication.getDecodedAppInstance();
    $w('#prem1').link = `https://www.wix.com/apps/upgrade/${instance.appDefId}?appInstanceId=${instance.instanceId}`;
});