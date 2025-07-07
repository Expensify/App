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
var react_native_1 = require("react-native");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var PressableWithoutFeedback_1 = require("@components/Pressable/PressableWithoutFeedback");
var Text_1 = require("@components/Text");
var PopoverAnchorTooltip_1 = require("@components/Tooltip/PopoverAnchorTooltip");
var useLocalize_1 = require("@hooks/useLocalize");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var EmojiPickerAction_1 = require("@libs/actions/EmojiPickerAction");
var getButtonState_1 = require("@libs/getButtonState");
var CONST_1 = require("@src/CONST");
function EmojiPickerButtonDropdown(
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_a, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
ref) {
    var _b = _a.isDisabled, isDisabled = _b === void 0 ? false : _b, _c = _a.withoutOverlay, withoutOverlay = _c === void 0 ? false : _c, onModalHide = _a.onModalHide, onInputChange = _a.onInputChange, value = _a.value, disabled = _a.disabled, style = _a.style, otherProps = __rest(_a, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ["isDisabled", "withoutOverlay", "onModalHide", "onInputChange", "value", "disabled", "style"]);
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var emojiPopoverAnchor = (0, react_1.useRef)(null);
    var translate = (0, useLocalize_1.default)().translate;
    (0, react_1.useEffect)(function () { return EmojiPickerAction_1.resetEmojiPopoverAnchor; }, []);
    var onPress = function () {
        if ((0, EmojiPickerAction_1.isEmojiPickerVisible)()) {
            (0, EmojiPickerAction_1.hideEmojiPicker)();
            return;
        }
        (0, EmojiPickerAction_1.showEmojiPicker)(onModalHide, function (emoji) { return onInputChange(emoji); }, emojiPopoverAnchor, {
            horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
            vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
            shiftVertical: 4,
        }, function () { }, undefined, value, withoutOverlay);
    };
    return (<PopoverAnchorTooltip_1.default text={translate('reportActionCompose.emoji')}>
            <PressableWithoutFeedback_1.default ref={emojiPopoverAnchor} style={[styles.emojiPickerButtonDropdown, style]} disabled={isDisabled} onPress={onPress} id="emojiDropdownButton" accessibilityLabel="statusEmoji" role={CONST_1.default.ROLE.BUTTON}>
                {function (_a) {
            var hovered = _a.hovered, pressed = _a.pressed;
            return (<react_native_1.View style={styles.emojiPickerButtonDropdownContainer}>
                        <Text_1.default style={styles.emojiPickerButtonDropdownIcon} numberOfLines={1}>
                            {
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                value || (<Icon_1.default src={Expensicons.Emoji} fill={StyleUtils.getIconFillColor(CONST_1.default.BUTTON_STATES.DISABLED)}/>)}
                        </Text_1.default>
                        <react_native_1.View style={[styles.popoverMenuIcon, styles.pointerEventsAuto, disabled && styles.cursorDisabled, styles.rotate90]}>
                            <Icon_1.default src={Expensicons.ArrowRight} fill={StyleUtils.getIconFillColor((0, getButtonState_1.default)(hovered, pressed))}/>
                        </react_native_1.View>
                    </react_native_1.View>);
        }}
            </PressableWithoutFeedback_1.default>
        </PopoverAnchorTooltip_1.default>);
}
EmojiPickerButtonDropdown.displayName = 'EmojiPickerButtonDropdown';
exports.default = react_1.default.forwardRef(EmojiPickerButtonDropdown);
