"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Icon_1 = require("@components/Icon");
var Illustrations = require("@components/Icon/Illustrations");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OptionItem_1 = require("@components/OptionsPicker/OptionItem");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePolicy_1 = require("@hooks/usePolicy");
var usePreferredCurrency_1 = require("@hooks/usePreferredCurrency");
var useSubscriptionPlan_1 = require("@hooks/useSubscriptionPlan");
var useThemeIllustrations_1 = require("@hooks/useThemeIllustrations");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var SubscriptionUtils_1 = require("@libs/SubscriptionUtils");
var Navigation_1 = require("@navigation/Navigation");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function SubscriptionSettings() {
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: false })[0];
    var privateSubscription = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_PRIVATE_SUBSCRIPTION, { canBeMissing: false })[0];
    var activePolicyID = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_ACTIVE_POLICY_ID, { canBeMissing: true })[0];
    var activePolicy = (0, usePolicy_1.default)(activePolicyID);
    var isActivePolicyAdmin = (0, PolicyUtils_1.isPolicyAdmin)(activePolicy);
    var subscriptionPlan = (0, useSubscriptionPlan_1.default)();
    var preferredCurrency = (0, usePreferredCurrency_1.default)();
    var illustrations = (0, useThemeIllustrations_1.default)();
    var isAnnual = (privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.type) === CONST_1.default.SUBSCRIPTION.TYPE.ANNUAL;
    var subscriptionPrice = (0, SubscriptionUtils_1.getSubscriptionPrice)(subscriptionPlan, preferredCurrency, privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.type);
    var priceDetails = translate("subscription.yourPlan.".concat(subscriptionPlan === CONST_1.default.POLICY.TYPE.CORPORATE ? 'control' : 'collect', ".").concat(isAnnual ? 'priceAnnual' : 'pricePayPerUse'), {
        lower: (0, CurrencyUtils_1.convertToShortDisplayString)(subscriptionPrice, preferredCurrency),
        upper: (0, CurrencyUtils_1.convertToShortDisplayString)(subscriptionPrice * CONST_1.default.SUBSCRIPTION_PRICE_FACTOR, preferredCurrency),
    });
    var adminsChatReportID = isActivePolicyAdmin && (activePolicy === null || activePolicy === void 0 ? void 0 : activePolicy.chatReportIDAdmins) ? activePolicy.chatReportIDAdmins.toString() : undefined;
    var openAdminsRoom = function () {
        Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID.getRoute(adminsChatReportID));
    };
    var subscriptionSizeSection = (privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.type) === CONST_1.default.SUBSCRIPTION.TYPE.ANNUAL && (privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.userCount) ? (<MenuItemWithTopDescription_1.default description={translate('subscription.details.subscriptionSize')} title={"".concat(privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.userCount)} wrapperStyle={styles.sectionMenuItemTopDescription} style={styles.mt5}/>) : null;
    return (<ScreenWrapper_1.default testID={SubscriptionSettings.displayName} shouldShowOfflineIndicatorInWideScreen>
            <HeaderWithBackButton_1.default title={translate('subscription.subscriptionSettings.title')} onBackButtonPress={function () { return Navigation_1.default.goBack(); }}/>
            <ScrollView_1.default contentContainerStyle={[styles.flexGrow1, styles.ph5]}>
                <Text_1.default style={[styles.textSupporting, styles.mb5]}>{translate('subscription.mobileReducedFunctionalityMessage')}</Text_1.default>
                <Text_1.default style={[styles.textSupporting, styles.mb5]}>{translate('subscription.subscriptionSettings.pricingConfiguration')}</Text_1.default>
                <Text_1.default style={[styles.textSupporting, styles.mb5]}>
                    {translate('subscription.subscriptionSettings.learnMore.part1')}
                    <TextLink_1.default href={CONST_1.default.PRICING}>{translate('subscription.subscriptionSettings.learnMore.pricingPage')}</TextLink_1.default>
                    {translate('subscription.subscriptionSettings.learnMore.part2')}
                    {adminsChatReportID ? (<TextLink_1.default onPress={openAdminsRoom}>{translate('subscription.subscriptionSettings.learnMore.adminsRoom')}</TextLink_1.default>) : (translate('subscription.subscriptionSettings.learnMore.adminsRoom'))}
                </Text_1.default>
                <Text_1.default style={styles.mutedNormalTextLabel}>{translate('subscription.subscriptionSettings.estimatedPrice')}</Text_1.default>
                <Text_1.default style={styles.mv1}>{priceDetails}</Text_1.default>
                <Text_1.default style={styles.mutedNormalTextLabel}>{translate('subscription.subscriptionSettings.changesBasedOn')}</Text_1.default>
                {!!(account === null || account === void 0 ? void 0 : account.isApprovedAccountant) || !!(account === null || account === void 0 ? void 0 : account.isApprovedAccountantClient) ? (<react_native_1.View style={[styles.borderedContentCard, styles.p5, styles.mt5]}>
                        <Icon_1.default src={illustrations.ExpensifyApprovedLogo} width={variables_1.default.modalTopIconWidth} height={variables_1.default.menuIconSize}/>
                        <Text_1.default style={[styles.textLabelSupporting, styles.mt2]}>{translate('subscription.details.zeroCommitment')}</Text_1.default>
                    </react_native_1.View>) : (<>
                        {(privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.type) === CONST_1.default.SUBSCRIPTION.TYPE.PAY_PER_USE ? (<OptionItem_1.default title="subscription.details.payPerUse" icon={Illustrations.SubscriptionPPU} style={[styles.mt5, styles.flex0]} isDisabled/>) : (<OptionItem_1.default title="subscription.details.annual" icon={Illustrations.SubscriptionAnnual} style={[styles.mt5, styles.flex0]} isDisabled/>)}
                        {subscriptionSizeSection}
                    </>)}
            </ScrollView_1.default>
        </ScreenWrapper_1.default>);
}
SubscriptionSettings.displayName = 'SubscriptionSettings';
exports.default = SubscriptionSettings;
