import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import * as ReportUtils from '../ReportUtils';
import * as Report from './Report';
import Navigation from '../Navigation/Navigation';
import ROUTES from '../../ROUTES';
import CONST from '../../CONST';
import DateUtils from '../DateUtils';
import * as UserUtils from '../UserUtils';

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
    const taskReportID = optimisticTaskReport.reportID;
    let optimisticAssigneeAddComment;
    if (assigneeChatReportID && assigneeChatReportID !== parentReportID) {
        optimisticAssigneeAddComment = ReportUtils.buildOptimisticTaskCommentReportAction(taskReportID, title, assignee, `Assigned a task to you: ${title}`, parentReportID);
    }

    // Create the CreatedReportAction on the task
    const optimisticTaskCreatedAction = ReportUtils.buildOptimisticCreatedReportAction(optimisticTaskReport.reportID);
    const optimisticAddCommentReport = ReportUtils.buildOptimisticTaskCommentReportAction(taskReportID, title, assignee, `Created a task: ${title}`, parentReportID);

    const currentTime = DateUtils.getDBTime();

    const lastCommentText = ReportUtils.formatReportLastMessageText(optimisticAddCommentReport.reportAction.message[0].text);

    const optimisticReport = {
        lastVisibleActionCreated: currentTime,
        lastMessageText: Str.htmlDecode(lastCommentText),
        lastActorEmail: currentUserEmail,
        lastReadTime: currentTime,
    };

    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticTaskReport.reportID}`,
            value: {
                ...optimisticTaskReport,
                pendingFields: {
                    createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
                isOptimisticReport: true,
            },
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
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`,
            value: optimisticReport,
        },
    ];

    const successData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticTaskReport.reportID}`,
            value: {
                pendingFields: {
                    createChat: null,
                },
                isOptimisticReport: false,
            },
        },
    ];

    const failureData = [
        {
            onyxMethod: Onyx.METHOD.SET,
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
        const lastAssigneeCommentText = ReportUtils.formatReportLastMessageText(optimisticAssigneeAddComment.reportAction.message[0].text);

        const optimisticAssigneeReport = {
            lastVisibleActionCreated: currentTime,
            lastMessageText: Str.htmlDecode(lastAssigneeCommentText),
            lastActorEmail: currentUserEmail,
            lastReadTime: currentTime,
        };

        optimisticData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${assigneeChatReportID}`,
                value: {[optimisticAssigneeAddComment.reportAction.reportActionID]: optimisticAssigneeAddComment.reportAction},
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${assigneeChatReportID}`,
                value: optimisticAssigneeReport,
            },
        );

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

function completeTask(taskReportID, parentReportID, taskTitle) {
    const message = `Completed task: ${taskTitle}`;
    const completedTaskReportAction = ReportUtils.buildOptimisticTaskReportAction(taskReportID, CONST.REPORT.ACTIONS.TYPE.TASKCOMPLETED, message);

    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${taskReportID}`,
            value: {
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS.APPROVED,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`,
            value: {
                lastVisibleActionCreated: completedTaskReportAction.created,
                lastMessageText: message,
                lastActorEmail: completedTaskReportAction.actorEmail,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
            value: {[completedTaskReportAction.reportActionID]: completedTaskReportAction},
        },
    ];

    const successData = [];
    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${taskReportID}`,
            value: {
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS.OPEN,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
            value: {[completedTaskReportAction.reportActionID]: {pendingAction: null}},
        },
    ];

    API.write(
        'CompleteTask',
        {
            taskReportID,
            completedTaskReportActionID: completedTaskReportAction.reportActionID,
        },
        {optimisticData, successData, failureData},
    );
}

/**
 * Reopens a closed task
 * @param {string} taskReportID ReportID of the task
 * @param {string} parentReportID ReportID of the linked parent report of the task so we can add the action
 * @param {string} taskTitle Title of the task
 */
function reopenTask(taskReportID, parentReportID, taskTitle) {
    const message = `Reopened task: ${taskTitle}`;
    const reopenedTaskReportAction = ReportUtils.buildOptimisticTaskReportAction(taskReportID, CONST.REPORT.ACTIONS.TYPE.TASKREOPENED, message);

    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${taskReportID}`,
            value: {
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS.OPEN,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`,
            value: {
                lastVisibleActionCreated: reopenedTaskReportAction.created,
                lastMessageText: message,
                lastActorEmail: reopenedTaskReportAction.actorEmail,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
            value: {[reopenedTaskReportAction.reportActionID]: reopenedTaskReportAction},
        },
    ];

    const successData = [];
    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${taskReportID}`,
            value: {
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS.APPROVED,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
            value: {[reopenedTaskReportAction.reportActionID]: {pendingAction: null}},
        },
    ];

    API.write(
        'ReopenTask',
        {
            taskReportID,
            reopenedTaskReportActionID: reopenedTaskReportAction.reportActionID,
        },
        {optimisticData, successData, failureData},
    );
}

/**
 * @function editTask
 * @param {object} report
 * @param {string} ownerEmail
 * @param {string} title
 * @param {string} description
 * @param {string} assignee
 * @returns {object} action
 *
 */

function editTaskAndNavigate(report, ownerEmail, title, description, assignee) {
    // Create the EditedReportAction on the task
    const editTaskReportAction = ReportUtils.buildOptimisticEditedTaskReportAction(ownerEmail);

    // Sometimes title is undefined, so we need to check for that, and we provide it to multiple functions
    const reportName = (title || report.reportName).trim();

    // If we make a change to the assignee, we want to add a comment to the assignee's chat
    let optimisticAssigneeAddComment;
    let assigneeChatReportID;
    if (assignee && assignee !== report.managerEmail) {
        assigneeChatReportID = ReportUtils.getChatByParticipants([assignee]).reportID;
        optimisticAssigneeAddComment = ReportUtils.buildOptimisticTaskCommentReportAction(report.reportID, reportName, assignee, `Assigned a task to you: ${reportName}`);
    }

    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`,
            value: {[editTaskReportAction.reportActionID]: editTaskReportAction},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`,
            value: {
                reportName,
                description: description.trim(),
                managerEmail: assignee || report.managerEmail,
            },
        },
    ];
    const successData = [];
    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`,
            value: {[editTaskReportAction.reportActionID]: {pendingAction: null}},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`,
            value: {reportName: report.reportName, description: report.description, assignee: report.assignee},
        },
    ];

    if (optimisticAssigneeAddComment) {
        const currentTime = DateUtils.getDBTime();
        const lastAssigneeCommentText = ReportUtils.formatReportLastMessageText(optimisticAssigneeAddComment.reportAction.message[0].text);

        const optimisticAssigneeReport = {
            lastVisibleActionCreated: currentTime,
            lastMessageText: Str.htmlDecode(lastAssigneeCommentText),
            lastActorEmail: ownerEmail,
            lastReadTime: currentTime,
        };

        optimisticData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${assigneeChatReportID}`,
                value: {[optimisticAssigneeAddComment.reportAction.reportActionID]: optimisticAssigneeAddComment.reportAction},
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${assigneeChatReportID}`,
                value: optimisticAssigneeReport,
            },
        );

        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${assigneeChatReportID}`,
            value: {[optimisticAssigneeAddComment.reportAction.reportActionID]: {pendingAction: null}},
        });
    }

    API.write(
        'EditTask',
        {
            taskReportID: report.reportID,
            title: reportName,
            description: description.trim(),
            assignee: assignee || report.assignee,
            editedTaskReportActionID: editTaskReportAction.reportActionID,
            assigneeChatReportActionID: optimisticAssigneeAddComment ? optimisticAssigneeAddComment.reportAction.reportActionID : 0,
        },
        {optimisticData, successData, failureData},
    );

    Navigation.navigate(ROUTES.getReportRoute(report.reportID));
}

/**
 * Sets the report info for the task being viewed
 *
 * @param {Object} report
 */
function setTaskReport(report) {
    Onyx.merge(ONYXKEYS.TASK, {report});
}

/**
 * Sets the title and description values for the task
 * @param {string} title
 * @param {string} description
 */

function setDetailsValue(title, description) {
    // This is only needed for creation of a new task and so it should only be stored locally
    Onyx.merge(ONYXKEYS.TASK, {title: title.trim(), description: description.trim()});
}

/**
 * Sets the title value for the task
 * @param {string} title
 */
function setTitleValue(title) {
    Onyx.merge(ONYXKEYS.TASK, {title: title.trim()});
}

/**
 * Sets the description value for the task
 * @param {string} description
 */
function setDescriptionValue(description) {
    Onyx.merge(ONYXKEYS.TASK, {description: description.trim()});
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

/**
 * Get the assignee data
 *
 * @param {Object} details
 * @returns {Object}
 */
function getAssignee(details) {
    if (!details) {
        return {
            icons: [],
            displayName: '',
            subtitle: '',
        };
    }
    const source = UserUtils.getAvatar(lodashGet(details, 'avatar', ''), lodashGet(details, 'login', ''));
    return {
        icons: [{source, type: 'avatar', name: details.login}],
        displayName: details.displayName,
        subtitle: details.login,
    };
}

/**
 * Get the share destination data
 * @param {Object} reportID
 * @param {Object} reports
 * @param {Object} personalDetails
 * @returns {Object}
 * */
function getShareDestination(reportID, reports, personalDetails) {
    const report = lodashGet(reports, `report_${reportID}`, {});
    return {
        icons: ReportUtils.getIcons(report, personalDetails),
        displayName: ReportUtils.getReportName(report),
        subtitle: ReportUtils.getChatRoomSubtitle(report),
    };
}

/**
 * Cancels a task by setting the report state to SUBMITTED and status to CLOSED
 * @param {string} taskReportID
 * @param {string} parentReportID
 * @param {string} taskTitle
 * @param {number} originalStateNum
 * @param {number} originalStatusNum
 */
function cancelTask(taskReportID, parentReportID, taskTitle, originalStateNum, originalStatusNum) {
    const message = `Canceled task: ${taskTitle}`;
    const optimisticCancelReportAction = ReportUtils.buildOptimisticTaskReportAction(taskReportID, CONST.REPORT.ACTIONS.TYPE.TASKCANCELED, message);
    const optimisticReportActionID = optimisticCancelReportAction.reportActionID;

    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${taskReportID}`,
            value: {
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS.CLOSED,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`,
            value: {
                lastVisibleActionCreated: optimisticCancelReportAction.created,
                lastMessageText: message,
                lastActorEmail: optimisticCancelReportAction.actorEmail,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
            value: {
                [optimisticReportActionID]: optimisticCancelReportAction,
            },
        },
    ];

    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${taskReportID}`,
            value: {
                stateNum: originalStateNum,
                statusNum: originalStatusNum,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
            value: {
                [optimisticReportActionID]: null,
            },
        },
    ];

    API.write('CancelTask', {taskReportID, optimisticReportActionID}, {optimisticData, failureData});
}

function isTaskCanceled(taskReport) {
    return taskReport.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && taskReport.statusNum === CONST.REPORT.STATUS.CLOSED;
}

export {
    createTaskAndNavigate,
    editTaskAndNavigate,
    setTitleValue,
    setDescriptionValue,
    setTaskReport,
    setDetailsValue,
    setAssigneeValue,
    setShareDestinationValue,
    clearOutTaskInfo,
    reopenTask,
    completeTask,
    clearOutTaskInfoAndNavigate,
    getAssignee,
    getShareDestination,
    cancelTask,
    isTaskCanceled,
};
