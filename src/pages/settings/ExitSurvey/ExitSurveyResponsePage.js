"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useKeyboardShortcut_1 = require("@hooks/useKeyboardShortcut");
var useKeyboardState_1 = require("@hooks/useKeyboardState");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useSafeAreaInsets_1 = require("@hooks/useSafeAreaInsets");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var StatusBar_1 = require("@libs/StatusBar");
var Navigation_1 = require("@navigation/Navigation");
var variables_1 = require("@styles/variables");
var ExitSurvey_1 = require("@userActions/ExitSurvey");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var ExitSurveyResponseForm_1 = require("@src/types/form/ExitSurveyResponseForm");
var ExitSurveyOffline_1 = require("./ExitSurveyOffline");
function ExitSurveyResponsePage(_a) {
    var _b;
    var route = _a.route, navigation = _a.navigation;
    var _c = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.EXIT_SURVEY_RESPONSE_FORM_DRAFT, { selector: function (value) { return value === null || value === void 0 ? void 0 : value[ExitSurveyResponseForm_1.default.RESPONSE]; }, canBeMissing: true })[0], draftResponse = _c === void 0 ? '' : _c;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var keyboardHeight = (0, useKeyboardState_1.default)().keyboardHeight;
    var windowHeight = (0, useWindowDimensions_1.default)().windowHeight;
    var inputCallbackRef = (0, useAutoFocusInput_1.default)(true).inputCallbackRef;
    // Device safe area top and bottom insets.
    // When the keyboard is shown, the bottom inset doesn't affect the height, so we take it out from the calculation.
    var safeAreaInsetsTop = (0, useSafeAreaInsets_1.default)().top;
    var _d = route.params, reason = _d.reason, backTo = _d.backTo;
    var isOffline = (0, useNetwork_1.default)({
        onReconnect: function () {
            navigation.setParams({
                backTo: ROUTES_1.default.SETTINGS_EXIT_SURVEY_REASON.route,
            });
        },
    }).isOffline;
    (0, react_1.useEffect)(function () {
        if (!isOffline || backTo === ROUTES_1.default.SETTINGS) {
            return;
        }
        navigation.setParams({ backTo: ROUTES_1.default.SETTINGS });
    }, [backTo, isOffline, navigation]);
    var submitForm = (0, react_1.useCallback)(function () {
        (0, ExitSurvey_1.saveResponse)(draftResponse);
        Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_EXIT_SURVEY_CONFIRM.getRoute(ROUTES_1.default.SETTINGS_EXIT_SURVEY_RESPONSE.route));
    }, [draftResponse]);
    (0, useKeyboardShortcut_1.default)(CONST_1.default.KEYBOARD_SHORTCUTS.CTRL_ENTER, submitForm);
    var formTopMarginsStyle = styles.mt3;
    var textStyle = styles.headerAnonymousFooter;
    var baseResponseInputContainerStyle = styles.mt7;
    var formMaxHeight = Math.floor(
    // windowHeight doesn't include status bar height in Android, so we need to add it here.
    // StatusBar.currentHeight is only available on Android.
    windowHeight +
        ((_b = StatusBar_1.default.currentHeight) !== null && _b !== void 0 ? _b : 0) -
        keyboardHeight -
        safeAreaInsetsTop -
        // Minus the height of HeaderWithBackButton
        variables_1.default.contentHeaderHeight -
        // Minus the top margins on the form
        formTopMarginsStyle.marginTop);
    return (<ScreenWrapper_1.default testID={ExitSurveyResponsePage.displayName} shouldEnableMaxHeight>
            <HeaderWithBackButton_1.default title={translate('exitSurvey.header')} onBackButtonPress={function () { return Navigation_1.default.goBack(backTo); }}/>
            <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.EXIT_SURVEY_RESPONSE_FORM} style={[styles.flex1, styles.mh5, formTopMarginsStyle, StyleUtils.getMaximumHeight(formMaxHeight)]} onSubmit={submitForm} submitButtonText={translate('common.next')} validate={function () {
            var errors = {};
            if (!(draftResponse === null || draftResponse === void 0 ? void 0 : draftResponse.trim())) {
                errors[ExitSurveyResponseForm_1.default.RESPONSE] = translate('common.error.fieldRequired');
            }
            else if (draftResponse.length > CONST_1.default.MAX_COMMENT_LENGTH) {
                errors[ExitSurveyResponseForm_1.default.RESPONSE] = translate('common.error.characterLimitExceedCounter', {
                    length: draftResponse.length,
                    limit: CONST_1.default.MAX_COMMENT_LENGTH,
                });
            }
            return errors;
        }} shouldValidateOnBlur shouldValidateOnChange shouldHideFixErrorsAlert>
                {isOffline && <ExitSurveyOffline_1.default />}
                {!isOffline && (<>
                        <Text_1.default style={textStyle}>{translate("exitSurvey.prompts.".concat(reason))}</Text_1.default>
                        <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={ExitSurveyResponseForm_1.default.RESPONSE} label={translate("exitSurvey.responsePlaceholder")} accessibilityLabel={translate("exitSurvey.responsePlaceholder")} role={CONST_1.default.ROLE.PRESENTATION} autoGrowHeight maxAutoGrowHeight={variables_1.default.textInputAutoGrowMaxHeight} ref={inputCallbackRef} containerStyles={[baseResponseInputContainerStyle]} shouldSaveDraft shouldSubmitForm/>
                    </>)}
            </FormProvider_1.default>
        </ScreenWrapper_1.default>);
}
ExitSurveyResponsePage.displayName = 'ExitSurveyResponsePage';
exports.default = ExitSurveyResponsePage;
