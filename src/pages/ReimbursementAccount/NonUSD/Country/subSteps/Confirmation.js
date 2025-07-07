"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var PushRowWithModal_1 = require("@components/PushRowWithModal");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var mapCurrencyToCountry_1 = require("@pages/ReimbursementAccount/utils/mapCurrencyToCountry");
var FormActions_1 = require("@userActions/FormActions");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var COUNTRY = ReimbursementAccountForm_1.default.ADDITIONAL_DATA.COUNTRY;
function Confirmation(_a) {
    var _b, _c, _d, _e;
    var onNext = _a.onNext, policyID = _a.policyID;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { canBeMissing: false })[0];
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, { canBeMissing: true })[0];
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), { canBeMissing: false })[0];
    var currency = (_b = policy === null || policy === void 0 ? void 0 : policy.outputCurrency) !== null && _b !== void 0 ? _b : '';
    var shouldAllowChange = currency === CONST_1.default.CURRENCY.EUR;
    var currencyMappedToCountry = (0, mapCurrencyToCountry_1.default)(currency);
    var countryDefaultValue = (_e = (_c = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[COUNTRY]) !== null && _c !== void 0 ? _c : (_d = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _d === void 0 ? void 0 : _d[COUNTRY]) !== null && _e !== void 0 ? _e : '';
    var _f = (0, react_1.useState)(countryDefaultValue), selectedCountry = _f[0], setSelectedCountry = _f[1];
    var disableSubmit = !(currency in CONST_1.default.CURRENCY);
    var handleSettingsPress = function () {
        if (!policyID) {
            return;
        }
        (0, Policy_1.setIsComingFromGlobalReimbursementsFlow)(true);
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_OVERVIEW.getRoute(policyID));
    };
    var handleSubmit = function () {
        var _a;
        (0, FormActions_1.setDraftValues)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM, (_a = {}, _a[COUNTRY] = selectedCountry, _a));
        onNext();
    };
    var validate = (0, react_1.useCallback)(function (values) {
        return (0, ValidationUtils_1.getFieldRequiredErrors)(values, [COUNTRY]);
    }, []);
    (0, react_1.useEffect)(function () {
        (0, FormActions_1.clearErrors)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM);
    });
    (0, react_1.useEffect)(function () {
        if (currency === CONST_1.default.CURRENCY.EUR) {
            return;
        }
        setSelectedCountry(currencyMappedToCountry);
    }, [currency, currencyMappedToCountry]);
    return (<FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} submitButtonText={translate('common.confirm')} validate={validate} onSubmit={handleSubmit} style={[styles.flexGrow1]} submitButtonStyles={[styles.mh5, styles.pb0]} isSubmitDisabled={disableSubmit} shouldHideFixErrorsAlert>
            <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mb3]}>{translate('countryStep.confirmBusinessBank')}</Text_1.default>
            <MenuItemWithTopDescription_1.default description={translate('common.currency')} title={currency} interactive={false}/>
            <Text_1.default style={[styles.ph5, styles.mb3, styles.mutedTextLabel]}>
                {"".concat(translate('countryStep.yourBusiness'), " ").concat(translate('countryStep.youCanChange'))}{' '}
                <TextLink_1.default style={[styles.label]} onPress={handleSettingsPress}>
                    {translate('common.settings').toLowerCase()}.
                </TextLink_1.default>
            </Text_1.default>
            <InputWrapper_1.default InputComponent={PushRowWithModal_1.default} optionsList={shouldAllowChange ? CONST_1.default.ALL_EUROPEAN_UNION_COUNTRIES : CONST_1.default.ALL_COUNTRIES} onValueChange={function (value) { return setSelectedCountry(value); }} description={translate('common.country')} modalHeaderTitle={translate('countryStep.selectCountry')} searchInputTitle={translate('countryStep.findCountry')} shouldAllowChange={shouldAllowChange} value={selectedCountry} inputID={COUNTRY} shouldSaveDraft={false}/>
        </FormProvider_1.default>);
}
Confirmation.displayName = 'Confirmation';
exports.default = Confirmation;
