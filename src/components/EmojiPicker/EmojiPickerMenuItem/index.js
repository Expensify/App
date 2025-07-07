"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var PressableWithoutFeedback_1 = require("@components/Pressable/PressableWithoutFeedback");
var Text_1 = require("@components/Text");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Browser = require("@libs/Browser");
var getButtonState_1 = require("@libs/getButtonState");
var CONST_1 = require("@src/CONST");
function EmojiPickerMenuItem(_a) {
    var emoji = _a.emoji, onPress = _a.onPress, _b = _a.onHoverIn, onHoverIn = _b === void 0 ? function () { } : _b, _c = _a.onHoverOut, onHoverOut = _c === void 0 ? function () { } : _c, _d = _a.onFocus, onFocus = _d === void 0 ? function () { } : _d, _e = _a.onBlur, onBlur = _e === void 0 ? function () { } : _e, _f = _a.isFocused, isFocused = _f === void 0 ? false : _f, _g = _a.isHighlighted, isHighlighted = _g === void 0 ? false : _g;
    var _h = (0, react_1.useState)(false), isHovered = _h[0], setIsHovered = _h[1];
    var ref = (0, react_1.useRef)(null);
    var StyleUtils = (0, useStyleUtils_1.default)();
    var themeStyles = (0, useThemeStyles_1.default)();
    var focusAndScroll = function () {
        if (ref.current && 'focus' in ref.current) {
            ref.current.focus({ preventScroll: true });
        }
        if (ref.current && 'scrollIntoView' in ref.current) {
            ref.current.scrollIntoView({ block: 'nearest' });
        }
    };
    (0, react_1.useEffect)(function () {
        if (!isFocused) {
            return;
        }
        focusAndScroll();
    }, [isFocused]);
    return (<PressableWithoutFeedback_1.default shouldUseAutoHitSlop={false} onPress={function () { return onPress(emoji); }} 
    // In order to prevent haptic feedback, pass empty callback as onLongPress  Please refer https://github.com/necolas/react-native-web/issues/2349#issuecomment-1195564240
    onLongPress={Browser.isMobileChrome() ? function () { } : undefined} onPressOut={Browser.isMobile() ? onHoverOut : undefined} onHoverIn={function () {
            if (onHoverIn) {
                onHoverIn();
            }
            setIsHovered(true);
        }} onHoverOut={function () {
            if (onHoverOut) {
                onHoverOut();
            }
            setIsHovered(false);
        }} onFocus={onFocus} onBlur={onBlur} ref={function (el) {
            ref.current = el !== null && el !== void 0 ? el : null;
        }} style={function (_a) {
            var pressed = _a.pressed;
            return [
                isFocused || isHovered || isHighlighted ? themeStyles.emojiItemHighlighted : {},
                Browser.isMobile() && StyleUtils.getButtonBackgroundColorStyle((0, getButtonState_1.default)(false, pressed)),
                themeStyles.emojiItem,
            ];
        }} accessibilityLabel={emoji} role={CONST_1.default.ROLE.BUTTON}>
            <Text_1.default style={[themeStyles.emojiText]}>{emoji}</Text_1.default>
        </PressableWithoutFeedback_1.default>);
}
// Significantly speeds up re-renders of the EmojiPickerMenu's FlatList
// by only re-rendering at most two EmojiPickerMenuItems that are highlighted/un-highlighted per user action.
exports.default = react_1.default.memo(EmojiPickerMenuItem, function (prevProps, nextProps) { return prevProps.isFocused === nextProps.isFocused && prevProps.isHighlighted === nextProps.isHighlighted && prevProps.emoji === nextProps.emoji; });
