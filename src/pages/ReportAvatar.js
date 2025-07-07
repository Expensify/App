"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var AttachmentModal_1 = require("@components/AttachmentModal");
var useOnyx_1 = require("@hooks/useOnyx");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportUtils_1 = require("@libs/ReportUtils");
var UserUtils_1 = require("@libs/UserUtils");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function ReportAvatar(_a) {
    var route = _a.route;
    var _b = route.params, reportID = _b.reportID, policyID = _b.policyID;
    var report = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID), { canBeMissing: false })[0];
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), { canBeMissing: true })[0];
    var isLoadingApp = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_LOADING_APP, { initialValue: true, canBeMissing: true })[0];
    var attachment = (0, react_1.useMemo)(function () {
        var _a, _b;
        if ((0, ReportUtils_1.isGroupChat)(report) && !(0, ReportUtils_1.isThread)(report)) {
            return {
                source: (report === null || report === void 0 ? void 0 : report.avatarUrl) ? (0, UserUtils_1.getFullSizeAvatar)(report.avatarUrl, 0) : (0, ReportUtils_1.getDefaultGroupAvatar)(report === null || report === void 0 ? void 0 : report.reportID),
                headerTitle: (0, ReportUtils_1.getReportName)(report),
                isWorkspaceAvatar: false,
            };
        }
        return {
            source: (0, UserUtils_1.getFullSizeAvatar)((0, ReportUtils_1.getWorkspaceIcon)(report, policy).source, 0),
            headerTitle: (0, ReportUtils_1.getPolicyName)({ report: report, policy: policy }),
            // In the case of default workspace avatar, originalFileName prop takes policyID as value to get the color of the avatar
            originalFileName: (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.originalFileName) !== null && _a !== void 0 ? _a : policy === null || policy === void 0 ? void 0 : policy.id) !== null && _b !== void 0 ? _b : report === null || report === void 0 ? void 0 : report.policyID,
            isWorkspaceAvatar: true,
        };
    }, [report, policy]);
    return (<AttachmentModal_1.default headerTitle={attachment.headerTitle} defaultOpen source={attachment.source} onModalClose={function () {
            Navigation_1.default.goBack((report === null || report === void 0 ? void 0 : report.reportID) ? ROUTES_1.default.REPORT_WITH_ID_DETAILS.getRoute(report === null || report === void 0 ? void 0 : report.reportID) : undefined);
        }} isWorkspaceAvatar={attachment.isWorkspaceAvatar} maybeIcon originalFileName={attachment.originalFileName} shouldShowNotFoundPage={!(report === null || report === void 0 ? void 0 : report.reportID) && !isLoadingApp} isLoading={(!(report === null || report === void 0 ? void 0 : report.reportID) || !(policy === null || policy === void 0 ? void 0 : policy.id)) && !!isLoadingApp}/>);
}
ReportAvatar.displayName = 'ReportAvatar';
exports.default = ReportAvatar;
