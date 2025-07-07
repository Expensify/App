"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ReportUtils_1 = require("@libs/ReportUtils");
function useIsReportReadyToDisplay(report, reportIDFromRoute) {
    /**
     * When false the report is not ready to be fully displayed
     */
    var isCurrentReportLoadedFromOnyx = (0, react_1.useMemo)(function () {
        // This is necessary so that when we are retrieving the next report data from Onyx the ReportActionsView will remount completely
        var isTransitioning = report && (report === null || report === void 0 ? void 0 : report.reportID) !== reportIDFromRoute;
        return reportIDFromRoute !== '' && !!(report === null || report === void 0 ? void 0 : report.reportID) && !isTransitioning;
    }, [report, reportIDFromRoute]);
    var isEditingDisabled = (0, react_1.useMemo)(function () { return !isCurrentReportLoadedFromOnyx || !(0, ReportUtils_1.canUserPerformWriteAction)(report); }, [isCurrentReportLoadedFromOnyx, report]);
    return {
        isCurrentReportLoadedFromOnyx: isCurrentReportLoadedFromOnyx,
        isEditingDisabled: isEditingDisabled,
    };
}
exports.default = useIsReportReadyToDisplay;
