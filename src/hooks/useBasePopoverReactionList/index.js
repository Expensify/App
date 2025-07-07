"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useBasePopoverReactionList;
var react_1 = require("react");
var react_native_1 = require("react-native");
var EmojiUtils = require("@libs/EmojiUtils");
var PersonalDetailsUtils = require("@libs/PersonalDetailsUtils");
function useBasePopoverReactionList(_a) {
    var emojiName = _a.emojiName, emojiReactions = _a.emojiReactions, accountID = _a.accountID, reportActionID = _a.reportActionID, preferredLocale = _a.preferredLocale;
    var _b = (0, react_1.useState)(false), isPopoverVisible = _b[0], setIsPopoverVisible = _b[1];
    var _c = (0, react_1.useState)({ horizontal: 0, vertical: 0 }), cursorRelativePosition = _c[0], setCursorRelativePosition = _c[1];
    var _d = (0, react_1.useState)({ horizontal: 0, vertical: 0 }), popoverAnchorPosition = _d[0], setPopoverAnchorPosition = _d[1];
    var reactionListRef = (0, react_1.useRef)(null);
    function getReactionInformation() {
        var selectedReaction = emojiReactions === null || emojiReactions === void 0 ? void 0 : emojiReactions[emojiName];
        if (!selectedReaction) {
            // If there is no reaction, we return default values
            return {
                emojiName: '',
                reactionCount: 0,
                emojiCodes: [],
                hasUserReacted: false,
                users: [],
                isReady: false,
            };
        }
        var _a = EmojiUtils.getEmojiReactionDetails(emojiName, selectedReaction, accountID), emojiCodes = _a.emojiCodes, reactionCount = _a.reactionCount, hasUserReacted = _a.hasUserReacted, userAccountIDs = _a.userAccountIDs;
        var users = PersonalDetailsUtils.getPersonalDetailsByIDs({ accountIDs: userAccountIDs, currentUserAccountID: accountID, shouldChangeUserDisplayName: true });
        return {
            emojiName: emojiName,
            emojiCodes: emojiCodes,
            reactionCount: reactionCount,
            hasUserReacted: hasUserReacted,
            users: users,
            isReady: true,
        };
    }
    /**
     * Get the BasePopoverReactionList anchor position
     * We calculate the anchor coordinates from measureInWindow async method
     */
    function getReactionListMeasuredLocation() {
        return new Promise(function (resolve) {
            var reactionListAnchor = reactionListRef.current;
            if (reactionListAnchor && 'measureInWindow' in reactionListAnchor) {
                reactionListAnchor.measureInWindow(function (x, y) { return resolve({ x: x, y: y }); });
            }
            else {
                resolve({ x: 0, y: 0 });
            }
        });
    }
    /**
     * Show the ReactionList modal popover.
     *
     * @param event - Object -  A press event.
     * @param reactionListAnchor - Element - reactionListAnchor
     */
    var showReactionList = function (event, reactionListAnchor) {
        // We get the cursor coordinates and the reactionListAnchor coordinates to calculate the popover position
        var nativeEvent = (event === null || event === void 0 ? void 0 : event.nativeEvent) || {};
        reactionListRef.current = reactionListAnchor;
        getReactionListMeasuredLocation().then(function (_a) {
            var x = _a.x, y = _a.y;
            setCursorRelativePosition({ horizontal: nativeEvent.pageX - x, vertical: nativeEvent.pageY - y });
            setPopoverAnchorPosition({
                horizontal: nativeEvent.pageX,
                vertical: nativeEvent.pageY,
            });
            setIsPopoverVisible(true);
        });
    };
    /**
     * Hide the ReactionList modal popover.
     */
    function hideReactionList() {
        setIsPopoverVisible(false);
    }
    (0, react_1.useEffect)(function () {
        var dimensionsEventListener = react_native_1.Dimensions.addEventListener('change', function () {
            if (!isPopoverVisible) {
                // If the popover is not visible, we don't need to update the component
                return;
            }
            getReactionListMeasuredLocation().then(function (_a) {
                var x = _a.x, y = _a.y;
                if (!x || !y) {
                    return;
                }
                setPopoverAnchorPosition({
                    horizontal: cursorRelativePosition.horizontal + x,
                    vertical: cursorRelativePosition.vertical + y,
                });
            });
        });
        return function () {
            dimensionsEventListener.remove();
        };
    }, [
        isPopoverVisible,
        reportActionID,
        preferredLocale,
        cursorRelativePosition.horizontal,
        cursorRelativePosition.vertical,
        popoverAnchorPosition.horizontal,
        popoverAnchorPosition.vertical,
    ]);
    (0, react_1.useEffect)(function () {
        var _a;
        if (!isPopoverVisible) {
            // If the popover is not visible, we don't need to update the component
            return;
        }
        // Hide the list when all reactions are removed
        var users = (_a = emojiReactions === null || emojiReactions === void 0 ? void 0 : emojiReactions[emojiName]) === null || _a === void 0 ? void 0 : _a.users;
        if (!users || Object.keys(users).length > 0) {
            return;
        }
        hideReactionList();
    }, [emojiReactions, emojiName, isPopoverVisible, reportActionID, preferredLocale]);
    return { isPopoverVisible: isPopoverVisible, cursorRelativePosition: cursorRelativePosition, popoverAnchorPosition: popoverAnchorPosition, getReactionInformation: getReactionInformation, hideReactionList: hideReactionList, reactionListRef: reactionListRef, showReactionList: showReactionList };
}
