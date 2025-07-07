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
var ShowContextMenuContext_1 = require("@components/ShowContextMenuContext");
var Text_1 = require("@components/Text");
var useCurrentReportID_1 = require("@hooks/useCurrentReportID");
var useOnyx_1 = require("@hooks/useOnyx");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var MentionUtils_1 = require("@libs/MentionUtils");
var isSearchTopmostFullScreenRoute_1 = require("@libs/Navigation/helpers/isSearchTopmostFullScreenRoute");
var Navigation_1 = require("@navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var MentionReportContext_1 = require("./MentionReportContext");
function MentionReportRenderer(_a) {
    var style = _a.style, tnode = _a.tnode, TDefaultRenderer = _a.TDefaultRenderer, defaultRendererProps = __rest(_a, ["style", "tnode", "TDefaultRenderer"]);
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var htmlAttributeReportID = tnode.attributes.reportid;
    var _b = (0, react_1.useContext)(MentionReportContext_1.default), currentReportIDContext = _b.currentReportID, exactlyMatch = _b.exactlyMatch;
    var reports = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.REPORT)[0];
    var currentReportID = (0, useCurrentReportID_1.default)();
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var currentReportIDValue = currentReportIDContext || (currentReportID === null || currentReportID === void 0 ? void 0 : currentReportID.currentReportID);
    var currentReport = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(currentReportIDValue))[0];
    // When we invite someone to a room they don't have the policy object, but we still want them to be able to see and click on report mentions, so we only check if the policyID in the report is from a workspace
    var isGroupPolicyReport = (0, react_1.useMemo)(function () { return currentReport && !(0, EmptyObject_1.isEmptyObject)(currentReport) && !!currentReport.policyID && currentReport.policyID !== CONST_1.default.POLICY.ID_FAKE; }, [currentReport]);
    var mentionDetails = (0, MentionUtils_1.getReportMentionDetails)(htmlAttributeReportID, currentReport, reports, tnode);
    if (!mentionDetails) {
        return null;
    }
    var reportID = mentionDetails.reportID, mentionDisplayText = mentionDetails.mentionDisplayText;
    var navigationRoute = reportID ? ROUTES_1.default.REPORT_WITH_ID.getRoute(reportID) : undefined;
    var backTo = Navigation_1.default.getActiveRoute();
    if ((0, isSearchTopmostFullScreenRoute_1.default)()) {
        navigationRoute = reportID ? ROUTES_1.default.SEARCH_REPORT.getRoute({ reportID: reportID, backTo: backTo }) : undefined;
    }
    var isCurrentRoomMention = reportID === currentReportIDValue;
    var flattenStyle = react_native_1.StyleSheet.flatten(style);
    var color = flattenStyle.color, styleWithoutColor = __rest(flattenStyle, ["color"]);
    return (<ShowContextMenuContext_1.ShowContextMenuContext.Consumer>
            {function () { return (<Text_1.default 
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...defaultRendererProps} style={isGroupPolicyReport && (!exactlyMatch || navigationRoute)
                ? [styles.link, styleWithoutColor, StyleUtils.getMentionStyle(isCurrentRoomMention), { color: StyleUtils.getMentionTextColor(isCurrentRoomMention) }]
                : [flattenStyle]} suppressHighlighting onPress={navigationRoute && isGroupPolicyReport
                ? function (event) {
                    event.preventDefault();
                    Navigation_1.default.navigate(navigationRoute);
                }
                : undefined} role={isGroupPolicyReport ? CONST_1.default.ROLE.LINK : undefined} accessibilityLabel={isGroupPolicyReport ? "/".concat(navigationRoute) : undefined}>
                    #{mentionDisplayText}
                </Text_1.default>); }}
        </ShowContextMenuContext_1.ShowContextMenuContext.Consumer>);
}
MentionReportRenderer.displayName = 'MentionReportRenderer';
exports.default = MentionReportRenderer;
