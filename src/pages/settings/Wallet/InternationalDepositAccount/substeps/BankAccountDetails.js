"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var CurrencyPicker_1 = require("@components/CurrencyPicker");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var TextInput_1 = require("@components/TextInput");
var TextLink_1 = require("@components/TextLink");
var ValuePicker_1 = require("@components/ValuePicker");
var useInternationalBankAccountFormSubmit_1 = require("@hooks/useInternationalBankAccountFormSubmit");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var utils_1 = require("@pages/settings/Wallet/InternationalDepositAccount/utils");
var BankAccounts_1 = require("@userActions/BankAccounts");
var Text_1 = require("@src/components/Text");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function BankAccountDetails(_a) {
    var _b, _c;
    var isEditing = _a.isEditing, onNext = _a.onNext, resetScreenIndex = _a.resetScreenIndex, formValues = _a.formValues, fieldsMap = _a.fieldsMap;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var handleSubmit = (0, useInternationalBankAccountFormSubmit_1.default)({
        fieldIds: Object.keys((_b = fieldsMap[CONST_1.default.CORPAY_FIELDS.STEPS_NAME.BANK_ACCOUNT_DETAILS]) !== null && _b !== void 0 ? _b : {}),
        onNext: onNext,
        shouldSaveDraft: isEditing,
    });
    var onCurrencySelected = (0, react_1.useCallback)(function (value) {
        if (formValues.bankCurrency === value) {
            return;
        }
        (0, BankAccounts_1.fetchCorpayFields)(formValues.bankCountry, value);
        resetScreenIndex === null || resetScreenIndex === void 0 ? void 0 : resetScreenIndex(CONST_1.default.CORPAY_FIELDS.INDEXES.MAPPING.BANK_ACCOUNT_DETAILS);
    }, [formValues.bankCountry, formValues.bankCurrency, resetScreenIndex]);
    var validate = (0, react_1.useCallback)(function (values) {
        return (0, utils_1.getValidationErrors)(values, fieldsMap[CONST_1.default.CORPAY_FIELDS.STEPS_NAME.BANK_ACCOUNT_DETAILS], translate);
    }, [fieldsMap, translate]);
    var currencyHeaderContent = (<react_native_1.View style={styles.ph5}>
            <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.mb3]}>{translate('addPersonalBankAccount.currencyHeader')}</Text_1.default>
        </react_native_1.View>);
    return (<FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM} submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')} onSubmit={handleSubmit} validate={validate} style={[styles.flexGrow1, styles.mt3]} submitButtonStyles={[styles.ph5, styles.mb0]} enabledWhenOffline>
            <react_native_1.View style={styles.ph5}>
                <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.mb6]}>{translate('addPersonalBankAccount.accountDetailsStepHeader')}</Text_1.default>
                <react_native_1.View style={[styles.mhn5]}>
                    <CurrencyPicker_1.default label={translate('common.currency')} value={formValues.bankCurrency} onInputChange={onCurrencySelected} headerContent={currencyHeaderContent} excludeCurrencies={CONST_1.default.CORPAY_FIELDS.EXCLUDED_CURRENCIES} disabled={isOffline} shouldShowFullPageOfflineView/>
                </react_native_1.View>
                {Object.values((_c = fieldsMap[CONST_1.default.CORPAY_FIELDS.STEPS_NAME.BANK_ACCOUNT_DETAILS]) !== null && _c !== void 0 ? _c : {}).map(function (field) {
            var _a, _b, _c;
            return (<react_native_1.View style={((_a = field.valueSet) !== null && _a !== void 0 ? _a : []).length > 0 ? [styles.mhn5, styles.pv1] : [styles.pv2]} key={field.id}>
                        <InputWrapper_1.default InputComponent={((_b = field.valueSet) !== null && _b !== void 0 ? _b : []).length > 0 ? ValuePicker_1.default : TextInput_1.default} inputID={field.id} defaultValue={formValues[field.id]} label={field.label + (field.isRequired ? '' : " (".concat(translate('common.optional'), ")"))} items={((_c = field.valueSet) !== null && _c !== void 0 ? _c : []).map(function (_a) {
                var id = _a.id, text = _a.text;
                return ({ value: id, label: text });
            })} shouldSaveDraft={!isEditing}/>
                    </react_native_1.View>);
        })}
                <react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.mt4]}>
                    <Icon_1.default src={Expensicons.QuestionMark} width={12} height={12} fill={theme.icon}/>
                    <react_native_1.View style={[styles.ml2, styles.dFlex, styles.flexRow]}>
                        <TextLink_1.default style={[styles.textMicro]} href={CONST_1.default.ENCRYPTION_AND_SECURITY_HELP_URL}>
                            {translate('addPersonalBankAccount.howDoWeProtectYourData')}
                        </TextLink_1.default>
                    </react_native_1.View>
                </react_native_1.View>
            </react_native_1.View>
        </FormProvider_1.default>);
}
BankAccountDetails.displayName = 'BankAccountDetails';
exports.default = BankAccountDetails;
