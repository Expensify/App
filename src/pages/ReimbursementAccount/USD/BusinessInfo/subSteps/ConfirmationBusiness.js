"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var CheckboxWithLabel_1 = require("@components/CheckboxWithLabel");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var getSubStepValues_1 = require("@pages/ReimbursementAccount/utils/getSubStepValues");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var BUSINESS_INFO_STEP_KEYS = ReimbursementAccountForm_1.default.BUSINESS_INFO_STEP;
var BUSINESS_INFO_STEP_INDEXES = CONST_1.default.REIMBURSEMENT_ACCOUNT.SUBSTEP_INDEX.BUSINESS_INFO;
function ConfirmCompanyLabel() {
    var translate = (0, useLocalize_1.default)().translate;
    return (<Text_1.default>
            {"".concat(translate('businessInfoStep.confirmCompanyIsNot'), " ")}
            <TextLink_1.default href={CONST_1.default.LIST_OF_RESTRICTED_BUSINESSES}>{"".concat(translate('businessInfoStep.listOfRestrictedBusinesses'), ".")}</TextLink_1.default>
        </Text_1.default>);
}
function ConfirmationBusiness(_a) {
    var _b;
    var onNext = _a.onNext, onMove = _a.onMove;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT)[0];
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT)[0];
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = (0, ValidationUtils_1.getFieldRequiredErrors)(values, [BUSINESS_INFO_STEP_KEYS.HAS_NO_CONNECTION_TO_CANNABIS]);
        if (!values.hasNoConnectionToCannabis) {
            errors.hasNoConnectionToCannabis = translate('bankAccount.error.restrictedBusiness');
        }
        return errors;
    }, [translate]);
    var values = (0, react_1.useMemo)(function () { return (0, getSubStepValues_1.default)(BUSINESS_INFO_STEP_KEYS, reimbursementAccountDraft, reimbursementAccount); }, [reimbursementAccount, reimbursementAccountDraft]);
    var defaultCheckboxState = (_b = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[BUSINESS_INFO_STEP_KEYS.HAS_NO_CONNECTION_TO_CANNABIS]) !== null && _b !== void 0 ? _b : false;
    return (<ScrollView_1.default contentContainerStyle={styles.flexGrow1}>
            <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mb3]}>{translate('businessInfoStep.letsDoubleCheck')}</Text_1.default>
            <MenuItemWithTopDescription_1.default description={translate('businessInfoStep.businessName')} title={values[BUSINESS_INFO_STEP_KEYS.COMPANY_NAME]} shouldShowRightIcon onPress={function () {
            onMove(BUSINESS_INFO_STEP_INDEXES.BUSINESS_NAME);
        }}/>
            <MenuItemWithTopDescription_1.default description={translate('businessInfoStep.taxIDNumber')} title={values[BUSINESS_INFO_STEP_KEYS.COMPANY_TAX_ID]} shouldShowRightIcon onPress={function () {
            onMove(BUSINESS_INFO_STEP_INDEXES.TAX_ID_NUMBER);
        }}/>
            <MenuItemWithTopDescription_1.default description={translate('common.companyAddress')} title={"".concat(values[BUSINESS_INFO_STEP_KEYS.STREET], ", ").concat(values[BUSINESS_INFO_STEP_KEYS.CITY], ", ").concat(values[BUSINESS_INFO_STEP_KEYS.STATE], " ").concat(values[BUSINESS_INFO_STEP_KEYS.ZIP_CODE])} shouldShowRightIcon onPress={function () {
            onMove(BUSINESS_INFO_STEP_INDEXES.COMPANY_ADDRESS);
        }}/>
            <MenuItemWithTopDescription_1.default description={translate('common.phoneNumber')} title={values[BUSINESS_INFO_STEP_KEYS.COMPANY_PHONE]} shouldShowRightIcon onPress={function () {
            onMove(BUSINESS_INFO_STEP_INDEXES.PHONE_NUMBER);
        }}/>
            <MenuItemWithTopDescription_1.default description={translate('businessInfoStep.companyWebsite')} title={values[BUSINESS_INFO_STEP_KEYS.COMPANY_WEBSITE]} shouldShowRightIcon onPress={function () {
            onMove(BUSINESS_INFO_STEP_INDEXES.COMPANY_WEBSITE);
        }}/>
            <MenuItemWithTopDescription_1.default description={translate('businessInfoStep.companyType')} title={translate("businessInfoStep.incorporationType.".concat(values[BUSINESS_INFO_STEP_KEYS.INCORPORATION_TYPE]))} shouldShowRightIcon onPress={function () {
            onMove(BUSINESS_INFO_STEP_INDEXES.COMPANY_TYPE);
        }}/>
            <MenuItemWithTopDescription_1.default description={translate('businessInfoStep.incorporationDate')} title={values[BUSINESS_INFO_STEP_KEYS.INCORPORATION_DATE]} shouldShowRightIcon onPress={function () {
            onMove(BUSINESS_INFO_STEP_INDEXES.INCORPORATION_DATE);
        }}/>
            <MenuItemWithTopDescription_1.default description={translate('businessInfoStep.incorporationState')} title={translate("allStates.".concat(values[BUSINESS_INFO_STEP_KEYS.INCORPORATION_STATE], ".stateName"))} shouldShowRightIcon onPress={function () {
            onMove(BUSINESS_INFO_STEP_INDEXES.INCORPORATION_STATE);
        }}/>
            <MenuItemWithTopDescription_1.default description={translate('companyStep.industryClassificationCode')} title={values[BUSINESS_INFO_STEP_KEYS.INCORPORATION_CODE]} shouldShowRightIcon onPress={function () {
            onMove(BUSINESS_INFO_STEP_INDEXES.INCORPORATION_CODE);
        }}/>
            <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} validate={validate} onSubmit={onNext} scrollContextEnabled submitButtonText={translate('common.confirm')} style={[styles.mh5, styles.flexGrow1]} enabledWhenOffline={false} shouldHideFixErrorsAlert>
                <InputWrapper_1.default InputComponent={CheckboxWithLabel_1.default} aria-label={"".concat(translate('businessInfoStep.confirmCompanyIsNot'), " ").concat(translate('businessInfoStep.listOfRestrictedBusinesses'))} inputID={BUSINESS_INFO_STEP_KEYS.HAS_NO_CONNECTION_TO_CANNABIS} defaultValue={defaultCheckboxState} LabelComponent={ConfirmCompanyLabel} style={[styles.mt3]} shouldSaveDraft/>
            </FormProvider_1.default>
        </ScrollView_1.default>);
}
ConfirmationBusiness.displayName = 'ConfirmationBusiness';
exports.default = ConfirmationBusiness;
