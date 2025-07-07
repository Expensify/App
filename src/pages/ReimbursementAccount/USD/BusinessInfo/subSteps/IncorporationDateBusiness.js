"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var DatePicker_1 = require("@components/DatePicker");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useReimbursementAccountStepFormSubmit_1 = require("@hooks/useReimbursementAccountStepFormSubmit");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
var COMPANY_INCORPORATION_DATE_KEY = ReimbursementAccountForm_1.default.BUSINESS_INFO_STEP.INCORPORATION_DATE;
var STEP_FIELDS = [COMPANY_INCORPORATION_DATE_KEY];
function IncorporationDateBusiness(_a) {
    var _b, _c, _d;
    var onNext = _a.onNext, isEditing = _a.isEditing;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var _e = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { canBeMissing: true }), reimbursementAccount = _e[0], reimbursementAccountResult = _e[1];
    var isLoadingReimbursementAccount = (0, isLoadingOnyxValue_1.default)(reimbursementAccountResult);
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, { canBeMissing: true })[0];
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = (0, ValidationUtils_1.getFieldRequiredErrors)(values, STEP_FIELDS);
        if (values.incorporationDate && !(0, ValidationUtils_1.isValidDate)(values.incorporationDate)) {
            errors.incorporationDate = translate('common.error.dateInvalid');
        }
        else if (values.incorporationDate && !(0, ValidationUtils_1.isValidPastDate)(values.incorporationDate)) {
            errors.incorporationDate = translate('bankAccount.error.incorporationDateFuture');
        }
        return errors;
    }, [translate]);
    var defaultCompanyIncorporationDate = (_d = (_c = (_b = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _b === void 0 ? void 0 : _b.incorporationDate) !== null && _c !== void 0 ? _c : reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft.incorporationDate) !== null && _d !== void 0 ? _d : '';
    var handleSubmit = (0, useReimbursementAccountStepFormSubmit_1.default)({
        fieldIds: STEP_FIELDS,
        onNext: onNext,
        shouldSaveDraft: isEditing,
    });
    if (isLoadingReimbursementAccount) {
        return <FullscreenLoadingIndicator_1.default />;
    }
    return (<FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')} validate={validate} onSubmit={handleSubmit} style={[styles.mh5, styles.flexGrow1]} submitButtonStyles={[styles.mb0]} shouldHideFixErrorsAlert>
            <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.mb4]}>{translate('businessInfoStep.selectYourCompanyIncorporationDate')}</Text_1.default>
            <InputWrapper_1.default InputComponent={DatePicker_1.default} inputID={COMPANY_INCORPORATION_DATE_KEY} label={translate('businessInfoStep.incorporationDate')} placeholder={translate('businessInfoStep.incorporationDatePlaceholder')} defaultValue={defaultCompanyIncorporationDate} shouldSaveDraft={!isEditing} maxDate={new Date()} autoFocus/>
        </FormProvider_1.default>);
}
IncorporationDateBusiness.displayName = 'IncorporationDateBusiness';
exports.default = IncorporationDateBusiness;
