"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FeedbackSurvey_1 = require("@components/FeedbackSurvey");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Subscription = require("@userActions/Subscription");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function DisableAutoRenewSurveyPage() {
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var handleSubmit = function (key, additionalNote) {
        Subscription.updateSubscriptionAutoRenew(false, key, additionalNote);
        Navigation_1.default.goBack();
    };
    return (<ScreenWrapper_1.default testID={DisableAutoRenewSurveyPage.displayName} includeSafeAreaPaddingBottom={false} shouldEnablePickerAvoiding={false} shouldEnableMaxHeight>
            <HeaderWithBackButton_1.default title={translate('subscription.subscriptionSettings.disableAutoRenew')} onBackButtonPress={Navigation_1.default.goBack}/>
            <ScrollView_1.default contentContainerStyle={[styles.flexGrow1, styles.pt3]}>
                <FeedbackSurvey_1.default formID={ONYXKEYS_1.default.FORMS.DISABLE_AUTO_RENEW_SURVEY_FORM} title={translate('subscription.subscriptionSettings.helpUsImprove')} description={translate('subscription.subscriptionSettings.whatsMainReason')} onSubmit={handleSubmit} optionRowStyles={styles.flex1}/>
            </ScrollView_1.default>
        </ScreenWrapper_1.default>);
}
DisableAutoRenewSurveyPage.displayName = 'DisableAutoRenewSurveyPage';
exports.default = DisableAutoRenewSurveyPage;
