"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var ConfirmModal_1 = require("@components/ConfirmModal");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var MenuItem_1 = require("@components/MenuItem");
var RenderHTML_1 = require("@components/RenderHTML");
var Section_1 = require("@components/Section");
var Text_1 = require("@components/Text");
var useHasTeam2025Pricing_1 = require("@hooks/useHasTeam2025Pricing");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useSubscriptionPlan_1 = require("@hooks/useSubscriptionPlan");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var User_1 = require("@libs/actions/User");
var DateUtils_1 = require("@libs/DateUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PaymentUtils_1 = require("@libs/PaymentUtils");
var SearchQueryUtils_1 = require("@libs/SearchQueryUtils");
var SubscriptionUtils_1 = require("@libs/SubscriptionUtils");
var PaymentMethods_1 = require("@userActions/PaymentMethods");
var Subscription_1 = require("@userActions/Subscription");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var EarlyDiscountBanner_1 = require("./BillingBanner/EarlyDiscountBanner");
var PreTrialBillingBanner_1 = require("./BillingBanner/PreTrialBillingBanner");
var SubscriptionBillingBanner_1 = require("./BillingBanner/SubscriptionBillingBanner");
var TrialEndedBillingBanner_1 = require("./BillingBanner/TrialEndedBillingBanner");
var TrialStartedBillingBanner_1 = require("./BillingBanner/TrialStartedBillingBanner");
var CardSectionActions_1 = require("./CardSectionActions");
var CardSectionDataEmpty_1 = require("./CardSectionDataEmpty");
var RequestEarlyCancellationMenuItem_1 = require("./RequestEarlyCancellationMenuItem");
var utils_1 = require("./utils");
function CardSection() {
    var _a, _b, _c, _d, _e, _f;
    var _g = (0, react_1.useState)(false), isRequestRefundModalVisible = _g[0], setIsRequestRefundModalVisible = _g[1];
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: true })[0];
    var privateSubscription = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_PRIVATE_SUBSCRIPTION, { canBeMissing: true })[0];
    var privateStripeCustomerID = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_PRIVATE_STRIPE_CUSTOMER_ID, { canBeMissing: true })[0];
    var authenticationLink = (0, useOnyx_1.default)(ONYXKEYS_1.default.VERIFY_3DS_SUBSCRIPTION, { canBeMissing: true })[0];
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: true })[0];
    var fundList = (0, useOnyx_1.default)(ONYXKEYS_1.default.FUND_LIST, { canBeMissing: true })[0];
    var purchaseList = (0, useOnyx_1.default)(ONYXKEYS_1.default.PURCHASE_LIST, { canBeMissing: true })[0];
    var hasTeam2025Pricing = (0, useHasTeam2025Pricing_1.default)();
    var subscriptionPlan = (0, useSubscriptionPlan_1.default)();
    var subscriptionRetryBillingStatusPending = (0, useOnyx_1.default)(ONYXKEYS_1.default.SUBSCRIPTION_RETRY_BILLING_STATUS_PENDING, { canBeMissing: true })[0];
    var subscriptionRetryBillingStatusSuccessful = (0, useOnyx_1.default)(ONYXKEYS_1.default.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL, { canBeMissing: true })[0];
    var subscriptionRetryBillingStatusFailed = (0, useOnyx_1.default)(ONYXKEYS_1.default.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED, { canBeMissing: true })[0];
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var defaultCard = (0, react_1.useMemo)(function () { return Object.values(fundList !== null && fundList !== void 0 ? fundList : {}).find(function (card) { var _a, _b; return (_b = (_a = card.accountData) === null || _a === void 0 ? void 0 : _a.additionalData) === null || _b === void 0 ? void 0 : _b.isBillingCard; }); }, [fundList]);
    var cardMonth = (0, react_1.useMemo)(function () { var _a, _b; return DateUtils_1.default.getMonthNames()[((_b = (_a = defaultCard === null || defaultCard === void 0 ? void 0 : defaultCard.accountData) === null || _a === void 0 ? void 0 : _a.cardMonth) !== null && _b !== void 0 ? _b : 1) - 1]; }, [(_a = defaultCard === null || defaultCard === void 0 ? void 0 : defaultCard.accountData) === null || _a === void 0 ? void 0 : _a.cardMonth]);
    var requestRefund = (0, react_1.useCallback)(function () {
        (0, User_1.requestRefund)();
        setIsRequestRefundModalVisible(false);
        Navigation_1.default.goBackToHome();
    }, []);
    var viewPurchases = (0, react_1.useCallback)(function () {
        var query = (0, SearchQueryUtils_1.buildQueryStringFromFilterFormValues)({ merchant: CONST_1.default.EXPENSIFY_MERCHANT });
        Navigation_1.default.navigate(ROUTES_1.default.SEARCH_ROOT.getRoute({ query: query }));
    }, []);
    var _h = (0, react_1.useState)(function () { var _a; return utils_1.default.getBillingStatus({ translate: translate, accountData: (_a = defaultCard === null || defaultCard === void 0 ? void 0 : defaultCard.accountData) !== null && _a !== void 0 ? _a : {}, purchase: purchaseList === null || purchaseList === void 0 ? void 0 : purchaseList[0] }); }), billingStatus = _h[0], setBillingStatus = _h[1];
    var nextPaymentDate = !(0, EmptyObject_1.isEmptyObject)(privateSubscription) ? utils_1.default.getNextBillingDate() : undefined;
    var sectionSubtitle = defaultCard && !!nextPaymentDate ? translate('subscription.cardSection.cardNextPayment', { nextPaymentDate: nextPaymentDate }) : translate('subscription.cardSection.subtitle');
    (0, react_1.useEffect)(function () {
        var _a;
        setBillingStatus(utils_1.default.getBillingStatus({
            translate: translate,
            accountData: (_a = defaultCard === null || defaultCard === void 0 ? void 0 : defaultCard.accountData) !== null && _a !== void 0 ? _a : {},
            purchase: purchaseList === null || purchaseList === void 0 ? void 0 : purchaseList[0],
        }));
    }, [
        subscriptionRetryBillingStatusPending,
        subscriptionRetryBillingStatusSuccessful,
        subscriptionRetryBillingStatusFailed,
        translate,
        defaultCard === null || defaultCard === void 0 ? void 0 : defaultCard.accountData,
        privateStripeCustomerID,
        purchaseList,
    ]);
    var handleRetryPayment = function () {
        (0, Subscription_1.clearOutstandingBalance)();
    };
    (0, react_1.useEffect)(function () {
        if (!authenticationLink || (privateStripeCustomerID === null || privateStripeCustomerID === void 0 ? void 0 : privateStripeCustomerID.status) !== CONST_1.default.STRIPE_SCA_AUTH_STATUSES.CARD_AUTHENTICATION_REQUIRED) {
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_SUBSCRIPTION_ADD_PAYMENT_CARD);
    }, [authenticationLink, privateStripeCustomerID === null || privateStripeCustomerID === void 0 ? void 0 : privateStripeCustomerID.status]);
    var handleAuthenticatePayment = function () {
        var _a;
        (0, PaymentMethods_1.verifySetupIntent)((_a = session === null || session === void 0 ? void 0 : session.accountID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID, false);
    };
    var handleBillingBannerClose = function () {
        setBillingStatus(undefined);
    };
    var BillingBanner;
    if ((0, SubscriptionUtils_1.shouldShowDiscountBanner)(hasTeam2025Pricing, subscriptionPlan)) {
        BillingBanner = <EarlyDiscountBanner_1.default isSubscriptionPage/>;
    }
    else if ((0, SubscriptionUtils_1.shouldShowPreTrialBillingBanner)()) {
        BillingBanner = <PreTrialBillingBanner_1.default />;
    }
    else if ((0, SubscriptionUtils_1.isUserOnFreeTrial)()) {
        BillingBanner = <TrialStartedBillingBanner_1.default />;
    }
    else if ((0, SubscriptionUtils_1.hasUserFreeTrialEnded)()) {
        BillingBanner = <TrialEndedBillingBanner_1.default />;
    }
    if (billingStatus) {
        BillingBanner = (<SubscriptionBillingBanner_1.default title={billingStatus.title} subtitle={billingStatus.subtitle} isError={billingStatus.isError} icon={billingStatus.icon} rightIcon={billingStatus.rightIcon} onRightIconPress={handleBillingBannerClose} rightIconAccessibilityLabel={translate('common.close')}/>);
    }
    return (<>
            <Section_1.default title={translate('subscription.cardSection.title')} subtitle={sectionSubtitle} isCentralPane titleStyles={styles.textStrong} subtitleMuted banner={BillingBanner}>
                <react_native_1.View style={[styles.mt8, styles.mb3, styles.flexRow]}>
                    {!(0, EmptyObject_1.isEmptyObject)(defaultCard === null || defaultCard === void 0 ? void 0 : defaultCard.accountData) && (<react_native_1.View style={[styles.flexRow, styles.flex1, styles.gap3]}>
                            <Icon_1.default src={Expensicons.CreditCard} additionalStyles={styles.subscriptionAddedCardIcon} fill={theme.icon} medium/>
                            <react_native_1.View style={styles.flex1}>
                                <Text_1.default style={styles.textStrong}>{(0, PaymentUtils_1.getPaymentMethodDescription)(defaultCard === null || defaultCard === void 0 ? void 0 : defaultCard.accountType, defaultCard === null || defaultCard === void 0 ? void 0 : defaultCard.accountData)}</Text_1.default>
                                <Text_1.default style={styles.mutedNormalTextLabel}>
                                    {translate('subscription.cardSection.cardInfo', {
                name: (_c = (_b = defaultCard === null || defaultCard === void 0 ? void 0 : defaultCard.accountData) === null || _b === void 0 ? void 0 : _b.addressName) !== null && _c !== void 0 ? _c : '',
                expiration: "".concat(cardMonth, " ").concat((_d = defaultCard === null || defaultCard === void 0 ? void 0 : defaultCard.accountData) === null || _d === void 0 ? void 0 : _d.cardYear),
                currency: (_f = (_e = defaultCard === null || defaultCard === void 0 ? void 0 : defaultCard.accountData) === null || _e === void 0 ? void 0 : _e.currency) !== null && _f !== void 0 ? _f : '',
            })}
                                </Text_1.default>
                            </react_native_1.View>
                            <CardSectionActions_1.default />
                        </react_native_1.View>)}
                </react_native_1.View>

                <react_native_1.View style={styles.mb3}>{(0, EmptyObject_1.isEmptyObject)(defaultCard === null || defaultCard === void 0 ? void 0 : defaultCard.accountData) && <CardSectionDataEmpty_1.default />}</react_native_1.View>
                {(billingStatus === null || billingStatus === void 0 ? void 0 : billingStatus.isRetryAvailable) !== undefined && (<Button_1.default text={translate('subscription.cardSection.retryPaymentButton')} isDisabled={isOffline || !(billingStatus === null || billingStatus === void 0 ? void 0 : billingStatus.isRetryAvailable)} isLoading={subscriptionRetryBillingStatusPending} onPress={handleRetryPayment} style={[styles.w100, styles.mb3]} large/>)}
                {(0, SubscriptionUtils_1.hasCardAuthenticatedError)() && (<Button_1.default text={translate('subscription.cardSection.authenticatePayment')} isDisabled={isOffline || !(billingStatus === null || billingStatus === void 0 ? void 0 : billingStatus.isAuthenticationRequired)} isLoading={subscriptionRetryBillingStatusPending} onPress={handleAuthenticatePayment} style={[styles.w100, styles.mt5]} large/>)}

                {!!(account === null || account === void 0 ? void 0 : account.hasPurchases) && (<MenuItem_1.default shouldShowRightIcon icon={Expensicons.History} wrapperStyle={styles.sectionMenuItemTopDescription} title={translate('subscription.cardSection.viewPaymentHistory')} titleStyle={styles.textStrong} onPress={viewPurchases}/>)}

                {!!(subscriptionPlan && (account === null || account === void 0 ? void 0 : account.isEligibleForRefund)) && (<MenuItem_1.default shouldShowRightIcon icon={Expensicons.Bill} wrapperStyle={styles.sectionMenuItemTopDescription} title={translate('subscription.cardSection.requestRefund')} titleStyle={styles.textStrong} disabled={isOffline} onPress={function () { return setIsRequestRefundModalVisible(true); }}/>)}

                {!!((privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.type) === CONST_1.default.SUBSCRIPTION.TYPE.ANNUAL && (account === null || account === void 0 ? void 0 : account.hasPurchases)) && <RequestEarlyCancellationMenuItem_1.default />}
            </Section_1.default>

            {!!(account === null || account === void 0 ? void 0 : account.isEligibleForRefund) && (<ConfirmModal_1.default title={translate('subscription.cardSection.requestRefund')} isVisible={isRequestRefundModalVisible} onConfirm={requestRefund} onCancel={function () { return setIsRequestRefundModalVisible(false); }} prompt={<RenderHTML_1.default html={translate('subscription.cardSection.requestRefundModal.full')}/>} confirmText={translate('subscription.cardSection.requestRefundModal.confirm')} cancelText={translate('common.cancel')} danger/>)}
        </>);
}
CardSection.displayName = 'CardSection';
exports.default = CardSection;
