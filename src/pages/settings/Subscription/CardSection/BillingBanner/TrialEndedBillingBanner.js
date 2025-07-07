"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Illustrations = require("@components/Icon/Illustrations");
var useLocalize_1 = require("@hooks/useLocalize");
var SubscriptionUtils = require("@libs/SubscriptionUtils");
var BillingBanner_1 = require("./BillingBanner");
function TrialEndedBillingBanner() {
    var translate = (0, useLocalize_1.default)().translate;
    if (SubscriptionUtils.doesUserHavePaymentCardAdded()) {
        return null;
    }
    return (<BillingBanner_1.default title={translate('subscription.billingBanner.trialEnded.title')} subtitle={translate('subscription.billingBanner.trialEnded.subtitle')} icon={Illustrations.Tire}/>);
}
TrialEndedBillingBanner.displayName = 'TrialEndedBillingBanner';
exports.default = TrialEndedBillingBanner;
