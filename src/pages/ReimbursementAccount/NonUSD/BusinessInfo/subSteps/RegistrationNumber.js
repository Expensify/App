"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useReimbursementAccountStepFormSubmit_1 = require("@hooks/useReimbursementAccountStepFormSubmit");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var _a = ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY, BUSINESS_REGISTRATION_INCORPORATION_NUMBER = _a.BUSINESS_REGISTRATION_INCORPORATION_NUMBER, COMPANY_COUNTRY_CODE = _a.COMPANY_COUNTRY_CODE;
var STEP_FIELDS = [BUSINESS_REGISTRATION_INCORPORATION_NUMBER];
function RegistrationNumber(_a) {
    var _b, _c, _d, _e, _f, _g, _h;
    var onNext = _a.onNext, isEditing = _a.isEditing;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT)[0];
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT)[0];
    var defaultValue = (_d = (_c = (_b = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _b === void 0 ? void 0 : _b.corpay) === null || _c === void 0 ? void 0 : _c[BUSINESS_REGISTRATION_INCORPORATION_NUMBER]) !== null && _d !== void 0 ? _d : '';
    var businessStepCountryDraftValue = (_h = (_g = (_f = (_e = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _e === void 0 ? void 0 : _e.corpay) === null || _f === void 0 ? void 0 : _f[COMPANY_COUNTRY_CODE]) !== null && _g !== void 0 ? _g : reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[COMPANY_COUNTRY_CODE]) !== null && _h !== void 0 ? _h : '';
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = (0, ValidationUtils_1.getFieldRequiredErrors)(values, STEP_FIELDS);
        if (values[BUSINESS_REGISTRATION_INCORPORATION_NUMBER] && !(0, ValidationUtils_1.isValidRegistrationNumber)(values[BUSINESS_REGISTRATION_INCORPORATION_NUMBER], businessStepCountryDraftValue)) {
            errors[BUSINESS_REGISTRATION_INCORPORATION_NUMBER] = translate('businessInfoStep.error.registrationNumber');
        }
        return errors;
    }, [businessStepCountryDraftValue, translate]);
    var handleSubmit = (0, useReimbursementAccountStepFormSubmit_1.default)({
        fieldIds: STEP_FIELDS,
        onNext: onNext,
        shouldSaveDraft: isEditing,
    });
    return (<FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')} onSubmit={handleSubmit} validate={validate} style={[styles.mh5, styles.flexGrow1]} shouldHideFixErrorsAlert>
            <Text_1.default style={[styles.textHeadlineLineHeightXXL]}>{translate('businessInfoStep.whatsTheBusinessRegistrationNumber')}</Text_1.default>
            <InputWrapper_1.default InputComponent={TextInput_1.default} label={translate('businessInfoStep.registrationNumber')} aria-label={translate('businessInfoStep.registrationNumber')} role={CONST_1.default.ROLE.PRESENTATION} inputID={BUSINESS_REGISTRATION_INCORPORATION_NUMBER} containerStyles={[styles.mt6]} defaultValue={defaultValue} shouldSaveDraft={!isEditing} autoFocus/>
            <react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.mt6]}>
                <Icon_1.default src={Expensicons.QuestionMark} width={12} height={12} fill={theme.icon}/>
                <react_native_1.View style={[styles.ml2, styles.dFlex, styles.flexRow]}>
                    <TextLink_1.default style={[styles.textMicro]} href={CONST_1.default.HELP_LINK_URL}>
                        {translate('businessInfoStep.whatsThisNumber')}
                    </TextLink_1.default>
                </react_native_1.View>
            </react_native_1.View>
        </FormProvider_1.default>);
}
RegistrationNumber.displayName = 'RegistrationNumber';
exports.default = RegistrationNumber;
