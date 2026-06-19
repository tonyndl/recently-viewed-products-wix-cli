import wixApplication from "wix-application";
import wixWidget from "wix-widget";

$w.onReady(async function () {
  let props = await wixWidget.getProps();
  $w("#behavior").value = props.behavior;
  $w("#behavior").onChange(() => {
    wixWidget.setProps({ behavior: $w("#behavior").value });
  });
  let instance = await wixApplication.getDecodedAppInstance();
  $w("#prem1").link =
    `https://www.wix.com/apps/upgrade/${instance.appDefId}?appInstanceId=${instance.instanceId}`;
});
