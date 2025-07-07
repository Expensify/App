"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CurrencyUtils = require("@libs/CurrencyUtils");
var getPermittedDecimalSeparator_1 = require("@libs/getPermittedDecimalSeparator");
var ValidationUtils = require("@libs/ValidationUtils");
var BankAccounts = require("@userActions/BankAccounts");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var Enable2FACard_1 = require("./Enable2FACard");
function getAmountValues(values) {
    var _a, _b, _c;
    return {
        amount1: (_a = values === null || values === void 0 ? void 0 : values.amount1) !== null && _a !== void 0 ? _a : '',
        amount2: (_b = values === null || values === void 0 ? void 0 : values.amount2) !== null && _b !== void 0 ? _b : '',
        amount3: (_c = values === null || values === void 0 ? void 0 : values.amount3) !== null && _c !== void 0 ? _c : '',
    };
}
var filterInput = function (amount, amountRegex, permittedDecimalSeparator) {
    var value = amount ? amount.toString().trim() : '';
    var regex = new RegExp("^0+|([".concat(permittedDecimalSeparator, "]\\d*?)0+$"), 'g');
    value = value.replace(regex, '$1');
    if (value === '' || Number.isNaN(Number(value)) || !Math.abs(expensify_common_1.Str.fromUSDToNumber(value, false)) || (amountRegex && !amountRegex.test(value))) {
        return '';
    }
    return value;
};
function BankAccountValidationForm(_a) {
    var _b, _c;
    var requiresTwoFactorAuth = _a.requiresTwoFactorAuth, reimbursementAccount = _a.reimbursementAccount, policy = _a.policy;
    var _d = (0, useLocalize_1.default)(), translate = _d.translate, toLocaleDigit = _d.toLocaleDigit;
    var styles = (0, useThemeStyles_1.default)();
    var policyID = (_c = (_b = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _b === void 0 ? void 0 : _b.policyID) !== null && _c !== void 0 ? _c : '-1';
    var decimalSeparator = toLocaleDigit('.');
    var permittedDecimalSeparator = (0, getPermittedDecimalSeparator_1.default)(decimalSeparator);
    var validate = function (values) {
        var _a;
        var errors = {};
        var amountValues = getAmountValues(values);
        var outputCurrency = (_a = policy === null || policy === void 0 ? void 0 : policy.outputCurrency) !== null && _a !== void 0 ? _a : CONST_1.default.CURRENCY.USD;
        var amountRegex = RegExp(String.raw(templateObject_1 || (templateObject_1 = __makeTemplateObject(["^-?d{0,8}([", "]d{0,", "})?$"], ["^-?\\d{0,8}([", "]\\d{0,", "})?$"])), permittedDecimalSeparator, CurrencyUtils.getCurrencyDecimals(outputCurrency)), 'i');
        Object.keys(amountValues).forEach(function (key) {
            var value = amountValues[key];
            var filteredValue = filterInput(value, amountRegex, permittedDecimalSeparator);
            if (ValidationUtils.isRequiredFulfilled(filteredValue.toString())) {
                return;
            }
            errors[key] = translate('common.error.invalidAmount');
        });
        return errors;
    };
    var submit = (0, react_1.useCallback)(function (values) {
        var _a, _b, _c, _d, _e;
        var amount1 = filterInput((_a = values.amount1) !== null && _a !== void 0 ? _a : '', undefined, permittedDecimalSeparator);
        var amount2 = filterInput((_b = values.amount2) !== null && _b !== void 0 ? _b : '', undefined, permittedDecimalSeparator);
        var amount3 = filterInput((_c = values.amount3) !== null && _c !== void 0 ? _c : '', undefined, permittedDecimalSeparator);
        var validateCode = [amount1, amount2, amount3].join(',');
        // Send valid amounts to BankAccountAPI::validateBankAccount in Web-Expensify
        var bankAccountID = Number((_e = (_d = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _d === void 0 ? void 0 : _d.bankAccountID) !== null && _e !== void 0 ? _e : '-1');
        if (bankAccountID) {
            BankAccounts.validateBankAccount(bankAccountID, validateCode, policyID);
        }
    }, [reimbursementAccount, policyID, permittedDecimalSeparator]);
    // On android autoCapitalize="words" is necessary when keyboardType="decimal-pad" or inputMode="decimal" to prevent input lag.
    // See https://github.com/Expensify/App/issues/51868 for more information
    return (<FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} submitButtonText={translate('connectBankAccountStep.validateButtonText')} onSubmit={submit} validate={validate} style={[styles.mh5, styles.flexGrow1]}>
            <Text_1.default>{translate('connectBankAccountStep.description')}</Text_1.default>
            <Text_1.default>{translate('connectBankAccountStep.descriptionCTA')}</Text_1.default>

            <react_native_1.View style={[styles.mv5]}>
                <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={ReimbursementAccountForm_1.default.AMOUNT1} shouldSaveDraft containerStyles={[styles.mb6]} inputMode={CONST_1.default.INPUT_MODE.DECIMAL} autoCapitalize="words" label={"".concat(translate('connectBankAccountStep.validationInputLabel'), " 1")} maxLength={CONST_1.default.VALIDATION_REIMBURSEMENT_INPUT_LIMIT}/>
                <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={ReimbursementAccountForm_1.default.AMOUNT2} shouldSaveDraft containerStyles={[styles.mb6]} inputMode={CONST_1.default.INPUT_MODE.DECIMAL} autoCapitalize="words" label={"".concat(translate('connectBankAccountStep.validationInputLabel'), " 2")} maxLength={CONST_1.default.VALIDATION_REIMBURSEMENT_INPUT_LIMIT}/>
                <InputWrapper_1.default InputComponent={TextInput_1.default} shouldSaveDraft inputID={ReimbursementAccountForm_1.default.AMOUNT3} containerStyles={[styles.mb6]} inputMode={CONST_1.default.INPUT_MODE.DECIMAL} autoCapitalize="words" label={"".concat(translate('connectBankAccountStep.validationInputLabel'), " 3")} maxLength={CONST_1.default.VALIDATION_REIMBURSEMENT_INPUT_LIMIT}/>
            </react_native_1.View>
            {!requiresTwoFactorAuth && (<react_native_1.View style={[styles.mln5, styles.mrn5, styles.mt3]}>
                    <Enable2FACard_1.default policyID={policyID}/>
                </react_native_1.View>)}
        </FormProvider_1.default>);
}
BankAccountValidationForm.displayName = 'BankAccountValidationForm';
exports.default = BankAccountValidationForm;
var templateObject_1;
