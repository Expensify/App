import Onyx from 'react-native-onyx';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import * as ReportUtils from '../ReportUtils';
import * as Report from './Report';
import Navigation from '../Navigation/Navigation';
import ROUTES from '../../ROUTES';

let currentUserEmail;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        // When signed out, val is undefined
        if (!val) {
            return;
        }

        currentUserEmail = val.email;
    },
});

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

function createTaskAndNavigate(parentReportID, title, description, assignee) {
    // See if there's already a chat report with the assignee
    const assigneeChatReportID = ReportUtils.getChatByParticipants([assignee]).reportID;

    // Optimistically created Action on the parent
    const optimisticCreatedAction = ReportUtils.buildOptimisticCreatedReportAction(parentReportID);

    // Create the task report
    const optimisticTaskReport = ReportUtils.buildOptimisticTaskReport(currentUserEmail, assignee, parentReportID, optimisticCreatedAction.reportActionID, title, description);

    // Create the CreatedReportAction on the task
    const optimisticTaskCreatedAction = ReportUtils.buildOptimisticCreatedReportAction(optimisticTaskReport.reportID);

    // AddCommentReportAction on the parent chat report
    const AddCommentText = ` created a task: ${title}`;
    Report.addComment(parentReportID, AddCommentText);
    const optimisticAddCommentReportAction = ReportUtils.buildOptimisticAddCommentReportAction(AddCommentText);

    const optimisticData = [
        // {
        //     onyxMethod: CONST.ONYX.METHOD.MERGE,
        //     key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
        //     value: {[optimisticAddCommentReportAction.reportActionID]: optimisticAddCommentReportAction},
        // },

        // {
        //     onyxMethod: CONST.ONYX.METHOD.MERGE,
        //     key: `${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`,
        //     value: {[optimisticCreatedAction.reportActionID]: optimisticCreatedAction},
        // },
        {
            onyxMethod: CONST.ONYX.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticTaskReport.reportID}`,
            value: optimisticTaskReport,
        },
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticTaskReport.reportID}`,
            value: {[optimisticTaskCreatedAction.reportActionID]: optimisticTaskCreatedAction},
        },
    ];

    const successData = [];

    const failureData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticTaskReport.reportID}`,
            value: null,
        },
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticTaskReport.reportID}`,
            value: {[optimisticTaskCreatedAction.reportActionID]: {pendingAction: null}},
        },

        // {
        //     onyxMethod: CONST.ONYX.METHOD.MERGE,
        //     key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
        //     value: {[optimisticCreatedAction.reportActionID]: {pendingAction: null}},
        // },
        // {
        //     onyxMethod: CONST.ONYX.METHOD.MERGE,
        //     key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
        //     value: {[optimisticAddCommentReportAction.reportActionID]: {pendingAction: null}},
        // },
    ];

    console.log('parentReportId', parentReportID, assigneeChatReportID);

    API.write(
        'CreateTask',
        {
            // parentReportActionID: optimisticCreatedAction.reportActionID,
            parentReportActionID: '',
            parentReportID,
            taskReportID: optimisticTaskReport.reportID,
            title,
            description,
            assignee,
            assigneeChatReportID,
        },
        {optimisticData, successData, failureData},
    );

    clearOutTaskInfo();

    // TODO: Navigate to the newly created task
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

function setAssigneeValue(assignee) {
    let newChat = {};
    const chat = ReportUtils.getChatByParticipants([assignee]);
    if (!chat) {
        newChat = ReportUtils.buildOptimisticChatReport([assignee]);
    }
    const reportID = chat ? chat.reportID : newChat.reportID;

    Report.openReport(reportID, [assignee], newChat);

    console.log(reportID);

    // This is only needed for creation of a new task and so it should only be stored locally
    Onyx.merge(ONYXKEYS.TASK, {assignee});
}

function setShareDestinationValue(shareDestination) {
    // This is only needed for creation of a new task and so it should only be stored locally
    Onyx.merge(ONYXKEYS.TASK, {shareDestination});
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
