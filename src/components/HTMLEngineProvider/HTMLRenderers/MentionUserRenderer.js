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
var expensify_common_1 = require("expensify-common");
var cloneDeep_1 = require("lodash/cloneDeep");
var isEmpty_1 = require("lodash/isEmpty");
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_render_html_1 = require("react-native-render-html");
var ShowContextMenuContext_1 = require("@components/ShowContextMenuContext");
var Text_1 = require("@components/Text");
var UserDetailsTooltip_1 = require("@components/UserDetailsTooltip");
var withCurrentUserPersonalDetails_1 = require("@components/withCurrentUserPersonalDetails");
var useOnyx_1 = require("@hooks/useOnyx");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var LocalePhoneNumber_1 = require("@libs/LocalePhoneNumber");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PersonalDetailsUtils_1 = require("@libs/PersonalDetailsUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var asMutable_1 = require("@src/types/utils/asMutable");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function MentionUserRenderer(_a) {
    var _b, _c, _d, _e, _f, _g;
    var style = _a.style, tnode = _a.tnode, TDefaultRenderer = _a.TDefaultRenderer, currentUserPersonalDetails = _a.currentUserPersonalDetails, defaultRendererProps = __rest(_a, ["style", "tnode", "TDefaultRenderer", "currentUserPersonalDetails"]);
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var htmlAttribAccountID = tnode.attributes.accountid;
    var personalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, { canBeMissing: true })[0];
    var htmlAttributeAccountID = tnode.attributes.accountid;
    var accountID;
    var mentionDisplayText;
    var navigationRoute;
    var tnodeClone = (0, cloneDeep_1.default)(tnode);
    if (!(0, isEmpty_1.default)(htmlAttribAccountID) && (personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[htmlAttribAccountID])) {
        var user = personalDetails[htmlAttribAccountID];
        accountID = parseInt(htmlAttribAccountID, 10);
        mentionDisplayText = (0, LocalePhoneNumber_1.formatPhoneNumber)((_b = user === null || user === void 0 ? void 0 : user.login) !== null && _b !== void 0 ? _b : '') || (0, PersonalDetailsUtils_1.getDisplayNameOrDefault)(user);
        mentionDisplayText = (_d = (0, PersonalDetailsUtils_1.getShortMentionIfFound)(mentionDisplayText, htmlAttributeAccountID, currentUserPersonalDetails, (_c = user === null || user === void 0 ? void 0 : user.login) !== null && _c !== void 0 ? _c : '')) !== null && _d !== void 0 ? _d : '';
        navigationRoute = ROUTES_1.default.PROFILE.getRoute(accountID, Navigation_1.default.getReportRHPActiveRoute());
    }
    else if ('data' in tnodeClone && !(0, EmptyObject_1.isEmptyObject)(tnodeClone.data)) {
        // We need to remove the LTR unicode and leading @ from data as it is not part of the login
        mentionDisplayText = tnodeClone.data.replace(CONST_1.default.UNICODE.LTR, '').slice(1);
        // We need to replace tnode.data here because we will pass it to TNodeChildrenRenderer below
        (0, asMutable_1.default)(tnodeClone).data = tnodeClone.data.replace(mentionDisplayText, expensify_common_1.Str.removeSMSDomain((_e = (0, PersonalDetailsUtils_1.getShortMentionIfFound)(mentionDisplayText, htmlAttributeAccountID, currentUserPersonalDetails)) !== null && _e !== void 0 ? _e : ''));
        accountID = (_g = (_f = (0, PersonalDetailsUtils_1.getAccountIDsByLogins)([mentionDisplayText])) === null || _f === void 0 ? void 0 : _f.at(0)) !== null && _g !== void 0 ? _g : -1;
        navigationRoute = ROUTES_1.default.PROFILE.getRoute(accountID, Navigation_1.default.getReportRHPActiveRoute(), mentionDisplayText);
        mentionDisplayText = expensify_common_1.Str.removeSMSDomain(mentionDisplayText);
    }
    else {
        // If neither an account ID or email is provided, don't render anything
        return null;
    }
    var isOurMention = accountID === currentUserPersonalDetails.accountID;
    var flattenStyle = react_native_1.StyleSheet.flatten(style);
    var color = flattenStyle.color, styleWithoutColor = __rest(flattenStyle, ["color"]);
    return (<ShowContextMenuContext_1.ShowContextMenuContext.Consumer>
            {function (_a) {
            var onShowContextMenu = _a.onShowContextMenu, anchor = _a.anchor, report = _a.report, isReportArchived = _a.isReportArchived, action = _a.action, checkIfContextMenuActive = _a.checkIfContextMenuActive, isDisabled = _a.isDisabled, shouldDisplayContextMenu = _a.shouldDisplayContextMenu;
            return (<Text_1.default suppressHighlighting onLongPress={function (event) {
                    if (isDisabled || !shouldDisplayContextMenu) {
                        return;
                    }
                    return onShowContextMenu(function () {
                        return (0, ShowContextMenuContext_1.showContextMenuForReport)(event, anchor, report === null || report === void 0 ? void 0 : report.reportID, action, checkIfContextMenuActive, (0, ReportUtils_1.isArchivedNonExpenseReport)(report, isReportArchived));
                    });
                }} onPress={function (event) {
                    event.preventDefault();
                    if (!(0, isEmpty_1.default)(htmlAttribAccountID)) {
                        Navigation_1.default.navigate(ROUTES_1.default.PROFILE.getRoute(parseInt(htmlAttribAccountID, 10), Navigation_1.default.getReportRHPActiveRoute()));
                        return;
                    }
                    Navigation_1.default.navigate(ROUTES_1.default.PROFILE.getRoute(accountID, Navigation_1.default.getReportRHPActiveRoute(), mentionDisplayText));
                }} role={CONST_1.default.ROLE.LINK} accessibilityLabel={"/".concat(navigationRoute)}>
                    <UserDetailsTooltip_1.default accountID={accountID} fallbackUserDetails={{
                    displayName: mentionDisplayText,
                }}>
                        <Text_1.default 
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...defaultRendererProps} style={[styles.link, styleWithoutColor, StyleUtils.getMentionStyle(isOurMention), { color: StyleUtils.getMentionTextColor(isOurMention) }]} role={CONST_1.default.ROLE.LINK} testID="mention-user" href={"/".concat(navigationRoute)}>
                            {htmlAttribAccountID ? "@".concat(mentionDisplayText) : <react_native_render_html_1.TNodeChildrenRenderer tnode={tnodeClone}/>}
                        </Text_1.default>
                    </UserDetailsTooltip_1.default>
                </Text_1.default>);
        }}
        </ShowContextMenuContext_1.ShowContextMenuContext.Consumer>);
}
MentionUserRenderer.displayName = 'MentionUserRenderer';
exports.default = (0, withCurrentUserPersonalDetails_1.default)(MentionUserRenderer);
