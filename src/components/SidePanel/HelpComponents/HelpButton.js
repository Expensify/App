"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var Pressable_1 = require("@components/Pressable");
var Tooltip_1 = require("@components/Tooltip");
var useLocalize_1 = require("@hooks/useLocalize");
var useSidePanel_1 = require("@hooks/useSidePanel");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function HelpButton(_a) {
    var style = _a.style;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _b = (0, useSidePanel_1.default)(), openSidePanel = _b.openSidePanel, shouldHideHelpButton = _b.shouldHideHelpButton;
    if (shouldHideHelpButton) {
        return null;
    }
    return (<Tooltip_1.default text={translate('common.help')}>
            <Pressable_1.PressableWithoutFeedback accessibilityLabel={translate('common.help')} style={[styles.flexRow, styles.touchableButtonImage, style]} onPress={openSidePanel}>
                <Icon_1.default src={Expensicons.QuestionMark} fill={theme.icon}/>
            </Pressable_1.PressableWithoutFeedback>
        </Tooltip_1.default>);
}
HelpButton.displayName = 'HelpButton';
exports.default = HelpButton;
