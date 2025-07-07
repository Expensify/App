"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Banner_1 = require("@components/Banner");
var Expensicons = require("@components/Icon/Expensicons");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var PolicyUtils = require("@libs/PolicyUtils");
var Navigation_1 = require("@navigation/Navigation");
var ReportInstance = require("@userActions/Report");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function SystemChatReportFooterMessage() {
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var currentUserLogin = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { selector: function (session) { return session === null || session === void 0 ? void 0 : session.email; } })[0];
    var choice = (0, useOnyx_1.default)(ONYXKEYS_1.default.ONBOARDING_PURPOSE_SELECTED)[0];
    var policies = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY)[0];
    var activePolicyID = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_ACTIVE_POLICY_ID)[0];
    var adminChatReportID = (0, react_1.useMemo)(function () {
        var _a;
        var adminPolicy = activePolicyID
            ? // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
                // eslint-disable-next-line deprecation/deprecation
                PolicyUtils.getPolicy(activePolicyID)
            : Object.values(policies !== null && policies !== void 0 ? policies : {}).find(function (policy) { return PolicyUtils.shouldShowPolicy(policy, false, currentUserLogin) && (policy === null || policy === void 0 ? void 0 : policy.role) === CONST_1.default.POLICY.ROLE.ADMIN && (policy === null || policy === void 0 ? void 0 : policy.chatReportIDAdmins); });
        return String((_a = adminPolicy === null || adminPolicy === void 0 ? void 0 : adminPolicy.chatReportIDAdmins) !== null && _a !== void 0 ? _a : -1);
    }, [activePolicyID, policies, currentUserLogin]);
    var adminChatReport = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(adminChatReportID))[0];
    var content = (0, react_1.useMemo)(function () {
        var _a;
        switch (choice) {
            case CONST_1.default.ONBOARDING_CHOICES.MANAGE_TEAM:
                return (<>
                        {translate('systemChatFooterMessage.newDotManageTeam.phrase1')}
                        <TextLink_1.default onPress={function () { var _a; return Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID.getRoute((_a = adminChatReport === null || adminChatReport === void 0 ? void 0 : adminChatReport.reportID) !== null && _a !== void 0 ? _a : '-1')); }}>
                            {(_a = adminChatReport === null || adminChatReport === void 0 ? void 0 : adminChatReport.reportName) !== null && _a !== void 0 ? _a : CONST_1.default.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}
                        </TextLink_1.default>
                        {translate('systemChatFooterMessage.newDotManageTeam.phrase2')}
                    </>);
            default:
                return (<>
                        {translate('systemChatFooterMessage.default.phrase1')}
                        <TextLink_1.default onPress={function () { return ReportInstance.navigateToConciergeChat(); }}>{CONST_1.default === null || CONST_1.default === void 0 ? void 0 : CONST_1.default.CONCIERGE_CHAT_NAME}</TextLink_1.default>
                        {translate('systemChatFooterMessage.default.phrase2')}
                    </>);
        }
    }, [adminChatReport === null || adminChatReport === void 0 ? void 0 : adminChatReport.reportName, adminChatReport === null || adminChatReport === void 0 ? void 0 : adminChatReport.reportID, choice, translate]);
    return (<Banner_1.default containerStyles={[styles.chatFooterBanner]} shouldShowIcon icon={Expensicons.Lightbulb} content={<Text_1.default suppressHighlighting style={styles.flex1}>
                    {content}
                </Text_1.default>}/>);
}
SystemChatReportFooterMessage.displayName = 'SystemChatReportFooterMessage';
exports.default = SystemChatReportFooterMessage;
