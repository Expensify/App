import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import type {Message} from '@src/types/onyx/ReportAction';
import type ReportAction from '@src/types/onyx/ReportAction';
import * as Localize from './Localize';

let allReports: OnyxCollection<Report> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (reports) => {
        allReports = reports;
    },
});

/**
 * Given the Task reportAction name, return the appropriate message to be displayed and copied to clipboard.
 */
function getTaskReportActionMessage(action: OnyxEntry<ReportAction>): Pick<Message, 'text' | 'html'> {
    switch (action?.actionName) {
        case CONST.REPORT.ACTIONS.TYPE.TASK_COMPLETED:
            return {text: Localize.translateLocal('task.messages.completed')};
        case CONST.REPORT.ACTIONS.TYPE.TASK_CANCELLED:
            return {text: Localize.translateLocal('task.messages.canceled')};
        case CONST.REPORT.ACTIONS.TYPE.TASK_REOPENED:
            return {text: Localize.translateLocal('task.messages.reopened')};
        case CONST.REPORT.ACTIONS.TYPE.TASK_EDITED:
            return {
                text: action?.message?.[0]?.text ?? '',
                html: action?.message?.[0]?.html,
            };
        default:
            return {text: Localize.translateLocal('task.task')};
    }
}

function getTaskTitle(taskReportID: string, fallbackTitle = ''): string {
    const taskReport = allReports?.[taskReportID] ?? {};
    // We need to check for reportID, not just reportName, because when a receiver opens the task for the first time,
    // an optimistic report is created with the only property – reportName: 'Chat report',
    // and it will be displayed as the task title without checking for reportID to be present.
    return Object.hasOwn(taskReport, 'reportID') && 'reportName' in taskReport && typeof taskReport.reportName === 'string' ? taskReport.reportName : fallbackTitle;
}

function getTaskCreatedMessage(reportAction: OnyxEntry<ReportAction>) {
    const taskReportID = reportAction?.childReportID ?? '';
    const taskTitle = getTaskTitle(taskReportID, reportAction?.childReportName);
    return taskTitle ? Localize.translateLocal('task.messages.created', {title: taskTitle}) : '';
}

export {getTaskReportActionMessage, getTaskTitle, getTaskCreatedMessage};
