"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useHasLoggedIntoMobileApp_1 = require("@hooks/useHasLoggedIntoMobileApp");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var BillingBanner_1 = require("@pages/settings/Subscription/CardSection/BillingBanner/BillingBanner");
var ROUTES_1 = require("@src/ROUTES");
var Button_1 = require("./Button");
var Illustrations_1 = require("./Icon/Illustrations");
function DownloadAppBanner() {
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _a = (0, useHasLoggedIntoMobileApp_1.default)(), hasLoggedIntoMobileApp = _a.hasLoggedIntoMobileApp, isLastMobileAppLoginLoaded = _a.isLastMobileAppLoginLoaded;
    if (!isLastMobileAppLoginLoaded || hasLoggedIntoMobileApp) {
        return null;
    }
    return (<react_native_1.View style={[styles.ph2, styles.mb2, styles.stickToBottom]}>
            <BillingBanner_1.default icon={Illustrations_1.ExpensifyMobileApp} title={translate('common.getTheApp')} subtitle={translate('common.scanReceiptsOnTheGo')} subtitleStyle={[styles.mt1, styles.mutedTextLabel]} style={[styles.borderRadiusComponentNormal, styles.hoveredComponentBG]} rightComponent={<Button_1.default small success text={translate('common.download')} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_APP_DOWNLOAD_LINKS); }}/>}/>
        </react_native_1.View>);
}
exports.default = DownloadAppBanner;
