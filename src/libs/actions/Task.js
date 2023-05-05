import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import * as ReportUtils from '../ReportUtils';
import * as Report from './Report';
import Navigation from '../Navigation/Navigation';
import ROUTES from '../../ROUTES';

/**
 * Clears out the task info from the store
 */
function clearOutTaskInfo() {
    Onyx.set(ONYXKEYS.TASK, null);
}

/**
 * Assign a task to a user
 * Function title is createTask for consistency with the rest of the actions
 * and also because we can create a task without assigning it to anyone
 * @param {String} parentReportID
 * @param {String} title
 * @param {String} description
 * @param {String} assignee
 *
 */

function createTaskAndNavigate(currentUserEmail, parentReportID, title, description, assignee) {
    // Create the task report
    const optimisticTaskReport = ReportUtils.buildOptimisticTaskReport(currentUserEmail, assignee, parentReportID, title, description);

    // Grab the assigneeChatReportID if there is an assignee and if it's not the same as the parentReportID
    // then we create an optimistic add comment report action on the assignee's chat to notify them of the task
    const assigneeChatReportID = ReportUtils.getChatByParticipants([assignee]).reportID;
    let optimisticAssigneeAddComment;
    if (assigneeChatReportID !== parentReportID) {
        optimisticAssigneeAddComment = ReportUtils.buildOptimisticAddCommentReportAction(
            parentReportID,
            `${currentUserEmail} has[created a task for you](tbd/r/${optimisticTaskReport.reportID}): ${title}`,
        );

        // optimisticAssigneeAddComment.reportAction.message[0].taskReportID = optimisticTaskReport.reportID;
    }

    // Create the CreatedReportAction on the task
    const optimisticTaskCreatedAction = ReportUtils.buildOptimisticCreatedReportAction(optimisticTaskReport.reportID);

    const optimisticAddCommentReport = ReportUtils.buildOptimisticAddCommentReportAction(parentReportID, `[Created a task](tbd/r/${optimisticTaskReport.reportID}): ${title}`);

    // optimisticAddCommentReport.reportAction.message[0].taskReportID = optimisticTaskReport.reportID;

    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticTaskReport.reportID}`,
            value: optimisticTaskReport,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticTaskReport.reportID}`,
            value: {[optimisticTaskCreatedAction.reportActionID]: optimisticTaskCreatedAction},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
            value: optimisticAddCommentReport,
        },
    ];

    if (optimisticAssigneeAddComment) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${assigneeChatReportID}`,
            value: {[optimisticAssigneeAddComment.reportActionID]: optimisticAssigneeAddComment},
        });
    }

    const successData = [];

    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticTaskReport.reportID}`,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticTaskReport.reportID}`,
            value: {[optimisticTaskCreatedAction.reportActionID]: {pendingAction: null}},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
            value: {[optimisticAddCommentReport.reportActionID]: {pendingAction: null}},
        },
    ];

    if (optimisticAssigneeAddComment) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${assigneeChatReportID}`,
            value: {[optimisticAssigneeAddComment.reportActionID]: {pendingAction: null}},
        });
    }

    API.write(
        'CreateTask',
        {
            parentReportActionID: optimisticAddCommentReport.reportActionID,
            parentReportID,
            taskReportID: optimisticTaskReport.reportID,
            reportName: optimisticTaskReport.reportName,
            description: optimisticTaskReport.description,
            assignee,
            assigneeChatReportID,
        },
        {optimisticData, successData, failureData},
    );

    clearOutTaskInfo();

    Navigation.navigate(ROUTES.getReportRoute(optimisticTaskReport.reportID));
}

function setDetailsValue(title, description) {
    // This is only needed for creation of a new task and so it should only be stored locally
    Onyx.merge(ONYXKEYS.TASK, {title, description});
}

function setTitleValue(title) {
    Onyx.merge(ONYXKEYS.TASK, {title});
}

function setDescriptionValue(description) {
    Onyx.merge(ONYXKEYS.TASK, {description});
}

function setShareDestinationValue(shareDestination) {
    // This is only needed for creation of a new task and so it should only be stored locally
    Onyx.merge(ONYXKEYS.TASK, {shareDestination});
}

function setAssigneeValue(assignee, shareDestination) {
    let newChat = {};
    const chat = ReportUtils.getChatByParticipants([assignee]);
    if (!chat) {
        newChat = ReportUtils.buildOptimisticChatReport([assignee]);
    }
    const reportID = chat ? chat.reportID : newChat.reportID;

    if (!shareDestination) {
        setShareDestinationValue(reportID);
    }

    Report.openReport(reportID, [assignee], newChat);

    // This is only needed for creation of a new task and so it should only be stored locally
    Onyx.merge(ONYXKEYS.TASK, {assignee});
}

function setParentReportID(parentReportID) {
    // This is only needed for creation of a new task and so it should only be stored locally
    Onyx.merge(ONYXKEYS.TASK, {parentReportID});
}

function clearOutTaskInfoAndNavigate(reportID) {
    clearOutTaskInfo();
    setParentReportID(reportID);
    Navigation.navigate(ROUTES.NEW_TASK_DETAILS);
}

// eslint-disable-next-line import/prefer-default-export
export {
    createTaskAndNavigate, setTitleValue, setDescriptionValue, setDetailsValue, setAssigneeValue, setShareDestinationValue, clearOutTaskInfo, clearOutTaskInfoAndNavigate,
};
