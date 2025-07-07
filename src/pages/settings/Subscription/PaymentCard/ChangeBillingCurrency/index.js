"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var PaymentCardChangeCurrencyForm_1 = require("@components/AddPaymentCard/PaymentCardChangeCurrencyForm");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePrevious_1 = require("@hooks/usePrevious");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@navigation/Navigation");
var PaymentMethods = require("@userActions/PaymentMethods");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function ChangeBillingCurrency() {
    var _a;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var fundList = (0, useOnyx_1.default)(ONYXKEYS_1.default.FUND_LIST)[0];
    var defaultCard = (0, react_1.useMemo)(function () { return Object.values(fundList !== null && fundList !== void 0 ? fundList : {}).find(function (card) { var _a, _b; return (_b = (_a = card.accountData) === null || _a === void 0 ? void 0 : _a.additionalData) === null || _b === void 0 ? void 0 : _b.isBillingCard; }); }, [fundList]);
    var formData = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.CHANGE_BILLING_CURRENCY_FORM)[0];
    var formDataComplete = (formData === null || formData === void 0 ? void 0 : formData.isLoading) === false && !formData.errors;
    var prevIsLoading = (0, usePrevious_1.default)(formData === null || formData === void 0 ? void 0 : formData.isLoading);
    var prevFormDataComplete = (0, usePrevious_1.default)(formDataComplete);
    (0, react_1.useEffect)(function () {
        if (!formDataComplete || prevFormDataComplete || !prevIsLoading) {
            return;
        }
        Navigation_1.default.goBack();
    }, [formDataComplete, prevFormDataComplete, prevIsLoading]);
    var changeBillingCurrency = (0, react_1.useCallback)(function (currency, values) {
        if (!(values === null || values === void 0 ? void 0 : values.securityCode)) {
            Navigation_1.default.goBack();
            return;
        }
        PaymentMethods.updateBillingCurrency(currency !== null && currency !== void 0 ? currency : CONST_1.default.PAYMENT_CARD_CURRENCY.USD, values.securityCode);
    }, []);
    return (<ScreenWrapper_1.default testID={ChangeBillingCurrency.displayName}>
            <HeaderWithBackButton_1.default title={translate('billingCurrency.changeBillingCurrency')}/>
            <react_native_1.View style={styles.containerWithSpaceBetween}>
                <PaymentCardChangeCurrencyForm_1.default isSecurityCodeRequired changeBillingCurrency={changeBillingCurrency} initialCurrency={(_a = defaultCard === null || defaultCard === void 0 ? void 0 : defaultCard.accountData) === null || _a === void 0 ? void 0 : _a.currency}/>
            </react_native_1.View>
        </ScreenWrapper_1.default>);
}
ChangeBillingCurrency.displayName = 'ChangeBillingCurrency';
exports.default = ChangeBillingCurrency;
