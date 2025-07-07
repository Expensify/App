"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var SingleFieldStep_1 = require("@components/SubStepForms/SingleFieldStep");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useReimbursementAccountStepFormSubmit_1 = require("@hooks/useReimbursementAccountStepFormSubmit");
var BankAccountUtils_1 = require("@libs/BankAccountUtils");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var FormActions_1 = require("@userActions/FormActions");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var COMPANY_WEBSITE = ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY.COMPANY_WEBSITE;
var STEP_FIELDS = [COMPANY_WEBSITE];
function Website(_a) {
    var _b, _c, _d, _e;
    var onNext = _a.onNext, onMove = _a.onMove, isEditing = _a.isEditing;
    var translate = (0, useLocalize_1.default)().translate;
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: false })[0];
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: false })[0];
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { canBeMissing: false })[0];
    var policyID = (_b = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _b === void 0 ? void 0 : _b.policyID;
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), { canBeMissing: false })[0];
    var currency = (_c = policy === null || policy === void 0 ? void 0 : policy.outputCurrency) !== null && _c !== void 0 ? _c : '';
    var isWebsiteRequired = currency === CONST_1.default.CURRENCY.USD || CONST_1.default.CURRENCY.CAD;
    var defaultWebsiteExample = (0, react_1.useMemo)(function () { return (0, BankAccountUtils_1.getDefaultCompanyWebsite)(session, account); }, [session, account]);
    var defaultCompanyWebsite = (_e = (_d = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _d === void 0 ? void 0 : _d.website) !== null && _e !== void 0 ? _e : defaultWebsiteExample;
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = isWebsiteRequired ? (0, ValidationUtils_1.getFieldRequiredErrors)(values, STEP_FIELDS) : {};
        if (values[COMPANY_WEBSITE] && !(0, ValidationUtils_1.isValidWebsite)(expensify_common_1.Str.sanitizeURL(values[COMPANY_WEBSITE], CONST_1.default.COMPANY_WEBSITE_DEFAULT_SCHEME))) {
            errors[COMPANY_WEBSITE] = translate('bankAccount.error.website');
        }
        return errors;
    }, [isWebsiteRequired, translate]);
    var handleSubmit = (0, useReimbursementAccountStepFormSubmit_1.default)({
        fieldIds: STEP_FIELDS,
        onNext: function (values) {
            var _a;
            var website = expensify_common_1.Str.sanitizeURL(values === null || values === void 0 ? void 0 : values.websiteUrl, CONST_1.default.COMPANY_WEBSITE_DEFAULT_SCHEME);
            (0, FormActions_1.setDraftValues)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM, (_a = {}, _a[COMPANY_WEBSITE] = website, _a));
            onNext();
        },
        shouldSaveDraft: true,
    });
    return (<SingleFieldStep_1.default isEditing={isEditing} onNext={onNext} onMove={onMove} formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} formTitle={translate('businessInfoStep.enterYourCompanyWebsite')} formDisclaimer={translate('common.websiteExample')} validate={validate} onSubmit={handleSubmit} inputId={COMPANY_WEBSITE} inputLabel={translate('businessInfoStep.companyWebsite')} inputMode={CONST_1.default.INPUT_MODE.URL} defaultValue={defaultCompanyWebsite} shouldShowHelpLinks={false}/>);
}
Website.displayName = 'Website';
exports.default = Website;
