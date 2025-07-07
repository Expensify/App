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
var react_1 = require("react");
var RoomNameInput_1 = require("@components/RoomNameInput");
var TextInput_1 = require("@components/TextInput");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var FormContext_1 = require("./FormContext");
var textInputBasedComponents = [TextInput_1.default, RoomNameInput_1.default];
function computeComponentSpecificRegistrationParams(_a) {
    var InputComponent = _a.InputComponent, shouldSubmitForm = _a.shouldSubmitForm, multiline = _a.multiline, autoGrowHeight = _a.autoGrowHeight, blurOnSubmit = _a.blurOnSubmit;
    if (textInputBasedComponents.includes(InputComponent)) {
        var isEffectivelyMultiline = !!multiline || !!autoGrowHeight;
        // If the user can use the hardware keyboard, they have access to an alternative way of inserting a new line
        // (like a Shift+Enter keyboard shortcut). For simplicity, we assume that when there's no touch screen, it's a
        // desktop setup with a keyboard.
        var canUseHardwareKeyboard = !(0, DeviceCapabilities_1.canUseTouchScreen)();
        // We want to avoid a situation when the user can't insert a new line. For single-line inputs, it's not a problem and we
        // force-enable form submission. For multi-line inputs, ensure that it was requested to enable form submission for this specific
        // input and that alternative ways exist to add a new line.
        var shouldReallySubmitForm = isEffectivelyMultiline ? !!shouldSubmitForm && canUseHardwareKeyboard : true;
        return {
            // There are inputs that don't have onBlur methods, to simulate the behavior of onBlur in e.g. checkbox, we had to
            // use different methods like onPress. This introduced a problem that inputs that have the onBlur method were
            // calling some methods too early or twice, so we had to add this check to prevent that side effect.
            // For now this side effect happened only in `TextInput` components.
            shouldSetTouchedOnBlurOnly: true,
            blurOnSubmit: (isEffectivelyMultiline && shouldReallySubmitForm) || blurOnSubmit,
            shouldSubmitForm: shouldReallySubmitForm,
        };
    }
    return {
        shouldSetTouchedOnBlurOnly: false,
        // Forward the originally provided value
        blurOnSubmit: blurOnSubmit,
        shouldSubmitForm: !!shouldSubmitForm,
    };
}
function InputWrapper(props, ref) {
    var _a = props, InputComponent = _a.InputComponent, inputID = _a.inputID, _b = _a.valueType, valueType = _b === void 0 ? 'string' : _b, propShouldSubmitForm = _a.shouldSubmitForm, rest = __rest(_a, ["InputComponent", "inputID", "valueType", "shouldSubmitForm"]);
    var registerInput = (0, react_1.useContext)(FormContext_1.default).registerInput;
    var _c = computeComponentSpecificRegistrationParams(props), shouldSetTouchedOnBlurOnly = _c.shouldSetTouchedOnBlurOnly, blurOnSubmit = _c.blurOnSubmit, shouldSubmitForm = _c.shouldSubmitForm;
    // eslint-disable-next-line react-compiler/react-compiler
    var _d = registerInput(inputID, shouldSubmitForm, __assign(__assign({ ref: ref, valueType: valueType }, rest), { shouldSetTouchedOnBlurOnly: shouldSetTouchedOnBlurOnly, blurOnSubmit: blurOnSubmit })), key = _d.key, registerInputProps = __rest(_d, ["key"]);
    return (<InputComponent key={key} 
    // TODO: Sometimes we return too many props with register input, so we need to consider if it's better to make the returned type more general and disregard the issue, or we would like to omit the unused props somehow.
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...registerInputProps}/>);
}
InputWrapper.displayName = 'InputWrapper';
exports.default = (0, react_1.forwardRef)(InputWrapper);
