"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var FixedFooter_1 = require("@components/FixedFooter");
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
var ErrorUtils = require("@libs/ErrorUtils");
var ValidationUtils = require("@libs/ValidationUtils");
var Delegate = require("@userActions/Delegate");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function BaseValidateCodeForm(_a) {
    var _b, _c, _d, _e, _f, _g, _h;
    var _j = _a.autoComplete, autoComplete = _j === void 0 ? 'one-time-code' : _j, _k = _a.innerRef, innerRef = _k === void 0 ? function () { } : _k, delegate = _a.delegate, role = _a.role, wrapperStyle = _a.wrapperStyle;
    var translate = (0, useLocalize_1.default)().translate;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var _l = (0, react_1.useState)({}), formError = _l[0], setFormError = _l[1];
    var _m = (0, react_1.useState)(''), validateCode = _m[0], setValidateCode = _m[1];
    var inputValidateCodeRef = (0, react_1.useRef)(null);
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT)[0];
    var login = account === null || account === void 0 ? void 0 : account.primaryLogin;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- nullish coalescing doesn't achieve the same result in this case
    var focusTimeoutRef = (0, react_1.useRef)(null);
    var currentDelegate = (_c = (_b = account === null || account === void 0 ? void 0 : account.delegatedAccess) === null || _b === void 0 ? void 0 : _b.delegates) === null || _c === void 0 ? void 0 : _c.find(function (d) { return d.email === delegate; });
    var errorFields = (_e = (_d = account === null || account === void 0 ? void 0 : account.delegatedAccess) === null || _d === void 0 ? void 0 : _d.errorFields) !== null && _e !== void 0 ? _e : {};
    var validateLoginError = ErrorUtils.getLatestError((_f = errorFields.updateDelegateRole) === null || _f === void 0 ? void 0 : _f[(_g = currentDelegate === null || currentDelegate === void 0 ? void 0 : currentDelegate.email) !== null && _g !== void 0 ? _g : '']);
    var shouldDisableResendValidateCode = !!isOffline || (currentDelegate === null || currentDelegate === void 0 ? void 0 : currentDelegate.isLoading);
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
        return function () {
            if (!focusTimeoutRef.current) {
                return;
            }
            clearTimeout(focusTimeoutRef.current);
        };
    }, []));
    /**
     * Request a validate code / magic code be sent to verify this contact method
     */
    var resendValidateCode = function () {
        var _a;
        if (!login) {
            return;
        }
        Delegate.requestValidationCode();
        (_a = inputValidateCodeRef.current) === null || _a === void 0 ? void 0 : _a.clear();
    };
    /**
     * Handle text input and clear formError upon text change
     */
    var onTextInput = (0, react_1.useCallback)(function (text) {
        var _a;
        setValidateCode(text);
        setFormError({});
        if (validateLoginError) {
            Delegate.clearDelegateErrorsByField((_a = currentDelegate === null || currentDelegate === void 0 ? void 0 : currentDelegate.email) !== null && _a !== void 0 ? _a : '', 'updateDelegateRole');
        }
    }, [currentDelegate === null || currentDelegate === void 0 ? void 0 : currentDelegate.email, validateLoginError]);
    /**
     * Check that all the form fields are valid, then trigger the submit callback
     */
    var validateAndSubmitForm = (0, react_1.useCallback)(function () {
        if (!validateCode.trim()) {
            setFormError({ validateCode: 'validateCodeForm.error.pleaseFillMagicCode' });
            return;
        }
        if (!ValidationUtils.isValidValidateCode(validateCode)) {
            setFormError({ validateCode: 'validateCodeForm.error.incorrectMagicCode' });
            return;
        }
        setFormError({});
        Delegate.updateDelegateRole(delegate, role, validateCode);
    }, [delegate, role, validateCode]);
    return (<react_native_1.View style={[styles.flex1, styles.justifyContentBetween, wrapperStyle]}>
            <react_native_1.View style={[styles.ph5, styles.mt3]}>
                <MagicCodeInput_1.default autoComplete={autoComplete} ref={inputValidateCodeRef} name="validateCode" value={validateCode} onChangeText={onTextInput} errorText={(formError === null || formError === void 0 ? void 0 : formError.validateCode) ? translate(formError === null || formError === void 0 ? void 0 : formError.validateCode) : ((_h = Object.values(validateLoginError !== null && validateLoginError !== void 0 ? validateLoginError : {}).at(0)) !== null && _h !== void 0 ? _h : '')} hasError={!(0, EmptyObject_1.isEmptyObject)(validateLoginError)} onFulfill={validateAndSubmitForm} autoFocus={false}/>
                <OfflineWithFeedback_1.default errorRowStyles={[styles.mt2]}>
                    <react_native_1.View style={[styles.mt2, styles.dFlex, styles.flexColumn, styles.alignItemsStart]}>
                        <PressableWithFeedback_1.default disabled={shouldDisableResendValidateCode} style={[styles.mr1]} onPress={resendValidateCode} underlayColor={theme.componentBG} hoverDimmingValue={1} pressDimmingValue={0.2} role={CONST_1.default.ROLE.BUTTON} accessibilityLabel={translate('validateCodeForm.magicCodeNotReceived')}>
                            <Text_1.default style={[StyleUtils.getDisabledLinkStyles(shouldDisableResendValidateCode)]}>{translate('validateCodeForm.magicCodeNotReceived')}</Text_1.default>
                        </PressableWithFeedback_1.default>
                    </react_native_1.View>
                </OfflineWithFeedback_1.default>
            </react_native_1.View>
            <FixedFooter_1.default>
                <OfflineWithFeedback_1.default>
                    <Button_1.default isDisabled={isOffline} text={translate('common.verify')} onPress={validateAndSubmitForm} style={[styles.mt4]} success pressOnEnter large isLoading={currentDelegate === null || currentDelegate === void 0 ? void 0 : currentDelegate.isLoading}/>
                </OfflineWithFeedback_1.default>
            </FixedFooter_1.default>
        </react_native_1.View>);
}
BaseValidateCodeForm.displayName = 'BaseValidateCodeForm';
exports.default = BaseValidateCodeForm;
