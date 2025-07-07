"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePolicy_1 = require("@hooks/usePolicy");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var _a = ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY, COMPANY_NAME = _a.COMPANY_NAME, SIGNER_EMAIL = _a.SIGNER_EMAIL, SECOND_SIGNER_EMAIL = _a.SECOND_SIGNER_EMAIL;
function EnterEmail(_a) {
    var _b, _c, _d, _e, _f;
    var onSubmit = _a.onSubmit, isUserDirector = _a.isUserDirector;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { canBeMissing: false })[0];
    var policyID = (_b = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _b === void 0 ? void 0 : _b.policyID;
    var policy = (0, usePolicy_1.default)(policyID);
    var currency = (_c = policy === null || policy === void 0 ? void 0 : policy.outputCurrency) !== null && _c !== void 0 ? _c : '';
    var shouldGatherBothEmails = currency === CONST_1.default.CURRENCY.AUD && !isUserDirector;
    var companyName = (_f = (_e = (_d = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _d === void 0 ? void 0 : _d.corpay) === null || _e === void 0 ? void 0 : _e[COMPANY_NAME]) !== null && _f !== void 0 ? _f : '';
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = (0, ValidationUtils_1.getFieldRequiredErrors)(values, shouldGatherBothEmails ? [SIGNER_EMAIL, SECOND_SIGNER_EMAIL] : [SIGNER_EMAIL]);
        if (values[SIGNER_EMAIL] && !expensify_common_1.Str.isValidEmail(values[SIGNER_EMAIL])) {
            errors[SIGNER_EMAIL] = translate('bankAccount.error.email');
        }
        if (shouldGatherBothEmails && values[SECOND_SIGNER_EMAIL] && !expensify_common_1.Str.isValidEmail(String(values[SECOND_SIGNER_EMAIL]))) {
            errors[SECOND_SIGNER_EMAIL] = translate('bankAccount.error.email');
        }
        return errors;
    }, [shouldGatherBothEmails, translate]);
    return (<FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} submitButtonText={translate('common.next')} onSubmit={onSubmit} validate={validate} style={[styles.mh5, styles.flexGrow1]} shouldHideFixErrorsAlert={!shouldGatherBothEmails}>
            <Text_1.default style={[styles.textHeadlineLineHeightXXL]}>{translate(shouldGatherBothEmails ? 'signerInfoStep.enterTwoEmails' : 'signerInfoStep.enterOneEmail', { companyName: companyName })}</Text_1.default>
            {!shouldGatherBothEmails && <Text_1.default style={[styles.pv3, styles.textSupporting]}>{translate('signerInfoStep.regulationRequiresOneMoreDirector')}</Text_1.default>}
            <InputWrapper_1.default InputComponent={TextInput_1.default} label={shouldGatherBothEmails ? "".concat(translate('common.email'), " 1") : translate('common.email')} aria-label={shouldGatherBothEmails ? "".concat(translate('common.email'), " 1") : translate('common.email')} role={CONST_1.default.ROLE.PRESENTATION} inputID={SIGNER_EMAIL} inputMode={CONST_1.default.INPUT_MODE.EMAIL} containerStyles={[styles.mt6]}/>
            {shouldGatherBothEmails && (<InputWrapper_1.default InputComponent={TextInput_1.default} label={"".concat(translate('common.email'), " 2")} aria-label={"".concat(translate('common.email'), " 2")} role={CONST_1.default.ROLE.PRESENTATION} inputID={SECOND_SIGNER_EMAIL} inputMode={CONST_1.default.INPUT_MODE.EMAIL} containerStyles={[styles.mt6]}/>)}
        </FormProvider_1.default>);
}
EnterEmail.displayName = 'EnterEmail';
exports.default = EnterEmail;
