import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Report} from '@src/types/onyx';
import type {Message} from '@src/types/onyx/ReportAction';
import type ReportAction from '@src/types/onyx/ReportAction';
// eslint-disable-next-line @typescript-eslint/no-deprecated
import {translateLocal} from './Localize';
import Navigation from './Navigation/Navigation';
import Parser from './Parser';
import {getReportActionHtml, getReportActionText} from './ReportActionsUtils';

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
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return {text: translateLocal('task.messages.completed')};
        case CONST.REPORT.ACTIONS.TYPE.TASK_CANCELLED:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return {text: translateLocal('task.messages.canceled')};
        case CONST.REPORT.ACTIONS.TYPE.TASK_REOPENED:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return {text: translateLocal('task.messages.reopened')};
        case CONST.REPORT.ACTIONS.TYPE.TASK_EDITED:
            return {
                text: getReportActionText(action),
                html: getReportActionHtml(action),
            };
        default:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return {text: translateLocal('task.task')};
    }
}

function getTaskTitleFromReport(taskReport?: OnyxEntry<Report>, fallbackTitle = '', shouldReturnMarkdown = false): string {
    // We need to check for reportID, not just reportName, because when a receiver opens the task for the first time,
    // an optimistic report is created with the only property - reportName: 'Chat report',
    // and it will be displayed as the task title without checking for reportID to be present.
    const title = taskReport?.reportID && taskReport.reportName ? taskReport.reportName : fallbackTitle;

    return shouldReturnMarkdown ? Parser.htmlToMarkdown(title) : Parser.htmlToText(title).trim();
}

function getTaskTitle(taskReport?: OnyxEntry<Report>, fallbackTitle = '', shouldReturnMarkdown = false): string {
    return getTaskTitleFromReport(taskReport, fallbackTitle, shouldReturnMarkdown);
}

function getTaskCreatedMessage(reportAction: OnyxEntry<ReportAction>, taskReport?: OnyxEntry<Report>, shouldReturnMarkdown = false) {
    const taskTitle = getTaskTitle(taskReport, reportAction?.childReportName, shouldReturnMarkdown);
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return taskTitle ? translateLocal('task.messages.created', {title: taskTitle}) : '';
}

export {isActiveTaskEditRoute, getTaskReportActionMessage, getTaskTitle, getTaskTitleFromReport, getTaskCreatedMessage};
