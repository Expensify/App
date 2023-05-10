import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
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
 * @param {String} currentUserEmail
 * @param {String} parentReportID
 * @param {String} title
 * @param {String} description
 * @param {String} assignee
 *
 */

function createTaskAndNavigate(currentUserEmail, parentReportID, title, description, assignee = '') {
    // Create the task report
    const optimisticTaskReport = ReportUtils.buildOptimisticTaskReport(currentUserEmail, assignee, parentReportID, title, description);

    // Grab the assigneeChatReportID if there is an assignee and if it's not the same as the parentReportID
    // then we create an optimistic add comment report action on the assignee's chat to notify them of the task
    const assigneeChatReportID = lodashGet(ReportUtils.getChatByParticipants([assignee]), 'reportID');
    let optimisticAssigneeAddComment;
    if (assigneeChatReportID && assigneeChatReportID !== parentReportID) {
        optimisticAssigneeAddComment = ReportUtils.buildOptimisticAddCommentReportAction(`${currentUserEmail} has[created a task for you](tbd/r/${optimisticTaskReport.reportID}): ${title}`);
        optimisticAssigneeAddComment.reportAction.message[0].taskReportID = optimisticTaskReport.reportID;
    }

    // Create the CreatedReportAction on the task
    const optimisticTaskCreatedAction = ReportUtils.buildOptimisticCreatedReportAction(optimisticTaskReport.reportID);

    const optimisticAddCommentReport = ReportUtils.buildOptimisticAddCommentReportAction(`[Created a task](tbd/r/${optimisticTaskReport.reportID}): ${title}`);
    optimisticAddCommentReport.reportAction.message[0].taskReportID = optimisticTaskReport.reportID;

    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticTaskReport.reportID}`,
            value: optimisticTaskReport,
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticTaskReport.reportID}`,
            value: {[optimisticTaskCreatedAction.reportActionID]: optimisticTaskCreatedAction},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
            value: {[optimisticAddCommentReport.reportAction.reportActionID]: optimisticAddCommentReport.reportAction},
        },
    ];

    if (optimisticAssigneeAddComment) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${assigneeChatReportID}`,
            value: {[optimisticAssigneeAddComment.reportAction.reportActionID]: optimisticAssigneeAddComment.reportAction},
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
            value: {[optimisticAddCommentReport.reportAction.reportActionID]: {pendingAction: null}},
        },
    ];

    if (optimisticAssigneeAddComment) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${assigneeChatReportID}`,
            value: {[optimisticAssigneeAddComment.reportAction.reportActionID]: {pendingAction: null}},
        });
    }

    API.write(
        'CreateTask',
        {
            parentReportActionID: optimisticAddCommentReport.reportAction.reportActionID,
            parentReportID,
            taskReportID: optimisticTaskReport.reportID,
            createdTaskReportActionID: optimisticTaskCreatedAction.reportActionID,
            reportName: optimisticTaskReport.reportName,
            title: optimisticTaskReport.reportName,
            description: optimisticTaskReport.description,
            assignee,
            assigneeChatReportID,
            assigneeChatReportActionID: optimisticAssigneeAddComment ? optimisticAssigneeAddComment.reportAction.reportActionID : 0,
        },
        {optimisticData, successData, failureData},
    );

    clearOutTaskInfo();

    Navigation.navigate(ROUTES.getReportRoute(optimisticTaskReport.reportID));
}

/**
 * Sets the title and description values for the task
 * @param {string} title
  @param {string} description
 */

function setDetailsValue(title, description) {
    // This is only needed for creation of a new task and so it should only be stored locally
    Onyx.merge(ONYXKEYS.TASK, {title, description});
}

/**
 * Sets the title value for the task
 * @param {string} title
 */
function setTitleValue(title) {
    Onyx.merge(ONYXKEYS.TASK, {title});
}

/**
 * Sets the description value for the task
 * @param {string} description
 */
function setDescriptionValue(description) {
    Onyx.merge(ONYXKEYS.TASK, {description});
}

/**
 * Sets the shareDestination value for the task
 * @param {string} shareDestination
 */
function setShareDestinationValue(shareDestination) {
    // This is only needed for creation of a new task and so it should only be stored locally
    Onyx.merge(ONYXKEYS.TASK, {shareDestination});
}

/**
 * Sets the assignee value for the task and checks for an existing chat with the assignee
 * If there is no existing chat, it creates an optimistic chat report
 * It also sets the shareDestination as that chat report if a share destination isn't already set
 * @param {string} assignee
 * @param {string} shareDestination
 */

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

/**
 * Sets the parentReportID value for the task
 * @param {string} parentReportID
 */

function setParentReportID(parentReportID) {
    // This is only needed for creation of a new task and so it should only be stored locally
    Onyx.merge(ONYXKEYS.TASK, {parentReportID});
}

/**
 * Clears out the task info from the store and navigates to the NewTaskDetails page
 * @param {string} reportID
 */
function clearOutTaskInfoAndNavigate(reportID) {
    clearOutTaskInfo();
    setParentReportID(reportID);
    Navigation.navigate(ROUTES.NEW_TASK_DETAILS);
}

export {createTaskAndNavigate, setTitleValue, setDescriptionValue, setDetailsValue, setAssigneeValue, setShareDestinationValue, clearOutTaskInfo, clearOutTaskInfoAndNavigate};
