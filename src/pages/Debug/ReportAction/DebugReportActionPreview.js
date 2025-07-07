"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ScrollView_1 = require("@components/ScrollView");
var useOnyx_1 = require("@hooks/useOnyx");
var ReportActionItem_1 = require("@pages/home/report/ReportActionItem");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function DebugReportActionPreview(_a) {
    var reportAction = _a.reportAction, reportID = _a.reportID;
    var allReports = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.REPORT, { canBeMissing: false })[0];
    var report = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID)];
    return (<ScrollView_1.default>
            <ReportActionItem_1.default allReports={allReports} action={reportAction !== null && reportAction !== void 0 ? reportAction : {}} report={report !== null && report !== void 0 ? report : {}} reportActions={[]} parentReportAction={undefined} displayAsGroup={false} isMostRecentIOUReportAction={false} shouldDisplayNewMarker={false} index={0} isFirstVisibleReportAction={false} shouldDisplayContextMenu={false}/>
        </ScrollView_1.default>);
}
DebugReportActionPreview.displayName = 'DebugReportActionPreview';
exports.default = DebugReportActionPreview;
