"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Text_1 = require("@components/Text");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function AgentZeroProcessingRequestIndicator(_a) {
    var reportID = _a.reportID;
    var styles = (0, useThemeStyles_1.default)();
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var reportNameValuePairs = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(reportID), { canBeMissing: true })[0];
    var userTypingStatuses = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_USER_IS_TYPING).concat(reportID), { canBeMissing: true })[0];
    // Check if anyone is currently typing
    var usersTyping = (0, react_1.useMemo)(function () { return Object.keys(userTypingStatuses !== null && userTypingStatuses !== void 0 ? userTypingStatuses : {}).filter(function (loginOrAccountID) { return userTypingStatuses === null || userTypingStatuses === void 0 ? void 0 : userTypingStatuses[loginOrAccountID]; }); }, [userTypingStatuses]);
    var isAnyoneTyping = usersTyping.length > 0;
    // Don't show if offline, if anyone is typing (typing indicator takes precedence), or if the indicator doesn't exist
    if (isOffline || isAnyoneTyping || !(reportNameValuePairs === null || reportNameValuePairs === void 0 ? void 0 : reportNameValuePairs.agentZeroProcessingRequestIndicator)) {
        return null;
    }
    return (<Text_1.default style={[styles.chatItemComposeSecondaryRowSubText, styles.chatItemComposeSecondaryRowOffset]} numberOfLines={1}>
            {reportNameValuePairs.agentZeroProcessingRequestIndicator}
        </Text_1.default>);
}
AgentZeroProcessingRequestIndicator.displayName = 'AgentZeroProcessingRequestIndicator';
exports.default = (0, react_1.memo)(AgentZeroProcessingRequestIndicator);
