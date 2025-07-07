"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var EmojiUtils = require("@libs/EmojiUtils");
function HeaderReactionList(_a) {
    var emojiCodes = _a.emojiCodes, emojiCount = _a.emojiCount, emojiName = _a.emojiName, _b = _a.hasUserReacted, hasUserReacted = _b === void 0 ? false : _b;
    var _c = (0, useThemeStyles_1.default)(), flexRow = _c.flexRow, justifyContentBetween = _c.justifyContentBetween, alignItemsCenter = _c.alignItemsCenter, emojiReactionListHeader = _c.emojiReactionListHeader, pt4 = _c.pt4, emojiReactionListHeaderBubble = _c.emojiReactionListHeaderBubble, miniQuickEmojiReactionText = _c.miniQuickEmojiReactionText, reactionCounterText = _c.reactionCounterText, reactionListHeaderText = _c.reactionListHeaderText;
    var _d = (0, useStyleUtils_1.default)(), getEmojiReactionBubbleStyle = _d.getEmojiReactionBubbleStyle, getEmojiReactionBubbleTextStyle = _d.getEmojiReactionBubbleTextStyle, getEmojiReactionCounterTextStyle = _d.getEmojiReactionCounterTextStyle;
    var preferredLocale = (0, useLocalize_1.default)().preferredLocale;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    return (<react_native_1.View style={[flexRow, justifyContentBetween, alignItemsCenter, emojiReactionListHeader, !shouldUseNarrowLayout && pt4]}>
            <react_native_1.View style={flexRow}>
                <react_native_1.View style={[emojiReactionListHeaderBubble, getEmojiReactionBubbleStyle(false, hasUserReacted)]}>
                    <Text_1.default style={[miniQuickEmojiReactionText, getEmojiReactionBubbleTextStyle(true)]}>{emojiCodes.join('')}</Text_1.default>
                    <Text_1.default style={[reactionCounterText, getEmojiReactionCounterTextStyle(hasUserReacted)]}>{emojiCount}</Text_1.default>
                </react_native_1.View>
                <Text_1.default style={reactionListHeaderText}>{":".concat(EmojiUtils.getLocalizedEmojiName(emojiName, preferredLocale), ":")}</Text_1.default>
            </react_native_1.View>
        </react_native_1.View>);
}
HeaderReactionList.displayName = 'HeaderReactionList';
exports.default = HeaderReactionList;
