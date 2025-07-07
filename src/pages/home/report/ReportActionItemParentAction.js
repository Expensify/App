"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var useNetwork_1 = require("@hooks/useNetwork");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var onyxSubscribe_1 = require("@libs/onyxSubscribe");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var Report_1 = require("@userActions/Report");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var AnimatedEmptyStateBackground_1 = require("./AnimatedEmptyStateBackground");
var RepliesDivider_1 = require("./RepliesDivider");
var ReportActionItem_1 = require("./ReportActionItem");
var ThreadDivider_1 = require("./ThreadDivider");
function ReportActionItemParentAction(_a) {
    var allReports = _a.allReports, report = _a.report, transactionThreadReport = _a.transactionThreadReport, reportActions = _a.reportActions, parentReportAction = _a.parentReportAction, _b = _a.index, index = _b === void 0 ? 0 : _b, _c = _a.shouldHideThreadDividerLine, shouldHideThreadDividerLine = _c === void 0 ? false : _c, shouldDisplayReplyDivider = _a.shouldDisplayReplyDivider, _d = _a.isFirstVisibleReportAction, isFirstVisibleReportAction = _d === void 0 ? false : _d, _e = _a.shouldUseThreadDividerLine, shouldUseThreadDividerLine = _e === void 0 ? false : _e;
    var styles = (0, useThemeStyles_1.default)();
    var ancestorIDs = (0, react_1.useRef)((0, ReportUtils_1.getAllAncestorReportActionIDs)(report));
    var ancestorReports = (0, react_1.useRef)({});
    var _f = (0, react_1.useState)([]), allAncestors = _f[0], setAllAncestors = _f[1];
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var isInNarrowPaneModal = (0, useResponsiveLayout_1.default)().isInNarrowPaneModal;
    (0, react_1.useEffect)(function () {
        var unsubscribeReports = [];
        var unsubscribeReportActions = [];
        ancestorIDs.current.reportIDs.forEach(function (ancestorReportID) {
            unsubscribeReports.push((0, onyxSubscribe_1.default)({
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(ancestorReportID),
                callback: function (val) {
                    ancestorReports.current[ancestorReportID] = val;
                    //  getAllAncestorReportActions use getReportOrDraftReport to get parent reports which gets the report from allReports that
                    // holds the report collection. However, allReports is not updated by the time this current callback is called.
                    // Therefore we need to pass the up-to-date report to getAllAncestorReportActions so that it uses the up-to-date report value
                    // to calculate, for instance, unread marker.
                    setAllAncestors((0, ReportUtils_1.getAllAncestorReportActions)(report, val));
                },
            }));
            unsubscribeReportActions.push((0, onyxSubscribe_1.default)({
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(ancestorReportID),
                callback: function () {
                    setAllAncestors((0, ReportUtils_1.getAllAncestorReportActions)(report));
                },
            }));
        });
        return function () {
            unsubscribeReports.forEach(function (unsubscribeReport) { return unsubscribeReport(); });
            unsubscribeReportActions.forEach(function (unsubscribeReportAction) { return unsubscribeReportAction(); });
        };
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
    return (<react_native_1.View style={[styles.pRelative]}>
            <AnimatedEmptyStateBackground_1.default />
            {/* eslint-disable-next-line react-compiler/react-compiler */}
            {allAncestors.map(function (ancestor) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
            var ancestorReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(ancestor.report.reportID)];
            var canUserPerformWriteAction = (0, ReportUtils_1.canUserPerformWriteAction)(ancestorReport);
            var shouldDisplayThreadDivider = !(0, ReportActionsUtils_1.isTripPreview)(ancestor.reportAction);
            return (<OfflineWithFeedback_1.default key={ancestor.reportAction.reportActionID} shouldDisableOpacity={!!((_a = ancestor.reportAction) === null || _a === void 0 ? void 0 : _a.pendingAction)} pendingAction={(_d = (_c = (_b = ancestor.report) === null || _b === void 0 ? void 0 : _b.pendingFields) === null || _c === void 0 ? void 0 : _c.addWorkspaceRoom) !== null && _d !== void 0 ? _d : (_f = (_e = ancestor.report) === null || _e === void 0 ? void 0 : _e.pendingFields) === null || _f === void 0 ? void 0 : _f.createChat} errors={(_j = (_h = (_g = ancestor.report) === null || _g === void 0 ? void 0 : _g.errorFields) === null || _h === void 0 ? void 0 : _h.addWorkspaceRoom) !== null && _j !== void 0 ? _j : (_l = (_k = ancestor.report) === null || _k === void 0 ? void 0 : _k.errorFields) === null || _l === void 0 ? void 0 : _l.createChat} errorRowStyles={[styles.ml10, styles.mr2]} onClose={function () { return (0, Report_1.navigateToConciergeChatAndDeleteReport)(ancestor.report.reportID); }}>
                        {shouldDisplayThreadDivider && (<ThreadDivider_1.default ancestor={ancestor} isLinkDisabled={!(0, ReportUtils_1.canCurrentUserOpenReport)((_m = ancestorReports.current) === null || _m === void 0 ? void 0 : _m[(_o = ancestor === null || ancestor === void 0 ? void 0 : ancestor.report) === null || _o === void 0 ? void 0 : _o.reportID])}/>)}
                        <ReportActionItem_1.default allReports={allReports} onPress={(0, ReportUtils_1.canCurrentUserOpenReport)((_p = ancestorReports.current) === null || _p === void 0 ? void 0 : _p[(_q = ancestor === null || ancestor === void 0 ? void 0 : ancestor.report) === null || _q === void 0 ? void 0 : _q.reportID])
                    ? function () { return (0, ReportUtils_1.navigateToLinkedReportAction)(ancestor, isInNarrowPaneModal, canUserPerformWriteAction, isOffline); }
                    : undefined} parentReportAction={parentReportAction} report={ancestor.report} reportActions={reportActions} transactionThreadReport={transactionThreadReport} action={ancestor.reportAction} displayAsGroup={false} isMostRecentIOUReportAction={false} shouldDisplayNewMarker={ancestor.shouldDisplayNewMarker} index={index} isFirstVisibleReportAction={isFirstVisibleReportAction} shouldUseThreadDividerLine={shouldUseThreadDividerLine} isThreadReportParentAction/>
                    </OfflineWithFeedback_1.default>);
        })}
            {shouldDisplayReplyDivider && <RepliesDivider_1.default shouldHideThreadDividerLine={shouldHideThreadDividerLine}/>}
        </react_native_1.View>);
}
ReportActionItemParentAction.displayName = 'ReportActionItemParentAction';
exports.default = ReportActionItemParentAction;
