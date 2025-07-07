"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var getPlatform_1 = require("@libs/getPlatform");
var CONST_1 = require("@src/CONST");
var Button_1 = require("./Button");
var FormAlertWrapper_1 = require("./FormAlertWrapper");
function FormAlertWithSubmitButton(_a) {
    var _b = _a.message, message = _b === void 0 ? '' : _b, _c = _a.isDisabled, isDisabled = _c === void 0 ? false : _c, _d = _a.isMessageHtml, isMessageHtml = _d === void 0 ? false : _d, containerStyles = _a.containerStyles, _e = _a.isLoading, isLoading = _e === void 0 ? false : _e, _f = _a.onFixTheErrorsLinkPressed, onFixTheErrorsLinkPressed = _f === void 0 ? function () { } : _f, _g = _a.enabledWhenOffline, enabledWhenOffline = _g === void 0 ? false : _g, _h = _a.disablePressOnEnter, disablePressOnEnter = _h === void 0 ? false : _h, _j = _a.isSubmitActionDangerous, isSubmitActionDangerous = _j === void 0 ? false : _j, footerContent = _a.footerContent, buttonRef = _a.buttonRef, buttonStyles = _a.buttonStyles, buttonText = _a.buttonText, _k = _a.isAlertVisible, isAlertVisible = _k === void 0 ? false : _k, onSubmit = _a.onSubmit, _l = _a.useSmallerSubmitButtonSize, useSmallerSubmitButtonSize = _l === void 0 ? false : _l, errorMessageStyle = _a.errorMessageStyle, _m = _a.enterKeyEventListenerPriority, enterKeyEventListenerPriority = _m === void 0 ? 0 : _m, _o = _a.shouldRenderFooterAboveSubmit, shouldRenderFooterAboveSubmit = _o === void 0 ? false : _o, _p = _a.shouldBlendOpacity, shouldBlendOpacity = _p === void 0 ? false : _p, _q = _a.addButtonBottomPadding, addButtonBottomPadding = _q === void 0 ? true : _q, _r = _a.shouldPreventDefaultFocusOnPress, shouldPreventDefaultFocusOnPress = _r === void 0 ? false : _r;
    var styles = (0, useThemeStyles_1.default)();
    var style = [footerContent && addButtonBottomPadding ? styles.mb3 : {}, buttonStyles];
    // Disable pressOnEnter for Android Native to avoid issues with the Samsung keyboard,
    // where pressing Enter saves the form instead of adding a new line in multiline input.
    // More details: https://github.com/Expensify/App/issues/46644
    var isAndroidNative = (0, getPlatform_1.default)() === CONST_1.default.PLATFORM.ANDROID;
    var pressOnEnter = isAndroidNative ? false : !disablePressOnEnter;
    return (<FormAlertWrapper_1.default containerStyles={[styles.justifyContentEnd, containerStyles]} isAlertVisible={isAlertVisible} isMessageHtml={isMessageHtml} message={message} onFixTheErrorsLinkPressed={onFixTheErrorsLinkPressed} errorMessageStyle={errorMessageStyle}>
            {function (isOffline) { return (<react_native_1.View>
                    {shouldRenderFooterAboveSubmit && footerContent}
                    {isOffline && !enabledWhenOffline ? (<Button_1.default success shouldBlendOpacity={shouldBlendOpacity} isDisabled text={buttonText} style={style} danger={isSubmitActionDangerous} medium={useSmallerSubmitButtonSize} large={!useSmallerSubmitButtonSize} onMouseDown={shouldPreventDefaultFocusOnPress ? function (e) { return e.preventDefault(); } : undefined}/>) : (<Button_1.default ref={buttonRef} success shouldBlendOpacity={shouldBlendOpacity} pressOnEnter={pressOnEnter} enterKeyEventListenerPriority={enterKeyEventListenerPriority} text={buttonText} style={style} onPress={onSubmit} isDisabled={isDisabled} isLoading={isLoading} danger={isSubmitActionDangerous} medium={useSmallerSubmitButtonSize} large={!useSmallerSubmitButtonSize} onMouseDown={shouldPreventDefaultFocusOnPress ? function (e) { return e.preventDefault(); } : undefined}/>)}
                    {!shouldRenderFooterAboveSubmit && footerContent}
                </react_native_1.View>); }}
        </FormAlertWrapper_1.default>);
}
FormAlertWithSubmitButton.displayName = 'FormAlertWithSubmitButton';
exports.default = FormAlertWithSubmitButton;
