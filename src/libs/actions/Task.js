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
 * @param {String} parentReportID
 * @param {String} name
 * @param {String} description
 * @param {String} assignee
 *
 */

function createTaskAndNavigate(parentReportID, name, description, assignee) {
    // See if there's already a chat report with the assignee
    const assigneeChatReportID = ReportUtils.getChatByParticipants([assignee]).reportID;

    // Create the CreatedReportAction on the parent chat report
    const optimisticCreatedAction = ReportUtils.buildOptimisticCreatedReportAction(parentReportID);

    // Create the task report
    const optimisticTaskReport = ReportUtils.buildOptimisticTaskReport(currentUserEmail, assignee, parentReportID, optimisticCreatedAction.reportActionID, name, description);

    // AddCommentReportAction on the parent chat report
    const AddCommentText = ` created a task: ${name}`;
    const optimisticAddCommentReportAction = ReportUtils.buildOptimisticAddCommentReportAction(AddCommentText);

    // Open the parent report if assignee is given
    if (assignee) {
        Report.openReport(parentReportID, [assignee]);
    }

    const optimisticData = [
        {
            method: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
            value: {[optimisticCreatedAction.reportActionID]: optimisticCreatedAction},
        },

        // {
        //     method: CONST.ONYX.METHOD.MERGE,
        //     key: `${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`,
        //     value: parentReport,
        // },
        {
            method: CONST.ONYX.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticTaskReport.reportID}`,
            value: optimisticTaskReport,
        },
        optimisticAddCommentReportAction,
    ];

    const successData = [];

    const failureData = [
        {
            method: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
            value: {[optimisticCreatedAction.reportActionID]: {pendingAction: null}},
        },

        // {
        //     method: CONST.ONYX.METHOD.MERGE,
        //     key: `${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`,
        //     value: null,
        // },
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
            parentReportID,
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
