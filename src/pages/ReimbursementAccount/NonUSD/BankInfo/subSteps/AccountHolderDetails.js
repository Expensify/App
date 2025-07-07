"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var AddressSearch_1 = require("@components/AddressSearch");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var PushRowWithModal_1 = require("@components/PushRowWithModal");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useReimbursementAccountStepFormSubmit_1 = require("@hooks/useReimbursementAccountStepFormSubmit");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var getBankInfoStepValues_1 = require("@pages/ReimbursementAccount/NonUSD/utils/getBankInfoStepValues");
var getInputForValueSet_1 = require("@pages/ReimbursementAccount/NonUSD/utils/getInputForValueSet");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var ACCOUNT_HOLDER_COUNTRY = ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY.ACCOUNT_HOLDER_COUNTRY;
var _a = ReimbursementAccountForm_1.default.ADDITIONAL_DATA, COUNTRY = _a.COUNTRY, ACCOUNT_HOLDER_NAME = _a.ACCOUNT_HOLDER_NAME;
function getInputComponent(field) {
    if (CONST_1.default.CORPAY_FIELDS.SPECIAL_LIST_ADDRESS_KEYS.includes(field.id)) {
        return AddressSearch_1.default;
    }
    return TextInput_1.default;
}
function AccountHolderDetails(_a) {
    var _b, _c, _d, _e;
    var onNext = _a.onNext, isEditing = _a.isEditing, corpayFields = _a.corpayFields;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var accountHolderDetailsFields = (0, react_1.useMemo)(function () {
        var _a;
        return (_a = corpayFields === null || corpayFields === void 0 ? void 0 : corpayFields.formFields) === null || _a === void 0 ? void 0 : _a.filter(function (field) { return field.id.includes(CONST_1.default.NON_USD_BANK_ACCOUNT.BANK_INFO_STEP_ACCOUNT_HOLDER_KEY_PREFIX); });
    }, [corpayFields]);
    var fieldIds = accountHolderDetailsFields === null || accountHolderDetailsFields === void 0 ? void 0 : accountHolderDetailsFields.map(function (field) { return field.id; });
    var subStepKeys = accountHolderDetailsFields === null || accountHolderDetailsFields === void 0 ? void 0 : accountHolderDetailsFields.reduce(function (acc, field) {
        acc[field.id] = field.id;
        return acc;
    }, {});
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { canBeMissing: false })[0];
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, { canBeMissing: true })[0];
    var defaultValues = (0, react_1.useMemo)(function () { return (0, getBankInfoStepValues_1.getBankInfoStepValues)(subStepKeys !== null && subStepKeys !== void 0 ? subStepKeys : {}, reimbursementAccountDraft, reimbursementAccount); }, [subStepKeys, reimbursementAccount, reimbursementAccountDraft]);
    var defaultBankAccountCountry = (_d = (_c = (_b = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _b === void 0 ? void 0 : _b[COUNTRY]) !== null && _c !== void 0 ? _c : reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[COUNTRY]) !== null && _d !== void 0 ? _d : '';
    var handleSubmit = (0, useReimbursementAccountStepFormSubmit_1.default)({
        fieldIds: fieldIds,
        onNext: onNext,
        shouldSaveDraft: true,
    });
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = {};
        accountHolderDetailsFields === null || accountHolderDetailsFields === void 0 ? void 0 : accountHolderDetailsFields.forEach(function (field) {
            var fieldID = field.id;
            if (field.isRequired && !values[fieldID]) {
                errors[fieldID] = translate('common.error.fieldRequired');
            }
            field.validationRules.forEach(function (rule) {
                if (!rule.regEx) {
                    return;
                }
                if (new RegExp(rule.regEx).test(values[fieldID] ? String(values[fieldID]) : '')) {
                    return;
                }
                errors[fieldID] = rule.errorMessage;
            });
        });
        return errors;
    }, [accountHolderDetailsFields, translate]);
    var inputs = (0, react_1.useMemo)(function () {
        return accountHolderDetailsFields === null || accountHolderDetailsFields === void 0 ? void 0 : accountHolderDetailsFields.map(function (field) {
            var _a;
            if (field.valueSet !== undefined) {
                return (0, getInputForValueSet_1.default)(field, String(defaultValues[field.id]), isEditing, styles);
            }
            if (field.id === ACCOUNT_HOLDER_COUNTRY) {
                return (<react_native_1.View style={[styles.mb6, styles.mhn5]} key={field.id}>
                        <InputWrapper_1.default InputComponent={PushRowWithModal_1.default} optionsList={CONST_1.default.ALL_COUNTRIES} description={field.label} shouldSaveDraft={!isEditing} defaultValue={String(defaultValues[field.id] !== '' ? defaultValues[field.id] : defaultBankAccountCountry)} modalHeaderTitle={translate('countryStep.selectCountry')} searchInputTitle={translate('countryStep.findCountry')} inputID={field.id}/>
                    </react_native_1.View>);
            }
            return (<react_native_1.View style={styles.mb6} key={field.id}>
                    <InputWrapper_1.default InputComponent={getInputComponent(field)} inputID={field.id} label={field.label} aria-label={field.label} role={CONST_1.default.ROLE.PRESENTATION} defaultValue={(_a = String(defaultValues[field.id])) !== null && _a !== void 0 ? _a : ''} shouldSaveDraft={!isEditing} limitSearchesToCountry={defaultValues.accountHolderCountry || defaultBankAccountCountry} renamedInputKeys={{
                    street: 'accountHolderAddress1',
                    city: 'accountHolderCity',
                }} hint={field.id === ACCOUNT_HOLDER_NAME ? translate('bankInfoStep.accountHolderNameDescription') : undefined}/>
                </react_native_1.View>);
        });
    }, [accountHolderDetailsFields, styles, defaultValues, isEditing, defaultBankAccountCountry, translate]);
    return (<FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')} validate={validate} onSubmit={handleSubmit} style={[styles.mh5, styles.flexGrow1]} shouldHideFixErrorsAlert={((_e = accountHolderDetailsFields === null || accountHolderDetailsFields === void 0 ? void 0 : accountHolderDetailsFields.length) !== null && _e !== void 0 ? _e : 0) <= 1}>
            <react_native_1.View>
                <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.mb6]}>{translate('bankInfoStep.whatAreYour')}</Text_1.default>
                {inputs}
            </react_native_1.View>
        </FormProvider_1.default>);
}
AccountHolderDetails.displayName = 'AccountHolderDetails';
exports.default = AccountHolderDetails;
