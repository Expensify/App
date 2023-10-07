import Onyx from 'react-native-onyx';
import CONST from '../CONST';
import ONYXKEYS from '../ONYXKEYS';
import * as Localize from './Localize';
import {Report} from '../types/onyx';
import lodashHas from 'lodash/has';
import * as CollectionUtils from './CollectionUtils';

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

function getTaskTitle(taskReportID: string, taskName: string): string {
    let taskReport = allReports[taskReportID] ?? {};
    return lodashHas(taskReport, 'reportID') && taskReport.reportName ? taskReport.reportName : taskName;
}

export {getTaskReportActionMessage, getTaskTitle};
