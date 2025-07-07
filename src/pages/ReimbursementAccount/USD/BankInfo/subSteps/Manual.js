"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useReimbursementAccountStepFormSubmit_1 = require("@hooks/useReimbursementAccountStepFormSubmit");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var ExampleCheck_1 = require("@pages/ReimbursementAccount/USD/BankInfo/ExampleCheck");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var BANK_INFO_STEP_KEYS = ReimbursementAccountForm_1.default.BANK_INFO_STEP;
var STEP_FIELDS = [BANK_INFO_STEP_KEYS.ROUTING_NUMBER, BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER];
function Manual(_a) {
    var _b;
    var _c, _d, _e, _f, _g;
    var onNext = _a.onNext;
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT)[0];
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var defaultValues = (_b = {},
        _b[BANK_INFO_STEP_KEYS.ROUTING_NUMBER] = (_d = (_c = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _c === void 0 ? void 0 : _c[BANK_INFO_STEP_KEYS.ROUTING_NUMBER]) !== null && _d !== void 0 ? _d : '',
        _b[BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER] = (_f = (_e = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _e === void 0 ? void 0 : _e[BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER]) !== null && _f !== void 0 ? _f : '',
        _b);
    var hasBankAccountData = !!((_g = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _g === void 0 ? void 0 : _g.bankAccountID);
    var validate = (0, react_1.useCallback)(function (values) {
        var _a;
        var errors = (0, ValidationUtils_1.getFieldRequiredErrors)(values, STEP_FIELDS);
        var routingNumber = (_a = values.routingNumber) === null || _a === void 0 ? void 0 : _a.trim();
        if (values.accountNumber &&
            !CONST_1.default.BANK_ACCOUNT.REGEX.US_ACCOUNT_NUMBER.test(values.accountNumber.trim()) &&
            !CONST_1.default.BANK_ACCOUNT.REGEX.MASKED_US_ACCOUNT_NUMBER.test(values.accountNumber.trim())) {
            errors.accountNumber = translate('bankAccount.error.accountNumber');
        }
        else if (values.accountNumber && values.accountNumber === routingNumber) {
            errors.accountNumber = translate('bankAccount.error.routingAndAccountNumberCannotBeSame');
        }
        if (routingNumber && (!CONST_1.default.BANK_ACCOUNT.REGEX.SWIFT_BIC.test(routingNumber) || !(0, ValidationUtils_1.isValidRoutingNumber)(routingNumber))) {
            errors.routingNumber = translate('bankAccount.error.routingNumber');
        }
        return errors;
    }, [translate]);
    var handleSubmit = (0, useReimbursementAccountStepFormSubmit_1.default)({
        fieldIds: STEP_FIELDS,
        onNext: onNext,
        shouldSaveDraft: true,
    });
    return (<FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} onSubmit={handleSubmit} validate={validate} submitButtonText={translate('common.next')} style={[styles.mh5, styles.flexGrow1]}>
            <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.mb3]}>{translate('bankAccount.manuallyAdd')}</Text_1.default>
            <Text_1.default style={[styles.mb5, styles.textSupporting]}>{translate('bankAccount.checkHelpLine')}</Text_1.default>
            <ExampleCheck_1.default />
            <InputWrapper_1.default InputComponent={TextInput_1.default} ref={inputCallbackRef} inputID={BANK_INFO_STEP_KEYS.ROUTING_NUMBER} label={translate('bankAccount.routingNumber')} aria-label={translate('bankAccount.routingNumber')} role={CONST_1.default.ROLE.PRESENTATION} defaultValue={defaultValues[BANK_INFO_STEP_KEYS.ROUTING_NUMBER]} inputMode={CONST_1.default.INPUT_MODE.NUMERIC} shouldSaveDraft shouldUseDefaultValue={hasBankAccountData} disabled={hasBankAccountData}/>
            <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER} containerStyles={[styles.mt6]} label={translate('bankAccount.accountNumber')} aria-label={translate('bankAccount.accountNumber')} role={CONST_1.default.ROLE.PRESENTATION} defaultValue={defaultValues[BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER]} inputMode={CONST_1.default.INPUT_MODE.NUMERIC} shouldSaveDraft shouldUseDefaultValue={hasBankAccountData} disabled={hasBankAccountData}/>
        </FormProvider_1.default>);
}
Manual.displayName = 'Manual';
exports.default = Manual;
