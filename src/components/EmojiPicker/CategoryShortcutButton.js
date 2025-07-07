"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Icon_1 = require("@components/Icon");
var PressableWithoutFeedback_1 = require("@components/Pressable/PressableWithoutFeedback");
var Tooltip_1 = require("@components/Tooltip");
var useLocalize_1 = require("@hooks/useLocalize");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var getButtonState_1 = require("@libs/getButtonState");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
function CategoryShortcutButton(_a) {
    var code = _a.code, icon = _a.icon, onPress = _a.onPress;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _b = (0, react_1.useState)(false), isHighlighted = _b[0], setIsHighlighted = _b[1];
    return (<Tooltip_1.default text={translate("emojiPicker.headers.".concat(code))} shiftVertical={-4}>
            <PressableWithoutFeedback_1.default shouldUseAutoHitSlop={false} onPress={onPress} onHoverIn={function () { return setIsHighlighted(true); }} onHoverOut={function () { return setIsHighlighted(false); }} style={function (_a) {
        var pressed = _a.pressed;
        return [StyleUtils.getButtonBackgroundColorStyle((0, getButtonState_1.default)(false, pressed)), styles.categoryShortcutButton, isHighlighted && styles.emojiItemHighlighted];
    }} accessibilityLabel={"emojiPicker.headers.".concat(code)} role={CONST_1.default.ROLE.BUTTON}>
                <Icon_1.default fill={theme.icon} src={icon} height={variables_1.default.iconSizeNormal} width={variables_1.default.iconSizeNormal}/>
            </PressableWithoutFeedback_1.default>
        </Tooltip_1.default>);
}
CategoryShortcutButton.displayName = 'CategoryShortcutButton';
exports.default = react_1.default.memo(CategoryShortcutButton);
