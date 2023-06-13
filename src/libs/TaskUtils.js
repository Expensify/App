import lodashGet from 'lodash/get';
import * as ReportActionsUtils from './ReportActionsUtils';
import CONST from '../CONST';

/**
 * Returns Task assignee email
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

/**
 * Returns Task owner email
 *
 * @param {Object} taskReport
 * @returns {String|null}
 */
function getTaskOwnerEmail(taskReport) {
    return lodashGet(taskReport, 'ownerEmail', null);
}

function isTaskCanceled(taskReport) {
    return taskReport.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && taskReport.statusNum === CONST.REPORT.STATUS.CLOSED;
}

/**
 * Can only Mark Task Complete if:
 *
 * - Current user is either the assignee or the owner
 * - And Task is not canceled
 *
 * @param {Object} taskReport
 * @param {String} sessionEmail
 * @returns {Boolean}
 */
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
