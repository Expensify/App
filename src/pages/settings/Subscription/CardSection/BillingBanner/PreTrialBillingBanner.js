"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Illustrations = require("@components/Icon/Illustrations");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Report = require("@libs/actions/Report");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportUtils = require("@libs/ReportUtils");
var ROUTES_1 = require("@src/ROUTES");
var BillingBanner_1 = require("./BillingBanner");
function PreTrialBillingBanner() {
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var navigateToChat = function () {
        var reportUsedForOnboarding = ReportUtils.getChatUsedForOnboarding();
        if (!reportUsedForOnboarding) {
            Report.navigateToConciergeChat();
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID.getRoute(reportUsedForOnboarding.reportID));
    };
    return (<BillingBanner_1.default title={translate('subscription.billingBanner.preTrial.title')} subtitle={<Text_1.default>
                    {translate('subscription.billingBanner.preTrial.subtitleStart')}
                    <TextLink_1.default style={styles.link} onPress={navigateToChat}>
                        {translate('subscription.billingBanner.preTrial.subtitleLink')}
                    </TextLink_1.default>
                    {translate('subscription.billingBanner.preTrial.subtitleEnd')}
                </Text_1.default>} icon={Illustrations.TreasureChest}/>);
}
PreTrialBillingBanner.displayName = 'PreTrialBillingBanner';
exports.default = PreTrialBillingBanner;
