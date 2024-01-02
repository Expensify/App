import Onyx, {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {Report} from '@src/types/onyx';
import ReportAction from '@src/types/onyx/ReportAction';
import * as CollectionUtils from './CollectionUtils';
import * as Localize from './Localize';

const allReports: Record<string, Report> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    callback: (report, key) => {
        if (!key || !report) {
            return;
        }
        const reportID = CollectionUtils.extractCollectionItemID(key);
        allReports[reportID] = report;
    },
});

/**
 * Given the Task reportAction name, return the appropriate message to be displayed and copied to clipboard.
 */
function getTaskReportActionMessage(actionName: string): string {
    switch (actionName) {
        case CONST.REPORT.ACTIONS.TYPE.TASKCOMPLETED:
            return Localize.translateLocal('task.messages.completed');
        case CONST.REPORT.ACTIONS.TYPE.TASKCANCELLED:
            return Localize.translateLocal('task.messages.canceled');
        case CONST.REPORT.ACTIONS.TYPE.TASKREOPENED:
            return Localize.translateLocal('task.messages.reopened');
        default:
            return Localize.translateLocal('task.task');
    }
}

function getTaskTitle(taskReportID: string, fallbackTitle = ''): string {
    const taskReport = allReports[taskReportID] ?? {};
    // We need to check for reportID, not just reportName, because when a receiver opens the task for the first time,
    // an optimistic report is created with the only property – reportName: 'Chat report',
    // and it will be displayed as the task title without checking for reportID to be present.
    return Object.hasOwn(taskReport, 'reportID') && taskReport.reportName ? taskReport.reportName : fallbackTitle;
}

function getTaskCreatedMessage(reportAction: OnyxEntry<ReportAction>) {
    const taskReportID = reportAction?.childReportID ?? '';
    const taskTitle = getTaskTitle(taskReportID, reportAction?.childReportName);
    return Localize.translateLocal('task.messages.created', {title: taskTitle});
}

export {getTaskReportActionMessage, getTaskTitle, getTaskCreatedMessage};
