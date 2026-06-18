// For Velo API Reference documentation visit https://www.wix.com/velo/reference/api-overview
// To learn about panel code visit https://support.wix.com/en/article/wix-blocks-adding-code-to-your-custom-panels

import wixWidget from 'wix-widget'; // Control your widget's properties, design presets, and more.
import wixApplication from 'wix-application';

$w.onReady(async function () {
    let props = await wixWidget.getProps();
    $w('#behavior').value = props.behavior;
    $w('#behavior').onChange(() => {
        wixWidget.setProps({ behavior: $w('#behavior').value });
    })
	    let instance = await wixApplication.getDecodedAppInstance();
    $w('#prem1').link = `https://www.wix.com/apps/upgrade/${instance.appDefId}?appInstanceId=${instance.instanceId}`;
});
