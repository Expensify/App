"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportActionItem_1 = require("@pages/home/report/ReportActionItem");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function DuplicateTransactionItem(_a) {
    var _b;
    var transaction = _a.transaction, index = _a.index, allReports = _a.allReports;
    var styles = (0, useThemeStyles_1.default)();
    var report = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transaction === null || transaction === void 0 ? void 0 : transaction.reportID)];
    var reportActions = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report === null || report === void 0 ? void 0 : report.reportID), { canBeMissing: false })[0];
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/non-nullable-type-assertion-style
    var action = (_b = Object.values(reportActions !== null && reportActions !== void 0 ? reportActions : {})) === null || _b === void 0 ? void 0 : _b.find(function (reportAction) {
        var _a;
        var IOUTransactionID = (0, ReportActionsUtils_1.isMoneyRequestAction)(reportAction) ? (_a = (0, ReportActionsUtils_1.getOriginalMessage)(reportAction)) === null || _a === void 0 ? void 0 : _a.IOUTransactionID : CONST_1.default.DEFAULT_NUMBER_ID;
        return IOUTransactionID === (transaction === null || transaction === void 0 ? void 0 : transaction.transactionID);
    });
    if (!action || !report) {
        return null;
    }
    return (<react_native_1.View style={styles.pb2}>
            <ReportActionItem_1.default allReports={allReports} action={action} report={report} parentReportAction={(0, ReportActionsUtils_1.getReportAction)(report === null || report === void 0 ? void 0 : report.parentReportID, report === null || report === void 0 ? void 0 : report.parentReportActionID)} index={index} reportActions={Object.values(reportActions !== null && reportActions !== void 0 ? reportActions : {})} displayAsGroup={false} shouldDisplayNewMarker={false} isMostRecentIOUReportAction={false} isFirstVisibleReportAction={false} shouldDisplayContextMenu={false}/>
        </react_native_1.View>);
}
DuplicateTransactionItem.displayName = 'DuplicateTransactionItem';
exports.default = DuplicateTransactionItem;
