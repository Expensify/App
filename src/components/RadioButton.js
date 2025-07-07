"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var Icon_1 = require("./Icon");
var Expensicons = require("./Icon/Expensicons");
var PressableWithFeedback_1 = require("./Pressable/PressableWithFeedback");
function RadioButton(_a) {
    var isChecked = _a.isChecked, onPress = _a.onPress, accessibilityLabel = _a.accessibilityLabel, _b = _a.hasError, hasError = _b === void 0 ? false : _b, _c = _a.disabled, disabled = _c === void 0 ? false : _c;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    return (<PressableWithFeedback_1.default disabled={disabled} onPress={onPress} hoverDimmingValue={1} pressDimmingValue={1} accessibilityLabel={accessibilityLabel} role={CONST_1.default.ROLE.RADIO} style={[styles.radioButtonContainer, hasError && styles.borderColorDanger, disabled && styles.cursorDisabled]}>
            {isChecked && (<Icon_1.default src={Expensicons.Checkmark} fill={theme.checkBox} height={20} width={20}/>)}
        </PressableWithFeedback_1.default>);
}
RadioButton.displayName = 'RadioButton';
exports.default = RadioButton;
