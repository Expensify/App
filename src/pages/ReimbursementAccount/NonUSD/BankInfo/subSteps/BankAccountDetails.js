"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var AddressSearch_1 = require("@components/AddressSearch");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useReimbursementAccountStepFormSubmit_1 = require("@hooks/useReimbursementAccountStepFormSubmit");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var getBankInfoStepValues_1 = require("@pages/ReimbursementAccount/NonUSD/utils/getBankInfoStepValues");
var getInputForValueSet_1 = require("@pages/ReimbursementAccount/NonUSD/utils/getInputForValueSet");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function getInputComponent(field) {
    if (CONST_1.default.CORPAY_FIELDS.SPECIAL_LIST_ADDRESS_KEYS.includes(field.id)) {
        return AddressSearch_1.default;
    }
    return TextInput_1.default;
}
function BankAccountDetails(_a) {
    var _b;
    var onNext = _a.onNext, isEditing = _a.isEditing, corpayFields = _a.corpayFields;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { canBeMissing: false })[0];
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, { canBeMissing: true })[0];
    var bankAccountDetailsFields = (0, react_1.useMemo)(function () {
        var _a;
        return (_a = corpayFields === null || corpayFields === void 0 ? void 0 : corpayFields.formFields) === null || _a === void 0 ? void 0 : _a.filter(function (field) { return !field.id.includes(CONST_1.default.NON_USD_BANK_ACCOUNT.BANK_INFO_STEP_ACCOUNT_HOLDER_KEY_PREFIX); });
    }, [corpayFields]);
    var subStepKeys = bankAccountDetailsFields === null || bankAccountDetailsFields === void 0 ? void 0 : bankAccountDetailsFields.reduce(function (acc, field) {
        acc[field.id] = field.id;
        return acc;
    }, {});
    var defaultValues = (0, react_1.useMemo)(function () { return (0, getBankInfoStepValues_1.getBankInfoStepValues)(subStepKeys !== null && subStepKeys !== void 0 ? subStepKeys : {}, reimbursementAccountDraft, reimbursementAccount); }, [reimbursementAccount, reimbursementAccountDraft, subStepKeys]);
    var fieldIds = bankAccountDetailsFields === null || bankAccountDetailsFields === void 0 ? void 0 : bankAccountDetailsFields.map(function (field) { return field.id; });
    var validate = (0, react_1.useCallback)(function (values) {
        var _a;
        var errors = {};
        (_a = corpayFields === null || corpayFields === void 0 ? void 0 : corpayFields.formFields) === null || _a === void 0 ? void 0 : _a.forEach(function (field) {
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
    }, [corpayFields, translate]);
    var handleSubmit = (0, useReimbursementAccountStepFormSubmit_1.default)({
        fieldIds: fieldIds,
        onNext: onNext,
        shouldSaveDraft: isEditing,
    });
    var inputs = (0, react_1.useMemo)(function () {
        return bankAccountDetailsFields === null || bankAccountDetailsFields === void 0 ? void 0 : bankAccountDetailsFields.map(function (field) {
            var _a;
            if (field.valueSet !== undefined) {
                return (0, getInputForValueSet_1.default)(field, String(defaultValues[field.id]), isEditing, styles);
            }
            return (<react_native_1.View style={styles.mb6} key={field.id}>
                    <InputWrapper_1.default InputComponent={getInputComponent(field)} inputID={field.id} label={field.label} aria-label={field.label} role={CONST_1.default.ROLE.PRESENTATION} shouldSaveDraft={!isEditing} defaultValue={(_a = String(defaultValues[field.id])) !== null && _a !== void 0 ? _a : ''} limitSearchesToCountry={reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft.country} renamedInputKeys={{
                    street: 'bankAddressLine1',
                    city: 'bankCity',
                    country: '',
                }}/>
                </react_native_1.View>);
        });
    }, [bankAccountDetailsFields, styles, isEditing, defaultValues, reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft.country]);
    return (<FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')} onSubmit={handleSubmit} validate={validate} style={[styles.mh5, styles.flexGrow1]} isSubmitDisabled={!inputs} shouldHideFixErrorsAlert={((_b = bankAccountDetailsFields === null || bankAccountDetailsFields === void 0 ? void 0 : bankAccountDetailsFields.length) !== null && _b !== void 0 ? _b : 0) <= 1}>
            <>
                <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.mb6]}>{translate('bankInfoStep.whatAreYour')}</Text_1.default>
                {(corpayFields === null || corpayFields === void 0 ? void 0 : corpayFields.isLoading) ? (<react_native_1.View style={[styles.flexGrow4, styles.alignItemsCenter]}>
                        <react_native_1.ActivityIndicator size={CONST_1.default.ACTIVITY_INDICATOR_SIZE.LARGE} color={theme.spinner} style={styles.flexGrow1}/>
                    </react_native_1.View>) : (inputs)}
            </>
        </FormProvider_1.default>);
}
BankAccountDetails.displayName = 'BankAccountDetails';
exports.default = BankAccountDetails;
