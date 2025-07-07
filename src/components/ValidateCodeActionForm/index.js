"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Text_1 = require("@components/Text");
var ValidateCodeForm_1 = require("@components/ValidateCodeActionModal/ValidateCodeForm");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function ValidateCodeActionForm(_a) {
    var descriptionPrimary = _a.descriptionPrimary, descriptionSecondary = _a.descriptionSecondary, descriptionPrimaryStyles = _a.descriptionPrimaryStyles, descriptionSecondaryStyles = _a.descriptionSecondaryStyles, validatePendingAction = _a.validatePendingAction, validateError = _a.validateError, hasMagicCodeBeenSent = _a.hasMagicCodeBeenSent, handleSubmitForm = _a.handleSubmitForm, clearError = _a.clearError, sendValidateCode = _a.sendValidateCode, isLoading = _a.isLoading, submitButtonText = _a.submitButtonText, forwardedRef = _a.forwardedRef, shouldSkipInitialValidation = _a.shouldSkipInitialValidation;
    var themeStyles = (0, useThemeStyles_1.default)();
    var isUnmounted = (0, react_1.useRef)(false);
    (0, react_1.useEffect)(function () {
        if (!shouldSkipInitialValidation) {
            sendValidateCode();
        }
        return function () {
            isUnmounted.current = true;
        };
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [shouldSkipInitialValidation]);
    (0, react_1.useEffect)(function () {
        return function () {
            if (!isUnmounted.current) {
                return;
            }
            clearError();
        };
    }, [clearError]);
    return (<react_native_1.View style={[themeStyles.ph5, themeStyles.mt3, themeStyles.mb5, themeStyles.flex1]}>
            <Text_1.default style={[themeStyles.mb6, descriptionPrimaryStyles]}>{descriptionPrimary}</Text_1.default>
            {!!descriptionSecondary && <Text_1.default style={[themeStyles.mb6, descriptionSecondaryStyles]}>{descriptionSecondary}</Text_1.default>}
            <ValidateCodeForm_1.default isLoading={isLoading} hasMagicCodeBeenSent={hasMagicCodeBeenSent} validatePendingAction={validatePendingAction} validateCodeActionErrorField="validateLogin" validateError={validateError} handleSubmitForm={handleSubmitForm} sendValidateCode={sendValidateCode} clearError={clearError} buttonStyles={[themeStyles.justifyContentEnd, themeStyles.flex1]} ref={forwardedRef} submitButtonText={submitButtonText}/>
        </react_native_1.View>);
}
ValidateCodeActionForm.displayName = 'ValidateCodeActionForm';
exports.default = (0, react_1.forwardRef)(function (props, ref) { return (<ValidateCodeActionForm 
// eslint-disable-next-line react/jsx-props-no-spreading
{...props} forwardedRef={ref}/>); });
