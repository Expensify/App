"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var DelegateNoAccessModalProvider_1 = require("@components/DelegateNoAccessModalProvider");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var Illustrations = require("@components/Icon/Illustrations");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var OptionsPicker_1 = require("@components/OptionsPicker");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useHasTeam2025Pricing_1 = require("@hooks/useHasTeam2025Pricing");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePolicy_1 = require("@hooks/usePolicy");
var usePreferredCurrency_1 = require("@hooks/usePreferredCurrency");
var useSubscriptionPlan_1 = require("@hooks/useSubscriptionPlan");
var useSubscriptionPossibleCostSavings_1 = require("@hooks/useSubscriptionPossibleCostSavings");
var useTheme_1 = require("@hooks/useTheme");
var useThemeIllustrations_1 = require("@hooks/useThemeIllustrations");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var SubscriptionUtils_1 = require("@libs/SubscriptionUtils");
var Navigation_1 = require("@navigation/Navigation");
var NotFoundPage_1 = require("@pages/ErrorPage/NotFoundPage");
var utils_1 = require("@pages/settings/Subscription/utils");
var ToggleSettingsOptionRow_1 = require("@pages/workspace/workflows/ToggleSettingsOptionRow");
var variables_1 = require("@styles/variables");
var Report_1 = require("@userActions/Report");
var Subscription_1 = require("@userActions/Subscription");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var options = [
    {
        key: CONST_1.default.SUBSCRIPTION.TYPE.ANNUAL,
        title: 'subscription.details.annual',
        icon: Illustrations.SubscriptionAnnual,
    },
    {
        key: CONST_1.default.SUBSCRIPTION.TYPE.PAY_PER_USE,
        title: 'subscription.details.payPerUse',
        icon: Illustrations.SubscriptionPPU,
    },
];
function SubscriptionSettings() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: false })[0];
    var privateSubscription = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_PRIVATE_SUBSCRIPTION, { canBeMissing: false })[0];
    var activePolicyID = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_ACTIVE_POLICY_ID, { canBeMissing: true })[0];
    var activePolicy = (0, usePolicy_1.default)(activePolicyID);
    var isActivePolicyAdmin = (0, PolicyUtils_1.isPolicyAdmin)(activePolicy);
    var subscriptionPlan = (0, useSubscriptionPlan_1.default)();
    var hasTeam2025Pricing = (0, useHasTeam2025Pricing_1.default)();
    var preferredCurrency = (0, usePreferredCurrency_1.default)();
    var illustrations = (0, useThemeIllustrations_1.default)();
    var possibleCostSavings = (0, useSubscriptionPossibleCostSavings_1.default)();
    var _k = (0, react_1.useContext)(DelegateNoAccessModalProvider_1.DelegateNoAccessContext), isActingAsDelegate = _k.isActingAsDelegate, showDelegateNoAccessModal = _k.showDelegateNoAccessModal;
    var isAnnual = (privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.type) === CONST_1.default.SUBSCRIPTION.TYPE.ANNUAL;
    var privateTaxExempt = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_PRIVATE_TAX_EXEMPT, { canBeMissing: true })[0];
    var subscriptionPrice = (0, SubscriptionUtils_1.getSubscriptionPrice)(subscriptionPlan, preferredCurrency, privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.type);
    var priceDetails = translate("subscription.yourPlan.".concat(subscriptionPlan === CONST_1.default.POLICY.TYPE.CORPORATE ? 'control' : 'collect', ".").concat(isAnnual ? 'priceAnnual' : 'pricePayPerUse'), {
        lower: (0, CurrencyUtils_1.convertToShortDisplayString)(subscriptionPrice, preferredCurrency),
        upper: (0, CurrencyUtils_1.convertToShortDisplayString)(subscriptionPrice * CONST_1.default.SUBSCRIPTION_PRICE_FACTOR, preferredCurrency),
    });
    var adminsChatReportID = isActivePolicyAdmin && (activePolicy === null || activePolicy === void 0 ? void 0 : activePolicy.chatReportIDAdmins) ? activePolicy.chatReportIDAdmins.toString() : undefined;
    var onOptionSelected = function (option) {
        if ((privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.type) !== option && isActingAsDelegate) {
            showDelegateNoAccessModal();
            return;
        }
        if ((privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.type) === CONST_1.default.SUBSCRIPTION.TYPE.ANNUAL && option === CONST_1.default.SUBSCRIPTION.TYPE.PAY_PER_USE && !(account === null || account === void 0 ? void 0 : account.canDowngrade)) {
            Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_SUBSCRIPTION_SIZE.getRoute(0));
            return;
        }
        (0, Subscription_1.updateSubscriptionType)(option);
    };
    var onSubscriptionSizePress = function () {
        if (isActingAsDelegate) {
            showDelegateNoAccessModal();
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_SUBSCRIPTION_SIZE.getRoute(1));
    };
    // This section is only shown when the subscription is annual
    var subscriptionSizeSection = (privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.type) === CONST_1.default.SUBSCRIPTION.TYPE.ANNUAL ? (<>
                <OfflineWithFeedback_1.default pendingAction={(_a = privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.pendingFields) === null || _a === void 0 ? void 0 : _a.userCount} errors={(_b = privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.errorFields) === null || _b === void 0 ? void 0 : _b.userCount} onClose={function () {
            (0, Subscription_1.clearUpdateSubscriptionSizeError)();
        }}>
                    <MenuItemWithTopDescription_1.default description={translate('subscription.details.subscriptionSize')} shouldShowRightIcon onPress={onSubscriptionSizePress} wrapperStyle={styles.sectionMenuItemTopDescription} style={styles.mt5} title={"".concat((_c = privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.userCount) !== null && _c !== void 0 ? _c : '')}/>
                </OfflineWithFeedback_1.default>
                {!(privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.userCount) && <Text_1.default style={[styles.mt2, styles.textLabelSupporting, styles.textLineHeightNormal]}>{translate('subscription.details.headsUp')}</Text_1.default>}
            </>) : null;
    var autoRenewalDate = (0, utils_1.formatSubscriptionEndDate)(privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.endDate);
    var handleAutoRenewToggle = function () {
        if (isActingAsDelegate) {
            showDelegateNoAccessModal();
            return;
        }
        if (!(privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.autoRenew)) {
            (0, Subscription_1.updateSubscriptionAutoRenew)(true);
            return;
        }
        if (account === null || account === void 0 ? void 0 : account.hasPurchases) {
            Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_SUBSCRIPTION_DISABLE_AUTO_RENEW_SURVEY);
        }
        else {
            (0, Subscription_1.updateSubscriptionAutoRenew)(false);
        }
    };
    var handleAutoIncreaseToggle = function () {
        if (isActingAsDelegate) {
            showDelegateNoAccessModal();
            return;
        }
        (0, Subscription_1.updateSubscriptionAddNewUsersAutomatically)(!(privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.addNewUsersAutomatically));
    };
    var customTitleSecondSentenceStyles = [styles.textNormal, { color: theme.success }];
    var customTitle = (<Text_1.default>
            <Text_1.default style={[styles.mr1, styles.textNormalThemeText]}>{translate('subscription.subscriptionSettings.autoIncrease')}</Text_1.default>
            <Text_1.default style={customTitleSecondSentenceStyles}>
                {translate('subscription.subscriptionSettings.saveUpTo', {
            amountWithCurrency: (0, CurrencyUtils_1.convertToShortDisplayString)(possibleCostSavings, preferredCurrency),
        })}
            </Text_1.default>
        </Text_1.default>);
    var openAdminsRoom = function () {
        Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID.getRoute(adminsChatReportID));
    };
    if (!subscriptionPlan || (hasTeam2025Pricing && subscriptionPlan === CONST_1.default.POLICY.TYPE.TEAM)) {
        return <NotFoundPage_1.default />;
    }
    return (<ScreenWrapper_1.default testID={SubscriptionSettings.displayName} shouldShowOfflineIndicatorInWideScreen>
            <HeaderWithBackButton_1.default title={translate('subscription.subscriptionSettings.title')} onBackButtonPress={function () { return Navigation_1.default.goBack(); }}/>
            <ScrollView_1.default contentContainerStyle={[styles.flexGrow1, styles.ph5]}>
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
                    </react_native_1.View>) : (<OfflineWithFeedback_1.default pendingAction={(_d = privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.pendingFields) === null || _d === void 0 ? void 0 : _d.type}>
                        <OptionsPicker_1.default options={options} selectedOption={(_e = privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.type) !== null && _e !== void 0 ? _e : CONST_1.default.SUBSCRIPTION.TYPE.ANNUAL} onOptionSelected={onOptionSelected} style={styles.mt5}/>
                        {subscriptionSizeSection}
                    </OfflineWithFeedback_1.default>)}
                {isAnnual ? (<>
                        <OfflineWithFeedback_1.default pendingAction={(_f = privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.pendingFields) === null || _f === void 0 ? void 0 : _f.autoRenew}>
                            <react_native_1.View style={styles.mt5}>
                                <ToggleSettingsOptionRow_1.default title={translate('subscription.subscriptionSettings.autoRenew')} switchAccessibilityLabel={translate('subscription.subscriptionSettings.autoRenew')} onToggle={handleAutoRenewToggle} isActive={(_g = privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.autoRenew) !== null && _g !== void 0 ? _g : false}/>
                                {!!autoRenewalDate && (<Text_1.default style={[styles.mutedTextLabel, styles.mt2]}>{translate('subscription.subscriptionSettings.renewsOn', { date: autoRenewalDate })}</Text_1.default>)}
                            </react_native_1.View>
                        </OfflineWithFeedback_1.default>
                        <OfflineWithFeedback_1.default pendingAction={(_h = privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.pendingFields) === null || _h === void 0 ? void 0 : _h.addNewUsersAutomatically}>
                            <react_native_1.View style={styles.mt3}>
                                <ToggleSettingsOptionRow_1.default customTitle={customTitle} switchAccessibilityLabel={translate('subscription.subscriptionSettings.autoRenew')} onToggle={handleAutoIncreaseToggle} isActive={(_j = privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.addNewUsersAutomatically) !== null && _j !== void 0 ? _j : false}/>
                                <Text_1.default style={[styles.mutedTextLabel, styles.mt2]}>{translate('subscription.subscriptionSettings.automaticallyIncrease')}</Text_1.default>
                            </react_native_1.View>
                        </OfflineWithFeedback_1.default>
                    </>) : null}
                <MenuItemWithTopDescription_1.default description={privateTaxExempt ? translate('subscription.details.taxExemptStatus') : undefined} shouldShowRightIcon onPress={function () {
            (0, Subscription_1.requestTaxExempt)();
            (0, Report_1.navigateToConciergeChat)();
        }} icon={Expensicons.Coins} wrapperStyle={styles.sectionMenuItemTopDescription} style={styles.mv5} titleStyle={privateTaxExempt ? undefined : styles.textBold} title={privateTaxExempt ? translate('subscription.details.taxExemptEnabled') : translate('subscription.details.taxExempt')}/>
            </ScrollView_1.default>
        </ScreenWrapper_1.default>);
}
SubscriptionSettings.displayName = 'SubscriptionSettings';
exports.default = SubscriptionSettings;
