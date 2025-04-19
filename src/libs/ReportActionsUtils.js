'use strict';
var __rest =
    (this && this.__rest) ||
    function (s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === 'function')
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
            }
        return t;
    };
var __spreadArrays =
    (this && this.__spreadArrays) ||
    function () {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++) for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) r[k] = a[j];
        return r;
    };
exports.__esModule = true;
exports.isAddCommentAction =
    exports.isResolvedConciergeCategoryOptions =
    exports.isConciergeCategoryOptions =
    exports.isActionableTrackExpense =
    exports.isActionableReportMentionWhisper =
    exports.isActionableMentionWhisper =
    exports.isActionableJoinRequestPending =
    exports.isActionableJoinRequest =
    exports.isActionableWhisper =
    exports.isActionOfType =
    exports.hasRequestFromCurrentAccount =
    exports.getWhisperedTo =
    exports.getTrackExpenseActionableWhisper =
    exports.getTextFromHtml =
    exports.getSortedReportActionsForDisplay =
    exports.getSortedReportActions =
    exports.getReportPreviewAction =
    exports.getReportActionText =
    exports.getReportActionMessageText =
    exports.getReportActionMessage =
    exports.getReportActionHtml =
    exports.getReportAction =
    exports.getDemotedFromWorkspaceMessage =
    exports.getRemovedFromApprovalChainMessage =
    exports.getOriginalMessage =
    exports.getOneTransactionThreadReportID =
    exports.getNumberOfMoneyRequests =
    exports.getMostRecentIOURequestActionID =
    exports.getMessageOfOldDotReportAction =
    exports.getReportActionMessageFragments =
    exports.getUpdateRoomDescriptionFragment =
    exports.getMemberChangeMessageFragment =
    exports.getLinkedTransactionID =
    exports.getLatestReportActionFromOnyxData =
    exports.getLastVisibleMessage =
    exports.getLastVisibleAction =
    exports.getLastClosedReportAction =
    exports.getIOUReportIDFromReportActionPreview =
    exports.getIOUActionForTransactionID =
    exports.getIOUActionForReportID =
    exports.getFirstVisibleReportActionID =
    exports.getDismissedViolationMessageText =
    exports.getCombinedReportActions =
    exports.getAllReportActions =
    exports.getActionableMentionWhisperMessage =
    exports.getHtmlWithAttachmentID =
    exports.isReportActionUnread =
    exports.formatLastMessageText =
    exports.extractLinksFromMessageHtml =
    exports.doesReportHaveVisibleActions =
        void 0;
exports.shouldHideNewMarker =
    exports.isResolvedActionableWhisper =
    exports.isTagModificationAction =
    exports.isWhisperActionTargetedToOthers =
    exports.isForwardedAction =
    exports.isUnapprovedAction =
    exports.isApprovedAction =
    exports.isSubmittedAndClosedAction =
    exports.isSubmittedAction =
    exports.isWhisperAction =
    exports.isTripPreview =
    exports.isTransactionThread =
    exports.isTrackExpenseAction =
    exports.isThreadParentMessage =
    exports.isTaskAction =
    exports.isSplitBillAction =
    exports.isSentMoneyReportAction =
    exports.isRoomChangeLogAction =
    exports.isReversedTransaction =
    exports.isReportPreviewAction =
    exports.isReportActionDeprecated =
    exports.isReportActionAttachment =
    exports.isRenamedAction =
    exports.isReimbursementQueuedAction =
    exports.isReimbursementDeQueuedOrCanceledAction =
    exports.isReimbursementDeQueuedAction =
    exports.isReimbursementCanceledAction =
    exports.isPolicyChangeLogAction =
    exports.isPendingRemove =
    exports.isPayAction =
    exports.isOldDotReportAction =
    exports.isNotifiableReportAction =
    exports.isMoneyRequestAction =
    exports.isModifiedExpenseAction =
    exports.useNewTableReportViewActionRenderConditionals =
    exports.isMessageDeleted =
    exports.isExportIntegrationAction =
    exports.isMemberChangeAction =
    exports.isLinkedTransactionHeld =
    exports.isDeletedParentAction =
    exports.isDeletedAction =
    exports.isCurrentActionUnread =
    exports.isCreatedTaskReportAction =
    exports.isCreatedAction =
    exports.hasNextActionMadeBySameActor =
    exports.isConsecutiveChronosAutomaticTimerAction =
    exports.isConsecutiveActionMadeByPreviousActor =
    exports.isClosedAction =
    exports.isChronosOOOListAction =
    exports.isApprovedOrSubmittedReportAction =
        void 0;
exports.getReportActions =
    exports.getWorkspaceReportFieldDeleteMessage =
    exports.getWorkspaceReportFieldUpdateMessage =
    exports.getWorkspaceTagUpdateMessage =
    exports.getWorkspaceCustomUnitRateAddedMessage =
    exports.getWorkspaceReportFieldAddMessage =
    exports.getWorkspaceDescriptionUpdatedMessage =
    exports.getPolicyChangeLogDefaultTitleEnforcedMessage =
    exports.getPolicyChangeLogDefaultBillableMessage =
    exports.getPolicyChangeLogMaxExpenseAmountMessage =
    exports.getPolicyChangeLogMaxExpesnseAmountNoReceiptMessage =
    exports.getWorkspaceFrequencyUpdateMessage =
    exports.getWorkspaceCurrencyUpdateMessage =
    exports.getWorkspaceUpdateFieldMessage =
    exports.getWorkspaceCategoryUpdateMessage =
    exports.shouldShowAddMissingDetails =
    exports.wasMessageReceivedWhileOffline =
    exports.getReportActionsLength =
    exports.getActionableJoinRequestPendingReportAction =
    exports.getRemovedConnectionMessage =
    exports.getCardIssuedMessage =
    exports.isCardIssuedAction =
    exports.getRenamedAction =
    exports.getPolicyChangeLogEmployeeLeftMessage =
    exports.getPolicyChangeLogDeleteMemberMessage =
    exports.getPolicyChangeLogChangeRoleMessage =
    exports.getPolicyChangeLogAddEmployeeMessage =
    exports.didMessageMentionCurrentUser =
    exports.getUpdateRoomDescriptionMessage =
    exports.getExportIntegrationMessageHTML =
    exports.getExportIntegrationLastMessageText =
    exports.getExportIntegrationActionFragments =
    exports.isActionableAddPaymentCard =
    exports.isInviteOrRemovedAction =
    exports.wasActionTakenByCurrentUser =
    exports.shouldReportActionBeVisibleAsLastAction =
    exports.shouldReportActionBeVisible =
        void 0;
var expensify_common_1 = require('expensify-common');
var clone_1 = require('lodash/clone');
var findLast_1 = require('lodash/findLast');
var isEmpty_1 = require('lodash/isEmpty');
var react_native_onyx_1 = require('react-native-onyx');
var usePrevious_1 = require('@hooks/usePrevious');
var CONST_1 = require('@src/CONST');
var ONYXKEYS_1 = require('@src/ONYXKEYS');
var ROUTES_1 = require('@src/ROUTES');
var EmptyObject_1 = require('@src/types/utils/EmptyObject');
var CurrencyUtils_1 = require('./CurrencyUtils');
var DateUtils_1 = require('./DateUtils');
var Environment_1 = require('./Environment/Environment');
var getBase62ReportID_1 = require('./getBase62ReportID');
var isReportMessageAttachment_1 = require('./isReportMessageAttachment');
var LocaleDigitUtils_1 = require('./LocaleDigitUtils');
var LocalePhoneNumber_1 = require('./LocalePhoneNumber');
var Localize_1 = require('./Localize');
var Log_1 = require('./Log');
var Parser_1 = require('./Parser');
var PersonalDetailsUtils_1 = require('./PersonalDetailsUtils');
var PolicyUtils_1 = require('./PolicyUtils');
var StringUtils_1 = require('./StringUtils');
var TransactionUtils_1 = require('./TransactionUtils');
var WorkspaceReportFieldUtils_1 = require('./WorkspaceReportFieldUtils');
var allReportActions;
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].COLLECTION.REPORT_ACTIONS,
    waitForCollectionCallback: true,
    callback: function (actions) {
        if (!actions) {
            return;
        }
        allReportActions = actions;
    },
});
var preferredLocale = CONST_1['default'].LOCALES.DEFAULT;
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].NVP_PREFERRED_LOCALE,
    callback: function (value) {
        if (!value) {
            return;
        }
        preferredLocale = value;
    },
});
var allReports;
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: function (value) {
        allReports = value;
    },
});
var isNetworkOffline = false;
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].NETWORK,
    callback: function (val) {
        var _a;
        return (isNetworkOffline = (_a = val === null || val === void 0 ? void 0 : val.isOffline) !== null && _a !== void 0 ? _a : false);
    },
});
var currentUserAccountID;
var currentEmail = '';
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].SESSION,
    callback: function (value) {
        var _a;
        // When signed out, value is undefined
        if (!value) {
            return;
        }
        currentUserAccountID = value.accountID;
        currentEmail = (_a = value === null || value === void 0 ? void 0 : value.email) !== null && _a !== void 0 ? _a : '';
    },
});
var privatePersonalDetails;
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].PRIVATE_PERSONAL_DETAILS,
    callback: function (personalDetails) {
        privatePersonalDetails = personalDetails;
    },
});
var environmentURL;
Environment_1.getEnvironmentURL().then(function (url) {
    return (environmentURL = url);
});
/*
 * Url to the Xero non reimbursable expenses list
 */
var XERO_NON_REIMBURSABLE_EXPENSES_URL = 'https://go.xero.com/Bank/BankAccounts.aspx';
/*
 * Url to the NetSuite global search, which should be suffixed with the reportID.
 */
var NETSUITE_NON_REIMBURSABLE_EXPENSES_URL_PREFIX =
    'https://system.netsuite.com/app/common/search/ubersearchresults.nl?quicksearch=T&searchtype=Uber&frame=be&Uber_NAMEtype=KEYWORDSTARTSWITH&Uber_NAME=';
/*
 * Url prefix to any Salesforce transaction or transaction list.
 */
var SALESFORCE_EXPENSES_URL_PREFIX = 'https://login.salesforce.com/';
/*
 * Url to the QBO expenses list
 */
var QBO_EXPENSES_URL = 'https://qbo.intuit.com/app/expenses';
var POLICY_CHANGE_LOG_ARRAY = Object.values(CONST_1['default'].REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG);
function isCreatedAction(reportAction) {
    return (reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1['default'].REPORT.ACTIONS.TYPE.CREATED;
}
exports.isCreatedAction = isCreatedAction;
function isDeletedAction(reportAction) {
    var _a, _b, _c;
    if (isInviteOrRemovedAction(reportAction)) {
        return false;
    }
    var message = (_a = reportAction === null || reportAction === void 0 ? void 0 : reportAction.message) !== null && _a !== void 0 ? _a : [];
    if (!Array.isArray(message)) {
        return (message === null || message === void 0 ? void 0 : message.html) === '' || !!(message === null || message === void 0 ? void 0 : message.deleted);
    }
    // A legacy deleted comment has either an empty array or an object with html field with empty string as value
    var isLegacyDeletedComment = message.length === 0 || ((_b = message.at(0)) === null || _b === void 0 ? void 0 : _b.html) === '';
    return isLegacyDeletedComment || !!((_c = message.at(0)) === null || _c === void 0 ? void 0 : _c.deleted);
}
exports.isDeletedAction = isDeletedAction;
/**
 * This function will add attachment ID attribute on img and video HTML tags inside the passed html content
 * of a report action. This attachment id is the reportActionID concatenated with the order index that the attachment
 * appears inside the report action message so as to identify attachments with identical source inside a report action.
 */
function getHtmlWithAttachmentID(html, reportActionID) {
    if (!reportActionID) {
        return html;
    }
    var attachmentID = 0;
    return html.replace(/<img |<video /g, function (m) {
        return m.concat(CONST_1['default'].ATTACHMENT_ID_ATTRIBUTE + '="' + reportActionID + '_' + ++attachmentID + '" ');
    });
}
exports.getHtmlWithAttachmentID = getHtmlWithAttachmentID;
function getReportActionMessage(reportAction) {
    return Array.isArray(reportAction === null || reportAction === void 0 ? void 0 : reportAction.message)
        ? reportAction.message.at(0)
        : reportAction === null || reportAction === void 0
        ? void 0
        : reportAction.message;
}
exports.getReportActionMessage = getReportActionMessage;
function isDeletedParentAction(reportAction) {
    var _a, _b, _c;
    return (
        ((_b = (_a = getReportActionMessage(reportAction)) === null || _a === void 0 ? void 0 : _a.isDeletedParentAction) !== null && _b !== void 0 ? _b : false) &&
        ((_c = reportAction === null || reportAction === void 0 ? void 0 : reportAction.childVisibleActionCount) !== null && _c !== void 0 ? _c : 0) > 0
    );
}
exports.isDeletedParentAction = isDeletedParentAction;
function isReversedTransaction(reportAction) {
    var _a, _b, _c, _d;
    return (
        ((_b = (_a = getReportActionMessage(reportAction)) === null || _a === void 0 ? void 0 : _a.isReversedTransaction) !== null && _b !== void 0 ? _b : false) &&
        ((_d = (_c = reportAction) === null || _c === void 0 ? void 0 : _c.childVisibleActionCount) !== null && _d !== void 0 ? _d : 0) > 0
    );
}
exports.isReversedTransaction = isReversedTransaction;
function isPendingRemove(reportAction) {
    var _a, _b;
    return (
        ((_b = (_a = getReportActionMessage(reportAction)) === null || _a === void 0 ? void 0 : _a.moderationDecision) === null || _b === void 0 ? void 0 : _b.decision) ===
        CONST_1['default'].MODERATION.MODERATOR_DECISION_PENDING_REMOVE
    );
}
exports.isPendingRemove = isPendingRemove;
function isMoneyRequestAction(reportAction) {
    return isActionOfType(reportAction, CONST_1['default'].REPORT.ACTIONS.TYPE.IOU);
}
exports.isMoneyRequestAction = isMoneyRequestAction;
function isReportPreviewAction(reportAction) {
    return isActionOfType(reportAction, CONST_1['default'].REPORT.ACTIONS.TYPE.REPORT_PREVIEW);
}
exports.isReportPreviewAction = isReportPreviewAction;
function isSubmittedAction(reportAction) {
    return isActionOfType(reportAction, CONST_1['default'].REPORT.ACTIONS.TYPE.SUBMITTED);
}
exports.isSubmittedAction = isSubmittedAction;
function isSubmittedAndClosedAction(reportAction) {
    return isActionOfType(reportAction, CONST_1['default'].REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED);
}
exports.isSubmittedAndClosedAction = isSubmittedAndClosedAction;
function isApprovedAction(reportAction) {
    return isActionOfType(reportAction, CONST_1['default'].REPORT.ACTIONS.TYPE.APPROVED);
}
exports.isApprovedAction = isApprovedAction;
function isUnapprovedAction(reportAction) {
    return isActionOfType(reportAction, CONST_1['default'].REPORT.ACTIONS.TYPE.UNAPPROVED);
}
exports.isUnapprovedAction = isUnapprovedAction;
function isForwardedAction(reportAction) {
    return isActionOfType(reportAction, CONST_1['default'].REPORT.ACTIONS.TYPE.FORWARDED);
}
exports.isForwardedAction = isForwardedAction;
function isModifiedExpenseAction(reportAction) {
    return isActionOfType(reportAction, CONST_1['default'].REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE);
}
exports.isModifiedExpenseAction = isModifiedExpenseAction;
function isPolicyChangeLogAction(reportAction) {
    return isActionOfType.apply(void 0, __spreadArrays([reportAction], POLICY_CHANGE_LOG_ARRAY));
}
exports.isPolicyChangeLogAction = isPolicyChangeLogAction;
function isChronosOOOListAction(reportAction) {
    return isActionOfType(reportAction, CONST_1['default'].REPORT.ACTIONS.TYPE.CHRONOS_OOO_LIST);
}
exports.isChronosOOOListAction = isChronosOOOListAction;
function isAddCommentAction(reportAction) {
    return isActionOfType(reportAction, CONST_1['default'].REPORT.ACTIONS.TYPE.ADD_COMMENT);
}
exports.isAddCommentAction = isAddCommentAction;
function isCreatedTaskReportAction(reportAction) {
    var _a;
    return (
        isActionOfType(reportAction, CONST_1['default'].REPORT.ACTIONS.TYPE.ADD_COMMENT) && !!((_a = getOriginalMessage(reportAction)) === null || _a === void 0 ? void 0 : _a.taskReportID)
    );
}
exports.isCreatedTaskReportAction = isCreatedTaskReportAction;
function isTripPreview(reportAction) {
    return isActionOfType(reportAction, CONST_1['default'].REPORT.ACTIONS.TYPE.TRIPPREVIEW);
}
exports.isTripPreview = isTripPreview;
function isActionOfType(action) {
    var actionNames = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        actionNames[_i - 1] = arguments[_i];
    }
    var actionName = action === null || action === void 0 ? void 0 : action.actionName;
    // This is purely a performance optimization to limit the 'includes()' calls on Hermes
    for (var _a = 0, actionNames_1 = actionNames; _a < actionNames_1.length; _a++) {
        var i = actionNames_1[_a];
        if (i === actionName) {
            return true;
        }
    }
    return false;
}
exports.isActionOfType = isActionOfType;
function getOriginalMessage(reportAction) {
    var _a;
    if (!Array.isArray(reportAction === null || reportAction === void 0 ? void 0 : reportAction.message)) {
        // eslint-disable-next-line deprecation/deprecation
        return (_a = reportAction === null || reportAction === void 0 ? void 0 : reportAction.message) !== null && _a !== void 0
            ? _a
            : reportAction === null || reportAction === void 0
            ? void 0
            : reportAction.originalMessage;
    }
    // eslint-disable-next-line deprecation/deprecation
    return reportAction.originalMessage;
}
exports.getOriginalMessage = getOriginalMessage;
function isExportIntegrationAction(reportAction) {
    return (reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1['default'].REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION;
}
exports.isExportIntegrationAction = isExportIntegrationAction;
/**
 * We are in the process of deprecating reportAction.originalMessage and will be setting the db version of "message" to reportAction.message in the future see: https://github.com/Expensify/App/issues/39797
 * In the interim, we must check to see if we have an object or array for the reportAction.message, if we have an array we will use the originalMessage as this means we have not yet migrated.
 */
function getWhisperedTo(reportAction) {
    var _a, _b;
    if (!reportAction) {
        return [];
    }
    var originalMessage = getOriginalMessage(reportAction);
    var message = getReportActionMessage(reportAction);
    if (!(originalMessage && typeof originalMessage === 'object' && 'whisperedTo' in originalMessage) && !(message && typeof message === 'object' && 'whisperedTo' in message)) {
        return [];
    }
    if (message !== null && !Array.isArray(message) && typeof message === 'object' && 'whisperedTo' in message) {
        return (_a = message === null || message === void 0 ? void 0 : message.whisperedTo) !== null && _a !== void 0 ? _a : [];
    }
    if (originalMessage && typeof originalMessage === 'object' && 'whisperedTo' in originalMessage) {
        return (_b = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.whisperedTo) !== null && _b !== void 0 ? _b : [];
    }
    if (typeof originalMessage !== 'object') {
        Log_1['default'].info('Original message is not an object for reportAction: ', true, {
            reportActionID: reportAction === null || reportAction === void 0 ? void 0 : reportAction.reportActionID,
            actionName: reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName,
        });
    }
    return [];
}
exports.getWhisperedTo = getWhisperedTo;
function isWhisperAction(reportAction) {
    return getWhisperedTo(reportAction).length > 0;
}
exports.isWhisperAction = isWhisperAction;
/**
 * Checks whether the report action is a whisper targeting someone other than the current user.
 */
function isWhisperActionTargetedToOthers(reportAction) {
    if (!isWhisperAction(reportAction)) {
        return false;
    }
    return !getWhisperedTo(reportAction).includes(currentUserAccountID !== null && currentUserAccountID !== void 0 ? currentUserAccountID : CONST_1['default'].DEFAULT_NUMBER_ID);
}
exports.isWhisperActionTargetedToOthers = isWhisperActionTargetedToOthers;
function isReimbursementQueuedAction(reportAction) {
    return isActionOfType(reportAction, CONST_1['default'].REPORT.ACTIONS.TYPE.REIMBURSEMENT_QUEUED);
}
exports.isReimbursementQueuedAction = isReimbursementQueuedAction;
function isMemberChangeAction(reportAction) {
    return isActionOfType(
        reportAction,
        CONST_1['default'].REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM,
        CONST_1['default'].REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.REMOVE_FROM_ROOM,
        CONST_1['default'].REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.INVITE_TO_ROOM,
        CONST_1['default'].REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.REMOVE_FROM_ROOM,
        CONST_1['default'].REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.LEAVE_POLICY,
    );
}
exports.isMemberChangeAction = isMemberChangeAction;
function isInviteMemberAction(reportAction) {
    return isActionOfType(reportAction, CONST_1['default'].REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM, CONST_1['default'].REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.INVITE_TO_ROOM);
}
function isLeavePolicyAction(reportAction) {
    return isActionOfType(reportAction, CONST_1['default'].REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.LEAVE_POLICY);
}
function isReimbursementCanceledAction(reportAction) {
    return isActionOfType(reportAction, CONST_1['default'].REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_CANCELED);
}
exports.isReimbursementCanceledAction = isReimbursementCanceledAction;
function isReimbursementDeQueuedAction(reportAction) {
    return isActionOfType(reportAction, CONST_1['default'].REPORT.ACTIONS.TYPE.REIMBURSEMENT_DEQUEUED);
}
exports.isReimbursementDeQueuedAction = isReimbursementDeQueuedAction;
function isReimbursementDeQueuedOrCanceledAction(reportAction) {
    return isReimbursementDeQueuedAction(reportAction) || isReimbursementCanceledAction(reportAction);
}
exports.isReimbursementDeQueuedOrCanceledAction = isReimbursementDeQueuedOrCanceledAction;
function isClosedAction(reportAction) {
    return isActionOfType(reportAction, CONST_1['default'].REPORT.ACTIONS.TYPE.CLOSED);
}
exports.isClosedAction = isClosedAction;
function isRenamedAction(reportAction) {
    return isActionOfType(reportAction, CONST_1['default'].REPORT.ACTIONS.TYPE.RENAMED);
}
exports.isRenamedAction = isRenamedAction;
function isRoomChangeLogAction(reportAction) {
    return isActionOfType.apply(void 0, __spreadArrays([reportAction], Object.values(CONST_1['default'].REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG)));
}
exports.isRoomChangeLogAction = isRoomChangeLogAction;
function isInviteOrRemovedAction(reportAction) {
    return isActionOfType(
        reportAction,
        CONST_1['default'].REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM,
        CONST_1['default'].REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.REMOVE_FROM_ROOM,
        CONST_1['default'].REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.INVITE_TO_ROOM,
        CONST_1['default'].REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.REMOVE_FROM_ROOM,
    );
}
exports.isInviteOrRemovedAction = isInviteOrRemovedAction;
/**
 * Returns whether the comment is a thread parent message/the first message in a thread
 */
function isThreadParentMessage(reportAction, reportID) {
    var _a = reportAction !== null && reportAction !== void 0 ? reportAction : {},
        childType = _a.childType,
        _b = _a.childVisibleActionCount,
        childVisibleActionCount = _b === void 0 ? 0 : _b,
        childReportID = _a.childReportID;
    return childType === CONST_1['default'].REPORT.TYPE.CHAT && (childVisibleActionCount > 0 || String(childReportID) === reportID);
}
exports.isThreadParentMessage = isThreadParentMessage;
/**
 * Determines if the given report action is sent money report action by checking for 'pay' type and presence of IOUDetails object.
 */
function isSentMoneyReportAction(reportAction) {
    var _a, _b;
    return (
        isActionOfType(reportAction, CONST_1['default'].REPORT.ACTIONS.TYPE.IOU) &&
        ((_a = getOriginalMessage(reportAction)) === null || _a === void 0 ? void 0 : _a.type) === CONST_1['default'].IOU.REPORT_ACTION_TYPE.PAY &&
        !!((_b = getOriginalMessage(reportAction)) === null || _b === void 0 ? void 0 : _b.IOUDetails)
    );
}
exports.isSentMoneyReportAction = isSentMoneyReportAction;
/**
 * Returns whether the thread is a transaction thread, which is any thread with IOU parent
 * report action from requesting money (type - create) or from sending money (type - pay with IOUDetails field)
 */
function isTransactionThread(parentReportAction) {
    if (EmptyObject_1.isEmptyObject(parentReportAction) || !isMoneyRequestAction(parentReportAction)) {
        return false;
    }
    var originalMessage = getOriginalMessage(parentReportAction);
    return (
        (originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.type) === CONST_1['default'].IOU.REPORT_ACTION_TYPE.CREATE ||
        (originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.type) === CONST_1['default'].IOU.REPORT_ACTION_TYPE.TRACK ||
        ((originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.type) === CONST_1['default'].IOU.REPORT_ACTION_TYPE.PAY &&
            !!(originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.IOUDetails))
    );
}
exports.isTransactionThread = isTransactionThread;
/**
 * Sort an array of reportActions by their created timestamp first, and reportActionID second
 * This gives us a stable order even in the case of multiple reportActions created on the same millisecond
 *
 */
function getSortedReportActions(reportActions, shouldSortInDescendingOrder) {
    if (shouldSortInDescendingOrder === void 0) {
        shouldSortInDescendingOrder = false;
    }
    if (!Array.isArray(reportActions)) {
        throw new Error('ReportActionsUtils.getSortedReportActions requires an array, received ' + typeof reportActions);
    }
    var invertedMultiplier = shouldSortInDescendingOrder ? -1 : 1;
    var sortedActions =
        reportActions === null || reportActions === void 0
            ? void 0
            : reportActions.filter(Boolean).sort(function (first, second) {
                  // First sort by action type, ensuring that `CREATED` actions always come first if they have the same or even a later timestamp as another action type
                  if (
                      (first.actionName === CONST_1['default'].REPORT.ACTIONS.TYPE.CREATED || second.actionName === CONST_1['default'].REPORT.ACTIONS.TYPE.CREATED) &&
                      first.actionName !== second.actionName
                  ) {
                      return (first.actionName === CONST_1['default'].REPORT.ACTIONS.TYPE.CREATED ? -1 : 1) * invertedMultiplier;
                  }
                  // Ensure that neither first's nor second's created property is undefined
                  if (first.created === undefined || second.created === undefined) {
                      return (first.created === undefined ? -1 : 1) * invertedMultiplier;
                  }
                  // Then sort by timestamp
                  if (first.created !== second.created) {
                      return (first.created < second.created ? -1 : 1) * invertedMultiplier;
                  }
                  // Ensure that `REPORT_PREVIEW` actions always come after if they have the same timestamp as another action type
                  if (
                      (first.actionName === CONST_1['default'].REPORT.ACTIONS.TYPE.REPORT_PREVIEW || second.actionName === CONST_1['default'].REPORT.ACTIONS.TYPE.REPORT_PREVIEW) &&
                      first.actionName !== second.actionName
                  ) {
                      return (first.actionName === CONST_1['default'].REPORT.ACTIONS.TYPE.REPORT_PREVIEW ? 1 : -1) * invertedMultiplier;
                  }
                  // Then fallback on reportActionID as the final sorting criteria. It is a random number,
                  // but using this will ensure that the order of reportActions with the same created time and action type
                  // will be consistent across all users and devices
                  return (first.reportActionID < second.reportActionID ? -1 : 1) * invertedMultiplier;
              });
    return sortedActions;
}
exports.getSortedReportActions = getSortedReportActions;
/**
 * Returns a sorted and filtered list of report actions from a report and it's associated child
 * transaction thread report in order to correctly display reportActions from both reports in the one-transaction report view.
 */
function getCombinedReportActions(reportActions, transactionThreadReportID, transactionThreadReportActions, reportID, shouldFilterIOUAction) {
    if (shouldFilterIOUAction === void 0) {
        shouldFilterIOUAction = true;
    }
    var isSentMoneyReport = reportActions.some(function (action) {
        return isSentMoneyReportAction(action);
    });
    // We don't want to combine report actions of transaction thread in iou report of send money request because we display the transaction report of send money request as a normal thread
    if (isEmpty_1['default'](transactionThreadReportID) || isSentMoneyReport) {
        return reportActions;
    }
    // Usually, we filter out the created action from the transaction thread report actions, since we already have the parent report's created action in `reportActions`
    // However, in the case of moving track expense, the transaction thread will be created first in a track expense, thus we should keep the CREATED of the transaction thread and filter out CREATED action of the IOU
    // This makes sense because in a combined report action list, whichever CREATED is first need to be retained.
    var transactionThreadCreatedAction =
        transactionThreadReportActions === null || transactionThreadReportActions === void 0
            ? void 0
            : transactionThreadReportActions.find(function (action) {
                  return action.actionName === CONST_1['default'].REPORT.ACTIONS.TYPE.CREATED;
              });
    var parentReportCreatedAction =
        reportActions === null || reportActions === void 0
            ? void 0
            : reportActions.find(function (action) {
                  return action.actionName === CONST_1['default'].REPORT.ACTIONS.TYPE.CREATED;
              });
    var filteredTransactionThreadReportActions = transactionThreadReportActions;
    var filteredParentReportActions = reportActions;
    if (transactionThreadCreatedAction && parentReportCreatedAction && transactionThreadCreatedAction.created > parentReportCreatedAction.created) {
        filteredTransactionThreadReportActions =
            transactionThreadReportActions === null || transactionThreadReportActions === void 0
                ? void 0
                : transactionThreadReportActions.filter(function (action) {
                      return action.actionName !== CONST_1['default'].REPORT.ACTIONS.TYPE.CREATED;
                  });
    } else if (transactionThreadCreatedAction) {
        filteredParentReportActions =
            reportActions === null || reportActions === void 0
                ? void 0
                : reportActions.filter(function (action) {
                      return action.actionName !== CONST_1['default'].REPORT.ACTIONS.TYPE.CREATED;
                  });
    }
    var report = allReports === null || allReports === void 0 ? void 0 : allReports['' + ONYXKEYS_1['default'].COLLECTION.REPORT + reportID];
    var isSelfDM = (report === null || report === void 0 ? void 0 : report.chatType) === CONST_1['default'].REPORT.CHAT_TYPE.SELF_DM;
    // Filter out request and send money request actions because we don't want to show any preview actions for one transaction reports
    var filteredReportActions = __spreadArrays(filteredParentReportActions, filteredTransactionThreadReportActions).filter(function (action) {
        var _a, _b;
        if (!isMoneyRequestAction(action) || !shouldFilterIOUAction) {
            return true;
        }
        var actionType = (_b = (_a = getOriginalMessage(action)) === null || _a === void 0 ? void 0 : _a.type) !== null && _b !== void 0 ? _b : '';
        if (isSelfDM) {
            return actionType !== CONST_1['default'].IOU.REPORT_ACTION_TYPE.CREATE;
        }
        return actionType !== CONST_1['default'].IOU.REPORT_ACTION_TYPE.CREATE && actionType !== CONST_1['default'].IOU.REPORT_ACTION_TYPE.TRACK;
    });
    return getSortedReportActions(filteredReportActions, true);
}
exports.getCombinedReportActions = getCombinedReportActions;
/**
 * Finds most recent IOU request action ID.
 */
function getMostRecentIOURequestActionID(reportActions) {
    var _a, _b, _c;
    if (!Array.isArray(reportActions)) {
        return null;
    }
    var iouRequestTypes = [CONST_1['default'].IOU.REPORT_ACTION_TYPE.CREATE, CONST_1['default'].IOU.REPORT_ACTION_TYPE.SPLIT, CONST_1['default'].IOU.REPORT_ACTION_TYPE.TRACK];
    var iouRequestActions =
        (_a =
            reportActions === null || reportActions === void 0
                ? void 0
                : reportActions.filter(function (action) {
                      var _a;
                      if (!isActionOfType(action, CONST_1['default'].REPORT.ACTIONS.TYPE.IOU)) {
                          return false;
                      }
                      var actionType = (_a = getOriginalMessage(action)) === null || _a === void 0 ? void 0 : _a.type;
                      if (!actionType) {
                          return false;
                      }
                      return iouRequestTypes.includes(actionType);
                  })) !== null && _a !== void 0
            ? _a
            : [];
    if (iouRequestActions.length === 0) {
        return null;
    }
    var sortedReportActions = getSortedReportActions(iouRequestActions);
    return (_c = (_b = sortedReportActions.at(-1)) === null || _b === void 0 ? void 0 : _b.reportActionID) !== null && _c !== void 0 ? _c : null;
}
exports.getMostRecentIOURequestActionID = getMostRecentIOURequestActionID;
/**
 * Returns array of links inside a given report action
 */
function extractLinksFromMessageHtml(reportAction) {
    var htmlContent = getReportActionHtml(reportAction);
    var regex = CONST_1['default'].REGEX_LINK_IN_ANCHOR;
    if (!htmlContent) {
        return [];
    }
    return __spreadArrays(htmlContent.matchAll(regex)).map(function (match) {
        return match[1];
    });
}
exports.extractLinksFromMessageHtml = extractLinksFromMessageHtml;
/**
 * Returns the report action immediately before the specified index.
 * @param reportActions - all actions
 * @param actionIndex - index of the action
 */
function findPreviousAction(reportActions, actionIndex) {
    var _a;
    for (var i = actionIndex + 1; i < reportActions.length; i++) {
        // Find the next non-pending deletion report action, as the pending delete action means that it is not displayed in the UI, but still is in the report actions list.
        // If we are offline, all actions are pending but shown in the UI, so we take the previous action, even if it is a delete.
        if (isNetworkOffline || ((_a = reportActions.at(i)) === null || _a === void 0 ? void 0 : _a.pendingAction) !== CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            return reportActions.at(i);
        }
    }
    return undefined;
}
/**
 * Returns the report action immediately after the specified index.
 * @param reportActions - all actions
 * @param actionIndex - index of the action
 */
function findNextAction(reportActions, actionIndex) {
    var _a;
    for (var i = actionIndex - 1; i > 0; i--) {
        // Find the next non-pending deletion report action, as the pending delete action means that it is not displayed in the UI, but still is in the report actions list.
        // If we are offline, all actions are pending but shown in the UI, so we take the previous action, even if it is a delete.
        if (isNetworkOffline || ((_a = reportActions.at(i)) === null || _a === void 0 ? void 0 : _a.pendingAction) !== CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            return reportActions.at(i);
        }
    }
    return undefined;
}
/**
 * Returns true when the report action immediately before the specified index is a comment made by the same actor who who is leaving a comment in the action at the specified index.
 * Also checks to ensure that the comment is not too old to be shown as a grouped comment.
 *
 * @param actionIndex - index of the comment item in state to check
 */
function isConsecutiveActionMadeByPreviousActor(reportActions, actionIndex) {
    var previousAction = findPreviousAction(reportActions, actionIndex);
    var currentAction = reportActions.at(actionIndex);
    // It's OK for there to be no previous action, and in that case, false will be returned
    // so that the comment isn't grouped
    if (!currentAction || !previousAction) {
        return false;
    }
    // Comments are only grouped if they happen within 5 minutes of each other
    if (new Date(currentAction.created).getTime() - new Date(previousAction.created).getTime() > 300000) {
        return false;
    }
    // Do not group if previous action was a created action
    if (previousAction.actionName === CONST_1['default'].REPORT.ACTIONS.TYPE.CREATED) {
        return false;
    }
    // Do not group if previous or current action was a renamed action
    if (previousAction.actionName === CONST_1['default'].REPORT.ACTIONS.TYPE.RENAMED || currentAction.actionName === CONST_1['default'].REPORT.ACTIONS.TYPE.RENAMED) {
        return false;
    }
    // Do not group if the delegate account ID is different
    if (previousAction.delegateAccountID !== currentAction.delegateAccountID) {
        return false;
    }
    // Do not group if one of previous / current action is report preview and another one is not report preview
    if ((isReportPreviewAction(previousAction) && !isReportPreviewAction(currentAction)) || (isReportPreviewAction(currentAction) && !isReportPreviewAction(previousAction))) {
        return false;
    }
    if (isSubmittedAction(currentAction)) {
        var currentActionAdminAccountID = currentAction.adminAccountID;
        return typeof currentActionAdminAccountID === 'number'
            ? currentActionAdminAccountID === previousAction.actorAccountID
            : currentAction.actorAccountID === previousAction.actorAccountID;
    }
    if (isSubmittedAction(previousAction)) {
        return typeof previousAction.adminAccountID === 'number'
            ? currentAction.actorAccountID === previousAction.adminAccountID
            : currentAction.actorAccountID === previousAction.actorAccountID;
    }
    return currentAction.actorAccountID === previousAction.actorAccountID;
}
exports.isConsecutiveActionMadeByPreviousActor = isConsecutiveActionMadeByPreviousActor;
// Todo combine with `isConsecutiveActionMadeByPreviousActor` so as to not duplicate logic (issue: https://github.com/Expensify/App/issues/58625)
function hasNextActionMadeBySameActor(reportActions, actionIndex) {
    var currentAction = reportActions.at(actionIndex);
    var nextAction = findNextAction(reportActions, actionIndex);
    // Todo first should have avatar - verify that this works with long chats (issue: https://github.com/Expensify/App/issues/58625)
    if (actionIndex === 0) {
        return false;
    }
    // It's OK for there to be no previous action, and in that case, false will be returned
    // so that the comment isn't grouped
    if (!currentAction || !nextAction) {
        return true;
    }
    // Comments are only grouped if they happen within 5 minutes of each other
    if (new Date(currentAction.created).getTime() - new Date(nextAction.created).getTime() > 300000) {
        return false;
    }
    // Do not group if previous action was a created action
    if (nextAction.actionName === CONST_1['default'].REPORT.ACTIONS.TYPE.CREATED) {
        return false;
    }
    // Do not group if previous or current action was a renamed action
    if (nextAction.actionName === CONST_1['default'].REPORT.ACTIONS.TYPE.RENAMED || currentAction.actionName === CONST_1['default'].REPORT.ACTIONS.TYPE.RENAMED) {
        return false;
    }
    // Do not group if the delegate account ID is different
    if (nextAction.delegateAccountID !== currentAction.delegateAccountID) {
        return false;
    }
    // Do not group if one of previous / current action is report preview and another one is not report preview
    if ((isReportPreviewAction(nextAction) && !isReportPreviewAction(currentAction)) || (isReportPreviewAction(currentAction) && !isReportPreviewAction(nextAction))) {
        return false;
    }
    if (isSubmittedAction(currentAction)) {
        var currentActionAdminAccountID = currentAction.adminAccountID;
        return currentActionAdminAccountID === nextAction.actorAccountID || currentActionAdminAccountID === nextAction.adminAccountID;
    }
    if (isSubmittedAction(nextAction)) {
        return typeof nextAction.adminAccountID === 'number' ? currentAction.actorAccountID === nextAction.adminAccountID : currentAction.actorAccountID === nextAction.actorAccountID;
    }
    return currentAction.actorAccountID === nextAction.actorAccountID;
}
exports.hasNextActionMadeBySameActor = hasNextActionMadeBySameActor;
function isChronosAutomaticTimerAction(reportAction, isChronosReport) {
    var isAutomaticStartTimerAction = function () {
        return /start(?:ed|ing)?(?:\snow)?/i.test(getReportActionText(reportAction));
    };
    var isAutomaticStopTimerAction = function () {
        return /stop(?:ped|ping)?(?:\snow)?/i.test(getReportActionText(reportAction));
    };
    return isChronosReport && (isAutomaticStartTimerAction() || isAutomaticStopTimerAction());
}
/**
 * If the user sends consecutive actions to Chronos to automatically start/stop the timer,
 * then detect that and show each individually so that the user can easily see when they were sent.
 */
function isConsecutiveChronosAutomaticTimerAction(reportActions, actionIndex, isChronosReport) {
    var previousAction = findPreviousAction(reportActions, actionIndex);
    var currentAction = reportActions === null || reportActions === void 0 ? void 0 : reportActions.at(actionIndex);
    return isChronosAutomaticTimerAction(currentAction, isChronosReport) && isChronosAutomaticTimerAction(previousAction, isChronosReport);
}
exports.isConsecutiveChronosAutomaticTimerAction = isConsecutiveChronosAutomaticTimerAction;
/**
 * Checks if a reportAction is deprecated.
 */
function isReportActionDeprecated(reportAction, key) {
    if (!reportAction) {
        return true;
    }
    // HACK ALERT: We're temporarily filtering out any reportActions keyed by sequenceNumber
    // to prevent bugs during the migration from sequenceNumber -> reportActionID
    // eslint-disable-next-line deprecation/deprecation
    if (String(reportAction.sequenceNumber) === key) {
        Log_1['default'].info('Front-end filtered out reportAction keyed by sequenceNumber!', false, reportAction);
        return true;
    }
    var deprecatedOldDotReportActions = [
        CONST_1['default'].REPORT.ACTIONS.TYPE.DELETED_ACCOUNT,
        CONST_1['default'].REPORT.ACTIONS.TYPE.REIMBURSEMENT_REQUESTED,
        CONST_1['default'].REPORT.ACTIONS.TYPE.REIMBURSEMENT_SETUP_REQUESTED,
        CONST_1['default'].REPORT.ACTIONS.TYPE.DONATION,
        CONST_1['default'].REPORT.ACTIONS.TYPE.REIMBURSED,
        // We're temporarily deprecating the actions below since the feature is still WIP and these actions are being shown as duplicated
        CONST_1['default'].REPORT.ACTIONS.TYPE.UNREPORTED_TRANSACTION,
        CONST_1['default'].REPORT.ACTIONS.TYPE.MOVED_TRANSACTION,
    ];
    if (deprecatedOldDotReportActions.includes(reportAction.actionName)) {
        Log_1['default'].info('Front end filtered out reportAction for being an older, deprecated report action', false, reportAction);
        return true;
    }
    return false;
}
exports.isReportActionDeprecated = isReportActionDeprecated;
/**
 * Checks if a given report action corresponds to an actionable mention whisper.
 * @param reportAction
 */
function isActionableMentionWhisper(reportAction) {
    return isActionOfType(reportAction, CONST_1['default'].REPORT.ACTIONS.TYPE.ACTIONABLE_MENTION_WHISPER);
}
exports.isActionableMentionWhisper = isActionableMentionWhisper;
/**
 * Checks if a given report action corresponds to an actionable report mention whisper.
 * @param reportAction
 */
function isActionableReportMentionWhisper(reportAction) {
    return isActionOfType(reportAction, CONST_1['default'].REPORT.ACTIONS.TYPE.ACTIONABLE_REPORT_MENTION_WHISPER);
}
exports.isActionableReportMentionWhisper = isActionableReportMentionWhisper;
/**
 * Checks whether an action is actionable track expense.
 */
function isActionableTrackExpense(reportAction) {
    return isActionOfType(reportAction, CONST_1['default'].REPORT.ACTIONS.TYPE.ACTIONABLE_TRACK_EXPENSE_WHISPER);
}
exports.isActionableTrackExpense = isActionableTrackExpense;
function isActionableWhisper(reportAction) {
    return isActionableMentionWhisper(reportAction) || isActionableTrackExpense(reportAction) || isActionableReportMentionWhisper(reportAction);
}
exports.isActionableWhisper = isActionableWhisper;
var _a = CONST_1['default'].REPORT.ACTIONS.TYPE,
    policyChangelogTypes = _a.POLICY_CHANGE_LOG,
    roomChangeLogTypes = _a.ROOM_CHANGE_LOG,
    otherActionTypes = __rest(_a, ['POLICY_CHANGE_LOG', 'ROOM_CHANGE_LOG']);
var supportedActionTypes = __spreadArrays(Object.values(otherActionTypes), Object.values(policyChangelogTypes), Object.values(roomChangeLogTypes));
/**
 * Checks whether an action is actionable track expense and resolved.
 *
 */
function isResolvedActionableWhisper(reportAction) {
    var originalMessage = getOriginalMessage(reportAction);
    var resolution =
        originalMessage && typeof originalMessage === 'object' && 'resolution' in originalMessage
            ? originalMessage === null || originalMessage === void 0
                ? void 0
                : originalMessage.resolution
            : null;
    return !!resolution;
}
exports.isResolvedActionableWhisper = isResolvedActionableWhisper;
/**
 * Checks whether an action is concierge category options and resolved.
 */
function isResolvedConciergeCategoryOptions(reportAction) {
    var originalMessage = getOriginalMessage(reportAction);
    var selectedCategory =
        originalMessage && typeof originalMessage === 'object' && 'selectedCategory' in originalMessage
            ? originalMessage === null || originalMessage === void 0
                ? void 0
                : originalMessage.selectedCategory
            : null;
    return !!selectedCategory;
}
exports.isResolvedConciergeCategoryOptions = isResolvedConciergeCategoryOptions;
/**
 * Checks if a reportAction is fit for display, meaning that it's not deprecated, is of a valid
 * and supported type, it's not deleted and also not closed.
 */
function shouldReportActionBeVisible(reportAction, key, canUserPerformWriteAction) {
    if (!reportAction) {
        return false;
    }
    if (isReportActionDeprecated(reportAction, key)) {
        return false;
    }
    // Filter out any unsupported reportAction types
    if (!supportedActionTypes.includes(reportAction.actionName)) {
        return false;
    }
    // Ignore closed action here since we're already displaying a footer that explains why the report was closed
    if (reportAction.actionName === CONST_1['default'].REPORT.ACTIONS.TYPE.CLOSED) {
        return false;
    }
    // Ignore markedAsReimbursed action here since we're already display message that explains the expense was paid
    // elsewhere in the IOU reportAction
    if (reportAction.actionName === CONST_1['default'].REPORT.ACTIONS.TYPE.MARKED_REIMBURSED) {
        return false;
    }
    if (isWhisperActionTargetedToOthers(reportAction)) {
        return false;
    }
    if (isPendingRemove(reportAction) && !reportAction.childVisibleActionCount) {
        return false;
    }
    if (
        (isActionableReportMentionWhisper(reportAction) || isActionableJoinRequestPendingReportAction(reportAction) || isActionableMentionWhisper(reportAction)) &&
        !canUserPerformWriteAction
    ) {
        return false;
    }
    if (isTripPreview(reportAction)) {
        return true;
    }
    // If action is actionable whisper and resolved by user, then we don't want to render anything
    if (isActionableWhisper(reportAction) && isResolvedActionableWhisper(reportAction)) {
        return false;
    }
    // All other actions are displayed except thread parents, deleted, or non-pending actions
    var isDeleted = isDeletedAction(reportAction);
    var isPending = !!reportAction.pendingAction;
    return !isDeleted || isPending || isDeletedParentAction(reportAction) || isReversedTransaction(reportAction);
}
exports.shouldReportActionBeVisible = shouldReportActionBeVisible;
/**
 * Checks if the new marker should be hidden for the report action.
 */
function shouldHideNewMarker(reportAction) {
    if (!reportAction) {
        return true;
    }
    return !isNetworkOffline && reportAction.pendingAction === CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.DELETE;
}
exports.shouldHideNewMarker = shouldHideNewMarker;
/**
 * Checks if a reportAction is fit for display as report last action, meaning that
 * it satisfies shouldReportActionBeVisible, it's not whisper action and not deleted.
 */
function shouldReportActionBeVisibleAsLastAction(reportAction, canUserPerformWriteAction) {
    var _a;
    if (!reportAction) {
        return false;
    }
    if (Object.keys((_a = reportAction.errors) !== null && _a !== void 0 ? _a : {}).length > 0) {
        return false;
    }
    // If a whisper action is the REPORT_PREVIEW action, we are displaying it.
    // If the action's message text is empty and it is not a deleted parent with visible child actions, hide it. Else, consider the action to be displayable.
    return (
        shouldReportActionBeVisible(reportAction, reportAction.reportActionID, canUserPerformWriteAction) &&
        !(isWhisperAction(reportAction) && !isReportPreviewAction(reportAction) && !isMoneyRequestAction(reportAction)) &&
        !(isDeletedAction(reportAction) && !isDeletedParentAction(reportAction))
    );
}
exports.shouldReportActionBeVisibleAsLastAction = shouldReportActionBeVisibleAsLastAction;
/**
 * For policy change logs, report URLs are generated in the server,
 * which includes a baseURL placeholder that's replaced in the client.
 */
function replaceBaseURLInPolicyChangeLogAction(reportAction) {
    var _a;
    if (!(reportAction === null || reportAction === void 0 ? void 0 : reportAction.message) || !isPolicyChangeLogAction(reportAction)) {
        return reportAction;
    }
    var updatedReportAction = clone_1['default'](reportAction);
    if (!updatedReportAction.message) {
        return updatedReportAction;
    }
    if (Array.isArray(updatedReportAction.message)) {
        var message = updatedReportAction.message.at(0);
        if (message) {
            message.html = (_a = getReportActionHtml(reportAction)) === null || _a === void 0 ? void 0 : _a.replace('%baseURL', environmentURL);
        }
    }
    return updatedReportAction;
}
function getLastVisibleAction(reportID, canUserPerformWriteAction, actionsToMerge, reportActionsParam) {
    var _a, _b;
    if (actionsToMerge === void 0) {
        actionsToMerge = {};
    }
    if (reportActionsParam === void 0) {
        reportActionsParam = allReportActions;
    }
    var reportActions = [];
    if (!isEmpty_1['default'](actionsToMerge)) {
        reportActions = Object.values(
            expensify_common_1.fastMerge(
                (_a = reportActionsParam === null || reportActionsParam === void 0 ? void 0 : reportActionsParam['' + ONYXKEYS_1['default'].COLLECTION.REPORT_ACTIONS + reportID]) !== null &&
                    _a !== void 0
                    ? _a
                    : {},
                actionsToMerge !== null && actionsToMerge !== void 0 ? actionsToMerge : {},
                true,
            ),
        );
    } else {
        reportActions = Object.values(
            (_b = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions['' + ONYXKEYS_1['default'].COLLECTION.REPORT_ACTIONS + reportID]) !== null &&
                _b !== void 0
                ? _b
                : {},
        );
    }
    var visibleReportActions = reportActions.filter(function (action) {
        return shouldReportActionBeVisibleAsLastAction(action, canUserPerformWriteAction);
    });
    var sortedReportActions = getSortedReportActions(visibleReportActions, true);
    if (sortedReportActions.length === 0) {
        return undefined;
    }
    return sortedReportActions.at(0);
}
exports.getLastVisibleAction = getLastVisibleAction;
function formatLastMessageText(lastMessageText) {
    var _a, _b;
    var trimmedMessage = String(lastMessageText).trim();
    // Add support for inline code containing only space characters
    // The message will appear as a blank space in the LHN
    if (
        (trimmedMessage === '' && ((_a = lastMessageText === null || lastMessageText === void 0 ? void 0 : lastMessageText.length) !== null && _a !== void 0 ? _a : 0) > 0) ||
        (trimmedMessage === '?\u2026' &&
            ((_b = lastMessageText === null || lastMessageText === void 0 ? void 0 : lastMessageText.length) !== null && _b !== void 0 ? _b : 0) >
                CONST_1['default'].REPORT.MIN_LENGTH_LAST_MESSAGE_WITH_ELLIPSIS)
    ) {
        return ' ';
    }
    return StringUtils_1['default'].lineBreaksToSpaces(trimmedMessage).substring(0, CONST_1['default'].REPORT.LAST_MESSAGE_TEXT_MAX_LENGTH).trim();
}
exports.formatLastMessageText = formatLastMessageText;
function getLastVisibleMessage(reportID, canUserPerformWriteAction, actionsToMerge, reportAction) {
    var _a;
    if (actionsToMerge === void 0) {
        actionsToMerge = {};
    }
    if (reportAction === void 0) {
        reportAction = undefined;
    }
    var lastVisibleAction = reportAction !== null && reportAction !== void 0 ? reportAction : getLastVisibleAction(reportID, canUserPerformWriteAction, actionsToMerge);
    var message = getReportActionMessage(lastVisibleAction);
    if (message && isReportMessageAttachment_1.isReportMessageAttachment(message)) {
        return {
            lastMessageText: CONST_1['default'].ATTACHMENT_MESSAGE_TEXT,
            lastMessageHtml: CONST_1['default'].TRANSLATION_KEYS.ATTACHMENT,
        };
    }
    if (isCreatedAction(lastVisibleAction)) {
        return {
            lastMessageText: '',
        };
    }
    var messageText = (_a = getReportActionMessageText(lastVisibleAction)) !== null && _a !== void 0 ? _a : '';
    if (messageText) {
        messageText = formatLastMessageText(messageText);
    }
    return {
        lastMessageText: messageText,
    };
}
exports.getLastVisibleMessage = getLastVisibleMessage;
/**
 * A helper method to filter out report actions keyed by sequenceNumbers.
 */
function filterOutDeprecatedReportActions(reportActions) {
    return Object.entries(reportActions !== null && reportActions !== void 0 ? reportActions : {})
        .filter(function (_a) {
            var key = _a[0],
                reportAction = _a[1];
            return !isReportActionDeprecated(reportAction, key);
        })
        .map(function (entry) {
            return entry[1];
        });
}
/**
 * This method returns the report actions that are ready for display in the ReportActionsView.
 * The report actions need to be sorted by created timestamp first, and reportActionID second
 * to ensure they will always be displayed in the same order (in case multiple actions have the same timestamp).
 * This is all handled with getSortedReportActions() which is used by several other methods to keep the code DRY.
 */
function getSortedReportActionsForDisplay(reportActions, canUserPerformWriteAction, shouldIncludeInvisibleActions) {
    if (shouldIncludeInvisibleActions === void 0) {
        shouldIncludeInvisibleActions = false;
    }
    var filteredReportActions = [];
    if (!reportActions) {
        return [];
    }
    if (shouldIncludeInvisibleActions) {
        filteredReportActions = Object.values(reportActions).filter(Boolean);
    } else {
        filteredReportActions = Object.entries(reportActions)
            .filter(function (_a) {
                var key = _a[0],
                    reportAction = _a[1];
                return shouldReportActionBeVisible(reportAction, key, canUserPerformWriteAction);
            })
            .map(function (_a) {
                var reportAction = _a[1];
                return reportAction;
            });
    }
    var baseURLAdjustedReportActions = filteredReportActions.map(function (reportAction) {
        return replaceBaseURLInPolicyChangeLogAction(reportAction);
    });
    return getSortedReportActions(baseURLAdjustedReportActions, true);
}
exports.getSortedReportActionsForDisplay = getSortedReportActionsForDisplay;
/**
 * In some cases, there can be multiple closed report actions in a chat report.
 * This method returns the last closed report action so we can always show the correct archived report reason.
 * Additionally, archived #admins and #announce do not have the closed report action so we will return null if none is found.
 *
 */
function getLastClosedReportAction(reportActions) {
    // If closed report action is not present, return early
    if (
        !Object.values(reportActions !== null && reportActions !== void 0 ? reportActions : {}).some(function (action) {
            return action.actionName === CONST_1['default'].REPORT.ACTIONS.TYPE.CLOSED;
        })
    ) {
        return undefined;
    }
    var filteredReportActions = filterOutDeprecatedReportActions(reportActions);
    var sortedReportActions = getSortedReportActions(filteredReportActions);
    return findLast_1['default'](sortedReportActions, function (action) {
        return action.actionName === CONST_1['default'].REPORT.ACTIONS.TYPE.CLOSED;
    });
}
exports.getLastClosedReportAction = getLastClosedReportAction;
/**
 * The first visible action is the second last action in sortedReportActions which satisfy following conditions:
 * 1. That is not pending deletion as pending deletion actions are kept in sortedReportActions in memory.
 * 2. That has at least one visible child action.
 * 3. While offline all actions in `sortedReportActions` are visible.
 * 4. We will get the second last action from filtered actions because the last
 *    action is always the created action
 */
function getFirstVisibleReportActionID(sortedReportActions, isOffline) {
    var _a;
    if (sortedReportActions === void 0) {
        sortedReportActions = [];
    }
    if (isOffline === void 0) {
        isOffline = false;
    }
    if (!Array.isArray(sortedReportActions)) {
        return '';
    }
    var sortedFilterReportActions = sortedReportActions.filter(function (action) {
        var _a;
        return !isDeletedAction(action) || ((_a = action === null || action === void 0 ? void 0 : action.childVisibleActionCount) !== null && _a !== void 0 ? _a : 0) > 0 || isOffline;
    });
    return sortedFilterReportActions.length > 1
        ? (_a = sortedFilterReportActions.at(sortedFilterReportActions.length - 2)) === null || _a === void 0
            ? void 0
            : _a.reportActionID
        : undefined;
}
exports.getFirstVisibleReportActionID = getFirstVisibleReportActionID;
/**
 * @returns The latest report action in the `onyxData` or `null` if one couldn't be found
 */
function getLatestReportActionFromOnyxData(onyxData) {
    var _a, _b;
    var reportActionUpdate =
        onyxData === null || onyxData === void 0
            ? void 0
            : onyxData.find(function (onyxUpdate) {
                  return onyxUpdate.key.startsWith(ONYXKEYS_1['default'].COLLECTION.REPORT_ACTIONS);
              });
    if (!reportActionUpdate) {
        return null;
    }
    var reportActions = Object.values((_a = reportActionUpdate.value) !== null && _a !== void 0 ? _a : {});
    var sortedReportActions = getSortedReportActions(reportActions);
    return (_b = sortedReportActions.at(-1)) !== null && _b !== void 0 ? _b : null;
}
exports.getLatestReportActionFromOnyxData = getLatestReportActionFromOnyxData;
/**
 * Find the transaction associated with this reportAction, if one exists.
 */
function getLinkedTransactionID(reportActionOrID, reportID) {
    var _a, _b;
    var reportAction =
        typeof reportActionOrID === 'string'
            ? (_a = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions['' + ONYXKEYS_1['default'].COLLECTION.REPORT_ACTIONS + reportID]) === null ||
              _a === void 0
                ? void 0
                : _a[reportActionOrID]
            : reportActionOrID;
    if (!reportAction || !isMoneyRequestAction(reportAction)) {
        return undefined;
    }
    return (_b = getOriginalMessage(reportAction)) === null || _b === void 0 ? void 0 : _b.IOUTransactionID;
}
exports.getLinkedTransactionID = getLinkedTransactionID;
function getReportAction(reportID, reportActionID) {
    var _a;
    if (!reportID || !reportActionID) {
        return undefined;
    }
    return (_a = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions['' + ONYXKEYS_1['default'].COLLECTION.REPORT_ACTIONS + reportID]) === null ||
        _a === void 0
        ? void 0
        : _a[reportActionID];
}
exports.getReportAction = getReportAction;
/**
 * @returns The report preview action or `null` if one couldn't be found
 */
function getReportPreviewAction(chatReportID, iouReportID) {
    var _a;
    if (!chatReportID || !iouReportID) {
        return;
    }
    return Object.values(
        (_a = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions['' + ONYXKEYS_1['default'].COLLECTION.REPORT_ACTIONS + chatReportID]) !== null &&
            _a !== void 0
            ? _a
            : {},
    ).find(function (reportAction) {
        var _a;
        return (
            reportAction &&
            isActionOfType(reportAction, CONST_1['default'].REPORT.ACTIONS.TYPE.REPORT_PREVIEW) &&
            ((_a = getOriginalMessage(reportAction)) === null || _a === void 0 ? void 0 : _a.linkedReportID) === iouReportID
        );
    });
}
exports.getReportPreviewAction = getReportPreviewAction;
/**
 * Get the iouReportID for a given report action.
 */
function getIOUReportIDFromReportActionPreview(reportAction) {
    var _a;
    return isActionOfType(reportAction, CONST_1['default'].REPORT.ACTIONS.TYPE.REPORT_PREVIEW)
        ? (_a = getOriginalMessage(reportAction)) === null || _a === void 0
            ? void 0
            : _a.linkedReportID
        : undefined;
}
exports.getIOUReportIDFromReportActionPreview = getIOUReportIDFromReportActionPreview;
/**
 * A helper method to identify if the message is deleted or not.
 */
function isMessageDeleted(reportAction) {
    var _a, _b;
    return (_b = (_a = getReportActionMessage(reportAction)) === null || _a === void 0 ? void 0 : _a.isDeletedParentAction) !== null && _b !== void 0 ? _b : false;
}
exports.isMessageDeleted = isMessageDeleted;
/**
 * Simple hook to check whether the PureReportActionItem should return item based on whether the ReportPreview was recently deleted and the PureReportActionItem has not yet unloaded
 */
function useNewTableReportViewActionRenderConditionals(_a) {
    var childMoneyRequestCount = _a.childMoneyRequestCount,
        childVisibleActionCount = _a.childVisibleActionCount,
        pendingAction = _a.pendingAction,
        actionName = _a.actionName;
    var previousChildMoneyRequestCount = usePrevious_1['default'](childMoneyRequestCount);
    var isActionAReportPreview = actionName === CONST_1['default'].REPORT.ACTIONS.TYPE.REPORT_PREVIEW;
    var isActionInUpdateState = pendingAction === CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.UPDATE;
    var reportsCount = childMoneyRequestCount;
    var previousReportsCount = previousChildMoneyRequestCount !== null && previousChildMoneyRequestCount !== void 0 ? previousChildMoneyRequestCount : 0;
    var commentsCount = childVisibleActionCount !== null && childVisibleActionCount !== void 0 ? childVisibleActionCount : 0;
    var isEmptyPreviewWithComments = reportsCount === 0 && commentsCount > 0 && previousReportsCount > 0;
    // We only want to remove the item if the ReportPreview has comments but no reports, so we avoid having a PureReportActionItem with no ReportPreview but only comments
    return !(isActionAReportPreview && isActionInUpdateState && isEmptyPreviewWithComments);
}
exports.useNewTableReportViewActionRenderConditionals = useNewTableReportViewActionRenderConditionals;
/**
 * Returns the number of expenses associated with a report preview
 */
function getNumberOfMoneyRequests(reportPreviewAction) {
    var _a;
    return (_a = reportPreviewAction === null || reportPreviewAction === void 0 ? void 0 : reportPreviewAction.childMoneyRequestCount) !== null && _a !== void 0 ? _a : 0;
}
exports.getNumberOfMoneyRequests = getNumberOfMoneyRequests;
function isSplitBillAction(reportAction) {
    var _a;
    return (
        isActionOfType(reportAction, CONST_1['default'].REPORT.ACTIONS.TYPE.IOU) &&
        ((_a = getOriginalMessage(reportAction)) === null || _a === void 0 ? void 0 : _a.type) === CONST_1['default'].IOU.REPORT_ACTION_TYPE.SPLIT
    );
}
exports.isSplitBillAction = isSplitBillAction;
function isTrackExpenseAction(reportAction) {
    var _a;
    return (
        isActionOfType(reportAction, CONST_1['default'].REPORT.ACTIONS.TYPE.IOU) &&
        ((_a = getOriginalMessage(reportAction)) === null || _a === void 0 ? void 0 : _a.type) === CONST_1['default'].IOU.REPORT_ACTION_TYPE.TRACK
    );
}
exports.isTrackExpenseAction = isTrackExpenseAction;
function isPayAction(reportAction) {
    var _a;
    return (
        isActionOfType(reportAction, CONST_1['default'].REPORT.ACTIONS.TYPE.IOU) &&
        ((_a = getOriginalMessage(reportAction)) === null || _a === void 0 ? void 0 : _a.type) === CONST_1['default'].IOU.REPORT_ACTION_TYPE.PAY
    );
}
exports.isPayAction = isPayAction;
function isTaskAction(reportAction) {
    var reportActionName = reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName;
    return (
        reportActionName === CONST_1['default'].REPORT.ACTIONS.TYPE.TASK_COMPLETED ||
        reportActionName === CONST_1['default'].REPORT.ACTIONS.TYPE.TASK_CANCELLED ||
        reportActionName === CONST_1['default'].REPORT.ACTIONS.TYPE.TASK_REOPENED ||
        reportActionName === CONST_1['default'].REPORT.ACTIONS.TYPE.TASK_EDITED
    );
}
exports.isTaskAction = isTaskAction;
/**
 * @param actionName - The name of the action
 * @returns - Whether the action is a tag modification action
 * */
function isTagModificationAction(actionName) {
    return (
        actionName === CONST_1['default'].REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_TAG ||
        actionName === CONST_1['default'].REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_ENABLED ||
        actionName === CONST_1['default'].REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_NAME ||
        actionName === CONST_1['default'].REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_TAG ||
        actionName === CONST_1['default'].REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_MULTIPLE_TAGS ||
        actionName === CONST_1['default'].REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG
    );
}
exports.isTagModificationAction = isTagModificationAction;
// Get all IOU report actions for the report.
var iouRequestTypes = new Set([
    CONST_1['default'].IOU.REPORT_ACTION_TYPE.CREATE,
    CONST_1['default'].IOU.REPORT_ACTION_TYPE.SPLIT,
    CONST_1['default'].IOU.REPORT_ACTION_TYPE.PAY,
    CONST_1['default'].IOU.REPORT_ACTION_TYPE.TRACK,
]);
/**
 * Gets the reportID for the transaction thread associated with a report by iterating over the reportActions and identifying the IOU report actions.
 * Returns a reportID if there is exactly one transaction thread for the report, and null otherwise.
 */
function getOneTransactionThreadReportID(reportID, reportActions, isOffline) {
    var _a;
    if (isOffline === void 0) {
        isOffline = undefined;
    }
    // If the report is not an IOU, Expense report, or Invoice, it shouldn't be treated as one-transaction report.
    var report = allReports === null || allReports === void 0 ? void 0 : allReports['' + ONYXKEYS_1['default'].COLLECTION.REPORT + reportID];
    if (
        (report === null || report === void 0 ? void 0 : report.type) !== CONST_1['default'].REPORT.TYPE.IOU &&
        (report === null || report === void 0 ? void 0 : report.type) !== CONST_1['default'].REPORT.TYPE.EXPENSE &&
        (report === null || report === void 0 ? void 0 : report.type) !== CONST_1['default'].REPORT.TYPE.INVOICE
    ) {
        return;
    }
    var reportActionsArray = Array.isArray(reportActions) ? reportActions : Object.values(reportActions !== null && reportActions !== void 0 ? reportActions : {});
    if (!reportActionsArray.length) {
        return;
    }
    var iouRequestActions = [];
    for (var _i = 0, reportActionsArray_1 = reportActionsArray; _i < reportActionsArray_1.length; _i++) {
        var action = reportActionsArray_1[_i];
        if (!isMoneyRequestAction(action)) {
            // eslint-disable-next-line no-continue
            continue;
        }
        var originalMessage_1 = getOriginalMessage(action);
        var actionType = originalMessage_1 === null || originalMessage_1 === void 0 ? void 0 : originalMessage_1.type;
        if (
            actionType &&
            iouRequestTypes.has(actionType) &&
            action.childReportID &&
            // Include deleted IOU reportActions if:
            // - they have an assocaited IOU transaction ID or
            // - they have visibile childActions (like comments) that we'd want to display
            // - the action is pending deletion and the user is offline
            (!!(originalMessage_1 === null || originalMessage_1 === void 0 ? void 0 : originalMessage_1.IOUTransactionID) ||
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                (isMessageDeleted(action) && action.childVisibleActionCount) ||
                (action.pendingAction === CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.DELETE && (isOffline !== null && isOffline !== void 0 ? isOffline : isNetworkOffline)))
        ) {
            iouRequestActions.push(action);
        }
    }
    // If we don't have any IOU request actions, or we have more than one IOU request actions, this isn't a oneTransaction report
    if (!iouRequestActions.length || iouRequestActions.length > 1) {
        return;
    }
    var singleAction = iouRequestActions.at(0);
    var originalMessage = getOriginalMessage(singleAction);
    // If there's only one IOU request action associated with the report but it's been deleted, then we don't consider this a oneTransaction report
    // and want to display it using the standard view
    if (
        (((_a = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.deleted) !== null && _a !== void 0 ? _a : '') !== '' || isDeletedAction(singleAction)) &&
        isMoneyRequestAction(singleAction)
    ) {
        return;
    }
    // Ensure we have a childReportID associated with the IOU report action
    return singleAction === null || singleAction === void 0 ? void 0 : singleAction.childReportID;
}
exports.getOneTransactionThreadReportID = getOneTransactionThreadReportID;
/**
 * When we delete certain reports, we want to check whether there are any visible actions left to display.
 * If there are no visible actions left (including system messages), we can hide the report from view entirely
 */
function doesReportHaveVisibleActions(reportID, canUserPerformWriteAction, actionsToMerge) {
    var _a;
    if (actionsToMerge === void 0) {
        actionsToMerge = {};
    }
    var reportActions = Object.values(
        expensify_common_1.fastMerge(
            (_a = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions['' + ONYXKEYS_1['default'].COLLECTION.REPORT_ACTIONS + reportID]) !== null &&
                _a !== void 0
                ? _a
                : {},
            actionsToMerge,
            true,
        ),
    );
    var visibleReportActions = Object.values(reportActions !== null && reportActions !== void 0 ? reportActions : {}).filter(function (action) {
        return shouldReportActionBeVisibleAsLastAction(action, canUserPerformWriteAction);
    });
    // Exclude the task system message and the created message
    var visibleReportActionsWithoutTaskSystemMessage = visibleReportActions.filter(function (action) {
        return !isTaskAction(action) && !isCreatedAction(action);
    });
    return visibleReportActionsWithoutTaskSystemMessage.length > 0;
}
exports.doesReportHaveVisibleActions = doesReportHaveVisibleActions;
function getAllReportActions(reportID) {
    var _a;
    return (_a = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions['' + ONYXKEYS_1['default'].COLLECTION.REPORT_ACTIONS + reportID]) !== null &&
        _a !== void 0
        ? _a
        : {};
}
exports.getAllReportActions = getAllReportActions;
/**
 * Check whether a report action is an attachment (a file, such as an image or a zip).
 *
 */
function isReportActionAttachment(reportAction) {
    var _a, _b;
    var message = getReportActionMessage(reportAction);
    if (reportAction && ('isAttachmentOnly' in reportAction || 'isAttachmentWithText' in reportAction)) {
        return (_b = (_a = reportAction.isAttachmentOnly) !== null && _a !== void 0 ? _a : reportAction.isAttachmentWithText) !== null && _b !== void 0 ? _b : false;
    }
    if (message) {
        return isReportMessageAttachment_1.isReportMessageAttachment(message);
    }
    return false;
}
exports.isReportActionAttachment = isReportActionAttachment;
// eslint-disable-next-line rulesdir/no-negated-variables
function isNotifiableReportAction(reportAction) {
    if (!reportAction) {
        return false;
    }
    var actions = [CONST_1['default'].REPORT.ACTIONS.TYPE.ADD_COMMENT, CONST_1['default'].REPORT.ACTIONS.TYPE.IOU, CONST_1['default'].REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE];
    return actions.includes(reportAction.actionName);
}
exports.isNotifiableReportAction = isNotifiableReportAction;
// We pass getReportName as a param to avoid cyclic dependency.
function getMemberChangeMessageElements(reportAction, getReportNameCallback) {
    var _a;
    var isInviteAction = isInviteMemberAction(reportAction);
    var isLeaveAction = isLeavePolicyAction(reportAction);
    if (!isMemberChangeAction(reportAction)) {
        return [];
    }
    // Currently, we only render messages when members are invited
    var verb = Localize_1.translateLocal('workspace.invite.removed');
    if (isInviteAction) {
        verb = Localize_1.translateLocal('workspace.invite.invited');
    }
    if (isLeaveAction) {
        verb = getPolicyChangeLogEmployeeLeftMessage(reportAction);
    }
    var originalMessage = getOriginalMessage(reportAction);
    var targetAccountIDs = (_a = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.targetAccountIDs) !== null && _a !== void 0 ? _a : [];
    var personalDetails = PersonalDetailsUtils_1.getPersonalDetailsByIDs({accountIDs: targetAccountIDs, currentUserAccountID: 0});
    var mentionElements = targetAccountIDs.map(function (accountID) {
        var _a;
        var personalDetail = personalDetails.find(function (personal) {
            return personal.accountID === accountID;
        });
        var handleText = (_a = PersonalDetailsUtils_1.getEffectiveDisplayName(personalDetail)) !== null && _a !== void 0 ? _a : Localize_1.translateLocal('common.hidden');
        return {
            kind: 'userMention',
            content: '@' + handleText,
            accountID: accountID,
        };
    });
    var buildRoomElements = function () {
        var roomName =
            getReportNameCallback(
                allReports === null || allReports === void 0
                    ? void 0
                    : allReports['' + ONYXKEYS_1['default'].COLLECTION.REPORT + (originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.reportID)],
            ) || (originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.roomName);
        if (roomName && originalMessage) {
            var preposition = isInviteAction ? ' ' + Localize_1.translateLocal('workspace.invite.to') + ' ' : ' ' + Localize_1.translateLocal('workspace.invite.from') + ' ';
            if (originalMessage.reportID) {
                return [
                    {
                        kind: 'text',
                        content: preposition,
                    },
                    {
                        kind: 'roomReference',
                        roomName: roomName,
                        roomID: originalMessage.reportID,
                        content: roomName,
                    },
                ];
            }
        }
        return [];
    };
    return __spreadArrays(
        [
            {
                kind: 'text',
                content: verb + ' ',
            },
        ],
        Localize_1.formatMessageElementList(mentionElements),
        buildRoomElements(),
    );
}
function getReportActionHtml(reportAction) {
    var _a, _b;
    return (_b = (_a = getReportActionMessage(reportAction)) === null || _a === void 0 ? void 0 : _a.html) !== null && _b !== void 0 ? _b : '';
}
exports.getReportActionHtml = getReportActionHtml;
function getReportActionText(reportAction) {
    var _a;
    var message = getReportActionMessage(reportAction);
    // Sometime html can be an empty string
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var text =
        (_a = (message === null || message === void 0 ? void 0 : message.html) || (message === null || message === void 0 ? void 0 : message.text)) !== null && _a !== void 0 ? _a : '';
    return text ? Parser_1['default'].htmlToText(text) : '';
}
exports.getReportActionText = getReportActionText;
function getTextFromHtml(html) {
    return html ? Parser_1['default'].htmlToText(html) : '';
}
exports.getTextFromHtml = getTextFromHtml;
function isOldDotLegacyAction(action) {
    return [
        CONST_1['default'].REPORT.ACTIONS.TYPE.DELETED_ACCOUNT,
        CONST_1['default'].REPORT.ACTIONS.TYPE.DONATION,
        CONST_1['default'].REPORT.ACTIONS.TYPE.EXPORTED_TO_QUICK_BOOKS,
        CONST_1['default'].REPORT.ACTIONS.TYPE.REIMBURSEMENT_REQUESTED,
        CONST_1['default'].REPORT.ACTIONS.TYPE.REIMBURSEMENT_SETUP,
    ].some(function (oldDotActionName) {
        return oldDotActionName === (action === null || action === void 0 ? void 0 : action.actionName);
    });
}
function isOldDotReportAction(action) {
    if (!action || !action.actionName) {
        return false;
    }
    return [
        CONST_1['default'].REPORT.ACTIONS.TYPE.CHANGE_FIELD,
        CONST_1['default'].REPORT.ACTIONS.TYPE.CHANGE_TYPE,
        CONST_1['default'].REPORT.ACTIONS.TYPE.DELEGATE_SUBMIT,
        CONST_1['default'].REPORT.ACTIONS.TYPE.EXPORTED_TO_CSV,
        CONST_1['default'].REPORT.ACTIONS.TYPE.INTEGRATIONS_MESSAGE,
        CONST_1['default'].REPORT.ACTIONS.TYPE.MANAGER_ATTACH_RECEIPT,
        CONST_1['default'].REPORT.ACTIONS.TYPE.MANAGER_DETACH_RECEIPT,
        CONST_1['default'].REPORT.ACTIONS.TYPE.MARKED_REIMBURSED,
        CONST_1['default'].REPORT.ACTIONS.TYPE.MARK_REIMBURSED_FROM_INTEGRATION,
        CONST_1['default'].REPORT.ACTIONS.TYPE.OUTDATED_BANK_ACCOUNT,
        CONST_1['default'].REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_BOUNCE,
        CONST_1['default'].REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_CANCELED,
        CONST_1['default'].REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACCOUNT_CHANGED,
        CONST_1['default'].REPORT.ACTIONS.TYPE.REIMBURSEMENT_DELAYED,
        CONST_1['default'].REPORT.ACTIONS.TYPE.SELECTED_FOR_RANDOM_AUDIT,
        CONST_1['default'].REPORT.ACTIONS.TYPE.SHARE,
        CONST_1['default'].REPORT.ACTIONS.TYPE.STRIPE_PAID,
        CONST_1['default'].REPORT.ACTIONS.TYPE.TAKE_CONTROL,
        CONST_1['default'].REPORT.ACTIONS.TYPE.UNSHARE,
        CONST_1['default'].REPORT.ACTIONS.TYPE.DELETED_ACCOUNT,
        CONST_1['default'].REPORT.ACTIONS.TYPE.DONATION,
        CONST_1['default'].REPORT.ACTIONS.TYPE.EXPORTED_TO_QUICK_BOOKS,
        CONST_1['default'].REPORT.ACTIONS.TYPE.REIMBURSEMENT_REQUESTED,
        CONST_1['default'].REPORT.ACTIONS.TYPE.REIMBURSEMENT_SETUP,
    ].some(function (oldDotActionName) {
        return oldDotActionName === action.actionName;
    });
}
exports.isOldDotReportAction = isOldDotReportAction;
function getMessageOfOldDotLegacyAction(legacyAction) {
    var _a, _b;
    if (!Array.isArray(legacyAction === null || legacyAction === void 0 ? void 0 : legacyAction.message)) {
        return getReportActionText(legacyAction);
    }
    if (legacyAction.message.length !== 0) {
        // Sometime html can be an empty string
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        return (_b =
            (_a = legacyAction === null || legacyAction === void 0 ? void 0 : legacyAction.message) === null || _a === void 0
                ? void 0
                : _a
                      .map(function (element) {
                          return getTextFromHtml((element === null || element === void 0 ? void 0 : element.html) || (element === null || element === void 0 ? void 0 : element.text));
                      })
                      .join('')) !== null && _b !== void 0
            ? _b
            : '';
    }
    return '';
}
/**
 * Helper method to format message of OldDot Actions.
 */
function getMessageOfOldDotReportAction(oldDotAction, withMarkdown) {
    var _a, _b, _c, _d, _e, _f;
    if (withMarkdown === void 0) {
        withMarkdown = true;
    }
    if (isOldDotLegacyAction(oldDotAction)) {
        return getMessageOfOldDotLegacyAction(oldDotAction);
    }
    var originalMessage = oldDotAction.originalMessage,
        actionName = oldDotAction.actionName;
    switch (actionName) {
        case CONST_1['default'].REPORT.ACTIONS.TYPE.CHANGE_FIELD: {
            var oldValue = originalMessage.oldValue,
                newValue = originalMessage.newValue,
                fieldName = originalMessage.fieldName;
            if (!oldValue) {
                return Localize_1.translateLocal('report.actions.type.changeFieldEmpty', {newValue: newValue, fieldName: fieldName});
            }
            return Localize_1.translateLocal('report.actions.type.changeField', {oldValue: oldValue, newValue: newValue, fieldName: fieldName});
        }
        case CONST_1['default'].REPORT.ACTIONS.TYPE.DELEGATE_SUBMIT: {
            var delegateUser = originalMessage.delegateUser,
                originalManager = originalMessage.originalManager;
            return Localize_1.translateLocal('report.actions.type.delegateSubmit', {delegateUser: delegateUser, originalManager: originalManager});
        }
        case CONST_1['default'].REPORT.ACTIONS.TYPE.EXPORTED_TO_CSV:
            return Localize_1.translateLocal('report.actions.type.exportedToCSV');
        case CONST_1['default'].REPORT.ACTIONS.TYPE.INTEGRATIONS_MESSAGE: {
            var result = originalMessage.result,
                label = originalMessage.label;
            var errorMessage =
                (_b = (_a = result === null || result === void 0 ? void 0 : result.messages) === null || _a === void 0 ? void 0 : _a.join(', ')) !== null && _b !== void 0 ? _b : '';
            var linkText = (_d = (_c = result === null || result === void 0 ? void 0 : result.link) === null || _c === void 0 ? void 0 : _c.text) !== null && _d !== void 0 ? _d : '';
            var linkURL = (_f = (_e = result === null || result === void 0 ? void 0 : result.link) === null || _e === void 0 ? void 0 : _e.url) !== null && _f !== void 0 ? _f : '';
            return Localize_1.translateLocal('report.actions.type.integrationsMessage', {errorMessage: errorMessage, label: label, linkText: linkText, linkURL: linkURL});
        }
        case CONST_1['default'].REPORT.ACTIONS.TYPE.MANAGER_ATTACH_RECEIPT:
            return Localize_1.translateLocal('report.actions.type.managerAttachReceipt');
        case CONST_1['default'].REPORT.ACTIONS.TYPE.MANAGER_DETACH_RECEIPT:
            return Localize_1.translateLocal('report.actions.type.managerDetachReceipt');
        case CONST_1['default'].REPORT.ACTIONS.TYPE.MARK_REIMBURSED_FROM_INTEGRATION: {
            var amount = originalMessage.amount,
                currency = originalMessage.currency;
            return Localize_1.translateLocal('report.actions.type.markedReimbursedFromIntegration', {amount: amount, currency: currency});
        }
        case CONST_1['default'].REPORT.ACTIONS.TYPE.OUTDATED_BANK_ACCOUNT:
            return Localize_1.translateLocal('report.actions.type.outdatedBankAccount');
        case CONST_1['default'].REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_BOUNCE:
            return Localize_1.translateLocal('report.actions.type.reimbursementACHBounce');
        case CONST_1['default'].REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_CANCELED:
            return Localize_1.translateLocal('report.actions.type.reimbursementACHCancelled');
        case CONST_1['default'].REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACCOUNT_CHANGED:
            return Localize_1.translateLocal('report.actions.type.reimbursementAccountChanged');
        case CONST_1['default'].REPORT.ACTIONS.TYPE.REIMBURSEMENT_DELAYED:
            return Localize_1.translateLocal('report.actions.type.reimbursementDelayed');
        case CONST_1['default'].REPORT.ACTIONS.TYPE.SELECTED_FOR_RANDOM_AUDIT:
            return Localize_1.translateLocal('report.actions.type.selectedForRandomAudit' + (withMarkdown ? 'Markdown' : ''));
        case CONST_1['default'].REPORT.ACTIONS.TYPE.SHARE:
            return Localize_1.translateLocal('report.actions.type.share', {to: originalMessage.to});
        case CONST_1['default'].REPORT.ACTIONS.TYPE.UNSHARE:
            return Localize_1.translateLocal('report.actions.type.unshare', {to: originalMessage.to});
        case CONST_1['default'].REPORT.ACTIONS.TYPE.TAKE_CONTROL:
            return Localize_1.translateLocal('report.actions.type.takeControl');
        default:
            return '';
    }
}
exports.getMessageOfOldDotReportAction = getMessageOfOldDotReportAction;
function getMemberChangeMessageFragment(reportAction, getReportNameCallback) {
    var messageElements = getMemberChangeMessageElements(reportAction, getReportNameCallback);
    var html = messageElements
        .map(function (messageElement) {
            switch (messageElement.kind) {
                case 'userMention':
                    return '<mention-user accountID=' + messageElement.accountID + '>' + messageElement.content + '</mention-user>';
                case 'roomReference':
                    return '<a href="' + environmentURL + '/r/' + messageElement.roomID + '" target="_blank">' + messageElement.roomName + '</a>';
                default:
                    return messageElement.content;
            }
        })
        .join('');
    return {
        html: '<muted-text>' + html + '</muted-text>',
        text: getReportActionMessage(reportAction) ? getReportActionText(reportAction) : '',
        type: CONST_1['default'].REPORT.MESSAGE.TYPE.COMMENT,
    };
}
exports.getMemberChangeMessageFragment = getMemberChangeMessageFragment;
function getUpdateRoomDescriptionFragment(reportAction) {
    var html = getUpdateRoomDescriptionMessage(reportAction);
    return {
        html: '<muted-text>' + html + '</muted-text>',
        text: getReportActionMessage(reportAction) ? getReportActionText(reportAction) : '',
        type: CONST_1['default'].REPORT.MESSAGE.TYPE.COMMENT,
    };
}
exports.getUpdateRoomDescriptionFragment = getUpdateRoomDescriptionFragment;
function getReportActionMessageFragments(action) {
    var _a;
    if (isOldDotReportAction(action)) {
        var oldDotMessage = getMessageOfOldDotReportAction(action);
        var html = isActionOfType(action, CONST_1['default'].REPORT.ACTIONS.TYPE.SELECTED_FOR_RANDOM_AUDIT) ? Parser_1['default'].replace(oldDotMessage) : oldDotMessage;
        return [{text: oldDotMessage, html: '<muted-text>' + html + '</muted-text>', type: 'COMMENT'}];
    }
    if (isActionOfType(action, CONST_1['default'].REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.UPDATE_ROOM_DESCRIPTION)) {
        var message = getUpdateRoomDescriptionMessage(action);
        return [{text: message, html: '<muted-text>' + message + '</muted-text>', type: 'COMMENT'}];
    }
    if (isActionOfType(action, CONST_1['default'].REPORT.ACTIONS.TYPE.REIMBURSED)) {
        var message = getReportActionMessageText(action);
        return [{text: message, html: '<muted-text>' + message + '</muted-text>', type: 'COMMENT'}];
    }
    var actionMessage = (_a = action.previousMessage) !== null && _a !== void 0 ? _a : action.message;
    if (Array.isArray(actionMessage)) {
        return actionMessage.filter(function (item) {
            return !!item;
        });
    }
    return actionMessage ? [actionMessage] : [];
}
exports.getReportActionMessageFragments = getReportActionMessageFragments;
/**
 * Helper method to determine if the provided accountID has submitted an expense on the specified report.
 *
 * @param reportID
 * @param currentAccountID
 * @returns
 */
function hasRequestFromCurrentAccount(reportID, currentAccountID) {
    if (!reportID) {
        return false;
    }
    var reportActions = Object.values(getAllReportActions(reportID));
    if (reportActions.length === 0) {
        return false;
    }
    return reportActions.some(function (action) {
        return action.actionName === CONST_1['default'].REPORT.ACTIONS.TYPE.IOU && action.actorAccountID === currentAccountID;
    });
}
exports.hasRequestFromCurrentAccount = hasRequestFromCurrentAccount;
/**
 * Constructs a message for an actionable mention whisper report action.
 * @param reportAction
 * @returns the actionable mention whisper message.
 */
function getActionableMentionWhisperMessage(reportAction) {
    var _a;
    if (!reportAction) {
        return '';
    }
    var originalMessage = getOriginalMessage(reportAction);
    var targetAccountIDs = (_a = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.inviteeAccountIDs) !== null && _a !== void 0 ? _a : [];
    var personalDetails = PersonalDetailsUtils_1.getPersonalDetailsByIDs({accountIDs: targetAccountIDs, currentUserAccountID: 0});
    var mentionElements = targetAccountIDs.map(function (accountID) {
        var personalDetail = personalDetails.find(function (personal) {
            return personal.accountID === accountID;
        });
        var displayName = PersonalDetailsUtils_1.getEffectiveDisplayName(personalDetail);
        var handleText = isEmpty_1['default'](displayName) ? Localize_1.translateLocal('common.hidden') : displayName;
        return '<mention-user accountID=' + accountID + '>@' + handleText + '</mention-user>';
    });
    var preMentionsText = 'Heads up, ';
    var mentions = mentionElements.join(', ').replace(/, ([^,]*)$/, ' and $1');
    var postMentionsText = ' ' + (mentionElements.length > 1 ? "aren't members" : "isn't a member") + ' of this room.';
    return '' + preMentionsText + mentions + postMentionsText;
}
exports.getActionableMentionWhisperMessage = getActionableMentionWhisperMessage;
/**
 * Note: Prefer `ReportActionsUtils.isCurrentActionUnread` over this method, if applicable.
 * Check whether a specific report action is unread.
 */
function isReportActionUnread(reportAction, lastReadTime) {
    if (!lastReadTime) {
        return !isCreatedAction(reportAction);
    }
    return !!(reportAction && lastReadTime && reportAction.created && lastReadTime < reportAction.created);
}
exports.isReportActionUnread = isReportActionUnread;
/**
 * Check whether the current report action of the report is unread or not
 *
 */
function isCurrentActionUnread(report, reportAction) {
    var _a;
    var lastReadTime = (_a = report === null || report === void 0 ? void 0 : report.lastReadTime) !== null && _a !== void 0 ? _a : '';
    var sortedReportActions = getSortedReportActions(Object.values(getAllReportActions(report === null || report === void 0 ? void 0 : report.reportID)));
    var currentActionIndex = sortedReportActions.findIndex(function (action) {
        return action.reportActionID === reportAction.reportActionID;
    });
    if (currentActionIndex === -1) {
        return false;
    }
    var prevReportAction = sortedReportActions.at(currentActionIndex - 1);
    return isReportActionUnread(reportAction, lastReadTime) && (currentActionIndex === 0 || !prevReportAction || !isReportActionUnread(prevReportAction, lastReadTime));
}
exports.isCurrentActionUnread = isCurrentActionUnread;
/**
 * Checks if a given report action corresponds to a join request action.
 * @param reportAction
 */
function isActionableJoinRequest(reportAction) {
    return isActionOfType(reportAction, CONST_1['default'].REPORT.ACTIONS.TYPE.ACTIONABLE_JOIN_REQUEST);
}
exports.isActionableJoinRequest = isActionableJoinRequest;
function isActionableJoinRequestPendingReportAction(reportAction) {
    var _a;
    return isActionableJoinRequest(reportAction) && ((_a = getOriginalMessage(reportAction)) === null || _a === void 0 ? void 0 : _a.choice) === '';
}
function isConciergeCategoryOptions(reportAction) {
    return isActionOfType(reportAction, CONST_1['default'].REPORT.ACTIONS.TYPE.CONCIERGE_CATEGORY_OPTIONS);
}
exports.isConciergeCategoryOptions = isConciergeCategoryOptions;
function getActionableJoinRequestPendingReportAction(reportID) {
    var findPendingRequest = Object.values(getAllReportActions(reportID)).find(function (reportActionItem) {
        return isActionableJoinRequestPendingReportAction(reportActionItem);
    });
    return findPendingRequest;
}
exports.getActionableJoinRequestPendingReportAction = getActionableJoinRequestPendingReportAction;
/**
 * Checks if any report actions correspond to a join request action that is still pending.
 * @param reportID
 */
function isActionableJoinRequestPending(reportID) {
    return !!getActionableJoinRequestPendingReportAction(reportID);
}
exports.isActionableJoinRequestPending = isActionableJoinRequestPending;
function isApprovedOrSubmittedReportAction(action) {
    return [CONST_1['default'].REPORT.ACTIONS.TYPE.APPROVED, CONST_1['default'].REPORT.ACTIONS.TYPE.SUBMITTED].some(function (type) {
        return type === (action === null || action === void 0 ? void 0 : action.actionName);
    });
}
exports.isApprovedOrSubmittedReportAction = isApprovedOrSubmittedReportAction;
/**
 * Gets the text version of the message in a report action
 */
function getReportActionMessageText(reportAction) {
    var _a, _b;
    if (!Array.isArray(reportAction === null || reportAction === void 0 ? void 0 : reportAction.message)) {
        return getReportActionText(reportAction);
    }
    // Sometime html can be an empty string
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return (_b =
        (_a = reportAction === null || reportAction === void 0 ? void 0 : reportAction.message) === null || _a === void 0
            ? void 0
            : _a.reduce(function (acc, curr) {
                  return '' + acc + getTextFromHtml((curr === null || curr === void 0 ? void 0 : curr.html) || (curr === null || curr === void 0 ? void 0 : curr.text));
              }, '')) !== null && _b !== void 0
        ? _b
        : '';
}
exports.getReportActionMessageText = getReportActionMessageText;
function getDismissedViolationMessageText(originalMessage) {
    var reason = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.reason;
    var violationName = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.violationName;
    return Localize_1.translateLocal('violationDismissal.' + violationName + '.' + reason);
}
exports.getDismissedViolationMessageText = getDismissedViolationMessageText;
/**
 * Check if the linked transaction is on hold
 */
function isLinkedTransactionHeld(reportActionID, reportID) {
    var linkedTransactionID = getLinkedTransactionID(reportActionID, reportID);
    return linkedTransactionID ? TransactionUtils_1.isOnHoldByTransactionID(linkedTransactionID) : false;
}
exports.isLinkedTransactionHeld = isLinkedTransactionHeld;
function getMentionedAccountIDsFromAction(reportAction) {
    var _a, _b;
    return isActionOfType(reportAction, CONST_1['default'].REPORT.ACTIONS.TYPE.ADD_COMMENT)
        ? (_b = (_a = getOriginalMessage(reportAction)) === null || _a === void 0 ? void 0 : _a.mentionedAccountIDs) !== null && _b !== void 0
            ? _b
            : []
        : [];
}
function getMentionedEmailsFromMessage(message) {
    var mentionEmailRegex = /<mention-user>(.*?)<\/mention-user>/g;
    var matches = __spreadArrays(message.matchAll(mentionEmailRegex));
    return matches.map(function (match) {
        return expensify_common_1.Str.removeSMSDomain(match[1].substring(1));
    });
}
function didMessageMentionCurrentUser(reportAction) {
    var _a, _b;
    var accountIDsFromMessage = getMentionedAccountIDsFromAction(reportAction);
    var message = (_b = (_a = getReportActionMessage(reportAction)) === null || _a === void 0 ? void 0 : _a.html) !== null && _b !== void 0 ? _b : '';
    var emailsFromMessage = getMentionedEmailsFromMessage(message);
    return (
        accountIDsFromMessage.includes(currentUserAccountID !== null && currentUserAccountID !== void 0 ? currentUserAccountID : CONST_1['default'].DEFAULT_NUMBER_ID) ||
        emailsFromMessage.includes(currentEmail) ||
        message.includes('<mention-here>')
    );
}
exports.didMessageMentionCurrentUser = didMessageMentionCurrentUser;
/**
 * Check if the current user is the requestor of the action
 */
function wasActionTakenByCurrentUser(reportAction) {
    return currentUserAccountID === (reportAction === null || reportAction === void 0 ? void 0 : reportAction.actorAccountID);
}
exports.wasActionTakenByCurrentUser = wasActionTakenByCurrentUser;
/**
 * Get IOU action for a reportID and transactionID
 */
function getIOUActionForReportID(reportID, transactionID) {
    if (!reportID || !transactionID) {
        return undefined;
    }
    var reportActions = getAllReportActions(reportID);
    return getIOUActionForTransactionID(Object.values(reportActions !== null && reportActions !== void 0 ? reportActions : {}), transactionID);
}
exports.getIOUActionForReportID = getIOUActionForReportID;
/**
 * Get the IOU action for a transactionID from given reportActions
 */
function getIOUActionForTransactionID(reportActions, transactionID) {
    return reportActions.find(function (reportAction) {
        var _a;
        var IOUTransactionID = isMoneyRequestAction(reportAction) ? ((_a = getOriginalMessage(reportAction)) === null || _a === void 0 ? void 0 : _a.IOUTransactionID) : undefined;
        return IOUTransactionID === transactionID;
    });
}
exports.getIOUActionForTransactionID = getIOUActionForTransactionID;
/**
 * Get the track expense actionable whisper of the corresponding track expense
 */
function getTrackExpenseActionableWhisper(transactionID, chatReportID) {
    var _a;
    if (!transactionID || !chatReportID) {
        return undefined;
    }
    var chatReportActions =
        (_a = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions['' + ONYXKEYS_1['default'].COLLECTION.REPORT_ACTIONS + chatReportID]) !== null &&
        _a !== void 0
            ? _a
            : {};
    return Object.values(chatReportActions).find(function (action) {
        var _a;
        return isActionableTrackExpense(action) && ((_a = getOriginalMessage(action)) === null || _a === void 0 ? void 0 : _a.transactionID) === transactionID;
    });
}
exports.getTrackExpenseActionableWhisper = getTrackExpenseActionableWhisper;
/**
 * Checks if a given report action corresponds to a add payment card action.
 * @param reportAction
 */
function isActionableAddPaymentCard(reportAction) {
    return (reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1['default'].REPORT.ACTIONS.TYPE.ACTIONABLE_ADD_PAYMENT_CARD;
}
exports.isActionableAddPaymentCard = isActionableAddPaymentCard;
function getExportIntegrationLastMessageText(reportAction) {
    var fragments = getExportIntegrationActionFragments(reportAction);
    return fragments.reduce(function (acc, fragment) {
        return acc + ' ' + fragment.text;
    }, '');
}
exports.getExportIntegrationLastMessageText = getExportIntegrationLastMessageText;
function getExportIntegrationMessageHTML(reportAction) {
    var fragments = getExportIntegrationActionFragments(reportAction);
    var htmlFragments = fragments.map(function (fragment) {
        return fragment.url ? '<a href="' + fragment.url + '">' + fragment.text + '</a>' : fragment.text;
    });
    return htmlFragments.join(' ');
}
exports.getExportIntegrationMessageHTML = getExportIntegrationMessageHTML;
function getExportIntegrationActionFragments(reportAction) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if ((reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) !== 'EXPORTINTEGRATION') {
        throw Error('received wrong action type. actionName: ' + (reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName));
    }
    var isPending = (reportAction === null || reportAction === void 0 ? void 0 : reportAction.pendingAction) === CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.ADD;
    var originalMessage = (_a = getOriginalMessage(reportAction)) !== null && _a !== void 0 ? _a : {};
    var label = originalMessage.label,
        markedManually = originalMessage.markedManually,
        automaticAction = originalMessage.automaticAction;
    var reimbursableUrls = (_b = originalMessage.reimbursableUrls) !== null && _b !== void 0 ? _b : [];
    var nonReimbursableUrls = (_c = originalMessage.nonReimbursableUrls) !== null && _c !== void 0 ? _c : [];
    var reportID = reportAction === null || reportAction === void 0 ? void 0 : reportAction.reportID;
    var wasExportedAfterBase62 = ((_d = reportAction === null || reportAction === void 0 ? void 0 : reportAction.created) !== null && _d !== void 0 ? _d : '') > '2022-11-14';
    var base62ReportID = getBase62ReportID_1['default'](Number(reportID));
    var result = [];
    if (isPending) {
        result.push({
            text: Localize_1.translateLocal('report.actions.type.exportedToIntegration.pending', {label: label}),
            url: '',
        });
    } else if (markedManually) {
        result.push({
            text: Localize_1.translateLocal('report.actions.type.exportedToIntegration.manual', {label: label}),
            url: '',
        });
    } else if (automaticAction) {
        result.push({
            text: Localize_1.translateLocal('report.actions.type.exportedToIntegration.automaticActionOne', {label: label}),
            url: '',
        });
        var url = CONST_1['default'].HELP_DOC_LINKS[label];
        result.push({
            text: Localize_1.translateLocal('report.actions.type.exportedToIntegration.automaticActionTwo'),
            url: url || '',
        });
    } else {
        result.push({
            text: Localize_1.translateLocal('report.actions.type.exportedToIntegration.automatic', {label: label}),
            url: '',
        });
    }
    if (reimbursableUrls.length === 1) {
        result.push({
            text: Localize_1.translateLocal('report.actions.type.exportedToIntegration.reimburseableLink'),
            url: (_e = reimbursableUrls.at(0)) !== null && _e !== void 0 ? _e : '',
        });
    }
    if (nonReimbursableUrls.length) {
        var text = Localize_1.translateLocal('report.actions.type.exportedToIntegration.nonReimbursableLink');
        var url = '';
        if (nonReimbursableUrls.length === 1) {
            url = (_f = nonReimbursableUrls.at(0)) !== null && _f !== void 0 ? _f : '';
        } else {
            switch (label) {
                case CONST_1['default'].POLICY.CONNECTIONS.NAME_USER_FRIENDLY.xero:
                    url = XERO_NON_REIMBURSABLE_EXPENSES_URL;
                    break;
                case CONST_1['default'].POLICY.CONNECTIONS.NAME_USER_FRIENDLY.netsuite:
                    url = NETSUITE_NON_REIMBURSABLE_EXPENSES_URL_PREFIX;
                    url += wasExportedAfterBase62 ? base62ReportID : reportID;
                    break;
                case CONST_1['default'].POLICY.CONNECTIONS.NAME_USER_FRIENDLY.financialForce:
                    // The first three characters in a Salesforce ID is the expense type
                    url =
                        (_h = (_g = nonReimbursableUrls.at(0)) === null || _g === void 0 ? void 0 : _g.substring(0, SALESFORCE_EXPENSES_URL_PREFIX.length + 3)) !== null && _h !== void 0
                            ? _h
                            : '';
                    break;
                default:
                    url = QBO_EXPENSES_URL;
            }
        }
        result.push({text: text, url: url});
    }
    return result;
}
exports.getExportIntegrationActionFragments = getExportIntegrationActionFragments;
function getUpdateRoomDescriptionMessage(reportAction) {
    var originalMessage = getOriginalMessage(reportAction);
    if (originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.description) {
        return Localize_1.translateLocal('roomChangeLog.updateRoomDescription') + ' ' + (originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.description);
    }
    return Localize_1.translateLocal('roomChangeLog.clearRoomDescription');
}
exports.getUpdateRoomDescriptionMessage = getUpdateRoomDescriptionMessage;
function isPolicyChangeLogAddEmployeeMessage(reportAction) {
    return isActionOfType(reportAction, CONST_1['default'].REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_EMPLOYEE);
}
function getPolicyChangeLogAddEmployeeMessage(reportAction) {
    var _a, _b;
    if (!isPolicyChangeLogAddEmployeeMessage(reportAction)) {
        return '';
    }
    var originalMessage = getOriginalMessage(reportAction);
    var email = (_a = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.email) !== null && _a !== void 0 ? _a : '';
    var role = Localize_1.translateLocal('workspace.common.roleName', {
        role: (_b = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.role) !== null && _b !== void 0 ? _b : '',
    }).toLowerCase();
    var formattedEmail = LocalePhoneNumber_1.formatPhoneNumber(email);
    return Localize_1.translateLocal('report.actions.type.addEmployee', {email: formattedEmail, role: role});
}
exports.getPolicyChangeLogAddEmployeeMessage = getPolicyChangeLogAddEmployeeMessage;
function isPolicyChangeLogChangeRoleMessage(reportAction) {
    return isActionOfType(reportAction, CONST_1['default'].REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EMPLOYEE);
}
function getPolicyChangeLogChangeRoleMessage(reportAction) {
    var _a;
    if (!isPolicyChangeLogChangeRoleMessage(reportAction)) {
        return '';
    }
    var originalMessage = getOriginalMessage(reportAction);
    var email = (_a = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.email) !== null && _a !== void 0 ? _a : '';
    var newRole = Localize_1.translateLocal('workspace.common.roleName', {
        role:
            typeof (originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.newValue) === 'string'
                ? originalMessage === null || originalMessage === void 0
                    ? void 0
                    : originalMessage.newValue
                : '',
    }).toLowerCase();
    var oldRole = Localize_1.translateLocal('workspace.common.roleName', {
        role:
            typeof (originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.oldValue) === 'string'
                ? originalMessage === null || originalMessage === void 0
                    ? void 0
                    : originalMessage.oldValue
                : '',
    }).toLowerCase();
    return Localize_1.translateLocal('report.actions.type.updateRole', {email: email, newRole: newRole, currentRole: oldRole});
}
exports.getPolicyChangeLogChangeRoleMessage = getPolicyChangeLogChangeRoleMessage;
function getPolicyChangeLogEmployeeLeftMessage(reportAction, useName) {
    var _a, _b;
    if (useName === void 0) {
        useName = false;
    }
    if (!isLeavePolicyAction(reportAction)) {
        return '';
    }
    var originalMessage = getOriginalMessage(reportAction);
    var personalDetails =
        (_a = PersonalDetailsUtils_1.getPersonalDetailsByIDs({accountIDs: reportAction.actorAccountID ? [reportAction.actorAccountID] : [], currentUserAccountID: 0})) === null ||
        _a === void 0
            ? void 0
            : _a.at(0);
    if (!!originalMessage && !originalMessage.email) {
        originalMessage.email = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails.login;
    }
    var nameOrEmail =
        useName && !!(personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails.firstName)
            ? (personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails.firstName) + ':'
            : (_b = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.email) !== null && _b !== void 0
            ? _b
            : '';
    var formattedNameOrEmail = LocalePhoneNumber_1.formatPhoneNumber(nameOrEmail);
    return Localize_1.translateLocal('report.actions.type.leftWorkspace', {nameOrEmail: formattedNameOrEmail});
}
exports.getPolicyChangeLogEmployeeLeftMessage = getPolicyChangeLogEmployeeLeftMessage;
function isPolicyChangeLogDeleteMemberMessage(reportAction) {
    return isActionOfType(reportAction, CONST_1['default'].REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_EMPLOYEE);
}
function getWorkspaceDescriptionUpdatedMessage(action) {
    var _a;
    var _b = (_a = getOriginalMessage(action)) !== null && _a !== void 0 ? _a : {},
        oldDescription = _b.oldDescription,
        newDescription = _b.newDescription;
    var message =
        typeof oldDescription === 'string' && newDescription
            ? Localize_1.translateLocal('workspaceActions.updateWorkspaceDescription', {newDescription: newDescription, oldDescription: oldDescription})
            : getReportActionText(action);
    return message;
}
exports.getWorkspaceDescriptionUpdatedMessage = getWorkspaceDescriptionUpdatedMessage;
function getWorkspaceCurrencyUpdateMessage(action) {
    var _a;
    var _b = (_a = getOriginalMessage(action)) !== null && _a !== void 0 ? _a : {},
        oldCurrency = _b.oldCurrency,
        newCurrency = _b.newCurrency;
    var message =
        oldCurrency && newCurrency
            ? Localize_1.translateLocal('workspaceActions.updatedWorkspaceCurrencyAction', {oldCurrency: oldCurrency, newCurrency: newCurrency})
            : getReportActionText(action);
    return message;
}
exports.getWorkspaceCurrencyUpdateMessage = getWorkspaceCurrencyUpdateMessage;
var getAutoReportingFrequencyDisplayNames = function () {
    var _a;
    return (
        (_a = {}),
        (_a[CONST_1['default'].POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY] = Localize_1.translateLocal('workflowsPage.frequencies.monthly')),
        (_a[CONST_1['default'].POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE] = Localize_1.translateLocal('workflowsPage.frequencies.daily')),
        (_a[CONST_1['default'].POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY] = Localize_1.translateLocal('workflowsPage.frequencies.weekly')),
        (_a[CONST_1['default'].POLICY.AUTO_REPORTING_FREQUENCIES.SEMI_MONTHLY] = Localize_1.translateLocal('workflowsPage.frequencies.twiceAMonth')),
        (_a[CONST_1['default'].POLICY.AUTO_REPORTING_FREQUENCIES.TRIP] = Localize_1.translateLocal('workflowsPage.frequencies.byTrip')),
        (_a[CONST_1['default'].POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL] = Localize_1.translateLocal('workflowsPage.frequencies.manually')),
        (_a[CONST_1['default'].POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT] = Localize_1.translateLocal('workflowsPage.frequencies.instant')),
        _a
    );
};
function getWorkspaceFrequencyUpdateMessage(action) {
    var _a, _b, _c;
    var _d = (_a = getOriginalMessage(action)) !== null && _a !== void 0 ? _a : {},
        oldFrequency = _d.oldFrequency,
        newFrequency = _d.newFrequency;
    if (!oldFrequency || !newFrequency) {
        return getReportActionText(action);
    }
    var frequencyDisplayNames = getAutoReportingFrequencyDisplayNames();
    var oldFrequencyTranslation = (_b = frequencyDisplayNames[oldFrequency]) === null || _b === void 0 ? void 0 : _b.toLowerCase();
    var newFrequencyTranslation = (_c = frequencyDisplayNames[newFrequency]) === null || _c === void 0 ? void 0 : _c.toLowerCase();
    if (!oldFrequencyTranslation || !newFrequencyTranslation) {
        return getReportActionText(action);
    }
    return Localize_1.translateLocal('workspaceActions.updatedWorkspaceFrequencyAction', {
        oldFrequency: oldFrequencyTranslation,
        newFrequency: newFrequencyTranslation,
    });
}
exports.getWorkspaceFrequencyUpdateMessage = getWorkspaceFrequencyUpdateMessage;
function getWorkspaceCategoryUpdateMessage(action) {
    var _a;
    var _b = (_a = getOriginalMessage(action)) !== null && _a !== void 0 ? _a : {},
        categoryName = _b.categoryName,
        oldValue = _b.oldValue,
        newName = _b.newName,
        oldName = _b.oldName;
    if (action.actionName === CONST_1['default'].REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CATEGORY && categoryName) {
        return Localize_1.translateLocal('workspaceActions.addCategory', {
            categoryName: categoryName,
        });
    }
    if (action.actionName === CONST_1['default'].REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CATEGORY && categoryName) {
        return Localize_1.translateLocal('workspaceActions.deleteCategory', {
            categoryName: categoryName,
        });
    }
    if (action.actionName === CONST_1['default'].REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CATEGORY && categoryName) {
        return Localize_1.translateLocal('workspaceActions.updateCategory', {
            oldValue: !!oldValue,
            categoryName: categoryName,
        });
    }
    if (action.actionName === CONST_1['default'].REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.SET_CATEGORY_NAME && oldName && newName) {
        return Localize_1.translateLocal('workspaceActions.setCategoryName', {
            oldName: oldName,
            newName: newName,
        });
    }
    return getReportActionText(action);
}
exports.getWorkspaceCategoryUpdateMessage = getWorkspaceCategoryUpdateMessage;
function getWorkspaceTagUpdateMessage(action) {
    var _a;
    var _b = (_a = getOriginalMessage(action)) !== null && _a !== void 0 ? _a : {},
        tagListName = _b.tagListName,
        tagName = _b.tagName,
        enabled = _b.enabled,
        newName = _b.newName,
        newValue = _b.newValue,
        oldName = _b.oldName,
        oldValue = _b.oldValue,
        updatedField = _b.updatedField,
        count = _b.count;
    if (action.actionName === CONST_1['default'].REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_TAG && tagListName && tagName) {
        return Localize_1.translateLocal('workspaceActions.addTag', {
            tagListName: tagListName,
            tagName: tagName,
        });
    }
    if (action.actionName === CONST_1['default'].REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_TAG && tagListName && tagName) {
        return Localize_1.translateLocal('workspaceActions.deleteTag', {
            tagListName: tagListName,
            tagName: tagName,
        });
    }
    if (action.actionName === CONST_1['default'].REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_MULTIPLE_TAGS && count && tagListName) {
        return Localize_1.translateLocal('workspaceActions.deleteMultipleTags', {
            count: count,
            tagListName: tagListName,
        });
    }
    if (action.actionName === CONST_1['default'].REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_ENABLED && tagListName && tagName) {
        return Localize_1.translateLocal('workspaceActions.updateTagEnabled', {
            tagListName: tagListName,
            tagName: tagName,
            enabled: enabled,
        });
    }
    if (action.actionName === CONST_1['default'].REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_NAME && tagListName && newName && oldName) {
        return Localize_1.translateLocal('workspaceActions.updateTagName', {
            tagListName: tagListName,
            newName: newName,
            oldName: oldName,
        });
    }
    if (
        action.actionName === CONST_1['default'].REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG &&
        tagListName &&
        typeof oldValue === 'string' &&
        typeof newValue === 'string' &&
        tagName &&
        updatedField
    ) {
        return Localize_1.translateLocal('workspaceActions.updateTag', {
            tagListName: tagListName,
            oldValue: oldValue,
            newValue: newValue,
            tagName: tagName,
            updatedField: updatedField,
        });
    }
    return getReportActionText(action);
}
exports.getWorkspaceTagUpdateMessage = getWorkspaceTagUpdateMessage;
function getWorkspaceCustomUnitRateAddedMessage(action) {
    var _a;
    var _b = (_a = getOriginalMessage(action)) !== null && _a !== void 0 ? _a : {},
        customUnitName = _b.customUnitName,
        rateName = _b.rateName;
    if (customUnitName && rateName) {
        return Localize_1.translateLocal('workspaceActions.addCustomUnitRate', {
            customUnitName: customUnitName,
            rateName: rateName,
        });
    }
    return getReportActionText(action);
}
exports.getWorkspaceCustomUnitRateAddedMessage = getWorkspaceCustomUnitRateAddedMessage;
function getWorkspaceReportFieldAddMessage(action) {
    var _a;
    var _b = (_a = getOriginalMessage(action)) !== null && _a !== void 0 ? _a : {},
        fieldName = _b.fieldName,
        fieldType = _b.fieldType;
    if (fieldName && fieldType) {
        return Localize_1.translateLocal('workspaceActions.addedReportField', {
            fieldName: fieldName,
            fieldType: Localize_1.translateLocal(WorkspaceReportFieldUtils_1.getReportFieldAlternativeTextTranslationKey(fieldType)),
        });
    }
    return getReportActionText(action);
}
exports.getWorkspaceReportFieldAddMessage = getWorkspaceReportFieldAddMessage;
function getWorkspaceReportFieldUpdateMessage(action) {
    var _a;
    var _b = (_a = getOriginalMessage(action)) !== null && _a !== void 0 ? _a : {},
        updateType = _b.updateType,
        fieldName = _b.fieldName,
        defaultValue = _b.defaultValue;
    if (updateType === 'updatedDefaultValue' && fieldName && defaultValue) {
        return Localize_1.translateLocal('workspaceActions.updateReportFieldDefaultValue', {
            fieldName: fieldName,
            defaultValue: defaultValue,
        });
    }
    return getReportActionText(action);
}
exports.getWorkspaceReportFieldUpdateMessage = getWorkspaceReportFieldUpdateMessage;
function getWorkspaceReportFieldDeleteMessage(action) {
    var _a;
    var _b = (_a = getOriginalMessage(action)) !== null && _a !== void 0 ? _a : {},
        fieldType = _b.fieldType,
        fieldName = _b.fieldName;
    if (fieldType && fieldName) {
        return Localize_1.translateLocal('workspaceActions.deleteReportField', {
            fieldName: fieldName,
            fieldType: Localize_1.translateLocal(WorkspaceReportFieldUtils_1.getReportFieldAlternativeTextTranslationKey(fieldType)),
        });
    }
    return getReportActionText(action);
}
exports.getWorkspaceReportFieldDeleteMessage = getWorkspaceReportFieldDeleteMessage;
function getWorkspaceUpdateFieldMessage(action) {
    var _a;
    var _b = (_a = getOriginalMessage(action)) !== null && _a !== void 0 ? _a : {},
        newValue = _b.newValue,
        oldValue = _b.oldValue,
        updatedField = _b.updatedField;
    var newValueTranslationKey = CONST_1['default'].POLICY.APPROVAL_MODE_TRANSLATION_KEYS[newValue];
    var oldValueTranslationKey = CONST_1['default'].POLICY.APPROVAL_MODE_TRANSLATION_KEYS[oldValue];
    if (updatedField && updatedField === CONST_1['default'].POLICY.COLLECTION_KEYS.APPROVAL_MODE && oldValueTranslationKey && newValueTranslationKey) {
        return Localize_1.translateLocal('workspaceActions.updateApprovalMode', {
            newValue: Localize_1.translateLocal('workspaceApprovalModes.' + newValueTranslationKey),
            oldValue: Localize_1.translateLocal('workspaceApprovalModes.' + oldValueTranslationKey),
            fieldName: updatedField,
        });
    }
    if (updatedField && updatedField === CONST_1['default'].POLICY.EXPENSE_REPORT_RULES.PREVENT_SELF_APPROVAL && typeof oldValue === 'string' && typeof newValue === 'string') {
        return Localize_1.translateLocal('workspaceActions.preventSelfApproval', {
            oldValue: oldValue,
            newValue: newValue,
        });
    }
    if (updatedField && updatedField === CONST_1['default'].POLICY.EXPENSE_REPORT_RULES.MAX_EXPENSE_AGE && typeof oldValue === 'string' && typeof newValue === 'string') {
        return Localize_1.translateLocal('workspaceActions.updateMaxExpenseAge', {
            oldValue: oldValue,
            newValue: newValue,
        });
    }
    if (
        updatedField &&
        updatedField === CONST_1['default'].POLICY.COLLECTION_KEYS.AUTOREPORTING_OFFSET &&
        (typeof oldValue === 'string' || typeof oldValue === 'number') &&
        (typeof newValue === 'string' || typeof newValue === 'number')
    ) {
        var getAutoReportingOffsetToDisplay = function (autoReportingOffset) {
            if (autoReportingOffset === CONST_1['default'].POLICY.AUTO_REPORTING_OFFSET.LAST_DAY_OF_MONTH) {
                return Localize_1.translateLocal('workflowsPage.frequencies.lastDayOfMonth');
            }
            if (autoReportingOffset === CONST_1['default'].POLICY.AUTO_REPORTING_OFFSET.LAST_BUSINESS_DAY_OF_MONTH) {
                return Localize_1.translateLocal('workflowsPage.frequencies.lastBusinessDayOfMonth');
            }
            if (typeof autoReportingOffset === 'number') {
                return LocaleDigitUtils_1.toLocaleOrdinal(preferredLocale, autoReportingOffset, false);
            }
            return '';
        };
        return Localize_1.translateLocal('workspaceActions.updateMonthlyOffset', {
            newValue: getAutoReportingOffsetToDisplay(newValue),
            oldValue: getAutoReportingOffsetToDisplay(oldValue),
        });
    }
    return getReportActionText(action);
}
exports.getWorkspaceUpdateFieldMessage = getWorkspaceUpdateFieldMessage;
function getPolicyChangeLogMaxExpesnseAmountNoReceiptMessage(action) {
    var _a;
    var _b = (_a = getOriginalMessage(action)) !== null && _a !== void 0 ? _a : {},
        oldMaxExpenseAmountNoReceipt = _b.oldMaxExpenseAmountNoReceipt,
        newMaxExpenseAmountNoReceipt = _b.newMaxExpenseAmountNoReceipt,
        currency = _b.currency;
    if (typeof oldMaxExpenseAmountNoReceipt === 'number' && typeof newMaxExpenseAmountNoReceipt === 'number') {
        return Localize_1.translateLocal('workspaceActions.updateMaxExpenseAmountNoReceipt', {
            oldValue: CurrencyUtils_1.convertToDisplayString(oldMaxExpenseAmountNoReceipt, currency),
            newValue: CurrencyUtils_1.convertToDisplayString(newMaxExpenseAmountNoReceipt, currency),
        });
    }
    return getReportActionText(action);
}
exports.getPolicyChangeLogMaxExpesnseAmountNoReceiptMessage = getPolicyChangeLogMaxExpesnseAmountNoReceiptMessage;
function getPolicyChangeLogMaxExpenseAmountMessage(action) {
    var _a;
    var _b = (_a = getOriginalMessage(action)) !== null && _a !== void 0 ? _a : {},
        oldMaxExpenseAmount = _b.oldMaxExpenseAmount,
        newMaxExpenseAmount = _b.newMaxExpenseAmount,
        currency = _b.currency;
    if (typeof oldMaxExpenseAmount === 'number' && typeof newMaxExpenseAmount === 'number') {
        return Localize_1.translateLocal('workspaceActions.updateMaxExpenseAmount', {
            oldValue: CurrencyUtils_1.convertToDisplayString(oldMaxExpenseAmount, currency),
            newValue: CurrencyUtils_1.convertToDisplayString(newMaxExpenseAmount, currency),
        });
    }
    return getReportActionText(action);
}
exports.getPolicyChangeLogMaxExpenseAmountMessage = getPolicyChangeLogMaxExpenseAmountMessage;
function getPolicyChangeLogDefaultBillableMessage(action) {
    var _a;
    var _b = (_a = getOriginalMessage(action)) !== null && _a !== void 0 ? _a : {},
        oldDefaultBillable = _b.oldDefaultBillable,
        newDefaultBillable = _b.newDefaultBillable;
    if (typeof oldDefaultBillable === 'string' && typeof newDefaultBillable === 'string') {
        return Localize_1.translateLocal('workspaceActions.updateDefaultBillable', {
            oldValue: oldDefaultBillable,
            newValue: newDefaultBillable,
        });
    }
    return getReportActionText(action);
}
exports.getPolicyChangeLogDefaultBillableMessage = getPolicyChangeLogDefaultBillableMessage;
function getPolicyChangeLogDefaultTitleEnforcedMessage(action) {
    var _a;
    var value = ((_a = getOriginalMessage(action)) !== null && _a !== void 0 ? _a : {}).value;
    if (typeof value === 'boolean') {
        return Localize_1.translateLocal('workspaceActions.updateDefaultTitleEnforced', {
            value: value,
        });
    }
    return getReportActionText(action);
}
exports.getPolicyChangeLogDefaultTitleEnforcedMessage = getPolicyChangeLogDefaultTitleEnforcedMessage;
function getPolicyChangeLogDeleteMemberMessage(reportAction) {
    var _a, _b;
    if (!isPolicyChangeLogDeleteMemberMessage(reportAction)) {
        return '';
    }
    var originalMessage = getOriginalMessage(reportAction);
    var email = (_a = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.email) !== null && _a !== void 0 ? _a : '';
    var role = Localize_1.translateLocal('workspace.common.roleName', {
        role: (_b = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.role) !== null && _b !== void 0 ? _b : '',
    }).toLowerCase();
    return Localize_1.translateLocal('report.actions.type.removeMember', {email: email, role: role});
}
exports.getPolicyChangeLogDeleteMemberMessage = getPolicyChangeLogDeleteMemberMessage;
function getRemovedConnectionMessage(reportAction) {
    if (!isActionOfType(reportAction, CONST_1['default'].REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_INTEGRATION)) {
        return '';
    }
    var originalMessage = getOriginalMessage(reportAction);
    var connectionName = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.connectionName;
    return connectionName ? Localize_1.translateLocal('report.actions.type.removedConnection', {connectionName: connectionName}) : '';
}
exports.getRemovedConnectionMessage = getRemovedConnectionMessage;
function getRenamedAction(reportAction, actorName) {
    var _a, _b;
    var originalMessage = getOriginalMessage(reportAction);
    return Localize_1.translateLocal('newRoomPage.renamedRoomAction', {
        actorName: actorName,
        oldName: (_a = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.oldName) !== null && _a !== void 0 ? _a : '',
        newName: (_b = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.newName) !== null && _b !== void 0 ? _b : '',
    });
}
exports.getRenamedAction = getRenamedAction;
function getRemovedFromApprovalChainMessage(reportAction) {
    var _a;
    var originalMessage = getOriginalMessage(reportAction);
    var submittersNames = PersonalDetailsUtils_1.getPersonalDetailsByIDs({
        accountIDs: (_a = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.submittersAccountIDs) !== null && _a !== void 0 ? _a : [],
        currentUserAccountID: currentUserAccountID !== null && currentUserAccountID !== void 0 ? currentUserAccountID : CONST_1['default'].DEFAULT_NUMBER_ID,
    }).map(function (_a) {
        var _b;
        var displayName = _a.displayName,
            login = _a.login;
        return (_b = displayName !== null && displayName !== void 0 ? displayName : login) !== null && _b !== void 0 ? _b : 'Unknown Submitter';
    });
    return Localize_1.translateLocal('workspaceActions.removedFromApprovalWorkflow', {submittersNames: submittersNames, count: submittersNames.length});
}
exports.getRemovedFromApprovalChainMessage = getRemovedFromApprovalChainMessage;
function getDemotedFromWorkspaceMessage(reportAction) {
    var _a;
    var originalMessage = getOriginalMessage(reportAction);
    var policyName =
        (_a = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.policyName) !== null && _a !== void 0
            ? _a
            : Localize_1.translateLocal('workspace.common.workspace');
    var oldRole = Localize_1.translateLocal('workspace.common.roleName', {role: originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.oldRole}).toLowerCase();
    return Localize_1.translateLocal('workspaceActions.demotedFromWorkspace', {policyName: policyName, oldRole: oldRole});
}
exports.getDemotedFromWorkspaceMessage = getDemotedFromWorkspaceMessage;
function isCardIssuedAction(reportAction) {
    return isActionOfType(
        reportAction,
        CONST_1['default'].REPORT.ACTIONS.TYPE.CARD_ISSUED,
        CONST_1['default'].REPORT.ACTIONS.TYPE.CARD_ISSUED_VIRTUAL,
        CONST_1['default'].REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS,
        CONST_1['default'].REPORT.ACTIONS.TYPE.CARD_ASSIGNED,
    );
}
exports.isCardIssuedAction = isCardIssuedAction;
function shouldShowAddMissingDetails(actionName, card) {
    var missingDetails =
        !(privatePersonalDetails === null || privatePersonalDetails === void 0 ? void 0 : privatePersonalDetails.legalFirstName) ||
        !(privatePersonalDetails === null || privatePersonalDetails === void 0 ? void 0 : privatePersonalDetails.legalLastName) ||
        !(privatePersonalDetails === null || privatePersonalDetails === void 0 ? void 0 : privatePersonalDetails.dob) ||
        !(privatePersonalDetails === null || privatePersonalDetails === void 0 ? void 0 : privatePersonalDetails.phoneNumber) ||
        EmptyObject_1.isEmptyObject(privatePersonalDetails === null || privatePersonalDetails === void 0 ? void 0 : privatePersonalDetails.addresses) ||
        privatePersonalDetails.addresses.length === 0;
    return (
        actionName === CONST_1['default'].REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS &&
        ((card === null || card === void 0 ? void 0 : card.state) === CONST_1['default'].EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED || missingDetails)
    );
}
exports.shouldShowAddMissingDetails = shouldShowAddMissingDetails;
function getCardIssuedMessage(_a) {
    var _b, _c;
    var reportAction = _a.reportAction,
        _d = _a.shouldRenderHTML,
        shouldRenderHTML = _d === void 0 ? false : _d,
        _e = _a.policyID,
        policyID = _e === void 0 ? '-1' : _e,
        card = _a.card;
    var cardIssuedActionOriginalMessage = isActionOfType(
        reportAction,
        CONST_1['default'].REPORT.ACTIONS.TYPE.CARD_ISSUED,
        CONST_1['default'].REPORT.ACTIONS.TYPE.CARD_ISSUED_VIRTUAL,
        CONST_1['default'].REPORT.ACTIONS.TYPE.CARD_ASSIGNED,
        CONST_1['default'].REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS,
    )
        ? getOriginalMessage(reportAction)
        : undefined;
    var assigneeAccountID =
        (_b = cardIssuedActionOriginalMessage === null || cardIssuedActionOriginalMessage === void 0 ? void 0 : cardIssuedActionOriginalMessage.assigneeAccountID) !== null && _b !== void 0
            ? _b
            : CONST_1['default'].DEFAULT_NUMBER_ID;
    var cardID =
        (_c = cardIssuedActionOriginalMessage === null || cardIssuedActionOriginalMessage === void 0 ? void 0 : cardIssuedActionOriginalMessage.cardID) !== null && _c !== void 0
            ? _c
            : CONST_1['default'].DEFAULT_NUMBER_ID;
    var isPolicyAdmin = PolicyUtils_1.isPolicyAdmin(PolicyUtils_1.getPolicy(policyID));
    var assignee = shouldRenderHTML ? '<mention-user accountID="' + assigneeAccountID + '"/>' : Parser_1['default'].htmlToText('<mention-user accountID="' + assigneeAccountID + '"/>');
    var navigateRoute = isPolicyAdmin
        ? ROUTES_1['default'].EXPENSIFY_CARD_DETAILS.getRoute(policyID, String(cardID))
        : ROUTES_1['default'].SETTINGS_DOMAINCARD_DETAIL.getRoute(String(cardID));
    var expensifyCardLink =
        shouldRenderHTML && !!card
            ? "<a href='" + environmentURL + '/' + navigateRoute + "'>" + Localize_1.translateLocal('cardPage.expensifyCard') + '</a>'
            : Localize_1.translateLocal('cardPage.expensifyCard');
    var companyCardLink = shouldRenderHTML
        ? "<a href='" + environmentURL + '/' + ROUTES_1['default'].SETTINGS_WALLET + "'>" + Localize_1.translateLocal('workspace.companyCards.companyCard') + '</a>'
        : Localize_1.translateLocal('workspace.companyCards.companyCard');
    var isAssigneeCurrentUser = currentUserAccountID === assigneeAccountID;
    var shouldShowAddMissingDetailsMessage = !isAssigneeCurrentUser || shouldShowAddMissingDetails(reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName, card);
    switch (reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) {
        case CONST_1['default'].REPORT.ACTIONS.TYPE.CARD_ISSUED:
            return Localize_1.translateLocal('workspace.expensifyCard.issuedCard', {assignee: assignee});
        case CONST_1['default'].REPORT.ACTIONS.TYPE.CARD_ISSUED_VIRTUAL:
            return Localize_1.translateLocal('workspace.expensifyCard.issuedCardVirtual', {assignee: assignee, link: expensifyCardLink});
        case CONST_1['default'].REPORT.ACTIONS.TYPE.CARD_ASSIGNED:
            return Localize_1.translateLocal('workspace.companyCards.assignedCard', {assignee: assignee, link: companyCardLink});
        case CONST_1['default'].REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS:
            return Localize_1.translateLocal('workspace.expensifyCard.' + (shouldShowAddMissingDetailsMessage ? 'issuedCardNoShippingDetails' : 'addedShippingDetails'), {
                assignee: assignee,
            });
        default:
            return '';
    }
}
exports.getCardIssuedMessage = getCardIssuedMessage;
function getReportActionsLength() {
    return Object.keys(allReportActions !== null && allReportActions !== void 0 ? allReportActions : {}).length;
}
exports.getReportActionsLength = getReportActionsLength;
function getReportActions(report) {
    return allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions['' + ONYXKEYS_1['default'].COLLECTION.REPORT_ACTIONS + report.reportID];
}
exports.getReportActions = getReportActions;
/**
 * @private
 */
function wasActionCreatedWhileOffline(action, isOffline, lastOfflineAt, lastOnlineAt, locale) {
    // The user has never gone offline or never come back online
    if (!lastOfflineAt || !lastOnlineAt) {
        return false;
    }
    var actionCreatedAt = DateUtils_1['default'].getLocalDateFromDatetime(locale, action.created);
    // The action was created before the user went offline.
    if (actionCreatedAt <= lastOfflineAt) {
        return false;
    }
    // The action was created while the user was offline.
    if (isOffline || actionCreatedAt < lastOnlineAt) {
        return true;
    }
    // The action was created after the user went back online.
    return false;
}
/**
 * Whether a message is NOT from the active user, and it was received while the user was offline.
 */
function wasMessageReceivedWhileOffline(action, isOffline, lastOfflineAt, lastOnlineAt, locale) {
    var wasByCurrentUser = wasActionTakenByCurrentUser(action);
    var wasCreatedOffline = wasActionCreatedWhileOffline(action, isOffline, lastOfflineAt, lastOnlineAt, locale);
    return !wasByCurrentUser && wasCreatedOffline && !(action.pendingAction === CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.ADD || action.isOptimisticAction);
}
exports.wasMessageReceivedWhileOffline = wasMessageReceivedWhileOffline;
