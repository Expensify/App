"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var date_fns_1 = require("date-fns");
var react_1 = require("react");
var DatePicker_1 = require("@components/DatePicker");
var DelegateNoAccessWrapper_1 = require("@components/DelegateNoAccessWrapper");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var PersonalDetails_1 = require("@userActions/PersonalDetails");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var DateOfBirthForm_1 = require("@src/types/form/DateOfBirthForm");
function DateOfBirthPage() {
    var _a;
    var privatePersonalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PRIVATE_PERSONAL_DETAILS)[0];
    var isLoadingApp = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_LOADING_APP, { initialValue: true })[0];
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    /**
     * @returns An object containing the errors for each inputID
     */
    var validate = (0, react_1.useCallback)(function (values) {
        var _a;
        var requiredFields = ['dob'];
        var errors = (0, ValidationUtils_1.getFieldRequiredErrors)(values, requiredFields);
        var minimumAge = CONST_1.default.DATE_BIRTH.MIN_AGE;
        var maximumAge = CONST_1.default.DATE_BIRTH.MAX_AGE;
        var dateError = (0, ValidationUtils_1.getAgeRequirementError)((_a = values.dob) !== null && _a !== void 0 ? _a : '', minimumAge, maximumAge);
        if (values.dob && dateError) {
            errors.dob = dateError;
        }
        return errors;
    }, []);
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom testID={DateOfBirthPage.displayName}>
            <DelegateNoAccessWrapper_1.default accessDeniedVariants={[CONST_1.default.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButton_1.default title={translate('common.dob')} onBackButtonPress={function () { return Navigation_1.default.goBack(); }}/>
                {isLoadingApp ? (<FullscreenLoadingIndicator_1.default style={[styles.flex1, styles.pRelative]}/>) : (<FormProvider_1.default style={[styles.flexGrow1, styles.ph5]} formID={ONYXKEYS_1.default.FORMS.DATE_OF_BIRTH_FORM} validate={validate} onSubmit={PersonalDetails_1.updateDateOfBirth} submitButtonText={translate('common.save')} enabledWhenOffline shouldHideFixErrorsAlert>
                        <InputWrapper_1.default InputComponent={DatePicker_1.default} inputID={DateOfBirthForm_1.default.DOB} label={translate('common.date')} defaultValue={(_a = privatePersonalDetails === null || privatePersonalDetails === void 0 ? void 0 : privatePersonalDetails.dob) !== null && _a !== void 0 ? _a : ''} minDate={(0, date_fns_1.subYears)(new Date(), CONST_1.default.DATE_BIRTH.MAX_AGE)} maxDate={(0, date_fns_1.subYears)(new Date(), CONST_1.default.DATE_BIRTH.MIN_AGE)} autoFocus/>
                    </FormProvider_1.default>)}
            </DelegateNoAccessWrapper_1.default>
        </ScreenWrapper_1.default>);
}
DateOfBirthPage.displayName = 'DateOfBirthPage';
exports.default = DateOfBirthPage;
