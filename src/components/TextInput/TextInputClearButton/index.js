"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var Pressable_1 = require("@components/Pressable");
var Tooltip_1 = require("@components/Tooltip");
var useLocalize_1 = require("@hooks/useLocalize");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
function TextInputClearButton(_a) {
    var style = _a.style, onPressButton = _a.onPressButton;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    return (<Tooltip_1.default text={translate('common.clear')}>
            <Pressable_1.PressableWithoutFeedback style={[styles.mt4, styles.ml1, style]} accessibilityRole={CONST_1.default.ROLE.BUTTON} accessibilityLabel={translate('common.clear')} onMouseDown={function (e) {
            e.preventDefault();
        }} onPress={onPressButton}>
                <Icon_1.default src={Expensicons.Clear} width={20} height={20} fill={theme.icon}/>
            </Pressable_1.PressableWithoutFeedback>
        </Tooltip_1.default>);
}
TextInputClearButton.displayName = 'TextInputClearButton';
exports.default = TextInputClearButton;
