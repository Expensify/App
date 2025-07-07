"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var Icon_1 = require("./Icon");
var Expensicons = require("./Icon/Expensicons");
var PressableWithFeedback_1 = require("./Pressable/PressableWithFeedback");
function Checkbox(_a, ref) {
    var _b = _a.isChecked, isChecked = _b === void 0 ? false : _b, _c = _a.isIndeterminate, isIndeterminate = _c === void 0 ? false : _c, _d = _a.hasError, hasError = _d === void 0 ? false : _d, _e = _a.disabled, disabled = _e === void 0 ? false : _e, style = _a.style, containerStyle = _a.containerStyle, _f = _a.children, children = _f === void 0 ? null : _f, onMouseDown = _a.onMouseDown, _g = _a.containerSize, containerSize = _g === void 0 ? 20 : _g, _h = _a.containerBorderRadius, containerBorderRadius = _h === void 0 ? 4 : _h, _j = _a.caretSize, caretSize = _j === void 0 ? 14 : _j, onPress = _a.onPress, accessibilityLabel = _a.accessibilityLabel, shouldStopMouseDownPropagation = _a.shouldStopMouseDownPropagation, shouldSelectOnPressEnter = _a.shouldSelectOnPressEnter;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var handleSpaceOrEnterKey = function (event) {
        if ((event === null || event === void 0 ? void 0 : event.code) !== 'Space' && (event === null || event === void 0 ? void 0 : event.code) !== 'Enter') {
            return;
        }
        if ((event === null || event === void 0 ? void 0 : event.code) === 'Enter' && !shouldSelectOnPressEnter) {
            // If the checkbox should not be selected on Enter key press, we do not want to
            // toggle it, so we return early.
            return;
        }
        onPress();
    };
    var firePressHandlerOnClick = function (event) {
        // Pressable can be triggered with Enter key and by a click. As this is a checkbox,
        // We do not want to toggle it, when Enter key is pressed.
        if ((event === null || event === void 0 ? void 0 : event.type) && event.type !== 'click') {
            return;
        }
        onPress();
    };
    return (<PressableWithFeedback_1.default disabled={disabled} onPress={firePressHandlerOnClick} onMouseDown={function (e) {
            if (shouldStopMouseDownPropagation) {
                e.stopPropagation();
            }
            onMouseDown === null || onMouseDown === void 0 ? void 0 : onMouseDown(e);
        }} ref={ref} style={[StyleUtils.getCheckboxPressableStyle(containerBorderRadius + 2), style]} // to align outline on focus, border-radius of pressable should be 2px more than Checkbox
     onKeyDown={handleSpaceOrEnterKey} role={CONST_1.default.ROLE.CHECKBOX} 
    /*  true  → checked
        false → unchecked
        mixed → indeterminate  */
    aria-checked={isIndeterminate ? 'mixed' : isChecked} accessibilityLabel={accessibilityLabel} pressDimmingValue={1}>
            {children !== null && children !== void 0 ? children : (<react_native_1.View style={[
                StyleUtils.getCheckboxContainerStyle(containerSize, containerBorderRadius),
                containerStyle,
                (isChecked || isIndeterminate) && styles.checkedContainer,
                hasError && styles.borderColorDanger,
                disabled && styles.cursorDisabled,
                disabled && styles.buttonOpacityDisabled,
                (isChecked || isIndeterminate) && styles.borderColorFocus,
            ]}>
                    {(isChecked || isIndeterminate) && (<Icon_1.default src={isChecked ? Expensicons.Checkmark : Expensicons.Minus} fill={theme.textLight} height={caretSize} width={caretSize}/>)}
                </react_native_1.View>)}
        </PressableWithFeedback_1.default>);
}
Checkbox.displayName = 'Checkbox';
exports.default = (0, react_1.forwardRef)(Checkbox);
