"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var PressableWithSecondaryInteraction_1 = require("@components/PressableWithSecondaryInteraction");
var Text_1 = require("@components/Text");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
function EmojiReactionBubble(_a, ref) {
    var _b;
    var onPress = _a.onPress, _c = _a.onReactionListOpen, onReactionListOpen = _c === void 0 ? function () { } : _c, emojiCodes = _a.emojiCodes, _d = _a.hasUserReacted, hasUserReacted = _d === void 0 ? false : _d, _e = _a.count, count = _e === void 0 ? 0 : _e, _f = _a.isContextMenu, isContextMenu = _f === void 0 ? false : _f, _g = _a.shouldBlockReactions, shouldBlockReactions = _g === void 0 ? false : _g;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    return (<PressableWithSecondaryInteraction_1.default style={function (_a) {
            var hovered = _a.hovered, pressed = _a.pressed;
            return [
                styles.emojiReactionBubble,
                StyleUtils.getEmojiReactionBubbleStyle(hovered || pressed, hasUserReacted, isContextMenu),
                shouldBlockReactions && styles.cursorDisabled,
                styles.userSelectNone,
            ];
        }} onPress={function () {
            if (shouldBlockReactions) {
                return;
            }
            onPress();
        }} onSecondaryInteraction={onReactionListOpen} ref={ref} enableLongPressWithHover={shouldUseNarrowLayout} onMouseDown={function (event) {
            // Allow text input blur when emoji reaction is right clicked
            if ((event === null || event === void 0 ? void 0 : event.button) === 2) {
                return;
            }
            // Prevent text input blur when emoji reaction is left clicked
            event.preventDefault();
        }} role={CONST_1.default.ROLE.BUTTON} accessibilityLabel={emojiCodes.join('')} accessible dataSet={_b = {}, _b[CONST_1.default.SELECTION_SCRAPER_HIDDEN_ELEMENT] = true, _b}>
            <Text_1.default style={[styles.emojiReactionBubbleText, StyleUtils.getEmojiReactionBubbleTextStyle(isContextMenu)]}>{emojiCodes.join('')}</Text_1.default>
            {count > 0 && <Text_1.default style={[styles.reactionCounterText, StyleUtils.getEmojiReactionCounterTextStyle(hasUserReacted)]}>{count}</Text_1.default>}
        </PressableWithSecondaryInteraction_1.default>);
}
EmojiReactionBubble.displayName = 'EmojiReactionBubble';
exports.default = react_1.default.forwardRef(EmojiReactionBubble);
