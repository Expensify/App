"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var PaymentCardForm_1 = require("@components/AddPaymentCard/PaymentCardForm");
var DelegateNoAccessWrapper_1 = require("@components/DelegateNoAccessWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Illustrations = require("@components/Icon/Illustrations");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Section_1 = require("@components/Section");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useHasTeam2025Pricing_1 = require("@hooks/useHasTeam2025Pricing");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePreferredCurrency_1 = require("@hooks/usePreferredCurrency");
var usePrevious_1 = require("@hooks/usePrevious");
var useSubscriptionPlan_1 = require("@hooks/useSubscriptionPlan");
var useSubscriptionPrice_1 = require("@hooks/useSubscriptionPrice");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CardUtils_1 = require("@libs/CardUtils");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CardAuthenticationModal_1 = require("@pages/settings/Subscription/CardAuthenticationModal");
var PaymentMethods_1 = require("@userActions/PaymentMethods");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function AddPaymentCard() {
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var privateSubscription = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_PRIVATE_SUBSCRIPTION, { canBeMissing: false })[0];
    var accountID = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { selector: function (session) { var _a; return (_a = session === null || session === void 0 ? void 0 : session.accountID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID; }, canBeMissing: false })[0];
    var subscriptionPlan = (0, useSubscriptionPlan_1.default)();
    var subscriptionPrice = (0, useSubscriptionPrice_1.default)();
    var preferredCurrency = (0, usePreferredCurrency_1.default)();
    var hasTeam2025Pricing = (0, useHasTeam2025Pricing_1.default)();
    var isCollect = subscriptionPlan === CONST_1.default.POLICY.TYPE.TEAM;
    var isAnnual = (privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.type) === CONST_1.default.SUBSCRIPTION.TYPE.ANNUAL;
    var subscriptionPricingInfo = hasTeam2025Pricing && isCollect
        ? translate('subscription.yourPlan.pricePerMemberPerMonth', { price: (0, CurrencyUtils_1.convertToShortDisplayString)(subscriptionPrice, preferredCurrency) })
        : translate("subscription.yourPlan.".concat(isCollect ? 'collect' : 'control', ".").concat(isAnnual ? 'priceAnnual' : 'pricePayPerUse'), {
            lower: (0, CurrencyUtils_1.convertToShortDisplayString)(subscriptionPrice, preferredCurrency),
            upper: (0, CurrencyUtils_1.convertToShortDisplayString)(subscriptionPrice * CONST_1.default.SUBSCRIPTION_PRICE_FACTOR, preferredCurrency),
        });
    (0, react_1.useEffect)(function () {
        (0, PaymentMethods_1.clearPaymentCardFormErrorAndSubmit)();
        return function () {
            (0, PaymentMethods_1.clearPaymentCardFormErrorAndSubmit)();
        };
    }, []);
    var addPaymentCard = (0, react_1.useCallback)(function (values) {
        var _a;
        var cardData = {
            cardNumber: (0, CardUtils_1.getMCardNumberString)(values.cardNumber),
            cardMonth: (0, CardUtils_1.getMonthFromExpirationDateString)(values.expirationDate),
            cardYear: (0, CardUtils_1.getYearFromExpirationDateString)(values.expirationDate),
            cardCVV: values.securityCode,
            addressName: values.nameOnCard,
            addressZip: values.addressZipCode,
            currency: (_a = values.currency) !== null && _a !== void 0 ? _a : CONST_1.default.PAYMENT_CARD_CURRENCY.USD,
        };
        (0, PaymentMethods_1.addSubscriptionPaymentCard)(accountID !== null && accountID !== void 0 ? accountID : CONST_1.default.DEFAULT_NUMBER_ID, cardData);
    }, [accountID]);
    var formData = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.ADD_PAYMENT_CARD_FORM, { canBeMissing: true })[0];
    var prevFormDataSetupComplete = (0, usePrevious_1.default)(!!(formData === null || formData === void 0 ? void 0 : formData.setupComplete));
    (0, react_1.useEffect)(function () {
        if (prevFormDataSetupComplete || !(formData === null || formData === void 0 ? void 0 : formData.setupComplete)) {
            return;
        }
        Navigation_1.default.goBack();
    }, [prevFormDataSetupComplete, formData === null || formData === void 0 ? void 0 : formData.setupComplete]);
    return (<ScreenWrapper_1.default testID={AddPaymentCard.displayName}>
            <DelegateNoAccessWrapper_1.default accessDeniedVariants={[CONST_1.default.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButton_1.default title={translate('subscription.paymentCard.addPaymentCard')}/>
                <react_native_1.View style={styles.containerWithSpaceBetween}>
                    <PaymentCardForm_1.default shouldShowPaymentCardForm addPaymentCard={addPaymentCard} showAcceptTerms showCurrencyField currencySelectorRoute={ROUTES_1.default.SETTINGS_SUBSCRIPTION_CHANGE_PAYMENT_CURRENCY} submitButtonText={translate('subscription.paymentCard.addPaymentCard')} headerContent={<Text_1.default style={[styles.textHeadline, styles.mt3, styles.mb2, styles.ph5]}>{translate('subscription.paymentCard.enterPaymentCardDetails')}</Text_1.default>} footerContent={<>
                                <Section_1.default icon={Illustrations.ShieldYellow} cardLayout={Section_1.CARD_LAYOUT.ICON_ON_LEFT} iconContainerStyles={styles.mr4} containerStyles={[styles.mh0, styles.mt5]} renderTitle={function () { return (<Text_1.default style={[styles.mutedTextLabel]}>
                                            {translate('subscription.paymentCard.security')}{' '}
                                            <TextLink_1.default style={[styles.mutedTextLabel, styles.link]} href={CONST_1.default.OLD_DOT_PUBLIC_URLS.TERMS_URL}>
                                                {translate('subscription.paymentCard.learnMoreAboutSecurity')}
                                            </TextLink_1.default>
                                        </Text_1.default>); }}/>
                                <Text_1.default style={[styles.textMicroSupporting, styles.mt3, styles.textAlignCenter, styles.mr5, styles.ml5]}>{subscriptionPricingInfo}</Text_1.default>
                            </>}/>
                </react_native_1.View>
                <CardAuthenticationModal_1.default headerTitle={translate('subscription.authenticatePaymentCard')}/>
            </DelegateNoAccessWrapper_1.default>
        </ScreenWrapper_1.default>);
}
AddPaymentCard.displayName = 'AddPaymentCard';
exports.default = AddPaymentCard;
