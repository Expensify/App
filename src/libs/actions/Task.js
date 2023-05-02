import Onyx from 'react-native-onyx';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import * as ReportUtils from '../ReportUtils';
import * as Report from './Report';
import Navigation from '../Navigation/Navigation';
import ROUTES from '../../ROUTES';

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
 * @param {String} ownerEmail
 *
 */

function createTaskAndNavigate(parentReportActionID, parentReportID, taskReportID, name, description, assignee, assigneeChatReportID, ownerEmail) {
    /**
     *
     * This flow can be pretty confusing just because there is so much going on - throwing down some thoughts to see if we can simplify this flow a bit

        // Is there an assignee?
        YES - Let's check if we need to message the assignee separately (Is task shared in a group chat / room / DM the assignee)
        NO - Great, no need to create a seperate chat report

        // Is the task shared somewhere?
        YES - Cool, the place where the task is shared will always exist
        NO - By default, the parentReportID will be the chat between the assignee and creator.

        Task must have either an assignee OR a place where it is shared.
        Doesn't need both - but needs one or the other.
        If the task only has an assignee, we infer that it is shared in the DM.

        // Do we need to message the assignee separately?
        YES - Grab the chat between assignee and creator (if needed create optimistically) and then send them the task
        NO - Nice

        // ALWAYS
        We will always send a message to the parent chat report
     *
    */
    // let parentReport;

    // // If there isn't a parentReportId provided and assignee is given, we need to optimistically create a new parent chat report
    // // between the task creator and the assignee.
    // if (!parentReportID && assignee) {
    //     parentReport = ReportUtils.getChatByParticipants([assignee]);
    //     if (!parentReport) {
    //         parentReport = ReportUtils.buildOptimisticChatReport([assignee]);
    //     }
    // }

    // // If parentReport is defined, use its reportID, otherwise, use the provided parentReportID
    // const finalParentReportID = parentReport ? parentReport.reportID : parentReportID;

    // // Open the parent report if assignee is given
    // if (assignee) {
    //     Report.openReport(finalParentReportID, [assignee]);
    // }

    // // Create the task report
    // const optimisticTaskReport = ReportUtils.buildOptimisticTaskReport(ownerEmail, assignee, finalParentReportID, parentReportActionID, name, description);

    // // Create the CreatedReportAction on the parent chat report
    // const optimisticCreatedAction = ReportUtils.buildOptimisticCreatedReportAction(ownerEmail);

    // // AddCommentReportAction on the parent chat report
    // const optimisticAddCommentReportAction = ReportUtils.buildOptimisticAddCommentReportAction(finalParentReportID, optimisticTaskReport.reportID);

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
    const optimisticTaskReport = ReportUtils.buildOptimisticTaskReport(ownerEmail, assignee, finalParentReportID, parentReportActionID, name, description);

    // Create the CreatedReportAction on the parent chat report
    const optimisticCreatedAction = ReportUtils.buildOptimisticCreatedReportAction(ownerEmail);

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

    // TODO: Confirm if the first object clears  both the CreatedAction and the CommentReportAction
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

    // Navigate to the newly created task
    Navigation.navigate(ROUTES.getReportRoute(optimisticTaskReport.reportID));
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

function setShareDestinationValue(shareDestinationID) {
    // This is only needed for creation of a new task and so it should only be stored locally
    Onyx.merge(ONYXKEYS.TASK, {shareDestinationID});
}

function clearOutTaskInfo() {
    Onyx.merge(ONYXKEYS.TASK, null);
}

// eslint-disable-next-line import/prefer-default-export
export {
    createTaskAndNavigate, setTitleValue, setDescriptionValue, setDetailsValue, setAssigneeValue, setShareDestinationValue, clearOutTaskInfo,
};
