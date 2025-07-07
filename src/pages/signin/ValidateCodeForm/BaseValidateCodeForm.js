"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var SafariFormWrapper_1 = require("@components/Form/SafariFormWrapper");
var FormHelpMessage_1 = require("@components/FormHelpMessage");
var MagicCodeInput_1 = require("@components/MagicCodeInput");
var PressableWithFeedback_1 = require("@components/Pressable/PressableWithFeedback");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var withToggleVisibilityView_1 = require("@components/withToggleVisibilityView");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var usePrevious_1 = require("@hooks/usePrevious");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var AccountUtils_1 = require("@libs/AccountUtils");
var canFocusInputOnScreenFocus_1 = require("@libs/canFocusInputOnScreenFocus");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var ChangeExpensifyLoginLink_1 = require("@pages/signin/ChangeExpensifyLoginLink");
var Terms_1 = require("@pages/signin/Terms");
var Session_1 = require("@userActions/Session");
var User_1 = require("@userActions/User");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function BaseValidateCodeForm(_a, forwardedRef) {
    var _b;
    var autoComplete = _a.autoComplete, isUsingRecoveryCode = _a.isUsingRecoveryCode, setIsUsingRecoveryCode = _a.setIsUsingRecoveryCode, isVisible = _a.isVisible;
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: true })[0];
    var credentials = (0, useOnyx_1.default)(ONYXKEYS_1.default.CREDENTIALS, { canBeMissing: true })[0];
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: false })[0];
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var isFocused = (0, native_1.useIsFocused)();
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var _c = (0, react_1.useState)({}), formError = _c[0], setFormError = _c[1];
    var _d = (0, react_1.useState)((_b = credentials === null || credentials === void 0 ? void 0 : credentials.validateCode) !== null && _b !== void 0 ? _b : ''), validateCode = _d[0], setValidateCode = _d[1];
    var _e = (0, react_1.useState)(''), twoFactorAuthCode = _e[0], setTwoFactorAuthCode = _e[1];
    var _f = (0, react_1.useState)(CONST_1.default.REQUEST_CODE_DELAY), timeRemaining = _f[0], setTimeRemaining = _f[1];
    var _g = (0, react_1.useState)(''), recoveryCode = _g[0], setRecoveryCode = _g[1];
    var _h = (0, react_1.useState)(!!(account === null || account === void 0 ? void 0 : account.errors)), needToClearError = _h[0], setNeedToClearError = _h[1];
    var prevRequiresTwoFactorAuth = (0, usePrevious_1.default)(account === null || account === void 0 ? void 0 : account.requiresTwoFactorAuth);
    var prevValidateCode = (0, usePrevious_1.default)(credentials === null || credentials === void 0 ? void 0 : credentials.validateCode);
    var inputValidateCodeRef = (0, react_1.useRef)(undefined);
    var input2FARef = (0, react_1.useRef)(undefined);
    var timerRef = (0, react_1.useRef)(undefined);
    var hasError = !!account && !(0, EmptyObject_1.isEmptyObject)(account === null || account === void 0 ? void 0 : account.errors) && !needToClearError;
    var isLoadingResendValidationForm = (account === null || account === void 0 ? void 0 : account.loadingForm) === CONST_1.default.FORMS.RESEND_VALIDATE_CODE_FORM;
    var shouldDisableResendValidateCode = isOffline !== null && isOffline !== void 0 ? isOffline : account === null || account === void 0 ? void 0 : account.isLoading;
    var isValidateCodeFormSubmitting = AccountUtils_1.default.isValidateCodeFormSubmitting(account);
    (0, react_1.useEffect)(function () {
        if (!(inputValidateCodeRef.current && hasError && ((session === null || session === void 0 ? void 0 : session.autoAuthState) === CONST_1.default.AUTO_AUTH_STATE.FAILED || (account === null || account === void 0 ? void 0 : account.isLoading)))) {
            return;
        }
        inputValidateCodeRef.current.blur();
    }, [account === null || account === void 0 ? void 0 : account.isLoading, session === null || session === void 0 ? void 0 : session.autoAuthState, hasError]);
    (0, react_1.useEffect)(function () {
        if (!inputValidateCodeRef.current || !(0, canFocusInputOnScreenFocus_1.default)() || !isVisible || !isFocused) {
            return;
        }
        setTimeRemaining(CONST_1.default.REQUEST_CODE_DELAY);
        inputValidateCodeRef.current.focus();
    }, [isVisible, isFocused]);
    (0, react_1.useEffect)(function () {
        if (!!prevValidateCode || !(credentials === null || credentials === void 0 ? void 0 : credentials.validateCode)) {
            return;
        }
        setValidateCode(credentials.validateCode);
    }, [credentials === null || credentials === void 0 ? void 0 : credentials.validateCode, prevValidateCode]);
    (0, react_1.useEffect)(function () {
        if (!input2FARef.current || !!prevRequiresTwoFactorAuth || !(account === null || account === void 0 ? void 0 : account.requiresTwoFactorAuth)) {
            return;
        }
        input2FARef.current.focus();
    }, [account === null || account === void 0 ? void 0 : account.requiresTwoFactorAuth, prevRequiresTwoFactorAuth]);
    (0, react_1.useEffect)(function () {
        if (!inputValidateCodeRef.current || validateCode.length > 0) {
            return;
        }
        inputValidateCodeRef.current.clear();
    }, [validateCode]);
    (0, react_1.useEffect)(function () {
        if (!input2FARef.current || twoFactorAuthCode.length > 0) {
            return;
        }
        input2FARef.current.clear();
    }, [twoFactorAuthCode]);
    (0, react_1.useEffect)(function () {
        if (timeRemaining > 0) {
            timerRef.current = setTimeout(function () {
                setTimeRemaining(timeRemaining - 1);
            }, 1000);
        }
        return function () {
            clearTimeout(timerRef.current);
        };
    }, [timeRemaining]);
    /**
     * Handle text input and clear formError upon text change
     */
    var onTextInput = function (text, key) {
        if (key === 'validateCode') {
            setValidateCode(text);
        }
        if (key === 'twoFactorAuthCode') {
            setTwoFactorAuthCode(text);
        }
        if (key === 'recoveryCode') {
            setRecoveryCode(text.trim());
        }
        setFormError(function (prevError) {
            var _a;
            return (__assign(__assign({}, prevError), (_a = {}, _a[key] = undefined, _a)));
        });
        if (account === null || account === void 0 ? void 0 : account.errors) {
            (0, Session_1.clearAccountMessages)();
        }
    };
    /**
     * Trigger the reset validate code flow and ensure the 2FA input field is reset to avoid it being permanently hidden
     */
    var resendValidateCode = function () {
        var _a, _b;
        (0, User_1.resendValidateCode)((_a = credentials === null || credentials === void 0 ? void 0 : credentials.login) !== null && _a !== void 0 ? _a : '');
        (_b = inputValidateCodeRef.current) === null || _b === void 0 ? void 0 : _b.clear();
        // Give feedback to the user to let them know the email was sent so that they don't spam the button.
        setTimeRemaining(CONST_1.default.REQUEST_CODE_DELAY);
    };
    /**
     * Clear local sign in states
     */
    var clearLocalSignInData = (0, react_1.useCallback)(function () {
        setTwoFactorAuthCode('');
        setFormError({});
        setValidateCode('');
        setIsUsingRecoveryCode(false);
        setRecoveryCode('');
    }, [setIsUsingRecoveryCode]);
    /**
     * Clears local and Onyx sign in states
     */
    var clearSignInData = (0, react_1.useCallback)(function () {
        clearLocalSignInData();
        (0, Session_1.clearSignInData)();
    }, [clearLocalSignInData]);
    (0, react_1.useImperativeHandle)(forwardedRef, function () { return ({
        clearSignInData: clearSignInData,
    }); });
    (0, react_1.useEffect)(function () {
        if (!needToClearError) {
            return;
        }
        if (account === null || account === void 0 ? void 0 : account.errors) {
            (0, Session_1.clearAccountMessages)();
            return;
        }
        setNeedToClearError(false);
    }, [account === null || account === void 0 ? void 0 : account.errors, needToClearError]);
    /**
     * Switches between 2fa and recovery code, clears inputs and errors
     */
    var switchBetween2faAndRecoveryCode = function () {
        setIsUsingRecoveryCode(!isUsingRecoveryCode);
        setRecoveryCode('');
        setTwoFactorAuthCode('');
        setFormError(function (prevError) { return (__assign(__assign({}, prevError), { recoveryCode: undefined, twoFactorAuthCode: undefined })); });
        if (account === null || account === void 0 ? void 0 : account.errors) {
            (0, Session_1.clearAccountMessages)();
        }
    };
    (0, react_1.useEffect)(function () {
        if (!isLoadingResendValidationForm) {
            return;
        }
        clearLocalSignInData();
        // `clearLocalSignInData` is not required as a dependency, and adding it
        // over complicates things requiring clearLocalSignInData function to use useCallback
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isLoadingResendValidationForm]);
    (0, react_1.useEffect)(function () {
        if (!hasError) {
            return;
        }
        setFormError({});
    }, [hasError]);
    /**
     * Check that all the form fields are valid, then trigger the submit callback
     */
    var validateAndSubmitForm = (0, react_1.useCallback)(function () {
        if (account === null || account === void 0 ? void 0 : account.isLoading) {
            return;
        }
        if (account === null || account === void 0 ? void 0 : account.errors) {
            (0, Session_1.clearAccountMessages)();
        }
        var requiresTwoFactorAuth = account === null || account === void 0 ? void 0 : account.requiresTwoFactorAuth;
        if (requiresTwoFactorAuth) {
            if (input2FARef.current) {
                input2FARef.current.blur();
            }
            /**
             * User could be using either recovery code or 2fa code
             */
            if (!isUsingRecoveryCode) {
                if (!twoFactorAuthCode.trim()) {
                    setFormError({ twoFactorAuthCode: 'validateCodeForm.error.pleaseFillTwoFactorAuth' });
                    return;
                }
                if (!(0, ValidationUtils_1.isValidTwoFactorCode)(twoFactorAuthCode)) {
                    setFormError({ twoFactorAuthCode: 'passwordForm.error.incorrect2fa' });
                    return;
                }
            }
            else {
                if (!recoveryCode.trim()) {
                    setFormError({ recoveryCode: 'recoveryCodeForm.error.pleaseFillRecoveryCode' });
                    return;
                }
                if (!(0, ValidationUtils_1.isValidRecoveryCode)(recoveryCode)) {
                    setFormError({ recoveryCode: 'recoveryCodeForm.error.incorrectRecoveryCode' });
                    return;
                }
            }
        }
        else {
            if (inputValidateCodeRef.current) {
                inputValidateCodeRef.current.blur();
            }
            if (!validateCode.trim()) {
                setFormError({ validateCode: 'validateCodeForm.error.pleaseFillMagicCode' });
                return;
            }
            if (!(0, ValidationUtils_1.isValidValidateCode)(validateCode)) {
                setFormError({ validateCode: 'validateCodeForm.error.incorrectMagicCode' });
                return;
            }
        }
        setFormError({});
        var recoveryCodeOr2faCode = isUsingRecoveryCode ? recoveryCode : twoFactorAuthCode;
        var accountID = credentials === null || credentials === void 0 ? void 0 : credentials.accountID;
        if (accountID) {
            (0, Session_1.signInWithValidateCode)(accountID, validateCode, recoveryCodeOr2faCode);
        }
        else {
            (0, Session_1.signIn)(validateCode, recoveryCodeOr2faCode);
        }
    }, [account === null || account === void 0 ? void 0 : account.isLoading, account === null || account === void 0 ? void 0 : account.errors, account === null || account === void 0 ? void 0 : account.requiresTwoFactorAuth, isUsingRecoveryCode, recoveryCode, twoFactorAuthCode, credentials === null || credentials === void 0 ? void 0 : credentials.accountID, validateCode]);
    return (<SafariFormWrapper_1.default>
            {/* At this point, if we know the account requires 2FA we already successfully authenticated */}
            {(account === null || account === void 0 ? void 0 : account.requiresTwoFactorAuth) ? (<react_native_1.View style={[styles.mv3]}>
                    {isUsingRecoveryCode ? (<TextInput_1.default accessibilityLabel={translate('recoveryCodeForm.recoveryCode')} value={recoveryCode} onChangeText={function (text) { return onTextInput(text, 'recoveryCode'); }} maxLength={CONST_1.default.FORM_CHARACTER_LIMIT} label={translate('recoveryCodeForm.recoveryCode')} errorText={(formError === null || formError === void 0 ? void 0 : formError.recoveryCode) ? translate(formError === null || formError === void 0 ? void 0 : formError.recoveryCode) : ''} hasError={hasError} onSubmitEditing={validateAndSubmitForm} autoFocus/>) : (<MagicCodeInput_1.default autoComplete={autoComplete} ref={function (magicCodeInput) {
                    if (!magicCodeInput) {
                        return;
                    }
                    input2FARef.current = magicCodeInput;
                }} name="twoFactorAuthCode" value={twoFactorAuthCode} onChangeText={function (text) { return onTextInput(text, 'twoFactorAuthCode'); }} onFulfill={validateAndSubmitForm} maxLength={CONST_1.default.TFA_CODE_LENGTH} errorText={(formError === null || formError === void 0 ? void 0 : formError.twoFactorAuthCode) ? translate(formError === null || formError === void 0 ? void 0 : formError.twoFactorAuthCode) : ''} hasError={hasError} autoFocus key="twoFactorAuthCode"/>)}
                    {hasError && <FormHelpMessage_1.default message={(0, ErrorUtils_1.getLatestErrorMessage)(account)}/>}
                    <PressableWithFeedback_1.default key={isUsingRecoveryCode.toString()} style={[styles.mt2]} onPress={switchBetween2faAndRecoveryCode} hoverDimmingValue={1} disabled={isValidateCodeFormSubmitting} role={CONST_1.default.ROLE.BUTTON} accessibilityLabel={isUsingRecoveryCode ? translate('recoveryCodeForm.use2fa') : translate('recoveryCodeForm.useRecoveryCode')}>
                        <Text_1.default style={[styles.link]}>{isUsingRecoveryCode ? translate('recoveryCodeForm.use2fa') : translate('recoveryCodeForm.useRecoveryCode')}</Text_1.default>
                    </PressableWithFeedback_1.default>
                </react_native_1.View>) : (<react_native_1.View style={[styles.mv3]}>
                    <MagicCodeInput_1.default autoComplete={autoComplete} ref={function (magicCodeInput) {
                if (!magicCodeInput) {
                    return;
                }
                inputValidateCodeRef.current = magicCodeInput;
            }} name="validateCode" value={validateCode} onChangeText={function (text) { return onTextInput(text, 'validateCode'); }} onFulfill={validateAndSubmitForm} errorText={(formError === null || formError === void 0 ? void 0 : formError.validateCode) ? translate(formError === null || formError === void 0 ? void 0 : formError.validateCode) : ''} hasError={hasError} autoFocus key="validateCode" testID="validateCode"/>
                    {hasError && <FormHelpMessage_1.default message={(0, ErrorUtils_1.getLatestErrorMessage)(account)}/>}
                    <react_native_1.View style={[styles.alignItemsStart]}>
                        {timeRemaining > 0 && !isOffline ? (<Text_1.default style={[styles.mt2]}>
                                {translate('validateCodeForm.requestNewCode')}
                                <Text_1.default style={[styles.textBlue]}>00:{String(timeRemaining).padStart(2, '0')}</Text_1.default>
                            </Text_1.default>) : (<PressableWithFeedback_1.default style={[styles.mt2]} onPress={resendValidateCode} disabled={shouldDisableResendValidateCode} hoverDimmingValue={1} pressDimmingValue={0.2} role={CONST_1.default.ROLE.BUTTON} accessibilityLabel={translate('validateCodeForm.magicCodeNotReceived')}>
                                <Text_1.default style={[StyleUtils.getDisabledLinkStyles(shouldDisableResendValidateCode)]}>
                                    {hasError ? translate('validateCodeForm.requestNewCodeAfterErrorOccurred') : translate('validateCodeForm.magicCodeNotReceived')}
                                </Text_1.default>
                            </PressableWithFeedback_1.default>)}
                    </react_native_1.View>
                </react_native_1.View>)}
            <react_native_1.View>
                <Button_1.default isDisabled={isOffline} success large style={[styles.mv3]} text={translate('common.signIn')} isLoading={isValidateCodeFormSubmitting} onPress={validateAndSubmitForm}/>
                <ChangeExpensifyLoginLink_1.default onPress={clearSignInData}/>
            </react_native_1.View>
            <react_native_1.View style={[styles.mt5, styles.signInPageWelcomeTextContainer]}>
                <Terms_1.default />
            </react_native_1.View>
        </SafariFormWrapper_1.default>);
}
BaseValidateCodeForm.displayName = 'BaseValidateCodeForm';
exports.default = (0, withToggleVisibilityView_1.default)((0, react_1.forwardRef)(BaseValidateCodeForm));
