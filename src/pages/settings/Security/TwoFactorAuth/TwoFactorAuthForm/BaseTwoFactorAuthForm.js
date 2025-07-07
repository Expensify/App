"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var MagicCodeInput_1 = require("@components/MagicCodeInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var Browser_1 = require("@libs/Browser");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var Session_1 = require("@userActions/Session");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function BaseTwoFactorAuthForm(_a, ref) {
    var _b, _c;
    var autoComplete = _a.autoComplete, validateInsteadOfDisable = _a.validateInsteadOfDisable;
    var translate = (0, useLocalize_1.default)().translate;
    var _d = (0, react_1.useState)({}), formError = _d[0], setFormError = _d[1];
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: false })[0];
    var _e = (0, react_1.useState)(''), twoFactorAuthCode = _e[0], setTwoFactorAuthCode = _e[1];
    var inputRef = (0, react_1.useRef)(null);
    var shouldClearData = (_b = account === null || account === void 0 ? void 0 : account.needsTwoFactorAuthSetup) !== null && _b !== void 0 ? _b : false;
    /**
     * Handle text input and clear formError upon text change
     */
    var onTextInput = (0, react_1.useCallback)(function (text) {
        setTwoFactorAuthCode(text);
        setFormError({});
        if (account === null || account === void 0 ? void 0 : account.errors) {
            (0, Session_1.clearAccountMessages)();
        }
    }, [account === null || account === void 0 ? void 0 : account.errors]);
    /**
     * Check that all the form fields are valid, then trigger the submit callback
     */
    var validateAndSubmitForm = (0, react_1.useCallback)(function () {
        if (inputRef.current) {
            inputRef.current.blur();
        }
        if (!twoFactorAuthCode.trim()) {
            setFormError({ twoFactorAuthCode: translate('twoFactorAuthForm.error.pleaseFillTwoFactorAuth') });
            return;
        }
        if (!(0, ValidationUtils_1.isValidTwoFactorCode)(twoFactorAuthCode)) {
            setFormError({ twoFactorAuthCode: translate('twoFactorAuthForm.error.incorrect2fa') });
            return;
        }
        setFormError({});
        if (validateInsteadOfDisable !== false) {
            (0, Session_1.validateTwoFactorAuth)(twoFactorAuthCode, shouldClearData);
            return;
        }
        (0, Session_1.toggleTwoFactorAuth)(false, twoFactorAuthCode);
    }, [twoFactorAuthCode, validateInsteadOfDisable, translate, shouldClearData]);
    (0, react_1.useImperativeHandle)(ref, function () { return ({
        validateAndSubmitForm: function () {
            validateAndSubmitForm();
        },
        focus: function () {
            if (!inputRef.current) {
                return;
            }
            inputRef.current.focus();
        },
        focusLastSelected: function () {
            if (!inputRef.current) {
                return;
            }
            setTimeout(function () {
                var _a;
                (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.focusLastSelected();
            }, CONST_1.default.ANIMATED_TRANSITION);
        },
    }); });
    (0, native_1.useFocusEffect)((0, react_1.useCallback)(function () {
        var _a;
        if (!inputRef.current) {
            return;
        }
        // Keyboard won't show if we focus the input with a delay, so we need to focus immediately.
        if (!(0, Browser_1.isMobileSafari)()) {
            setTimeout(function () {
                var _a;
                (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.focusLastSelected();
            }, CONST_1.default.ANIMATED_TRANSITION);
        }
        else {
            (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.focusLastSelected();
        }
    }, []));
    return (<MagicCodeInput_1.default autoComplete={autoComplete} name="twoFactorAuthCode" value={twoFactorAuthCode} onChangeText={onTextInput} onFulfill={validateAndSubmitForm} errorText={(_c = formError.twoFactorAuthCode) !== null && _c !== void 0 ? _c : (0, ErrorUtils_1.getLatestErrorMessage)(account)} ref={inputRef} autoFocus={false}/>);
}
exports.default = (0, react_1.forwardRef)(BaseTwoFactorAuthForm);
