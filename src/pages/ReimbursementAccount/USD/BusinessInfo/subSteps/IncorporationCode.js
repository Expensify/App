"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useReimbursementAccountStepFormSubmit_1 = require("@hooks/useReimbursementAccountStepFormSubmit");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var IndustryCodeSelector_1 = require("./IndustryCode/IndustryCodeSelector");
var COMPANY_INCORPORATION_CODE_KEY = ReimbursementAccountForm_1.default.BUSINESS_INFO_STEP.INCORPORATION_CODE;
var STEP_FIELDS = [COMPANY_INCORPORATION_CODE_KEY];
function IncorporationCode(_a) {
    var _b;
    var onNext = _a.onNext, isEditing = _a.isEditing;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { canBeMissing: false })[0];
    var handleSubmit = (0, useReimbursementAccountStepFormSubmit_1.default)({
        fieldIds: STEP_FIELDS,
        onNext: onNext,
        shouldSaveDraft: isEditing,
    });
    var validate = function (values) {
        var errors = {};
        if (!values[COMPANY_INCORPORATION_CODE_KEY]) {
            errors[COMPANY_INCORPORATION_CODE_KEY] = translate('common.error.fieldRequired');
        }
        else if (!(0, ValidationUtils_1.isValidIndustryCode)(values[COMPANY_INCORPORATION_CODE_KEY])) {
            errors[COMPANY_INCORPORATION_CODE_KEY] = translate('bankAccount.error.industryCode');
        }
        return errors;
    };
    return (<FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')} validate={validate} onSubmit={handleSubmit} style={[styles.mh0, styles.flexGrow1]} submitButtonStyles={[styles.ph5, styles.mb0]} shouldHideFixErrorsAlert>
            <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mb6]}>{translate('companyStep.industryClassification')}</Text_1.default>
            <InputWrapper_1.default InputComponent={IndustryCodeSelector_1.default} inputID={COMPANY_INCORPORATION_CODE_KEY} shouldSaveDraft={!isEditing} defaultValue={(_b = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _b === void 0 ? void 0 : _b.industryCode}/>
        </FormProvider_1.default>);
}
IncorporationCode.displayName = 'IncorporationCode';
exports.default = IncorporationCode;
