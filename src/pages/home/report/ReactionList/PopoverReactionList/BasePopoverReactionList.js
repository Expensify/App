"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var PopoverWithMeasuredContent_1 = require("@components/PopoverWithMeasuredContent");
var withCurrentUserPersonalDetails_1 = require("@components/withCurrentUserPersonalDetails");
var useBasePopoverReactionList_1 = require("@hooks/useBasePopoverReactionList");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var BaseReactionList_1 = require("@pages/home/report/ReactionList/BaseReactionList");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function BasePopoverReactionList(_a, ref) {
    var emojiName = _a.emojiName, reportActionID = _a.reportActionID, currentUserPersonalDetails = _a.currentUserPersonalDetails;
    var preferredLocale = (0, useLocalize_1.default)().preferredLocale;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var reactionReportActionID = reportActionID || CONST_1.default.DEFAULT_NUMBER_ID;
    var emojiReactions = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_REACTIONS).concat(reactionReportActionID), { canBeMissing: true })[0];
    var _b = (0, useBasePopoverReactionList_1.default)({
        emojiName: emojiName,
        emojiReactions: emojiReactions,
        accountID: currentUserPersonalDetails.accountID,
        reportActionID: reportActionID,
        preferredLocale: preferredLocale,
    }), isPopoverVisible = _b.isPopoverVisible, hideReactionList = _b.hideReactionList, showReactionList = _b.showReactionList, popoverAnchorPosition = _b.popoverAnchorPosition, reactionListRef = _b.reactionListRef, getReactionInformation = _b.getReactionInformation;
    // Get the reaction information
    var _c = getReactionInformation(), emojiCodes = _c.emojiCodes, reactionCount = _c.reactionCount, hasUserReacted = _c.hasUserReacted, users = _c.users, isReady = _c.isReady;
    (0, react_1.useImperativeHandle)(ref, function () { return ({ hideReactionList: hideReactionList, showReactionList: showReactionList }); });
    return (<PopoverWithMeasuredContent_1.default isVisible={isPopoverVisible && isReady} onClose={hideReactionList} anchorPosition={popoverAnchorPosition} animationIn="fadeIn" disableAnimation={false} shouldSetModalVisibility={false} fullscreen anchorRef={reactionListRef}>
            <BaseReactionList_1.default isVisible users={users} emojiName={emojiName} emojiCodes={emojiCodes} emojiCount={reactionCount} onClose={hideReactionList} hasUserReacted={hasUserReacted}/>
        </PopoverWithMeasuredContent_1.default>);
}
exports.default = (0, withCurrentUserPersonalDetails_1.default)((0, react_1.forwardRef)(BasePopoverReactionList));
