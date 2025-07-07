"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var TextInput_1 = require("@components/TextInput");
var useLocalize_1 = require("@hooks/useLocalize");
var usePermissions_1 = require("@hooks/usePermissions");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ChangeBillingCurrencyForm_1 = require("@src/types/form/ChangeBillingCurrencyForm");
var PaymentCardCurrencyHeader_1 = require("./PaymentCardCurrencyHeader");
var PaymentCardCurrencyModal_1 = require("./PaymentCardCurrencyModal");
var REQUIRED_FIELDS = [ChangeBillingCurrencyForm_1.default.SECURITY_CODE];
function PaymentCardChangeCurrencyForm(_a) {
    var changeBillingCurrency = _a.changeBillingCurrency, isSecurityCodeRequired = _a.isSecurityCodeRequired, initialCurrency = _a.initialCurrency;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var isBetaEnabled = (0, usePermissions_1.default)().isBetaEnabled;
    var _b = (0, react_1.useState)(false), isCurrencyModalVisible = _b[0], setIsCurrencyModalVisible = _b[1];
    var _c = (0, react_1.useState)(initialCurrency !== null && initialCurrency !== void 0 ? initialCurrency : CONST_1.default.PAYMENT_CARD_CURRENCY.USD), currency = _c[0], setCurrency = _c[1];
    var validate = function (values) {
        var errors = (0, ValidationUtils_1.getFieldRequiredErrors)(values, REQUIRED_FIELDS);
        if (values.securityCode && !(0, ValidationUtils_1.isValidSecurityCode)(values.securityCode)) {
            errors.securityCode = translate('addPaymentCardPage.error.securityCode');
        }
        return errors;
    };
    var availableCurrencies = (0, react_1.useMemo)(function () {
        var canUseEurBilling = isBetaEnabled(CONST_1.default.BETAS.EUR_BILLING);
        var allCurrencies = Object.keys(CONST_1.default.PAYMENT_CARD_CURRENCY);
        // Filter out EUR if user doesn't have EUR billing beta
        return allCurrencies.filter(function (currencyItem) {
            if (currencyItem === CONST_1.default.PAYMENT_CARD_CURRENCY.EUR && !canUseEurBilling) {
                return false;
            }
            return true;
        });
    }, [isBetaEnabled]);
    var sections = (0, react_1.useMemo)(function () { return ({
        sections: [
            {
                data: availableCurrencies.map(function (currencyItem) { return ({
                    text: currencyItem,
                    value: currencyItem,
                    keyForList: currencyItem,
                    isSelected: currencyItem === currency,
                }); }),
            },
        ],
    }); }, [availableCurrencies, currency]).sections;
    var showCurrenciesModal = (0, react_1.useCallback)(function () {
        setIsCurrencyModalVisible(true);
    }, []);
    var changeCurrency = (0, react_1.useCallback)(function (selectedCurrency) {
        setCurrency(selectedCurrency);
        setIsCurrencyModalVisible(false);
    }, []);
    var selectCurrency = (0, react_1.useCallback)(function (selectedCurrency) {
        setCurrency(selectedCurrency);
        changeBillingCurrency(selectedCurrency);
    }, [changeBillingCurrency]);
    if (isSecurityCodeRequired) {
        return (<FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.CHANGE_BILLING_CURRENCY_FORM} validate={validate} onSubmit={function (values) { return changeBillingCurrency(currency, values); }} submitButtonText={translate('common.save')} scrollContextEnabled style={[styles.mh5, styles.flexGrow1]} shouldHideFixErrorsAlert>
                <PaymentCardCurrencyHeader_1.default />
                <>
                    <react_native_1.View style={[styles.mt5, styles.mhn5]}>
                        <MenuItemWithTopDescription_1.default shouldShowRightIcon title={currency} descriptionTextStyle={styles.textNormal} description={translate('common.currency')} onPress={showCurrenciesModal}/>
                    </react_native_1.View>
                    <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={ChangeBillingCurrencyForm_1.default.SECURITY_CODE} label={translate('addDebitCardPage.cvv')} aria-label={translate('addDebitCardPage.cvv')} role={CONST_1.default.ROLE.PRESENTATION} containerStyles={[styles.mt5]} inputMode={CONST_1.default.INPUT_MODE.NUMERIC}/>
                </>
                <PaymentCardCurrencyModal_1.default isVisible={isCurrencyModalVisible} currencies={availableCurrencies} currentCurrency={currency} onCurrencyChange={changeCurrency} onClose={function () { return setIsCurrencyModalVisible(false); }}/>
            </FormProvider_1.default>);
    }
    return (<react_native_1.View style={[styles.mh5, styles.flexGrow1]}>
            <SelectionList_1.default headerContent={<PaymentCardCurrencyHeader_1.default isSectionList/>} initiallyFocusedOptionKey={currency} containerStyle={[styles.mhn5]} sections={sections} onSelectRow={function (option) {
            selectCurrency(option.value);
        }} showScrollIndicator shouldStopPropagation shouldUseDynamicMaxToRenderPerBatch ListItem={RadioListItem_1.default}/>
        </react_native_1.View>);
}
PaymentCardChangeCurrencyForm.displayName = 'PaymentCardChangeCurrencyForm';
exports.default = PaymentCardChangeCurrencyForm;
