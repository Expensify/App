"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var DotIndicatorMessage_1 = require("@components/DotIndicatorMessage");
var MagicCodeInput_1 = require("@components/MagicCodeInput");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var PressableWithFeedback_1 = require("@components/Pressable/PressableWithFeedback");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Browser_1 = require("@libs/Browser");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var User_1 = require("@userActions/User");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function BaseValidateCodeForm(_a) {
    var _b;
    var _c = _a.autoComplete, autoComplete = _c === void 0 ? 'one-time-code' : _c, _d = _a.innerRef, innerRef = _d === void 0 ? function () { } : _d, hasMagicCodeBeenSent = _a.hasMagicCodeBeenSent, validateCodeActionErrorField = _a.validateCodeActionErrorField, validatePendingAction = _a.validatePendingAction, validateError = _a.validateError, handleSubmitForm = _a.handleSubmitForm, clearError = _a.clearError, sendValidateCode = _a.sendValidateCode, buttonStyles = _a.buttonStyles, hideSubmitButton = _a.hideSubmitButton, submitButtonText = _a.submitButtonText, isLoading = _a.isLoading, _e = _a.shouldShowSkipButton, shouldShowSkipButton = _e === void 0 ? false : _e, handleSkipButtonPress = _a.handleSkipButtonPress;
    var translate = (0, useLocalize_1.default)().translate;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var _f = (0, react_1.useState)({}), formError = _f[0], setFormError = _f[1];
    var _g = (0, react_1.useState)(''), validateCode = _g[0], setValidateCode = _g[1];
    var inputValidateCodeRef = (0, react_1.useRef)(null);
    var _h = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, {
        canBeMissing: true,
    })[0], account = _h === void 0 ? {} : _h;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- nullish coalescing doesn't achieve the same result in this case
    var shouldDisableResendValidateCode = !!isOffline || (account === null || account === void 0 ? void 0 : account.isLoading);
    var focusTimeoutRef = (0, react_1.useRef)(null);
    var _j = (0, react_1.useState)(CONST_1.default.REQUEST_CODE_DELAY), timeRemaining = _j[0], setTimeRemaining = _j[1];
    var _k = (0, react_1.useState)(false), canShowError = _k[0], setCanShowError = _k[1];
    var validateCodeAction = (0, useOnyx_1.default)(ONYXKEYS_1.default.VALIDATE_ACTION_CODE, { canBeMissing: true })[0];
    var validateCodeSent = (0, react_1.useMemo)(function () { return hasMagicCodeBeenSent !== null && hasMagicCodeBeenSent !== void 0 ? hasMagicCodeBeenSent : validateCodeAction === null || validateCodeAction === void 0 ? void 0 : validateCodeAction.validateCodeSent; }, [hasMagicCodeBeenSent, validateCodeAction === null || validateCodeAction === void 0 ? void 0 : validateCodeAction.validateCodeSent]);
    var latestValidateCodeError = (0, ErrorUtils_1.getLatestErrorField)(validateCodeAction, validateCodeActionErrorField);
    var timerRef = (0, react_1.useRef)(undefined);
    (0, react_1.useImperativeHandle)(innerRef, function () { return ({
        focus: function () {
            var _a;
            (_a = inputValidateCodeRef.current) === null || _a === void 0 ? void 0 : _a.focus();
        },
        focusLastSelected: function () {
            if (!inputValidateCodeRef.current) {
                return;
            }
            if (focusTimeoutRef.current) {
                clearTimeout(focusTimeoutRef.current);
            }
            focusTimeoutRef.current = setTimeout(function () {
                var _a;
                (_a = inputValidateCodeRef.current) === null || _a === void 0 ? void 0 : _a.focusLastSelected();
            }, CONST_1.default.ANIMATED_TRANSITION);
        },
    }); });
    (0, native_1.useFocusEffect)((0, react_1.useCallback)(function () {
        var _a;
        if (!inputValidateCodeRef.current) {
            return;
        }
        if (focusTimeoutRef.current) {
            clearTimeout(focusTimeoutRef.current);
        }
        // Keyboard won't show if we focus the input with a delay, so we need to focus immediately.
        if (!(0, Browser_1.isMobileSafari)()) {
            focusTimeoutRef.current = setTimeout(function () {
                var _a;
                (_a = inputValidateCodeRef.current) === null || _a === void 0 ? void 0 : _a.focusLastSelected();
            }, CONST_1.default.ANIMATED_TRANSITION);
        }
        else {
            (_a = inputValidateCodeRef.current) === null || _a === void 0 ? void 0 : _a.focusLastSelected();
        }
        return function () {
            if (!focusTimeoutRef.current) {
                return;
            }
            clearTimeout(focusTimeoutRef.current);
        };
    }, []));
    (0, react_1.useEffect)(function () {
        var _a;
        if (!validateCodeSent) {
            return;
        }
        (_a = inputValidateCodeRef.current) === null || _a === void 0 ? void 0 : _a.clear();
    }, [validateCodeSent]);
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
     * Request a validate code / magic code be sent to verify this contact method
     */
    var resendValidateCode = function () {
        var _a;
        sendValidateCode();
        (_a = inputValidateCodeRef.current) === null || _a === void 0 ? void 0 : _a.clear();
        setTimeRemaining(CONST_1.default.REQUEST_CODE_DELAY);
    };
    /**
     * Handle text input and clear formError upon text change
     */
    var onTextInput = (0, react_1.useCallback)(function (text) {
        setValidateCode(text);
        setFormError({});
        if (!(0, EmptyObject_1.isEmptyObject)(validateError) || !(0, EmptyObject_1.isEmptyObject)(latestValidateCodeError)) {
            // Clear flow specific error
            clearError();
            // Clear "incorrect magic code" error
            (0, User_1.clearValidateCodeActionError)(validateCodeActionErrorField);
        }
    }, [validateError, clearError, latestValidateCodeError, validateCodeActionErrorField]);
    /**
     * Check that all the form fields are valid, then trigger the submit callback
     */
    var validateAndSubmitForm = (0, react_1.useCallback)(function () {
        // Clear flow specific error
        clearError();
        // Clear "incorrect magic" code error
        (0, User_1.clearValidateCodeActionError)(validateCodeActionErrorField);
        setCanShowError(true);
        if (!validateCode.trim()) {
            setFormError({ validateCode: 'validateCodeForm.error.pleaseFillMagicCode' });
            return;
        }
        if (!(0, ValidationUtils_1.isValidValidateCode)(validateCode)) {
            setFormError({ validateCode: 'validateCodeForm.error.incorrectMagicCode' });
            return;
        }
        setFormError({});
        handleSubmitForm(validateCode);
    }, [validateCode, handleSubmitForm, validateCodeActionErrorField, clearError]);
    var errorText = (0, react_1.useMemo)(function () {
        if (!canShowError) {
            return '';
        }
        if (formError === null || formError === void 0 ? void 0 : formError.validateCode) {
            return translate(formError === null || formError === void 0 ? void 0 : formError.validateCode);
        }
        return (0, ErrorUtils_1.getLatestErrorMessage)(account !== null && account !== void 0 ? account : {});
    }, [canShowError, formError, account, translate]);
    var shouldShowTimer = timeRemaining > 0 && !isOffline;
    // latestValidateCodeError only holds an error related to bad magic code
    // while validateError holds flow-specific errors
    var finalValidateError = !(0, EmptyObject_1.isEmptyObject)(latestValidateCodeError) ? latestValidateCodeError : validateError;
    return (<>
            <MagicCodeInput_1.default autoComplete={autoComplete} ref={inputValidateCodeRef} name="validateCode" value={validateCode} onChangeText={onTextInput} errorText={errorText} hasError={canShowError && !(0, EmptyObject_1.isEmptyObject)(finalValidateError)} onFulfill={validateAndSubmitForm} autoFocus={false}/>
            {shouldShowTimer && (<Text_1.default style={[styles.mt5]}>
                    {translate('validateCodeForm.requestNewCode')}
                    <Text_1.default style={[styles.textBlue]}>00:{String(timeRemaining).padStart(2, '0')}</Text_1.default>
                </Text_1.default>)}
            <OfflineWithFeedback_1.default pendingAction={(_b = validateCodeAction === null || validateCodeAction === void 0 ? void 0 : validateCodeAction.pendingFields) === null || _b === void 0 ? void 0 : _b.validateCodeSent} errorRowStyles={[styles.mt2]} onClose={function () { return (0, User_1.clearValidateCodeActionError)(validateCodeActionErrorField); }}>
                {!shouldShowTimer && (<react_native_1.View style={[styles.mt5, styles.dFlex, styles.flexColumn, styles.alignItemsStart]}>
                        <PressableWithFeedback_1.default disabled={shouldDisableResendValidateCode} style={[styles.mr1]} onPress={resendValidateCode} underlayColor={theme.componentBG} hoverDimmingValue={1} pressDimmingValue={0.2} role={CONST_1.default.ROLE.BUTTON} accessibilityLabel={translate('validateCodeForm.magicCodeNotReceived')}>
                            <Text_1.default style={[StyleUtils.getDisabledLinkStyles(shouldDisableResendValidateCode)]}>{translate('validateCodeForm.magicCodeNotReceived')}</Text_1.default>
                        </PressableWithFeedback_1.default>
                    </react_native_1.View>)}
            </OfflineWithFeedback_1.default>
            {!!validateCodeSent && (<DotIndicatorMessage_1.default type="success" style={[styles.mt6, styles.flex0]} 
        // eslint-disable-next-line @typescript-eslint/naming-convention
        messages={{ 0: translate('validateCodeModal.successfulNewCodeRequest') }}/>)}

            <OfflineWithFeedback_1.default shouldDisplayErrorAbove pendingAction={validatePendingAction} errors={canShowError ? finalValidateError : undefined} errorRowStyles={[styles.mt2, styles.textWrap]} onClose={function () {
            clearError();
            if (!(0, EmptyObject_1.isEmptyObject)(validateCodeAction === null || validateCodeAction === void 0 ? void 0 : validateCodeAction.errorFields) && validateCodeActionErrorField) {
                (0, User_1.clearValidateCodeActionError)(validateCodeActionErrorField);
            }
        }} style={buttonStyles}>
                {shouldShowSkipButton && (<Button_1.default text={translate('common.skip')} onPress={handleSkipButtonPress} style={[styles.mt4]} success={false} large/>)}
                {!hideSubmitButton && (<Button_1.default isDisabled={isOffline} text={submitButtonText !== null && submitButtonText !== void 0 ? submitButtonText : translate('common.verify')} onPress={validateAndSubmitForm} style={[styles.mt4]} success large 
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        isLoading={(account === null || account === void 0 ? void 0 : account.isLoading) || isLoading}/>)}
            </OfflineWithFeedback_1.default>
        </>);
}
BaseValidateCodeForm.displayName = 'BaseValidateCodeForm';
exports.default = BaseValidateCodeForm;
