import type {OnyxEntry} from 'react-native-onyx';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';
import type {Message} from '@src/types/onyx/ReportAction';
import type ReportAction from '@src/types/onyx/ReportAction';
import Navigation from './Navigation/Navigation';
import Parser from './Parser';
import {getReportActionHtml, getReportActionText} from './ReportActionsUtils';

/** Last URL segment for task edit screens (see ROUTES.TASK_TITLE, ROUTES.REPORT_DESCRIPTION, ROUTES.TASK_ASSIGNEE). */
const TASK_EDIT_URL_SUFFIXES = ['title', 'description', 'assignee'] as const;

/**
 * Check if the active route belongs to task edit flow.
 * Matches canonical paths (r/:reportID/title) and dynamic suffix paths (e.g. search/view/:reportID/title, r/:reportID/details/description).
 */
function isActiveTaskEditRoute(reportID: string | undefined): boolean {
    if (!reportID) {
        return false;
    }

    const activeRoute = Navigation.getActiveRoute();
    if (!activeRoute) {
        return false;
    }

    const path = (activeRoute.split('?').at(0) ?? '').replace(/^\//, '').replace(/\/$/, '');
    return TASK_EDIT_URL_SUFFIXES.some((suffix) => path.endsWith(`/${reportID}/${suffix}`));
}

/**
 * Given the Task reportAction name, return the appropriate message to be displayed and copied to clipboard.
 */
function getTaskReportActionMessage(translate: LocalizedTranslate, action: OnyxEntry<ReportAction>): Pick<Message, 'text' | 'html'> {
    switch (action?.actionName) {
        case CONST.REPORT.ACTIONS.TYPE.TASK_COMPLETED:
            return {text: translate('task.messages.completed')};
        case CONST.REPORT.ACTIONS.TYPE.TASK_CANCELLED:
            return {text: translate('task.messages.canceled')};
        case CONST.REPORT.ACTIONS.TYPE.TASK_REOPENED:
            return {text: translate('task.messages.reopened')};
        case CONST.REPORT.ACTIONS.TYPE.TASK_EDITED:
            return {
                text: getReportActionText(action),
                html: getReportActionHtml(action),
            };
        default:
            return {text: translate('task.task')};
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

function getTaskCreatedMessage(translate: LocalizedTranslate, reportAction: OnyxEntry<ReportAction>, taskReport?: OnyxEntry<Report>, shouldReturnMarkdown = false) {
    const taskTitle = getTaskTitle(taskReport, reportAction?.childReportName, shouldReturnMarkdown);
    return taskTitle ? translate('task.messages.created', taskTitle) : '';
}

export {isActiveTaskEditRoute, getTaskReportActionMessage, getTaskTitle, getTaskCreatedMessage};
