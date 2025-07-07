"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Illustrations = require("@components/Icon/Illustrations");
var useLocalize_1 = require("@hooks/useLocalize");
var SubscriptionUtils = require("@libs/SubscriptionUtils");
var BillingBanner_1 = require("./BillingBanner");
function TrialStartedBillingBanner() {
    var translate = (0, useLocalize_1.default)().translate;
    var subtitle = !SubscriptionUtils.doesUserHavePaymentCardAdded() ? translate('subscription.billingBanner.trialStarted.subtitle') : '';
    return (<BillingBanner_1.default title={translate('subscription.billingBanner.trialStarted.title', { numOfDays: SubscriptionUtils.calculateRemainingFreeTrialDays() })} subtitle={subtitle} icon={Illustrations.TreasureChest}/>);
}
TrialStartedBillingBanner.displayName = 'TrialStartedBillingBanner';
exports.default = TrialStartedBillingBanner;
