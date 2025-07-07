"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONST_1 = require("expensify-common/dist/CONST");
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
var getSubStepValues_1 = require("@pages/ReimbursementAccount/utils/getSubStepValues");
var CONST_2 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var _a = ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY, FORMATION_INCORPORATION_COUNTRY_CODE = _a.FORMATION_INCORPORATION_COUNTRY_CODE, FORMATION_INCORPORATION_STATE = _a.FORMATION_INCORPORATION_STATE, COMPANY_COUNTRY_CODE = _a.COMPANY_COUNTRY_CODE, COMPANY_STATE = _a.COMPANY_STATE;
var STEP_FIELDS = [FORMATION_INCORPORATION_COUNTRY_CODE, FORMATION_INCORPORATION_STATE];
var PROVINCES_LIST_OPTIONS = Object.keys(CONST_1.CONST.PROVINCES).reduce(function (acc, key) {
    acc[CONST_1.CONST.PROVINCES[key].provinceISO] = CONST_1.CONST.PROVINCES[key].provinceName;
    return acc;
}, {});
var STATES_LIST_OPTIONS = Object.keys(CONST_1.CONST.STATES).reduce(function (acc, key) {
    acc[CONST_1.CONST.STATES[key].stateISO] = CONST_1.CONST.STATES[key].stateName;
    return acc;
}, {});
var isCountryWithSelectableState = function (countryCode) { return countryCode === CONST_2.default.COUNTRY.US || countryCode === CONST_2.default.COUNTRY.CA; };
function IncorporationLocation(_a) {
    var onNext = _a.onNext, isEditing = _a.isEditing;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT)[0];
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT)[0];
    var onyxValues = (0, react_1.useMemo)(function () {
        return (0, getSubStepValues_1.default)({ FORMATION_INCORPORATION_COUNTRY_CODE: FORMATION_INCORPORATION_COUNTRY_CODE, FORMATION_INCORPORATION_STATE: FORMATION_INCORPORATION_STATE, COMPANY_COUNTRY: COMPANY_COUNTRY_CODE, COMPANY_STATE: COMPANY_STATE }, reimbursementAccountDraft, reimbursementAccount);
    }, [reimbursementAccount, reimbursementAccountDraft]);
    var incorporationCountryInitialValue = onyxValues[FORMATION_INCORPORATION_COUNTRY_CODE] !== '' ? onyxValues[FORMATION_INCORPORATION_COUNTRY_CODE] : onyxValues[COMPANY_COUNTRY_CODE];
    var businessAddressStateDefaultValue = isCountryWithSelectableState(onyxValues[COMPANY_COUNTRY_CODE]) ? onyxValues[COMPANY_STATE] : '';
    var incorporationStateInitialValue = onyxValues[FORMATION_INCORPORATION_STATE] !== '' ? onyxValues[FORMATION_INCORPORATION_STATE] : businessAddressStateDefaultValue;
    var _b = (0, react_1.useState)(incorporationCountryInitialValue), selectedCountry = _b[0], setSelectedCountry = _b[1];
    var _c = (0, react_1.useState)(incorporationStateInitialValue), selectedState = _c[0], setSelectedState = _c[1];
    var shouldGatherState = isCountryWithSelectableState(selectedCountry);
    var validate = (0, react_1.useCallback)(function (values) {
        return (0, ValidationUtils_1.getFieldRequiredErrors)(values, shouldGatherState ? STEP_FIELDS : [FORMATION_INCORPORATION_COUNTRY_CODE]);
    }, [shouldGatherState]);
    var handleSubmit = (0, useReimbursementAccountStepFormSubmit_1.default)({
        fieldIds: STEP_FIELDS,
        onNext: onNext,
        shouldSaveDraft: true,
    });
    var handleSelectingCountry = function (country) {
        setSelectedCountry(typeof country === 'string' ? country : '');
        setSelectedState('');
    };
    var handleSelectingState = function (state) {
        setSelectedState(typeof state === 'string' ? state : '');
    };
    return (<FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')} onSubmit={handleSubmit} validate={validate} style={[styles.flexGrow1]} submitButtonStyles={[styles.mh5]} shouldHideFixErrorsAlert={!shouldGatherState}>
            <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.mh5, styles.mb3]}>{translate('businessInfoStep.whereWasTheBusinessIncorporated')}</Text_1.default>
            {shouldGatherState && (<InputWrapper_1.default InputComponent={PushRowWithModal_1.default} optionsList={selectedCountry === CONST_2.default.COUNTRY.US ? STATES_LIST_OPTIONS : PROVINCES_LIST_OPTIONS} description={translate('businessInfoStep.incorporationState')} modalHeaderTitle={translate('businessInfoStep.selectIncorporationState')} searchInputTitle={translate('businessInfoStep.findIncorporationState')} inputID={FORMATION_INCORPORATION_STATE} shouldSaveDraft={!isEditing} value={selectedState} onValueChange={handleSelectingState}/>)}
            <InputWrapper_1.default InputComponent={PushRowWithModal_1.default} optionsList={CONST_2.default.ALL_COUNTRIES} onValueChange={handleSelectingCountry} description={translate('businessInfoStep.incorporationCountry')} modalHeaderTitle={translate('countryStep.selectCountry')} searchInputTitle={translate('countryStep.findCountry')} inputID={FORMATION_INCORPORATION_COUNTRY_CODE} shouldSaveDraft={!isEditing} defaultValue={incorporationCountryInitialValue}/>
        </FormProvider_1.default>);
}
IncorporationLocation.displayName = 'IncorporationLocation';
exports.default = IncorporationLocation;
