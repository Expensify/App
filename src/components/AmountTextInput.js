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
var react_1 = require("react");
var CONST_1 = require("@src/CONST");
var TextInput_1 = require("./TextInput");
function AmountTextInput(_a, ref) {
    var formattedAmount = _a.formattedAmount, onChangeAmount = _a.onChangeAmount, placeholder = _a.placeholder, selection = _a.selection, onSelectionChange = _a.onSelectionChange, style = _a.style, touchableInputWrapperStyle = _a.touchableInputWrapperStyle, onKeyPress = _a.onKeyPress, containerStyle = _a.containerStyle, _b = _a.disableKeyboard, disableKeyboard = _b === void 0 ? true : _b, _c = _a.hideFocusedState, hideFocusedState = _c === void 0 ? true : _c, _d = _a.shouldApplyPaddingToContainer, shouldApplyPaddingToContainer = _d === void 0 ? false : _d, rest = __rest(_a, ["formattedAmount", "onChangeAmount", "placeholder", "selection", "onSelectionChange", "style", "touchableInputWrapperStyle", "onKeyPress", "containerStyle", "disableKeyboard", "hideFocusedState", "shouldApplyPaddingToContainer"]);
    return (<TextInput_1.default autoGrow hideFocusedState={hideFocusedState} shouldInterceptSwipe disableKeyboard={disableKeyboard} inputStyle={style} textInputContainerStyles={containerStyle} onChangeText={onChangeAmount} ref={ref} value={formattedAmount} placeholder={placeholder} inputMode={CONST_1.default.INPUT_MODE.DECIMAL} 
    // On android autoCapitalize="words" is necessary when keyboardType="decimal-pad" or inputMode="decimal" to prevent input lag.
    // See https://github.com/Expensify/App/issues/51868 for more information
    autoCapitalize="words" blurOnSubmit={false} selection={selection} onSelectionChange={onSelectionChange} role={CONST_1.default.ROLE.PRESENTATION} onKeyPress={onKeyPress} touchableInputWrapperStyle={touchableInputWrapperStyle} 
    // On iPad, even if the soft keyboard is hidden, the keyboard suggestion is still shown.
    // Setting both autoCorrect and spellCheck to false will hide the suggestion.
    autoCorrect={false} spellCheck={false} disableKeyboardShortcuts shouldUseFullInputHeight shouldApplyPaddingToContainer={shouldApplyPaddingToContainer} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...rest}/>);
}
AmountTextInput.displayName = 'AmountTextInput';
exports.default = react_1.default.forwardRef(AmountTextInput);
