import CONST from '../CONST';
import * as ReportUtils from './ReportUtils';
/**
 * @param {Object} reportAction
 * @param {Function} translate
 * @returns {string}
 */
function getTaskReportActionMessage(reportAction, translate) {
    const taskReport = ReportUtils.getReport(reportAction.originalMessage.taskReportID.toString());
    const taskReportName = taskReport.reportName || '';

    let taskStatusText = '';
    switch (reportAction.actionName) {
        case CONST.REPORT.ACTIONS.TYPE.TASKCOMPLETED:
            taskStatusText = translate('task.messages.completed');
            break;
        case CONST.REPORT.ACTIONS.TYPE.TASKCANCELLED:
            taskStatusText = translate('task.messages.canceled');
            break;
        case CONST.REPORT.ACTIONS.TYPE.TASKREOPENED:
            taskStatusText = translate('task.messages.reopened');
            break;
        default:
            taskStatusText = translate('task.task');
    }
    return `${taskStatusText} ${taskReportName}`;
}

export default getTaskReportActionMessage;
