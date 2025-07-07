"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var SingleFieldStep_1 = require("@components/SubStepForms/SingleFieldStep");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useReimbursementAccountStepFormSubmit_1 = require("@hooks/useReimbursementAccountStepFormSubmit");
var BankAccountUtils_1 = require("@libs/BankAccountUtils");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var BankAccounts_1 = require("@userActions/BankAccounts");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
var COMPANY_WEBSITE_KEY = ReimbursementAccountForm_1.default.BUSINESS_INFO_STEP.COMPANY_WEBSITE;
var STEP_FIELDS = [COMPANY_WEBSITE_KEY];
function WebsiteBusiness(_a) {
    var _b, _c;
    var onNext = _a.onNext, onMove = _a.onMove, isEditing = _a.isEditing;
    var translate = (0, useLocalize_1.default)().translate;
    var _d = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { canBeMissing: true }), reimbursementAccount = _d[0], reimbursementAccountResult = _d[1];
    var isLoadingReimbursementAccount = (0, isLoadingOnyxValue_1.default)(reimbursementAccountResult);
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: true })[0];
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: true })[0];
    var defaultWebsiteExample = (0, react_1.useMemo)(function () { return (0, BankAccountUtils_1.getDefaultCompanyWebsite)(session, account); }, [session, account]);
    var defaultCompanyWebsite = (_c = (_b = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _b === void 0 ? void 0 : _b.website) !== null && _c !== void 0 ? _c : defaultWebsiteExample;
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = (0, ValidationUtils_1.getFieldRequiredErrors)(values, STEP_FIELDS);
        if (values.website && !(0, ValidationUtils_1.isValidWebsite)(expensify_common_1.Str.sanitizeURL(values.website, CONST_1.default.COMPANY_WEBSITE_DEFAULT_SCHEME))) {
            errors.website = translate('bankAccount.error.website');
        }
        return errors;
    }, [translate]);
    var handleSubmit = (0, useReimbursementAccountStepFormSubmit_1.default)({
        fieldIds: STEP_FIELDS,
        onNext: function (values) {
            var website = expensify_common_1.Str.sanitizeURL(values === null || values === void 0 ? void 0 : values.website, CONST_1.default.COMPANY_WEBSITE_DEFAULT_SCHEME);
            (0, BankAccounts_1.addBusinessWebsiteForDraft)(website);
            onNext();
        },
        shouldSaveDraft: true,
    });
    if (isLoadingReimbursementAccount) {
        return <FullscreenLoadingIndicator_1.default />;
    }
    return (<SingleFieldStep_1.default isEditing={isEditing} onNext={onNext} onMove={onMove} formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} formTitle={translate('businessInfoStep.enterYourCompanyWebsite')} formDisclaimer={translate('common.websiteExample')} validate={validate} onSubmit={handleSubmit} inputId={COMPANY_WEBSITE_KEY} inputLabel={translate('businessInfoStep.companyWebsite')} defaultValue={defaultCompanyWebsite} inputMode={CONST_1.default.INPUT_MODE.URL} shouldShowHelpLinks={false}/>);
}
WebsiteBusiness.displayName = 'WebsiteBusiness';
exports.default = WebsiteBusiness;
