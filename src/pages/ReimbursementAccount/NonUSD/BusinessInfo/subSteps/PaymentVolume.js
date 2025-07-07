"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var PushRowWithModal_1 = require("@components/PushRowWithModal");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useReimbursementAccountStepFormSubmit_1 = require("@hooks/useReimbursementAccountStepFormSubmit");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var getListOptionsFromCorpayPicklist_1 = require("@pages/ReimbursementAccount/NonUSD/utils/getListOptionsFromCorpayPicklist");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var ANNUAL_VOLUME = ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY.ANNUAL_VOLUME;
var STEP_FIELDS = [ANNUAL_VOLUME];
function PaymentVolume(_a) {
    var _b, _c, _d, _e, _f;
    var onNext = _a.onNext, isEditing = _a.isEditing;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { canBeMissing: false })[0];
    var corpayOnboardingFields = (0, useOnyx_1.default)(ONYXKEYS_1.default.CORPAY_ONBOARDING_FIELDS, { canBeMissing: false })[0];
    var policyID = (_b = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _b === void 0 ? void 0 : _b.policyID;
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), { canBeMissing: false })[0];
    var currency = (_c = policy === null || policy === void 0 ? void 0 : policy.outputCurrency) !== null && _c !== void 0 ? _c : '';
    var annualVolumeRangeListOptions = (0, react_1.useMemo)(function () { return (0, getListOptionsFromCorpayPicklist_1.default)(corpayOnboardingFields === null || corpayOnboardingFields === void 0 ? void 0 : corpayOnboardingFields.picklists.AnnualVolumeRange); }, [corpayOnboardingFields]);
    var annualVolumeDefaultValue = (_f = (_e = (_d = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _d === void 0 ? void 0 : _d.corpay) === null || _e === void 0 ? void 0 : _e[ANNUAL_VOLUME]) !== null && _f !== void 0 ? _f : '';
    var validate = (0, react_1.useCallback)(function (values) {
        return (0, ValidationUtils_1.getFieldRequiredErrors)(values, STEP_FIELDS);
    }, []);
    var handleSubmit = (0, useReimbursementAccountStepFormSubmit_1.default)({
        fieldIds: STEP_FIELDS,
        onNext: onNext,
        shouldSaveDraft: isEditing,
    });
    return (<FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')} onSubmit={handleSubmit} validate={validate} style={[styles.flexGrow1]} submitButtonStyles={[styles.mh5]} shouldHideFixErrorsAlert>
            <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.mh5, styles.mb3]}>{translate('businessInfoStep.whatsTheBusinessAnnualPayment')}</Text_1.default>
            <InputWrapper_1.default InputComponent={PushRowWithModal_1.default} optionsList={annualVolumeRangeListOptions} description={translate('businessInfoStep.annualPaymentVolumeInCurrency', { currencyCode: currency })} modalHeaderTitle={translate('businessInfoStep.selectAnnualPaymentVolume')} searchInputTitle={translate('businessInfoStep.findAnnualPaymentVolume')} inputID={ANNUAL_VOLUME} shouldSaveDraft={!isEditing} defaultValue={annualVolumeDefaultValue}/>
        </FormProvider_1.default>);
}
PaymentVolume.displayName = 'PaymentVolume';
exports.default = PaymentVolume;
