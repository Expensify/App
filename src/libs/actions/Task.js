import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import * as ReportUtils from '../ReportUtils';
import * as Report from './Report';
import Navigation from '../Navigation/Navigation';
import ROUTES from '../../ROUTES';
import CONST from '../../CONST';
import DateUtils from '../DateUtils';
import * as UserUtils from '../UserUtils';
import * as ErrorUtils from '../ErrorUtils';
import * as ReportActionsUtils from '../ReportActionsUtils';
import * as Expensicons from '../../components/Icon/Expensicons';

let currentUserEmail;
let currentUserAccountID;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        currentUserEmail = lodashGet(val, 'email', '');
        currentUserAccountID = lodashGet(val, 'accountID', 0);
    },
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
 * @param {String} assignee
 * @param {Number} assigneeAccountID
 *
 */

function createTaskAndNavigate(parentReportID, title, description, assignee, assigneeAccountID = 0, assigneeChatReport = {}) {
    const optimisticTaskReport = ReportUtils.buildOptimisticTaskReport(currentUserEmail, currentUserAccountID, assigneeAccountID, parentReportID, title, description);
    const optimisticTaskCreatedAction = ReportUtils.buildOptimisticCreatedReportAction(optimisticTaskReport.reportID);
    
    const assigneeChatReportID = assigneeChatReport.reportID;
    const taskReportID = optimisticTaskReport.reportID;
    let optimisticAssigneeAddComment;

    // If you're choosing to share the task in the same DM as the assignee then 
    // we don't need to create another reportAction indicating that you've been assigned
    // Additionally, tasks can be unassigned in which case we don't need to create a reportAction either
    if (assigneeChatReportID && assigneeChatReportID !== parentReportID) {
        // ReportAction indicating that the assignee has been assigned a task
        optimisticAssigneeAddComment = ReportUtils.buildOptimisticTaskCommentReportAction(
            taskReportID,
            title,
            assignee,
            assigneeAccountID,
            `Assigned a task to you: ${title}`,
            parentReportID,
        );
    }

    // Parent ReportAction indicating that a task has been created
    const optimisticAddCommentReport = ReportUtils.buildOptimisticTaskCommentReportAction(taskReportID, title, assignee, assigneeAccountID, `Created a task: ${title}`, parentReportID);
    optimisticTaskReport.parentReportActionID = optimisticAddCommentReport.reportAction.reportActionID;

    const currentTime = DateUtils.getDBTime();
    const lastCommentText = ReportUtils.formatReportLastMessageText(optimisticAddCommentReport.reportAction.message[0].text);

    const optimisticParentReport = {
        lastVisibleActionCreated: currentTime,
        lastMessageText: lastCommentText,
        lastActorAccountID: currentUserAccountID,
        lastReadTime: currentTime,
    };

    const optimisticData = [
        // Task Report
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
        // Task Report Actions
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticTaskReport.reportID}`,
            value: {[optimisticTaskCreatedAction.reportActionID]: optimisticTaskCreatedAction},
        },
        // Parent Report
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`,
            value: optimisticParentReport,
        },
        // Parent Report Actions
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
            value: {[optimisticAddCommentReport.reportAction.reportActionID]: optimisticAddCommentReport.reportAction},
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
            lastMessageText: lastAssigneeCommentText,
            lastActorAccountID: currentUserAccountID,
            lastReadTime: currentTime,
        };

        // If we're optimistically creating a new chat report for the assignee then we need to create the report and reportAction
        if (assigneeChatReport && assigneeChatReport.isOptimisticReport) {
            const optimisticChatCreatedReportAction = ReportUtils.buildOptimisticCreatedReportAction(assigneeChatReportID);
            optimisticData.push(
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${assigneeChatReportID}`,
                    value: {
                        ...assigneeChatReport,
                        pendingFields: {
                            createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                        },
                        ...optimisticAssigneeReport
                    }
                },
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${assigneeChatReportID}`,
                    value: {[optimisticChatCreatedReportAction.reportActionID]: optimisticChatCreatedReportAction},

                }
            );

            successData.push(
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${assigneeChatReportID}`,
                    value: {
                        pendingFields: {
                            createChat: null,
                        },
                        isOptimisticReport: false,
                    },
                }
            );

            failureData.push(
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${assigneeChatReportID}`,
                    value: null,
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${assigneeChatReportID}`,
                    value: {[optimisticChatCreatedReportAction.reportActionID]: {pendingAction: null}},
                }
            );

        } else {
            // If the assignee already has a chat report, we just need to update some fields
            optimisticData.push(
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${assigneeChatReportID}`,
                    value: optimisticAssigneeReport,
                },
            );
        }

        optimisticData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${assigneeChatReportID}`,
                value: {[optimisticAssigneeAddComment.reportAction.reportActionID]: optimisticAssigneeAddComment.reportAction},
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
            assigneeAccountID,
            assigneeChatReportID,
            assigneeChatReportActionID: optimisticAssigneeAddComment ? optimisticAssigneeAddComment.reportAction.reportActionID : 0,
        },
        {optimisticData, successData, failureData},
    );

    clearOutTaskInfo();

    Navigation.dismissModal(optimisticTaskReport.reportID);
}

function completeTask(taskReportID, taskTitle) {
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
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${taskReportID}`,
            value: {
                [completedTaskReportAction.reportActionID]: {
                    errors: ErrorUtils.getMicroSecondOnyxError('task.messages.error'),
                },
            },
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
 * @param {string} taskTitle Title of the task
 */
function reopenTask(taskReportID, taskTitle) {
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
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${taskReportID}`,
            value: {
                [reopenedTaskReportAction.reportActionID]: {
                    errors: ErrorUtils.getMicroSecondOnyxError('task.messages.error'),
                },
            },
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
 * @param {object} report
 * @param {string} ownerEmail
 * @param {Number} ownerAccountID
 * @param {Object} editedTask
 * @param {String} editedTask.title
 * @param {String} editedTask.description
 * @param {String} editedTask.assignee
 * @param {Number} editedTask.assigneeAccountID
 */
function editTaskAndNavigate(report, ownerEmail, ownerAccountID, {title, description, assignee = '', assigneeAccountID = 0}) {
    // Create the EditedReportAction on the task
    const editTaskReportAction = ReportUtils.buildOptimisticEditedTaskReportAction(ownerEmail);

    // Sometimes title or description is undefined, so we need to check for that, and we provide it to multiple functions
    const reportName = (title || report.reportName).trim();

    // Description can be unset, so we default to an empty string if so
    const reportDescription = (!_.isUndefined(description) ? description : lodashGet(report, 'description', '')).trim();

    // If we make a change to the assignee, we want to add a comment to the assignee's chat
    let optimisticAssigneeAddComment;
    let assigneeChatReportID;
    if (assigneeAccountID && assigneeAccountID !== report.managerID && assigneeAccountID !== ownerAccountID) {
        assigneeChatReportID = ReportUtils.getChatByParticipants([assigneeAccountID]).reportID;

        if (assigneeChatReportID !== report.parentReportID.toString()) {
            optimisticAssigneeAddComment = ReportUtils.buildOptimisticTaskCommentReportAction(
                report.reportID,
                reportName,
                assignee,
                assigneeAccountID,
                `Assigned a task to you: ${reportName}`,
            );
        }
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
                description: reportDescription,
                managerID: assigneeAccountID || report.managerID,
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
            value: {reportName: report.reportName, description: report.description, assignee: report.managerEmail, assigneeAccountID: report.managerID},
        },
    ];

    if (optimisticAssigneeAddComment) {
        const currentTime = DateUtils.getDBTime();
        const lastAssigneeCommentText = ReportUtils.formatReportLastMessageText(optimisticAssigneeAddComment.reportAction.message[0].text);

        const optimisticAssigneeReport = {
            lastVisibleActionCreated: currentTime,
            lastMessageText: lastAssigneeCommentText,
            lastActorAccountID: ownerAccountID,
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
            description: reportDescription,
            assignee: assignee || report.managerEmail,
            assigneeAccountID: assigneeAccountID || report.managerID,
            editedTaskReportActionID: editTaskReportAction.reportActionID,
            assigneeChatReportActionID: optimisticAssigneeAddComment ? optimisticAssigneeAddComment.reportAction.reportActionID : 0,
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

/**
 * Sets the assigneeChatReport details for the task
 * @param {Object} chatReport
 */
function setAssigneeChatReport(chatReport) {
    Onyx.merge(ONYXKEYS.TASK, {assigneeChatReport: chatReport});
}

/**
 * Auto-assign participant when creating a task in a DM
 * @param {String} reportID
 */

function setAssigneeValueWithParentReportID(reportID) {
    const report = ReportUtils.getReport(reportID);
    const isDefault = !(ReportUtils.isChatRoom(report) || ReportUtils.isPolicyExpenseChat(report));
    const participants = lodashGet(report, 'participants', []);
    const hasMultipleParticipants = participants.length > 1;
    if (!isDefault || hasMultipleParticipants || report.parentReportID) {
        return;
    }

    Onyx.merge(ONYXKEYS.TASK, {assignee: participants[0]});
}

/**
 * Sets the assignee value for the task and checks for an existing chat with the assignee
 * If there is no existing chat, it creates an optimistic chat report
 * It also sets the shareDestination as that chat report if a share destination isn't already set
 * @param {string} assignee
 * @param {Number} assigneeAccountID
 * @param {string} shareDestination
 * @param {boolean} isCurrentUser
 */

function setAssigneeValue(assignee, assigneeAccountID, shareDestination, isCurrentUser = false) {
    let newAssigneeAccountID = Number(assigneeAccountID);

    // Generate optimistic accountID if this is a brand new user account that hasn't been created yet
    if (!newAssigneeAccountID) {
        newAssigneeAccountID = UserUtils.generateAccountID();
    }
    if (!isCurrentUser) {
        let chatReport = ReportUtils.getChatByParticipants([newAssigneeAccountID]);
        if (!chatReport) {
            chatReport = ReportUtils.buildOptimisticChatReport([newAssigneeAccountID]);
            chatReport.isOptimisticReport = true;
        }
        const reportID = chatReport.reportID;
        setAssigneeChatReport(chatReport);

        if (!shareDestination) {
            setShareDestinationValue(reportID);
        }
    }

    // This is only needed for creation of a new task and so it should only be stored locally
    Onyx.merge(ONYXKEYS.TASK, {assignee, assigneeAccountID: newAssigneeAccountID});
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
    const source = UserUtils.getAvatar(lodashGet(details, 'avatar', ''), lodashGet(details, 'accountID', -1));
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
        icons: ReportUtils.getIcons(report, personalDetails, Expensicons.FallbackAvatar, ReportUtils.isIOUReport(report)),
        displayName: ReportUtils.getReportName(report),
        subtitle: ReportUtils.getChatRoomSubtitle(report),
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

    API.write('CancelTask', {cancelledTaskReportActionID: optimisticReportActionID, taskReportID}, {optimisticData, failureData});
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
 * Check if current user is either task assignee or task owner
 *
 * @param {Object} taskReport
 * @param {Number} sessionAccountID
 * @returns {Boolean}
 */
function isTaskAssigneeOrTaskOwner(taskReport, sessionAccountID) {
    return sessionAccountID === getTaskOwnerAccountID(taskReport) || sessionAccountID === getTaskAssigneeAccountID(taskReport);
}

export {
    createTaskAndNavigate,
    editTaskAndNavigate,
    setTitleValue,
    setDescriptionValue,
    setTaskReport,
    setDetailsValue,
    setAssigneeValue,
    setAssigneeValueWithParentReportID,
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
    isTaskAssigneeOrTaskOwner,
};
