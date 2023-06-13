import lodashGet from 'lodash/get';
import * as ReportActionsUtils from './ReportActionsUtils';

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
 * Check if current user is either task assignee or task owner
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
