import wixApplication from "wix-application";
import { local } from "wix-storage";
import wixWindowFrontend from "wix-window-frontend";
import wixData from "wix-data";
import wixLocationFrontend from "wix-location-frontend";
import { startEmbed } from "backend/embed-utils.jsw";
// import { startEmbed_2 } from 'backend/embed-utils-2.web.js';

let viewMode = wixWindowFrontend.viewMode; // "Editor";

$w.onReady(async function () {
  $w("#widgetViewedProducts").hide();
  $w("#logo").delete();
  $w("#proGallery").hide();
  $w("#noProductsText").delete();
  let app = await wixApplication.getDecodedAppInstance();
  let instance = app.instanceId;
  let plan = app.vendorProductId;
  if (!plan) $w("#logo").restore();
  init();
  if (viewMode === "Editor") {
    showDefault();
    startEmbed(instance);
    // startEmbed_2(instance);
    if ($widget.props.behavior === "text") $w("#noProductsText").restore();
  }
});

$widget.onPropsChanged((oldProps, newProps) => {
  if (viewMode === "Editor") {
    if ($widget.props.behavior === "text") $w("#noProductsText").restore();
    else $w("#noProductsText").delete();
  }
});

function noItems() {
  $w("#widgetViewedProducts").show();
  if (viewMode === "Editor") return;
  if ($widget.props.behavior === "text") {
    $w("#proGallery").hide();
    $w("#noProductsText").expand();
    $w("#noProductsText").restore();
  } else {
    $w("#widgetViewedProducts").collapse();
  }
}
async function init() {
  let localItem = local.getItem("pagesplugin");
  // console.log(localItem);
  setTimeout(async () => {
    console.log("LOCAL", localItem);
    if (!localItem) return noItems();
    $w("#noProductsText").delete();
    let itemsToDisplay = await wixData
      .query("Stores/Products")
      .hasSome("slug", JSON.parse(localItem))
      .fields(
        "mainMedia",
        "name",
        "id",
        "formattedDiscountedPrice",
        "productPageUrl",
      )
      .find()
      .then((res) => res.items);
    console.log("ITEMS", itemsToDisplay);
    setTimeout(() => {
      if (itemsToDisplay.length === 0) return noItems();
      $w("#noProductsText").delete();
      $w("#proGallery").items = itemsToDisplay.map((x) => {
        return {
          type: "image",
          link: wixLocationFrontend.baseUrl + x.productPageUrl,
          description: x.formattedDiscountedPrice,
          title: x.name,
          src: x.mainMedia,
        };
      });
      $w("#proGallery").show();
      $w("#widgetViewedProducts").expand();
      $w("#widgetViewedProducts").show();
    }, 30);
  }, 30);
}
async function showDefault() {
  let itemsToDisplay = await wixData
    .query("Stores/Products")
    .fields(
      "mainMedia",
      "name",
      "id",
      "formattedDiscountedPrice",
      "productPageUrl",
    )
    .find()
    .then((res) => res.items);

  if (itemsToDisplay.length === 0) return $w("#proGallery").show();
  $w("#proGallery").items = itemsToDisplay.map((x) => {
    return {
      type: "image",
      link: wixLocationFrontend.baseUrl + x.productPageUrl,
      description: x.formattedDiscountedPrice,
      title: x.name,
      src: x.mainMedia,
    };
  });
  $w("#proGallery").show();
}
