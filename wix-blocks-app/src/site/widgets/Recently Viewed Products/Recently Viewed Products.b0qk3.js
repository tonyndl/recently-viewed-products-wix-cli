import wixApplication from 'wix-application';
import { local } from 'wix-storage';
import wixWindowFrontend from "wix-window-frontend";
import wixData from 'wix-data';
import wixLocationFrontend from 'wix-location-frontend';

let viewMode = wixWindowFrontend.viewMode; // "Editor";

$w.onReady(async function () {
    $w('#proGallery').hide();
    let app = await wixApplication.getDecodedAppInstance();
    //let instance = app.instanceId;
    let plan = app.vendorProductId;
    if (plan) $w('#logo').delete();
    init();
    if (viewMode === 'Editor') {
        showDefault();
    }
    pre_init();
});

wixLocationFrontend.onChange(() => {
    //console.log('wixLocationFrontend.onChange');
    if (viewMode !== 'Editor') {
        init();
        pre_init();
    }
})
$widget.onPropsChanged((oldProps, newProps) => {
    pre_init();
});

function pre_init() {
    if (viewMode === 'Editor') return;
    let currentPageSlug = wixLocationFrontend.path[wixLocationFrontend.path.length - 1];
    let currentStorage = local.getItem('pagesplugin');
    if (currentStorage && currentStorage.length > 0) {
        let formattedStorage = JSON.parse(currentStorage);
        let found = formattedStorage.find((element) => element === currentPageSlug);
        if (!found) {
            formattedStorage.unshift(currentPageSlug);
            local.setItem('pagesplugin', JSON.stringify(formattedStorage.slice(0, 26)));
        }
    } else {
        local.setItem('pagesplugin', JSON.stringify([currentPageSlug]));
    }
}

function noItems() {
    if (viewMode === 'Editor') return;
    setTimeout(() => {
        if ($widget.props.behavior === "text") {
            $w('#proGallery').hide();
        } else {
            $w('#widgetViewedProducts').delete();
        }
    }, 20);
}
async function init() {
    let localItem = local.getItem('pagesplugin');
    if (!localItem) return noItems();
    let itemsToDisplay = await wixData.query('Stores/Products').hasSome('slug', JSON.parse(localItem)).fields('mainMedia', 'name', 'id', 'formattedDiscountedPrice', 'productPageUrl').find({ suppressAuth: true }).then(res => res.items);
    if (itemsToDisplay.length === 0) return noItems();
    $w('#widgetViewedProducts').restore();
    $w('#proGallery').items = itemsToDisplay.map((x) => {
        return {
            type: "image",
            link: wixLocationFrontend.baseUrl + x.productPageUrl,
            description: x.formattedDiscountedPrice,
            title: x.name,
            src: x.mainMedia,
        }
    })
    $w('#widgetViewedProducts').restore();
    $w('#proGallery').show();
}
async function showDefault() {

    let itemsToDisplay = await wixData.query('Stores/Products').fields('mainMedia', 'name', 'id', 'formattedDiscountedPrice', 'productPageUrl').limit(26).find().then(res => res.items);

    if (itemsToDisplay.length === 0) return $w('#proGallery').show();
    $w('#proGallery').items = itemsToDisplay.map((x) => {
        return {
            type: "image",
            link: wixLocationFrontend.baseUrl + x.productPageUrl,
            description: x.formattedDiscountedPrice,
            title: x.name,
            src: x.mainMedia,
        }
    })
    $w('#proGallery').show();
}