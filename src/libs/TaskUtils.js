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
function isTaskAssigneeOrTaskOwner(taskReport, sessionEmail) {
    return sessionEmail === getTaskOwnerEmail(taskReport) || sessionEmail === getTaskAssigneeEmail(taskReport);
};

export {
    // eslint-disable-next-line import/prefer-default-export
    getTaskAssigneeEmail,
    isTaskAssigneeOrTaskOwner,
};
