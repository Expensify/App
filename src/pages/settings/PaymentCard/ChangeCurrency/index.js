"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var PaymentCardChangeCurrencyForm_1 = require("@components/AddPaymentCard/PaymentCardChangeCurrencyForm");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@navigation/Navigation");
var PaymentMethods = require("@userActions/PaymentMethods");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function ChangeCurrency() {
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var debitCardForm = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.ADD_PAYMENT_CARD_FORM)[0];
    var changeCurrency = (0, react_1.useCallback)(function (currency) {
        if (currency) {
            PaymentMethods.setPaymentMethodCurrency(currency);
        }
        Navigation_1.default.goBack();
    }, []);
    return (<ScreenWrapper_1.default testID={ChangeCurrency.displayName}>
            <HeaderWithBackButton_1.default title={translate('billingCurrency.changePaymentCurrency')}/>
            <react_native_1.View style={styles.containerWithSpaceBetween}>
                <PaymentCardChangeCurrencyForm_1.default changeBillingCurrency={changeCurrency} initialCurrency={debitCardForm === null || debitCardForm === void 0 ? void 0 : debitCardForm.currency}/>
            </react_native_1.View>
        </ScreenWrapper_1.default>);
}
ChangeCurrency.displayName = 'ChangeCurrency';
exports.default = ChangeCurrency;
