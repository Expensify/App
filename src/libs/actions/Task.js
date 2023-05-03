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
 * Function name is createTask for consistency with the rest of the actions
 * and also because we can create a task without assigning it to anyone
 * @param {String} parentReportActionID
 * @param {String} parentReportID
 * @param {String} taskReportID
 * @param {String} name
 * @param {String} description
 * @param {String} assignee
 *
 */

function createTaskAndNavigate(parentReportActionID, parentReportID, name, description, assignee, assigneeChatReportID) {
    let parentReport;
    let sharedReportID = parentReportID;

    // 1. Is there an assignee?
    if (assignee) {
        // 1a. Do we need to message the assignee separately?
        if (!parentReportID) {
            // 1ai1. Grab the chat between assignee and creator (create optimistically if needed)
            parentReport = ReportUtils.getChatByParticipants([assignee]);
            if (!parentReport) {
                parentReport = ReportUtils.buildOptimisticChatReport([assignee]);
            }
        }
    }

    // 2. Is the task shared somewhere?
    if (!parentReportID && !parentReport) {
        // 2b. Set the parentReportID to be the chat between the assignee and creator
        sharedReportID = ReportUtils.getChatByParticipants([assignee]).reportID;
    }

    // Use the parentReport if defined, otherwise use the fetched or provided sharedReportID
    const finalParentReportID = parentReport ? parentReport.reportID : sharedReportID;

    // 3. ALWAYS: Send a message to the parent chat report
    // Create the task report
    const optimisticTaskReport = ReportUtils.buildOptimisticTaskReport(currentUserEmail, assignee, finalParentReportID, parentReportActionID, name, description);

    // Create the CreatedReportAction on the parent chat report
    const optimisticCreatedAction = ReportUtils.buildOptimisticCreatedReportAction(assignee);

    // AddCommentReportAction on the parent chat report
    const optimisticAddCommentReportAction = ReportUtils.buildOptimisticAddCommentReportAction(finalParentReportID, optimisticTaskReport.reportID);

    // Open the parent report if assignee is given
    if (assignee) {
        Report.openReport(finalParentReportID, [assignee]);
    }

    const optimisticData = [
        {
            method: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${finalParentReportID}`,
            value: optimisticCreatedAction,
        },
        {
            method: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${finalParentReportID}`,
            value: parentReport,
        },
        {
            method: CONST.ONYX.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticTaskReport.reportID}`,
            value: optimisticTaskReport,
        },
        optimisticAddCommentReportAction,
    ];

    // Clear out local task data when the task is successfully created
    const successData = [
        {
            method: CONST.ONYX.METHOD.MERGE,
            keys: `${ONYXKEYS.TASK}`,
            value: null,
        },
    ];

    const failureData = [
        {
            method: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${finalParentReportID}`,
            value: null,
        },
        {
            method: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${finalParentReportID}`,
            value: null,
        },
        {
            method: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticTaskReport.reportID}`,
            value: null,
        },
    ];

    API.write(
        'CreateTask',
        {
            parentReportActionID: optimisticCreatedAction.reportActionID,
            parentReportID: finalParentReportID,
            taskReportID: optimisticTaskReport.reportID,
            name,
            description,
            assignee,
            assigneeChatReportID,
        },
        {optimisticData, successData, failureData},
    );

    clearOutTaskInfo();

    // TODO: Navigate to the newly created task
    Navigation.navigate(ROUTES.getReportRoute(parentReportID));
}

function setDetailsValue(name, description) {
    // This is only needed for creation of a new task and so it should only be stored locally
    Onyx.merge(ONYXKEYS.TASK, {name, description});
}

function setTitleValue(name) {
    Onyx.merge(ONYXKEYS.TASK, {name});
}

function setDescriptionValue(description) {
    Onyx.merge(ONYXKEYS.TASK, {description});
}

function setAssigneeValue(assignee) {
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
