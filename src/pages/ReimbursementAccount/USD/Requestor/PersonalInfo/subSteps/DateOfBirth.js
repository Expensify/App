"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var DateOfBirthStep_1 = require("@components/SubStepForms/DateOfBirthStep");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useReimbursementAccountStepFormSubmit_1 = require("@hooks/useReimbursementAccountStepFormSubmit");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var HelpLinks_1 = require("@pages/ReimbursementAccount/USD/Requestor/PersonalInfo/HelpLinks");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
var PERSONAL_INFO_DOB_KEY = ReimbursementAccountForm_1.default.PERSONAL_INFO_STEP.DOB;
var STEP_FIELDS = [PERSONAL_INFO_DOB_KEY];
function DateOfBirth(_a) {
    var _b, _c, _d;
    var onNext = _a.onNext, onMove = _a.onMove, isEditing = _a.isEditing;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var _e = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT), reimbursementAccount = _e[0], reimbursementAccountResult = _e[1];
    var isLoadingReimbursementAccount = (0, isLoadingOnyxValue_1.default)(reimbursementAccountResult);
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT)[0];
    var dobDefaultValue = (_d = (_c = (_b = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _b === void 0 ? void 0 : _b[PERSONAL_INFO_DOB_KEY]) !== null && _c !== void 0 ? _c : reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[PERSONAL_INFO_DOB_KEY]) !== null && _d !== void 0 ? _d : '';
    var handleSubmit = (0, useReimbursementAccountStepFormSubmit_1.default)({
        fieldIds: STEP_FIELDS,
        onNext: onNext,
        shouldSaveDraft: isEditing,
    });
    if (isLoadingReimbursementAccount) {
        return <FullscreenLoadingIndicator_1.default />;
    }
    return (<DateOfBirthStep_1.default isEditing={isEditing} onNext={onNext} onMove={onMove} formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} formTitle={translate('personalInfoStep.enterYourDateOfBirth')} onSubmit={handleSubmit} stepFields={STEP_FIELDS} dobInputID={PERSONAL_INFO_DOB_KEY} dobDefaultValue={dobDefaultValue} footerComponent={<HelpLinks_1.default containerStyles={[styles.mt5]}/>}/>);
}
DateOfBirth.displayName = 'DateOfBirth';
exports.default = DateOfBirth;
