"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useParentReport_1 = require("@hooks/useParentReport");
var useReportIsArchived_1 = require("@hooks/useReportIsArchived");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ReportUtils_1 = require("@libs/ReportUtils");
var TaskUtils_1 = require("@libs/TaskUtils");
var Session_1 = require("@userActions/Session");
var Task_1 = require("@userActions/Task");
var Button_1 = require("./Button");
var OnyxProvider_1 = require("./OnyxProvider");
function TaskHeaderActionButton(_a) {
    var report = _a.report;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var session = (0, OnyxProvider_1.useSession)();
    var parentReport = (0, useParentReport_1.default)(report.reportID);
    var isParentReportArchived = (0, useReportIsArchived_1.default)(parentReport === null || parentReport === void 0 ? void 0 : parentReport.reportID);
    var isTaskActionable = (0, Task_1.canActionTask)(report, session === null || session === void 0 ? void 0 : session.accountID, parentReport, isParentReportArchived);
    if (!(0, ReportUtils_1.canWriteInReport)(report)) {
        return null;
    }
    return (<react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentEnd]}>
            <Button_1.default success isDisabled={!isTaskActionable} text={translate((0, ReportUtils_1.isCompletedTaskReport)(report) ? 'task.markAsIncomplete' : 'task.markAsComplete')} onPress={(0, Session_1.callFunctionIfActionIsAllowed)(function () {
            // If we're already navigating to these task editing pages, early return not to mark as completed, otherwise we would have not found page.
            if ((0, TaskUtils_1.isActiveTaskEditRoute)(report.reportID)) {
                return;
            }
            if ((0, ReportUtils_1.isCompletedTaskReport)(report)) {
                (0, Task_1.reopenTask)(report);
            }
            else {
                (0, Task_1.completeTask)(report);
            }
        })} style={styles.flex1}/>
        </react_native_1.View>);
}
TaskHeaderActionButton.displayName = 'TaskHeaderActionButton';
exports.default = TaskHeaderActionButton;
