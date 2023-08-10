import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import * as ReportUtils from '../ReportUtils';
import Navigation from '../Navigation/Navigation';
import ROUTES from '../../ROUTES';
import CONST from '../../CONST';
import DateUtils from '../DateUtils';
import * as UserUtils from '../UserUtils';
import * as ErrorUtils from '../ErrorUtils';
import * as ReportActionsUtils from '../ReportActionsUtils';
import * as Expensicons from '../../components/Icon/Expensicons';
import * as LocalePhoneNumber from '../LocalePhoneNumber';

let currentUserEmail;
let currentUserAccountID;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        currentUserEmail = lodashGet(val, 'email', '');
        currentUserAccountID = lodashGet(val, 'accountID', 0);
    },
});

let allPersonalDetails;
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (val) => (allPersonalDetails = val),
});

/**
 * Clears out the task info from the store
 */
function clearOutTaskInfo() {
    Onyx.set(ONYXKEYS.TASK, null);
}

/**
 * A task needs two things to be created - a title and a parent report
 * When you create a task report, there are a few things that happen:
 * A task report is created, along with a CreatedReportAction for that new task report
 * A reportAction indicating that a task was created is added to the parent report (share destination)
 * If you assign the task to someone, a reportAction is created in the chat between you and the assignee to inform them of the task
 *
 * So you have the following optimistic items potentially being created:
 * 1. The task report
 * 1a. The CreatedReportAction for the task report
 * 2. The TaskReportAction on the parent report
 * 3. The chat report between you and the assignee
 * 3a. The CreatedReportAction for the assignee chat report
 * 3b. The TaskReportAction on the assignee chat report
 *
 * @param {String} parentReportID
 * @param {String} title
 * @param {String} description
 * @param {String} assigneeEmail
 * @param {Number} assigneeAccountID
 * @param {Object} assigneeChatReport - The chat report between you and the assignee
 */
function createTaskAndNavigate(parentReportID, title, description, assigneeEmail, assigneeAccountID = 0, assigneeChatReport = null) {
    const optimisticTaskReport = ReportUtils.buildOptimisticTaskReport(currentUserAccountID, assigneeAccountID, parentReportID, title, description);

    const assigneeChatReportID = assigneeChatReport ? assigneeChatReport.reportID : 0;
    const taskReportID = optimisticTaskReport.reportID;
    let assigneeChatReportOnyxData;

    // Parent ReportAction indicating that a task has been created
    const optimisticTaskCreatedAction = ReportUtils.buildOptimisticCreatedReportAction(currentUserEmail);
    const optimisticAddCommentReport = ReportUtils.buildOptimisticTaskCommentReportAction(taskReportID, title, assigneeEmail, assigneeAccountID, `Created a task: ${title}`, parentReportID);
    optimisticTaskReport.parentReportActionID = optimisticAddCommentReport.reportAction.reportActionID;

    const currentTime = DateUtils.getDBTime();
    const lastCommentText = ReportUtils.formatReportLastMessageText(optimisticAddCommentReport.reportAction.message[0].text);
    const optimisticParentReport = {
        lastVisibleActionCreated: currentTime,
        lastMessageText: lastCommentText,
        lastActorAccountID: currentUserAccountID,
        lastReadTime: currentTime,
        lastMessageTranslationKey: '',
    };

    // We're only setting onyx data for the task report here because it's possible for the parent report to not exist yet (if you're assigning a task to someone you haven't chatted with before)
    // So we don't want to set the parent report data until we've successfully created that chat report
    // FOR TASK REPORT
    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticTaskReport.reportID}`,
            value: {
                ...optimisticTaskReport,
                pendingFields: {
                    createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    reportName: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    description: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    managerID: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
                isOptimisticReport: true,
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticTaskReport.reportID}`,
            value: {[optimisticTaskCreatedAction.reportActionID]: optimisticTaskCreatedAction},
        },
    ];

    // FOR TASK REPORT
    const successData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticTaskReport.reportID}`,
            value: {
                pendingFields: {
                    createChat: null,
                    reportName: null,
                    description: null,
                    managerID: null,
                },
                isOptimisticReport: false,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticTaskReport.reportID}`,
            value: {[optimisticTaskCreatedAction.reportActionID]: {pendingAction: null}},
        },
    ];

    // FOR TASK REPORT
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
    ];

    if (assigneeChatReport) {
        assigneeChatReportOnyxData = ReportUtils.getTaskAssigneeChatOnyxData(
            currentUserAccountID,
            assigneeEmail,
            assigneeAccountID,
            taskReportID,
            assigneeChatReportID,
            parentReportID,
            title,
            assigneeChatReport,
        );
        optimisticData.push(...assigneeChatReportOnyxData.optimisticData);
        successData.push(...assigneeChatReportOnyxData.successData);
        failureData.push(...assigneeChatReportOnyxData.failureData);
    }

    // Now that we've created the optimistic chat report and chat reportActions, we can update the parent report data
    // FOR PARENT REPORT (SHARE DESTINATION)
    optimisticData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`,
            value: optimisticParentReport,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
            value: {[optimisticAddCommentReport.reportAction.reportActionID]: optimisticAddCommentReport.reportAction},
        },
    );

    // FOR PARENT REPORT (SHARE DESTINATION)
    successData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
        value: {[optimisticAddCommentReport.reportAction.reportActionID]: {pendingAction: null}},
    });

    // FOR PARENT REPORT (SHARE DESTINATION)
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
        value: {[optimisticAddCommentReport.reportAction.reportActionID]: {pendingAction: null}},
    });

    API.write(
        'CreateTask',
        {
            parentReportActionID: optimisticAddCommentReport.reportAction.reportActionID,
            parentReportID,
            taskReportID: optimisticTaskReport.reportID,
            createdTaskReportActionID: optimisticTaskCreatedAction.reportActionID,
            title: optimisticTaskReport.reportName,
            description: optimisticTaskReport.description,
            assignee: assigneeEmail,
            assigneeAccountID,
            assigneeChatReportID,
            assigneeChatReportActionID:
                assigneeChatReportOnyxData && assigneeChatReportOnyxData.optimisticAssigneeAddComment
                    ? assigneeChatReportOnyxData.optimisticAssigneeAddComment.reportAction.reportActionID
                    : 0,
            assigneeChatCreatedReportActionID:
                assigneeChatReportOnyxData && assigneeChatReportOnyxData.optimisticChatCreatedReportAction ? assigneeChatReportOnyxData.optimisticChatCreatedReportAction.reportActionID : 0,
        },
        {optimisticData, successData, failureData},
    );

    Navigation.dismissModal(optimisticTaskReport.reportID);
}

/**
 * Complete a task
 * @param {Object} taskReport task report
 * @param {String} taskTitle Title of the task
 */
function completeTask(taskReport, taskTitle) {
    const taskReportID = taskReport.reportID;
    const message = `completed task: ${taskTitle}`;
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
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${taskReportID}`,
            value: {[completedTaskReportAction.reportActionID]: completedTaskReportAction},
        },
    ];

    const successData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${taskReportID}`,
            value: {
                [completedTaskReportAction.reportActionID]: {
                    pendingAction: null,
                },
            },
        },
    ];
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
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${taskReportID}`,
            value: {
                [completedTaskReportAction.reportActionID]: {
                    errors: ErrorUtils.getMicroSecondOnyxError('task.messages.error'),
                },
            },
        },
    ];

    // Update optimistic data for parent report action
    const optimisticDataForParentReportAction = ReportUtils.getOptimisticDataForParentReportAction(taskReportID, completedTaskReportAction.created, CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
    if (!_.isEmpty(optimisticDataForParentReportAction)) {
        optimisticData.push(optimisticDataForParentReportAction);
    }

    // Multiple report actions can link to the same child. Both share destination (task parent) and assignee report link to the same report action.
    // We need to find and update the other parent report action (in assignee report). More info https://github.com/Expensify/App/issues/23920#issuecomment-1663092717
    const assigneeReportAction = ReportUtils.getTaskParentReportActionIDInAssigneeReport(taskReport);
    if (!_.isEmpty(assigneeReportAction)) {
        const optimisticDataForClonedParentReportAction = ReportUtils.getOptimisticDataForParentReportAction(
            taskReportID,
            completedTaskReportAction.created,
            CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            assigneeReportAction.reportID,
            assigneeReportAction.reportActionID,
        );
        if (!_.isEmpty(optimisticDataForClonedParentReportAction)) {
            optimisticData.push(optimisticDataForClonedParentReportAction);
        }
    }

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
 * Reopen a closed task
 * @param {Object} taskReport task report
 * @param {String} taskTitle Title of the task
 */
function reopenTask(taskReport, taskTitle) {
    const taskReportID = taskReport.reportID;
    const message = `reopened task: ${taskTitle}`;
    const reopenedTaskReportAction = ReportUtils.buildOptimisticTaskReportAction(taskReportID, CONST.REPORT.ACTIONS.TYPE.TASKREOPENED, message);

    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${taskReportID}`,
            value: {
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS.OPEN,
                lastVisibleActionCreated: reopenedTaskReportAction.created,
                lastMessageText: message,
                lastActorAccountID: reopenedTaskReportAction.actorAccountID,
                lastReadTime: reopenedTaskReportAction.created,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${taskReportID}`,
            value: {[reopenedTaskReportAction.reportActionID]: reopenedTaskReportAction},
        },
    ];

    const successData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${taskReportID}`,
            value: {
                [reopenedTaskReportAction.reportActionID]: {
                    pendingAction: null,
                },
            },
        },
    ];
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
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${taskReportID}`,
            value: {
                [reopenedTaskReportAction.reportActionID]: {
                    errors: ErrorUtils.getMicroSecondOnyxError('task.messages.error'),
                },
            },
        },
    ];

    // Update optimistic data for parent report action
    const optimisticDataForParentReportAction = ReportUtils.getOptimisticDataForParentReportAction(taskReportID, reopenedTaskReportAction.created, CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
    if (!_.isEmpty(optimisticDataForParentReportAction)) {
        optimisticData.push(optimisticDataForParentReportAction);
    }

    // Multiple report actions can link to the same child. Both share destination (task parent) and assignee report link to the same report action.
    // We need to find and update the other parent report action (in assignee report). More info https://github.com/Expensify/App/issues/23920#issuecomment-1663092717
    const assigneeReportAction = ReportUtils.getTaskParentReportActionIDInAssigneeReport(taskReport);
    if (!_.isEmpty(assigneeReportAction)) {
        const optimisticDataForClonedParentReportAction = ReportUtils.getOptimisticDataForParentReportAction(
            taskReportID,
            reopenedTaskReportAction.created,
            CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            assigneeReportAction.reportID,
            assigneeReportAction.reportActionID,
        );
        if (!_.isEmpty(optimisticDataForClonedParentReportAction)) {
            optimisticData.push(optimisticDataForClonedParentReportAction);
        }
    }

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
 * @param {object} report
 * @param {Number} ownerAccountID
 * @param {Object} editedTask
 * @param {Object} assigneeChatReport - The chat report between you and the assignee
 */
function editTaskAndNavigate(report, ownerAccountID, {title, description, assignee = '', assigneeAccountID = 0}, assigneeChatReport = null) {
    // Create the EditedReportAction on the task
    const editTaskReportAction = ReportUtils.buildOptimisticEditedTaskReportAction(currentUserEmail);

    // Sometimes title or description is undefined, so we need to check for that, and we provide it to multiple functions
    const reportName = (title || report.reportName).trim();

    // Description can be unset, so we default to an empty string if so
    const reportDescription = (!_.isUndefined(description) ? description : lodashGet(report, 'description', '')).trim();

    let assigneeChatReportOnyxData;
    const assigneeChatReportID = assigneeChatReport ? assigneeChatReport.reportID : 0;

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
                description: reportDescription,
                managerID: assigneeAccountID || report.managerID,
                managerEmail: assignee || report.managerEmail,
                pendingFields: {
                    ...(title && {reportName: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
                    ...(description && {description: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
                    ...(assigneeAccountID && {managerID: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
                },
            },
        },
    ];
    const successData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`,
            value: {
                pendingFields: {
                    ...(title && {reportName: null}),
                    ...(description && {description: null}),
                    ...(assigneeAccountID && {managerID: null}),
                },
            },
        },
    ];
    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`,
            value: {[editTaskReportAction.reportActionID]: {pendingAction: null}},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`,
            value: {
                reportName: report.reportName,
                description: report.description,
                assignee: report.managerEmail,
                assigneeAccountID: report.managerID,
            },
        },
    ];

    // If we make a change to the assignee, we want to add a comment to the assignee's chat
    // Check if the assignee actually changed
    if (assigneeAccountID && assigneeAccountID !== report.managerID && assigneeAccountID !== ownerAccountID && assigneeChatReport) {
        assigneeChatReportOnyxData = ReportUtils.getTaskAssigneeChatOnyxData(
            currentUserAccountID,
            assignee,
            assigneeAccountID,
            report.reportID,
            assigneeChatReportID,
            report.parentReportID,
            reportName,
            assigneeChatReport,
        );
        optimisticData.push(...assigneeChatReportOnyxData.optimisticData);
        successData.push(...assigneeChatReportOnyxData.successData);
        failureData.push(...assigneeChatReportOnyxData.failureData);
    }

    API.write(
        'EditTask',
        {
            taskReportID: report.reportID,
            title: reportName,
            description: reportDescription,
            assignee: assignee || report.managerEmail,
            assigneeAccountID: assigneeAccountID || report.managerID,
            editedTaskReportActionID: editTaskReportAction.reportActionID,
            assigneeChatReportID,
            assigneeChatReportActionID:
                assigneeChatReportOnyxData && assigneeChatReportOnyxData.optimisticAssigneeAddComment
                    ? assigneeChatReportOnyxData.optimisticAssigneeAddComment.reportAction.reportActionID
                    : 0,
            assigneeChatCreatedReportActionID:
                assigneeChatReportOnyxData && assigneeChatReportOnyxData.optimisticChatCreatedReportAction ? assigneeChatReportOnyxData.optimisticChatCreatedReportAction.reportActionID : 0,
        },
        {optimisticData, successData, failureData},
    );

    Navigation.dismissModal(report.reportID);
}

function editTaskAssigneeAndNavigate(report, ownerAccountID, assigneeEmail, assigneeAccountID = 0, assigneeChatReport = null) {
    // Create the EditedReportAction on the task
    const editTaskReportAction = ReportUtils.buildOptimisticEditedTaskReportAction(currentUserEmail);
    const reportName = report.reportName.trim();

    let assigneeChatReportOnyxData;
    const assigneeChatReportID = assigneeChatReport ? assigneeChatReport.reportID : 0;

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
                managerID: assigneeAccountID || report.managerID,
                managerEmail: assigneeEmail || report.managerEmail,
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
            value: {assignee: report.managerEmail, assigneeAccountID: report.managerID},
        },
    ];

    // If we make a change to the assignee, we want to add a comment to the assignee's chat
    // Check if the assignee actually changed
    if (assigneeAccountID && assigneeAccountID !== report.managerID && assigneeAccountID !== ownerAccountID && assigneeChatReport) {
        assigneeChatReportOnyxData = ReportUtils.getTaskAssigneeChatOnyxData(
            currentUserAccountID,
            assigneeEmail,
            assigneeAccountID,
            report.reportID,
            assigneeChatReportID,
            report.parentReportID,
            reportName,
            assigneeChatReport,
        );
        optimisticData.push(...assigneeChatReportOnyxData.optimisticData);
        successData.push(...assigneeChatReportOnyxData.successData);
        failureData.push(...assigneeChatReportOnyxData.failureData);
    }

    API.write(
        'EditTaskAssignee',
        {
            taskReportID: report.reportID,
            assignee: assigneeEmail || report.managerEmail,
            assigneeAccountID: assigneeAccountID || report.managerID,
            editedTaskReportActionID: editTaskReportAction.reportActionID,
            assigneeChatReportID,
            assigneeChatReportActionID:
                assigneeChatReportOnyxData && assigneeChatReportOnyxData.optimisticAssigneeAddComment
                    ? assigneeChatReportOnyxData.optimisticAssigneeAddComment.reportAction.reportActionID
                    : 0,
            assigneeChatCreatedReportActionID:
                assigneeChatReportOnyxData && assigneeChatReportOnyxData.optimisticChatCreatedReportAction ? assigneeChatReportOnyxData.optimisticChatCreatedReportAction.reportActionID : 0,
        },
        {optimisticData, successData, failureData},
    );

    Navigation.dismissModal(report.reportID);
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

/* Sets the assigneeChatReport details for the task
 * @param {Object} chatReport
 */
function setAssigneeChatReport(chatReport) {
    Onyx.merge(ONYXKEYS.TASK, {assigneeChatReport: chatReport});
}

/**
 * Sets the assignee value for the task and checks for an existing chat with the assignee
 * If there is no existing chat, it creates an optimistic chat report
 * It also sets the shareDestination as that chat report if a share destination isn't already set
 * @param {string} assigneeEmail
 * @param {Number} assigneeAccountID
 * @param {string} shareDestination
 * @param {boolean} isCurrentUser
 */

function setAssigneeValue(assigneeEmail, assigneeAccountID, shareDestination, isCurrentUser = false) {
    let chatReport;

    if (!isCurrentUser) {
        chatReport = ReportUtils.getChatByParticipantsByLoginList([assigneeEmail]) || ReportUtils.getChatByParticipants([assigneeAccountID]);
        if (!chatReport) {
            chatReport = ReportUtils.buildOptimisticChatReport([assigneeAccountID]);
            chatReport.isOptimisticReport = true;

            // When assigning a task to a new user, by default we share the task in their DM
            // However, the DM doesn't exist yet - and will be created optimistically once the task is created
            // We don't want to show the new DM yet, because if you select an assignee and then change the assignee, the previous DM will still be shown
            // So here, we create it optimistically to share it with the assignee, but we have to hide it until the task is created
            chatReport.isHidden = true;
            Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`, chatReport);

            // If this is an optimistic report, we likely don't have their personal details yet so we set it here optimistically as well
            const optimisticPersonalDetailsListAction = {
                accountID: assigneeAccountID,
                avatar: lodashGet(allPersonalDetails, [assigneeAccountID, 'avatar'], UserUtils.getDefaultAvatarURL(assigneeAccountID)),
                displayName: lodashGet(allPersonalDetails, [assigneeAccountID, 'displayName'], assigneeEmail),
                login: assigneeEmail,
            };
            Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[assigneeAccountID]: optimisticPersonalDetailsListAction});
        }

        setAssigneeChatReport(chatReport);

        // If there is no share destination set, automatically set it to the assignee chat report
        // This allows for a much quicker process when creating a new task and is likely the desired share destination most times
        if (!shareDestination) {
            setShareDestinationValue(chatReport.reportID);
        }
    }

    // This is only needed for creation of a new task and so it should only be stored locally
    Onyx.merge(ONYXKEYS.TASK, {assignee: assigneeEmail, assigneeAccountID});

    // When we're editing the assignee, we immediately call EditTaskAndNavigate. Since setting the assignee is async,
    // the chatReport is not yet set when EditTaskAndNavigate is called. So we return the chatReport here so that
    // EditTaskAndNavigate can use it.
    return chatReport;
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
 * @param {Number} assigneeAccountID
 * @param {Object} personalDetails
 * @returns {Object}
 */
function getAssignee(assigneeAccountID, personalDetails) {
    const details = personalDetails[assigneeAccountID];
    if (!details) {
        return {
            icons: [],
            displayName: '',
            subtitle: '',
        };
    }
    return {
        icons: ReportUtils.getIconsForParticipants([details.accountID], personalDetails),
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
    let subtitle = '';
    if (ReportUtils.isChatReport(report) && ReportUtils.isDM(report) && ReportUtils.hasSingleParticipant(report)) {
        subtitle = LocalePhoneNumber.formatPhoneNumber(report.participants[0]);
    } else {
        subtitle = ReportUtils.getChatRoomSubtitle(report);
    }
    return {
        icons: ReportUtils.getIcons(report, personalDetails, Expensicons.FallbackAvatar, ReportUtils.isIOUReport(report)),
        displayName: ReportUtils.getReportName(report),
        subtitle,
    };
}

/**
 * Cancels a task by setting the report state to SUBMITTED and status to CLOSED
 * @param {string} taskReportID
 * @param {string} taskTitle
 * @param {number} originalStateNum
 * @param {number} originalStatusNum
 */
function cancelTask(taskReportID, taskTitle, originalStateNum, originalStatusNum) {
    const message = `canceled task: ${taskTitle}`;
    const optimisticCancelReportAction = ReportUtils.buildOptimisticTaskReportAction(taskReportID, CONST.REPORT.ACTIONS.TYPE.TASKCANCELLED, message);
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
            key: `${ONYXKEYS.COLLECTION.REPORT}${taskReportID}`,
            value: {
                lastVisibleActionCreated: optimisticCancelReportAction.created,
                lastMessageText: message,
                lastActorAccountID: optimisticCancelReportAction.actorAccountID,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${taskReportID}`,
            value: {
                [optimisticReportActionID]: optimisticCancelReportAction,
            },
        },
    ];

    const successData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${taskReportID}`,
            value: {
                [optimisticReportActionID]: {
                    pendingAction: null,
                },
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
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${taskReportID}`,
            value: {
                [optimisticReportActionID]: null,
            },
        },
    ];

    API.write('CancelTask', {cancelledTaskReportActionID: optimisticReportActionID, taskReportID}, {optimisticData, successData, failureData});
}

/**
 * Closes the current open task modal and clears out the task info from the store.
 */
function dismissModalAndClearOutTaskInfo() {
    Navigation.dismissModal();
    clearOutTaskInfo();
}

/**
 * Returns Task assignee accountID
 *
 * @param {Object} taskReport
 * @returns {Number|null}
 */
function getTaskAssigneeAccountID(taskReport) {
    if (!taskReport) {
        return null;
    }

    if (taskReport.managerID) {
        return taskReport.managerID;
    }

    const reportAction = ReportActionsUtils.getParentReportAction(taskReport);
    return lodashGet(reportAction, 'childManagerAccountID');
}

/**
 * Returns Task owner accountID
 *
 * @param {Object} taskReport
 * @returns {Number|null}
 */
function getTaskOwnerAccountID(taskReport) {
    return lodashGet(taskReport, 'ownerAccountID', null);
}

/**
 * Check if you're allowed to modify the task - anyone that has write access to the report can modify the task
 * @param {Object} taskReport
 * @param {Number} sessionAccountID
 * @returns {Boolean}
 */
function canModifyTask(taskReport, sessionAccountID) {
    if (sessionAccountID === getTaskOwnerAccountID(taskReport) || sessionAccountID === getTaskAssigneeAccountID(taskReport)) {
        return true;
    }

    // If you don't have access to the task report (maybe haven't opened it yet), check if you can access the parent report
    // - If the parent report is an #admins only room
    // - If you are a policy admin
    const parentReport = ReportUtils.getParentReport(taskReport);
    return ReportUtils.isAllowedToComment(parentReport);
}

/**
 * @param {String} reportID
 */
function clearEditTaskErrors(reportID) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
        pendingFields: null,
        errorFields: null,
    });
}

export {
    createTaskAndNavigate,
    editTaskAndNavigate,
    editTaskAssigneeAndNavigate,
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
    dismissModalAndClearOutTaskInfo,
    getTaskAssigneeAccountID,
    clearEditTaskErrors,
    canModifyTask,
};
