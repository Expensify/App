import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report} from '@src/types/onyx';
import type {Message} from '@src/types/onyx/ReportAction';
import type ReportAction from '@src/types/onyx/ReportAction';
import {translateLocal} from './Localize';
import Navigation from './Navigation/Navigation';
import {getReportActionHtml, getReportActionText} from './ReportActionsUtils';

let allReports: OnyxCollection<Report> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => {
        allReports = value;
    },
});

/**
 * Check if the active route belongs to task edit flow.
 */
function isActiveTaskEditRoute(reportID: string | undefined): boolean {
    if (!reportID) {
        return false;
    }

    return [ROUTES.TASK_TITLE, ROUTES.TASK_ASSIGNEE, ROUTES.REPORT_DESCRIPTION].map((route) => route.getRoute(reportID)).some(Navigation.isActiveRoute);
}

/**
 * Given the Task reportAction name, return the appropriate message to be displayed and copied to clipboard.
 */
function getTaskReportActionMessage(action: OnyxEntry<ReportAction>): Pick<Message, 'text' | 'html'> {
    switch (action?.actionName) {
        case CONST.REPORT.ACTIONS.TYPE.TASK_COMPLETED:
            return {text: translateLocal('task.messages.completed')};
        case CONST.REPORT.ACTIONS.TYPE.TASK_CANCELLED:
            return {text: translateLocal('task.messages.canceled')};
        case CONST.REPORT.ACTIONS.TYPE.TASK_REOPENED:
            return {text: translateLocal('task.messages.reopened')};
        case CONST.REPORT.ACTIONS.TYPE.TASK_EDITED:
            return {
                text: getReportActionText(action),
                html: getReportActionHtml(action),
            };
        default:
            return {text: translateLocal('task.task')};
    }
}

function getTaskTitleFromReport(taskReport: OnyxEntry<Report>, fallbackTitle = ''): string {
    // We need to check for reportID, not just reportName, because when a receiver opens the task for the first time,
    // an optimistic report is created with the only property – reportName: 'Chat report',
    // and it will be displayed as the task title without checking for reportID to be present.
    return taskReport?.reportID && taskReport.reportName ? taskReport.reportName : fallbackTitle;
}

function getTaskTitle(taskReportID: string | undefined, fallbackTitle = ''): string {
    const taskReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${taskReportID}`];
    return getTaskTitleFromReport(taskReport, fallbackTitle);
}

function getTaskCreatedMessage(reportAction: OnyxEntry<ReportAction>) {
    const taskReportID = reportAction?.childReportID;
    const taskTitle = getTaskTitle(taskReportID, reportAction?.childReportName);
    return taskTitle ? translateLocal('task.messages.created', {title: taskTitle}) : '';
}

export {isActiveTaskEditRoute, getTaskReportActionMessage, getTaskTitle, getTaskTitleFromReport, getTaskCreatedMessage};
