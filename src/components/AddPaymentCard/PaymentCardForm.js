"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var AddressSearch_1 = require("@components/AddressSearch");
var CheckboxWithLabel_1 = require("@components/CheckboxWithLabel");
var CurrencySelector_1 = require("@components/CurrencySelector");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var StateSelector_1 = require("@components/StateSelector");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SCREENS_1 = require("@src/SCREENS");
var AddPaymentCardForm_1 = require("@src/types/form/AddPaymentCardForm");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
function IAcceptTheLabel() {
    var translate = (0, useLocalize_1.default)().translate;
    return (<Text_1.default>
            {"".concat(translate('common.iAcceptThe'))}
            <TextLink_1.default href={CONST_1.default.OLD_DOT_PUBLIC_URLS.TERMS_URL}>{"".concat(translate('common.addCardTermsOfService'))}</TextLink_1.default> {"".concat(translate('common.and'))}
            <TextLink_1.default href={CONST_1.default.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}> {" ".concat(translate('common.privacyPolicy'), " ")}</TextLink_1.default>
        </Text_1.default>);
}
var REQUIRED_FIELDS = [
    AddPaymentCardForm_1.default.NAME_ON_CARD,
    AddPaymentCardForm_1.default.CARD_NUMBER,
    AddPaymentCardForm_1.default.EXPIRATION_DATE,
    AddPaymentCardForm_1.default.ADDRESS_STREET,
    AddPaymentCardForm_1.default.SECURITY_CODE,
    AddPaymentCardForm_1.default.ADDRESS_ZIP_CODE,
    AddPaymentCardForm_1.default.ADDRESS_STATE,
    AddPaymentCardForm_1.default.CURRENCY,
];
var CARD_TYPES = {
    DEBIT_CARD: 'debit',
    PAYMENT_CARD: 'payment',
};
var CARD_TYPE_SECTIONS = {
    DEFAULTS: 'defaults',
    ERROR: 'error',
};
var CARD_LABELS = (_a = {},
    _a[CARD_TYPES.DEBIT_CARD] = (_b = {},
        _b[CARD_TYPE_SECTIONS.DEFAULTS] = {
            cardNumber: 'addDebitCardPage.debitCardNumber',
            nameOnCard: 'addDebitCardPage.nameOnCard',
            expirationDate: 'addDebitCardPage.expirationDate',
            expiration: 'addDebitCardPage.expiration',
            securityCode: 'addDebitCardPage.cvv',
            billingAddress: 'addDebitCardPage.billingAddress',
        },
        _b[CARD_TYPE_SECTIONS.ERROR] = {
            nameOnCard: 'addDebitCardPage.error.invalidName',
            cardNumber: 'addDebitCardPage.error.debitCardNumber',
            expirationDate: 'addDebitCardPage.error.expirationDate',
            securityCode: 'addDebitCardPage.error.securityCode',
            addressStreet: 'addDebitCardPage.error.addressStreet',
            addressZipCode: 'addDebitCardPage.error.addressZipCode',
        },
        _b),
    _a[CARD_TYPES.PAYMENT_CARD] = {
        defaults: {
            cardNumber: 'addPaymentCardPage.paymentCardNumber',
            nameOnCard: 'addPaymentCardPage.nameOnCard',
            expirationDate: 'addPaymentCardPage.expirationDate',
            expiration: 'addPaymentCardPage.expiration',
            securityCode: 'addPaymentCardPage.cvv',
            billingAddress: 'addPaymentCardPage.billingAddress',
        },
        error: {
            nameOnCard: 'addPaymentCardPage.error.invalidName',
            cardNumber: 'addPaymentCardPage.error.paymentCardNumber',
            expirationDate: 'addPaymentCardPage.error.expirationDate',
            securityCode: 'addPaymentCardPage.error.securityCode',
            addressStreet: 'addPaymentCardPage.error.addressStreet',
            addressZipCode: 'addPaymentCardPage.error.addressZipCode',
        },
    },
    _a);
function PaymentCardForm(_a) {
    var _b;
    var shouldShowPaymentCardForm = _a.shouldShowPaymentCardForm, addPaymentCard = _a.addPaymentCard, showAcceptTerms = _a.showAcceptTerms, showAddressField = _a.showAddressField, showCurrencyField = _a.showCurrencyField, isDebitCard = _a.isDebitCard, submitButtonText = _a.submitButtonText, showStateSelector = _a.showStateSelector, footerContent = _a.footerContent, headerContent = _a.headerContent, currencySelectorRoute = _a.currencySelectorRoute;
    var styles = (0, useThemeStyles_1.default)();
    var _c = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.ADD_PAYMENT_CARD_FORM), data = _c[0], metadata = _c[1];
    var translate = (0, useLocalize_1.default)().translate;
    var route = (0, native_1.useRoute)();
    var label = CARD_LABELS[isDebitCard ? CARD_TYPES.DEBIT_CARD : CARD_TYPES.PAYMENT_CARD];
    var cardNumberRef = (0, react_1.useRef)(null);
    var _d = (0, react_1.useState)(''), cardNumber = _d[0], setCardNumber = _d[1];
    var validate = function (values) {
        var errors = (0, ValidationUtils_1.getFieldRequiredErrors)(values, REQUIRED_FIELDS);
        if (values.nameOnCard && !(0, ValidationUtils_1.isValidLegalName)(values.nameOnCard)) {
            errors.nameOnCard = translate(label.error.nameOnCard);
        }
        if (values.cardNumber && !(0, ValidationUtils_1.isValidDebitCard)(values.cardNumber.replace(/ /g, ''))) {
            errors.cardNumber = translate(label.error.cardNumber);
        }
        if (values.expirationDate && !(0, ValidationUtils_1.isValidExpirationDate)(values.expirationDate)) {
            errors.expirationDate = translate(label.error.expirationDate);
        }
        if (values.securityCode && !(0, ValidationUtils_1.isValidSecurityCode)(values.securityCode)) {
            errors.securityCode = translate(label.error.securityCode);
        }
        if (values.addressStreet && !(0, ValidationUtils_1.isValidAddress)(values.addressStreet)) {
            errors.addressStreet = translate(label.error.addressStreet);
        }
        // If tempered with, this can block users from adding payment cards so
        // do not touch unless you are aware of the context.
        // See issue: https://github.com/Expensify/App/issues/55493#issuecomment-2616349754
        if (values.addressZipCode && !(0, ValidationUtils_1.isValidPaymentZipCode)(values.addressZipCode)) {
            errors.addressZipCode = translate('addPaymentCardPage.error.addressZipCode');
        }
        else if (values.addressZipCode.length > CONST_1.default.BANK_ACCOUNT.MAX_LENGTH.ZIP_CODE) {
            errors.addressZipCode = translate('common.error.characterLimitExceedCounter', {
                length: values.addressZipCode.length,
                limit: CONST_1.default.BANK_ACCOUNT.MAX_LENGTH.ZIP_CODE,
            });
        }
        if (!values.acceptTerms) {
            errors.acceptTerms = translate('common.error.acceptTerms');
        }
        return errors;
    };
    var onChangeCardNumber = (0, react_1.useCallback)(function (newValue) {
        var _a, _b, _c, _d;
        // Replace all characters that are not spaces or digits
        var validCardNumber = newValue.replace(/[^\d ]/g, '');
        // Gets only the first 16 digits if the inputted number have more digits than that
        validCardNumber = (_b = (_a = validCardNumber.match(/(?:\d *){1,16}/)) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : '';
        // Remove all spaces to simplify formatting
        var cleanedNumber = validCardNumber.replace(/ /g, '');
        // Check if the number is a potential Amex card (starts with 34 or 37 and has up to 15 digits)
        var isAmex = /^3[47]\d{0,13}$/.test(cleanedNumber);
        // Format based on Amex or standard 4-4-4-4 pattern
        if (isAmex) {
            // Format as 4-6-5 for Amex
            validCardNumber = cleanedNumber.replace(/(\d{1,4})(\d{1,6})?(\d{1,5})?/, function (match, p1, p2, p3) { return [p1, p2, p3].filter(Boolean).join(' '); });
        }
        else {
            // Format as 4-4-4-4 for non-Amex
            validCardNumber = (_d = (_c = cleanedNumber.match(/.{1,4}/g)) === null || _c === void 0 ? void 0 : _c.join(' ')) !== null && _d !== void 0 ? _d : '';
        }
        setCardNumber(validCardNumber);
    }, []);
    if (!shouldShowPaymentCardForm || (0, isLoadingOnyxValue_1.default)(metadata)) {
        return null;
    }
    return (<>
            {headerContent}
            <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.ADD_PAYMENT_CARD_FORM} validate={validate} onSubmit={addPaymentCard} submitButtonText={submitButtonText} scrollContextEnabled style={[styles.mh5, styles.flexGrow1]}>
                <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={AddPaymentCardForm_1.default.CARD_NUMBER} defaultValue={data === null || data === void 0 ? void 0 : data.cardNumber} label={translate(label.defaults.cardNumber)} aria-label={translate(label.defaults.cardNumber)} role={CONST_1.default.ROLE.PRESENTATION} ref={cardNumberRef} inputMode={CONST_1.default.INPUT_MODE.NUMERIC} onChangeText={onChangeCardNumber} value={cardNumber}/>
                <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={AddPaymentCardForm_1.default.NAME_ON_CARD} defaultValue={data === null || data === void 0 ? void 0 : data.nameOnCard} label={translate(label.defaults.nameOnCard)} aria-label={translate(label.defaults.nameOnCard)} role={CONST_1.default.ROLE.PRESENTATION} containerStyles={[styles.mt5]} spellCheck={false}/>
                <react_native_1.View style={[styles.flexRow, styles.mt5]}>
                    <react_native_1.View style={[styles.mr2, styles.flex1]}>
                        <InputWrapper_1.default defaultValue={data === null || data === void 0 ? void 0 : data.expirationDate} InputComponent={TextInput_1.default} inputID={AddPaymentCardForm_1.default.EXPIRATION_DATE} label={translate(label.defaults.expiration)} aria-label={translate(label.defaults.expiration)} role={CONST_1.default.ROLE.PRESENTATION} placeholder={translate(label.defaults.expirationDate)} inputMode={CONST_1.default.INPUT_MODE.NUMERIC} maxLength={4}/>
                    </react_native_1.View>
                    <react_native_1.View style={styles.flex1}>
                        <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={AddPaymentCardForm_1.default.SECURITY_CODE} defaultValue={data === null || data === void 0 ? void 0 : data.securityCode} label={translate(label.defaults.securityCode)} aria-label={translate(label.defaults.securityCode)} role={CONST_1.default.ROLE.PRESENTATION} maxLength={4} inputMode={CONST_1.default.INPUT_MODE.NUMERIC}/>
                    </react_native_1.View>
                </react_native_1.View>
                {!!showAddressField && (<react_native_1.View>
                        <InputWrapper_1.default defaultValue={data === null || data === void 0 ? void 0 : data.addressStreet} InputComponent={AddressSearch_1.default} inputID={AddPaymentCardForm_1.default.ADDRESS_STREET} label={translate(label.defaults.billingAddress)} containerStyles={[styles.mt5]} maxInputLength={CONST_1.default.FORM_CHARACTER_LIMIT} 
        // Limit the address search only to the USA until we fully can support international debit cards
        limitSearchesToCountry={CONST_1.default.COUNTRY.US}/>
                    </react_native_1.View>)}
                <InputWrapper_1.default InputComponent={TextInput_1.default} defaultValue={data === null || data === void 0 ? void 0 : data.addressZipCode} inputID={AddPaymentCardForm_1.default.ADDRESS_ZIP_CODE} label={translate('common.zipPostCode')} aria-label={translate('common.zipPostCode')} role={CONST_1.default.ROLE.PRESENTATION} containerStyles={[styles.mt5]}/>
                {!!showStateSelector && (<react_native_1.View style={[styles.mt4, styles.mhn5]}>
                        <InputWrapper_1.default stateSelectorRoute={route.name === SCREENS_1.default.IOU_SEND.ADD_DEBIT_CARD ? ROUTES_1.default.MONEY_REQUEST_STATE_SELECTOR : undefined} InputComponent={StateSelector_1.default} inputID={AddPaymentCardForm_1.default.ADDRESS_STATE}/>
                    </react_native_1.View>)}
                {!!showCurrencyField && (<react_native_1.View style={[styles.mt4, styles.mhn5]}>
                        <InputWrapper_1.default currencySelectorRoute={currencySelectorRoute} value={(_b = data === null || data === void 0 ? void 0 : data.currency) !== null && _b !== void 0 ? _b : CONST_1.default.PAYMENT_CARD_CURRENCY.USD} InputComponent={CurrencySelector_1.default} inputID={AddPaymentCardForm_1.default.CURRENCY}/>
                    </react_native_1.View>)}
                {!!showAcceptTerms && (<react_native_1.View style={[styles.mt4, styles.ml1]}>
                        <InputWrapper_1.default InputComponent={CheckboxWithLabel_1.default} accessibilityLabel={"".concat(translate('common.iAcceptThe'), " ").concat(translate('common.addCardTermsOfService'), " ").concat(translate('common.and'), " ").concat(translate('common.privacyPolicy'))} inputID={AddPaymentCardForm_1.default.ACCEPT_TERMS} defaultValue={!!(data === null || data === void 0 ? void 0 : data.acceptTerms)} LabelComponent={IAcceptTheLabel}/>
                    </react_native_1.View>)}
                {footerContent}
            </FormProvider_1.default>
        </>);
}
PaymentCardForm.displayName = 'PaymentCardForm';
exports.default = PaymentCardForm;
