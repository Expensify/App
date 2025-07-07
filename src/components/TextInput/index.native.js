"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var BaseTextInput_1 = require("./BaseTextInput");
function TextInput(props, ref) {
    var styles = (0, useThemeStyles_1.default)();
    (0, react_1.useEffect)(function () {
        if (!props.disableKeyboard) {
            return;
        }
        var appStateSubscription = react_native_1.AppState.addEventListener('change', function (nextAppState) {
            if (!nextAppState.match(/inactive|background/)) {
                return;
            }
            react_native_1.Keyboard.dismiss();
        });
        return function () {
            appStateSubscription.remove();
        };
    }, [props.disableKeyboard]);
    return (<BaseTextInput_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} 
    // Setting autoCompleteType to new-password throws an error on Android/iOS, so fall back to password in that case
    // eslint-disable-next-line react/jsx-props-no-multi-spaces
    ref={ref} autoCompleteType={props.autoCompleteType === 'new-password' ? 'password' : props.autoCompleteType} inputStyle={[styles.baseTextInput, props.inputStyle]} textInputContainerStyles={[props.textInputContainerStyles]}/>);
}
TextInput.displayName = 'TextInput';
exports.default = (0, react_1.forwardRef)(TextInput);
