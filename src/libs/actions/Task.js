import * as API from '../API';
import * as ReportUtils from '../ReportUtils';
import * as Report from './Report';

/**
 * Assign a task to a user
 * @param {String} parentReportActionID
 * @param {String} parentReportID
 * @param {String} taskReportID
 * @param {String} name
 * @param {String} description
 * @param {String} assignee
 * @param {String} ownerEmail
 *
 */

function assignTask(parentReportActionID, parentReportID, taskReportID, name, description, assignee, assigneeChatReportID, ownerEmail) {
    let parentReport;

    // If there isn't a parentReportId provided and assignee is given, we need to optimistically create a new parent chat report
    // between the task creator and the assignee.
    if (!parentReportID && assignee) {
        parentReport = ReportUtils.getChatByParticipants([assignee]);
    }

    if (!parentReportID && !parentReport && assignee) {
        parentReport = ReportUtils.buildOptimisticChatReport([assignee]);
    }

    // If parentReport is defined, use its reportID, otherwise, use the provided parentReportID
    const finalParentReportID = parentReport ? parentReport.reportID : parentReportID;

    // Open the parent report if assignee is given
    if (assignee) {
        Report.openReport(finalParentReportID, [assignee]);
    }

    const optimisticCreatedAction = ReportUtils.buildOptimisticCreatedReportAction(ownerEmail);

    const optimisticTaskReport = ReportUtils.buildOptimisticTaskReport(ownerEmail, assignee, finalParentReportID, parentReportActionID, name, description);

    // AddCommentReportAction on the parent chat report
    const optimisticAddCommentReportAction = ReportUtils.buildOptimisticAddCommentReportAction(finalParentReportID, optimisticTaskReport.reportID);

    const optimisticData = [optimisticCreatedAction, optimisticTaskReport, optimisticAddCommentReportAction];

    const successData = {};

    const failureData = {
        undoActions: [
            {
                method: 'DELETE_TASK_REPORT',
                reportID: optimisticTaskReport.reportID,
            },
            {
                method: 'DELETE_REPORT_ACTION',
                reportID: finalParentReportID,
                actionID: optimisticCreatedAction.actionID,
            },
            {
                method: 'DELETE_ADD_COMMENT_REPORT_ACTION',
                reportID: finalParentReportID,
                actionID: optimisticAddCommentReportAction.actionID,
            },
        ],
    };

    return API.write(
        'CreateTask',
        {
            parentReportActionID,
            parentReportID: finalParentReportID,
            taskReportID,
            name,
            description,
            assignee,
            assigneeChatReportID,
        },
        {optimisticData, successData, failureData},
    );
}

// eslint-disable-next-line import/prefer-default-export
export {assignTask};
