"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
exports.isIOUActionMatchingTransactionList = void 0;
exports.doesReportHaveVisibleActions = doesReportHaveVisibleActions;
exports.extractLinksFromMessageHtml = extractLinksFromMessageHtml;
exports.formatLastMessageText = formatLastMessageText;
exports.isReportActionUnread = isReportActionUnread;
exports.getHtmlWithAttachmentID = getHtmlWithAttachmentID;
exports.getActionableMentionWhisperMessage = getActionableMentionWhisperMessage;
exports.getAllReportActions = getAllReportActions;
exports.getCombinedReportActions = getCombinedReportActions;
exports.getDismissedViolationMessageText = getDismissedViolationMessageText;
exports.getFirstVisibleReportActionID = getFirstVisibleReportActionID;
exports.getIOUActionForReportID = getIOUActionForReportID;
exports.getIOUActionForTransactionID = getIOUActionForTransactionID;
exports.getIOUReportIDFromReportActionPreview = getIOUReportIDFromReportActionPreview;
exports.getLastClosedReportAction = getLastClosedReportAction;
exports.getLastVisibleAction = getLastVisibleAction;
exports.getLastVisibleMessage = getLastVisibleMessage;
exports.getLatestReportActionFromOnyxData = getLatestReportActionFromOnyxData;
exports.getLinkedTransactionID = getLinkedTransactionID;
exports.getMemberChangeMessageFragment = getMemberChangeMessageFragment;
exports.getUpdateRoomDescriptionFragment = getUpdateRoomDescriptionFragment;
exports.getReportActionMessageFragments = getReportActionMessageFragments;
exports.getMessageOfOldDotReportAction = getMessageOfOldDotReportAction;
exports.getMostRecentIOURequestActionID = getMostRecentIOURequestActionID;
exports.getNumberOfMoneyRequests = getNumberOfMoneyRequests;
exports.getOneTransactionThreadReportID = getOneTransactionThreadReportID;
exports.getOriginalMessage = getOriginalMessage;
exports.getAddedApprovalRuleMessage = getAddedApprovalRuleMessage;
exports.getDeletedApprovalRuleMessage = getDeletedApprovalRuleMessage;
exports.getUpdatedApprovalRuleMessage = getUpdatedApprovalRuleMessage;
exports.getRemovedFromApprovalChainMessage = getRemovedFromApprovalChainMessage;
exports.getDemotedFromWorkspaceMessage = getDemotedFromWorkspaceMessage;
exports.getReportAction = getReportAction;
exports.getReportActionHtml = getReportActionHtml;
exports.getReportActionMessage = getReportActionMessage;
exports.getReportActionMessageText = getReportActionMessageText;
exports.getReportActionText = getReportActionText;
exports.getReportPreviewAction = getReportPreviewAction;
exports.getSortedReportActions = getSortedReportActions;
exports.getSortedReportActionsForDisplay = getSortedReportActionsForDisplay;
exports.getTextFromHtml = getTextFromHtml;
exports.getTrackExpenseActionableWhisper = getTrackExpenseActionableWhisper;
exports.getWhisperedTo = getWhisperedTo;
exports.hasRequestFromCurrentAccount = hasRequestFromCurrentAccount;
exports.isActionOfType = isActionOfType;
exports.isActionableWhisper = isActionableWhisper;
exports.isActionableJoinRequest = isActionableJoinRequest;
exports.isActionableJoinRequestPending = isActionableJoinRequestPending;
exports.isActionableMentionWhisper = isActionableMentionWhisper;
exports.isActionableReportMentionWhisper = isActionableReportMentionWhisper;
exports.isActionableTrackExpense = isActionableTrackExpense;
exports.isExpenseChatWelcomeWhisper = isExpenseChatWelcomeWhisper;
exports.isConciergeCategoryOptions = isConciergeCategoryOptions;
exports.isResolvedConciergeCategoryOptions = isResolvedConciergeCategoryOptions;
exports.isAddCommentAction = isAddCommentAction;
exports.isApprovedOrSubmittedReportAction = isApprovedOrSubmittedReportAction;
exports.isIOURequestReportAction = isIOURequestReportAction;
exports.isChronosOOOListAction = isChronosOOOListAction;
exports.isClosedAction = isClosedAction;
exports.isConsecutiveActionMadeByPreviousActor = isConsecutiveActionMadeByPreviousActor;
exports.isConsecutiveChronosAutomaticTimerAction = isConsecutiveChronosAutomaticTimerAction;
exports.hasNextActionMadeBySameActor = hasNextActionMadeBySameActor;
exports.isCreatedAction = isCreatedAction;
exports.isCreatedTaskReportAction = isCreatedTaskReportAction;
exports.isCurrentActionUnread = isCurrentActionUnread;
exports.isDeletedAction = isDeletedAction;
exports.isDeletedParentAction = isDeletedParentAction;
exports.isLinkedTransactionHeld = isLinkedTransactionHeld;
exports.isMemberChangeAction = isMemberChangeAction;
exports.isExportIntegrationAction = isExportIntegrationAction;
exports.isIntegrationMessageAction = isIntegrationMessageAction;
exports.isMessageDeleted = isMessageDeleted;
exports.useTableReportViewActionRenderConditionals = useTableReportViewActionRenderConditionals;
exports.isModifiedExpenseAction = isModifiedExpenseAction;
exports.isMovedTransactionAction = isMovedTransactionAction;
exports.isMoneyRequestAction = isMoneyRequestAction;
exports.isNotifiableReportAction = isNotifiableReportAction;
exports.isOldDotReportAction = isOldDotReportAction;
exports.isPayAction = isPayAction;
exports.isPendingRemove = isPendingRemove;
exports.isPolicyChangeLogAction = isPolicyChangeLogAction;
exports.isReimbursementCanceledAction = isReimbursementCanceledAction;
exports.isReimbursementDeQueuedAction = isReimbursementDeQueuedAction;
exports.isReimbursementDeQueuedOrCanceledAction = isReimbursementDeQueuedOrCanceledAction;
exports.isReimbursementQueuedAction = isReimbursementQueuedAction;
exports.isRenamedAction = isRenamedAction;
exports.isReportActionAttachment = isReportActionAttachment;
exports.isReportActionDeprecated = isReportActionDeprecated;
exports.isReportPreviewAction = isReportPreviewAction;
exports.isReversedTransaction = isReversedTransaction;
exports.getMentionedAccountIDsFromAction = getMentionedAccountIDsFromAction;
exports.isRoomChangeLogAction = isRoomChangeLogAction;
exports.isSentMoneyReportAction = isSentMoneyReportAction;
exports.isSplitBillAction = isSplitBillAction;
exports.isTaskAction = isTaskAction;
exports.isThreadParentMessage = isThreadParentMessage;
exports.isTrackExpenseAction = isTrackExpenseAction;
exports.isTransactionThread = isTransactionThread;
exports.isTripPreview = isTripPreview;
exports.isWhisperAction = isWhisperAction;
exports.isSubmittedAction = isSubmittedAction;
exports.isSubmittedAndClosedAction = isSubmittedAndClosedAction;
exports.isMarkAsClosedAction = isMarkAsClosedAction;
exports.isApprovedAction = isApprovedAction;
exports.isUnapprovedAction = isUnapprovedAction;
exports.isForwardedAction = isForwardedAction;
exports.isWhisperActionTargetedToOthers = isWhisperActionTargetedToOthers;
exports.isTagModificationAction = isTagModificationAction;
exports.isResolvedActionableWhisper = isResolvedActionableWhisper;
exports.shouldHideNewMarker = shouldHideNewMarker;
exports.shouldReportActionBeVisible = shouldReportActionBeVisible;
exports.shouldReportActionBeVisibleAsLastAction = shouldReportActionBeVisibleAsLastAction;
exports.wasActionTakenByCurrentUser = wasActionTakenByCurrentUser;
exports.isInviteOrRemovedAction = isInviteOrRemovedAction;
exports.isActionableAddPaymentCard = isActionableAddPaymentCard;
exports.getExportIntegrationActionFragments = getExportIntegrationActionFragments;
exports.getExportIntegrationLastMessageText = getExportIntegrationLastMessageText;
exports.getExportIntegrationMessageHTML = getExportIntegrationMessageHTML;
exports.getUpdateRoomDescriptionMessage = getUpdateRoomDescriptionMessage;
exports.didMessageMentionCurrentUser = didMessageMentionCurrentUser;
exports.getPolicyChangeLogAddEmployeeMessage = getPolicyChangeLogAddEmployeeMessage;
exports.getPolicyChangeLogUpdateEmployee = getPolicyChangeLogUpdateEmployee;
exports.getPolicyChangeLogDeleteMemberMessage = getPolicyChangeLogDeleteMemberMessage;
exports.getPolicyChangeLogEmployeeLeftMessage = getPolicyChangeLogEmployeeLeftMessage;
exports.getRenamedAction = getRenamedAction;
exports.isCardIssuedAction = isCardIssuedAction;
exports.getCardIssuedMessage = getCardIssuedMessage;
exports.getRemovedConnectionMessage = getRemovedConnectionMessage;
exports.getActionableJoinRequestPendingReportAction = getActionableJoinRequestPendingReportAction;
exports.getReportActionsLength = getReportActionsLength;
exports.getFilteredReportActionsForReportView = getFilteredReportActionsForReportView;
exports.wasMessageReceivedWhileOffline = wasMessageReceivedWhileOffline;
exports.shouldShowAddMissingDetails = shouldShowAddMissingDetails;
exports.getJoinRequestMessage = getJoinRequestMessage;
exports.getTravelUpdateMessage = getTravelUpdateMessage;
exports.getWorkspaceCategoryUpdateMessage = getWorkspaceCategoryUpdateMessage;
exports.getWorkspaceUpdateFieldMessage = getWorkspaceUpdateFieldMessage;
exports.getWorkspaceCurrencyUpdateMessage = getWorkspaceCurrencyUpdateMessage;
exports.getWorkspaceFrequencyUpdateMessage = getWorkspaceFrequencyUpdateMessage;
exports.getPolicyChangeLogMaxExpenseAmountNoReceiptMessage = getPolicyChangeLogMaxExpenseAmountNoReceiptMessage;
exports.getPolicyChangeLogMaxExpenseAmountMessage = getPolicyChangeLogMaxExpenseAmountMessage;
exports.getPolicyChangeLogDefaultBillableMessage = getPolicyChangeLogDefaultBillableMessage;
exports.getPolicyChangeLogDefaultTitleEnforcedMessage = getPolicyChangeLogDefaultTitleEnforcedMessage;
exports.getWorkspaceDescriptionUpdatedMessage = getWorkspaceDescriptionUpdatedMessage;
exports.getWorkspaceReportFieldAddMessage = getWorkspaceReportFieldAddMessage;
exports.getWorkspaceCustomUnitRateAddedMessage = getWorkspaceCustomUnitRateAddedMessage;
exports.getSendMoneyFlowOneTransactionThreadID = getSendMoneyFlowOneTransactionThreadID;
exports.getWorkspaceTagUpdateMessage = getWorkspaceTagUpdateMessage;
exports.getWorkspaceReportFieldUpdateMessage = getWorkspaceReportFieldUpdateMessage;
exports.getWorkspaceReportFieldDeleteMessage = getWorkspaceReportFieldDeleteMessage;
exports.getUpdatedAuditRateMessage = getUpdatedAuditRateMessage;
exports.getUpdatedManualApprovalThresholdMessage = getUpdatedManualApprovalThresholdMessage;
exports.getWorkspaceCustomUnitRateDeletedMessage = getWorkspaceCustomUnitRateDeletedMessage;
exports.getAddedConnectionMessage = getAddedConnectionMessage;
exports.getWorkspaceCustomUnitRateUpdatedMessage = getWorkspaceCustomUnitRateUpdatedMessage;
exports.getTagListNameUpdatedMessage = getTagListNameUpdatedMessage;
exports.getWorkspaceCustomUnitUpdatedMessage = getWorkspaceCustomUnitUpdatedMessage;
exports.getReportActions = getReportActions;
exports.getReopenedMessage = getReopenedMessage;
exports.getLeaveRoomMessage = getLeaveRoomMessage;
exports.getRetractedMessage = getRetractedMessage;
exports.getReportActionFromExpensifyCard = getReportActionFromExpensifyCard;
exports.isReopenedAction = isReopenedAction;
exports.getIntegrationSyncFailedMessage = getIntegrationSyncFailedMessage;
exports.getReceiptScanFailedMessage = getReceiptScanFailedMessage;
var date_fns_1 = require("date-fns");
var expensify_common_1 = require("expensify-common");
var clone_1 = require("lodash/clone");
var findLast_1 = require("lodash/findLast");
var isEmpty_1 = require("lodash/isEmpty");
var react_native_onyx_1 = require("react-native-onyx");
var usePrevious_1 = require("@hooks/usePrevious");
var CONST_1 = require("@src/CONST");
var IntlStore_1 = require("@src/languages/IntlStore");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var CurrencyUtils_1 = require("./CurrencyUtils");
var DateUtils_1 = require("./DateUtils");
var Environment_1 = require("./Environment/Environment");
var getBase62ReportID_1 = require("./getBase62ReportID");
var isReportMessageAttachment_1 = require("./isReportMessageAttachment");
var LocaleDigitUtils_1 = require("./LocaleDigitUtils");
var LocalePhoneNumber_1 = require("./LocalePhoneNumber");
var Localize_1 = require("./Localize");
var Log_1 = require("./Log");
var Parser_1 = require("./Parser");
var PersonalDetailsUtils_1 = require("./PersonalDetailsUtils");
var PolicyUtils_1 = require("./PolicyUtils");
var StringUtils_1 = require("./StringUtils");
var TransactionUtils_1 = require("./TransactionUtils");
var WorkspaceReportFieldUtils_1 = require("./WorkspaceReportFieldUtils");
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
var isNetworkOffline = false;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NETWORK,
    callback: function (val) { var _a; return (isNetworkOffline = (_a = val === null || val === void 0 ? void 0 : val.isOffline) !== null && _a !== void 0 ? _a : false); },
});
var currentUserAccountID;
var currentEmail = '';
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.SESSION,
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
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.PRIVATE_PERSONAL_DETAILS,
    callback: function (personalDetails) {
        privatePersonalDetails = personalDetails;
    },
});
var environmentURL;
(0, Environment_1.getEnvironmentURL)().then(function (url) { return (environmentURL = url); });
/*
 * Url to the Xero non reimbursable expenses list
 */
var XERO_NON_REIMBURSABLE_EXPENSES_URL = 'https://go.xero.com/Bank/BankAccounts.aspx';
/*
 * Url to the NetSuite global search, which should be suffixed with the reportID.
 */
var NETSUITE_NON_REIMBURSABLE_EXPENSES_URL_PREFIX = 'https://system.netsuite.com/app/common/search/ubersearchresults.nl?quicksearch=T&searchtype=Uber&frame=be&Uber_NAMEtype=KEYWORDSTARTSWITH&Uber_NAME=';
/*
 * Url prefix to any Salesforce transaction or transaction list.
 */
var SALESFORCE_EXPENSES_URL_PREFIX = 'https://login.salesforce.com/';
/*
 * Url to the QBO expenses list
 */
var QBO_EXPENSES_URL = 'https://qbo.intuit.com/app/expenses';
var POLICY_CHANGE_LOG_ARRAY = new Set(Object.values(CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG));
var ROOM_CHANGE_LOG_ARRAY = new Set(Object.values(CONST_1.default.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG));
var MEMBER_CHANGE_ARRAY = new Set([
    CONST_1.default.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM,
    CONST_1.default.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.REMOVE_FROM_ROOM,
    CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.INVITE_TO_ROOM,
    CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.REMOVE_FROM_ROOM,
    CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.LEAVE_POLICY,
]);
function isCreatedAction(reportAction) {
    return (reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.CREATED;
}
function isDeletedAction(reportAction) {
    var _a, _b, _c;
    if (isInviteOrRemovedAction(reportAction)) {
        return false;
    }
    var message = (_a = reportAction === null || reportAction === void 0 ? void 0 : reportAction.message) !== null && _a !== void 0 ? _a : [];
    if (!Array.isArray(message)) {
        return (message === null || message === void 0 ? void 0 : message.html) === '' || !!(message === null || message === void 0 ? void 0 : message.deleted);
    }
    var originalMessage = getOriginalMessage(reportAction);
    // A legacy deleted comment has either an empty array or an object with html field with empty string as value
    var isLegacyDeletedComment = message.length === 0 || ((_b = message.at(0)) === null || _b === void 0 ? void 0 : _b.html) === '';
    return isLegacyDeletedComment || !!((_c = message.at(0)) === null || _c === void 0 ? void 0 : _c.deleted) || (!!originalMessage && 'deleted' in originalMessage && !!(originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.deleted));
}
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
    return html.replace(/<img |<video /g, function (m) { return m.concat("".concat(CONST_1.default.ATTACHMENT_ID_ATTRIBUTE, "=\"").concat(reportActionID, "_").concat(++attachmentID, "\" ")); });
}
function getReportActionMessage(reportAction) {
    return Array.isArray(reportAction === null || reportAction === void 0 ? void 0 : reportAction.message) ? reportAction.message.at(0) : reportAction === null || reportAction === void 0 ? void 0 : reportAction.message;
}
function isDeletedParentAction(reportAction) {
    var _a, _b, _c;
    return ((_b = (_a = getReportActionMessage(reportAction)) === null || _a === void 0 ? void 0 : _a.isDeletedParentAction) !== null && _b !== void 0 ? _b : false) && ((_c = reportAction === null || reportAction === void 0 ? void 0 : reportAction.childVisibleActionCount) !== null && _c !== void 0 ? _c : 0) > 0;
}
function isReversedTransaction(reportAction) {
    var _a, _b, _c;
    return ((_b = (_a = getReportActionMessage(reportAction)) === null || _a === void 0 ? void 0 : _a.isReversedTransaction) !== null && _b !== void 0 ? _b : false) && ((_c = reportAction === null || reportAction === void 0 ? void 0 : reportAction.childVisibleActionCount) !== null && _c !== void 0 ? _c : 0) > 0;
}
function isPendingRemove(reportAction) {
    var _a, _b;
    return ((_b = (_a = getReportActionMessage(reportAction)) === null || _a === void 0 ? void 0 : _a.moderationDecision) === null || _b === void 0 ? void 0 : _b.decision) === CONST_1.default.MODERATION.MODERATOR_DECISION_PENDING_REMOVE;
}
function isMoneyRequestAction(reportAction) {
    return isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.IOU);
}
function isReportPreviewAction(reportAction) {
    return isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.REPORT_PREVIEW);
}
function isSubmittedAction(reportAction) {
    return isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.SUBMITTED);
}
function isSubmittedAndClosedAction(reportAction) {
    return isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED);
}
function isMarkAsClosedAction(reportAction) {
    var _a;
    return isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.CLOSED) && !!((_a = getOriginalMessage(reportAction)) === null || _a === void 0 ? void 0 : _a.amount);
}
function isApprovedAction(reportAction) {
    return isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.APPROVED);
}
function isUnapprovedAction(reportAction) {
    return isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.UNAPPROVED);
}
function isForwardedAction(reportAction) {
    return isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.FORWARDED);
}
function isModifiedExpenseAction(reportAction) {
    return isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE);
}
function isMovedTransactionAction(reportAction) {
    return isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION);
}
function isPolicyChangeLogAction(reportAction) {
    return (reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) ? POLICY_CHANGE_LOG_ARRAY.has(reportAction.actionName) : false;
}
function isChronosOOOListAction(reportAction) {
    return isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.CHRONOS_OOO_LIST);
}
function isAddCommentAction(reportAction) {
    return isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT);
}
function isCreatedTaskReportAction(reportAction) {
    var _a;
    return isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT) && !!((_a = getOriginalMessage(reportAction)) === null || _a === void 0 ? void 0 : _a.taskReportID);
}
function isTripPreview(reportAction) {
    return isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.TRIP_PREVIEW);
}
function isActionOfType(action, actionName) {
    return (action === null || action === void 0 ? void 0 : action.actionName) === actionName;
}
function getOriginalMessage(reportAction) {
    var _a;
    if (!Array.isArray(reportAction === null || reportAction === void 0 ? void 0 : reportAction.message)) {
        // eslint-disable-next-line deprecation/deprecation
        return (_a = reportAction === null || reportAction === void 0 ? void 0 : reportAction.message) !== null && _a !== void 0 ? _a : reportAction === null || reportAction === void 0 ? void 0 : reportAction.originalMessage;
    }
    // eslint-disable-next-line deprecation/deprecation
    return reportAction.originalMessage;
}
function isExportIntegrationAction(reportAction) {
    return (reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION;
}
function isIntegrationMessageAction(reportAction) {
    return (reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.INTEGRATIONS_MESSAGE;
}
function isTravelUpdate(reportAction) {
    return isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.TRAVEL_UPDATE);
}
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
        Log_1.default.info('Original message is not an object for reportAction: ', true, {
            reportActionID: reportAction === null || reportAction === void 0 ? void 0 : reportAction.reportActionID,
            actionName: reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName,
        });
    }
    return [];
}
function isWhisperAction(reportAction) {
    return getWhisperedTo(reportAction).length > 0;
}
/**
 * Checks whether the report action is a whisper targeting someone other than the current user.
 */
function isWhisperActionTargetedToOthers(reportAction) {
    if (!isWhisperAction(reportAction)) {
        return false;
    }
    return !getWhisperedTo(reportAction).includes(currentUserAccountID !== null && currentUserAccountID !== void 0 ? currentUserAccountID : CONST_1.default.DEFAULT_NUMBER_ID);
}
function isReimbursementQueuedAction(reportAction) {
    return isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.REIMBURSEMENT_QUEUED);
}
function isMemberChangeAction(reportAction) {
    return (reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) ? MEMBER_CHANGE_ARRAY.has(reportAction.actionName) : false;
}
function isInviteMemberAction(reportAction) {
    return isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM) || isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.INVITE_TO_ROOM);
}
function isLeavePolicyAction(reportAction) {
    return isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.LEAVE_POLICY);
}
function isReimbursementCanceledAction(reportAction) {
    return isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_CANCELED);
}
function isReimbursementDeQueuedAction(reportAction) {
    return isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DEQUEUED);
}
function isReimbursementDeQueuedOrCanceledAction(reportAction) {
    return isReimbursementDeQueuedAction(reportAction) || isReimbursementCanceledAction(reportAction);
}
function isClosedAction(reportAction) {
    return isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.CLOSED);
}
function isRenamedAction(reportAction) {
    return isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.RENAMED);
}
function isReopenedAction(reportAction) {
    return isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.REOPENED);
}
function isRoomChangeLogAction(reportAction) {
    return (reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) ? ROOM_CHANGE_LOG_ARRAY.has(reportAction.actionName) : false;
}
function isInviteOrRemovedAction(reportAction) {
    return (isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM) ||
        isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.REMOVE_FROM_ROOM) ||
        isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.INVITE_TO_ROOM) ||
        isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.REMOVE_FROM_ROOM));
}
/**
 * Returns whether the comment is a thread parent message/the first message in a thread
 */
function isThreadParentMessage(reportAction, reportID) {
    var _a = reportAction !== null && reportAction !== void 0 ? reportAction : {}, childType = _a.childType, _b = _a.childVisibleActionCount, childVisibleActionCount = _b === void 0 ? 0 : _b, childReportID = _a.childReportID;
    return childType === CONST_1.default.REPORT.TYPE.CHAT && (childVisibleActionCount > 0 || String(childReportID) === reportID);
}
/**
 * Determines if the given report action is sent money report action by checking for 'pay' type and presence of IOUDetails object.
 */
function isSentMoneyReportAction(reportAction) {
    var _a, _b;
    return (isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.IOU) &&
        ((_a = getOriginalMessage(reportAction)) === null || _a === void 0 ? void 0 : _a.type) === CONST_1.default.IOU.REPORT_ACTION_TYPE.PAY &&
        !!((_b = getOriginalMessage(reportAction)) === null || _b === void 0 ? void 0 : _b.IOUDetails));
}
/**
 * Returns whether the thread is a transaction thread, which is any thread with IOU parent
 * report action from requesting money (type - create) or from sending money (type - pay with IOUDetails field)
 */
function isTransactionThread(parentReportAction) {
    if ((0, EmptyObject_1.isEmptyObject)(parentReportAction) || !isMoneyRequestAction(parentReportAction)) {
        return false;
    }
    var originalMessage = getOriginalMessage(parentReportAction);
    return ((originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.type) === CONST_1.default.IOU.REPORT_ACTION_TYPE.CREATE ||
        (originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.type) === CONST_1.default.IOU.REPORT_ACTION_TYPE.TRACK ||
        ((originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.type) === CONST_1.default.IOU.REPORT_ACTION_TYPE.PAY && !!(originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.IOUDetails)));
}
/**
 * Sort an array of reportActions by their created timestamp first, and reportActionID second
 * This gives us a stable order even in the case of multiple reportActions created on the same millisecond
 *
 */
function getSortedReportActions(reportActions, shouldSortInDescendingOrder) {
    if (shouldSortInDescendingOrder === void 0) { shouldSortInDescendingOrder = false; }
    if (!Array.isArray(reportActions)) {
        throw new Error("ReportActionsUtils.getSortedReportActions requires an array, received ".concat(typeof reportActions));
    }
    var invertedMultiplier = shouldSortInDescendingOrder ? -1 : 1;
    var sortedActions = reportActions === null || reportActions === void 0 ? void 0 : reportActions.filter(Boolean).sort(function (first, second) {
        // First sort by action type, ensuring that `CREATED` actions always come first if they have the same or even a later timestamp as another action type
        if ((first.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.CREATED || second.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.CREATED) && first.actionName !== second.actionName) {
            return (first.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.CREATED ? -1 : 1) * invertedMultiplier;
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
        if ((first.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.REPORT_PREVIEW || second.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) && first.actionName !== second.actionName) {
            return (first.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.REPORT_PREVIEW ? 1 : -1) * invertedMultiplier;
        }
        // Then fallback on reportActionID as the final sorting criteria. It is a random number,
        // but using this will ensure that the order of reportActions with the same created time and action type
        // will be consistent across all users and devices
        return (first.reportActionID < second.reportActionID ? -1 : 1) * invertedMultiplier;
    });
    return sortedActions;
}
/**
 * Returns a sorted and filtered list of report actions from a report and it's associated child
 * transaction thread report in order to correctly display reportActions from both reports in the one-transaction report view.
 */
function getCombinedReportActions(reportActions, transactionThreadReportID, transactionThreadReportActions, reportID) {
    var isSentMoneyReport = reportActions.some(function (action) { return isSentMoneyReportAction(action); });
    // We don't want to combine report actions of transaction thread in iou report of send money request because we display the transaction report of send money request as a normal thread
    if ((0, isEmpty_1.default)(transactionThreadReportID) || isSentMoneyReport) {
        return reportActions;
    }
    // Usually, we filter out the created action from the transaction thread report actions, since we already have the parent report's created action in `reportActions`
    // However, in the case of moving track expense, the transaction thread will be created first in a track expense, thus we should keep the CREATED of the transaction thread and filter out CREATED action of the IOU
    // This makes sense because in a combined report action list, whichever CREATED is first need to be retained.
    var transactionThreadCreatedAction = transactionThreadReportActions === null || transactionThreadReportActions === void 0 ? void 0 : transactionThreadReportActions.find(function (action) { return action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.CREATED; });
    var parentReportCreatedAction = reportActions === null || reportActions === void 0 ? void 0 : reportActions.find(function (action) { return action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.CREATED; });
    var filteredTransactionThreadReportActions = transactionThreadReportActions;
    var filteredParentReportActions = reportActions;
    if (transactionThreadCreatedAction && parentReportCreatedAction && transactionThreadCreatedAction.created > parentReportCreatedAction.created) {
        filteredTransactionThreadReportActions = transactionThreadReportActions === null || transactionThreadReportActions === void 0 ? void 0 : transactionThreadReportActions.filter(function (action) { return action.actionName !== CONST_1.default.REPORT.ACTIONS.TYPE.CREATED; });
    }
    else if (transactionThreadCreatedAction) {
        filteredParentReportActions = reportActions === null || reportActions === void 0 ? void 0 : reportActions.filter(function (action) { return action.actionName !== CONST_1.default.REPORT.ACTIONS.TYPE.CREATED; });
    }
    var report = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID)];
    var isSelfDM = (report === null || report === void 0 ? void 0 : report.chatType) === CONST_1.default.REPORT.CHAT_TYPE.SELF_DM;
    // Filter out request and send money request actions because we don't want to show any preview actions for one transaction reports
    var filteredReportActions = __spreadArray(__spreadArray([], filteredParentReportActions, true), filteredTransactionThreadReportActions, true).filter(function (action) {
        var _a, _b;
        if (!isMoneyRequestAction(action)) {
            return true;
        }
        var actionType = (_b = (_a = getOriginalMessage(action)) === null || _a === void 0 ? void 0 : _a.type) !== null && _b !== void 0 ? _b : '';
        if (isSelfDM) {
            return actionType !== CONST_1.default.IOU.REPORT_ACTION_TYPE.CREATE;
        }
        return actionType !== CONST_1.default.IOU.REPORT_ACTION_TYPE.CREATE && actionType !== CONST_1.default.IOU.REPORT_ACTION_TYPE.TRACK;
    });
    return getSortedReportActions(filteredReportActions, true);
}
var iouRequestTypes = [CONST_1.default.IOU.REPORT_ACTION_TYPE.CREATE, CONST_1.default.IOU.REPORT_ACTION_TYPE.SPLIT, CONST_1.default.IOU.REPORT_ACTION_TYPE.TRACK];
// Get all IOU report actions for the report.
var iouRequestTypesSet = new Set(__spreadArray(__spreadArray([], iouRequestTypes, true), [CONST_1.default.IOU.REPORT_ACTION_TYPE.PAY], false));
/**
 * Finds most recent IOU request action ID.
 */
function getMostRecentIOURequestActionID(reportActions) {
    var _a, _b, _c;
    if (!Array.isArray(reportActions)) {
        return null;
    }
    var iouRequestActions = (_a = reportActions === null || reportActions === void 0 ? void 0 : reportActions.filter(function (action) {
        var _a;
        if (!isActionOfType(action, CONST_1.default.REPORT.ACTIONS.TYPE.IOU)) {
            return false;
        }
        var actionType = (_a = getOriginalMessage(action)) === null || _a === void 0 ? void 0 : _a.type;
        if (!actionType) {
            return false;
        }
        return iouRequestTypes.includes(actionType);
    })) !== null && _a !== void 0 ? _a : [];
    if (iouRequestActions.length === 0) {
        return null;
    }
    var sortedReportActions = getSortedReportActions(iouRequestActions);
    return (_c = (_b = sortedReportActions.at(-1)) === null || _b === void 0 ? void 0 : _b.reportActionID) !== null && _c !== void 0 ? _c : null;
}
/**
 * Returns array of links inside a given report action
 */
function extractLinksFromMessageHtml(reportAction) {
    var htmlContent = getReportActionHtml(reportAction);
    var regex = CONST_1.default.REGEX_LINK_IN_ANCHOR;
    if (!htmlContent) {
        return [];
    }
    return __spreadArray([], htmlContent.matchAll(regex), true).map(function (match) { return match[1]; });
}
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
        if (isNetworkOffline || ((_a = reportActions.at(i)) === null || _a === void 0 ? void 0 : _a.pendingAction) !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
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
    for (var i = actionIndex - 1; i >= 0; i--) {
        // Find the next non-pending deletion report action, as the pending delete action means that it is not displayed in the UI, but still is in the report actions list.
        // If we are offline, all actions are pending but shown in the UI, so we take the previous action, even if it is a delete.
        if (isNetworkOffline || ((_a = reportActions.at(i)) === null || _a === void 0 ? void 0 : _a.pendingAction) !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            return reportActions.at(i);
        }
    }
    return undefined;
}
/**
 * Returns true when the previous report action (before actionIndex) is made by the same actor who performed the action at actionIndex.
 * Also checks to ensure that the comment is not too old to be shown as a grouped comment.
 *
 * @param reportActions - report actions ordered from latest
 * @param actionIndex - index of the comment item in state to check
 */
function isConsecutiveActionMadeByPreviousActor(reportActions, actionIndex) {
    var previousAction = findPreviousAction(reportActions, actionIndex);
    var currentAction = reportActions.at(actionIndex);
    return canActionsBeGrouped(currentAction, previousAction);
}
/**
 * Returns true when the next report action (after actionIndex) is made by the same actor who performed the action at actionIndex.
 * Also checks to ensure that the comment is not too old to be shown as a grouped comment.
 *
 * @param reportActions - report actions ordered from oldest
 * @param actionIndex - index of the comment item in state to check
 */
function hasNextActionMadeBySameActor(reportActions, actionIndex) {
    var currentAction = reportActions.at(actionIndex);
    var nextAction = findNextAction(reportActions, actionIndex);
    if (actionIndex === 0) {
        return false;
    }
    return canActionsBeGrouped(currentAction, nextAction);
}
/**
 * Combines the logic for grouping chat messages isConsecutiveActionMadeByPreviousActor and hasNextActionMadeBySameActor.
 * Returns true when messages are made by the same actor and not separated by more than 5 minutes.
 *
 * @param currentAction - Chronologically - latest action.
 * @param adjacentAction - Chronologically - previous action. Named adjacentAction to avoid confusion as isConsecutiveActionMadeByPreviousActor and hasNextActionMadeBySameActor take action lists that are in opposite orders.
 */
function canActionsBeGrouped(currentAction, adjacentAction) {
    // It's OK for there to be no previous action, and in that case, false will be returned
    // so that the comment isn't grouped
    if (!currentAction || !adjacentAction) {
        return false;
    }
    // Comments are only grouped if they happen within 5 minutes of each adjacent
    if (new Date(currentAction === null || currentAction === void 0 ? void 0 : currentAction.created).getTime() - new Date(adjacentAction.created).getTime() > CONST_1.default.REPORT.ACTIONS.MAX_GROUPING_TIME) {
        return false;
    }
    // Do not group if adjacent action was a created action
    if (adjacentAction.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.CREATED) {
        return false;
    }
    // Do not group if adjacent or current action was a renamed action
    if (adjacentAction.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.RENAMED || currentAction.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.RENAMED) {
        return false;
    }
    // Do not group if the delegate account ID is different
    if (adjacentAction.delegateAccountID !== currentAction.delegateAccountID) {
        return false;
    }
    // Do not group if one of previous / adjacent action is report preview and another one is not report preview
    if ((isReportPreviewAction(adjacentAction) && !isReportPreviewAction(currentAction)) || (isReportPreviewAction(currentAction) && !isReportPreviewAction(adjacentAction))) {
        return false;
    }
    if (isSubmittedAction(currentAction)) {
        var currentActionAdminAccountID = currentAction.adminAccountID;
        return typeof currentActionAdminAccountID === 'number'
            ? currentActionAdminAccountID === adjacentAction.actorAccountID
            : currentAction.actorAccountID === adjacentAction.actorAccountID;
    }
    if (isSubmittedAction(adjacentAction)) {
        return typeof adjacentAction.adminAccountID === 'number'
            ? currentAction.actorAccountID === adjacentAction.adminAccountID
            : currentAction.actorAccountID === adjacentAction.actorAccountID;
    }
    return currentAction.actorAccountID === adjacentAction.actorAccountID;
}
function isChronosAutomaticTimerAction(reportAction, isChronosReport) {
    var isAutomaticStartTimerAction = function () { return /start(?:ed|ing)?(?:\snow)?/i.test(getReportActionText(reportAction)); };
    var isAutomaticStopTimerAction = function () { return /stop(?:ped|ping)?(?:\snow)?/i.test(getReportActionText(reportAction)); };
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
        Log_1.default.info('Front-end filtered out reportAction keyed by sequenceNumber!', false, reportAction);
        return true;
    }
    var deprecatedOldDotReportActions = [
        CONST_1.default.REPORT.ACTIONS.TYPE.DELETED_ACCOUNT,
        CONST_1.default.REPORT.ACTIONS.TYPE.REIMBURSEMENT_REQUESTED,
        CONST_1.default.REPORT.ACTIONS.TYPE.REIMBURSEMENT_SETUP_REQUESTED,
        CONST_1.default.REPORT.ACTIONS.TYPE.DONATION,
        CONST_1.default.REPORT.ACTIONS.TYPE.REIMBURSED,
    ];
    if (deprecatedOldDotReportActions.includes(reportAction.actionName)) {
        return true;
    }
    return false;
}
/**
 * Checks if a given report action corresponds to an actionable mention whisper.
 * @param reportAction
 */
function isActionableMentionWhisper(reportAction) {
    return isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.ACTIONABLE_MENTION_WHISPER);
}
/**
 * Checks if a given report action corresponds to an actionable report mention whisper.
 * @param reportAction
 */
function isActionableReportMentionWhisper(reportAction) {
    return isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.ACTIONABLE_REPORT_MENTION_WHISPER);
}
/**
 * Checks if a given report action corresponds to a welcome whisper.
 * @param reportAction
 */
function isExpenseChatWelcomeWhisper(reportAction) {
    return isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_EXPENSE_CHAT_WELCOME_WHISPER);
}
/**
 * Checks whether an action is actionable track expense.
 */
function isActionableTrackExpense(reportAction) {
    return isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.ACTIONABLE_TRACK_EXPENSE_WHISPER);
}
function isActionableWhisper(reportAction) {
    return isActionableMentionWhisper(reportAction) || isActionableTrackExpense(reportAction) || isActionableReportMentionWhisper(reportAction);
}
var _a = CONST_1.default.REPORT.ACTIONS.TYPE, policyChangelogTypes = _a.POLICY_CHANGE_LOG, roomChangeLogTypes = _a.ROOM_CHANGE_LOG, otherActionTypes = __rest(_a, ["POLICY_CHANGE_LOG", "ROOM_CHANGE_LOG"]);
var supportedActionTypes = __spreadArray(__spreadArray(__spreadArray([], Object.values(otherActionTypes), true), Object.values(policyChangelogTypes), true), Object.values(roomChangeLogTypes), true);
/**
 * Checks whether an action is actionable track expense and resolved.
 *
 */
function isResolvedActionableWhisper(reportAction) {
    var originalMessage = getOriginalMessage(reportAction);
    var resolution = originalMessage && typeof originalMessage === 'object' && 'resolution' in originalMessage ? originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.resolution : null;
    return !!resolution;
}
/**
 * Checks whether an action is concierge category options and resolved.
 */
function isResolvedConciergeCategoryOptions(reportAction) {
    var originalMessage = getOriginalMessage(reportAction);
    var selectedCategory = originalMessage && typeof originalMessage === 'object' && 'selectedCategory' in originalMessage ? originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.selectedCategory : null;
    return !!selectedCategory;
}
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
    if (reportAction.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.CLOSED && !isMarkAsClosedAction(reportAction)) {
        return false;
    }
    // Ignore markedAsReimbursed action here since we're already display message that explains the expense was paid
    // elsewhere in the IOU reportAction
    if (reportAction.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED) {
        return false;
    }
    if (isWhisperActionTargetedToOthers(reportAction)) {
        return false;
    }
    if (isPendingRemove(reportAction) && !reportAction.childVisibleActionCount) {
        return false;
    }
    if ((isActionableReportMentionWhisper(reportAction) || isActionableJoinRequestPendingReportAction(reportAction) || isActionableMentionWhisper(reportAction)) &&
        !canUserPerformWriteAction) {
        return false;
    }
    if (isTripPreview(reportAction) || isTravelUpdate(reportAction)) {
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
/**
 * Checks if the new marker should be hidden for the report action.
 */
function shouldHideNewMarker(reportAction) {
    if (!reportAction) {
        return true;
    }
    return !isNetworkOffline && reportAction.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
}
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
    return (shouldReportActionBeVisible(reportAction, reportAction.reportActionID, canUserPerformWriteAction) &&
        (!(isWhisperAction(reportAction) && !isReportPreviewAction(reportAction) && !isMoneyRequestAction(reportAction)) || isActionableMentionWhisper(reportAction)) &&
        !(isDeletedAction(reportAction) && !isDeletedParentAction(reportAction)));
}
/**
 * For policy change logs, report URLs are generated in the server,
 * which includes a baseURL placeholder that's replaced in the client.
 */
function replaceBaseURLInPolicyChangeLogAction(reportAction) {
    var _a;
    if (!(reportAction === null || reportAction === void 0 ? void 0 : reportAction.message) || !isPolicyChangeLogAction(reportAction)) {
        return reportAction;
    }
    var updatedReportAction = (0, clone_1.default)(reportAction);
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
    if (actionsToMerge === void 0) { actionsToMerge = {}; }
    if (reportActionsParam === void 0) { reportActionsParam = allReportActions; }
    var reportActions = [];
    if (!(0, isEmpty_1.default)(actionsToMerge)) {
        reportActions = Object.values((0, expensify_common_1.fastMerge)((_a = reportActionsParam === null || reportActionsParam === void 0 ? void 0 : reportActionsParam["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID)]) !== null && _a !== void 0 ? _a : {}, actionsToMerge !== null && actionsToMerge !== void 0 ? actionsToMerge : {}, true));
    }
    else {
        reportActions = Object.values((_b = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID)]) !== null && _b !== void 0 ? _b : {});
    }
    var visibleReportActions = reportActions.filter(function (action) { return shouldReportActionBeVisibleAsLastAction(action, canUserPerformWriteAction); });
    var sortedReportActions = getSortedReportActions(visibleReportActions, true);
    if (sortedReportActions.length === 0) {
        return undefined;
    }
    return sortedReportActions.at(0);
}
function formatLastMessageText(lastMessageText) {
    var _a, _b;
    var trimmedMessage = String(lastMessageText).trim();
    // Add support for inline code containing only space characters
    // The message will appear as a blank space in the LHN
    if ((trimmedMessage === '' && ((_a = lastMessageText === null || lastMessageText === void 0 ? void 0 : lastMessageText.length) !== null && _a !== void 0 ? _a : 0) > 0) ||
        (trimmedMessage === '?\u2026' && ((_b = lastMessageText === null || lastMessageText === void 0 ? void 0 : lastMessageText.length) !== null && _b !== void 0 ? _b : 0) > CONST_1.default.REPORT.MIN_LENGTH_LAST_MESSAGE_WITH_ELLIPSIS)) {
        return ' ';
    }
    return StringUtils_1.default.lineBreaksToSpaces(trimmedMessage).substring(0, CONST_1.default.REPORT.LAST_MESSAGE_TEXT_MAX_LENGTH).trim();
}
function getLastVisibleMessage(reportID, canUserPerformWriteAction, actionsToMerge, reportAction) {
    var _a;
    if (actionsToMerge === void 0) { actionsToMerge = {}; }
    if (reportAction === void 0) { reportAction = undefined; }
    var lastVisibleAction = reportAction !== null && reportAction !== void 0 ? reportAction : getLastVisibleAction(reportID, canUserPerformWriteAction, actionsToMerge);
    var message = getReportActionMessage(lastVisibleAction);
    if (message && (0, isReportMessageAttachment_1.isReportMessageAttachment)(message)) {
        return {
            lastMessageText: CONST_1.default.ATTACHMENT_MESSAGE_TEXT,
            lastMessageHtml: CONST_1.default.TRANSLATION_KEYS.ATTACHMENT,
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
/**
 * A helper method to filter out report actions keyed by sequenceNumbers.
 */
function filterOutDeprecatedReportActions(reportActions) {
    return Object.entries(reportActions !== null && reportActions !== void 0 ? reportActions : {})
        .filter(function (_a) {
        var key = _a[0], reportAction = _a[1];
        return !isReportActionDeprecated(reportAction, key);
    })
        .map(function (entry) { return entry[1]; });
}
/**
 * Helper for filtering out Report Actions that are either:
 * - ReportPreview with shouldShow set to false and without a pending action
 * - Money request with parent action deleted
 */
function getFilteredReportActionsForReportView(actions) {
    var isDeletedMoneyRequest = function (action) { return isDeletedParentAction(action) && isMoneyRequestAction(action); };
    var isHiddenReportPreviewWithoutPendingAction = function (action) { return isReportPreviewAction(action) && action.pendingAction === undefined && !action.shouldShow; };
    return actions.filter(function (action) { return !isDeletedMoneyRequest(action) && !isHiddenReportPreviewWithoutPendingAction(action); });
}
/**
 * This method returns the report actions that are ready for display in the ReportActionsView.
 * The report actions need to be sorted by created timestamp first, and reportActionID second
 * to ensure they will always be displayed in the same order (in case multiple actions have the same timestamp).
 * This is all handled with getSortedReportActions() which is used by several other methods to keep the code DRY.
 */
function getSortedReportActionsForDisplay(reportActions, canUserPerformWriteAction, shouldIncludeInvisibleActions) {
    if (shouldIncludeInvisibleActions === void 0) { shouldIncludeInvisibleActions = false; }
    var filteredReportActions = [];
    if (!reportActions) {
        return [];
    }
    if (shouldIncludeInvisibleActions) {
        filteredReportActions = Object.values(reportActions).filter(Boolean);
    }
    else {
        filteredReportActions = Object.entries(reportActions)
            .filter(function (_a) {
            var key = _a[0], reportAction = _a[1];
            return shouldReportActionBeVisible(reportAction, key, canUserPerformWriteAction);
        })
            .map(function (_a) {
            var reportAction = _a[1];
            return reportAction;
        });
    }
    var baseURLAdjustedReportActions = filteredReportActions.map(function (reportAction) { return replaceBaseURLInPolicyChangeLogAction(reportAction); });
    return getSortedReportActions(baseURLAdjustedReportActions, true);
}
/**
 * In some cases, there can be multiple closed report actions in a chat report.
 * This method returns the last closed report action so we can always show the correct archived report reason.
 * Additionally, archived #admins and #announce do not have the closed report action so we will return null if none is found.
 *
 */
function getLastClosedReportAction(reportActions) {
    // If closed report action is not present, return early
    if (!Object.values(reportActions !== null && reportActions !== void 0 ? reportActions : {}).some(function (action) {
        return (action === null || action === void 0 ? void 0 : action.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.CLOSED;
    })) {
        return undefined;
    }
    var filteredReportActions = filterOutDeprecatedReportActions(reportActions);
    var sortedReportActions = getSortedReportActions(filteredReportActions);
    return (0, findLast_1.default)(sortedReportActions, function (action) { return action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.CLOSED; });
}
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
    if (sortedReportActions === void 0) { sortedReportActions = []; }
    if (isOffline === void 0) { isOffline = false; }
    if (!Array.isArray(sortedReportActions)) {
        return '';
    }
    var sortedFilterReportActions = sortedReportActions.filter(function (action) { var _a; return !isDeletedAction(action) || ((_a = action === null || action === void 0 ? void 0 : action.childVisibleActionCount) !== null && _a !== void 0 ? _a : 0) > 0 || isOffline; });
    return sortedFilterReportActions.length > 1 ? (_a = sortedFilterReportActions.at(sortedFilterReportActions.length - 2)) === null || _a === void 0 ? void 0 : _a.reportActionID : undefined;
}
/**
 * @returns The latest report action in the `onyxData` or `null` if one couldn't be found
 */
function getLatestReportActionFromOnyxData(onyxData) {
    var _a, _b;
    var reportActionUpdate = onyxData === null || onyxData === void 0 ? void 0 : onyxData.find(function (onyxUpdate) { return onyxUpdate.key.startsWith(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS); });
    if (!reportActionUpdate) {
        return null;
    }
    var reportActions = Object.values((_a = reportActionUpdate.value) !== null && _a !== void 0 ? _a : {});
    var sortedReportActions = getSortedReportActions(reportActions);
    return (_b = sortedReportActions.at(-1)) !== null && _b !== void 0 ? _b : null;
}
/**
 * Find the transaction associated with this reportAction, if one exists.
 */
function getLinkedTransactionID(reportActionOrID, reportID) {
    var _a, _b;
    var reportAction = typeof reportActionOrID === 'string' ? (_a = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID)]) === null || _a === void 0 ? void 0 : _a[reportActionOrID] : reportActionOrID;
    if (!reportAction || !isMoneyRequestAction(reportAction)) {
        return undefined;
    }
    return (_b = getOriginalMessage(reportAction)) === null || _b === void 0 ? void 0 : _b.IOUTransactionID;
}
function getReportAction(reportID, reportActionID) {
    var _a;
    if (!reportID || !reportActionID) {
        return undefined;
    }
    return (_a = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID)]) === null || _a === void 0 ? void 0 : _a[reportActionID];
}
/**
 * @returns The report preview action or `null` if one couldn't be found
 */
function getReportPreviewAction(chatReportID, iouReportID) {
    var _a;
    if (!chatReportID || !iouReportID) {
        return;
    }
    return Object.values((_a = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(chatReportID)]) !== null && _a !== void 0 ? _a : {}).find(function (reportAction) { var _a; return reportAction && isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) && ((_a = getOriginalMessage(reportAction)) === null || _a === void 0 ? void 0 : _a.linkedReportID) === iouReportID; });
}
/**
 * Get the iouReportID for a given report action.
 */
function getIOUReportIDFromReportActionPreview(reportAction) {
    var _a;
    return isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) ? (_a = getOriginalMessage(reportAction)) === null || _a === void 0 ? void 0 : _a.linkedReportID : undefined;
}
/**
 * A helper method to identify if the message is deleted or not.
 */
function isMessageDeleted(reportAction) {
    var _a, _b;
    return (_b = (_a = getReportActionMessage(reportAction)) === null || _a === void 0 ? void 0 : _a.isDeletedParentAction) !== null && _b !== void 0 ? _b : false;
}
/**
 * Simple hook to check whether the PureReportActionItem should return item based on whether the ReportPreview was recently deleted and the PureReportActionItem has not yet unloaded
 */
function useTableReportViewActionRenderConditionals(_a) {
    var childMoneyRequestCount = _a.childMoneyRequestCount, childVisibleActionCount = _a.childVisibleActionCount, pendingAction = _a.pendingAction, actionName = _a.actionName;
    var previousChildMoneyRequestCount = (0, usePrevious_1.default)(childMoneyRequestCount);
    var isActionAReportPreview = actionName === CONST_1.default.REPORT.ACTIONS.TYPE.REPORT_PREVIEW;
    var isActionInUpdateState = pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE;
    var reportsCount = childMoneyRequestCount;
    var previousReportsCount = previousChildMoneyRequestCount !== null && previousChildMoneyRequestCount !== void 0 ? previousChildMoneyRequestCount : 0;
    var commentsCount = childVisibleActionCount !== null && childVisibleActionCount !== void 0 ? childVisibleActionCount : 0;
    var isEmptyPreviewWithComments = reportsCount === 0 && commentsCount > 0 && previousReportsCount > 0;
    // We only want to remove the item if the ReportPreview has comments but no reports, so we avoid having a PureReportActionItem with no ReportPreview but only comments
    return !(isActionAReportPreview && isActionInUpdateState && isEmptyPreviewWithComments);
}
/**
 * Returns the number of expenses associated with a report preview
 */
function getNumberOfMoneyRequests(reportPreviewAction) {
    var _a;
    return (_a = reportPreviewAction === null || reportPreviewAction === void 0 ? void 0 : reportPreviewAction.childMoneyRequestCount) !== null && _a !== void 0 ? _a : 0;
}
function isSplitBillAction(reportAction) {
    var _a;
    return isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.IOU) && ((_a = getOriginalMessage(reportAction)) === null || _a === void 0 ? void 0 : _a.type) === CONST_1.default.IOU.REPORT_ACTION_TYPE.SPLIT;
}
function isIOURequestReportAction(reportAction) {
    var _a;
    var type = isMoneyRequestAction(reportAction) && ((_a = getOriginalMessage(reportAction)) === null || _a === void 0 ? void 0 : _a.type);
    return !!type && iouRequestTypes.includes(type);
}
function isTrackExpenseAction(reportAction) {
    var _a;
    return isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.IOU) && ((_a = getOriginalMessage(reportAction)) === null || _a === void 0 ? void 0 : _a.type) === CONST_1.default.IOU.REPORT_ACTION_TYPE.TRACK;
}
function isPayAction(reportAction) {
    var _a;
    return isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.IOU) && ((_a = getOriginalMessage(reportAction)) === null || _a === void 0 ? void 0 : _a.type) === CONST_1.default.IOU.REPORT_ACTION_TYPE.PAY;
}
function isTaskAction(reportAction) {
    var reportActionName = reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName;
    return (reportActionName === CONST_1.default.REPORT.ACTIONS.TYPE.TASK_COMPLETED ||
        reportActionName === CONST_1.default.REPORT.ACTIONS.TYPE.TASK_CANCELLED ||
        reportActionName === CONST_1.default.REPORT.ACTIONS.TYPE.TASK_REOPENED ||
        reportActionName === CONST_1.default.REPORT.ACTIONS.TYPE.TASK_EDITED);
}
/**
 * @param actionName - The name of the action
 * @returns - Whether the action is a tag modification action
 * */
function isTagModificationAction(actionName) {
    return (actionName === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_TAG ||
        actionName === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_ENABLED ||
        actionName === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_NAME ||
        actionName === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_TAG ||
        actionName === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_MULTIPLE_TAGS ||
        actionName === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG);
}
/**
 * Used for Send Money flow, which is a special case where we have no IOU create action and only one IOU pay action.
 * In other reports, pay actions do not count as a transactions, but this is an exception to this rule.
 */
function getSendMoneyFlowOneTransactionThreadID(actions, chatReport) {
    var _a, _b;
    if (!chatReport) {
        return undefined;
    }
    var iouActions = Object.values(actions !== null && actions !== void 0 ? actions : {}).filter(isMoneyRequestAction);
    // sendMoneyFlow has only one IOU action...
    if (iouActions.length !== 1) {
        return undefined;
    }
    // ...which is 'pay'...
    var isFirstActionPay = ((_a = getOriginalMessage(iouActions.at(0))) === null || _a === void 0 ? void 0 : _a.type) === CONST_1.default.IOU.REPORT_ACTION_TYPE.PAY;
    var type = chatReport.type, chatType = chatReport.chatType, parentReportID = chatReport.parentReportID, parentReportActionID = chatReport.parentReportActionID;
    // ...and can only be triggered on DM chats
    var isDM = type === CONST_1.default.REPORT.TYPE.CHAT && !chatType && !(parentReportID && parentReportActionID);
    return isFirstActionPay && isDM ? (_b = iouActions.at(0)) === null || _b === void 0 ? void 0 : _b.childReportID : undefined;
}
/** Whether action has no linked report by design */
var isIOUActionTypeExcludedFromFiltering = function (type) {
    return [CONST_1.default.IOU.REPORT_ACTION_TYPE.SPLIT, CONST_1.default.IOU.REPORT_ACTION_TYPE.TRACK, CONST_1.default.IOU.REPORT_ACTION_TYPE.PAY].some(function (actionType) { return actionType === type; });
};
/**
 * Determines whether the given action is an IOU and, if a list of report transaction IDs is provided,
 * whether it corresponds to one of those transactions. This covers a rare case where IOU report actions was
 * not deleted or moved after the expense was removed from the report.
 *
 * For compatibility and to avoid using isMoneyRequest next to this function as it is checked here already:
 * - If the action is not a money request and `defaultToFalseForNonIOU` is false (default), the result is true.
 * - If no `reportTransactionIDs` are provided, the function returns true if the action is an IOU.
 * - If `reportTransactionIDs` are provided, the function checks if the IOU transaction ID from the action matches any of them.
 */
var isIOUActionMatchingTransactionList = function (action, reportTransactionIDs, defaultToFalseForNonIOU) {
    var _a, _b;
    if (defaultToFalseForNonIOU === void 0) { defaultToFalseForNonIOU = false; }
    if (!isMoneyRequestAction(action)) {
        return !defaultToFalseForNonIOU;
    }
    if (isIOUActionTypeExcludedFromFiltering((_a = getOriginalMessage(action)) === null || _a === void 0 ? void 0 : _a.type) || reportTransactionIDs === undefined) {
        return true;
    }
    var IOUTransactionID = ((_b = getOriginalMessage(action)) !== null && _b !== void 0 ? _b : {}).IOUTransactionID;
    return !!IOUTransactionID && reportTransactionIDs.includes(IOUTransactionID);
};
exports.isIOUActionMatchingTransactionList = isIOUActionMatchingTransactionList;
/**
 * Gets the reportID for the transaction thread associated with a report by iterating over the reportActions and identifying the IOU report actions.
 * Returns a reportID if there is exactly one transaction thread for the report, and null otherwise.
 */
function getOneTransactionThreadReportID(report, chatReport, reportActions, isOffline, reportTransactionIDs) {
    var _a, _b;
    if (isOffline === void 0) { isOffline = undefined; }
    // If the report is not an IOU, Expense report, or Invoice, it shouldn't be treated as one-transaction report.
    if ((report === null || report === void 0 ? void 0 : report.type) !== CONST_1.default.REPORT.TYPE.IOU && (report === null || report === void 0 ? void 0 : report.type) !== CONST_1.default.REPORT.TYPE.EXPENSE && (report === null || report === void 0 ? void 0 : report.type) !== CONST_1.default.REPORT.TYPE.INVOICE) {
        return;
    }
    var reportActionsArray = Array.isArray(reportActions) ? reportActions : Object.values(reportActions !== null && reportActions !== void 0 ? reportActions : {});
    if (!reportActionsArray.length) {
        return;
    }
    var sendMoneyFlowID = getSendMoneyFlowOneTransactionThreadID(reportActions, chatReport);
    if (sendMoneyFlowID) {
        return sendMoneyFlowID;
    }
    var iouRequestActions = [];
    for (var _i = 0, reportActionsArray_1 = reportActionsArray; _i < reportActionsArray_1.length; _i++) {
        var action = reportActionsArray_1[_i];
        // If the original message is a 'pay' IOU, it shouldn't be added to the transaction count.
        // However, it is excluded from the matching function in order to display it properly, so we need to compare the type here.
        if (!isIOUActionMatchingTransactionList(action, reportTransactionIDs, true) || ((_a = getOriginalMessage(action)) === null || _a === void 0 ? void 0 : _a.type) === CONST_1.default.IOU.REPORT_ACTION_TYPE.PAY) {
            // eslint-disable-next-line no-continue
            continue;
        }
        var originalMessage_1 = getOriginalMessage(action);
        var actionType = originalMessage_1 === null || originalMessage_1 === void 0 ? void 0 : originalMessage_1.type;
        if (actionType &&
            iouRequestTypesSet.has(actionType) &&
            action.childReportID &&
            // Include deleted IOU reportActions if:
            // - they have an associated IOU transaction ID or
            // - they have visible childActions (like comments) that we'd want to display
            // - the action is pending deletion and the user is offline
            (!!(originalMessage_1 === null || originalMessage_1 === void 0 ? void 0 : originalMessage_1.IOUTransactionID) ||
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                (isMessageDeleted(action) && action.childVisibleActionCount) ||
                (action.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE && (isOffline !== null && isOffline !== void 0 ? isOffline : isNetworkOffline)))) {
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
    if ((((_b = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.deleted) !== null && _b !== void 0 ? _b : '') !== '' || isDeletedAction(singleAction)) && isMoneyRequestAction(singleAction)) {
        return;
    }
    // Ensure we have a childReportID associated with the IOU report action
    return singleAction === null || singleAction === void 0 ? void 0 : singleAction.childReportID;
}
/**
 * When we delete certain reports, we want to check whether there are any visible actions left to display.
 * If there are no visible actions left (including system messages), we can hide the report from view entirely
 */
function doesReportHaveVisibleActions(reportID, canUserPerformWriteAction, actionsToMerge) {
    var _a;
    if (actionsToMerge === void 0) { actionsToMerge = {}; }
    var reportActions = Object.values((0, expensify_common_1.fastMerge)((_a = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID)]) !== null && _a !== void 0 ? _a : {}, actionsToMerge, true));
    var visibleReportActions = Object.values(reportActions !== null && reportActions !== void 0 ? reportActions : {}).filter(function (action) { return shouldReportActionBeVisibleAsLastAction(action, canUserPerformWriteAction); });
    // Exclude the task system message and the created message
    var visibleReportActionsWithoutTaskSystemMessage = visibleReportActions.filter(function (action) { return !isTaskAction(action) && !isCreatedAction(action); });
    return visibleReportActionsWithoutTaskSystemMessage.length > 0;
}
function getAllReportActions(reportID) {
    var _a;
    return (_a = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID)]) !== null && _a !== void 0 ? _a : {};
}
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
        return (0, isReportMessageAttachment_1.isReportMessageAttachment)(message);
    }
    return false;
}
// eslint-disable-next-line rulesdir/no-negated-variables
function isNotifiableReportAction(reportAction) {
    if (!reportAction) {
        return false;
    }
    var actions = [CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT, CONST_1.default.REPORT.ACTIONS.TYPE.IOU, CONST_1.default.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE];
    return actions.includes(reportAction.actionName);
}
// We pass getReportName as a param to avoid cyclic dependency.
function getMemberChangeMessageElements(reportAction, getReportNameCallback) {
    var _a;
    var isInviteAction = isInviteMemberAction(reportAction);
    var isLeaveAction = isLeavePolicyAction(reportAction);
    if (!isMemberChangeAction(reportAction)) {
        return [];
    }
    // Currently, we only render messages when members are invited
    var verb = (0, Localize_1.translateLocal)('workspace.invite.removed');
    if (isInviteAction) {
        verb = (0, Localize_1.translateLocal)('workspace.invite.invited');
    }
    if (isLeaveAction) {
        verb = getPolicyChangeLogEmployeeLeftMessage(reportAction);
    }
    var originalMessage = getOriginalMessage(reportAction);
    var targetAccountIDs = (_a = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.targetAccountIDs) !== null && _a !== void 0 ? _a : [];
    var personalDetails = (0, PersonalDetailsUtils_1.getPersonalDetailsByIDs)({ accountIDs: targetAccountIDs, currentUserAccountID: 0 });
    var mentionElements = targetAccountIDs.map(function (accountID) {
        var _a;
        var personalDetail = personalDetails.find(function (personal) { return personal.accountID === accountID; });
        var handleText = (_a = (0, PersonalDetailsUtils_1.getEffectiveDisplayName)(personalDetail)) !== null && _a !== void 0 ? _a : (0, Localize_1.translateLocal)('common.hidden');
        return {
            kind: 'userMention',
            content: "@".concat(handleText),
            accountID: accountID,
        };
    });
    var buildRoomElements = function () {
        var roomName = getReportNameCallback(allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.reportID)]) || (originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.roomName);
        if (roomName && originalMessage) {
            var preposition = isInviteAction ? " ".concat((0, Localize_1.translateLocal)('workspace.invite.to'), " ") : " ".concat((0, Localize_1.translateLocal)('workspace.invite.from'), " ");
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
    return __spreadArray(__spreadArray([
        {
            kind: 'text',
            content: "".concat(verb, " "),
        }
    ], (0, Localize_1.formatMessageElementList)(mentionElements), true), buildRoomElements(), true);
}
function getReportActionHtml(reportAction) {
    var _a, _b;
    return (_b = (_a = getReportActionMessage(reportAction)) === null || _a === void 0 ? void 0 : _a.html) !== null && _b !== void 0 ? _b : '';
}
function getReportActionText(reportAction) {
    var _a;
    var message = getReportActionMessage(reportAction);
    // Sometime html can be an empty string
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var text = (_a = ((message === null || message === void 0 ? void 0 : message.html) || (message === null || message === void 0 ? void 0 : message.text))) !== null && _a !== void 0 ? _a : '';
    return text ? Parser_1.default.htmlToText(text) : '';
}
function getTextFromHtml(html) {
    return html ? Parser_1.default.htmlToText(html) : '';
}
function isOldDotLegacyAction(action) {
    return [
        CONST_1.default.REPORT.ACTIONS.TYPE.DELETED_ACCOUNT,
        CONST_1.default.REPORT.ACTIONS.TYPE.DONATION,
        CONST_1.default.REPORT.ACTIONS.TYPE.EXPORTED_TO_QUICK_BOOKS,
        CONST_1.default.REPORT.ACTIONS.TYPE.REIMBURSEMENT_REQUESTED,
        CONST_1.default.REPORT.ACTIONS.TYPE.REIMBURSEMENT_SETUP,
    ].some(function (oldDotActionName) { return oldDotActionName === (action === null || action === void 0 ? void 0 : action.actionName); });
}
function isOldDotReportAction(action) {
    if (!action || !action.actionName) {
        return false;
    }
    return [
        CONST_1.default.REPORT.ACTIONS.TYPE.CHANGE_FIELD,
        CONST_1.default.REPORT.ACTIONS.TYPE.CHANGE_TYPE,
        CONST_1.default.REPORT.ACTIONS.TYPE.DELEGATE_SUBMIT,
        CONST_1.default.REPORT.ACTIONS.TYPE.EXPORTED_TO_CSV,
        CONST_1.default.REPORT.ACTIONS.TYPE.INTEGRATIONS_MESSAGE,
        CONST_1.default.REPORT.ACTIONS.TYPE.MANAGER_ATTACH_RECEIPT,
        CONST_1.default.REPORT.ACTIONS.TYPE.MANAGER_DETACH_RECEIPT,
        CONST_1.default.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED,
        CONST_1.default.REPORT.ACTIONS.TYPE.MARK_REIMBURSED_FROM_INTEGRATION,
        CONST_1.default.REPORT.ACTIONS.TYPE.OUTDATED_BANK_ACCOUNT,
        CONST_1.default.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_BOUNCE,
        CONST_1.default.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_CANCELED,
        CONST_1.default.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACCOUNT_CHANGED,
        CONST_1.default.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DELAYED,
        CONST_1.default.REPORT.ACTIONS.TYPE.SELECTED_FOR_RANDOM_AUDIT,
        CONST_1.default.REPORT.ACTIONS.TYPE.SHARE,
        CONST_1.default.REPORT.ACTIONS.TYPE.STRIPE_PAID,
        CONST_1.default.REPORT.ACTIONS.TYPE.TAKE_CONTROL,
        CONST_1.default.REPORT.ACTIONS.TYPE.UNSHARE,
        CONST_1.default.REPORT.ACTIONS.TYPE.DELETED_ACCOUNT,
        CONST_1.default.REPORT.ACTIONS.TYPE.DONATION,
        CONST_1.default.REPORT.ACTIONS.TYPE.EXPORTED_TO_QUICK_BOOKS,
        CONST_1.default.REPORT.ACTIONS.TYPE.REIMBURSEMENT_REQUESTED,
        CONST_1.default.REPORT.ACTIONS.TYPE.REIMBURSEMENT_SETUP,
    ].some(function (oldDotActionName) { return oldDotActionName === action.actionName; });
}
function getMessageOfOldDotLegacyAction(legacyAction) {
    var _a, _b;
    if (!Array.isArray(legacyAction === null || legacyAction === void 0 ? void 0 : legacyAction.message)) {
        return getReportActionText(legacyAction);
    }
    if (legacyAction.message.length !== 0) {
        // Sometime html can be an empty string
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        return (_b = (_a = legacyAction === null || legacyAction === void 0 ? void 0 : legacyAction.message) === null || _a === void 0 ? void 0 : _a.map(function (element) { return getTextFromHtml((element === null || element === void 0 ? void 0 : element.html) || (element === null || element === void 0 ? void 0 : element.text)); }).join('')) !== null && _b !== void 0 ? _b : '';
    }
    return '';
}
/**
 * Helper method to format message of OldDot Actions.
 */
function getMessageOfOldDotReportAction(oldDotAction, withMarkdown) {
    var _a, _b, _c, _d, _e, _f;
    if (withMarkdown === void 0) { withMarkdown = true; }
    if (isOldDotLegacyAction(oldDotAction)) {
        return getMessageOfOldDotLegacyAction(oldDotAction);
    }
    var originalMessage = oldDotAction.originalMessage, actionName = oldDotAction.actionName;
    switch (actionName) {
        case CONST_1.default.REPORT.ACTIONS.TYPE.CHANGE_FIELD: {
            var oldValue = originalMessage.oldValue, newValue = originalMessage.newValue, fieldName = originalMessage.fieldName;
            if (!oldValue) {
                return (0, Localize_1.translateLocal)('report.actions.type.changeFieldEmpty', { newValue: newValue, fieldName: fieldName });
            }
            return (0, Localize_1.translateLocal)('report.actions.type.changeField', { oldValue: oldValue, newValue: newValue, fieldName: fieldName });
        }
        case CONST_1.default.REPORT.ACTIONS.TYPE.DELEGATE_SUBMIT: {
            var delegateUser = originalMessage.delegateUser, originalManager = originalMessage.originalManager;
            return (0, Localize_1.translateLocal)('report.actions.type.delegateSubmit', { delegateUser: delegateUser, originalManager: originalManager });
        }
        case CONST_1.default.REPORT.ACTIONS.TYPE.EXPORTED_TO_CSV:
            return (0, Localize_1.translateLocal)('report.actions.type.exportedToCSV');
        case CONST_1.default.REPORT.ACTIONS.TYPE.INTEGRATIONS_MESSAGE: {
            var result = originalMessage.result, label = originalMessage.label;
            var errorMessage = (_b = (_a = result === null || result === void 0 ? void 0 : result.messages) === null || _a === void 0 ? void 0 : _a.join(', ')) !== null && _b !== void 0 ? _b : '';
            var linkText = (_d = (_c = result === null || result === void 0 ? void 0 : result.link) === null || _c === void 0 ? void 0 : _c.text) !== null && _d !== void 0 ? _d : '';
            var linkURL = (_f = (_e = result === null || result === void 0 ? void 0 : result.link) === null || _e === void 0 ? void 0 : _e.url) !== null && _f !== void 0 ? _f : '';
            return (0, Localize_1.translateLocal)('report.actions.type.integrationsMessage', { errorMessage: errorMessage, label: label, linkText: linkText, linkURL: linkURL });
        }
        case CONST_1.default.REPORT.ACTIONS.TYPE.MANAGER_ATTACH_RECEIPT:
            return (0, Localize_1.translateLocal)('report.actions.type.managerAttachReceipt');
        case CONST_1.default.REPORT.ACTIONS.TYPE.MANAGER_DETACH_RECEIPT:
            return (0, Localize_1.translateLocal)('report.actions.type.managerDetachReceipt');
        case CONST_1.default.REPORT.ACTIONS.TYPE.MARK_REIMBURSED_FROM_INTEGRATION: {
            var amount = originalMessage.amount, currency = originalMessage.currency;
            return (0, Localize_1.translateLocal)('report.actions.type.markedReimbursedFromIntegration', { amount: amount, currency: currency });
        }
        case CONST_1.default.REPORT.ACTIONS.TYPE.OUTDATED_BANK_ACCOUNT:
            return (0, Localize_1.translateLocal)('report.actions.type.outdatedBankAccount');
        case CONST_1.default.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_BOUNCE:
            return (0, Localize_1.translateLocal)('report.actions.type.reimbursementACHBounce');
        case CONST_1.default.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_CANCELED:
            return (0, Localize_1.translateLocal)('report.actions.type.reimbursementACHCancelled');
        case CONST_1.default.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACCOUNT_CHANGED:
            return (0, Localize_1.translateLocal)('report.actions.type.reimbursementAccountChanged');
        case CONST_1.default.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DELAYED:
            return (0, Localize_1.translateLocal)('report.actions.type.reimbursementDelayed');
        case CONST_1.default.REPORT.ACTIONS.TYPE.SELECTED_FOR_RANDOM_AUDIT:
            return (0, Localize_1.translateLocal)("report.actions.type.selectedForRandomAudit".concat(withMarkdown ? 'Markdown' : ''));
        case CONST_1.default.REPORT.ACTIONS.TYPE.SHARE:
            return (0, Localize_1.translateLocal)('report.actions.type.share', { to: originalMessage.to });
        case CONST_1.default.REPORT.ACTIONS.TYPE.UNSHARE:
            return (0, Localize_1.translateLocal)('report.actions.type.unshare', { to: originalMessage.to });
        case CONST_1.default.REPORT.ACTIONS.TYPE.TAKE_CONTROL:
            return (0, Localize_1.translateLocal)('report.actions.type.takeControl');
        default:
            return '';
    }
}
function getTravelUpdateMessage(action, formatDate) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34, _35, _36, _37, _38, _39, _40, _41, _42, _43, _44, _45, _46, _47, _48;
    var details = getOriginalMessage(action);
    var formattedStartDate = (_b = formatDate === null || formatDate === void 0 ? void 0 : formatDate((_a = details === null || details === void 0 ? void 0 : details.start.date) !== null && _a !== void 0 ? _a : '', false)) !== null && _b !== void 0 ? _b : (0, date_fns_1.format)((_c = details === null || details === void 0 ? void 0 : details.start.date) !== null && _c !== void 0 ? _c : '', CONST_1.default.DATE.FNS_DATE_TIME_FORMAT_STRING);
    switch (details === null || details === void 0 ? void 0 : details.operation) {
        case CONST_1.default.TRAVEL.UPDATE_OPERATION_TYPE.BOOKING_TICKETED:
            return (0, Localize_1.translateLocal)('travel.updates.bookingTicketed', {
                airlineCode: (_e = (_d = details.route) === null || _d === void 0 ? void 0 : _d.airlineCode) !== null && _e !== void 0 ? _e : '',
                origin: (_f = details.start.shortName) !== null && _f !== void 0 ? _f : '',
                destination: (_h = (_g = details.end) === null || _g === void 0 ? void 0 : _g.shortName) !== null && _h !== void 0 ? _h : '',
                startDate: formattedStartDate,
                confirmationID: (_k = (_j = details.confirmations) === null || _j === void 0 ? void 0 : _j.at(0)) === null || _k === void 0 ? void 0 : _k.value,
            });
        case CONST_1.default.TRAVEL.UPDATE_OPERATION_TYPE.TICKET_VOIDED:
            return (0, Localize_1.translateLocal)('travel.updates.ticketVoided', {
                airlineCode: (_m = (_l = details.route) === null || _l === void 0 ? void 0 : _l.airlineCode) !== null && _m !== void 0 ? _m : '',
                origin: (_o = details.start.shortName) !== null && _o !== void 0 ? _o : '',
                destination: (_q = (_p = details.end) === null || _p === void 0 ? void 0 : _p.shortName) !== null && _q !== void 0 ? _q : '',
                startDate: formattedStartDate,
            });
        case CONST_1.default.TRAVEL.UPDATE_OPERATION_TYPE.TICKET_REFUNDED:
            return (0, Localize_1.translateLocal)('travel.updates.ticketRefunded', {
                airlineCode: (_s = (_r = details.route) === null || _r === void 0 ? void 0 : _r.airlineCode) !== null && _s !== void 0 ? _s : '',
                origin: (_t = details.start.shortName) !== null && _t !== void 0 ? _t : '',
                destination: (_v = (_u = details.end) === null || _u === void 0 ? void 0 : _u.shortName) !== null && _v !== void 0 ? _v : '',
                startDate: formattedStartDate,
            });
        case CONST_1.default.TRAVEL.UPDATE_OPERATION_TYPE.FLIGHT_CANCELLED:
            return (0, Localize_1.translateLocal)('travel.updates.flightCancelled', {
                airlineCode: (_x = (_w = details.route) === null || _w === void 0 ? void 0 : _w.airlineCode) !== null && _x !== void 0 ? _x : '',
                origin: (_y = details.start.shortName) !== null && _y !== void 0 ? _y : '',
                destination: (_0 = (_z = details.end) === null || _z === void 0 ? void 0 : _z.shortName) !== null && _0 !== void 0 ? _0 : '',
                startDate: formattedStartDate,
            });
        case CONST_1.default.TRAVEL.UPDATE_OPERATION_TYPE.FLIGHT_SCHEDULE_CHANGE_PENDING:
            return (0, Localize_1.translateLocal)('travel.updates.flightScheduleChangePending', {
                airlineCode: (_2 = (_1 = details.route) === null || _1 === void 0 ? void 0 : _1.airlineCode) !== null && _2 !== void 0 ? _2 : '',
            });
        case CONST_1.default.TRAVEL.UPDATE_OPERATION_TYPE.FLIGHT_SCHEDULE_CHANGE_CLOSED:
            return (0, Localize_1.translateLocal)('travel.updates.flightScheduleChangeClosed', {
                airlineCode: (_4 = (_3 = details.route) === null || _3 === void 0 ? void 0 : _3.airlineCode) !== null && _4 !== void 0 ? _4 : '',
                startDate: formattedStartDate,
            });
        case CONST_1.default.TRAVEL.UPDATE_OPERATION_TYPE.FLIGHT_CHANGED:
            return (0, Localize_1.translateLocal)('travel.updates.flightUpdated', {
                airlineCode: (_6 = (_5 = details.route) === null || _5 === void 0 ? void 0 : _5.airlineCode) !== null && _6 !== void 0 ? _6 : '',
                origin: (_7 = details.start.shortName) !== null && _7 !== void 0 ? _7 : '',
                destination: (_9 = (_8 = details.end) === null || _8 === void 0 ? void 0 : _8.shortName) !== null && _9 !== void 0 ? _9 : '',
                startDate: formattedStartDate,
            });
        case CONST_1.default.TRAVEL.UPDATE_OPERATION_TYPE.FLIGHT_CABIN_CHANGED:
            return (0, Localize_1.translateLocal)('travel.updates.flightCabinChanged', {
                airlineCode: (_11 = (_10 = details.route) === null || _10 === void 0 ? void 0 : _10.airlineCode) !== null && _11 !== void 0 ? _11 : '',
                cabinClass: (_13 = (_12 = details.route) === null || _12 === void 0 ? void 0 : _12.class) !== null && _13 !== void 0 ? _13 : '',
            });
        case CONST_1.default.TRAVEL.UPDATE_OPERATION_TYPE.FLIGHT_SEAT_CONFIRMED:
            return (0, Localize_1.translateLocal)('travel.updates.flightSeatConfirmed', {
                airlineCode: (_15 = (_14 = details.route) === null || _14 === void 0 ? void 0 : _14.airlineCode) !== null && _15 !== void 0 ? _15 : '',
            });
        case CONST_1.default.TRAVEL.UPDATE_OPERATION_TYPE.FLIGHT_SEAT_CHANGED:
            return (0, Localize_1.translateLocal)('travel.updates.flightSeatChanged', {
                airlineCode: (_17 = (_16 = details.route) === null || _16 === void 0 ? void 0 : _16.airlineCode) !== null && _17 !== void 0 ? _17 : '',
            });
        case CONST_1.default.TRAVEL.UPDATE_OPERATION_TYPE.FLIGHT_SEAT_CANCELLED:
            return (0, Localize_1.translateLocal)('travel.updates.flightSeatCancelled', {
                airlineCode: (_19 = (_18 = details.route) === null || _18 === void 0 ? void 0 : _18.airlineCode) !== null && _19 !== void 0 ? _19 : '',
            });
        case CONST_1.default.TRAVEL.UPDATE_OPERATION_TYPE.PAYMENT_DECLINED:
            return (0, Localize_1.translateLocal)('travel.updates.paymentDeclined');
        case CONST_1.default.TRAVEL.UPDATE_OPERATION_TYPE.BOOKING_CANCELED_BY_TRAVELER:
            return (0, Localize_1.translateLocal)('travel.updates.bookingCancelledByTraveler', {
                type: details.type,
                id: details.reservationID,
            });
        case CONST_1.default.TRAVEL.UPDATE_OPERATION_TYPE.BOOKING_CANCELED_BY_VENDOR:
            return (0, Localize_1.translateLocal)('travel.updates.bookingCancelledByVendor', {
                type: details.type,
                id: details.reservationID,
            });
        case CONST_1.default.TRAVEL.UPDATE_OPERATION_TYPE.BOOKING_REBOOKED:
            return (0, Localize_1.translateLocal)('travel.updates.bookingRebooked', {
                type: details.type,
                id: (_21 = (_20 = details.confirmations) === null || _20 === void 0 ? void 0 : _20.at(0)) === null || _21 === void 0 ? void 0 : _21.value,
            });
        case CONST_1.default.TRAVEL.UPDATE_OPERATION_TYPE.BOOKING_UPDATED:
            return (0, Localize_1.translateLocal)('travel.updates.bookingUpdated', {
                type: details.type,
            });
        case CONST_1.default.TRAVEL.UPDATE_OPERATION_TYPE.TRIP_UPDATED:
            if (details.type === CONST_1.default.RESERVATION_TYPE.CAR || details.type === CONST_1.default.RESERVATION_TYPE.HOTEL) {
                return (0, Localize_1.translateLocal)('travel.updates.defaultUpdate', {
                    type: details.type,
                });
            }
            if (details.type === CONST_1.default.RESERVATION_TYPE.TRAIN) {
                return (0, Localize_1.translateLocal)('travel.updates.railTicketUpdate', {
                    origin: (_23 = (_22 = details.start.cityName) !== null && _22 !== void 0 ? _22 : details.start.shortName) !== null && _23 !== void 0 ? _23 : '',
                    destination: (_25 = (_24 = details.end.cityName) !== null && _24 !== void 0 ? _24 : details.end.shortName) !== null && _25 !== void 0 ? _25 : '',
                    startDate: formattedStartDate,
                });
            }
            return (0, Localize_1.translateLocal)('travel.updates.flightUpdated', {
                airlineCode: (_27 = (_26 = details.route) === null || _26 === void 0 ? void 0 : _26.airlineCode) !== null && _27 !== void 0 ? _27 : '',
                origin: (_28 = details.start.shortName) !== null && _28 !== void 0 ? _28 : '',
                destination: (_30 = (_29 = details.end) === null || _29 === void 0 ? void 0 : _29.shortName) !== null && _30 !== void 0 ? _30 : '',
                startDate: formattedStartDate,
            });
        case CONST_1.default.TRAVEL.UPDATE_OPERATION_TYPE.BOOKING_OTHER_UPDATE:
            if (details.type === CONST_1.default.RESERVATION_TYPE.CAR || details.type === CONST_1.default.RESERVATION_TYPE.HOTEL) {
                return (0, Localize_1.translateLocal)('travel.updates.defaultUpdate', {
                    type: details.type,
                });
            }
            if (details.type === CONST_1.default.RESERVATION_TYPE.TRAIN) {
                return (0, Localize_1.translateLocal)('travel.updates.railTicketUpdate', {
                    origin: (_32 = (_31 = details.start.cityName) !== null && _31 !== void 0 ? _31 : details.start.shortName) !== null && _32 !== void 0 ? _32 : '',
                    destination: (_34 = (_33 = details.end.cityName) !== null && _33 !== void 0 ? _33 : details.end.shortName) !== null && _34 !== void 0 ? _34 : '',
                    startDate: formattedStartDate,
                });
            }
            return (0, Localize_1.translateLocal)('travel.updates.flightUpdated', {
                airlineCode: (_36 = (_35 = details.route) === null || _35 === void 0 ? void 0 : _35.airlineCode) !== null && _36 !== void 0 ? _36 : '',
                origin: (_37 = details.start.shortName) !== null && _37 !== void 0 ? _37 : '',
                destination: (_39 = (_38 = details.end) === null || _38 === void 0 ? void 0 : _38.shortName) !== null && _39 !== void 0 ? _39 : '',
                startDate: formattedStartDate,
            });
        case CONST_1.default.TRAVEL.UPDATE_OPERATION_TYPE.REFUND:
            return (0, Localize_1.translateLocal)('travel.updates.railTicketRefund', {
                origin: (_41 = (_40 = details.start.cityName) !== null && _40 !== void 0 ? _40 : details.start.shortName) !== null && _41 !== void 0 ? _41 : '',
                destination: (_43 = (_42 = details.end.cityName) !== null && _42 !== void 0 ? _42 : details.end.shortName) !== null && _43 !== void 0 ? _43 : '',
                startDate: formattedStartDate,
            });
        case CONST_1.default.TRAVEL.UPDATE_OPERATION_TYPE.EXCHANGE:
            return (0, Localize_1.translateLocal)('travel.updates.railTicketExchange', {
                origin: (_45 = (_44 = details.start.cityName) !== null && _44 !== void 0 ? _44 : details.start.shortName) !== null && _45 !== void 0 ? _45 : '',
                destination: (_47 = (_46 = details.end.cityName) !== null && _46 !== void 0 ? _46 : details.end.shortName) !== null && _47 !== void 0 ? _47 : '',
                startDate: formattedStartDate,
            });
        default:
            return (0, Localize_1.translateLocal)('travel.updates.defaultUpdate', {
                type: (_48 = details === null || details === void 0 ? void 0 : details.type) !== null && _48 !== void 0 ? _48 : '',
            });
    }
}
function getMemberChangeMessageFragment(reportAction, getReportNameCallback) {
    var messageElements = getMemberChangeMessageElements(reportAction, getReportNameCallback);
    var html = messageElements
        .map(function (messageElement) {
        switch (messageElement.kind) {
            case 'userMention':
                return "<mention-user accountID=".concat(messageElement.accountID, ">").concat(messageElement.content, "</mention-user>");
            case 'roomReference':
                return "<a href=\"".concat(environmentURL, "/r/").concat(messageElement.roomID, "\" target=\"_blank\">").concat(messageElement.roomName, "</a>");
            default:
                return messageElement.content;
        }
    })
        .join('');
    return {
        html: "<muted-text>".concat(html, "</muted-text>"),
        text: getReportActionMessage(reportAction) ? getReportActionText(reportAction) : '',
        type: CONST_1.default.REPORT.MESSAGE.TYPE.COMMENT,
    };
}
function getLeaveRoomMessage() {
    return (0, Localize_1.translateLocal)('report.actions.type.leftTheChat');
}
function getReopenedMessage() {
    return (0, Localize_1.translateLocal)('iou.reopened');
}
function getReceiptScanFailedMessage() {
    return (0, Localize_1.translateLocal)('receipt.scanFailed');
}
function getUpdateRoomDescriptionFragment(reportAction) {
    var html = getUpdateRoomDescriptionMessage(reportAction);
    return {
        html: "<muted-text>".concat(html, "</muted-text>"),
        text: getReportActionMessage(reportAction) ? getReportActionText(reportAction) : '',
        type: CONST_1.default.REPORT.MESSAGE.TYPE.COMMENT,
    };
}
function getReportActionMessageFragments(action) {
    var _a;
    if (isOldDotReportAction(action)) {
        var oldDotMessage = getMessageOfOldDotReportAction(action);
        var html = isActionOfType(action, CONST_1.default.REPORT.ACTIONS.TYPE.SELECTED_FOR_RANDOM_AUDIT) ? Parser_1.default.replace(oldDotMessage) : oldDotMessage;
        return [{ text: oldDotMessage, html: "<muted-text>".concat(html, "</muted-text>"), type: 'COMMENT' }];
    }
    if (isActionOfType(action, CONST_1.default.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.UPDATE_ROOM_DESCRIPTION)) {
        var message = getUpdateRoomDescriptionMessage(action);
        return [{ text: message, html: "<muted-text>".concat(message, "</muted-text>"), type: 'COMMENT' }];
    }
    if (isActionOfType(action, CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DESCRIPTION)) {
        var message = getWorkspaceDescriptionUpdatedMessage(action);
        return [{ text: message, html: "<muted-text>".concat(message, "</muted-text>"), type: 'COMMENT' }];
    }
    if (isActionOfType(action, CONST_1.default.REPORT.ACTIONS.TYPE.REIMBURSED)) {
        var message = getReportActionMessageText(action);
        return [{ text: message, html: "<muted-text>".concat(message, "</muted-text>"), type: 'COMMENT' }];
    }
    if (isActionOfType(action, CONST_1.default.REPORT.ACTIONS.TYPE.RETRACTED)) {
        var message = getRetractedMessage();
        return [{ text: message, html: "<muted-text>".concat(message, "</muted-text>"), type: 'COMMENT' }];
    }
    if (isActionOfType(action, CONST_1.default.REPORT.ACTIONS.TYPE.REOPENED)) {
        var message = getReopenedMessage();
        return [{ text: message, html: "<muted-text>".concat(message, "</muted-text>"), type: 'COMMENT' }];
    }
    if (isActionOfType(action, CONST_1.default.REPORT.ACTIONS.TYPE.TRAVEL_UPDATE)) {
        var message = getTravelUpdateMessage(action);
        return [{ text: message, html: "<muted-text>".concat(message, "</muted-text>"), type: 'COMMENT' }];
    }
    if (isConciergeCategoryOptions(action)) {
        var message = getReportActionMessageText(action);
        return [{ text: message, html: message, type: 'COMMENT' }];
    }
    var actionMessage = (_a = action.previousMessage) !== null && _a !== void 0 ? _a : action.message;
    if (Array.isArray(actionMessage)) {
        return actionMessage.filter(function (item) { return !!item; });
    }
    return actionMessage ? [actionMessage] : [];
}
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
    return reportActions.some(function (action) { return action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.IOU && action.actorAccountID === currentAccountID; });
}
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
    var personalDetails = (0, PersonalDetailsUtils_1.getPersonalDetailsByIDs)({ accountIDs: targetAccountIDs, currentUserAccountID: 0 });
    var mentionElements = targetAccountIDs.map(function (accountID) {
        var personalDetail = personalDetails.find(function (personal) { return personal.accountID === accountID; });
        var displayName = (0, PersonalDetailsUtils_1.getEffectiveDisplayName)(personalDetail);
        var handleText = (0, isEmpty_1.default)(displayName) ? (0, Localize_1.translateLocal)('common.hidden') : displayName;
        return "<mention-user accountID=".concat(accountID, ">@").concat(handleText, "</mention-user>");
    });
    var preMentionsText = 'Heads up, ';
    var mentions = mentionElements.join(', ').replace(/, ([^,]*)$/, ' and $1');
    var postMentionsText = " ".concat(mentionElements.length > 1 ? "aren't members" : "isn't a member", " of this room.");
    return "".concat(preMentionsText).concat(mentions).concat(postMentionsText);
}
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
/**
 * Check whether the current report action of the report is unread or not
 *
 */
function isCurrentActionUnread(report, reportAction) {
    var _a;
    var lastReadTime = (_a = report === null || report === void 0 ? void 0 : report.lastReadTime) !== null && _a !== void 0 ? _a : '';
    var sortedReportActions = getSortedReportActions(Object.values(getAllReportActions(report === null || report === void 0 ? void 0 : report.reportID)));
    var currentActionIndex = sortedReportActions.findIndex(function (action) { return action.reportActionID === reportAction.reportActionID; });
    if (currentActionIndex === -1) {
        return false;
    }
    var prevReportAction = sortedReportActions.at(currentActionIndex - 1);
    return isReportActionUnread(reportAction, lastReadTime) && (currentActionIndex === 0 || !prevReportAction || !isReportActionUnread(prevReportAction, lastReadTime));
}
/**
 * Checks if a given report action corresponds to a join request action.
 * @param reportAction
 */
function isActionableJoinRequest(reportAction) {
    return isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.ACTIONABLE_JOIN_REQUEST);
}
function isActionableJoinRequestPendingReportAction(reportAction) {
    var _a;
    return isActionableJoinRequest(reportAction) && ((_a = getOriginalMessage(reportAction)) === null || _a === void 0 ? void 0 : _a.choice) === '';
}
function isConciergeCategoryOptions(reportAction) {
    return isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.CONCIERGE_CATEGORY_OPTIONS);
}
function getActionableJoinRequestPendingReportAction(reportID) {
    var findPendingRequest = Object.values(getAllReportActions(reportID)).find(function (reportActionItem) { return isActionableJoinRequestPendingReportAction(reportActionItem); });
    return findPendingRequest;
}
/**
 * Checks if any report actions correspond to a join request action that is still pending.
 * @param reportID
 */
function isActionableJoinRequestPending(reportID) {
    return !!getActionableJoinRequestPendingReportAction(reportID);
}
function isApprovedOrSubmittedReportAction(action) {
    return [CONST_1.default.REPORT.ACTIONS.TYPE.APPROVED, CONST_1.default.REPORT.ACTIONS.TYPE.SUBMITTED].some(function (type) { return type === (action === null || action === void 0 ? void 0 : action.actionName); });
}
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
    return (_b = (_a = reportAction === null || reportAction === void 0 ? void 0 : reportAction.message) === null || _a === void 0 ? void 0 : _a.reduce(function (acc, curr) { return "".concat(acc).concat(getTextFromHtml((curr === null || curr === void 0 ? void 0 : curr.html) || (curr === null || curr === void 0 ? void 0 : curr.text))); }, '')) !== null && _b !== void 0 ? _b : '';
}
function getDismissedViolationMessageText(originalMessage) {
    var reason = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.reason;
    var violationName = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.violationName;
    return (0, Localize_1.translateLocal)("violationDismissal.".concat(violationName, ".").concat(reason));
}
/**
 * Check if the linked transaction is on hold
 */
function isLinkedTransactionHeld(reportActionID, reportID) {
    var linkedTransactionID = getLinkedTransactionID(reportActionID, reportID);
    return linkedTransactionID ? (0, TransactionUtils_1.isOnHoldByTransactionID)(linkedTransactionID) : false;
}
function getMentionedAccountIDsFromAction(reportAction) {
    var _a, _b;
    return isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT) ? ((_b = (_a = getOriginalMessage(reportAction)) === null || _a === void 0 ? void 0 : _a.mentionedAccountIDs) !== null && _b !== void 0 ? _b : []) : [];
}
function getMentionedEmailsFromMessage(message) {
    var mentionEmailRegex = /<mention-user>(.*?)<\/mention-user>/g;
    var matches = __spreadArray([], message.matchAll(mentionEmailRegex), true);
    return matches.map(function (match) { return expensify_common_1.Str.removeSMSDomain(match[1].substring(1)); });
}
function didMessageMentionCurrentUser(reportAction) {
    var _a, _b;
    var accountIDsFromMessage = getMentionedAccountIDsFromAction(reportAction);
    var message = (_b = (_a = getReportActionMessage(reportAction)) === null || _a === void 0 ? void 0 : _a.html) !== null && _b !== void 0 ? _b : '';
    var emailsFromMessage = getMentionedEmailsFromMessage(message);
    return accountIDsFromMessage.includes(currentUserAccountID !== null && currentUserAccountID !== void 0 ? currentUserAccountID : CONST_1.default.DEFAULT_NUMBER_ID) || emailsFromMessage.includes(currentEmail) || message.includes('<mention-here>');
}
/**
 * Check if the current user is the requestor of the action
 */
function wasActionTakenByCurrentUser(reportAction) {
    return currentUserAccountID === (reportAction === null || reportAction === void 0 ? void 0 : reportAction.actorAccountID);
}
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
/**
 * Get the IOU action for a transactionID from given reportActions
 */
function getIOUActionForTransactionID(reportActions, transactionID) {
    return reportActions.find(function (reportAction) {
        var _a;
        var IOUTransactionID = isMoneyRequestAction(reportAction) ? (_a = getOriginalMessage(reportAction)) === null || _a === void 0 ? void 0 : _a.IOUTransactionID : undefined;
        return IOUTransactionID === transactionID;
    });
}
/**
 * Get the track expense actionable whisper of the corresponding track expense
 */
function getTrackExpenseActionableWhisper(transactionID, chatReportID) {
    var _a;
    if (!transactionID || !chatReportID) {
        return undefined;
    }
    var chatReportActions = (_a = allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(chatReportID)]) !== null && _a !== void 0 ? _a : {};
    return Object.values(chatReportActions).find(function (action) { var _a; return isActionableTrackExpense(action) && ((_a = getOriginalMessage(action)) === null || _a === void 0 ? void 0 : _a.transactionID) === transactionID; });
}
/**
 * Checks if a given report action corresponds to a add payment card action.
 * @param reportAction
 */
function isActionableAddPaymentCard(reportAction) {
    return (reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.ACTIONABLE_ADD_PAYMENT_CARD;
}
function getExportIntegrationLastMessageText(reportAction) {
    var fragments = getExportIntegrationActionFragments(reportAction);
    return fragments.reduce(function (acc, fragment) { return "".concat(acc, " ").concat(fragment.text); }, '');
}
function getExportIntegrationMessageHTML(reportAction) {
    var fragments = getExportIntegrationActionFragments(reportAction);
    var htmlFragments = fragments.map(function (fragment) { return (fragment.url ? "<a href=\"".concat(fragment.url, "\">").concat(fragment.text, "</a>") : fragment.text); });
    return htmlFragments.join(' ');
}
function getExportIntegrationActionFragments(reportAction) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if ((reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) !== CONST_1.default.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION) {
        throw Error("received wrong action type. actionName: ".concat(reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName));
    }
    var isPending = (reportAction === null || reportAction === void 0 ? void 0 : reportAction.pendingAction) === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD;
    var originalMessage = ((_a = getOriginalMessage(reportAction)) !== null && _a !== void 0 ? _a : {});
    var label = originalMessage.label, markedManually = originalMessage.markedManually, automaticAction = originalMessage.automaticAction;
    var reimbursableUrls = (_b = originalMessage.reimbursableUrls) !== null && _b !== void 0 ? _b : [];
    var nonReimbursableUrls = (_c = originalMessage.nonReimbursableUrls) !== null && _c !== void 0 ? _c : [];
    var reportID = reportAction === null || reportAction === void 0 ? void 0 : reportAction.reportID;
    var wasExportedAfterBase62 = ((_d = reportAction === null || reportAction === void 0 ? void 0 : reportAction.created) !== null && _d !== void 0 ? _d : '') > '2022-11-14';
    var base62ReportID = (0, getBase62ReportID_1.default)(Number(reportID));
    var result = [];
    if (isPending) {
        result.push({
            text: (0, Localize_1.translateLocal)('report.actions.type.exportedToIntegration.pending', { label: label }),
            url: '',
        });
    }
    else if (markedManually) {
        result.push({
            text: (0, Localize_1.translateLocal)('report.actions.type.exportedToIntegration.manual', { label: label }),
            url: '',
        });
    }
    else if (automaticAction) {
        result.push({
            text: (0, Localize_1.translateLocal)('report.actions.type.exportedToIntegration.automaticActionOne', { label: label }),
            url: '',
        });
        var url = CONST_1.default.HELP_DOC_LINKS[label];
        result.push({
            text: (0, Localize_1.translateLocal)('report.actions.type.exportedToIntegration.automaticActionTwo'),
            url: url || '',
        });
    }
    else {
        result.push({
            text: (0, Localize_1.translateLocal)('report.actions.type.exportedToIntegration.automatic', { label: label }),
            url: '',
        });
    }
    if (reimbursableUrls.length || nonReimbursableUrls.length) {
        result.push({
            text: (0, Localize_1.translateLocal)('report.actions.type.exportedToIntegration.automaticActionThree'),
            url: '',
        });
    }
    if (reimbursableUrls.length === 1) {
        var shouldAddPeriod = nonReimbursableUrls.length === 0;
        result.push({
            text: (0, Localize_1.translateLocal)('report.actions.type.exportedToIntegration.reimburseableLink') + (shouldAddPeriod ? '.' : ''),
            url: (_e = reimbursableUrls.at(0)) !== null && _e !== void 0 ? _e : '',
        });
    }
    if (reimbursableUrls.length === 1 && nonReimbursableUrls.length) {
        result.push({
            text: (0, Localize_1.translateLocal)('common.and'),
            url: '',
        });
    }
    if (nonReimbursableUrls.length) {
        var text = (0, Localize_1.translateLocal)('report.actions.type.exportedToIntegration.nonReimbursableLink');
        var url = '';
        if (nonReimbursableUrls.length === 1) {
            url = (_f = nonReimbursableUrls.at(0)) !== null && _f !== void 0 ? _f : '';
        }
        else {
            switch (label) {
                case CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.xero:
                    url = XERO_NON_REIMBURSABLE_EXPENSES_URL;
                    break;
                case CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.netsuite:
                    url = NETSUITE_NON_REIMBURSABLE_EXPENSES_URL_PREFIX;
                    url += wasExportedAfterBase62 ? base62ReportID : reportID;
                    break;
                case CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.financialForce:
                    // The first three characters in a Salesforce ID is the expense type
                    url = (_h = (_g = nonReimbursableUrls.at(0)) === null || _g === void 0 ? void 0 : _g.substring(0, SALESFORCE_EXPENSES_URL_PREFIX.length + 3)) !== null && _h !== void 0 ? _h : '';
                    break;
                default:
                    url = QBO_EXPENSES_URL;
            }
        }
        result.push({ text: text, url: url });
    }
    return result;
}
function getUpdateRoomDescriptionMessage(reportAction) {
    var originalMessage = getOriginalMessage(reportAction);
    if (originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.description) {
        return "".concat((0, Localize_1.translateLocal)('roomChangeLog.updateRoomDescription'), " ").concat(originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.description);
    }
    return (0, Localize_1.translateLocal)('roomChangeLog.clearRoomDescription');
}
function getRetractedMessage() {
    return (0, Localize_1.translateLocal)('iou.retracted');
}
function isPolicyChangeLogAddEmployeeMessage(reportAction) {
    return isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_EMPLOYEE);
}
function getPolicyChangeLogAddEmployeeMessage(reportAction) {
    var _a, _b;
    if (!isPolicyChangeLogAddEmployeeMessage(reportAction)) {
        return '';
    }
    var originalMessage = getOriginalMessage(reportAction);
    var email = (_a = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.email) !== null && _a !== void 0 ? _a : '';
    var role = (0, Localize_1.translateLocal)('workspace.common.roleName', { role: (_b = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.role) !== null && _b !== void 0 ? _b : '' }).toLowerCase();
    var formattedEmail = (0, LocalePhoneNumber_1.formatPhoneNumber)(email);
    return (0, Localize_1.translateLocal)('report.actions.type.addEmployee', { email: formattedEmail, role: role });
}
function isPolicyChangeLogChangeRoleMessage(reportAction) {
    return isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EMPLOYEE);
}
function getPolicyChangeLogUpdateEmployee(reportAction) {
    var _a;
    if (!isPolicyChangeLogChangeRoleMessage(reportAction)) {
        return '';
    }
    var originalMessage = getOriginalMessage(reportAction);
    var email = (_a = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.email) !== null && _a !== void 0 ? _a : '';
    var field = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.field;
    var customFieldType = Object.values(CONST_1.default.CUSTOM_FIELD_KEYS).find(function (value) { return value === field; });
    if (customFieldType) {
        var translationKey = field === CONST_1.default.CUSTOM_FIELD_KEYS.customField1 ? 'report.actions.type.updatedCustomField1' : 'report.actions.type.updatedCustomField2';
        return (0, Localize_1.translateLocal)(translationKey, {
            email: email,
            newValue: typeof (originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.newValue) === 'string' ? originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.newValue : '',
            previousValue: typeof (originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.oldValue) === 'string' ? originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.oldValue : '',
        });
    }
    var newRole = (0, Localize_1.translateLocal)('workspace.common.roleName', { role: typeof (originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.newValue) === 'string' ? originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.newValue : '' }).toLowerCase();
    var oldRole = (0, Localize_1.translateLocal)('workspace.common.roleName', { role: typeof (originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.oldValue) === 'string' ? originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.oldValue : '' }).toLowerCase();
    return (0, Localize_1.translateLocal)('report.actions.type.updateRole', { email: email, newRole: newRole, currentRole: oldRole });
}
function getPolicyChangeLogEmployeeLeftMessage(reportAction, useName) {
    var _a, _b;
    if (useName === void 0) { useName = false; }
    if (!isLeavePolicyAction(reportAction)) {
        return '';
    }
    var originalMessage = getOriginalMessage(reportAction);
    var personalDetails = (_a = (0, PersonalDetailsUtils_1.getPersonalDetailsByIDs)({ accountIDs: reportAction.actorAccountID ? [reportAction.actorAccountID] : [], currentUserAccountID: 0 })) === null || _a === void 0 ? void 0 : _a.at(0);
    if (!!originalMessage && !originalMessage.email) {
        originalMessage.email = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails.login;
    }
    var nameOrEmail = useName && !!(personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails.firstName) ? "".concat(personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails.firstName, ":") : ((_b = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.email) !== null && _b !== void 0 ? _b : '');
    var formattedNameOrEmail = (0, LocalePhoneNumber_1.formatPhoneNumber)(nameOrEmail);
    return (0, Localize_1.translateLocal)('report.actions.type.leftWorkspace', { nameOrEmail: formattedNameOrEmail });
}
function isPolicyChangeLogDeleteMemberMessage(reportAction) {
    return isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_EMPLOYEE);
}
function getWorkspaceDescriptionUpdatedMessage(action) {
    var _a;
    var _b = (_a = getOriginalMessage(action)) !== null && _a !== void 0 ? _a : {}, oldDescription = _b.oldDescription, newDescription = _b.newDescription;
    var message = typeof oldDescription === 'string' && newDescription ? (0, Localize_1.translateLocal)('workspaceActions.updateWorkspaceDescription', { newDescription: newDescription, oldDescription: oldDescription }) : getReportActionText(action);
    return message;
}
function getWorkspaceCurrencyUpdateMessage(action) {
    var _a;
    var _b = (_a = getOriginalMessage(action)) !== null && _a !== void 0 ? _a : {}, oldCurrency = _b.oldCurrency, newCurrency = _b.newCurrency;
    var message = oldCurrency && newCurrency ? (0, Localize_1.translateLocal)('workspaceActions.updatedWorkspaceCurrencyAction', { oldCurrency: oldCurrency, newCurrency: newCurrency }) : getReportActionText(action);
    return message;
}
var getAutoReportingFrequencyDisplayNames = function () {
    var _a;
    return (_a = {},
        _a[CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY] = (0, Localize_1.translateLocal)('workflowsPage.frequencies.monthly'),
        _a[CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE] = (0, Localize_1.translateLocal)('workflowsPage.frequencies.daily'),
        _a[CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY] = (0, Localize_1.translateLocal)('workflowsPage.frequencies.weekly'),
        _a[CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.SEMI_MONTHLY] = (0, Localize_1.translateLocal)('workflowsPage.frequencies.twiceAMonth'),
        _a[CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.TRIP] = (0, Localize_1.translateLocal)('workflowsPage.frequencies.byTrip'),
        _a[CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL] = (0, Localize_1.translateLocal)('workflowsPage.frequencies.manually'),
        _a[CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT] = (0, Localize_1.translateLocal)('workflowsPage.frequencies.instant'),
        _a);
};
function getWorkspaceFrequencyUpdateMessage(action) {
    var _a, _b, _c;
    var _d = (_a = getOriginalMessage(action)) !== null && _a !== void 0 ? _a : {}, oldFrequency = _d.oldFrequency, newFrequency = _d.newFrequency;
    if (!oldFrequency || !newFrequency) {
        return getReportActionText(action);
    }
    var frequencyDisplayNames = getAutoReportingFrequencyDisplayNames();
    var oldFrequencyTranslation = (_b = frequencyDisplayNames[oldFrequency]) === null || _b === void 0 ? void 0 : _b.toLowerCase();
    var newFrequencyTranslation = (_c = frequencyDisplayNames[newFrequency]) === null || _c === void 0 ? void 0 : _c.toLowerCase();
    if (!oldFrequencyTranslation || !newFrequencyTranslation) {
        return getReportActionText(action);
    }
    return (0, Localize_1.translateLocal)('workspaceActions.updatedWorkspaceFrequencyAction', {
        oldFrequency: oldFrequencyTranslation,
        newFrequency: newFrequencyTranslation,
    });
}
function getWorkspaceCategoryUpdateMessage(action, policy) {
    var _a;
    var _b = (_a = getOriginalMessage(action)) !== null && _a !== void 0 ? _a : {}, categoryName = _b.categoryName, oldValue = _b.oldValue, newName = _b.newName, oldName = _b.oldName, updatedField = _b.updatedField, newValue = _b.newValue, currency = _b.currency;
    if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CATEGORY && categoryName) {
        return (0, Localize_1.translateLocal)('workspaceActions.addCategory', {
            categoryName: categoryName,
        });
    }
    if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CATEGORY && categoryName) {
        return (0, Localize_1.translateLocal)('workspaceActions.deleteCategory', {
            categoryName: categoryName,
        });
    }
    if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CATEGORY && categoryName) {
        if (updatedField === 'commentHint') {
            return (0, Localize_1.translateLocal)('workspaceActions.updatedDescriptionHint', {
                oldValue: oldValue,
                newValue: newValue,
                categoryName: categoryName,
            });
        }
        if (updatedField === 'enabled') {
            return (0, Localize_1.translateLocal)('workspaceActions.updateCategory', {
                oldValue: !!oldValue,
                categoryName: categoryName,
            });
        }
        if (updatedField === 'areCommentsRequired' && typeof oldValue === 'boolean') {
            return (0, Localize_1.translateLocal)('workspaceActions.updateAreCommentsRequired', {
                oldValue: oldValue,
                categoryName: categoryName,
            });
        }
        if (updatedField === 'Payroll Code' && typeof oldValue === 'string' && typeof newValue === 'string') {
            return (0, Localize_1.translateLocal)('workspaceActions.updateCategoryPayrollCode', {
                oldValue: oldValue,
                categoryName: categoryName,
                newValue: newValue,
            });
        }
        if (updatedField === 'GL Code' && typeof oldValue === 'string' && typeof newValue === 'string') {
            return (0, Localize_1.translateLocal)('workspaceActions.updateCategoryGLCode', {
                oldValue: oldValue,
                categoryName: categoryName,
                newValue: newValue,
            });
        }
        if (updatedField === 'maxExpenseAmount' && (typeof oldValue === 'string' || typeof oldValue === 'number')) {
            return (0, Localize_1.translateLocal)('workspaceActions.updateCategoryMaxExpenseAmount', {
                oldAmount: Number(oldValue) ? (0, CurrencyUtils_1.convertAmountToDisplayString)(Number(oldValue), currency) : undefined,
                newAmount: Number(newValue !== null && newValue !== void 0 ? newValue : 0) ? (0, CurrencyUtils_1.convertAmountToDisplayString)(Number(newValue), currency) : undefined,
                categoryName: categoryName,
            });
        }
        if (updatedField === 'expenseLimitType' && typeof newValue === 'string' && typeof oldValue === 'string') {
            return (0, Localize_1.translateLocal)('workspaceActions.updateCategoryExpenseLimitType', {
                categoryName: categoryName,
                oldValue: oldValue ? (0, Localize_1.translateLocal)("workspace.rules.categoryRules.expenseLimitTypes.".concat(oldValue)) : undefined,
                newValue: (0, Localize_1.translateLocal)("workspace.rules.categoryRules.expenseLimitTypes.".concat(newValue)),
            });
        }
        if (updatedField === 'maxAmountNoReceipt' && typeof oldValue !== 'boolean' && typeof newValue !== 'boolean') {
            var maxExpenseAmountToDisplay_1 = (policy === null || policy === void 0 ? void 0 : policy.maxExpenseAmountNoReceipt) === CONST_1.default.DISABLED_MAX_EXPENSE_VALUE ? 0 : policy === null || policy === void 0 ? void 0 : policy.maxExpenseAmountNoReceipt;
            var formatAmount_1 = function () { var _a; return (0, CurrencyUtils_1.convertToShortDisplayString)(maxExpenseAmountToDisplay_1, (_a = policy === null || policy === void 0 ? void 0 : policy.outputCurrency) !== null && _a !== void 0 ? _a : CONST_1.default.CURRENCY.USD); };
            var getTranslation = function (value) {
                if (value === CONST_1.default.DISABLED_MAX_EXPENSE_VALUE) {
                    return (0, Localize_1.translateLocal)('workspace.rules.categoryRules.requireReceiptsOverList.never');
                }
                if (value === 0) {
                    return (0, Localize_1.translateLocal)('workspace.rules.categoryRules.requireReceiptsOverList.always');
                }
                return (0, Localize_1.translateLocal)('workspace.rules.categoryRules.requireReceiptsOverList.default', { defaultAmount: formatAmount_1() });
            };
            return (0, Localize_1.translateLocal)('workspaceActions.updateCategoryMaxAmountNoReceipt', {
                categoryName: categoryName,
                oldValue: getTranslation(oldValue),
                newValue: getTranslation(newValue),
            });
        }
    }
    if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.SET_CATEGORY_NAME && oldName && newName) {
        return (0, Localize_1.translateLocal)('workspaceActions.setCategoryName', {
            oldName: oldName,
            newName: newName,
        });
    }
    return getReportActionText(action);
}
function getWorkspaceTagUpdateMessage(action) {
    var _a;
    var _b = (_a = getOriginalMessage(action)) !== null && _a !== void 0 ? _a : {}, tagListName = _b.tagListName, tagName = _b.tagName, enabled = _b.enabled, newName = _b.newName, newValue = _b.newValue, oldName = _b.oldName, oldValue = _b.oldValue, updatedField = _b.updatedField, count = _b.count;
    if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_TAG && tagListName && tagName) {
        return (0, Localize_1.translateLocal)('workspaceActions.addTag', {
            tagListName: tagListName,
            tagName: tagName,
        });
    }
    if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_TAG && tagListName && tagName) {
        return (0, Localize_1.translateLocal)('workspaceActions.deleteTag', {
            tagListName: tagListName,
            tagName: tagName,
        });
    }
    if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_MULTIPLE_TAGS && count && tagListName) {
        return (0, Localize_1.translateLocal)('workspaceActions.deleteMultipleTags', {
            count: count,
            tagListName: tagListName,
        });
    }
    if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_ENABLED && tagListName && tagName) {
        return (0, Localize_1.translateLocal)('workspaceActions.updateTagEnabled', {
            tagListName: tagListName,
            tagName: tagName,
            enabled: enabled,
        });
    }
    if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_NAME && tagListName && newName && oldName) {
        return (0, Localize_1.translateLocal)('workspaceActions.updateTagName', {
            tagListName: tagListName,
            newName: newName,
            oldName: oldName,
        });
    }
    if (action.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG &&
        tagListName &&
        (typeof oldValue === 'string' || typeof oldValue === 'undefined') &&
        typeof newValue === 'string' &&
        tagName &&
        updatedField) {
        return (0, Localize_1.translateLocal)('workspaceActions.updateTag', {
            tagListName: tagListName,
            oldValue: oldValue,
            newValue: newValue,
            tagName: tagName,
            updatedField: updatedField,
        });
    }
    return getReportActionText(action);
}
function getTagListNameUpdatedMessage(action) {
    var _a;
    var _b = (_a = getOriginalMessage(action)) !== null && _a !== void 0 ? _a : {}, oldName = _b.oldName, newName = _b.newName;
    if (newName && oldName) {
        return (0, Localize_1.translateLocal)('workspaceActions.updateTagListName', {
            oldName: oldName,
            newName: newName,
        });
    }
    return getReportActionText(action);
}
function getWorkspaceCustomUnitUpdatedMessage(action) {
    var _a;
    var _b = (_a = getOriginalMessage(action)) !== null && _a !== void 0 ? _a : {}, oldValue = _b.oldValue, newValue = _b.newValue, customUnitName = _b.customUnitName, updatedField = _b.updatedField;
    if (customUnitName === 'Distance' && updatedField === 'taxEnabled' && typeof newValue === 'boolean') {
        return (0, Localize_1.translateLocal)('workspaceActions.updateCustomUnitTaxEnabled', {
            newValue: newValue,
        });
    }
    if (customUnitName && typeof oldValue === 'string' && typeof newValue === 'string' && updatedField) {
        return (0, Localize_1.translateLocal)('workspaceActions.updateCustomUnit', {
            customUnitName: customUnitName,
            newValue: newValue,
            oldValue: oldValue,
            updatedField: updatedField,
        });
    }
    return getReportActionText(action);
}
function getWorkspaceCustomUnitRateAddedMessage(action) {
    var _a;
    var _b = (_a = getOriginalMessage(action)) !== null && _a !== void 0 ? _a : {}, customUnitName = _b.customUnitName, rateName = _b.rateName;
    if (customUnitName && rateName) {
        return (0, Localize_1.translateLocal)('workspaceActions.addCustomUnitRate', {
            customUnitName: customUnitName,
            rateName: rateName,
        });
    }
    return getReportActionText(action);
}
function getWorkspaceCustomUnitRateUpdatedMessage(action) {
    var _a;
    var _b = (_a = getOriginalMessage(action)) !== null && _a !== void 0 ? _a : {}, customUnitName = _b.customUnitName, customUnitRateName = _b.customUnitRateName, updatedField = _b.updatedField, oldValue = _b.oldValue, newValue = _b.newValue, newTaxPercentage = _b.newTaxPercentage, oldTaxPercentage = _b.oldTaxPercentage;
    if (customUnitName && customUnitRateName && updatedField === 'rate' && typeof oldValue === 'string' && typeof newValue === 'string') {
        return (0, Localize_1.translateLocal)('workspaceActions.updatedCustomUnitRate', {
            customUnitName: customUnitName,
            customUnitRateName: customUnitRateName,
            updatedField: updatedField,
            oldValue: oldValue,
            newValue: newValue,
        });
    }
    if (customUnitRateName && updatedField === 'taxRateExternalID' && typeof newValue === 'string' && newTaxPercentage) {
        return (0, Localize_1.translateLocal)('workspaceActions.updatedCustomUnitTaxRateExternalID', {
            customUnitRateName: customUnitRateName,
            newValue: newValue,
            newTaxPercentage: newTaxPercentage,
            oldTaxPercentage: oldTaxPercentage,
            oldValue: oldValue,
        });
    }
    if (customUnitRateName && updatedField === 'taxClaimablePercentage' && typeof newValue === 'number' && customUnitRateName) {
        return (0, Localize_1.translateLocal)('workspaceActions.updatedCustomUnitTaxClaimablePercentage', {
            customUnitRateName: customUnitRateName,
            newValue: parseFloat(parseFloat(newValue !== null && newValue !== void 0 ? newValue : 0).toFixed(2)),
            oldValue: typeof oldValue === 'number' ? parseFloat(parseFloat(oldValue !== null && oldValue !== void 0 ? oldValue : 0).toFixed(2)) : undefined,
        });
    }
    return getReportActionText(action);
}
function getWorkspaceCustomUnitRateDeletedMessage(action) {
    var _a;
    var _b = (_a = getOriginalMessage(action)) !== null && _a !== void 0 ? _a : {}, customUnitName = _b.customUnitName, rateName = _b.rateName;
    if (customUnitName && rateName) {
        return (0, Localize_1.translateLocal)('workspaceActions.deleteCustomUnitRate', {
            customUnitName: customUnitName,
            rateName: rateName,
        });
    }
    return getReportActionText(action);
}
function getWorkspaceReportFieldAddMessage(action) {
    var _a;
    var _b = (_a = getOriginalMessage(action)) !== null && _a !== void 0 ? _a : {}, fieldName = _b.fieldName, fieldType = _b.fieldType;
    if (fieldName && fieldType) {
        return (0, Localize_1.translateLocal)('workspaceActions.addedReportField', {
            fieldName: fieldName,
            fieldType: (0, Localize_1.translateLocal)((0, WorkspaceReportFieldUtils_1.getReportFieldTypeTranslationKey)(fieldType)).toLowerCase(),
        });
    }
    return getReportActionText(action);
}
function getWorkspaceReportFieldUpdateMessage(action) {
    var _a;
    var _b = (_a = getOriginalMessage(action)) !== null && _a !== void 0 ? _a : {}, updateType = _b.updateType, fieldName = _b.fieldName, defaultValue = _b.defaultValue, optionName = _b.optionName, allEnabled = _b.allEnabled, optionEnabled = _b.optionEnabled, toggledOptionsCount = _b.toggledOptionsCount;
    if (updateType === 'updatedDefaultValue' && fieldName && defaultValue) {
        return (0, Localize_1.translateLocal)('workspaceActions.updateReportFieldDefaultValue', {
            fieldName: fieldName,
            defaultValue: defaultValue,
        });
    }
    if (updateType === 'addedOption' && fieldName && optionName) {
        return (0, Localize_1.translateLocal)('workspaceActions.addedReportFieldOption', {
            fieldName: fieldName,
            optionName: optionName,
        });
    }
    if (updateType === 'changedOptionDisabled' && fieldName && optionName) {
        return (0, Localize_1.translateLocal)('workspaceActions.updateReportFieldOptionDisabled', {
            fieldName: fieldName,
            optionName: optionName,
            optionEnabled: !!optionEnabled,
        });
    }
    if (updateType === 'updatedAllDisabled' && fieldName && optionName) {
        return (0, Localize_1.translateLocal)('workspaceActions.updateReportFieldAllOptionsDisabled', {
            fieldName: fieldName,
            optionName: optionName,
            allEnabled: !!allEnabled,
            toggledOptionsCount: toggledOptionsCount,
        });
    }
    if (updateType === 'removedOption' && fieldName && optionName) {
        return (0, Localize_1.translateLocal)('workspaceActions.removedReportFieldOption', {
            fieldName: fieldName,
            optionName: optionName,
        });
    }
    return getReportActionText(action);
}
function getWorkspaceReportFieldDeleteMessage(action) {
    var _a;
    var _b = (_a = getOriginalMessage(action)) !== null && _a !== void 0 ? _a : {}, fieldType = _b.fieldType, fieldName = _b.fieldName;
    if (fieldType && fieldName) {
        return (0, Localize_1.translateLocal)('workspaceActions.deleteReportField', {
            fieldName: fieldName,
            fieldType: (0, Localize_1.translateLocal)((0, WorkspaceReportFieldUtils_1.getReportFieldTypeTranslationKey)(fieldType)).toLowerCase(),
        });
    }
    return getReportActionText(action);
}
function getWorkspaceUpdateFieldMessage(action) {
    var _a;
    var _b = (_a = getOriginalMessage(action)) !== null && _a !== void 0 ? _a : {}, newValue = _b.newValue, oldValue = _b.oldValue, updatedField = _b.updatedField;
    var newValueTranslationKey = CONST_1.default.POLICY.APPROVAL_MODE_TRANSLATION_KEYS[newValue];
    var oldValueTranslationKey = CONST_1.default.POLICY.APPROVAL_MODE_TRANSLATION_KEYS[oldValue];
    if (updatedField && updatedField === CONST_1.default.POLICY.COLLECTION_KEYS.APPROVAL_MODE && oldValueTranslationKey && newValueTranslationKey) {
        return (0, Localize_1.translateLocal)('workspaceActions.updateApprovalMode', {
            newValue: (0, Localize_1.translateLocal)("workspaceApprovalModes.".concat(newValueTranslationKey)),
            oldValue: (0, Localize_1.translateLocal)("workspaceApprovalModes.".concat(oldValueTranslationKey)),
            fieldName: updatedField,
        });
    }
    if (updatedField && updatedField === CONST_1.default.POLICY.EXPENSE_REPORT_RULES.PREVENT_SELF_APPROVAL && typeof oldValue === 'string' && typeof newValue === 'string') {
        return (0, Localize_1.translateLocal)('workspaceActions.preventSelfApproval', {
            oldValue: oldValue,
            newValue: newValue,
        });
    }
    if (updatedField && updatedField === CONST_1.default.POLICY.EXPENSE_REPORT_RULES.MAX_EXPENSE_AGE && typeof oldValue === 'string' && typeof newValue === 'string') {
        return (0, Localize_1.translateLocal)('workspaceActions.updateMaxExpenseAge', {
            oldValue: oldValue,
            newValue: newValue,
        });
    }
    if (updatedField &&
        updatedField === CONST_1.default.POLICY.COLLECTION_KEYS.AUTOREPORTING_OFFSET &&
        (typeof oldValue === 'string' || typeof oldValue === 'number') &&
        (typeof newValue === 'string' || typeof newValue === 'number')) {
        var getAutoReportingOffsetToDisplay = function (autoReportingOffset) {
            if (autoReportingOffset === CONST_1.default.POLICY.AUTO_REPORTING_OFFSET.LAST_DAY_OF_MONTH) {
                return (0, Localize_1.translateLocal)('workflowsPage.frequencies.lastDayOfMonth');
            }
            if (autoReportingOffset === CONST_1.default.POLICY.AUTO_REPORTING_OFFSET.LAST_BUSINESS_DAY_OF_MONTH) {
                return (0, Localize_1.translateLocal)('workflowsPage.frequencies.lastBusinessDayOfMonth');
            }
            if (typeof autoReportingOffset === 'number') {
                return (0, LocaleDigitUtils_1.toLocaleOrdinal)(IntlStore_1.default.getCurrentLocale(), autoReportingOffset, false);
            }
            return '';
        };
        return (0, Localize_1.translateLocal)('workspaceActions.updateMonthlyOffset', {
            newValue: getAutoReportingOffsetToDisplay(newValue),
            oldValue: getAutoReportingOffsetToDisplay(oldValue),
        });
    }
    return getReportActionText(action);
}
function getPolicyChangeLogMaxExpenseAmountNoReceiptMessage(action) {
    var _a;
    var _b = (_a = getOriginalMessage(action)) !== null && _a !== void 0 ? _a : {}, oldMaxExpenseAmountNoReceipt = _b.oldMaxExpenseAmountNoReceipt, newMaxExpenseAmountNoReceipt = _b.newMaxExpenseAmountNoReceipt, currency = _b.currency;
    if (typeof oldMaxExpenseAmountNoReceipt === 'number' && typeof newMaxExpenseAmountNoReceipt === 'number') {
        return (0, Localize_1.translateLocal)('workspaceActions.updateMaxExpenseAmountNoReceipt', {
            oldValue: (0, CurrencyUtils_1.convertToDisplayString)(oldMaxExpenseAmountNoReceipt, currency),
            newValue: (0, CurrencyUtils_1.convertToDisplayString)(newMaxExpenseAmountNoReceipt, currency),
        });
    }
    return getReportActionText(action);
}
function getPolicyChangeLogMaxExpenseAmountMessage(action) {
    var _a;
    var _b = (_a = getOriginalMessage(action)) !== null && _a !== void 0 ? _a : {}, oldMaxExpenseAmount = _b.oldMaxExpenseAmount, newMaxExpenseAmount = _b.newMaxExpenseAmount, currency = _b.currency;
    if (typeof oldMaxExpenseAmount === 'number' && typeof newMaxExpenseAmount === 'number') {
        return (0, Localize_1.translateLocal)('workspaceActions.updateMaxExpenseAmount', {
            oldValue: (0, CurrencyUtils_1.convertToDisplayString)(oldMaxExpenseAmount, currency),
            newValue: (0, CurrencyUtils_1.convertToDisplayString)(newMaxExpenseAmount, currency),
        });
    }
    return getReportActionText(action);
}
function getPolicyChangeLogDefaultBillableMessage(action) {
    var _a;
    var _b = (_a = getOriginalMessage(action)) !== null && _a !== void 0 ? _a : {}, oldDefaultBillable = _b.oldDefaultBillable, newDefaultBillable = _b.newDefaultBillable;
    if (typeof oldDefaultBillable === 'string' && typeof newDefaultBillable === 'string') {
        return (0, Localize_1.translateLocal)('workspaceActions.updateDefaultBillable', {
            oldValue: oldDefaultBillable,
            newValue: newDefaultBillable,
        });
    }
    return getReportActionText(action);
}
function getPolicyChangeLogDefaultTitleEnforcedMessage(action) {
    var _a;
    var value = ((_a = getOriginalMessage(action)) !== null && _a !== void 0 ? _a : {}).value;
    if (typeof value === 'boolean') {
        return (0, Localize_1.translateLocal)('workspaceActions.updateDefaultTitleEnforced', {
            value: value,
        });
    }
    return getReportActionText(action);
}
function getPolicyChangeLogDeleteMemberMessage(reportAction) {
    var _a, _b;
    if (!isPolicyChangeLogDeleteMemberMessage(reportAction)) {
        return '';
    }
    var originalMessage = getOriginalMessage(reportAction);
    var email = (_a = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.email) !== null && _a !== void 0 ? _a : '';
    var role = (0, Localize_1.translateLocal)('workspace.common.roleName', { role: (_b = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.role) !== null && _b !== void 0 ? _b : '' }).toLowerCase();
    return (0, Localize_1.translateLocal)('report.actions.type.removeMember', { email: email, role: role });
}
function getAddedConnectionMessage(reportAction) {
    if (!isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_INTEGRATION)) {
        return '';
    }
    var originalMessage = getOriginalMessage(reportAction);
    var connectionName = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.connectionName;
    return connectionName ? (0, Localize_1.translateLocal)('report.actions.type.addedConnection', { connectionName: connectionName }) : '';
}
function getRemovedConnectionMessage(reportAction) {
    if (!isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_INTEGRATION)) {
        return '';
    }
    var originalMessage = getOriginalMessage(reportAction);
    var connectionName = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.connectionName;
    return connectionName ? (0, Localize_1.translateLocal)('report.actions.type.removedConnection', { connectionName: connectionName }) : '';
}
function getRenamedAction(reportAction, isExpenseReport, actorName) {
    var _a, _b;
    var originalMessage = getOriginalMessage(reportAction);
    return (0, Localize_1.translateLocal)('newRoomPage.renamedRoomAction', {
        actorName: actorName,
        isExpenseReport: isExpenseReport,
        oldName: (_a = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.oldName) !== null && _a !== void 0 ? _a : '',
        newName: (_b = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.newName) !== null && _b !== void 0 ? _b : '',
    });
}
function getAddedApprovalRuleMessage(reportAction) {
    var _a;
    var _b = (_a = getOriginalMessage(reportAction)) !== null && _a !== void 0 ? _a : {}, name = _b.name, approverAccountID = _b.approverAccountID, approverEmail = _b.approverEmail, field = _b.field, approverName = _b.approverName;
    if (name && approverAccountID && approverEmail && field && approverName) {
        return (0, Localize_1.translateLocal)('workspaceActions.addApprovalRule', {
            approverEmail: approverEmail,
            approverName: approverName,
            field: field,
            name: name,
        });
    }
    return getReportActionText(reportAction);
}
function getDeletedApprovalRuleMessage(reportAction) {
    var _a;
    var _b = (_a = getOriginalMessage(reportAction)) !== null && _a !== void 0 ? _a : {}, name = _b.name, approverAccountID = _b.approverAccountID, approverEmail = _b.approverEmail, field = _b.field, approverName = _b.approverName;
    if (name && approverAccountID && approverEmail && field && approverName) {
        return (0, Localize_1.translateLocal)('workspaceActions.deleteApprovalRule', {
            approverEmail: approverEmail,
            approverName: approverName,
            field: field,
            name: name,
        });
    }
    return getReportActionText(reportAction);
}
function getUpdatedApprovalRuleMessage(reportAction) {
    var _a;
    var _b = (_a = getOriginalMessage(reportAction)) !== null && _a !== void 0 ? _a : {}, field = _b.field, oldApproverEmail = _b.oldApproverEmail, oldApproverName = _b.oldApproverName, newApproverEmail = _b.newApproverEmail, newApproverName = _b.newApproverName, name = _b.name;
    if (field && oldApproverEmail && newApproverEmail && name) {
        return (0, Localize_1.translateLocal)('workspaceActions.updateApprovalRule', {
            field: field,
            name: name,
            newApproverEmail: newApproverEmail,
            newApproverName: newApproverName,
            oldApproverEmail: oldApproverEmail,
            oldApproverName: oldApproverName,
        });
    }
    return getReportActionText(reportAction);
}
function getRemovedFromApprovalChainMessage(reportAction) {
    var _a;
    var originalMessage = getOriginalMessage(reportAction);
    var submittersNames = (0, PersonalDetailsUtils_1.getPersonalDetailsByIDs)({
        accountIDs: (_a = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.submittersAccountIDs) !== null && _a !== void 0 ? _a : [],
        currentUserAccountID: currentUserAccountID !== null && currentUserAccountID !== void 0 ? currentUserAccountID : CONST_1.default.DEFAULT_NUMBER_ID,
    }).map(function (_a) {
        var _b;
        var displayName = _a.displayName, login = _a.login;
        return (_b = displayName !== null && displayName !== void 0 ? displayName : login) !== null && _b !== void 0 ? _b : 'Unknown Submitter';
    });
    return (0, Localize_1.translateLocal)('workspaceActions.removedFromApprovalWorkflow', { submittersNames: submittersNames, count: submittersNames.length });
}
function getDemotedFromWorkspaceMessage(reportAction) {
    var _a;
    var originalMessage = getOriginalMessage(reportAction);
    var policyName = (_a = originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.policyName) !== null && _a !== void 0 ? _a : (0, Localize_1.translateLocal)('workspace.common.workspace');
    var oldRole = (0, Localize_1.translateLocal)('workspace.common.roleName', { role: originalMessage === null || originalMessage === void 0 ? void 0 : originalMessage.oldRole }).toLowerCase();
    return (0, Localize_1.translateLocal)('workspaceActions.demotedFromWorkspace', { policyName: policyName, oldRole: oldRole });
}
function getUpdatedAuditRateMessage(reportAction) {
    var _a;
    var _b = (_a = getOriginalMessage(reportAction)) !== null && _a !== void 0 ? _a : {}, oldAuditRate = _b.oldAuditRate, newAuditRate = _b.newAuditRate;
    if (typeof oldAuditRate !== 'number' || typeof newAuditRate !== 'number') {
        return getReportActionText(reportAction);
    }
    return (0, Localize_1.translateLocal)('workspaceActions.updatedAuditRate', { oldAuditRate: oldAuditRate, newAuditRate: newAuditRate });
}
function getUpdatedManualApprovalThresholdMessage(reportAction) {
    var _a;
    var _b = (_a = getOriginalMessage(reportAction)) !== null && _a !== void 0 ? _a : {}, oldLimit = _b.oldLimit, newLimit = _b.newLimit, _c = _b.currency, currency = _c === void 0 ? CONST_1.default.CURRENCY.USD : _c;
    if (typeof oldLimit !== 'number' || typeof oldLimit !== 'number') {
        return getReportActionText(reportAction);
    }
    return (0, Localize_1.translateLocal)('workspaceActions.updatedManualApprovalThreshold', { oldLimit: (0, CurrencyUtils_1.convertToDisplayString)(oldLimit, currency), newLimit: (0, CurrencyUtils_1.convertToDisplayString)(newLimit, currency) });
}
function isCardIssuedAction(reportAction) {
    return (isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.CARD_ISSUED) ||
        isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.CARD_ISSUED_VIRTUAL) ||
        isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS) ||
        isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.CARD_ASSIGNED));
}
function shouldShowAddMissingDetails(actionName, card) {
    var missingDetails = !(privatePersonalDetails === null || privatePersonalDetails === void 0 ? void 0 : privatePersonalDetails.legalFirstName) ||
        !(privatePersonalDetails === null || privatePersonalDetails === void 0 ? void 0 : privatePersonalDetails.legalLastName) ||
        !(privatePersonalDetails === null || privatePersonalDetails === void 0 ? void 0 : privatePersonalDetails.dob) ||
        !(privatePersonalDetails === null || privatePersonalDetails === void 0 ? void 0 : privatePersonalDetails.phoneNumber) ||
        (0, EmptyObject_1.isEmptyObject)(privatePersonalDetails === null || privatePersonalDetails === void 0 ? void 0 : privatePersonalDetails.addresses) ||
        privatePersonalDetails.addresses.length === 0;
    return actionName === CONST_1.default.REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS && ((card === null || card === void 0 ? void 0 : card.state) === CONST_1.default.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED || missingDetails);
}
function getJoinRequestMessage(reportAction) {
    var _a, _b, _c, _d, _e, _f;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = (0, PolicyUtils_1.getPolicy)((_a = getOriginalMessage(reportAction)) === null || _a === void 0 ? void 0 : _a.policyID);
    var userDetail = (0, PersonalDetailsUtils_1.getPersonalDetailByEmail)((_c = (_b = getOriginalMessage(reportAction)) === null || _b === void 0 ? void 0 : _b.email) !== null && _c !== void 0 ? _c : '');
    var userName = (userDetail === null || userDetail === void 0 ? void 0 : userDetail.firstName) ? "".concat(userDetail.displayName, " (").concat(userDetail.login, ")") : ((_d = userDetail === null || userDetail === void 0 ? void 0 : userDetail.login) !== null && _d !== void 0 ? _d : (_e = getOriginalMessage(reportAction)) === null || _e === void 0 ? void 0 : _e.email);
    return (0, Localize_1.translateLocal)('workspace.inviteMessage.joinRequest', { user: userName !== null && userName !== void 0 ? userName : '', workspaceName: (_f = policy === null || policy === void 0 ? void 0 : policy.name) !== null && _f !== void 0 ? _f : '' });
}
function getCardIssuedMessage(_a) {
    var _b, _c;
    var reportAction = _a.reportAction, _d = _a.shouldRenderHTML, shouldRenderHTML = _d === void 0 ? false : _d, _e = _a.policyID, policyID = _e === void 0 ? '-1' : _e, card = _a.card;
    var cardIssuedActionOriginalMessage = isCardIssuedAction(reportAction) ? getOriginalMessage(reportAction) : undefined;
    var assigneeAccountID = (_b = cardIssuedActionOriginalMessage === null || cardIssuedActionOriginalMessage === void 0 ? void 0 : cardIssuedActionOriginalMessage.assigneeAccountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID;
    var cardID = (_c = cardIssuedActionOriginalMessage === null || cardIssuedActionOriginalMessage === void 0 ? void 0 : cardIssuedActionOriginalMessage.cardID) !== null && _c !== void 0 ? _c : CONST_1.default.DEFAULT_NUMBER_ID;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var isPolicyAdmin = (0, PolicyUtils_1.isPolicyAdmin)((0, PolicyUtils_1.getPolicy)(policyID));
    var assignee = shouldRenderHTML ? "<mention-user accountID=\"".concat(assigneeAccountID, "\"/>") : Parser_1.default.htmlToText("<mention-user accountID=\"".concat(assigneeAccountID, "\"/>"));
    var navigateRoute = isPolicyAdmin ? ROUTES_1.default.EXPENSIFY_CARD_DETAILS.getRoute(policyID, String(cardID)) : ROUTES_1.default.SETTINGS_DOMAIN_CARD_DETAIL.getRoute(String(cardID));
    var expensifyCardLink = shouldRenderHTML && !!card ? "<a href='".concat(environmentURL, "/").concat(navigateRoute, "'>").concat((0, Localize_1.translateLocal)('cardPage.expensifyCard'), "</a>") : (0, Localize_1.translateLocal)('cardPage.expensifyCard');
    var isAssigneeCurrentUser = currentUserAccountID === assigneeAccountID;
    var companyCardLink = shouldRenderHTML && isAssigneeCurrentUser
        ? "<a href='".concat(environmentURL, "/").concat(ROUTES_1.default.SETTINGS_WALLET, "'>").concat((0, Localize_1.translateLocal)('workspace.companyCards.companyCard'), "</a>")
        : (0, Localize_1.translateLocal)('workspace.companyCards.companyCard');
    var shouldShowAddMissingDetailsMessage = !isAssigneeCurrentUser || shouldShowAddMissingDetails(reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName, card);
    switch (reportAction === null || reportAction === void 0 ? void 0 : reportAction.actionName) {
        case CONST_1.default.REPORT.ACTIONS.TYPE.CARD_ISSUED:
            return (0, Localize_1.translateLocal)('workspace.expensifyCard.issuedCard', { assignee: assignee });
        case CONST_1.default.REPORT.ACTIONS.TYPE.CARD_ISSUED_VIRTUAL:
            return (0, Localize_1.translateLocal)('workspace.expensifyCard.issuedCardVirtual', { assignee: assignee, link: expensifyCardLink });
        case CONST_1.default.REPORT.ACTIONS.TYPE.CARD_ASSIGNED:
            return (0, Localize_1.translateLocal)('workspace.companyCards.assignedCard', { assignee: assignee, link: companyCardLink });
        case CONST_1.default.REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS:
            return (0, Localize_1.translateLocal)("workspace.expensifyCard.".concat(shouldShowAddMissingDetailsMessage ? 'issuedCardNoShippingDetails' : 'addedShippingDetails'), { assignee: assignee });
        default:
            return '';
    }
}
function getReportActionsLength() {
    return Object.keys(allReportActions !== null && allReportActions !== void 0 ? allReportActions : {}).length;
}
function getReportActions(report) {
    return allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.reportID)];
}
/**
 * @private
 */
function wasActionCreatedWhileOffline(action, isOffline, lastOfflineAt, lastOnlineAt, locale) {
    // The user has never gone offline or never come back online
    if (!lastOfflineAt || !lastOnlineAt) {
        return false;
    }
    var actionCreatedAt = DateUtils_1.default.getLocalDateFromDatetime(locale, action.created);
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
    if (locale === void 0) { locale = CONST_1.default.LOCALES.DEFAULT; }
    var wasByCurrentUser = wasActionTakenByCurrentUser(action);
    var wasCreatedOffline = wasActionCreatedWhileOffline(action, isOffline, lastOfflineAt, lastOnlineAt, locale);
    return !wasByCurrentUser && wasCreatedOffline && !(action.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD || action.isOptimisticAction);
}
function getReportActionFromExpensifyCard(cardID) {
    return Object.values(allReportActions !== null && allReportActions !== void 0 ? allReportActions : {})
        .map(function (reportActions) { return Object.values(reportActions !== null && reportActions !== void 0 ? reportActions : {}); })
        .flat()
        .find(function (reportAction) {
        var cardIssuedActionOriginalMessage = isActionOfType(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.CARD_ISSUED_VIRTUAL) ? getOriginalMessage(reportAction) : undefined;
        return (cardIssuedActionOriginalMessage === null || cardIssuedActionOriginalMessage === void 0 ? void 0 : cardIssuedActionOriginalMessage.cardID) === cardID;
    });
}
function getIntegrationSyncFailedMessage(action, policyID) {
    var _a;
    var _b = (_a = getOriginalMessage(action)) !== null && _a !== void 0 ? _a : { label: '', errorMessage: '' }, label = _b.label, errorMessage = _b.errorMessage;
    var workspaceAccountingLink = "".concat(environmentURL, "/").concat(ROUTES_1.default.POLICY_ACCOUNTING.getRoute(policyID));
    return (0, Localize_1.translateLocal)('report.actions.type.integrationSyncFailed', { label: label, errorMessage: errorMessage, workspaceAccountingLink: workspaceAccountingLink });
}
