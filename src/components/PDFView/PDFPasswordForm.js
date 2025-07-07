"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Browser_1 = require("@libs/Browser");
var CONST_1 = require("@src/CONST");
var PDFInfoMessage_1 = require("./PDFInfoMessage");
function PDFPasswordForm(_a) {
    var isFocused = _a.isFocused, _b = _a.isPasswordInvalid, isPasswordInvalid = _b === void 0 ? false : _b, _c = _a.shouldShowLoadingIndicator, shouldShowLoadingIndicator = _c === void 0 ? false : _c, onSubmit = _a.onSubmit, onPasswordUpdated = _a.onPasswordUpdated, onPasswordFieldFocused = _a.onPasswordFieldFocused;
    var styles = (0, useThemeStyles_1.default)();
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var translate = (0, useLocalize_1.default)().translate;
    var _d = (0, react_1.useState)(''), password = _d[0], setPassword = _d[1];
    var _e = (0, react_1.useState)(''), validationErrorText = _e[0], setValidationErrorText = _e[1];
    var _f = (0, react_1.useState)(false), shouldShowForm = _f[0], setShouldShowForm = _f[1];
    var textInputRef = (0, react_1.useRef)(null);
    var focusTimeoutRef = (0, react_1.useRef)(undefined);
    var errorText = (0, react_1.useMemo)(function () {
        if (isPasswordInvalid) {
            return translate('attachmentView.passwordIncorrect');
        }
        if (validationErrorText) {
            return translate(validationErrorText);
        }
        return '';
    }, [isPasswordInvalid, validationErrorText, translate]);
    (0, react_1.useEffect)(function () {
        if (!isFocused) {
            return;
        }
        if (!textInputRef.current) {
            return;
        }
        /**
         * We recommend using setTimeout to wait for the animation to finish and then focus on the input
         * Relevant thread: https://expensify.slack.com/archives/C01GTK53T8Q/p1694660990479979
         */
        focusTimeoutRef.current = setTimeout(function () {
            var _a;
            (_a = textInputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
        }, CONST_1.default.ANIMATED_TRANSITION);
        return function () {
            if (!focusTimeoutRef.current) {
                return;
            }
            clearTimeout(focusTimeoutRef.current);
        };
    }, [isFocused]);
    var updatePassword = function (newPassword) {
        onPasswordUpdated === null || onPasswordUpdated === void 0 ? void 0 : onPasswordUpdated(newPassword);
        if (newPassword && validationErrorText) {
            setValidationErrorText('');
        }
        setPassword(newPassword);
    };
    var validate = function () {
        if (!isPasswordInvalid && password) {
            return true;
        }
        if (!password) {
            setValidationErrorText('attachmentView.passwordRequired');
        }
        return false;
    };
    var submitPassword = function () {
        if (!validate()) {
            return;
        }
        onSubmit === null || onSubmit === void 0 ? void 0 : onSubmit(password);
    };
    return shouldShowForm ? (<ScrollView_1.default keyboardShouldPersistTaps="handled" style={styles.getPDFPasswordFormStyle(shouldUseNarrowLayout)} contentContainerStyle={styles.p5}>
            <react_native_1.View style={styles.mb4}>
                <Text_1.default>{translate('attachmentView.pdfPasswordForm.formLabel')}</Text_1.default>
            </react_native_1.View>
            <TextInput_1.default ref={textInputRef} label={translate('common.password')} accessibilityLabel={translate('common.password')} role={CONST_1.default.ROLE.PRESENTATION} 
    /**
     * This is a workaround to bypass Safari's autofill odd behaviour.
     * This tricks the browser not to fill the username somewhere else and still fill the password correctly.
     */
    autoComplete={(0, Browser_1.getBrowser)() === CONST_1.default.BROWSER.SAFARI ? 'username' : 'off'} autoCorrect={false} textContentType="password" onChangeText={updatePassword} enterKeyHint="done" onSubmitEditing={submitPassword} errorText={errorText} onFocus={function () { return onPasswordFieldFocused === null || onPasswordFieldFocused === void 0 ? void 0 : onPasswordFieldFocused(true); }} onBlur={function () { return onPasswordFieldFocused === null || onPasswordFieldFocused === void 0 ? void 0 : onPasswordFieldFocused(false); }} autoFocus secureTextEntry/>
            <Button_1.default 
    // Keep focus on the TextInput effectively keeping keyboard open
    onMouseDown={function (e) { return e.preventDefault(); }} text={translate('common.confirm')} onPress={submitPassword} style={styles.mt4} isLoading={shouldShowLoadingIndicator} pressOnEnter large/>
        </ScrollView_1.default>) : (<react_native_1.View style={[styles.flex1, styles.justifyContentCenter]}>
            <PDFInfoMessage_1.default onShowForm={function () { return setShouldShowForm(true); }}/>
        </react_native_1.View>);
}
PDFPasswordForm.displayName = 'PDFPasswordForm';
exports.default = PDFPasswordForm;
