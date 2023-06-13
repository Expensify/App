import lodashGet from 'lodash/get';
import * as ReportActionsUtils from './ReportActionsUtils';
import CONST from '../CONST';

/**
 * Returns the parentReportAction if the given report is a thread/task.
 *
 * @param {Object} taskReport
 * @returns {String|null}
 */
function getTaskAssigneeEmail(taskReport) {
    if (!taskReport) {
        return null;
    }

    if (taskReport.managerEmail) {
        return taskReport.managerEmail
    }

    const reportAction = ReportActionsUtils.getParentReportAction(taskReport);
    return lodashGet(reportAction, 'childManagerEmail', null);
}

function getTaskOwnerEmail(taskReport) {
    return lodashGet(taskReport, 'ownerEmail', null);
}

function isTaskCanceled(taskReport) {
    return taskReport.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && taskReport.statusNum === CONST.REPORT.STATUS.CLOSED;
}

function canMarkTaskComplete(taskReport, sessionEmail) {
    const taskAssigneeEmail = getTaskAssigneeEmail(taskReport);
    const taskOwnerEmail = getTaskOwnerEmail(taskReport);

    return (taskAssigneeEmail === sessionEmail || taskOwnerEmail === sessionEmail) && !isTaskCanceled(taskReport);
};

export {
    // eslint-disable-next-line import/prefer-default-export
    getTaskAssigneeEmail,
    canMarkTaskComplete,
    isTaskCanceled,
};
