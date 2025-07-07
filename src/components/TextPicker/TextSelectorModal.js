"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Modal_1 = require("@components/Modal");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function TextSelectorModal(_a) {
    var value = _a.value, _b = _a.description, description = _b === void 0 ? '' : _b, subtitle = _a.subtitle, onValueSelected = _a.onValueSelected, isVisible = _a.isVisible, onClose = _a.onClose, shouldClearOnClose = _a.shouldClearOnClose, _c = _a.maxLength, maxLength = _c === void 0 ? CONST_1.default.CATEGORY_NAME_LIMIT : _c, _d = _a.required, required = _d === void 0 ? false : _d, rest = __rest(_a, ["value", "description", "subtitle", "onValueSelected", "isVisible", "onClose", "shouldClearOnClose", "maxLength", "required"]);
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var _e = (0, react_1.useState)(value), currentValue = _e[0], setValue = _e[1];
    var inputRef = (0, react_1.useRef)(null);
    var inputValueRef = (0, react_1.useRef)(value);
    var focusTimeoutRef = (0, react_1.useRef)(null);
    var inputCallbackRef = function (ref) {
        inputRef.current = ref;
    };
    var hide = (0, react_1.useCallback)(function () {
        onClose();
        if (shouldClearOnClose) {
            setValue('');
        }
    }, [onClose, shouldClearOnClose]);
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = {};
        var formValue = values[rest.inputID];
        if (required) {
            errors = (0, ValidationUtils_1.getFieldRequiredErrors)(values, [rest.inputID]);
        }
        if (formValue.length > maxLength) {
            errors[rest.inputID] = translate('common.error.characterLimitExceedCounter', { length: formValue.length, limit: maxLength });
        }
        return errors;
    }, [maxLength, rest.inputID, required, translate]);
    // In TextPicker, when the modal is hidden, it is not completely unmounted, so when it is shown again, the currentValue is not updated with the value prop.
    // Therefore, we need to update the currentValue with the value prop when the modal is shown. This is done once when the modal is shown again.
    (0, react_1.useEffect)(function () {
        if (!isVisible) {
            return;
        }
        setValue(value);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isVisible]);
    (0, react_1.useEffect)(function () {
        inputValueRef.current = currentValue;
    }, [currentValue]);
    (0, native_1.useFocusEffect)((0, react_1.useCallback)(function () {
        focusTimeoutRef.current = setTimeout(function () {
            var _a, _b, _c, _d, _e, _f;
            if (inputRef.current && isVisible) {
                inputRef.current.focus();
                (_b = (_a = inputRef.current).setSelection) === null || _b === void 0 ? void 0 : _b.call(_a, (_d = (_c = inputValueRef.current) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0, (_f = (_e = inputValueRef.current) === null || _e === void 0 ? void 0 : _e.length) !== null && _f !== void 0 ? _f : 0);
            }
            return function () {
                if (!focusTimeoutRef.current || !isVisible) {
                    return;
                }
                clearTimeout(focusTimeoutRef.current);
            };
        }, CONST_1.default.ANIMATED_TRANSITION);
    }, [isVisible]));
    var handleSubmit = (0, react_1.useCallback)(function (data) {
        var _a;
        var submittedValue = (_a = data[rest.inputID]) !== null && _a !== void 0 ? _a : '';
        if (required && !submittedValue.trim()) {
            return;
        }
        react_native_1.Keyboard.dismiss();
        onValueSelected === null || onValueSelected === void 0 ? void 0 : onValueSelected(submittedValue);
    }, [onValueSelected, rest.inputID, required]);
    return (<Modal_1.default type={CONST_1.default.MODAL.MODAL_TYPE.RIGHT_DOCKED} isVisible={isVisible} onClose={hide} onModalHide={hide} hideModalContentWhileAnimating useNativeDriver shouldUseModalPaddingStyle={false} enableEdgeToEdgeBottomSafeAreaPadding>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding includePaddingTop testID={TextSelectorModal.displayName} shouldEnableMaxHeight>
                <HeaderWithBackButton_1.default title={description} onBackButtonPress={hide}/>
                <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.TEXT_PICKER_MODAL_FORM} validate={validate} onSubmit={handleSubmit} submitButtonText={translate('common.save')} style={[styles.mh5, styles.flex1]} enabledWhenOffline shouldHideFixErrorsAlert addBottomSafeAreaPadding>
                    <react_native_1.View style={styles.pb4}>{!!subtitle && <Text_1.default style={[styles.sidebarLinkText, styles.optionAlternateText]}>{subtitle}</Text_1.default>}</react_native_1.View>
                    <InputWrapper_1.default ref={inputCallbackRef} InputComponent={TextInput_1.default} value={currentValue} onValueChange={function (changedValue) { return setValue(changedValue.toString()); }} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...rest} inputID={rest.inputID}/>
                </FormProvider_1.default>
            </ScreenWrapper_1.default>
        </Modal_1.default>);
}
TextSelectorModal.displayName = 'TextSelectorModal';
exports.default = TextSelectorModal;
