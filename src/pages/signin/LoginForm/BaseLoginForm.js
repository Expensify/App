"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var DotIndicatorMessage_1 = require("@components/DotIndicatorMessage");
var FormAlertWithSubmitButton_1 = require("@components/FormAlertWithSubmitButton");
var AppleSignIn_1 = require("@components/SignInButtons/AppleSignIn");
var GoogleSignIn_1 = require("@components/SignInButtons/GoogleSignIn");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var isTextInputFocused_1 = require("@components/TextInput/BaseTextInput/isTextInputFocused");
var withToggleVisibilityView_1 = require("@components/withToggleVisibilityView");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var usePrevious_1 = require("@hooks/usePrevious");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Browser_1 = require("@libs/Browser");
var canFocusInputOnScreenFocus_1 = require("@libs/canFocusInputOnScreenFocus");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var isInputAutoFilled_1 = require("@libs/isInputAutoFilled");
var LoginUtils_1 = require("@libs/LoginUtils");
var PhoneNumber_1 = require("@libs/PhoneNumber");
var StringUtils_1 = require("@libs/StringUtils");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var Visibility_1 = require("@libs/Visibility");
var SignInLoginContext_1 = require("@pages/signin/SignInLoginContext");
var CloseAccount_1 = require("@userActions/CloseAccount");
var Session_1 = require("@userActions/Session");
var CONFIG_1 = require("@src/CONFIG");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var htmlDivElementRef_1 = require("@src/types/utils/htmlDivElementRef");
var viewRef_1 = require("@src/types/utils/viewRef");
function BaseLoginForm(_a, ref) {
    var _b;
    var _c = _a.blurOnSubmit, blurOnSubmit = _c === void 0 ? false : _c, isVisible = _a.isVisible;
    var _d = (0, SignInLoginContext_1.useLogin)(), login = _d.login, setLogin = _d.setLogin;
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: true })[0];
    var closeAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.CLOSE_ACCOUNT_FORM, { canBeMissing: true })[0];
    var styles = (0, useThemeStyles_1.default)();
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var translate = (0, useLocalize_1.default)().translate;
    var input = (0, react_1.useRef)(null);
    var _e = (0, react_1.useState)(), formError = _e[0], setFormError = _e[1];
    var prevIsVisible = (0, usePrevious_1.default)(isVisible);
    var firstBlurred = (0, react_1.useRef)(false);
    var isFocused = (0, native_1.useIsFocused)();
    var isLoading = (0, react_1.useRef)(false);
    var _f = (0, useResponsiveLayout_1.default)(), shouldUseNarrowLayout = _f.shouldUseNarrowLayout, isInNarrowPaneModal = _f.isInNarrowPaneModal;
    var accountMessage = (account === null || account === void 0 ? void 0 : account.message) === 'unlinkLoginForm.successfullyUnlinkedLogin' ? translate(account.message) : ((_b = account === null || account === void 0 ? void 0 : account.message) !== null && _b !== void 0 ? _b : '');
    /**
     * Validate the input value and set the error for formError
     */
    var validate = (0, react_1.useCallback)(function (value) {
        var loginTrim = StringUtils_1.default.removeInvisibleCharacters(value.trim());
        if (!loginTrim) {
            setFormError('common.pleaseEnterEmailOrPhoneNumber');
            return false;
        }
        var phoneLogin = (0, LoginUtils_1.appendCountryCode)((0, LoginUtils_1.getPhoneNumberWithoutSpecialChars)(loginTrim));
        var parsedPhoneNumber = (0, PhoneNumber_1.parsePhoneNumber)(phoneLogin);
        if (!expensify_common_1.Str.isValidEmail(loginTrim) && !parsedPhoneNumber.possible) {
            if ((0, ValidationUtils_1.isNumericWithSpecialChars)(loginTrim)) {
                setFormError('common.error.phoneNumber');
            }
            else {
                setFormError('loginForm.error.invalidFormatEmailLogin');
            }
            return false;
        }
        setFormError(undefined);
        return true;
    }, [setFormError]);
    /**
     * Handle text input and validate the text input if it is blurred
     */
    var onTextInput = (0, react_1.useCallback)(function (text) {
        setLogin(text);
        if (firstBlurred.current) {
            validate(text);
        }
        if (!!(account === null || account === void 0 ? void 0 : account.errors) || !!(account === null || account === void 0 ? void 0 : account.message)) {
            (0, Session_1.clearAccountMessages)();
        }
        // Clear the "Account successfully closed" message when the user starts typing
        if ((closeAccount === null || closeAccount === void 0 ? void 0 : closeAccount.success) && !(0, isInputAutoFilled_1.default)(input.current)) {
            (0, CloseAccount_1.setDefaultData)();
        }
    }, [account, closeAccount, input, setLogin, validate]);
    function getSignInWithStyles() {
        return shouldUseNarrowLayout ? [styles.mt1] : [styles.mt5, styles.mb5];
    }
    /**
     * Check that all the form fields are valid, then trigger the submit callback
     */
    var validateAndSubmitForm = (0, react_1.useCallback)(function () {
        var _a;
        if (!!isOffline || !!(account === null || account === void 0 ? void 0 : account.isLoading) || isLoading.current) {
            return;
        }
        isLoading.current = true;
        // If account was closed and have success message in Onyx, we clear it here
        if (closeAccount === null || closeAccount === void 0 ? void 0 : closeAccount.success) {
            (0, CloseAccount_1.setDefaultData)();
        }
        // For native, the single input doesn't lost focus when we click outside.
        // So we need to change firstBlurred here to make the validate function is called whenever the text input is changed after the first validation.
        if (!firstBlurred.current) {
            firstBlurred.current = true;
        }
        if (!validate(login)) {
            isLoading.current = false;
            return;
        }
        var loginTrim = StringUtils_1.default.removeInvisibleCharacters(login.trim());
        var phoneLogin = (0, LoginUtils_1.appendCountryCode)((0, LoginUtils_1.getPhoneNumberWithoutSpecialChars)(loginTrim));
        var parsedPhoneNumber = (0, PhoneNumber_1.parsePhoneNumber)(phoneLogin);
        // Check if this login has an account associated with it or not
        (0, Session_1.beginSignIn)(parsedPhoneNumber.possible && ((_a = parsedPhoneNumber.number) === null || _a === void 0 ? void 0 : _a.e164) ? parsedPhoneNumber.number.e164 : loginTrim);
    }, [login, account, closeAccount, isOffline, validate]);
    (0, react_1.useEffect)(function () {
        // Call clearAccountMessages on the login page (home route).
        // When the user is in the transition route and not yet authenticated, this component will also be mounted,
        // resetting account.isLoading will cause the app to briefly display the session expiration page.
        if (isFocused && isVisible) {
            (0, Session_1.clearAccountMessages)();
        }
        if (!(0, canFocusInputOnScreenFocus_1.default)() || !input.current || !isVisible || !isFocused) {
            return;
        }
        var focusTimeout;
        if (isInNarrowPaneModal) {
            focusTimeout = setTimeout(function () { var _a; return (_a = input.current) === null || _a === void 0 ? void 0 : _a.focus(); }, CONST_1.default.ANIMATED_TRANSITION);
        }
        else {
            input.current.focus();
        }
        return function () { return clearTimeout(focusTimeout); };
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- we just want to call this function when component is mounted
    }, []);
    (0, react_1.useEffect)(function () {
        if ((account === null || account === void 0 ? void 0 : account.isLoading) !== false) {
            return;
        }
        isLoading.current = false;
    }, [account === null || account === void 0 ? void 0 : account.isLoading]);
    (0, react_1.useEffect)(function () {
        var _a, _b;
        if (blurOnSubmit) {
            (_a = input.current) === null || _a === void 0 ? void 0 : _a.blur();
        }
        // Only focus the input if the form becomes visible again, to prevent the keyboard from automatically opening on touchscreen devices after signing out
        if (!input.current || prevIsVisible || !isVisible) {
            return;
        }
        (_b = input.current) === null || _b === void 0 ? void 0 : _b.focus();
    }, [blurOnSubmit, isVisible, prevIsVisible]);
    (0, react_1.useImperativeHandle)(ref, function () { return ({
        isInputFocused: function () {
            if (!input.current) {
                return false;
            }
            return !!(0, isTextInputFocused_1.default)(input);
        },
        clearDataAndFocus: function (clearLogin) {
            if (clearLogin === void 0) { clearLogin = true; }
            if (!input.current) {
                return;
            }
            if (clearLogin) {
                (0, Session_1.clearSignInData)();
            }
            input.current.focus();
        },
    }); });
    var serverErrorText = (0, react_1.useMemo)(function () { return (account ? (0, ErrorUtils_1.getLatestErrorMessage)(account) : ''); }, [account]);
    var shouldShowServerError = !!serverErrorText && !formError;
    var isSigningWithAppleOrGoogle = (0, react_1.useRef)(false);
    var setIsSigningWithAppleOrGoogle = (0, react_1.useCallback)(function (isPressed) { return (isSigningWithAppleOrGoogle.current = isPressed); }, []);
    var submitContainerRef = (0, react_1.useRef)(null);
    var handleFocus = (0, react_1.useCallback)(function () {
        if (!(0, Browser_1.isMobileWebKit)()) {
            return;
        }
        // On mobile WebKit browsers, when an input field gains focus, the keyboard appears and the virtual viewport is resized and scrolled to make the input field visible.
        // This occurs even when there is enough space to display both the input field and the submit button in the current view.
        // so this change to correct the scroll position when the input field gains focus.
        react_native_1.InteractionManager.runAfterInteractions(function () {
            var _a, _b;
            (_b = (_a = (0, htmlDivElementRef_1.default)(submitContainerRef).current) === null || _a === void 0 ? void 0 : _a.scrollIntoView) === null || _b === void 0 ? void 0 : _b.call(_a, { behavior: 'smooth', block: 'end' });
        });
    }, []);
    var handleSignIn = function () { return setIsSigningWithAppleOrGoogle(true); };
    return (<>
            <react_native_1.View accessibilityLabel={translate('loginForm.loginForm')} style={[styles.mt3]}>
                <TextInput_1.default ref={input} label={translate('loginForm.phoneOrEmail')} accessibilityLabel={translate('loginForm.phoneOrEmail')} value={login} returnKeyType="go" autoCompleteType="username" textContentType="username" id="username" name="username" testID="username" onBlur={
        // As we have only two signin buttons (Apple/Google) other than the text input,
        // for natives onBlur is called only when the buttons are pressed and we don't need
        // to validate in those case as the user has opted for other signin flow.
        function () {
            return setTimeout(function () {
                if (isSigningWithAppleOrGoogle.current || firstBlurred.current || !Visibility_1.default.isVisible() || !Visibility_1.default.hasFocus()) {
                    setIsSigningWithAppleOrGoogle(false);
                    return;
                }
                firstBlurred.current = true;
                validate(login);
            }, 500);
        }} onFocus={handleFocus} onChangeText={onTextInput} onSubmitEditing={validateAndSubmitForm} autoCapitalize="none" autoCorrect={false} inputMode={CONST_1.default.INPUT_MODE.EMAIL} errorText={formError ? translate(formError) : undefined} hasError={shouldShowServerError} maxLength={CONST_1.default.LOGIN_CHARACTER_LIMIT}/>
            </react_native_1.View>
            {!!(account === null || account === void 0 ? void 0 : account.success) && <Text_1.default style={[styles.formSuccess]}>{account.success}</Text_1.default>}
            {(!!(closeAccount === null || closeAccount === void 0 ? void 0 : closeAccount.success) || !!(account === null || account === void 0 ? void 0 : account.message)) && (<DotIndicatorMessage_1.default style={[styles.mv2]} type="success" 
        // eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/prefer-nullish-coalescing
        messages={{ 0: (closeAccount === null || closeAccount === void 0 ? void 0 : closeAccount.success) ? closeAccount.success : accountMessage }}/>)}
            {
        // We need to unmount the submit button when the component is not visible so that the Enter button
        // key handler gets unsubscribed
        isVisible && (<react_native_1.View style={[shouldShowServerError ? {} : styles.mt5]} ref={(0, viewRef_1.default)(submitContainerRef)}>
                        <FormAlertWithSubmitButton_1.default buttonText={translate('common.continue')} isLoading={(account === null || account === void 0 ? void 0 : account.isLoading) && (account === null || account === void 0 ? void 0 : account.loadingForm) === CONST_1.default.FORMS.LOGIN_FORM} onSubmit={validateAndSubmitForm} message={serverErrorText} isAlertVisible={shouldShowServerError} buttonStyles={[shouldShowServerError ? styles.mt3 : {}]} containerStyles={[styles.mh0]}/>
                        {
            // This feature has a few behavioral differences in development mode. To prevent confusion
            // for developers about possible regressions, we won't render buttons in development mode.
            // For more information about these differences and how to test in development mode,
            // see`Expensify/App/contributingGuides/APPLE_GOOGLE_SIGNIN.md`
            CONFIG_1.default.ENVIRONMENT !== CONST_1.default.ENVIRONMENT.DEV && (<react_native_1.View style={[getSignInWithStyles()]}>
                                    <Text_1.default accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.textLabelSupporting, styles.textAlignCenter, styles.mb3, styles.mt2]}>
                                        {translate('common.signInWith')}
                                    </Text_1.default>

                                    <react_native_1.View style={shouldUseNarrowLayout ? styles.loginButtonRowSmallScreen : styles.loginButtonRow}>
                                        <react_native_1.View>
                                            <AppleSignIn_1.default onPress={handleSignIn} onPointerDown={handleSignIn}/>
                                        </react_native_1.View>
                                        <react_native_1.View>
                                            <GoogleSignIn_1.default onPress={handleSignIn} onPointerDown={handleSignIn}/>
                                        </react_native_1.View>
                                    </react_native_1.View>
                                </react_native_1.View>)}
                    </react_native_1.View>)}
        </>);
}
BaseLoginForm.displayName = 'BaseLoginForm';
exports.default = (0, withToggleVisibilityView_1.default)((0, react_1.forwardRef)(BaseLoginForm));
