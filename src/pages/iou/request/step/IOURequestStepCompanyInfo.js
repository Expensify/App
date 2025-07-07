"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useCurrentUserPersonalDetails_1 = require("@hooks/useCurrentUserPersonalDetails");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePolicy_1 = require("@hooks/usePolicy");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var BankAccountUtils_1 = require("@libs/BankAccountUtils");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var Url_1 = require("@libs/Url");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var Navigation_1 = require("@navigation/Navigation");
var IOU_1 = require("@userActions/IOU");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var MoneyRequestCompanyInfoForm_1 = require("@src/types/form/MoneyRequestCompanyInfoForm");
var StepScreenWrapper_1 = require("./StepScreenWrapper");
var withFullTransactionOrNotFound_1 = require("./withFullTransactionOrNotFound");
var withWritableReportOrNotFound_1 = require("./withWritableReportOrNotFound");
function IOURequestStepCompanyInfo(_a) {
    var _b;
    var route = _a.route, report = _a.report, transaction = _a.transaction;
    var backTo = route.params.backTo;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var currentUserPersonalDetails = (0, useCurrentUserPersonalDetails_1.default)();
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: true })[0];
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: true })[0];
    var defaultWebsiteExample = (0, react_1.useMemo)(function () { return (0, BankAccountUtils_1.getDefaultCompanyWebsite)(session, account); }, [session, account]);
    var policy = (0, usePolicy_1.default)((0, IOU_1.getIOURequestPolicyID)(transaction, report));
    var policyCategories = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat((0, IOU_1.getIOURequestPolicyID)(transaction, report)), { canBeMissing: true })[0];
    var policyTags = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat((0, IOU_1.getIOURequestPolicyID)(transaction, report)), { canBeMissing: true })[0];
    var formattedAmount = (0, CurrencyUtils_1.convertToDisplayString)(Math.abs((_b = transaction === null || transaction === void 0 ? void 0 : transaction.amount) !== null && _b !== void 0 ? _b : 0), transaction === null || transaction === void 0 ? void 0 : transaction.currency);
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = (0, ValidationUtils_1.getFieldRequiredErrors)(values, [MoneyRequestCompanyInfoForm_1.default.COMPANY_NAME, MoneyRequestCompanyInfoForm_1.default.COMPANY_WEBSITE]);
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
    }, [translate]);
    var submit = function (values) {
        var companyWebsite = expensify_common_1.Str.sanitizeURL(values.companyWebsite, CONST_1.default.COMPANY_WEBSITE_DEFAULT_SCHEME);
        (0, IOU_1.sendInvoice)(currentUserPersonalDetails.accountID, transaction, report, undefined, policy, policyTags, policyCategories, values.companyName, companyWebsite);
    };
    return (<StepScreenWrapper_1.default headerTitle={translate('iou.companyInfo')} onBackButtonPress={function () { return Navigation_1.default.goBack(backTo); }} shouldShowWrapper testID={IOURequestStepCompanyInfo.displayName}>
            <Text_1.default style={[styles.textNormalThemeText, styles.ph5]}>{translate('iou.companyInfoDescription')}</Text_1.default>
            <FormProvider_1.default style={[styles.flexGrow1, styles.ph5]} formID={ONYXKEYS_1.default.FORMS.MONEY_REQUEST_COMPANY_INFO_FORM} onSubmit={submit} validate={validate} submitButtonText={translate('iou.sendInvoice', { amount: formattedAmount })} enabledWhenOffline>
                <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={MoneyRequestCompanyInfoForm_1.default.COMPANY_NAME} name={MoneyRequestCompanyInfoForm_1.default.COMPANY_NAME} label={translate('iou.yourCompanyName')} accessibilityLabel={translate('iou.yourCompanyName')} role={CONST_1.default.ROLE.PRESENTATION} ref={inputCallbackRef} containerStyles={styles.mv4}/>
                <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={MoneyRequestCompanyInfoForm_1.default.COMPANY_WEBSITE} name={MoneyRequestCompanyInfoForm_1.default.COMPANY_WEBSITE} inputMode={CONST_1.default.INPUT_MODE.URL} label={translate('iou.yourCompanyWebsite')} accessibilityLabel={translate('iou.yourCompanyWebsite')} role={CONST_1.default.ROLE.PRESENTATION} hint={translate('iou.yourCompanyWebsiteNote')} defaultValue={defaultWebsiteExample}/>
            </FormProvider_1.default>
        </StepScreenWrapper_1.default>);
}
IOURequestStepCompanyInfo.displayName = 'IOURequestStepCompanyInfo';
exports.default = (0, withWritableReportOrNotFound_1.default)((0, withFullTransactionOrNotFound_1.default)(IOURequestStepCompanyInfo));
