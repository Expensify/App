"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTaskAndNavigate = createTaskAndNavigate;
exports.editTask = editTask;
exports.editTaskAssignee = editTaskAssignee;
exports.setTitleValue = setTitleValue;
exports.setDescriptionValue = setDescriptionValue;
exports.setTaskReport = setTaskReport;
exports.setDetailsValue = setDetailsValue;
exports.setAssigneeValue = setAssigneeValue;
exports.setShareDestinationValue = setShareDestinationValue;
exports.clearOutTaskInfo = clearOutTaskInfo;
exports.reopenTask = reopenTask;
exports.buildTaskData = buildTaskData;
exports.completeTask = completeTask;
exports.clearOutTaskInfoAndNavigate = clearOutTaskInfoAndNavigate;
exports.startOutCreateTaskQuickAction = startOutCreateTaskQuickAction;
exports.getAssignee = getAssignee;
exports.getShareDestination = getShareDestination;
exports.deleteTask = deleteTask;
exports.dismissModalAndClearOutTaskInfo = dismissModalAndClearOutTaskInfo;
exports.getTaskAssigneeAccountID = getTaskAssigneeAccountID;
exports.clearTaskErrors = clearTaskErrors;
exports.canModifyTask = canModifyTask;
exports.setNewOptimisticAssignee = setNewOptimisticAssignee;
exports.getNavigationUrlOnTaskDelete = getNavigationUrlOnTaskDelete;
exports.canActionTask = canActionTask;
exports.getFinishOnboardingTaskOnyxData = getFinishOnboardingTaskOnyxData;
exports.completeTestDriveTask = completeTestDriveTask;
var react_native_1 = require("react-native");
var react_native_onyx_1 = require("react-native-onyx");
var Expensicons = require("@components/Icon/Expensicons");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var DateUtils_1 = require("@libs/DateUtils");
var ErrorUtils = require("@libs/ErrorUtils");
var LocalePhoneNumber = require("@libs/LocalePhoneNumber");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils = require("@libs/OptionsListUtils");
var PersonalDetailsUtils = require("@libs/PersonalDetailsUtils");
var ReportActionsUtils = require("@libs/ReportActionsUtils");
var ReportUtils = require("@libs/ReportUtils");
var Sound_1 = require("@libs/Sound");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var Report_1 = require("./Report");
var Welcome_1 = require("./Welcome");
var currentUserEmail = '';
var currentUserAccountID = -1;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.SESSION,
    callback: function (value) {
        var _a, _b;
        currentUserEmail = (_a = value === null || value === void 0 ? void 0 : value.email) !== null && _a !== void 0 ? _a : '';
        currentUserAccountID = (_b = value === null || value === void 0 ? void 0 : value.accountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID;
    },
});
var allPersonalDetails;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
    callback: function (value) { return (allPersonalDetails = value); },
});
var quickAction = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_QUICK_ACTION_GLOBAL_CREATE,
    callback: function (value) {
        quickAction = value;
    },
});
var allReportActions;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS,
    waitForCollectionCallback: true,
    callback: function (actions) {
        if (!actions) {
            return;
        }
        allReportActions = actions;
    },
});
var allReports;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: function (value) {
        allReports = value;
    },
});
var introSelected = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_INTRO_SELECTED,
    callback: function (val) { return (introSelected = val); },
});
var allReportNameValuePair;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS,
    waitForCollectionCallback: true,
    callback: function (value) {
        if (!value) {
            return;
        }
        allReportNameValuePair = value;
    },
});
/**
 * Clears out the task info from the store
 */
function clearOutTaskInfo(skipConfirmation) {
    if (skipConfirmation === void 0) { skipConfirmation = false; }
    if (skipConfirmation) {
        react_native_onyx_1.default.set(ONYXKEYS_1.default.TASK, { skipConfirmation: true });
    }
    else {
        react_native_onyx_1.default.set(ONYXKEYS_1.default.TASK, null);
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
function createTaskAndNavigate(parentReportID, title, description, assigneeEmail, assigneeAccountID, assigneeChatReport, policyID, isCreatedUsingMarkdown) {
    var _a, _b, _c, _d, _e, _f, _g;
    var _h, _j;
    if (assigneeAccountID === void 0) { assigneeAccountID = 0; }
    if (policyID === void 0) { policyID = CONST_1.default.POLICY.OWNER_EMAIL_FAKE; }
    if (isCreatedUsingMarkdown === void 0) { isCreatedUsingMarkdown = false; }
    if (!parentReportID) {
        return;
    }
    var optimisticTaskReport = ReportUtils.buildOptimisticTaskReport(currentUserAccountID, parentReportID, assigneeAccountID, title, description, policyID);
    var assigneeChatReportID = assigneeChatReport === null || assigneeChatReport === void 0 ? void 0 : assigneeChatReport.reportID;
    var taskReportID = optimisticTaskReport.reportID;
    var assigneeChatReportOnyxData;
    // Parent ReportAction indicating that a task has been created
    var optimisticTaskCreatedAction = ReportUtils.buildOptimisticCreatedReportAction(currentUserEmail);
    var optimisticAddCommentReport = ReportUtils.buildOptimisticTaskCommentReportAction(taskReportID, title, assigneeAccountID, "task for ".concat(title), parentReportID);
    optimisticTaskReport.parentReportActionID = optimisticAddCommentReport.reportAction.reportActionID;
    var currentTime = DateUtils_1.default.getDBTimeWithSkew();
    var lastCommentText = ReportUtils.formatReportLastMessageText(ReportActionsUtils.getReportActionText(optimisticAddCommentReport.reportAction));
    var parentReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(parentReportID)];
    var optimisticParentReport = {
        lastVisibleActionCreated: optimisticAddCommentReport.reportAction.created,
        lastMessageText: lastCommentText,
        lastActorAccountID: currentUserAccountID,
        lastReadTime: currentTime,
        hasOutstandingChildTask: assigneeAccountID === currentUserAccountID ? true : parentReport === null || parentReport === void 0 ? void 0 : parentReport.hasOutstandingChildTask,
    };
    // We're only setting onyx data for the task report here because it's possible for the parent report to not exist yet (if you're assigning a task to someone you haven't chatted with before)
    // So we don't want to set the parent report data until we've successfully created that chat report
    // FOR TASK REPORT
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(optimisticTaskReport.reportID),
            value: __assign(__assign({}, optimisticTaskReport), { pendingFields: {
                    createChat: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    reportName: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    description: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    managerID: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                } }),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(optimisticTaskReport.reportID),
            value: {
                isOptimisticReport: true,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(optimisticTaskReport.reportID),
            value: (_a = {}, _a[optimisticTaskCreatedAction.reportActionID] = optimisticTaskCreatedAction, _a),
        },
    ];
    // FOR TASK REPORT
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(optimisticTaskReport.reportID),
            value: {
                pendingFields: {
                    createChat: null,
                    reportName: null,
                    description: null,
                    managerID: null,
                },
                // BE will send a different participant. We clear the optimistic one to avoid duplicated entries
                participants: (_b = {}, _b[assigneeAccountID] = null, _b),
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(optimisticTaskReport.reportID),
            value: {
                isOptimisticReport: false,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(optimisticTaskReport.reportID),
            value: (_c = {}, _c[optimisticTaskCreatedAction.reportActionID] = { pendingAction: null }, _c),
        },
    ];
    // FOR TASK REPORT
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(optimisticTaskReport.reportID),
            value: null,
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(optimisticTaskReport.reportID),
            value: null,
        },
    ];
    if (assigneeChatReport && assigneeChatReportID) {
        assigneeChatReportOnyxData = ReportUtils.getTaskAssigneeChatOnyxData(currentUserAccountID, assigneeAccountID, taskReportID, assigneeChatReportID, parentReportID, title, assigneeChatReport);
        optimisticData.push.apply(optimisticData, assigneeChatReportOnyxData.optimisticData);
        successData.push.apply(successData, assigneeChatReportOnyxData.successData);
        failureData.push.apply(failureData, assigneeChatReportOnyxData.failureData);
    }
    // Now that we've created the optimistic chat report and chat reportActions, we can update the parent report data
    // FOR PARENT REPORT (SHARE DESTINATION)
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(parentReportID),
        value: optimisticParentReport,
    }, {
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(parentReportID),
        value: (_d = {}, _d[optimisticAddCommentReport.reportAction.reportActionID] = optimisticAddCommentReport.reportAction, _d),
    });
    var shouldUpdateNotificationPreference = !(0, EmptyObject_1.isEmptyObject)(parentReport) && ReportUtils.isHiddenForCurrentUser(parentReport);
    if (shouldUpdateNotificationPreference) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(parentReportID),
            value: {
                participants: (_e = {},
                    _e[currentUserAccountID] = { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
                    _e),
            },
        });
    }
    // FOR QUICK ACTION NVP
    optimisticData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.SET,
        key: ONYXKEYS_1.default.NVP_QUICK_ACTION_GLOBAL_CREATE,
        value: {
            action: CONST_1.default.QUICK_ACTIONS.ASSIGN_TASK,
            chatReportID: parentReportID,
            isFirstQuickAction: (0, EmptyObject_1.isEmptyObject)(quickAction),
            targetAccountID: assigneeAccountID,
        },
    });
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.SET,
        key: ONYXKEYS_1.default.NVP_QUICK_ACTION_GLOBAL_CREATE,
        value: quickAction !== null && quickAction !== void 0 ? quickAction : null,
    });
    // If needed, update optimistic data for parent report action of the parent report.
    var optimisticParentReportData = ReportUtils.getOptimisticDataForParentReportAction(parentReportID, currentTime, CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD);
    optimisticParentReportData.forEach(function (parentReportData) {
        if ((0, EmptyObject_1.isEmptyObject)(parentReportData)) {
            return;
        }
        optimisticData.push(parentReportData);
    });
    // FOR PARENT REPORT (SHARE DESTINATION)
    successData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(parentReportID),
        value: (_f = {}, _f[optimisticAddCommentReport.reportAction.reportActionID] = { pendingAction: null, isOptimisticAction: null }, _f),
    });
    // FOR PARENT REPORT (SHARE DESTINATION)
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(parentReportID),
        value: (_g = {},
            _g[optimisticAddCommentReport.reportAction.reportActionID] = {
                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('task.genericCreateTaskFailureMessage'),
            },
            _g),
    });
    failureData.push({
        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(parentReportID),
        value: {
            hasOutstandingChildTask: parentReport === null || parentReport === void 0 ? void 0 : parentReport.hasOutstandingChildTask,
        },
    });
    var parameters = {
        parentReportActionID: optimisticAddCommentReport.reportAction.reportActionID,
        parentReportID: parentReportID,
        taskReportID: optimisticTaskReport.reportID,
        createdTaskReportActionID: optimisticTaskCreatedAction.reportActionID,
        htmlTitle: optimisticTaskReport.reportName,
        description: optimisticTaskReport.description,
        assignee: assigneeEmail,
        assigneeAccountID: assigneeAccountID,
        assigneeChatReportID: assigneeChatReportID,
        assigneeChatReportActionID: (_h = assigneeChatReportOnyxData === null || assigneeChatReportOnyxData === void 0 ? void 0 : assigneeChatReportOnyxData.optimisticAssigneeAddComment) === null || _h === void 0 ? void 0 : _h.reportAction.reportActionID,
        assigneeChatCreatedReportActionID: (_j = assigneeChatReportOnyxData === null || assigneeChatReportOnyxData === void 0 ? void 0 : assigneeChatReportOnyxData.optimisticChatCreatedReportAction) === null || _j === void 0 ? void 0 : _j.reportActionID,
    };
    (0, Sound_1.default)(Sound_1.SOUNDS.DONE);
    API.write(types_1.WRITE_COMMANDS.CREATE_TASK, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
    if (!isCreatedUsingMarkdown) {
        react_native_1.InteractionManager.runAfterInteractions(function () {
            clearOutTaskInfo();
        });
        Navigation_1.default.dismissModalWithReport({ reportID: parentReportID });
    }
    (0, Report_1.notifyNewAction)(parentReportID, currentUserAccountID, optimisticAddCommentReport.reportAction);
}
/**
 * @returns the object to update `report.hasOutstandingChildTask`
 */
function getOutstandingChildTask(taskReport) {
    var _a;
    var parentReportActions = (_a = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(taskReport === null || taskReport === void 0 ? void 0 : taskReport.parentReportID)]) !== null && _a !== void 0 ? _a : {};
    return Object.values(parentReportActions).some(function (reportAction) {
        var _a;
        if (String(reportAction.childReportID) === String(taskReport === null || taskReport === void 0 ? void 0 : taskReport.reportID)) {
            return false;
        }
        if (reportAction.childType === CONST_1.default.REPORT.TYPE.TASK &&
            (reportAction === null || reportAction === void 0 ? void 0 : reportAction.childStateNum) === CONST_1.default.REPORT.STATE_NUM.OPEN &&
            (reportAction === null || reportAction === void 0 ? void 0 : reportAction.childStatusNum) === CONST_1.default.REPORT.STATUS_NUM.OPEN &&
            !((_a = ReportActionsUtils.getReportActionMessage(reportAction)) === null || _a === void 0 ? void 0 : _a.isDeletedParentAction)) {
            return true;
        }
        return false;
    });
}
function buildTaskData(taskReport, taskReportID) {
    var _a, _b, _c;
    var _d;
    var message = "marked as complete";
    var completedTaskReportAction = ReportUtils.buildOptimisticTaskReportAction(taskReportID, CONST_1.default.REPORT.ACTIONS.TYPE.TASK_COMPLETED, message);
    var parentReport = getParentReport(taskReport);
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(taskReportID),
            value: {
                stateNum: CONST_1.default.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST_1.default.REPORT.STATUS_NUM.APPROVED,
                lastReadTime: DateUtils_1.default.getDBTime(),
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(taskReportID),
            value: (_a = {}, _a[completedTaskReportAction.reportActionID] = completedTaskReportAction, _a),
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(taskReportID),
            value: (_b = {},
                _b[completedTaskReportAction.reportActionID] = {
                    pendingAction: null,
                },
                _b),
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(taskReportID),
            value: {
                stateNum: CONST_1.default.REPORT.STATE_NUM.OPEN,
                statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN,
                lastReadTime: (_d = taskReport === null || taskReport === void 0 ? void 0 : taskReport.lastReadTime) !== null && _d !== void 0 ? _d : null,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(taskReportID),
            value: (_c = {},
                _c[completedTaskReportAction.reportActionID] = {
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('task.messages.error'),
                },
                _c),
        },
    ];
    if (parentReport === null || parentReport === void 0 ? void 0 : parentReport.hasOutstandingChildTask) {
        var hasOutstandingChildTask = getOutstandingChildTask(taskReport);
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(taskReport === null || taskReport === void 0 ? void 0 : taskReport.parentReportID),
            value: {
                hasOutstandingChildTask: hasOutstandingChildTask,
            },
        });
        failureData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(taskReport === null || taskReport === void 0 ? void 0 : taskReport.parentReportID),
            value: {
                hasOutstandingChildTask: parentReport === null || parentReport === void 0 ? void 0 : parentReport.hasOutstandingChildTask,
            },
        });
    }
    var parameters = {
        taskReportID: taskReportID,
        completedTaskReportActionID: completedTaskReportAction.reportActionID,
    };
    return { optimisticData: optimisticData, failureData: failureData, successData: successData, parameters: parameters };
}
/**
 * Complete a task
 */
function completeTask(taskReport, reportIDFromAction) {
    var _a;
    var taskReportID = (_a = taskReport === null || taskReport === void 0 ? void 0 : taskReport.reportID) !== null && _a !== void 0 ? _a : reportIDFromAction;
    if (!taskReportID) {
        return {};
    }
    var _b = buildTaskData(taskReport, taskReportID), optimisticData = _b.optimisticData, successData = _b.successData, failureData = _b.failureData, parameters = _b.parameters;
    (0, Sound_1.default)(Sound_1.SOUNDS.SUCCESS);
    API.write(types_1.WRITE_COMMANDS.COMPLETE_TASK, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
    return { optimisticData: optimisticData, successData: successData, failureData: failureData };
}
/**
 * Reopen a closed task
 */
function reopenTask(taskReport, reportIDFromAction) {
    var _a, _b, _c;
    var _d;
    var taskReportID = (_d = taskReport === null || taskReport === void 0 ? void 0 : taskReport.reportID) !== null && _d !== void 0 ? _d : reportIDFromAction;
    if (!taskReportID) {
        return;
    }
    var message = "marked as incomplete";
    var reopenedTaskReportAction = ReportUtils.buildOptimisticTaskReportAction(taskReportID, CONST_1.default.REPORT.ACTIONS.TYPE.TASK_REOPENED, message);
    var parentReport = getParentReport(taskReport);
    var hasOutstandingChildTask = (taskReport === null || taskReport === void 0 ? void 0 : taskReport.managerID) === currentUserAccountID ? true : parentReport === null || parentReport === void 0 ? void 0 : parentReport.hasOutstandingChildTask;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(taskReportID),
            value: {
                stateNum: CONST_1.default.REPORT.STATE_NUM.OPEN,
                statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN,
                lastVisibleActionCreated: reopenedTaskReportAction.created,
                lastMessageText: message,
                lastActorAccountID: reopenedTaskReportAction.actorAccountID,
                lastReadTime: reopenedTaskReportAction.created,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(taskReport === null || taskReport === void 0 ? void 0 : taskReport.parentReportID),
            value: {
                hasOutstandingChildTask: hasOutstandingChildTask,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(taskReportID),
            value: (_a = {}, _a[reopenedTaskReportAction.reportActionID] = reopenedTaskReportAction, _a),
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(taskReportID),
            value: (_b = {},
                _b[reopenedTaskReportAction.reportActionID] = {
                    pendingAction: null,
                },
                _b),
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(taskReportID),
            value: {
                stateNum: CONST_1.default.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST_1.default.REPORT.STATUS_NUM.APPROVED,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(taskReport === null || taskReport === void 0 ? void 0 : taskReport.parentReportID),
            value: {
                hasOutstandingChildTask: taskReport === null || taskReport === void 0 ? void 0 : taskReport.hasOutstandingChildTask,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(taskReportID),
            value: (_c = {},
                _c[reopenedTaskReportAction.reportActionID] = {
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('task.messages.error'),
                },
                _c),
        },
    ];
    var parameters = {
        taskReportID: taskReportID,
        reopenedTaskReportActionID: reopenedTaskReportAction.reportActionID,
    };
    API.write(types_1.WRITE_COMMANDS.REOPEN_TASK, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function editTask(report, _a) {
    var _b, _c, _d;
    var _e;
    var title = _a.title, description = _a.description;
    // Create the EditedReportAction on the task
    var editTaskReportAction = ReportUtils.buildOptimisticEditedTaskFieldReportAction({ title: title, description: description });
    // Ensure title is defined before parsing it with getParsedComment. If title is undefined, fall back to reportName from report.
    // Trim the final parsed title for consistency.
    var reportName = title ? ReportUtils.getParsedComment(title, undefined, undefined, __spreadArray([], CONST_1.default.TASK_TITLE_DISABLED_RULES, true)) : ((_e = report === null || report === void 0 ? void 0 : report.reportName) !== null && _e !== void 0 ? _e : '');
    var parsedTitle = (reportName !== null && reportName !== void 0 ? reportName : '').trim();
    // Description can be unset, so we default to an empty string if so
    var newDescription = typeof description === 'string' ? ReportUtils.getParsedComment(description) : report.description;
    var reportDescription = (newDescription !== null && newDescription !== void 0 ? newDescription : '').trim();
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.reportID),
            value: (_b = {}, _b[editTaskReportAction.reportActionID] = editTaskReportAction, _b),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID),
            value: {
                reportName: parsedTitle,
                description: reportDescription,
                pendingFields: __assign(__assign({}, (title && { reportName: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE })), (description && { description: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE })),
                errorFields: null,
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.reportID),
            value: (_c = {}, _c[editTaskReportAction.reportActionID] = { pendingAction: null }, _c),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID),
            value: {
                reportName: parsedTitle,
                description: reportDescription,
                pendingFields: __assign(__assign({}, (title && { reportName: null })), (description && { description: null })),
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.reportID),
            value: (_d = {}, _d[editTaskReportAction.reportActionID] = { pendingAction: null }, _d),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID),
            value: {
                reportName: report.reportName,
                description: report.description,
            },
        },
    ];
    var parameters = {
        taskReportID: report.reportID,
        htmlTitle: parsedTitle,
        description: reportDescription,
        editedTaskReportActionID: editTaskReportAction.reportActionID,
    };
    API.write(types_1.WRITE_COMMANDS.EDIT_TASK, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function editTaskAssignee(report, sessionAccountID, assigneeEmail, assigneeAccountID, assigneeChatReport) {
    var _a, _b, _c, _d, _e, _f;
    var _g, _h, _j, _k, _l;
    if (assigneeAccountID === void 0) { assigneeAccountID = 0; }
    // Create the EditedReportAction on the task
    var editTaskReportAction = ReportUtils.buildOptimisticChangedTaskAssigneeReportAction(assigneeAccountID !== null && assigneeAccountID !== void 0 ? assigneeAccountID : CONST_1.default.DEFAULT_NUMBER_ID);
    var reportName = (_g = report.reportName) === null || _g === void 0 ? void 0 : _g.trim();
    var assigneeChatReportOnyxData;
    var assigneeChatReportID = assigneeChatReport === null || assigneeChatReport === void 0 ? void 0 : assigneeChatReport.reportID;
    var assigneeChatReportMetadata = ReportUtils.getReportMetadata(assigneeChatReportID);
    var parentReport = getParentReport(report);
    var taskOwnerAccountID = report === null || report === void 0 ? void 0 : report.ownerAccountID;
    var optimisticReport = {
        reportName: reportName,
        managerID: assigneeAccountID !== null && assigneeAccountID !== void 0 ? assigneeAccountID : report.managerID,
        pendingFields: __assign({}, (assigneeAccountID && { managerID: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE })),
        participants: (_a = {},
            _a[currentUserAccountID] = {
                notificationPreference: [assigneeAccountID, taskOwnerAccountID].includes(currentUserAccountID) && !parentReport
                    ? CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS
                    : CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
            },
            _a),
    };
    var successReport = { pendingFields: __assign({}, (assigneeAccountID && { managerID: null })) };
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.reportID),
            value: (_b = {}, _b[editTaskReportAction.reportActionID] = editTaskReportAction, _b),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID),
            value: optimisticReport,
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.reportID),
            value: (_c = {}, _c[editTaskReportAction.reportActionID] = { pendingAction: null }, _c),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID),
            value: successReport,
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.reportID),
            value: (_d = {}, _d[editTaskReportAction.reportActionID] = { pendingAction: null }, _d),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID),
            value: { managerID: report.managerID },
        },
    ];
    if (currentUserAccountID === assigneeAccountID) {
        if (!(0, EmptyObject_1.isEmptyObject)(parentReport)) {
            optimisticData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(parentReport.reportID),
                value: { hasOutstandingChildTask: true },
            });
            failureData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(parentReport.reportID),
                value: { hasOutstandingChildTask: parentReport === null || parentReport === void 0 ? void 0 : parentReport.hasOutstandingChildTask },
            });
        }
    }
    if (report.managerID === currentUserAccountID) {
        var hasOutstandingChildTask = getOutstandingChildTask(report);
        if (!(0, EmptyObject_1.isEmptyObject)(parentReport)) {
            optimisticData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(parentReport.reportID),
                value: { hasOutstandingChildTask: hasOutstandingChildTask },
            });
            failureData.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(parentReport.reportID),
                value: { hasOutstandingChildTask: parentReport === null || parentReport === void 0 ? void 0 : parentReport.hasOutstandingChildTask },
            });
        }
    }
    // If we make a change to the assignee, we want to add a comment to the assignee's chat
    // Check if the assignee actually changed
    if (assigneeAccountID && assigneeAccountID !== report.managerID && assigneeAccountID !== sessionAccountID && assigneeChatReport && assigneeChatReport && assigneeChatReportID) {
        optimisticReport.participants = __assign(__assign({}, ((_h = optimisticReport.participants) !== null && _h !== void 0 ? _h : {})), (_e = {}, _e[assigneeAccountID] = {
            notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
        }, _e));
        assigneeChatReportOnyxData = ReportUtils.getTaskAssigneeChatOnyxData(currentUserAccountID, assigneeAccountID, report.reportID, assigneeChatReportID, report.parentReportID, reportName !== null && reportName !== void 0 ? reportName : '', assigneeChatReport);
        if ((assigneeChatReportMetadata === null || assigneeChatReportMetadata === void 0 ? void 0 : assigneeChatReportMetadata.isOptimisticReport) && ((_j = assigneeChatReport.pendingFields) === null || _j === void 0 ? void 0 : _j.createChat) !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
            // BE will send a different participant. We clear the optimistic one to avoid duplicated entries
            successReport.participants = (_f = {}, _f[assigneeAccountID] = null, _f);
        }
        optimisticData.push.apply(optimisticData, assigneeChatReportOnyxData.optimisticData);
        successData.push.apply(successData, assigneeChatReportOnyxData.successData);
        failureData.push.apply(failureData, assigneeChatReportOnyxData.failureData);
    }
    var parameters = {
        taskReportID: report.reportID,
        assignee: assigneeEmail,
        editedTaskReportActionID: editTaskReportAction.reportActionID,
        assigneeChatReportID: assigneeChatReportID,
        assigneeChatReportActionID: (_k = assigneeChatReportOnyxData === null || assigneeChatReportOnyxData === void 0 ? void 0 : assigneeChatReportOnyxData.optimisticAssigneeAddComment) === null || _k === void 0 ? void 0 : _k.reportAction.reportActionID,
        assigneeChatCreatedReportActionID: (_l = assigneeChatReportOnyxData === null || assigneeChatReportOnyxData === void 0 ? void 0 : assigneeChatReportOnyxData.optimisticChatCreatedReportAction) === null || _l === void 0 ? void 0 : _l.reportActionID,
    };
    API.write(types_1.WRITE_COMMANDS.EDIT_TASK_ASSIGNEE, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
/**
 * Sets the report info for the task being viewed
 */
function setTaskReport(report) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.TASK, { report: report });
}
/**
 * Sets the title and description values for the task
 */
function setDetailsValue(title, description) {
    // This is only needed for creation of a new task and so it should only be stored locally
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.TASK, { title: title.trim(), description: description.trim() });
}
/**
 * Sets the title value for the task
 */
function setTitleValue(title) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.TASK, { title: title.trim() });
}
/**
 * Sets the description value for the task
 */
function setDescriptionValue(description) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.TASK, { description: description.trim() });
}
/**
 * Sets the shareDestination value for the task
 */
function setShareDestinationValue(shareDestination) {
    // This is only needed for creation of a new task and so it should only be stored locally
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.TASK, { shareDestination: shareDestination });
}
/* Sets the assigneeChatReport details for the task
 */
function setAssigneeChatReport(chatReport, isOptimisticReport) {
    if (isOptimisticReport === void 0) { isOptimisticReport = false; }
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.TASK, { assigneeChatReport: chatReport });
    if (isOptimisticReport) {
        react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(chatReport.reportID), { isOptimisticReport: isOptimisticReport });
    }
}
function setNewOptimisticAssignee(assigneeLogin, assigneeAccountID) {
    var _a;
    var _b, _c, _d;
    var report = ReportUtils.buildOptimisticChatReport({
        participantList: [assigneeAccountID, currentUserAccountID],
        reportName: '',
        policyID: CONST_1.default.POLICY.OWNER_EMAIL_FAKE,
        ownerAccountID: CONST_1.default.POLICY.OWNER_ACCOUNT_ID_FAKE,
        notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
    });
    react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID), report);
    var optimisticPersonalDetailsListAction = {
        accountID: assigneeAccountID,
        avatar: (_b = allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[assigneeAccountID]) === null || _b === void 0 ? void 0 : _b.avatar,
        displayName: (_d = (_c = allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[assigneeAccountID]) === null || _c === void 0 ? void 0 : _c.displayName) !== null && _d !== void 0 ? _d : assigneeLogin,
        login: assigneeLogin,
    };
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, (_a = {}, _a[assigneeAccountID] = optimisticPersonalDetailsListAction, _a));
    return { assignee: optimisticPersonalDetailsListAction, assigneeReport: report };
}
/**
 * Sets the assignee value for the task and checks for an existing chat with the assignee
 * If there is no existing chat, it creates an optimistic chat report
 * It also sets the shareDestination as that chat report if a share destination isn't already set
 */
function setAssigneeValue(assigneeEmail, assigneeAccountID, shareToReportID, chatReport, isCurrentUser, skipShareDestination) {
    if (isCurrentUser === void 0) { isCurrentUser = false; }
    if (skipShareDestination === void 0) { skipShareDestination = false; }
    var report = chatReport;
    if (isCurrentUser) {
        var selfDMReportID = ReportUtils.findSelfDMReportID();
        // If there is no share destination set, automatically set it to the assignee chat report
        // This allows for a much quicker process when creating a new task and is likely the desired share destination most times
        if (!shareToReportID && !skipShareDestination) {
            setShareDestinationValue(selfDMReportID);
        }
    }
    else {
        // Check for the chatReport by participants IDs
        if (!report) {
            report = ReportUtils.getChatByParticipants([assigneeAccountID, currentUserAccountID]);
        }
        // If chat report is still not found we need to build new optimistic chat report
        if (!report) {
            report = setNewOptimisticAssignee(assigneeEmail, assigneeAccountID).assigneeReport;
        }
        var reportMetadata = ReportUtils.getReportMetadata(report === null || report === void 0 ? void 0 : report.reportID);
        // The optimistic field may not exist in the existing report and it can be overridden by the optimistic field of previous report data when merging the assignee chat report
        // Therefore, we should add these optimistic fields here to prevent incorrect merging, which could lead to the creation of duplicate actions for an existing report
        setAssigneeChatReport(__assign(__assign({}, report), { pendingFields: report === null || report === void 0 ? void 0 : report.pendingFields, pendingAction: report === null || report === void 0 ? void 0 : report.pendingAction }), reportMetadata ? reportMetadata.isOptimisticReport : true);
        // If there is no share destination set, automatically set it to the assignee chat report
        // This allows for a much quicker process when creating a new task and is likely the desired share destination most times
        if (!shareToReportID && !skipShareDestination) {
            setShareDestinationValue(report === null || report === void 0 ? void 0 : report.reportID);
        }
    }
    // This is only needed for creation of a new task and so it should only be stored locally
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.TASK, { assignee: assigneeEmail, assigneeAccountID: assigneeAccountID });
    // When we're editing the assignee, we immediately call editTaskAssignee. Since setting the assignee is async,
    // the chatReport is not yet set when editTaskAssignee is called. So we return the chatReport here so that
    // editTaskAssignee can use it.
    return report;
}
/**
 * Sets the parentReportID value for the task
 */
function setParentReportID(parentReportID) {
    // This is only needed for creation of a new task and so it should only be stored locally
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.TASK, { parentReportID: parentReportID });
}
/**
 * Clears out the task info from the store and navigates to the NewTaskDetails page
 */
function clearOutTaskInfoAndNavigate(reportID, chatReport, accountID, skipConfirmation) {
    var _a, _b;
    if (accountID === void 0) { accountID = 0; }
    if (skipConfirmation === void 0) { skipConfirmation = false; }
    clearOutTaskInfo(skipConfirmation);
    if (reportID && reportID !== '0') {
        setParentReportID(reportID);
    }
    if (accountID > 0) {
        var accountLogin = (_b = (_a = allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[accountID]) === null || _a === void 0 ? void 0 : _a.login) !== null && _b !== void 0 ? _b : '';
        setAssigneeValue(accountLogin, accountID, reportID, chatReport, accountID === currentUserAccountID, skipConfirmation);
    }
    Navigation_1.default.navigate(ROUTES_1.default.NEW_TASK_DETAILS.getRoute(Navigation_1.default.getReportRHPActiveRoute()));
}
/**
 * Start out create task action quick action step
 */
function startOutCreateTaskQuickAction(reportID, targetAccountID) {
    // The second parameter of clearOutTaskInfoAndNavigate is the chat report or DM report
    // between the user and the person to whom the task is assigned.
    // Since chatReportID isn't stored in NVP_QUICK_ACTION_GLOBAL_CREATE, we set
    // it to undefined. This will make setAssigneeValue to search for the correct report.
    clearOutTaskInfoAndNavigate(reportID, undefined, targetAccountID, true);
}
/**
 * Get the assignee data
 */
function getAssignee(assigneeAccountID, personalDetails) {
    var _a;
    if (!assigneeAccountID) {
        return;
    }
    var details = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[assigneeAccountID];
    if (!details) {
        return {
            icons: [],
            displayName: '',
            subtitle: '',
        };
    }
    return {
        icons: ReportUtils.getIconsForParticipants([details.accountID], personalDetails),
        displayName: LocalePhoneNumber.formatPhoneNumber(PersonalDetailsUtils.getDisplayNameOrDefault(details)),
        subtitle: (_a = details.login) !== null && _a !== void 0 ? _a : '',
    };
}
/**
 * Get the share destination data
 * */
function getShareDestination(reportID, reports, personalDetails) {
    var _a, _b, _c, _d, _e, _f;
    var report = reports === null || reports === void 0 ? void 0 : reports["report_".concat(reportID)];
    var isOneOnOneChat = ReportUtils.isOneOnOneChat(report);
    var participants = ReportUtils.getParticipantsAccountIDsForDisplay(report);
    var isMultipleParticipant = participants.length > 1;
    var displayNamesWithTooltips = ReportUtils.getDisplayNamesWithTooltips(OptionsListUtils.getPersonalDetailsForAccountIDs(participants, personalDetails), isMultipleParticipant);
    var subtitle = '';
    if (isOneOnOneChat) {
        var participantAccountID = (_a = participants.at(0)) !== null && _a !== void 0 ? _a : -1;
        var displayName = (_c = (_b = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[participantAccountID]) === null || _b === void 0 ? void 0 : _b.displayName) !== null && _c !== void 0 ? _c : '';
        var login = (_e = (_d = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[participantAccountID]) === null || _d === void 0 ? void 0 : _d.login) !== null && _e !== void 0 ? _e : '';
        subtitle = LocalePhoneNumber.formatPhoneNumber(login || displayName);
    }
    else {
        subtitle = (_f = ReportUtils.getChatRoomSubtitle(report)) !== null && _f !== void 0 ? _f : '';
    }
    return {
        icons: ReportUtils.getIcons(report, personalDetails, Expensicons.FallbackAvatar),
        displayName: ReportUtils.getReportName(report),
        subtitle: subtitle,
        displayNamesWithTooltips: displayNamesWithTooltips,
        shouldUseFullTitleToDisplay: ReportUtils.shouldUseFullTitleToDisplay(report),
    };
}
/**
 * Returns the parentReportAction if the given report is a thread/task.
 */
function getParentReportAction(report) {
    var _a;
    // If the report is not a thread report, then it won't have a parent and an empty object can be returned.
    if (!(report === null || report === void 0 ? void 0 : report.parentReportID) || !report.parentReportActionID) {
        return undefined;
    }
    return (_a = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.parentReportID)]) === null || _a === void 0 ? void 0 : _a[report.parentReportActionID];
}
/**
 * Returns the parentReport if the given report is a thread
 */
function getParentReport(report) {
    if (!(report === null || report === void 0 ? void 0 : report.parentReportID)) {
        return undefined;
    }
    return allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.parentReportID)];
}
/**
 * Calculate the URL to navigate to after a task deletion
 * @param report - The task report being deleted
 * @returns The URL to navigate to
 */
function getNavigationUrlOnTaskDelete(report) {
    if (!report) {
        return undefined;
    }
    var shouldDeleteTaskReport = !ReportActionsUtils.doesReportHaveVisibleActions(report.reportID);
    if (!shouldDeleteTaskReport) {
        return undefined;
    }
    // First try to navigate to parent report
    var parentReport = getParentReport(report);
    if (parentReport === null || parentReport === void 0 ? void 0 : parentReport.reportID) {
        return ROUTES_1.default.REPORT_WITH_ID.getRoute(parentReport.reportID);
    }
    // If no parent report, try to navigate to most recent report
    var mostRecentReportID = (0, Report_1.getMostRecentReportID)(report);
    if (mostRecentReportID) {
        return ROUTES_1.default.REPORT_WITH_ID.getRoute(mostRecentReportID);
    }
    return undefined;
}
/**
 * Cancels a task by setting the report state to SUBMITTED and status to CLOSED
 */
function deleteTask(report) {
    var _a, _b, _c, _d, _e, _f;
    var _g, _h, _j, _k, _l, _m;
    if (!report) {
        return;
    }
    var message = "deleted task: ".concat(report.reportName);
    var optimisticCancelReportAction = ReportUtils.buildOptimisticTaskReportAction(report.reportID, CONST_1.default.REPORT.ACTIONS.TYPE.TASK_CANCELLED, message);
    var optimisticReportActionID = optimisticCancelReportAction.reportActionID;
    var parentReportAction = getParentReportAction(report);
    var parentReport = getParentReport(report);
    var canUserPerformWriteAction = ReportUtils.canUserPerformWriteAction(report);
    // If the task report is the last visible action in the parent report, we should navigate back to the parent report
    var shouldDeleteTaskReport = !ReportActionsUtils.doesReportHaveVisibleActions(report.reportID, canUserPerformWriteAction);
    var optimisticReportAction = {
        pendingAction: shouldDeleteTaskReport ? CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE : CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
        previousMessage: parentReportAction === null || parentReportAction === void 0 ? void 0 : parentReportAction.message,
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
    var optimisticReportActions = (parentReportAction === null || parentReportAction === void 0 ? void 0 : parentReportAction.reportActionID) ? (_a = {}, _a[parentReportAction === null || parentReportAction === void 0 ? void 0 : parentReportAction.reportActionID] = optimisticReportAction, _a) : {};
    var hasOutstandingChildTask = getOutstandingChildTask(report);
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID),
            value: {
                lastVisibleActionCreated: optimisticCancelReportAction.created,
                lastMessageText: message,
                lastActorAccountID: optimisticCancelReportAction.actorAccountID,
                isDeletedParentAction: true,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(parentReport === null || parentReport === void 0 ? void 0 : parentReport.reportID),
            value: {
                lastMessageText: (_g = ReportActionsUtils.getLastVisibleMessage(parentReport === null || parentReport === void 0 ? void 0 : parentReport.reportID, canUserPerformWriteAction, optimisticReportActions).lastMessageText) !== null && _g !== void 0 ? _g : '',
                lastVisibleActionCreated: (_h = ReportActionsUtils.getLastVisibleAction(parentReport === null || parentReport === void 0 ? void 0 : parentReport.reportID, canUserPerformWriteAction, optimisticReportActions)) === null || _h === void 0 ? void 0 : _h.created,
                hasOutstandingChildTask: hasOutstandingChildTask,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.reportID),
            value: (_b = {},
                _b[optimisticReportActionID] = optimisticCancelReportAction,
                _b),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(parentReport === null || parentReport === void 0 ? void 0 : parentReport.reportID),
            value: optimisticReportActions,
        },
    ];
    // Update optimistic data for parent report action if the report is a child report and the task report has no visible child
    var childVisibleActionCount = (_j = parentReportAction === null || parentReportAction === void 0 ? void 0 : parentReportAction.childVisibleActionCount) !== null && _j !== void 0 ? _j : 0;
    if (childVisibleActionCount === 0) {
        var optimisticParentReportData = ReportUtils.getOptimisticDataForParentReportAction(parentReport === null || parentReport === void 0 ? void 0 : parentReport.reportID, (_k = parentReport === null || parentReport === void 0 ? void 0 : parentReport.lastVisibleActionCreated) !== null && _k !== void 0 ? _k : '', CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
        optimisticParentReportData.forEach(function (parentReportData) {
            if ((0, EmptyObject_1.isEmptyObject)(parentReportData)) {
                return;
            }
            optimisticData.push(parentReportData);
        });
    }
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.reportID),
            value: (_c = {},
                _c[optimisticReportActionID] = {
                    pendingAction: null,
                },
                _c),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(parentReport === null || parentReport === void 0 ? void 0 : parentReport.reportID),
            value: (parentReportAction === null || parentReportAction === void 0 ? void 0 : parentReportAction.reportActionID) ? (_d = {}, _d[parentReportAction.reportActionID] = { pendingAction: null }, _d) : {},
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID),
            value: {
                stateNum: (_l = report.stateNum) !== null && _l !== void 0 ? _l : '',
                statusNum: (_m = report.statusNum) !== null && _m !== void 0 ? _m : '',
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(parentReport === null || parentReport === void 0 ? void 0 : parentReport.reportID),
            value: {
                hasOutstandingChildTask: parentReport === null || parentReport === void 0 ? void 0 : parentReport.hasOutstandingChildTask,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.reportID),
            value: (_e = {},
                _e[optimisticReportActionID] = null,
                _e),
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(parentReport === null || parentReport === void 0 ? void 0 : parentReport.reportID),
            value: (parentReportAction === null || parentReportAction === void 0 ? void 0 : parentReportAction.reportActionID) ? (_f = {}, _f[parentReportAction === null || parentReportAction === void 0 ? void 0 : parentReportAction.reportActionID] = { pendingAction: null }, _f) : {},
        },
    ];
    var parameters = {
        cancelledTaskReportActionID: optimisticReportActionID,
        taskReportID: report.reportID,
    };
    API.write(types_1.WRITE_COMMANDS.CANCEL_TASK, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
    (0, Report_1.notifyNewAction)(report.reportID, currentUserAccountID);
    var urlToNavigateBack = getNavigationUrlOnTaskDelete(report);
    if (urlToNavigateBack) {
        Navigation_1.default.goBack();
        return urlToNavigateBack;
    }
}
/**
 * Closes the current open task modal and clears out the task info from the store.
 */
function dismissModalAndClearOutTaskInfo(backTo) {
    if (backTo) {
        Navigation_1.default.goBack(backTo);
    }
    else {
        Navigation_1.default.closeRHPFlow();
    }
    clearOutTaskInfo();
}
/**
 * Returns Task assignee accountID
 */
function getTaskAssigneeAccountID(taskReport) {
    if (!taskReport) {
        return;
    }
    if (taskReport.managerID) {
        return taskReport.managerID;
    }
    var reportAction = getParentReportAction(taskReport);
    return reportAction === null || reportAction === void 0 ? void 0 : reportAction.childManagerAccountID;
}
/**
 * Check if you're allowed to modify the task - only the author can modify the task
 */
function canModifyTask(taskReport, sessionAccountID, isParentReportArchived) {
    if (isParentReportArchived === void 0) { isParentReportArchived = false; }
    if (!sessionAccountID) {
        return false;
    }
    if (ReportUtils.isCanceledTaskReport(taskReport)) {
        return false;
    }
    if (isParentReportArchived) {
        return false;
    }
    return sessionAccountID === (taskReport === null || taskReport === void 0 ? void 0 : taskReport.ownerAccountID);
}
/**
 * Check if you can change the status of the task (mark complete or incomplete). Only the task owner and task assignee can do this.
 */
function canActionTask(taskReport, sessionAccountID, parentReport, isParentReportArchived) {
    if (isParentReportArchived === void 0) { isParentReportArchived = false; }
    // Return early if there was no sessionAccountID (this can happen because when connecting to the session key in onyx, the session will be undefined initially)
    if (!sessionAccountID) {
        return false;
    }
    // When there is no parent report, exit early (this can also happen due to onyx key initialization)
    if (!parentReport) {
        return false;
    }
    // Cancelled task reports cannot be actioned since they are cancelled and users shouldn't be able to do anything with them
    if (ReportUtils.isCanceledTaskReport(taskReport)) {
        return false;
    }
    // If the parent report is a non expense report and it's archived, then the user cannot take actions (similar to cancelled task reports)
    var isParentAnExpenseReport = ReportUtils.isExpenseReport(parentReport);
    var isParentAnExpenseRequest = ReportUtils.isExpenseRequest(parentReport);
    var isParentANonExpenseReport = !(isParentAnExpenseReport || isParentAnExpenseRequest);
    if (isParentANonExpenseReport && isParentReportArchived) {
        return false;
    }
    // The task can only be actioned by the task report owner or the task assignee
    return sessionAccountID === (taskReport === null || taskReport === void 0 ? void 0 : taskReport.ownerAccountID) || sessionAccountID === getTaskAssigneeAccountID(taskReport);
}
function clearTaskErrors(reportID) {
    var _a;
    var _b;
    if (!reportID) {
        return;
    }
    var report = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID)];
    // Delete the task preview in the parent report
    if (((_b = report === null || report === void 0 ? void 0 : report.pendingFields) === null || _b === void 0 ? void 0 : _b.createChat) === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
        react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.parentReportID), report.parentReportActionID ? (_a = {}, _a[report.parentReportActionID] = null, _a) : {});
        (0, Report_1.navigateToConciergeChatAndDeleteReport)(reportID);
        return;
    }
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID), {
        pendingFields: null,
        errorFields: null,
    });
}
function getFinishOnboardingTaskOnyxData(taskName) {
    var taskReportID = introSelected === null || introSelected === void 0 ? void 0 : introSelected[taskName];
    var taskReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(taskReportID)];
    var parentReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(taskReport === null || taskReport === void 0 ? void 0 : taskReport.parentReportID)];
    var parentReportNameValuePairs = allReportNameValuePair === null || allReportNameValuePair === void 0 ? void 0 : allReportNameValuePair["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(parentReport === null || parentReport === void 0 ? void 0 : parentReport.reportID)];
    var isParentReportArchived = ReportUtils.isArchivedReport(parentReportNameValuePairs);
    if (taskReportID && canActionTask(taskReport, currentUserAccountID, parentReport, isParentReportArchived)) {
        if (taskReport) {
            if (taskReport.stateNum !== CONST_1.default.REPORT.STATE_NUM.APPROVED || taskReport.statusNum !== CONST_1.default.REPORT.STATUS_NUM.APPROVED) {
                return completeTask(taskReport);
            }
        }
    }
    return {};
}
function completeTestDriveTask(viewTourReport, viewTourReportID, shouldUpdateSelfTourViewedOnlyLocally) {
    if (shouldUpdateSelfTourViewedOnlyLocally === void 0) { shouldUpdateSelfTourViewedOnlyLocally = false; }
    (0, Welcome_1.setSelfTourViewed)(shouldUpdateSelfTourViewedOnlyLocally);
    completeTask(viewTourReport, viewTourReportID);
}
