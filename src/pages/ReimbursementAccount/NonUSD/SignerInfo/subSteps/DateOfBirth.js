"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var DateOfBirthStep_1 = require("@components/SubStepForms/DateOfBirthStep");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useReimbursementAccountStepFormSubmit_1 = require("@hooks/useReimbursementAccountStepFormSubmit");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var WhyLink_1 = require("@pages/ReimbursementAccount/NonUSD/WhyLink");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var SIGNER_DATE_OF_BIRTH = ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY.SIGNER_DATE_OF_BIRTH;
function DateOfBirth(_a) {
    var _b, _c, _d, _e;
    var onNext = _a.onNext, onMove = _a.onMove, isEditing = _a.isEditing;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var inputID = SIGNER_DATE_OF_BIRTH;
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT)[0];
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT)[0];
    var defaultValue = (_e = (_d = (_c = (_b = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _b === void 0 ? void 0 : _b.corpay) === null || _c === void 0 ? void 0 : _c[inputID]) !== null && _d !== void 0 ? _d : reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[inputID]) !== null && _e !== void 0 ? _e : '';
    var handleSubmit = (0, useReimbursementAccountStepFormSubmit_1.default)({
        fieldIds: [inputID],
        onNext: onNext,
        shouldSaveDraft: isEditing,
    });
    return (<DateOfBirthStep_1.default isEditing={isEditing} onNext={onNext} onMove={onMove} formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} formTitle={translate('signerInfoStep.whatsYourDOB')} onSubmit={handleSubmit} stepFields={[inputID]} dobInputID={inputID} dobDefaultValue={defaultValue} footerComponent={<WhyLink_1.default containerStyles={[styles.mt6]}/>}/>);
}
DateOfBirth.displayName = 'DateOfBirth';
exports.default = DateOfBirth;
