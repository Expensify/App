"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseExpensiMarkWithShortMentions = parseExpensiMarkWithShortMentions;
exports.decorateRangesWithShortMentions = decorateRangesWithShortMentions;
var react_native_live_markdown_1 = require("@expensify/react-native-live-markdown");
/**
 * Handles possible short mentions inside ranges by verifying if the specific range refers to a user mention/login
 * that is available in passed `availableMentions` list. If yes, then it gets the same styling as normal email mention.
 * In addition, applies special styling to current user.
 */
function decorateRangesWithShortMentions(ranges, text, availableMentions, currentUserMentions) {
    'worklet';
    return ranges
        .map(function (range) {
        if (range.type === 'mention-short') {
            var mentionValue = text.slice(range.start, range.start + range.length);
            if (currentUserMentions === null || currentUserMentions === void 0 ? void 0 : currentUserMentions.includes(mentionValue)) {
                return __assign(__assign({}, range), { type: 'mention-here' });
            }
            if (availableMentions.includes(mentionValue)) {
                return __assign(__assign({}, range), { type: 'mention-user' });
            }
            // If it's neither, we remove the range since no styling will be needed
            return;
        }
        // Iterate over full mentions and see if any is a self mention
        if (range.type === 'mention-user') {
            var mentionValue = text.slice(range.start, range.start + range.length);
            if (currentUserMentions === null || currentUserMentions === void 0 ? void 0 : currentUserMentions.includes(mentionValue)) {
                return __assign(__assign({}, range), { type: 'mention-here' });
            }
        }
        return range;
    })
        .filter(function (maybeRange) { return !!maybeRange; });
}
function parseExpensiMarkWithShortMentions(text, availableMentions, currentUserMentions) {
    'worklet';
    var parsedRanges = (0, react_native_live_markdown_1.parseExpensiMark)(text);
    return decorateRangesWithShortMentions(parsedRanges, text, availableMentions, currentUserMentions);
}
