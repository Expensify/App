import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import * as ReportUtils from '../ReportUtils';
import * as Report from './Report';
import Navigation from '../Navigation/Navigation';
import ROUTES from '../../ROUTES';
import * as Environment from '../Environment/Environment';

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
    // Grab the assigneeChatReportID if there is an assignee
    const assigneeChatReportID = ReportUtils.getChatByParticipants([assignee]).reportID;

    // Create the task report
    const optimisticTaskReport = ReportUtils.buildOptimisticTaskReport(currentUserEmail, assignee, parentReportID, title, description);

    // Create the CreatedReportAction on the task
    const optimisticTaskCreatedAction = ReportUtils.buildOptimisticCreatedReportAction(optimisticTaskReport.reportID);

    function getEnvironmentURL() {
        return Environment.getEnvironmentURL().then((environmentURL) => {
            const text = `${environmentURL}/r/${optimisticTaskReport.reportID}`;
            return text;
        });
    }

    getEnvironmentURL().then((text) => {
        Report.addComment(parentReportID, `[Created a task](${text}): ${title}`);
    });

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
    ];

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
    ];

    API.write(
        'CreateTask',
        {
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
