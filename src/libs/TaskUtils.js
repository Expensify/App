import lodashGet from 'lodash/get';
import * as ReportActionsUtils from './ReportActionsUtils';

/**
 * Returns the parentReportAction if the given report is a thread/task.
 *
 * @param {Object} taskReport
 * @returns {String|null}
 */
const getTaskAssigneeEmail = (taskReport) => {
    if (!taskReport) {
        return null;
    }

    if (taskReport.managerEmail) {
        return taskReport.managerEmail
    }

    const reportAction = ReportActionsUtils.getParentReportAction(taskReport);
    return lodashGet(reportAction, 'childManagerEmail', null);
}

export {
    getTaskAssigneeEmail,
};
