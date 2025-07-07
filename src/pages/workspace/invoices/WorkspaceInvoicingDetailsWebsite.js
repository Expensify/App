"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var TextInput_1 = require("@components/TextInput");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Url_1 = require("@libs/Url");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var Navigation_1 = require("@navigation/Navigation");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var WorkspaceInvoicesCompanyWebsiteForm_1 = require("@src/types/form/WorkspaceInvoicesCompanyWebsiteForm");
function WorkspaceInvoicingDetailsWebsite(_a) {
    var _b;
    var route = _a.route;
    var policyID = route.params.policyID;
    var translate = (0, useLocalize_1.default)().translate;
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var styles = (0, useThemeStyles_1.default)();
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID))[0];
    var submit = function (values) {
        var companyWebsite = expensify_common_1.Str.sanitizeURL(values[WorkspaceInvoicesCompanyWebsiteForm_1.default.COMPANY_WEBSITE], CONST_1.default.COMPANY_WEBSITE_DEFAULT_SCHEME);
        (0, Policy_1.updateInvoiceCompanyWebsite)(policyID, companyWebsite);
        Navigation_1.default.goBack();
    };
    var validate = function (values) {
        var errors = (0, ValidationUtils_1.getFieldRequiredErrors)(values, [WorkspaceInvoicesCompanyWebsiteForm_1.default.COMPANY_WEBSITE]);
        if (values.companyWebsite) {
            var companyWebsite = expensify_common_1.Str.sanitizeURL(values.companyWebsite, CONST_1.default.COMPANY_WEBSITE_DEFAULT_SCHEME);
            if (!(0, ValidationUtils_1.isValidWebsite)(companyWebsite)) {
                errors.companyWebsite = translate('bankAccount.error.website');
            }
            else {
                var domain = (0, Url_1.extractUrlDomain)(companyWebsite);
                if (!domain || !expensify_common_1.Str.isValidDomainName(domain)) {
                    errors.companyWebsite = translate('iou.invalidDomainError');
                }
                else if ((0, ValidationUtils_1.isPublicDomain)(domain)) {
                    errors.companyWebsite = translate('iou.publicDomainError');
                }
            }
        }
        return errors;
    };
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_INVOICES_ENABLED}>
            <ScreenWrapper_1.default testID={WorkspaceInvoicingDetailsWebsite.displayName} shouldEnablePickerAvoiding={false} shouldEnableMaxHeight enableEdgeToEdgeBottomSafeAreaPadding>
                <HeaderWithBackButton_1.default title={translate('workspace.invoices.companyWebsite')}/>
                <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.WORKSPACE_INVOICES_COMPANY_WEBSITE_FORM} submitButtonText={translate('common.save')} onSubmit={submit} style={[styles.flex1, styles.mh5]} enabledWhenOffline validate={validate} shouldHideFixErrorsAlert addBottomSafeAreaPadding>
                    <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={WorkspaceInvoicesCompanyWebsiteForm_1.default.COMPANY_WEBSITE} label={translate('workspace.invoices.companyWebsite')} accessibilityLabel={translate('workspace.invoices.companyWebsite')} role={CONST_1.default.ROLE.PRESENTATION} defaultValue={(_b = policy === null || policy === void 0 ? void 0 : policy.invoice) === null || _b === void 0 ? void 0 : _b.companyWebsite} ref={inputCallbackRef} inputMode={CONST_1.default.INPUT_MODE.URL}/>
                </FormProvider_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceInvoicingDetailsWebsite.displayName = 'WorkspaceInvoicingDetailsWebsite';
exports.default = WorkspaceInvoicingDetailsWebsite;
