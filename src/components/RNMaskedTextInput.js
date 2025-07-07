"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_advanced_input_mask_1 = require("react-native-advanced-input-mask");
var react_native_reanimated_1 = require("react-native-reanimated");
var useTheme_1 = require("@hooks/useTheme");
// Convert the underlying TextInput into an Animated component so that we can take an animated ref and pass it to a worklet
var AnimatedTextInput = react_native_reanimated_1.default.createAnimatedComponent(react_native_advanced_input_mask_1.MaskedTextInput);
function RNMaskedTextInputWithRef(props, ref) {
    var theme = (0, useTheme_1.default)();
    return (<AnimatedTextInput 
    // disable autocomplete to prevent part of mask to be present on Android when value is empty
    autocomplete={false} allowFontScaling={false} textBreakStrategy="simple" keyboardAppearance={theme.colorScheme} ref={function (refHandle) {
            if (typeof ref !== 'function') {
                return;
            }
            ref(refHandle);
        }} 
    // eslint-disable-next-line
    {...props}/>);
}
RNMaskedTextInputWithRef.displayName = 'RNMaskedTextInputWithRef';
exports.default = react_1.default.forwardRef(RNMaskedTextInputWithRef);
