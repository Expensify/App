import type {NullishDeep, OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import * as Expensicons from '@components/Icon/Expensicons';
import * as API from '@libs/API';
import type {CancelTaskParams, CompleteTaskParams, CreateTaskParams, EditTaskAssigneeParams, EditTaskParams, ReopenTaskParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import DateUtils from '@libs/DateUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as LocalePhoneNumber from '@libs/LocalePhoneNumber';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportConnection from '@libs/ReportConnection';
import * as ReportUtils from '@libs/ReportUtils';
import playSound, {SOUNDS} from '@libs/Sound';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import type {ReportActions} from '@src/types/onyx/ReportAction';
import type ReportAction from '@src/types/onyx/ReportAction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import * as Report from './Report';

type OptimisticReport = Pick<OnyxTypes.Report, 'reportName' | 'managerID' | 'notificationPreference' | 'pendingFields' | 'participants'>;
type Assignee = {
    icons: Icon[];
    displayName: string;
    subtitle: string;
};
type ShareDestination = {
    icons: Icon[];
    displayName: string;
    subtitle: string;
    displayNamesWithTooltips: ReportUtils.DisplayNameWithTooltips;
    shouldUseFullTitleToDisplay: boolean;
};
type PolicyValue = ValueOf<typeof CONST.POLICY.ROLE>;

let currentUserEmail = '';
let currentUserAccountID = -1;

Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        currentUserEmail = value?.email ?? '';
        currentUserAccountID = value?.accountID ?? -1;
    },
});

let allPersonalDetails: OnyxEntry<OnyxTypes.PersonalDetailsList>;
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => (allPersonalDetails = value),
});

let quickAction: OnyxEntry<OnyxTypes.QuickAction> = {};
Onyx.connect({
    key: ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
    callback: (value) => {
        quickAction = value;
    },
});

let allReportActions: OnyxCollection<ReportActions>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    waitForCollectionCallback: true,
    callback: (actions) => {
        if (!actions) {
            return;
        }

        allReportActions = actions;
    },
});

/**
 * Clears out the task info from the store
 */
function clearOutTaskInfo(skipConfirmation = false) {
    if (skipConfirmation) {
        Onyx.set(ONYXKEYS.TASK, {skipConfirmation: true});
    } else {
        Onyx.set(ONYXKEYS.TASK, null);
    }
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
 */
function createTaskAndNavigate(
    parentReportID: string,
    title: string,
    description: string,
    assigneeEmail: string,
    assigneeAccountID = 0,
    assigneeChatReport?: OnyxEntry<OnyxTypes.Report>,
    policyID: string = CONST.POLICY.OWNER_EMAIL_FAKE,
) {
    const optimisticTaskReport = ReportUtils.buildOptimisticTaskReport(currentUserAccountID, assigneeAccountID, parentReportID, title, description, policyID);

    const assigneeChatReportID = assigneeChatReport?.reportID ?? '-1';
    const taskReportID = optimisticTaskReport.reportID;
    let assigneeChatReportOnyxData;

    // Parent ReportAction indicating that a task has been created
    const optimisticTaskCreatedAction = ReportUtils.buildOptimisticCreatedReportAction(currentUserEmail);
    const optimisticAddCommentReport = ReportUtils.buildOptimisticTaskCommentReportAction(taskReportID, title, assigneeAccountID, `task for ${title}`, parentReportID);
    optimisticTaskReport.parentReportActionID = optimisticAddCommentReport.reportAction.reportActionID;

    const currentTime = DateUtils.getDBTimeWithSkew();
    const lastCommentText = ReportUtils.formatReportLastMessageText(ReportActionsUtils.getReportActionText(optimisticAddCommentReport.reportAction));
    const parentReport = ReportUtils.getReport(parentReportID);
    const optimisticParentReport = {
        lastVisibleActionCreated: optimisticAddCommentReport.reportAction.created,
        lastMessageText: lastCommentText,
        lastActorAccountID: currentUserAccountID,
        lastReadTime: currentTime,
        lastMessageTranslationKey: '',
        hasOutstandingChildTask: assigneeAccountID === currentUserAccountID ? true : parentReport?.hasOutstandingChildTask,
    };

    // We're only setting onyx data for the task report here because it's possible for the parent report to not exist yet (if you're assigning a task to someone you haven't chatted with before)
    // So we don't want to set the parent report data until we've successfully created that chat report
    // FOR TASK REPORT
    const optimisticData: OnyxUpdate[] = [
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
            value: {[optimisticTaskCreatedAction.reportActionID]: optimisticTaskCreatedAction as OnyxTypes.ReportAction},
        },
    ];

    // FOR TASK REPORT
    const successData: OnyxUpdate[] = [
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
                // BE will send a different participant. We clear the optimistic one to avoid duplicated entries
                participants: {[assigneeAccountID]: null},
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticTaskReport.reportID}`,
            value: {[optimisticTaskCreatedAction.reportActionID]: {pendingAction: null}},
        },
    ];

    // FOR TASK REPORT
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticTaskReport.reportID}`,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticTaskReport.reportID}`,
            value: null,
        },
    ];

    if (assigneeChatReport) {
        assigneeChatReportOnyxData = ReportUtils.getTaskAssigneeChatOnyxData(
            currentUserAccountID,
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
            value: {[optimisticAddCommentReport.reportAction.reportActionID]: optimisticAddCommentReport.reportAction as OnyxTypes.ReportAction},
        },
    );

    // FOR QUICK ACTION NVP
    optimisticData.push({
        onyxMethod: Onyx.METHOD.SET,
        key: ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
        value: {
            action: CONST.QUICK_ACTIONS.ASSIGN_TASK,
            chatReportID: parentReportID,
            isFirstQuickAction: isEmptyObject(quickAction),
            targetAccountID: assigneeAccountID,
        },
    });

    // If needed, update optimistic data for parent report action of the parent report.
    const optimisticParentReportData = ReportUtils.getOptimisticDataForParentReportAction(parentReportID, currentTime, CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
    optimisticParentReportData.forEach((parentReportData) => {
        if (isEmptyObject(parentReportData)) {
            return;
        }
        optimisticData.push(parentReportData);
    });

    // FOR PARENT REPORT (SHARE DESTINATION)
    successData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
        value: {[optimisticAddCommentReport.reportAction.reportActionID]: {pendingAction: null, isOptimisticAction: null}},
    });

    // FOR PARENT REPORT (SHARE DESTINATION)
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
        value: {
            [optimisticAddCommentReport.reportAction.reportActionID]: {
                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('task.genericCreateTaskFailureMessage'),
            },
        },
    });
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`,
        value: {
            hasOutstandingChildTask: parentReport?.hasOutstandingChildTask,
        },
    });

    clearOutTaskInfo();

    const parameters: CreateTaskParams = {
        parentReportActionID: optimisticAddCommentReport.reportAction.reportActionID,
        parentReportID,
        taskReportID: optimisticTaskReport.reportID,
        createdTaskReportActionID: optimisticTaskCreatedAction.reportActionID,
        title: optimisticTaskReport.reportName,
        description: optimisticTaskReport.description,
        assignee: assigneeEmail,
        assigneeAccountID,
        assigneeChatReportID,
        assigneeChatReportActionID: assigneeChatReportOnyxData?.optimisticAssigneeAddComment?.reportAction.reportActionID,
        assigneeChatCreatedReportActionID: assigneeChatReportOnyxData?.optimisticChatCreatedReportAction?.reportActionID,
    };

    API.write(WRITE_COMMANDS.CREATE_TASK, parameters, {optimisticData, successData, failureData});

    Navigation.dismissModal(parentReportID);
    Report.notifyNewAction(parentReportID, currentUserAccountID);
}

/**
 * @returns the object to update `report.hasOutstandingChildTask`
 */
function getOutstandingChildTask(taskReport: OnyxEntry<OnyxTypes.Report>) {
    const parentReportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${taskReport?.parentReportID}`] ?? {};
    return Object.values(parentReportActions).some((reportAction) => {
        if (String(reportAction.childReportID) === String(taskReport?.reportID)) {
            return false;
        }

        if (
            reportAction.childType === CONST.REPORT.TYPE.TASK &&
            reportAction?.childStateNum === CONST.REPORT.STATE_NUM.OPEN &&
            reportAction?.childStatusNum === CONST.REPORT.STATUS_NUM.OPEN &&
            ReportActionsUtils.getReportActionMessage(reportAction)?.isDeletedParentAction
        ) {
            return true;
        }

        return false;
    });
}

/**
 * Complete a task
 */
function completeTask(taskReport: OnyxEntry<OnyxTypes.Report>) {
    const taskReportID = taskReport?.reportID ?? '-1';
    const message = `marked as complete`;
    const completedTaskReportAction = ReportUtils.buildOptimisticTaskReportAction(taskReportID, CONST.REPORT.ACTIONS.TYPE.TASK_COMPLETED, message);
    const parentReport = getParentReport(taskReport);
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${taskReportID}`,
            value: {
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                lastReadTime: DateUtils.getDBTime(),
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${taskReportID}`,
            value: {[completedTaskReportAction.reportActionID]: completedTaskReportAction as OnyxTypes.ReportAction},
        },
    ];

    const successData: OnyxUpdate[] = [
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

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${taskReportID}`,
            value: {
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                lastReadTime: taskReport?.lastReadTime ?? null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${taskReportID}`,
            value: {
                [completedTaskReportAction.reportActionID]: {
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('task.messages.error'),
                },
            },
        },
    ];

    if (parentReport?.hasOutstandingChildTask) {
        const hasOutstandingChildTask = getOutstandingChildTask(taskReport);
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${taskReport?.parentReportID}`,
            value: {
                hasOutstandingChildTask,
            },
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${taskReport?.parentReportID}`,
            value: {
                hasOutstandingChildTask: parentReport?.hasOutstandingChildTask,
            },
        });
    }

    const parameters: CompleteTaskParams = {
        taskReportID,
        completedTaskReportActionID: completedTaskReportAction.reportActionID,
    };

    playSound(SOUNDS.SUCCESS);
    API.write(WRITE_COMMANDS.COMPLETE_TASK, parameters, {optimisticData, successData, failureData});
    Report.notifyNewAction(taskReportID, currentUserAccountID);
}

/**
 * Reopen a closed task
 */
function reopenTask(taskReport: OnyxEntry<OnyxTypes.Report>) {
    const taskReportID = taskReport?.reportID ?? '-1';
    const message = `marked as incomplete`;
    const reopenedTaskReportAction = ReportUtils.buildOptimisticTaskReportAction(taskReportID, CONST.REPORT.ACTIONS.TYPE.TASK_REOPENED, message);
    const parentReport = getParentReport(taskReport);
    const hasOutstandingChildTask = taskReport?.managerID === currentUserAccountID ? true : parentReport?.hasOutstandingChildTask;

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${taskReportID}`,
            value: {
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                lastVisibleActionCreated: reopenedTaskReportAction.created,
                lastMessageText: message,
                lastActorAccountID: reopenedTaskReportAction.actorAccountID,
                lastReadTime: reopenedTaskReportAction.created,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${taskReport?.parentReportID}`,
            value: {
                hasOutstandingChildTask,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${taskReportID}`,
            value: {[reopenedTaskReportAction.reportActionID]: reopenedTaskReportAction as OnyxTypes.ReportAction},
        },
    ];

    const successData: OnyxUpdate[] = [
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
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${taskReportID}`,
            value: {
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${taskReport?.parentReportID}`,
            value: {
                hasOutstandingChildTask: taskReport?.hasOutstandingChildTask,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${taskReportID}`,
            value: {
                [reopenedTaskReportAction.reportActionID]: {
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('task.messages.error'),
                },
            },
        },
    ];

    const parameters: ReopenTaskParams = {
        taskReportID,
        reopenedTaskReportActionID: reopenedTaskReportAction.reportActionID,
    };

    API.write(WRITE_COMMANDS.REOPEN_TASK, parameters, {optimisticData, successData, failureData});
    Report.notifyNewAction(taskReportID, currentUserAccountID);
}

function editTask(report: OnyxTypes.Report, {title, description}: OnyxTypes.Task) {
    // Create the EditedReportAction on the task
    const editTaskReportAction = ReportUtils.buildOptimisticEditedTaskFieldReportAction({title, description});

    // Sometimes title or description is undefined, so we need to check for that, and we provide it to multiple functions
    const reportName = (title ?? report?.reportName)?.trim();

    // Description can be unset, so we default to an empty string if so
    const newDescription = description ? ReportUtils.getParsedComment(description) : report.description;
    const reportDescription = (newDescription ?? '').trim();

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`,
            value: {[editTaskReportAction.reportActionID]: editTaskReportAction as OnyxTypes.ReportAction},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`,
            value: {
                reportName,
                description: reportDescription,
                pendingFields: {
                    ...(title && {reportName: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
                    ...(description && {description: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
                },
                errorFields: null,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`,
            value: {[editTaskReportAction.reportActionID]: {pendingAction: null}},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`,
            value: {
                pendingFields: {
                    ...(title && {reportName: null}),
                    ...(description && {description: null}),
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
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
            },
        },
    ];

    const parameters: EditTaskParams = {
        taskReportID: report.reportID,
        title: reportName,
        description: reportDescription,
        editedTaskReportActionID: editTaskReportAction.reportActionID,
    };

    API.write(WRITE_COMMANDS.EDIT_TASK, parameters, {optimisticData, successData, failureData});
    Report.notifyNewAction(report.reportID, currentUserAccountID);
}

function editTaskAssignee(report: OnyxTypes.Report, ownerAccountID: number, assigneeEmail: string, assigneeAccountID: number | null = 0, assigneeChatReport?: OnyxEntry<OnyxTypes.Report>) {
    // Create the EditedReportAction on the task
    const editTaskReportAction = ReportUtils.buildOptimisticChangedTaskAssigneeReportAction(assigneeAccountID ?? 0);
    const reportName = report.reportName?.trim();

    let assigneeChatReportOnyxData;
    const assigneeChatReportID = assigneeChatReport ? assigneeChatReport.reportID : '-1';
    const optimisticReport: OptimisticReport = {
        reportName,
        managerID: assigneeAccountID ?? report.managerID,
        pendingFields: {
            ...(assigneeAccountID && {managerID: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        },
        notificationPreference: [assigneeAccountID, ownerAccountID].includes(currentUserAccountID)
            ? CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS
            : CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
    };
    const successReport: NullishDeep<OnyxTypes.Report> = {pendingFields: {...(assigneeAccountID && {managerID: null})}};

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`,
            value: {[editTaskReportAction.reportActionID]: editTaskReportAction as OnyxTypes.ReportAction},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`,
            value: optimisticReport,
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`,
            value: {[editTaskReportAction.reportActionID]: {pendingAction: null}},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`,
            value: successReport,
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`,
            value: {[editTaskReportAction.reportActionID]: {pendingAction: null}},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`,
            value: {managerID: report.managerID},
        },
    ];

    if (currentUserAccountID === assigneeAccountID) {
        const parentReport = getParentReport(report);
        if (!isEmptyObject(parentReport)) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${parentReport.reportID}`,
                value: {hasOutstandingChildTask: true},
            });
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${parentReport.reportID}`,
                value: {hasOutstandingChildTask: parentReport?.hasOutstandingChildTask},
            });
        }
    }

    if (report.managerID === currentUserAccountID) {
        const hasOutstandingChildTask = getOutstandingChildTask(report);
        const parentReport = getParentReport(report);
        if (!isEmptyObject(parentReport)) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${parentReport.reportID}`,
                value: {hasOutstandingChildTask},
            });
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${parentReport.reportID}`,
                value: {hasOutstandingChildTask: parentReport?.hasOutstandingChildTask},
            });
        }
    }

    // If we make a change to the assignee, we want to add a comment to the assignee's chat
    // Check if the assignee actually changed
    if (assigneeAccountID && assigneeAccountID !== report.managerID && assigneeAccountID !== ownerAccountID && assigneeChatReport) {
        optimisticReport.participants = {[assigneeAccountID]: {hidden: false}};

        assigneeChatReportOnyxData = ReportUtils.getTaskAssigneeChatOnyxData(
            currentUserAccountID,
            assigneeAccountID,
            report.reportID,
            assigneeChatReportID ?? '-1',
            report.parentReportID ?? '-1',
            reportName ?? '',
            assigneeChatReport,
        );

        if (assigneeChatReport?.isOptimisticReport && assigneeChatReport.pendingFields?.createChat !== CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
            // BE will send a different participant. We clear the optimistic one to avoid duplicated entries
            successReport.participants = {[assigneeAccountID]: null};
        }

        optimisticData.push(...assigneeChatReportOnyxData.optimisticData);
        successData.push(...assigneeChatReportOnyxData.successData);
        failureData.push(...assigneeChatReportOnyxData.failureData);
    }

    const parameters: EditTaskAssigneeParams = {
        taskReportID: report.reportID,
        assignee: assigneeEmail,
        editedTaskReportActionID: editTaskReportAction.reportActionID,
        assigneeChatReportID,
        assigneeChatReportActionID: assigneeChatReportOnyxData?.optimisticAssigneeAddComment?.reportAction.reportActionID,
        assigneeChatCreatedReportActionID: assigneeChatReportOnyxData?.optimisticChatCreatedReportAction?.reportActionID,
    };

    API.write(WRITE_COMMANDS.EDIT_TASK_ASSIGNEE, parameters, {optimisticData, successData, failureData});
    Report.notifyNewAction(report.reportID, currentUserAccountID);
}

/**
 * Sets the report info for the task being viewed
 */
function setTaskReport(report: OnyxEntry<OnyxTypes.Report>) {
    Onyx.merge(ONYXKEYS.TASK, {report});
}

/**
 * Sets the title and description values for the task
 */
function setDetailsValue(title: string, description: string) {
    // This is only needed for creation of a new task and so it should only be stored locally
    Onyx.merge(ONYXKEYS.TASK, {title: title.trim(), description: description.trim()});
}

/**
 * Sets the title value for the task
 */
function setTitleValue(title: string) {
    Onyx.merge(ONYXKEYS.TASK, {title: title.trim()});
}

/**
 * Sets the description value for the task
 */
function setDescriptionValue(description: string) {
    Onyx.merge(ONYXKEYS.TASK, {description: description.trim()});
}

/**
 * Sets the shareDestination value for the task
 */
function setShareDestinationValue(shareDestination: string) {
    // This is only needed for creation of a new task and so it should only be stored locally
    Onyx.merge(ONYXKEYS.TASK, {shareDestination});
}

/* Sets the assigneeChatReport details for the task
 */
function setAssigneeChatReport(chatReport: OnyxTypes.Report) {
    Onyx.merge(ONYXKEYS.TASK, {assigneeChatReport: chatReport});
}

function setNewOptimisticAssignee(assigneeLogin: string, assigneeAccountID: number) {
    const report: ReportUtils.OptimisticChatReport = ReportUtils.buildOptimisticChatReport([assigneeAccountID, currentUserAccountID]);

    // When assigning a task to a new user, by default we share the task in their DM
    // However, the DM doesn't exist yet - and will be created optimistically once the task is created
    // We don't want to show the new DM yet, because if you select an assignee and then change the assignee, the previous DM will still be shown
    // So here, we create it optimistically to share it with the assignee, but we have to hide it until the task is created
    report.isHidden = true;
    Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);

    const optimisticPersonalDetailsListAction: OnyxTypes.PersonalDetails = {
        accountID: assigneeAccountID,
        avatar: allPersonalDetails?.[assigneeAccountID]?.avatar,
        displayName: allPersonalDetails?.[assigneeAccountID]?.displayName ?? assigneeLogin,
        login: assigneeLogin,
    };
    Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[assigneeAccountID]: optimisticPersonalDetailsListAction});
    return {assignee: optimisticPersonalDetailsListAction, assigneeReport: report};
}

/**
 * Sets the assignee value for the task and checks for an existing chat with the assignee
 * If there is no existing chat, it creates an optimistic chat report
 * It also sets the shareDestination as that chat report if a share destination isn't already set
 */
function setAssigneeValue(
    assigneeEmail: string,
    assigneeAccountID: number,
    shareToReportID?: string,
    chatReport?: OnyxEntry<OnyxTypes.Report>,
    isCurrentUser = false,
    skipShareDestination = false,
): OnyxEntry<OnyxTypes.Report> | undefined {
    let report: OnyxEntry<OnyxTypes.Report> | undefined = chatReport;
    if (!isCurrentUser) {
        // Check for the chatReport by participants IDs
        if (!report) {
            report = ReportUtils.getChatByParticipants([assigneeAccountID, currentUserAccountID]);
        }
        // If chat report is still not found we need to build new optimistic chat report
        if (!report) {
            report = setNewOptimisticAssignee(assigneeEmail, assigneeAccountID).assigneeReport;
        }

        // The optimistic field may not exist in the existing report and it can be overridden by the optimistic field of previous report data when merging the assignee chat report
        // Therefore, we should add these optimistic fields here to prevent incorrect merging, which could lead to the creation of duplicate actions for an existing report
        setAssigneeChatReport({
            ...report,
            isOptimisticReport: report?.isOptimisticReport ?? false,
            pendingFields: report?.pendingFields,
            pendingAction: report?.pendingAction,
        });

        // If there is no share destination set, automatically set it to the assignee chat report
        // This allows for a much quicker process when creating a new task and is likely the desired share destination most times
        if (!shareToReportID && !skipShareDestination) {
            setShareDestinationValue(report?.reportID ?? '-1');
        }
    }

    // This is only needed for creation of a new task and so it should only be stored locally
    Onyx.merge(ONYXKEYS.TASK, {assignee: assigneeEmail, assigneeAccountID});

    // When we're editing the assignee, we immediately call editTaskAssignee. Since setting the assignee is async,
    // the chatReport is not yet set when editTaskAssignee is called. So we return the chatReport here so that
    // editTaskAssignee can use it.
    return report;
}

/**
 * Sets the parentReportID value for the task
 */
function setParentReportID(parentReportID: string) {
    // This is only needed for creation of a new task and so it should only be stored locally
    Onyx.merge(ONYXKEYS.TASK, {parentReportID});
}

/**
 * Clears out the task info from the store and navigates to the NewTaskDetails page
 */
function clearOutTaskInfoAndNavigate(reportID?: string, chatReport?: OnyxEntry<OnyxTypes.Report>, accountID = 0, skipConfirmation = false) {
    clearOutTaskInfo(skipConfirmation);
    if (reportID && reportID !== '0') {
        setParentReportID(reportID);
    }
    if (accountID > 0) {
        const accountLogin = allPersonalDetails?.[accountID]?.login ?? '';
        setAssigneeValue(accountLogin, accountID, reportID, chatReport, false, skipConfirmation);
    }
    Navigation.navigate(ROUTES.NEW_TASK_DETAILS);
}

/**
 * Get the assignee data
 */
function getAssignee(assigneeAccountID: number, personalDetails: OnyxEntry<OnyxTypes.PersonalDetailsList>): Assignee {
    const details = personalDetails?.[assigneeAccountID];

    if (!details) {
        return {
            icons: [],
            displayName: '',
            subtitle: '',
        };
    }

    return {
        icons: ReportUtils.getIconsForParticipants([details.accountID], personalDetails),
        displayName: PersonalDetailsUtils.getDisplayNameOrDefault(details),
        subtitle: details.login ?? '',
    };
}

/**
 * Get the share destination data
 * */
function getShareDestination(reportID: string, reports: OnyxCollection<OnyxTypes.Report>, personalDetails: OnyxEntry<OnyxTypes.PersonalDetailsList>): ShareDestination {
    const report = reports?.[`report_${reportID}`];

    const isOneOnOneChat = ReportUtils.isOneOnOneChat(report);

    const participants = ReportUtils.getParticipantsAccountIDsForDisplay(report);

    const isMultipleParticipant = participants.length > 1;
    const displayNamesWithTooltips = ReportUtils.getDisplayNamesWithTooltips(OptionsListUtils.getPersonalDetailsForAccountIDs(participants, personalDetails), isMultipleParticipant);

    let subtitle = '';
    if (isOneOnOneChat) {
        const participantAccountID = participants[0] ?? -1;

        const displayName = personalDetails?.[participantAccountID]?.displayName ?? '';
        const login = personalDetails?.[participantAccountID]?.login ?? '';
        subtitle = LocalePhoneNumber.formatPhoneNumber(login || displayName);
    } else {
        subtitle = ReportUtils.getChatRoomSubtitle(report) ?? '';
    }
    return {
        icons: ReportUtils.getIcons(report, personalDetails, Expensicons.FallbackAvatar),
        displayName: ReportUtils.getReportName(report),
        subtitle,
        displayNamesWithTooltips,
        shouldUseFullTitleToDisplay: ReportUtils.shouldUseFullTitleToDisplay(report),
    };
}

/**
 * Returns the parentReportAction if the given report is a thread/task.
 */
function getParentReportAction(report: OnyxEntry<OnyxTypes.Report>): OnyxEntry<ReportAction> {
    // If the report is not a thread report, then it won't have a parent and an empty object can be returned.
    if (!report?.parentReportID || !report.parentReportActionID) {
        return undefined;
    }
    return allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID}`]?.[report.parentReportActionID];
}

/**
 * Returns the parentReport if the given report is a thread
 */
function getParentReport(report: OnyxEntry<OnyxTypes.Report>): OnyxEntry<OnyxTypes.Report> {
    if (!report?.parentReportID) {
        return undefined;
    }
    return ReportConnection.getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`];
}

/**
 * Cancels a task by setting the report state to SUBMITTED and status to CLOSED
 */
function deleteTask(report: OnyxEntry<OnyxTypes.Report>) {
    if (!report) {
        return;
    }
    const message = `deleted task: ${report.reportName}`;
    const optimisticCancelReportAction = ReportUtils.buildOptimisticTaskReportAction(report.reportID ?? '-1', CONST.REPORT.ACTIONS.TYPE.TASK_CANCELLED, message);
    const optimisticReportActionID = optimisticCancelReportAction.reportActionID;
    const parentReportAction = getParentReportAction(report);
    const parentReport = getParentReport(report);

    // If the task report is the last visible action in the parent report, we should navigate back to the parent report
    const shouldDeleteTaskReport = !ReportActionsUtils.doesReportHaveVisibleActions(report.reportID ?? '-1');
    const optimisticReportAction: Partial<ReportUtils.OptimisticTaskReportAction> = {
        pendingAction: shouldDeleteTaskReport ? CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE : CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
        previousMessage: parentReportAction?.message,
        message: [
            {
                translationKey: '',
                type: 'COMMENT',
                html: '',
                text: '',
                isEdited: true,
                isDeletedParentAction: true,
            },
        ],
        errors: undefined,
        linkMetadata: [],
    };
    const optimisticReportActions = {
        [parentReportAction?.reportActionID ?? '-1']: optimisticReportAction,
    };
    const hasOutstandingChildTask = getOutstandingChildTask(report);

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`,
            value: {
                lastVisibleActionCreated: optimisticCancelReportAction.created,
                lastMessageText: message,
                lastActorAccountID: optimisticCancelReportAction.actorAccountID,
                isDeletedParentAction: true,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${parentReport?.reportID}`,
            value: {
                lastMessageText: ReportActionsUtils.getLastVisibleMessage(parentReport?.reportID ?? '-1', optimisticReportActions as OnyxTypes.ReportActions).lastMessageText ?? '',
                lastVisibleActionCreated: ReportActionsUtils.getLastVisibleAction(parentReport?.reportID ?? '-1', optimisticReportActions as OnyxTypes.ReportActions)?.created,
                hasOutstandingChildTask,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`,
            value: {
                [optimisticReportActionID]: optimisticCancelReportAction as OnyxTypes.ReportAction,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReport?.reportID}`,
            value: optimisticReportActions as OnyxTypes.ReportActions,
        },
    ];

    // Update optimistic data for parent report action if the report is a child report and the task report has no visible child
    const childVisibleActionCount = parentReportAction?.childVisibleActionCount ?? 0;
    if (childVisibleActionCount === 0) {
        const optimisticParentReportData = ReportUtils.getOptimisticDataForParentReportAction(
            parentReport?.reportID ?? '-1',
            parentReport?.lastVisibleActionCreated ?? '',
            CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
        );
        optimisticParentReportData.forEach((parentReportData) => {
            if (isEmptyObject(parentReportData)) {
                return;
            }
            optimisticData.push(parentReportData);
        });
    }

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`,
            value: {
                [optimisticReportActionID]: {
                    pendingAction: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReport?.reportID}`,
            value: {
                [parentReportAction?.reportActionID ?? '-1']: {
                    pendingAction: null,
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`,
            value: {
                stateNum: report.stateNum ?? '',
                statusNum: report.statusNum ?? '',
            } as OnyxTypes.Report,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${parentReport?.reportID}`,
            value: {
                hasOutstandingChildTask: parentReport?.hasOutstandingChildTask,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`,
            value: {
                [optimisticReportActionID]: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReport?.reportID}`,
            value: {
                [parentReportAction?.reportActionID ?? '-1']: {
                    pendingAction: null,
                },
            },
        },
    ];

    const parameters: CancelTaskParams = {
        cancelledTaskReportActionID: optimisticReportActionID,
        taskReportID: report.reportID,
    };

    API.write(WRITE_COMMANDS.CANCEL_TASK, parameters, {optimisticData, successData, failureData});
    Report.notifyNewAction(report.reportID, currentUserAccountID);

    if (shouldDeleteTaskReport) {
        Navigation.goBack(ROUTES.REPORT_WITH_ID.getRoute(parentReport?.reportID ?? '-1'));
    }
}

/**
 * Closes the current open task modal and clears out the task info from the store.
 */
function dismissModalAndClearOutTaskInfo() {
    Navigation.closeRHPFlow();
    clearOutTaskInfo();
}

/**
 * Returns Task assignee accountID
 */
function getTaskAssigneeAccountID(taskReport: OnyxEntry<OnyxTypes.Report>): number | undefined {
    if (!taskReport) {
        return;
    }

    if (taskReport.managerID) {
        return taskReport.managerID;
    }

    const reportAction = getParentReportAction(taskReport);
    return reportAction?.childManagerAccountID;
}

/**
 * Returns Task owner accountID
 */
function getTaskOwnerAccountID(taskReport: OnyxEntry<OnyxTypes.Report>): number | undefined {
    return taskReport?.ownerAccountID;
}

/**
 * Check if you're allowed to modify the task - anyone that has write access to the report can modify the task
 */
function canModifyTask(taskReport: OnyxEntry<OnyxTypes.Report>, sessionAccountID: number): boolean {
    if (ReportUtils.isCanceledTaskReport(taskReport)) {
        return false;
    }

    const parentReport = getParentReport(taskReport);
    const reportNameValuePairs = ReportUtils.getReportNameValuePairs(parentReport?.reportID);
    if (ReportUtils.isArchivedRoom(parentReport, reportNameValuePairs)) {
        return false;
    }

    if (sessionAccountID === getTaskOwnerAccountID(taskReport) || sessionAccountID === getTaskAssigneeAccountID(taskReport)) {
        return true;
    }

    if (!ReportUtils.canWriteInReport(taskReport)) {
        return false;
    }

    return !isEmptyObject(taskReport) && ReportUtils.isAllowedToComment(taskReport);
}

function clearTaskErrors(reportID: string) {
    const report = ReportConnection.getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];

    // Delete the task preview in the parent report
    if (report?.pendingFields?.createChat === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID}`, {
            [report.parentReportActionID ?? -1]: null,
        });

        Report.navigateToConciergeChatAndDeleteReport(reportID);
        return;
    }

    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
        pendingFields: null,
        errorFields: null,
    });
}

export {
    createTaskAndNavigate,
    editTask,
    editTaskAssignee,
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
    deleteTask,
    dismissModalAndClearOutTaskInfo,
    getTaskAssigneeAccountID,
    clearTaskErrors,
    canModifyTask,
    setNewOptimisticAssignee,
};

export type {PolicyValue, Assignee, ShareDestination};
