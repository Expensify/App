"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var sortBy_1 = require("lodash/sortBy");
var react_1 = require("react");
var react_native_1 = require("react-native");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var PopoverAnchorTooltip_1 = require("@components/Tooltip/PopoverAnchorTooltip");
var withCurrentUserPersonalDetails_1 = require("@components/withCurrentUserPersonalDetails");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var EmojiUtils_1 = require("@libs/EmojiUtils");
var ReportScreenContext_1 = require("@pages/home/ReportScreenContext");
var CONST_1 = require("@src/CONST");
var AddReactionBubble_1 = require("./AddReactionBubble");
var EmojiReactionBubble_1 = require("./EmojiReactionBubble");
var ReactionTooltipContent_1 = require("./ReactionTooltipContent");
function ReportActionItemEmojiReactions(_a) {
    var reportAction = _a.reportAction, currentUserPersonalDetails = _a.currentUserPersonalDetails, toggleReaction = _a.toggleReaction, _b = _a.emojiReactions, emojiReactions = _b === void 0 ? {} : _b, _c = _a.shouldBlockReactions, shouldBlockReactions = _c === void 0 ? false : _c, _d = _a.preferredLocale, preferredLocale = _d === void 0 ? CONST_1.default.LOCALES.DEFAULT : _d, setIsEmojiPickerActive = _a.setIsEmojiPickerActive;
    var styles = (0, useThemeStyles_1.default)();
    var reactionListRef = (0, react_1.useContext)(ReportScreenContext_1.ReactionListContext);
    var popoverReactionListAnchors = (0, react_1.useRef)({});
    var reportActionID = reportAction.reportActionID;
    // Each emoji is sorted by the oldest timestamp of user reactions so that they will always appear in the same order for everyone
    var formattedReactions = (0, sortBy_1.default)(Object.entries(emojiReactions !== null && emojiReactions !== void 0 ? emojiReactions : {}).map(function (_a) {
        var emojiName = _a[0], emojiReaction = _a[1];
        var _b = (0, EmojiUtils_1.getEmojiReactionDetails)(emojiName, emojiReaction, currentUserPersonalDetails.accountID), emoji = _b.emoji, emojiCodes = _b.emojiCodes, reactionCount = _b.reactionCount, hasUserReacted = _b.hasUserReacted, userAccountIDs = _b.userAccountIDs, oldestTimestamp = _b.oldestTimestamp;
        if (reactionCount === 0) {
            return null;
        }
        var onPress = function () {
            toggleReaction(emoji, true);
        };
        var onReactionListOpen = function (event) {
            var _a;
            (_a = reactionListRef === null || reactionListRef === void 0 ? void 0 : reactionListRef.current) === null || _a === void 0 ? void 0 : _a.showReactionList(event, popoverReactionListAnchors.current[emojiName], emojiName, reportActionID);
        };
        return {
            emojiCodes: emojiCodes,
            userAccountIDs: userAccountIDs,
            reactionCount: reactionCount,
            hasUserReacted: hasUserReacted,
            oldestTimestamp: oldestTimestamp,
            onPress: onPress,
            onReactionListOpen: onReactionListOpen,
            reactionEmojiName: emojiName,
            pendingAction: emojiReaction.pendingAction,
        };
    }), ['oldestTimestamp']);
    var totalReactionCount = formattedReactions.reduce(function (prev, curr) { return (curr === null ? prev : prev + curr.reactionCount); }, 0);
    return (totalReactionCount > 0 && (<react_native_1.View style={[styles.flexRow, styles.flexWrap, styles.gap1, styles.mt2]}>
                {formattedReactions.map(function (reaction) {
            if (reaction === null) {
                return;
            }
            return (<PopoverAnchorTooltip_1.default renderTooltipContent={function () { return (<ReactionTooltipContent_1.default emojiName={(0, EmojiUtils_1.getLocalizedEmojiName)(reaction.reactionEmojiName, preferredLocale)} emojiCodes={reaction.emojiCodes} accountIDs={reaction.userAccountIDs} currentUserPersonalDetails={currentUserPersonalDetails}/>); }} renderTooltipContentKey={__spreadArray(__spreadArray([], reaction.userAccountIDs.map(String), true), reaction.emojiCodes, true)} key={reaction.reactionEmojiName}>
                            <react_native_1.View>
                                <OfflineWithFeedback_1.default pendingAction={reaction.pendingAction} shouldDisableOpacity={!!reportAction.pendingAction}>
                                    <EmojiReactionBubble_1.default ref={function (ref) {
                    popoverReactionListAnchors.current[reaction.reactionEmojiName] = ref !== null && ref !== void 0 ? ref : null;
                }} count={reaction.reactionCount} emojiCodes={reaction.emojiCodes} onPress={reaction.onPress} hasUserReacted={reaction.hasUserReacted} onReactionListOpen={reaction.onReactionListOpen} shouldBlockReactions={shouldBlockReactions}/>
                                </OfflineWithFeedback_1.default>
                            </react_native_1.View>
                        </PopoverAnchorTooltip_1.default>);
        })}
                {!shouldBlockReactions && (<AddReactionBubble_1.default onSelectEmoji={toggleReaction} reportAction={reportAction} setIsEmojiPickerActive={setIsEmojiPickerActive}/>)}
            </react_native_1.View>));
}
ReportActionItemEmojiReactions.displayName = 'ReportActionItemReactions';
exports.default = (0, withCurrentUserPersonalDetails_1.default)(ReportActionItemEmojiReactions);
