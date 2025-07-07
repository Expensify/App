"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var withCurrentUserPersonalDetails_1 = require("@components/withCurrentUserPersonalDetails");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ErrorUtils = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ValidationUtils = require("@libs/ValidationUtils");
var PersonalDetails = require("@userActions/PersonalDetails");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var DisplayNameForm_1 = require("@src/types/form/DisplayNameForm");
/**
 * Submit form to update user's first and last name (and display name)
 */
var updateDisplayName = function (values) {
    PersonalDetails.updateDisplayName(values.firstName.trim(), values.lastName.trim());
    Navigation_1.default.goBack();
};
function DisplayNamePage(_a) {
    var _b, _c;
    var currentUserPersonalDetails = _a.currentUserPersonalDetails;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var isLoadingApp = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_LOADING_APP, { initialValue: true })[0];
    var currentUserDetails = currentUserPersonalDetails !== null && currentUserPersonalDetails !== void 0 ? currentUserPersonalDetails : {};
    var validate = function (values) {
        var errors = {};
        // First we validate the first name field
        if (!ValidationUtils.isValidDisplayName(values.firstName)) {
            ErrorUtils.addErrorMessage(errors, 'firstName', translate('personalDetails.error.hasInvalidCharacter'));
        }
        else if (values.firstName.length > CONST_1.default.TITLE_CHARACTER_LIMIT) {
            ErrorUtils.addErrorMessage(errors, 'firstName', translate('common.error.characterLimitExceedCounter', { length: values.firstName.length, limit: CONST_1.default.TITLE_CHARACTER_LIMIT }));
        }
        else if (values.firstName.length === 0) {
            ErrorUtils.addErrorMessage(errors, 'firstName', translate('personalDetails.error.requiredFirstName'));
        }
        if (ValidationUtils.doesContainReservedWord(values.firstName, CONST_1.default.DISPLAY_NAME.RESERVED_NAMES)) {
            ErrorUtils.addErrorMessage(errors, 'firstName', translate('personalDetails.error.containsReservedWord'));
        }
        // Then we validate the last name field
        if (!ValidationUtils.isValidDisplayName(values.lastName)) {
            ErrorUtils.addErrorMessage(errors, 'lastName', translate('personalDetails.error.hasInvalidCharacter'));
        }
        else if (values.lastName.length > CONST_1.default.TITLE_CHARACTER_LIMIT) {
            ErrorUtils.addErrorMessage(errors, 'lastName', translate('common.error.characterLimitExceedCounter', { length: values.lastName.length, limit: CONST_1.default.TITLE_CHARACTER_LIMIT }));
        }
        if (ValidationUtils.doesContainReservedWord(values.lastName, CONST_1.default.DISPLAY_NAME.RESERVED_NAMES)) {
            ErrorUtils.addErrorMessage(errors, 'lastName', translate('personalDetails.error.containsReservedWord'));
        }
        return errors;
    };
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom shouldEnableMaxHeight testID={DisplayNamePage.displayName}>
            <HeaderWithBackButton_1.default title={translate('displayNamePage.headerTitle')} onBackButtonPress={function () { return Navigation_1.default.goBack(); }}/>
            {isLoadingApp ? (<FullscreenLoadingIndicator_1.default style={[styles.flex1, styles.pRelative]}/>) : (<FormProvider_1.default style={[styles.flexGrow1, styles.ph5]} formID={ONYXKEYS_1.default.FORMS.DISPLAY_NAME_FORM} validate={validate} onSubmit={updateDisplayName} submitButtonText={translate('common.save')} enabledWhenOffline shouldValidateOnBlur shouldValidateOnChange>
                    <Text_1.default style={[styles.mb6]}>{translate('displayNamePage.isShownOnProfile')}</Text_1.default>
                    <react_native_1.View style={styles.mb4}>
                        <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={DisplayNameForm_1.default.FIRST_NAME} name="fname" label={translate('common.firstName')} aria-label={translate('common.firstName')} role={CONST_1.default.ROLE.PRESENTATION} defaultValue={(_b = currentUserDetails.firstName) !== null && _b !== void 0 ? _b : ''} spellCheck={false} autoCapitalize="words"/>
                    </react_native_1.View>
                    <react_native_1.View>
                        <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={DisplayNameForm_1.default.LAST_NAME} name="lname" label={translate('common.lastName')} aria-label={translate('common.lastName')} role={CONST_1.default.ROLE.PRESENTATION} defaultValue={(_c = currentUserDetails.lastName) !== null && _c !== void 0 ? _c : ''} spellCheck={false} autoCapitalize="words"/>
                    </react_native_1.View>
                </FormProvider_1.default>)}
        </ScreenWrapper_1.default>);
}
DisplayNamePage.displayName = 'DisplayNamePage';
exports.default = (0, withCurrentUserPersonalDetails_1.default)(DisplayNamePage);
