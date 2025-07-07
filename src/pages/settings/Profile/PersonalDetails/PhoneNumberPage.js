"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var DelegateNoAccessWrapper_1 = require("@components/DelegateNoAccessWrapper");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var TextInput_1 = require("@components/TextInput");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var LoginUtils_1 = require("@libs/LoginUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var PersonalDetails_1 = require("@userActions/PersonalDetails");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var PersonalDetailsForm_1 = require("@src/types/form/PersonalDetailsForm");
function PhoneNumberPage() {
    var _a, _b;
    var privatePersonalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PRIVATE_PERSONAL_DETAILS)[0];
    var isLoadingApp = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_LOADING_APP, { initialValue: true })[0];
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var phoneNumber = (_a = privatePersonalDetails === null || privatePersonalDetails === void 0 ? void 0 : privatePersonalDetails.phoneNumber) !== null && _a !== void 0 ? _a : '';
    var validateLoginError = (0, ErrorUtils_1.getEarliestErrorField)(privatePersonalDetails, 'phoneNumber');
    var currenPhoneNumber = (_b = privatePersonalDetails === null || privatePersonalDetails === void 0 ? void 0 : privatePersonalDetails.phoneNumber) !== null && _b !== void 0 ? _b : '';
    var updatePhoneNumber = function (values) {
        var _a;
        // Clear the error when the user tries to submit the form
        if (validateLoginError) {
            (0, PersonalDetails_1.clearPhoneNumberError)();
        }
        // Only call the API if the user has changed their phone number
        if ((values === null || values === void 0 ? void 0 : values.phoneNumber) && phoneNumber !== values.phoneNumber) {
            (0, PersonalDetails_1.updatePhoneNumber)((_a = (0, LoginUtils_1.formatE164PhoneNumber)(values.phoneNumber)) !== null && _a !== void 0 ? _a : '', currenPhoneNumber);
        }
        Navigation_1.default.goBack();
    };
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = {};
        var phoneNumberValue = values[PersonalDetailsForm_1.default.PHONE_NUMBER];
        if (!(0, ValidationUtils_1.isRequiredFulfilled)(phoneNumberValue)) {
            errors[PersonalDetailsForm_1.default.PHONE_NUMBER] = translate('common.error.fieldRequired');
            return errors;
        }
        var phoneNumberWithCountryCode = (0, LoginUtils_1.appendCountryCode)(phoneNumberValue);
        if (!(0, ValidationUtils_1.isValidPhoneNumber)(phoneNumberWithCountryCode)) {
            errors[PersonalDetailsForm_1.default.PHONE_NUMBER] = translate('common.error.phoneNumber');
            return errors;
        }
        if (validateLoginError && Object.keys(errors).length > 0) {
            (0, PersonalDetails_1.clearPhoneNumberError)();
        }
        return errors;
    }, [translate, validateLoginError]);
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom shouldEnableMaxHeight testID={PhoneNumberPage.displayName}>
            <DelegateNoAccessWrapper_1.default accessDeniedVariants={[CONST_1.default.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButton_1.default title={translate('common.phoneNumber')} onBackButtonPress={function () { return Navigation_1.default.goBack(); }}/>
                {isLoadingApp ? (<FullscreenLoadingIndicator_1.default style={[styles.flex1, styles.pRelative]}/>) : (<FormProvider_1.default style={[styles.flexGrow1, styles.ph5]} formID={ONYXKEYS_1.default.FORMS.PERSONAL_DETAILS_FORM} validate={validate} onSubmit={updatePhoneNumber} submitButtonText={translate('common.save')} enabledWhenOffline shouldHideFixErrorsAlert>
                        <OfflineWithFeedback_1.default errors={validateLoginError} errorRowStyles={styles.mt2} onClose={function () { return (0, PersonalDetails_1.clearPhoneNumberError)(); }}>
                            <InputWrapper_1.default InputComponent={TextInput_1.default} ref={inputCallbackRef} inputID={PersonalDetailsForm_1.default.PHONE_NUMBER} name="legalFirstName" label={translate('common.phoneNumber')} aria-label={translate('common.phoneNumber')} role={CONST_1.default.ROLE.PRESENTATION} defaultValue={phoneNumber} spellCheck={false} onBlur={function () {
                if (!validateLoginError) {
                    return;
                }
                (0, PersonalDetails_1.clearPhoneNumberError)();
            }}/>
                        </OfflineWithFeedback_1.default>
                    </FormProvider_1.default>)}
            </DelegateNoAccessWrapper_1.default>
        </ScreenWrapper_1.default>);
}
PhoneNumberPage.displayName = 'PhoneNumberPage';
exports.default = PhoneNumberPage;
