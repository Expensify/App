"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Text_1 = require("@components/Text");
var TextWithEllipsis_1 = require("@components/TextWithEllipsis");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ReportUtils = require("@libs/ReportUtils");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function ReportTypingIndicator(_a) {
    var reportID = _a.reportID;
    var translate = (0, useLocalize_1.default)().translate;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var userTypingStatuses = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_USER_IS_TYPING).concat(reportID))[0];
    var styles = (0, useThemeStyles_1.default)();
    var usersTyping = (0, react_1.useMemo)(function () { return Object.keys(userTypingStatuses !== null && userTypingStatuses !== void 0 ? userTypingStatuses : {}).filter(function (loginOrAccountID) { return userTypingStatuses === null || userTypingStatuses === void 0 ? void 0 : userTypingStatuses[loginOrAccountID]; }); }, [userTypingStatuses]);
    var firstUserTyping = usersTyping.at(0);
    var isUserTypingADisplayName = Number.isNaN(Number(firstUserTyping));
    // If we are offline, the user typing statuses are not up-to-date so do not show them
    if (!!isOffline || !firstUserTyping) {
        return null;
    }
    // If the user is typing on OldDot, firstUserTyping will be a string (the user's displayName)
    var firstUserTypingDisplayName = isUserTypingADisplayName
        ? firstUserTyping
        : ReportUtils.getDisplayNameForParticipant({ accountID: Number(firstUserTyping), shouldFallbackToHidden: false });
    if (usersTyping.length === 1) {
        return (<TextWithEllipsis_1.default 
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- nullish coalescing doesn't achieve the same result in this case
        leadingText={firstUserTypingDisplayName || translate('common.someone')} trailingText={" ".concat(translate('reportTypingIndicator.isTyping'))} textStyle={[styles.chatItemComposeSecondaryRowSubText]} wrapperStyle={[styles.chatItemComposeSecondaryRow, styles.flex1]} leadingTextParentStyle={styles.chatItemComposeSecondaryRowOffset}/>);
    }
    return (<Text_1.default style={[styles.chatItemComposeSecondaryRowSubText, styles.chatItemComposeSecondaryRowOffset]} numberOfLines={1}>
            {translate('reportTypingIndicator.multipleMembers')}
            {" ".concat(translate('reportTypingIndicator.areTyping'))}
        </Text_1.default>);
}
ReportTypingIndicator.displayName = 'ReportTypingIndicator';
exports.default = (0, react_1.memo)(ReportTypingIndicator);
