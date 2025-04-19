
exports.__esModule = true;
exports.getTaskCreatedMessage = exports.getTaskTitleFromReport = exports.getTaskTitle = exports.getTaskReportActionMessage = exports.isActiveTaskEditRoute = void 0;
const react_native_onyx_1 = require('react-native-onyx');
const CONST_1 = require('@src/CONST');
const ONYXKEYS_1 = require('@src/ONYXKEYS');
const ROUTES_1 = require('@src/ROUTES');
const Localize_1 = require('./Localize');
const Navigation_1 = require('./Navigation/Navigation');
const Parser_1 = require('./Parser');
const ReportActionsUtils_1 = require('./ReportActionsUtils');

let allReports = {};
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback (value) {
        allReports = value;
    },
});
/**
 * Check if the active route belongs to task edit flow.
 */
function isActiveTaskEditRoute(reportID) {
    if (!reportID) {
        return false;
    }
    return [ROUTES_1['default'].TASK_TITLE, ROUTES_1['default'].TASK_ASSIGNEE, ROUTES_1['default'].REPORT_DESCRIPTION]
        .map(function (route) {
            return route.getRoute(reportID);
        })
        .some(Navigation_1['default'].isActiveRoute);
}
exports.isActiveTaskEditRoute = isActiveTaskEditRoute;
/**
 * Given the Task reportAction name, return the appropriate message to be displayed and copied to clipboard.
 */
function getTaskReportActionMessage(action) {
    switch (action === null || action === void 0 ? void 0 : action.actionName) {
        case CONST_1['default'].REPORT.ACTIONS.TYPE.TASK_COMPLETED:
            return {text: Localize_1.translateLocal('task.messages.completed')};
        case CONST_1['default'].REPORT.ACTIONS.TYPE.TASK_CANCELLED:
            return {text: Localize_1.translateLocal('task.messages.canceled')};
        case CONST_1['default'].REPORT.ACTIONS.TYPE.TASK_REOPENED:
            return {text: Localize_1.translateLocal('task.messages.reopened')};
        case CONST_1['default'].REPORT.ACTIONS.TYPE.TASK_EDITED:
            return {
                text: ReportActionsUtils_1.getReportActionText(action),
                html: ReportActionsUtils_1.getReportActionHtml(action),
            };
        default:
            return {text: Localize_1.translateLocal('task.task')};
    }
}
exports.getTaskReportActionMessage = getTaskReportActionMessage;
function getTaskTitleFromReport(taskReport, fallbackTitle, shouldReturnMarkdown) {
    if (fallbackTitle === void 0) {
        fallbackTitle = '';
    }
    if (shouldReturnMarkdown === void 0) {
        shouldReturnMarkdown = false;
    }
    // We need to check for reportID, not just reportName, because when a receiver opens the task for the first time,
    // an optimistic report is created with the only property - reportName: 'Chat report',
    // and it will be displayed as the task title without checking for reportID to be present.
    const title = (taskReport === null || taskReport === void 0 ? void 0 : taskReport.reportID) && taskReport.reportName ? taskReport.reportName : fallbackTitle;
    return shouldReturnMarkdown ? Parser_1['default'].htmlToMarkdown(title) : Parser_1['default'].htmlToText(title).trim();
}
exports.getTaskTitleFromReport = getTaskTitleFromReport;
function getTaskTitle(taskReportID, fallbackTitle, shouldReturnMarkdown) {
    if (fallbackTitle === void 0) {
        fallbackTitle = '';
    }
    if (shouldReturnMarkdown === void 0) {
        shouldReturnMarkdown = false;
    }
    const taskReport = allReports === null || allReports === void 0 ? void 0 : allReports[`${  ONYXKEYS_1['default'].COLLECTION.REPORT  }${taskReportID}`];
    return getTaskTitleFromReport(taskReport, fallbackTitle, shouldReturnMarkdown);
}
exports.getTaskTitle = getTaskTitle;
function getTaskCreatedMessage(reportAction, shouldReturnMarkdown) {
    if (shouldReturnMarkdown === void 0) {
        shouldReturnMarkdown = false;
    }
    const taskReportID = reportAction === null || reportAction === void 0 ? void 0 : reportAction.childReportID;
    const taskTitle = getTaskTitle(taskReportID, reportAction === null || reportAction === void 0 ? void 0 : reportAction.childReportName, shouldReturnMarkdown);
    return taskTitle ? Localize_1.translateLocal('task.messages.created', {title: taskTitle}) : '';
}
exports.getTaskCreatedMessage = getTaskCreatedMessage;
