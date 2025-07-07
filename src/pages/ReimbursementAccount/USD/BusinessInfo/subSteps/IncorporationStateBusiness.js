"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var StateSelector_1 = require("@components/StateSelector");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useReimbursementAccountStepFormSubmit_1 = require("@hooks/useReimbursementAccountStepFormSubmit");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
var COMPANY_INCORPORATION_STATE_KEY = ReimbursementAccountForm_1.default.BUSINESS_INFO_STEP.INCORPORATION_STATE;
var STEP_FIELDS = [COMPANY_INCORPORATION_STATE_KEY];
var validate = function (values) {
    return (0, ValidationUtils_1.getFieldRequiredErrors)(values, STEP_FIELDS);
};
function IncorporationStateBusiness(_a) {
    var _b, _c;
    var onNext = _a.onNext, isEditing = _a.isEditing;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var _d = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT), reimbursementAccount = _d[0], reimbursementAccountResult = _d[1];
    var isLoadingReimbursementAccount = (0, isLoadingOnyxValue_1.default)(reimbursementAccountResult);
    var defaultCompanyIncorporationState = (_c = (_b = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _b === void 0 ? void 0 : _b.incorporationState) !== null && _c !== void 0 ? _c : '';
    var handleSubmit = (0, useReimbursementAccountStepFormSubmit_1.default)({
        fieldIds: STEP_FIELDS,
        onNext: onNext,
        shouldSaveDraft: isEditing,
    });
    if (isLoadingReimbursementAccount) {
        return <FullscreenLoadingIndicator_1.default />;
    }
    return (<FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')} validate={validate} onSubmit={handleSubmit} style={[styles.mh0, styles.flexGrow1]} submitButtonStyles={[styles.ph5, styles.mb0]} shouldHideFixErrorsAlert>
            <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.ph5]}>{translate('businessInfoStep.pleaseSelectTheStateYourCompanyWasIncorporatedIn')}</Text_1.default>
            <InputWrapper_1.default InputComponent={StateSelector_1.default} inputID={COMPANY_INCORPORATION_STATE_KEY} label={translate('businessInfoStep.incorporationState')} defaultValue={defaultCompanyIncorporationState} shouldSaveDraft={!isEditing} wrapperStyle={[styles.ph5, styles.mt3]}/>
        </FormProvider_1.default>);
}
IncorporationStateBusiness.displayName = 'IncorporationStateBusiness';
exports.default = IncorporationStateBusiness;
