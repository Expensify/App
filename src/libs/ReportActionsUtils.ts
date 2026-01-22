import {format} from 'date-fns';
import {fastMerge, Str} from 'expensify-common';
import clone from 'lodash/clone';
import isEmpty from 'lodash/isEmpty';
import type {NullishDeep, OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {LocaleContextProps, LocalizedTranslate} from '@components/LocaleContextProvider';
import usePrevious from '@hooks/usePrevious';
import {isHarvestCreatedExpenseReport, isPolicyExpenseChat} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Card, OnyxInputOrEntry, OriginalMessageIOU, PersonalDetails, Policy, PrivatePersonalDetails, ReportMetadata, ReportNameValuePairs} from '@src/types/onyx';
import type {
    JoinWorkspaceResolution,
    OriginalMessageChangeLog,
    OriginalMessageExportIntegration,
    OriginalMessageMarkedReimbursed,
    OriginalMessageUnreportedTransaction,
} from '@src/types/onyx/OriginalMessage';
import type {PolicyReportFieldType} from '@src/types/onyx/Policy';
import type Report from '@src/types/onyx/Report';
import type ReportAction from '@src/types/onyx/ReportAction';
import type {Message, OldDotReportAction, OriginalMessage, ReportActions} from '@src/types/onyx/ReportAction';
import type ReportActionName from '@src/types/onyx/ReportActionName';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {isCardPendingActivate} from './CardUtils';
import {getDecodedCategoryName} from './CategoryUtils';
import {convertAmountToDisplayString, convertToDisplayString, convertToShortDisplayString} from './CurrencyUtils';
import DateUtils from './DateUtils';
import {getEnvironmentURL, getOldDotEnvironmentURL} from './Environment/Environment';
import getBase62ReportID from './getBase62ReportID';
import {isReportMessageAttachment} from './isReportMessageAttachment';
import {toLocaleOrdinal} from './LocaleDigitUtils';
import {formatPhoneNumber} from './LocalePhoneNumber';
import {formatMessageElementList, translateLocal} from './Localize';
import Log from './Log';
import type {MessageElementBase, MessageTextElement} from './MessageElement';
import getReportURLForCurrentContext from './Navigation/helpers/getReportURLForCurrentContext';
import Parser from './Parser';
import {arePersonalDetailsMissing, getEffectiveDisplayName, getPersonalDetailByEmail, getPersonalDetailsByIDs} from './PersonalDetailsUtils';
import {getPolicy, isPolicyAdmin as isPolicyAdminPolicyUtils} from './PolicyUtils';
import type {getReportName, OptimisticIOUReportAction, PartialReportAction} from './ReportUtils';
import StringUtils from './StringUtils';
import {getReportFieldTypeTranslationKey} from './WorkspaceReportFieldUtils';

type LastVisibleMessage = {
    lastMessageText: string;
    lastMessageHtml?: string;
};

type MemberChangeMessageUserMentionElement = {
    readonly kind: 'userMention';
    readonly accountID: number;
} & MessageElementBase;

type MemberChangeMessageRoomReferenceElement = {
    readonly kind: 'roomReference';
    readonly roomName: string;
    readonly roomID: number;
} & MessageElementBase;

type MemberChangeMessageElement = MessageTextElement | MemberChangeMessageUserMentionElement | MemberChangeMessageRoomReferenceElement;

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

let allReports: OnyxCollection<Report>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => {
        allReports = value;
    },
});

let isNetworkOffline = false;
Onyx.connect({
    key: ONYXKEYS.NETWORK,
    callback: (val) => (isNetworkOffline = val?.isOffline ?? false),
});

let deprecatedCurrentUserAccountID: number | undefined;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        // When signed out, value is undefined
        if (!value) {
            return;
        }

        deprecatedCurrentUserAccountID = value.accountID;
    },
});

let allReportNameValuePair: OnyxCollection<ReportNameValuePairs>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS,
    waitForCollectionCallback: true,
    callback: (value) => {
        if (!value) {
            return;
        }
        allReportNameValuePair = value;
    },
});

let environmentURL: string;
getEnvironmentURL().then((url: string) => (environmentURL = url));

let oldDotEnvironmentURL: string;
getOldDotEnvironmentURL().then((url: string) => (oldDotEnvironmentURL = url));

/*
 * Url to the Xero non reimbursable expenses list
 */
const XERO_NON_REIMBURSABLE_EXPENSES_URL = 'https://go.xero.com/Bank/BankAccounts.aspx';

/*
 * Url to the NetSuite global search, which should be suffixed with the reportID.
 */
const NETSUITE_NON_REIMBURSABLE_EXPENSES_URL_PREFIX =
    'https://system.netsuite.com/app/common/search/ubersearchresults.nl?quicksearch=T&searchtype=Uber&frame=be&Uber_NAMEtype=KEYWORDSTARTSWITH&Uber_NAME=';

/*
 * Url prefix to any Salesforce transaction or transaction list.
 */
const SALESFORCE_EXPENSES_URL_PREFIX = 'https://login.salesforce.com/';

/*
 * Url to the QBO expenses list
 */
const QBO_EXPENSES_URL = 'https://qbo.intuit.com/app/expenses';

const POLICY_CHANGE_LOG_ARRAY = new Set<ReportActionName>(Object.values(CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG));

const ROOM_CHANGE_LOG_ARRAY = new Set<ReportActionName>(Object.values(CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG));

const MEMBER_CHANGE_ARRAY = new Set<ReportActionName>([
    CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM,
    CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.REMOVE_FROM_ROOM,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.INVITE_TO_ROOM,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.REMOVE_FROM_ROOM,
    CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.LEAVE_POLICY,
]);

const deprecatedOldDotReportActions = new Set<ReportActionName>([
    CONST.REPORT.ACTIONS.TYPE.DELETED_ACCOUNT,
    CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_REQUESTED,
    CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_SETUP_REQUESTED,
    CONST.REPORT.ACTIONS.TYPE.DONATION,
    CONST.REPORT.ACTIONS.TYPE.REIMBURSED,
]);

function isCreatedAction(reportAction: OnyxInputOrEntry<ReportAction>): boolean {
    return reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED;
}

function isDeletedAction(reportAction: OnyxInputOrEntry<ReportAction | OptimisticIOUReportAction>): boolean {
    if (isInviteOrRemovedAction(reportAction) || isActionableMentionWhisper(reportAction) || isActionableCardFraudAlert(reportAction)) {
        return false;
    }

    if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.HOLD || reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.UNHOLD) {
        return false;
    }

    // for report actions with this type we get an empty array as message by design
    if (
        reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DIRECTOR_INFORMATION_REQUIRED ||
        reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED_REPORT_FOR_UNAPPROVED_TRANSACTIONS
    ) {
        return false;
    }

    const message = reportAction?.message ?? [];

    if (!Array.isArray(message)) {
        return message?.html === '' || !!message?.deleted;
    }
    const originalMessage = getOriginalMessage(reportAction);

    // A legacy deleted comment has either an empty array or an object with html field with empty string as value
    const isLegacyDeletedComment = message.length === 0 || message.at(0)?.html === '';

    return isLegacyDeletedComment || !!message.at(0)?.deleted || (!!originalMessage && 'deleted' in originalMessage && !!originalMessage?.deleted);
}

/**
 * This function will add attachment ID attribute on img and video HTML tags inside the passed html content
 * of a report action. This attachment id is the reportActionID concatenated with the order index that the attachment
 * appears inside the report action message so as to identify attachments with identical source inside a report action.
 */
function getHtmlWithAttachmentID(html: string, reportActionID: string | undefined) {
    if (!reportActionID) {
        return html;
    }

    let attachmentID = 0;
    return html.replaceAll(/<img |<video /g, (m) => m.concat(`${CONST.ATTACHMENT_ID_ATTRIBUTE}="${reportActionID}_${++attachmentID}" `));
}

function getReportActionMessage(reportAction: PartialReportAction) {
    return Array.isArray(reportAction?.message) ? reportAction.message.at(0) : reportAction?.message;
}

function isDeletedParentAction(reportAction: OnyxInputOrEntry<ReportAction>): boolean {
    return (getReportActionMessage(reportAction)?.isDeletedParentAction ?? false) && (reportAction?.childVisibleActionCount ?? 0) > 0;
}

function isReversedTransaction(reportAction: OnyxInputOrEntry<ReportAction | OptimisticIOUReportAction>) {
    return (getReportActionMessage(reportAction)?.isReversedTransaction ?? false) && ((reportAction as ReportAction)?.childVisibleActionCount ?? 0) > 0;
}

function isPendingRemove(reportAction: OnyxInputOrEntry<ReportAction>): boolean {
    return getReportActionMessage(reportAction)?.moderationDecision?.decision === CONST.MODERATION.MODERATOR_DECISION_PENDING_REMOVE;
}

function isPendingHide(reportAction: OnyxInputOrEntry<ReportAction>): boolean {
    return getReportActionMessage(reportAction)?.moderationDecision?.decision === CONST.MODERATION.MODERATOR_DECISION_PENDING_HIDE;
}

function isMoneyRequestAction(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.IOU);
}

function isExportedToIntegrationAction(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION);
}

function isReportPreviewAction(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW);
}

function isSubmittedAction(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.SUBMITTED> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.SUBMITTED);
}

function isSubmittedAndClosedAction(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED);
}

function isDynamicExternalWorkflowSubmitAction(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.SUBMITTED> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.SUBMITTED) && getOriginalMessage(reportAction)?.workflow === CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL;
}

function isMarkAsClosedAction(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.CLOSED> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.CLOSED) && !!getOriginalMessage(reportAction)?.amount;
}

function isApprovedAction(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.APPROVED> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.APPROVED);
}

function isUnapprovedAction(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.UNAPPROVED> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.UNAPPROVED);
}

function isForwardedAction(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.FORWARDED> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.FORWARDED);
}

function isDynamicExternalWorkflowSubmitFailedAction(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.DEW_SUBMIT_FAILED> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.DEW_SUBMIT_FAILED);
}

function getMostRecentActiveDEWSubmitFailedAction(reportActions: OnyxEntry<ReportActions> | ReportAction[]): ReportAction | undefined {
    const actionsArray = Array.isArray(reportActions) ? reportActions : Object.values(reportActions ?? {});

    // Find the most recent DEW_SUBMIT_FAILED and SUBMITTED actions
    let mostRecentDewSubmitFailedAction: ReportAction | undefined;
    let mostRecentSubmittedAction: ReportAction | undefined;

    for (const action of actionsArray) {
        if (isDynamicExternalWorkflowSubmitFailedAction(action)) {
            if (!mostRecentDewSubmitFailedAction || (action.created && mostRecentDewSubmitFailedAction.created && action.created > mostRecentDewSubmitFailedAction.created)) {
                mostRecentDewSubmitFailedAction = action;
            }
        } else if (isSubmittedAction(action)) {
            if (!mostRecentSubmittedAction || (action.created && mostRecentSubmittedAction.created && action.created > mostRecentSubmittedAction.created)) {
                mostRecentSubmittedAction = action;
            }
        }
    }

    if (!mostRecentDewSubmitFailedAction) {
        return undefined;
    }

    // Return the DEW action if there's no SUBMITTED action, or if DEW_SUBMIT_FAILED is more recent
    if (!mostRecentSubmittedAction || mostRecentDewSubmitFailedAction.created > mostRecentSubmittedAction.created) {
        return mostRecentDewSubmitFailedAction;
    }

    return undefined;
}

/**
 * Checks if there's a pending DEW submission in progress.
 * Uses reportMetadata.pendingExpenseAction which is set during submit and cleared on success/failure.
 */
function hasPendingDEWSubmit(reportMetadata: OnyxEntry<ReportMetadata>, isDEWPolicy: boolean): boolean {
    if (!isDEWPolicy) {
        return false;
    }
    return reportMetadata?.pendingExpenseAction === CONST.EXPENSE_PENDING_ACTION.SUBMIT;
}

function isDynamicExternalWorkflowApproveFailedAction(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.DEW_APPROVE_FAILED> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.DEW_APPROVE_FAILED);
}

/**
 * Actions that clear a DEW_APPROVE_FAILED error (approval succeeded or report was retracted/reopened).
 */
function isActionThatSupersedesDEWApproveFailure(action: ReportAction): boolean {
    return isApprovedAction(action) || isForwardedAction(action) || isRetractedAction(action) || isReopenedAction(action);
}

function getMostRecentActiveDEWApproveFailedAction(reportActions: OnyxEntry<ReportActions> | ReportAction[]): ReportAction | undefined {
    const actionsArray = Array.isArray(reportActions) ? reportActions : Object.values(reportActions ?? {});

    let mostRecentDewApproveFailedAction: ReportAction | undefined;
    let mostRecentSupersedingAction: ReportAction | undefined;

    for (const action of actionsArray) {
        if (isDynamicExternalWorkflowApproveFailedAction(action)) {
            if (!mostRecentDewApproveFailedAction || (action.created && mostRecentDewApproveFailedAction.created && action.created > mostRecentDewApproveFailedAction.created)) {
                mostRecentDewApproveFailedAction = action;
            }
        } else if (isActionThatSupersedesDEWApproveFailure(action)) {
            if (!mostRecentSupersedingAction || (action.created && mostRecentSupersedingAction.created && action.created > mostRecentSupersedingAction.created)) {
                mostRecentSupersedingAction = action;
            }
        }
    }

    if (!mostRecentDewApproveFailedAction) {
        return undefined;
    }

    // Return the DEW action if there's no superseding action, or if DEW_APPROVE_FAILED is more recent
    if (!mostRecentSupersedingAction || mostRecentDewApproveFailedAction.created > mostRecentSupersedingAction.created) {
        return mostRecentDewApproveFailedAction;
    }

    return undefined;
}

function hasPendingDEWApprove(reportMetadata: OnyxEntry<ReportMetadata>, isDEWPolicy: boolean): boolean {
    if (!isDEWPolicy) {
        return false;
    }
    return reportMetadata?.pendingExpenseAction === CONST.EXPENSE_PENDING_ACTION.APPROVE;
}

function isDynamicExternalWorkflowForwardedAction(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.FORWARDED> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.FORWARDED) && getOriginalMessage(reportAction)?.workflow === CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL;
}

function isModifiedExpenseAction(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE);
}

function isMovedTransactionAction(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION);
}

function isMovedAction(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.MOVED> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.MOVED);
}

function isPolicyChangeLogAction(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<ValueOf<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG>> {
    return reportAction?.actionName ? POLICY_CHANGE_LOG_ARRAY.has(reportAction.actionName) : false;
}

function isChronosOOOListAction(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.CHRONOS_OOO_LIST> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.CHRONOS_OOO_LIST);
}

function isAddCommentAction(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT);
}

function isCreatedTaskReportAction(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT) && !!getOriginalMessage(reportAction)?.taskReportID;
}

function isTripPreview(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.TRIP_PREVIEW> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.TRIP_PREVIEW);
}

function isHoldAction(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.HOLD> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.HOLD);
}

function isReimbursementDirectionInformationRequiredAction(
    reportAction: OnyxInputOrEntry<ReportAction>,
): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DIRECTOR_INFORMATION_REQUIRED> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DIRECTOR_INFORMATION_REQUIRED);
}

function isActionOfType<T extends ReportActionName>(action: OnyxInputOrEntry<ReportAction>, actionName: T): action is ReportAction<T> {
    return action?.actionName === actionName;
}

function getOriginalMessage<T extends ReportActionName>(reportAction: OnyxInputOrEntry<ReportAction<T>>): OriginalMessage<T> | undefined {
    if (!Array.isArray(reportAction?.message)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return reportAction?.message ?? reportAction?.originalMessage;
    }
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return reportAction.originalMessage;
}

function getMarkedReimbursedMessage(reportAction: OnyxInputOrEntry<ReportAction>): string {
    const originalMessage = getOriginalMessage(reportAction) as OriginalMessageMarkedReimbursed | undefined;
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return translateLocal('iou.paidElsewhere', {comment: originalMessage?.message?.trim()});
}

function getDelegateAccountIDFromReportAction(reportAction: OnyxInputOrEntry<ReportAction>): number | undefined {
    if (!reportAction) {
        return undefined;
    }

    if (reportAction.delegateAccountID) {
        return reportAction.delegateAccountID;
    }

    const originalMessage = getOriginalMessage(reportAction);
    if (!originalMessage) {
        return undefined;
    }

    if ('delegateAccountID' in originalMessage) {
        return originalMessage.delegateAccountID;
    }

    return undefined;
}

function isExportIntegrationAction(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION> {
    return reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION;
}

function isIntegrationMessageAction(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.INTEGRATIONS_MESSAGE> {
    return reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.INTEGRATIONS_MESSAGE;
}

function isTravelUpdate(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.TRAVEL_UPDATE> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.TRAVEL_UPDATE);
}

/**
 * We are in the process of deprecating reportAction.originalMessage and will be setting the db version of "message" to reportAction.message in the future see: https://github.com/Expensify/App/issues/39797
 * In the interim, we must check to see if we have an object or array for the reportAction.message, if we have an array we will use the originalMessage as this means we have not yet migrated.
 */
function getWhisperedTo(reportAction: OnyxInputOrEntry<ReportAction>): number[] {
    if (!reportAction) {
        return [];
    }
    const originalMessage = getOriginalMessage(reportAction);
    const message = getReportActionMessage(reportAction);

    if (!(originalMessage && typeof originalMessage === 'object' && 'whisperedTo' in originalMessage) && !(message && typeof message === 'object' && 'whisperedTo' in message)) {
        return [];
    }

    if (message !== null && !Array.isArray(message) && typeof message === 'object' && 'whisperedTo' in message) {
        return message?.whisperedTo ?? [];
    }

    if (originalMessage && typeof originalMessage === 'object' && 'whisperedTo' in originalMessage) {
        return originalMessage?.whisperedTo ?? [];
    }

    if (typeof originalMessage !== 'object') {
        Log.info('Original message is not an object for reportAction: ', true, {
            reportActionID: reportAction?.reportActionID,
            actionName: reportAction?.actionName,
        });
    }

    return [];
}

function isWhisperAction(reportAction: OnyxInputOrEntry<ReportAction>): boolean {
    return getWhisperedTo(reportAction).length > 0;
}

/**
 * Checks whether the report action is a whisper targeting someone other than the current user.
 */
function isWhisperActionTargetedToOthers(reportAction: OnyxInputOrEntry<ReportAction>): boolean {
    if (!isWhisperAction(reportAction)) {
        return false;
    }
    return !getWhisperedTo(reportAction).includes(deprecatedCurrentUserAccountID ?? CONST.DEFAULT_NUMBER_ID);
}

function isReimbursementQueuedAction(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_QUEUED> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_QUEUED);
}

function isMemberChangeAction(
    reportAction: OnyxInputOrEntry<ReportAction>,
): reportAction is ReportAction<ValueOf<typeof CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG | typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG>> {
    return reportAction?.actionName ? MEMBER_CHANGE_ARRAY.has(reportAction.actionName) : false;
}

function isInviteMemberAction(
    reportAction: OnyxEntry<ReportAction>,
): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM | typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.INVITE_TO_ROOM> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM) || isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.INVITE_TO_ROOM);
}

function isLeavePolicyAction(reportAction: OnyxEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.LEAVE_POLICY> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.LEAVE_POLICY);
}

function isReimbursementCanceledAction(reportAction: OnyxEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_CANCELED> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_CANCELED);
}

function isReimbursementDeQueuedAction(reportAction: OnyxEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DEQUEUED> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DEQUEUED);
}

function isReimbursementDeQueuedOrCanceledAction(
    reportAction: OnyxEntry<ReportAction>,
): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DEQUEUED | typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_CANCELED> {
    return isReimbursementDeQueuedAction(reportAction) || isReimbursementCanceledAction(reportAction);
}

function isClosedAction(reportAction: OnyxEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.CLOSED> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.CLOSED);
}

function isRenamedAction(reportAction: OnyxEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.RENAMED> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.RENAMED);
}

function isReopenedAction(reportAction: OnyxEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REOPENED> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.REOPENED);
}

function isRetractedAction(reportAction: OnyxEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.RETRACTED> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.RETRACTED);
}

function isRoomChangeLogAction(reportAction: OnyxEntry<ReportAction>): reportAction is ReportAction<ValueOf<typeof CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG>> {
    return reportAction?.actionName ? ROOM_CHANGE_LOG_ARRAY.has(reportAction.actionName) : false;
}

function isInviteOrRemovedAction(
    reportAction: OnyxInputOrEntry<ReportAction>,
): reportAction is ReportAction<ValueOf<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG | typeof CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG>> {
    return (
        isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM) ||
        isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.REMOVE_FROM_ROOM) ||
        isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.INVITE_TO_ROOM) ||
        isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.REMOVE_FROM_ROOM)
    );
}

/**
 * Returns whether the comment is a thread parent message/the first message in a thread
 */
function isThreadParentMessage(reportAction: OnyxEntry<ReportAction>, reportID: string | undefined): boolean {
    const {childType, childVisibleActionCount = 0, childReportID} = reportAction ?? {};
    return childType === CONST.REPORT.TYPE.CHAT && (childVisibleActionCount > 0 || String(childReportID) === reportID);
}

/**
 * Determines if the given report action is sent money report action by checking for 'pay' type and presence of IOUDetails object.
 */
function isSentMoneyReportAction(reportAction: OnyxEntry<ReportAction | OptimisticIOUReportAction>): boolean {
    return (
        isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.IOU) &&
        getOriginalMessage(reportAction)?.type === CONST.IOU.REPORT_ACTION_TYPE.PAY &&
        !!getOriginalMessage(reportAction)?.IOUDetails
    );
}

/**
 * Returns whether the thread is a transaction thread, which is any thread with IOU parent
 * report action from requesting money (type - create) or from sending money (type - pay with IOUDetails field)
 */
function isTransactionThread(parentReportAction: OnyxInputOrEntry<ReportAction>): boolean {
    if (isEmptyObject(parentReportAction) || !isMoneyRequestAction(parentReportAction)) {
        return false;
    }
    const originalMessage = getOriginalMessage(parentReportAction);
    return (
        originalMessage?.type === CONST.IOU.REPORT_ACTION_TYPE.CREATE ||
        originalMessage?.type === CONST.IOU.REPORT_ACTION_TYPE.TRACK ||
        (originalMessage?.type === CONST.IOU.REPORT_ACTION_TYPE.PAY && !!originalMessage?.IOUDetails)
    );
}

/**
 * Sort an array of reportActions by their created timestamp first, and reportActionID second
 * This gives us a stable order even in the case of multiple reportActions created on the same millisecond
 *
 */
function getSortedReportActions(reportActions: ReportAction[] | null, shouldSortInDescendingOrder = false): ReportAction[] {
    if (!Array.isArray(reportActions)) {
        throw new Error(`ReportActionsUtils.getSortedReportActions requires an array, received ${typeof reportActions}`);
    }

    const invertedMultiplier = shouldSortInDescendingOrder ? -1 : 1;

    const sortedActions = reportActions?.filter(Boolean).sort((first, second) => {
        // First sort by action type, ensuring that `CREATED` actions always come first if they have the same or even a later timestamp as another action type
        if ((first.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED || second.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED) && first.actionName !== second.actionName) {
            return (first.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED ? -1 : 1) * invertedMultiplier;
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
        if ((first.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW || second.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) && first.actionName !== second.actionName) {
            return (first.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW ? 1 : -1) * invertedMultiplier;
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
function getCombinedReportActions(
    reportActions: ReportAction[],
    transactionThreadReportID: string | null,
    transactionThreadReportActions: ReportAction[],
    reportID?: string,
): ReportAction[] {
    const isSentMoneyReport = reportActions.some((action) => isSentMoneyReportAction(action));

    // We don't want to combine report actions of transaction thread in iou report of send money request because we display the transaction report of send money request as a normal thread
    if (!transactionThreadReportID || isSentMoneyReport) {
        return reportActions;
    }

    // Usually, we filter out the created action from the transaction thread report actions, since we already have the parent report's created action in `reportActions`
    // However, in the case of moving track expense, the transaction thread will be created first in a track expense, thus we should keep the CREATED of the transaction thread and filter out CREATED action of the IOU
    // This makes sense because in a combined report action list, whichever CREATED is first need to be retained.
    const transactionThreadCreatedAction = transactionThreadReportActions?.find((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED);
    const parentReportCreatedAction = reportActions?.find((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED);

    let filteredTransactionThreadReportActions = transactionThreadReportActions;
    let filteredParentReportActions = reportActions;

    if (transactionThreadCreatedAction && parentReportCreatedAction && transactionThreadCreatedAction.created > parentReportCreatedAction.created) {
        filteredTransactionThreadReportActions = transactionThreadReportActions?.filter((action) => action.actionName !== CONST.REPORT.ACTIONS.TYPE.CREATED);
    } else if (transactionThreadCreatedAction) {
        filteredParentReportActions = reportActions?.filter((action) => action.actionName !== CONST.REPORT.ACTIONS.TYPE.CREATED);
    }

    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    const isSelfDM = report?.chatType === CONST.REPORT.CHAT_TYPE.SELF_DM;
    // Filter out request and send money request actions because we don't want to show any preview actions for one transaction reports
    const filteredReportActions = [...filteredParentReportActions, ...filteredTransactionThreadReportActions].filter((action) => {
        if (!isMoneyRequestAction(action)) {
            return true;
        }
        const actionType = getOriginalMessage(action)?.type ?? '';
        if (isSelfDM) {
            return actionType !== CONST.IOU.REPORT_ACTION_TYPE.CREATE;
        }
        return actionType !== CONST.IOU.REPORT_ACTION_TYPE.CREATE && actionType !== CONST.IOU.REPORT_ACTION_TYPE.TRACK;
    });

    return getSortedReportActions(filteredReportActions, true);
}

const iouRequestTypes: Array<ValueOf<typeof CONST.IOU.REPORT_ACTION_TYPE>> = [CONST.IOU.REPORT_ACTION_TYPE.CREATE, CONST.IOU.REPORT_ACTION_TYPE.SPLIT, CONST.IOU.REPORT_ACTION_TYPE.TRACK];

// Get all IOU report actions for the report.
const iouRequestTypesSet = new Set<ValueOf<typeof CONST.IOU.REPORT_ACTION_TYPE>>([...iouRequestTypes, CONST.IOU.REPORT_ACTION_TYPE.PAY]);

/**
 * Finds most recent IOU request action ID.
 */
function getMostRecentIOURequestActionID(reportActions: ReportAction[] | null): string | null {
    if (!Array.isArray(reportActions)) {
        return null;
    }
    const iouRequestActions =
        reportActions?.filter((action) => {
            if (!isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.IOU)) {
                return false;
            }
            const actionType = getOriginalMessage(action)?.type;
            if (!actionType) {
                return false;
            }
            return iouRequestTypes.includes(actionType);
        }) ?? [];

    if (iouRequestActions.length === 0) {
        return null;
    }

    const sortedReportActions = getSortedReportActions(iouRequestActions);
    return sortedReportActions.at(-1)?.reportActionID ?? null;
}

/**
 * Returns array of links inside a given report action
 */
function extractLinksFromMessageHtml(reportAction: OnyxEntry<ReportAction>): string[] {
    const htmlContent = getReportActionHtml(reportAction);

    const regex = CONST.REGEX_LINK_IN_ANCHOR;

    if (!htmlContent) {
        return [];
    }

    return [...htmlContent.matchAll(regex)].map((match) => match[1]);
}

/**
 * Returns the report action immediately before the specified index.
 * @param reportActions - all actions
 * @param actionIndex - index of the action
 */
function findPreviousAction(reportActions: ReportAction[], actionIndex: number): OnyxEntry<ReportAction> {
    for (let i = actionIndex + 1; i < reportActions.length; i++) {
        const action = reportActions.at(i);

        // Find the next non-pending deletion report action, as the pending delete action means that it is not displayed in the UI, but still is in the report actions list.
        // If we are offline, all actions are pending but shown in the UI, so we take the previous action, even if it is a delete.
        if (!isNetworkOffline && action?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            continue;
        }

        if (action?.shouldShow === false) {
            continue;
        }

        return action;
    }

    return undefined;
}

/**
 * Returns the report action immediately after the specified index.
 * @param reportActions - all actions
 * @param actionIndex - index of the action
 */
function findNextAction(reportActions: ReportAction[], actionIndex: number): OnyxEntry<ReportAction> {
    for (let i = actionIndex - 1; i >= 0; i--) {
        const action = reportActions.at(i);

        // Find the next non-pending deletion report action, as the pending delete action means that it is not displayed in the UI, but still is in the report actions list.
        // If we are offline, all actions are pending but shown in the UI, so we take the previous action, even if it is a delete.
        if (!isNetworkOffline && action?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            continue;
        }

        if (action?.shouldShow === false) {
            continue;
        }

        return action;
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
function isConsecutiveActionMadeByPreviousActor(reportActions: ReportAction[], actionIndex: number): boolean {
    const previousAction = findPreviousAction(reportActions, actionIndex);
    const currentAction = reportActions.at(actionIndex);

    return canActionsBeGrouped(currentAction, previousAction);
}

/**
 * Returns true when the next report action (after actionIndex) is made by the same actor who performed the action at actionIndex.
 * Also checks to ensure that the comment is not too old to be shown as a grouped comment.
 *
 * @param reportActions - report actions ordered from oldest
 * @param actionIndex - index of the comment item in state to check
 */
function hasNextActionMadeBySameActor(reportActions: ReportAction[], actionIndex: number) {
    const currentAction = reportActions.at(actionIndex);
    const nextAction = findNextAction(reportActions, actionIndex);

    if (actionIndex === 0) {
        return false;
    }

    return canActionsBeGrouped(currentAction, nextAction);
}

function getReportActionActorAccountID(
    reportAction: OnyxEntry<ReportAction>,
    iouReport: OnyxEntry<Report>,
    report: OnyxEntry<Report>,
    delegatePersonalDetails?: PersonalDetails | undefined | null,
): number | undefined {
    switch (reportAction?.actionName) {
        case CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW: {
            const ownerAccountID = iouReport?.ownerAccountID ?? reportAction?.childOwnerAccountID;
            const actorAccountID = iouReport?.managerID ?? reportAction?.childManagerAccountID;

            if (isPolicyExpenseChat(report) || delegatePersonalDetails) {
                return ownerAccountID;
            }

            return actorAccountID;
        }

        case CONST.REPORT.ACTIONS.TYPE.CREATED: {
            const reportNameValuePairs = allReportNameValuePair?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${iouReport?.reportID}`];
            if (isHarvestCreatedExpenseReport(reportNameValuePairs?.origin, reportNameValuePairs?.originalID)) {
                return CONST.ACCOUNT_ID.CONCIERGE;
            }
            return reportAction?.actorAccountID;
        }

        case CONST.REPORT.ACTIONS.TYPE.SUBMITTED:
        case CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED:
        case CONST.REPORT.ACTIONS.TYPE.APPROVED:
        case CONST.REPORT.ACTIONS.TYPE.FORWARDED:
        case CONST.REPORT.ACTIONS.TYPE.IOU: {
            const originalMessage = getOriginalMessage(reportAction);
            const actionName = reportAction?.actionName;

            // Check if this should show Concierge as the actor
            const wasSubmittedViaHarvesting = originalMessage && 'harvesting' in originalMessage ? originalMessage.harvesting : false;
            const wasAutomatic = originalMessage && 'automaticAction' in originalMessage ? originalMessage.automaticAction : false;
            const isPayment = originalMessage && 'type' in originalMessage && originalMessage.type === CONST.IOU.REPORT_ACTION_TYPE.PAY;

            // Show Concierge for:
            // - Harvesting (delayed submissions)
            // - Automatic approvals/forwards via workspace rules
            // - Automatic payments via workspace rules
            if (wasSubmittedViaHarvesting || (wasAutomatic && actionName !== CONST.REPORT.ACTIONS.TYPE.IOU) || (wasAutomatic && isPayment)) {
                return CONST.ACCOUNT_ID.CONCIERGE;
            }

            // For SUBMITTED actions, check adminAccountID first (admin-submit case)
            if (actionName === CONST.REPORT.ACTIONS.TYPE.SUBMITTED || actionName === CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED) {
                return reportAction?.adminAccountID ?? reportAction?.actorAccountID;
            }

            return reportAction?.actorAccountID;
        }

        default:
            return reportAction?.actorAccountID;
    }
}

/**
 * Combines the logic for grouping chat messages isConsecutiveActionMadeByPreviousActor and hasNextActionMadeBySameActor.
 * Returns true when messages are made by the same actor and not separated by more than 5 minutes.
 *
 * @param currentAction - Chronologically - latest action.
 * @param adjacentAction - Chronologically - previous action. Named adjacentAction to avoid confusion as isConsecutiveActionMadeByPreviousActor and hasNextActionMadeBySameActor take action lists that are in opposite orders.
 */
function canActionsBeGrouped(currentAction?: ReportAction, adjacentAction?: ReportAction): boolean {
    // It's OK for there to be no previous action, and in that case, false will be returned
    // so that the comment isn't grouped
    if (!currentAction || !adjacentAction) {
        return false;
    }

    // Comments are only grouped if they happen within 5 minutes of each adjacent
    if (new Date(currentAction?.created).getTime() - new Date(adjacentAction.created).getTime() > CONST.REPORT.ACTIONS.MAX_GROUPING_TIME) {
        return false;
    }
    // Do not group if adjacent action was a created action
    if (adjacentAction.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED) {
        return false;
    }

    // Do not group if adjacent or current action was a renamed action
    if (adjacentAction.actionName === CONST.REPORT.ACTIONS.TYPE.RENAMED || currentAction.actionName === CONST.REPORT.ACTIONS.TYPE.RENAMED) {
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

    const currentActionActorAccountID = getReportActionActorAccountID(currentAction, undefined, undefined);
    const adjacentActionActorAccountID = getReportActionActorAccountID(adjacentAction, undefined, undefined);

    if (isSubmittedAction(currentAction) || isSubmittedAndClosedAction(currentAction)) {
        const currentActionAdminAccountID = currentAction.adminAccountID;
        return typeof currentActionAdminAccountID === 'number' ? currentActionAdminAccountID === adjacentActionActorAccountID : currentActionActorAccountID === adjacentActionActorAccountID;
    }

    if (isSubmittedAction(adjacentAction) || isSubmittedAndClosedAction(adjacentAction)) {
        return typeof adjacentAction.adminAccountID === 'number'
            ? currentActionActorAccountID === adjacentAction.adminAccountID
            : currentActionActorAccountID === adjacentActionActorAccountID;
    }

    return currentActionActorAccountID === adjacentActionActorAccountID;
}
function isChronosAutomaticTimerAction(reportAction: OnyxInputOrEntry<ReportAction>, isChronosReport: boolean): boolean {
    const isAutomaticStartTimerAction = () => /start(?:ed|ing)?(?:\snow)?/i.test(getReportActionText(reportAction));
    const isAutomaticStopTimerAction = () => /stop(?:ped|ping)?(?:\snow)?/i.test(getReportActionText(reportAction));
    return isChronosReport && (isAutomaticStartTimerAction() || isAutomaticStopTimerAction());
}

/**
 * If the user sends consecutive actions to Chronos to automatically start/stop the timer,
 * then detect that and show each individually so that the user can easily see when they were sent.
 */
function isConsecutiveChronosAutomaticTimerAction(reportActions: ReportAction[], actionIndex: number, isChronosReport: boolean): boolean {
    const previousAction = findPreviousAction(reportActions, actionIndex);
    const currentAction = reportActions?.at(actionIndex);
    return isChronosAutomaticTimerAction(currentAction, isChronosReport) && isChronosAutomaticTimerAction(previousAction, isChronosReport);
}

/**
 * Checks if a reportAction is deprecated.
 */
function isReportActionDeprecated(reportAction: OnyxEntry<ReportAction>, key: string | number): boolean {
    if (!reportAction) {
        return true;
    }

    // HACK ALERT: We're temporarily filtering out any reportActions keyed by sequenceNumber
    // to prevent bugs during the migration from sequenceNumber -> reportActionID
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    if (String(reportAction.sequenceNumber) === key) {
        Log.info('Front-end filtered out reportAction keyed by sequenceNumber!', false, reportAction);
        return true;
    }

    if (deprecatedOldDotReportActions.has(reportAction.actionName)) {
        return true;
    }

    return false;
}

/**
 * Checks if a given report action corresponds to an actionable mention whisper.
 * @param reportAction
 */
function isActionableMentionWhisper(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_MENTION_WHISPER> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_MENTION_WHISPER);
}

function isActionableMentionInviteToSubmitExpenseConfirmWhisper(
    reportAction: OnyxEntry<ReportAction>,
): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_MENTION_INVITE_TO_SUBMIT_EXPENSE_CONFIRM_WHISPER> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_MENTION_INVITE_TO_SUBMIT_EXPENSE_CONFIRM_WHISPER);
}

/**
 * Checks if a given report action corresponds to an actionable report mention whisper.
 * @param reportAction
 */
function isActionableReportMentionWhisper(reportAction: OnyxEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_REPORT_MENTION_WHISPER> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_REPORT_MENTION_WHISPER);
}

/**
 * Checks if a given report action corresponds to a welcome whisper.
 * @param reportAction
 */
function isExpenseChatWelcomeWhisper(reportAction: OnyxEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_EXPENSE_CHAT_WELCOME_WHISPER> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_EXPENSE_CHAT_WELCOME_WHISPER);
}

/**
 * Checks whether an action is actionable track expense.
 */
function isActionableTrackExpense(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_TRACK_EXPENSE_WHISPER> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_TRACK_EXPENSE_WHISPER);
}

function isActionableWhisper(
    reportAction: OnyxEntry<ReportAction>,
): reportAction is ReportAction<
    | typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_MENTION_WHISPER
    | typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_TRACK_EXPENSE_WHISPER
    | typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_REPORT_MENTION_WHISPER
    | typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_MENTION_INVITE_TO_SUBMIT_EXPENSE_CONFIRM_WHISPER
> {
    return (
        isActionableMentionWhisper(reportAction) ||
        isActionableTrackExpense(reportAction) ||
        isActionableReportMentionWhisper(reportAction) ||
        isActionableMentionInviteToSubmitExpenseConfirmWhisper(reportAction)
    );
}

const {POLICY_CHANGE_LOG: policyChangelogTypes, ROOM_CHANGE_LOG: roomChangeLogTypes, ...otherActionTypes} = CONST.REPORT.ACTIONS.TYPE;
const supportedActionTypes = new Set<ReportActionName>([...Object.values(otherActionTypes), ...Object.values(policyChangelogTypes), ...Object.values(roomChangeLogTypes)]);

/**
 * Checks whether an action is actionable track expense and resolved.
 *
 */
function isResolvedActionableWhisper(reportAction: OnyxEntry<ReportAction>): boolean {
    const originalMessage = getOriginalMessage(reportAction);
    const resolution = originalMessage && typeof originalMessage === 'object' && 'resolution' in originalMessage ? originalMessage?.resolution : null;
    return !!resolution;
}

/**
 * Checks whether an action is concierge category options and resolved.
 */
function isResolvedConciergeCategoryOptions(reportAction: OnyxEntry<ReportAction>): boolean {
    const originalMessage = getOriginalMessage(reportAction);
    const selectedCategory = originalMessage && typeof originalMessage === 'object' && 'selectedCategory' in originalMessage ? originalMessage?.selectedCategory : null;
    return !!selectedCategory;
}

/**
 * Checks whether an action is concierge description options and resolved.
 */
function isResolvedConciergeDescriptionOptions(reportAction: OnyxEntry<ReportAction>): boolean {
    const originalMessage = getOriginalMessage(reportAction);
    const selectedDescription = originalMessage && typeof originalMessage === 'object' && 'selectedDescription' in originalMessage ? originalMessage?.selectedDescription : null;
    return !!selectedDescription;
}

/**
 * Checks if a reportAction is fit for display, meaning that it's not deprecated, is of a valid
 * and supported type, it's not deleted and also not closed.
 */
function shouldReportActionBeVisible(reportAction: OnyxEntry<ReportAction>, key: string | number, canUserPerformWriteAction?: boolean): boolean {
    if (!reportAction) {
        return false;
    }

    const actionName = reportAction.actionName;

    if (isReportActionDeprecated(reportAction, key)) {
        return false;
    }

    // Filter out any unsupported reportAction types
    if (!supportedActionTypes.has(actionName)) {
        return false;
    }

    if (actionName === CONST.REPORT.ACTIONS.TYPE.UNREPORTED_TRANSACTION) {
        const unreportedTransactionOriginalMessage = getOriginalMessage(reportAction as OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.UNREPORTED_TRANSACTION>>) ?? {};
        const {fromReportID} = unreportedTransactionOriginalMessage as OriginalMessageUnreportedTransaction;
        const fromReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${fromReportID}`];
        return !!fromReport;
    }

    if (isMovedTransactionAction(reportAction)) {
        const movedTransactionOriginalMessage = getOriginalMessage(reportAction);
        const toReportID = movedTransactionOriginalMessage?.toReportID;
        const fromReportID = movedTransactionOriginalMessage?.fromReportID;

        if (fromReportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
            return false;
        }

        const toReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${toReportID}`];
        const fromReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${fromReportID}`];
        return !!fromReport || !!toReport;
    }

    // Ignore closed action here since we're already displaying a footer that explains why the report was closed
    if (actionName === CONST.REPORT.ACTIONS.TYPE.CLOSED && !isMarkAsClosedAction(reportAction)) {
        return false;
    }

    if (isWhisperActionTargetedToOthers(reportAction)) {
        return false;
    }

    if (isPendingRemove(reportAction) && !reportAction.childVisibleActionCount) {
        return false;
    }

    if (
        (isActionableReportMentionWhisper(reportAction) ||
            isActionableJoinRequestPendingReportAction(reportAction) ||
            isActionableMentionWhisper(reportAction) ||
            isActionableCardFraudAlert(reportAction)) &&
        !canUserPerformWriteAction
    ) {
        return false;
    }

    if (isTripPreview(reportAction) || isTravelUpdate(reportAction)) {
        return true;
    }

    // If action is actionable whisper and resolved by user, then we don't want to render anything
    if (isActionableWhisper(reportAction) && isResolvedActionableWhisper(reportAction)) {
        return false;
    }

    if (!isVisiblePreviewOrMoneyRequest(reportAction)) {
        return false;
    }

    // All other actions are displayed except thread parents, deleted, or non-pending actions
    return !!reportAction.pendingAction || !isDeletedAction(reportAction) || isDeletedParentAction(reportAction) || isReversedTransaction(reportAction);
}

/**
 * Checks if the new marker should be hidden for the report action.
 */
function shouldHideNewMarker(reportAction: OnyxEntry<ReportAction>): boolean {
    if (!reportAction) {
        return true;
    }
    return !isNetworkOffline && reportAction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
}

/**
 * Checks if a reportAction is fit for display as report last action, meaning that
 * it satisfies shouldReportActionBeVisible, it's not whisper action and not deleted.
 */
function shouldReportActionBeVisibleAsLastAction(reportAction: OnyxInputOrEntry<ReportAction>, canUserPerformWriteAction?: boolean): boolean {
    if (!reportAction) {
        return false;
    }

    if (Object.keys(reportAction.errors ?? {}).length > 0) {
        return false;
    }

    // If a whisper action is the REPORT_PREVIEW action, we are displaying it.
    // If the action's message text is empty and it is not a deleted parent with visible child actions, hide it. Else, consider the action to be displayable.
    return (
        shouldReportActionBeVisible(reportAction, reportAction.reportActionID, canUserPerformWriteAction) &&
        (!(isWhisperAction(reportAction) && !isReportPreviewAction(reportAction) && !isMoneyRequestAction(reportAction)) || isActionableMentionWhisper(reportAction)) &&
        !(isDeletedAction(reportAction) && !isDeletedParentAction(reportAction) && !isPendingHide(reportAction))
    );
}

/**
 * For policy change logs, report URLs are generated in the server,
 * which includes a baseURL placeholder that's replaced in the client.
 */
function replaceBaseURLInPolicyChangeLogAction(reportAction: ReportAction): ReportAction {
    if (!reportAction?.message || !isPolicyChangeLogAction(reportAction)) {
        return reportAction;
    }

    const updatedReportAction = clone(reportAction);

    if (!updatedReportAction.message) {
        return updatedReportAction;
    }

    if (Array.isArray(updatedReportAction.message)) {
        const message = updatedReportAction.message.at(0);

        if (message) {
            message.html = getReportActionHtml(reportAction)?.replace('%baseURL', environmentURL);
        }
    }

    return updatedReportAction;
}

function getLastVisibleAction(
    reportID: string | undefined,
    canUserPerformWriteAction?: boolean,
    actionsToMerge: Record<string, NullishDeep<ReportAction> | null> = {},
    reportActionsParam: OnyxCollection<ReportActions> = allReportActions,
): OnyxEntry<ReportAction> {
    let reportActions: Array<ReportAction | null | undefined> = [];
    if (!isEmpty(actionsToMerge)) {
        reportActions = Object.values(fastMerge(reportActionsParam?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`] ?? {}, actionsToMerge ?? {}, true)) as Array<
            ReportAction | null | undefined
        >;
    } else {
        reportActions = Object.values(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`] ?? {});
    }
    const visibleReportActions = reportActions.filter((action): action is ReportAction => shouldReportActionBeVisibleAsLastAction(action, canUserPerformWriteAction));
    const sortedReportActions = getSortedReportActions(visibleReportActions, true);
    if (sortedReportActions.length === 0) {
        return undefined;
    }
    return sortedReportActions.at(0);
}

function formatLastMessageText(lastMessageText: string | undefined) {
    const trimmedMessage = String(lastMessageText).trim();

    // Add support for inline code containing only space characters
    // The message will appear as a blank space in the LHN
    if (
        (trimmedMessage === '' && (lastMessageText?.length ?? 0) > 0) ||
        (trimmedMessage === '?\u2026' && (lastMessageText?.length ?? 0) > CONST.REPORT.MIN_LENGTH_LAST_MESSAGE_WITH_ELLIPSIS)
    ) {
        return ' ';
    }

    return StringUtils.lineBreaksToSpaces(trimmedMessage).substring(0, CONST.REPORT.LAST_MESSAGE_TEXT_MAX_LENGTH).trim();
}

function getLastVisibleMessage(
    reportID: string | undefined,
    canUserPerformWriteAction?: boolean,
    actionsToMerge: Record<string, NullishDeep<ReportAction> | null> = {},
    reportAction: OnyxInputOrEntry<ReportAction> | undefined = undefined,
): LastVisibleMessage {
    const lastVisibleAction = reportAction ?? getLastVisibleAction(reportID, canUserPerformWriteAction, actionsToMerge);
    const message = getReportActionMessage(lastVisibleAction);

    if (message && isReportMessageAttachment(message)) {
        return {
            lastMessageText: CONST.ATTACHMENT_MESSAGE_TEXT,
            lastMessageHtml: CONST.TRANSLATION_KEYS.ATTACHMENT,
        };
    }

    if (isCreatedAction(lastVisibleAction)) {
        return {
            lastMessageText: '',
        };
    }

    let messageText = getReportActionMessageText(lastVisibleAction) ?? '';
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
function filterOutDeprecatedReportActions(reportActions: OnyxEntry<ReportActions>): ReportAction[] {
    return Object.entries(reportActions ?? {})
        .filter(([key, reportAction]) => !isReportActionDeprecated(reportAction, key))
        .map((entry) => entry[1]);
}

/**
 * Determines whether a report action should be visible in the report view.
 * Filters out:
 * - ReportPreview with shouldShow set to false and without a pending action
 * - Money request with parent action deleted
 */
function isVisiblePreviewOrMoneyRequest(action: ReportAction): boolean {
    const isDeletedMoneyRequest = isDeletedParentAction(action) && isMoneyRequestAction(action);
    const isHiddenReportPreviewWithoutPendingAction = isReportPreviewAction(action) && action.pendingAction === undefined && action.shouldShow === false;

    return !isDeletedMoneyRequest && !isHiddenReportPreviewWithoutPendingAction;
}

/**
 * Helper for filtering out report actions that should not be displayed in the report view.
 * Delegates visibility logic to isVisiblePreviewOrMoneyRequest.
 */
function getFilteredReportActionsForReportView(actions: ReportAction[]) {
    return actions.filter(isVisiblePreviewOrMoneyRequest);
}

function getDynamicExternalWorkflowRoutedAction(
    reportAction: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.SUBMITTED> | ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.FORWARDED>,
): ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED> {
    return {
        reportActionID: `${reportAction.reportActionID}DEW`,
        created: DateUtils.addMillisecondsFromDateTime(reportAction.created, 1),
        actionName: CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED,
        actorAccountID: CONST.ACCOUNT_ID.CONCIERGE,
        message: [{html: 'DYNAMIC_EXTERNAL_WORKFLOW', type: 'COMMENT', text: ''}],
        originalMessage: {
            to: getOriginalMessage(reportAction)?.to ?? '',
        },
    };
}

function withDEWRoutedActionsArray(reportActions: ReportAction[]): ReportAction[] {
    return reportActions.flatMap((reportAction) => {
        if ((isDynamicExternalWorkflowSubmitAction(reportAction) || isDynamicExternalWorkflowForwardedAction(reportAction)) && getOriginalMessage(reportAction)?.to) {
            return [reportAction, getDynamicExternalWorkflowRoutedAction(reportAction)];
        }
        return reportAction;
    });
}

function withDEWRoutedActionsObject(reportActions: OnyxEntry<ReportActions>): OnyxEntry<ReportActions> {
    return Object.entries(reportActions ?? {}).reduce((acc, value) => {
        const [reportActionID, reportAction] = value;
        acc[reportActionID] = reportAction;

        if ((isDynamicExternalWorkflowSubmitAction(reportAction) || isDynamicExternalWorkflowForwardedAction(reportAction)) && getOriginalMessage(reportAction)?.to) {
            const dynamicExternalWorkflowRoutedAction = getDynamicExternalWorkflowRoutedAction(reportAction);
            acc[dynamicExternalWorkflowRoutedAction.reportActionID] = dynamicExternalWorkflowRoutedAction;
        }
        return acc;
    }, {} as ReportActions);
}

/**
 * This method returns the report actions that are ready for display in the ReportActionsView.
 * The report actions need to be sorted by created timestamp first, and reportActionID second
 * to ensure they will always be displayed in the same order (in case multiple actions have the same timestamp).
 * This is all handled with getSortedReportActions() which is used by several other methods to keep the code DRY.
 */
function getSortedReportActionsForDisplay(
    reportActions: OnyxEntry<ReportActions> | ReportAction[],
    canUserPerformWriteAction?: boolean,
    shouldIncludeInvisibleActions = false,
): ReportAction[] {
    let filteredReportActions: ReportAction[] = [];
    if (!reportActions) {
        return [];
    }

    if (shouldIncludeInvisibleActions) {
        filteredReportActions = Object.values(reportActions).filter(Boolean);
    } else {
        filteredReportActions = Object.entries(reportActions)
            .filter(([key, reportAction]) => shouldReportActionBeVisible(reportAction, key, canUserPerformWriteAction))
            .map(([, reportAction]) => reportAction);
    }

    const baseURLAdjustedReportActions = filteredReportActions.map((reportAction) => replaceBaseURLInPolicyChangeLogAction(reportAction));
    return getSortedReportActions(withDEWRoutedActionsArray(baseURLAdjustedReportActions), true);
}

/**
 * The first visible action is the second last action in sortedReportActions which satisfy following conditions:
 * 1. That is not pending deletion as pending deletion actions are kept in sortedReportActions in memory.
 * 2. That has at least one visible child action.
 * 3. While offline all actions in `sortedReportActions` are visible.
 * 4. We will get the second last action from filtered actions because the last
 *    action is always the created action
 */
function getFirstVisibleReportActionID(sortedReportActions: ReportAction[] = [], isOffline = false): string | undefined {
    if (!Array.isArray(sortedReportActions)) {
        return '';
    }
    const sortedFilterReportActions = sortedReportActions.filter((action) => !isDeletedAction(action) || (action?.childVisibleActionCount ?? 0) > 0 || isOffline);
    return sortedFilterReportActions.length > 1 ? sortedFilterReportActions.at(sortedFilterReportActions.length - 2)?.reportActionID : undefined;
}

/**
 * @returns The latest report action in the `onyxData` or `null` if one couldn't be found
 */
function getLatestReportActionFromOnyxData(onyxData: OnyxUpdate[] | null): NonNullable<OnyxEntry<ReportAction>> | null {
    const reportActionUpdate = onyxData?.find((onyxUpdate) => onyxUpdate.key.startsWith(ONYXKEYS.COLLECTION.REPORT_ACTIONS));

    if (!reportActionUpdate) {
        return null;
    }

    const reportActions = Object.values((reportActionUpdate.value as ReportActions) ?? {});
    const sortedReportActions = getSortedReportActions(reportActions);
    return sortedReportActions.at(-1) ?? null;
}

/**
 * Find the transaction associated with this reportAction, if one exists.
 */
function getLinkedTransactionID(reportAction: OnyxEntry<ReportAction> | undefined): string | undefined {
    if (!reportAction || !isMoneyRequestAction(reportAction)) {
        return undefined;
    }
    return getOriginalMessage(reportAction)?.IOUTransactionID;
}

function getReportAction(reportID: string | undefined, reportActionID: string | undefined): ReportAction | undefined {
    if (!reportID || !reportActionID) {
        return undefined;
    }

    return allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`]?.[reportActionID];
}

/**
 * Get the iouReportID for a given report action.
 */
function getIOUReportIDFromReportActionPreview(reportAction: OnyxEntry<ReportAction>): string | undefined {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) ? getOriginalMessage(reportAction)?.linkedReportID : undefined;
}

/**
 * A helper method to identify if the message is deleted or not.
 */
function isMessageDeleted(reportAction: OnyxInputOrEntry<ReportAction>): boolean {
    return getReportActionMessage(reportAction)?.isDeletedParentAction ?? false;
}

/**
 * Simple hook to check whether the PureReportActionItem should return item based on whether the ReportPreview was recently deleted and the PureReportActionItem has not yet unloaded
 */
function useTableReportViewActionRenderConditionals({childMoneyRequestCount, childVisibleActionCount, pendingAction, actionName}: ReportAction) {
    const previousChildMoneyRequestCount = usePrevious(childMoneyRequestCount);

    const isActionAReportPreview = actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW;
    const isActionInUpdateState = pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE;
    const reportsCount = childMoneyRequestCount;
    const previousReportsCount = previousChildMoneyRequestCount ?? 0;
    const commentsCount = childVisibleActionCount ?? 0;

    const isEmptyPreviewWithComments = reportsCount === 0 && commentsCount > 0 && previousReportsCount > 0;

    // We only want to remove the item if the ReportPreview has comments but no reports, so we avoid having a PureReportActionItem with no ReportPreview but only comments
    return !(isActionAReportPreview && isActionInUpdateState && isEmptyPreviewWithComments);
}

/**
 * Returns the number of expenses associated with a report preview
 */
function getNumberOfMoneyRequests(reportPreviewAction: OnyxEntry<ReportAction>): number {
    return reportPreviewAction?.childMoneyRequestCount ?? 0;
}

function isSplitBillAction(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.IOU) && getOriginalMessage(reportAction)?.type === CONST.IOU.REPORT_ACTION_TYPE.SPLIT;
}

function isIOURequestReportAction(reportAction: OnyxInputOrEntry<ReportAction>): boolean {
    const type = isMoneyRequestAction(reportAction) && getOriginalMessage(reportAction)?.type;
    return !!type && iouRequestTypes.includes(type);
}

function isTrackExpenseAction(reportAction: OnyxEntry<ReportAction | OptimisticIOUReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.IOU) && getOriginalMessage(reportAction)?.type === CONST.IOU.REPORT_ACTION_TYPE.TRACK;
}

function isPayAction(reportAction: OnyxInputOrEntry<ReportAction | OptimisticIOUReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.IOU) && getOriginalMessage(reportAction)?.type === CONST.IOU.REPORT_ACTION_TYPE.PAY;
}

function isTaskAction(reportAction: OnyxEntry<ReportAction>): boolean {
    const reportActionName = reportAction?.actionName;
    return (
        reportActionName === CONST.REPORT.ACTIONS.TYPE.TASK_COMPLETED ||
        reportActionName === CONST.REPORT.ACTIONS.TYPE.TASK_CANCELLED ||
        reportActionName === CONST.REPORT.ACTIONS.TYPE.TASK_REOPENED ||
        reportActionName === CONST.REPORT.ACTIONS.TYPE.TASK_EDITED
    );
}

/**
 * @param actionName - The name of the action
 * @returns - Whether the action is a tag modification action
 * */
function isTagModificationAction(actionName: string): boolean {
    return (
        actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_TAG ||
        actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_ENABLED ||
        actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_NAME ||
        actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_TAG ||
        actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_MULTIPLE_TAGS ||
        actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG
    );
}

/**
 * Used for Send Money flow, which is a special case where we have no IOU create action and only one IOU pay action.
 * In other reports, pay actions do not count as a transactions, but this is an exception to this rule.
 */
function getSendMoneyFlowAction(actions: OnyxEntry<ReportActions> | ReportAction[], chatReport: OnyxEntry<Report>): ReportAction<'IOU'> | undefined {
    if (!chatReport || !actions) {
        return undefined;
    }

    let iouAction = null;
    for (const reportAction of Object.values(actions)) {
        if (isMoneyRequestAction(reportAction)) {
            if (iouAction !== null) {
                // We more than one IOU action
                return undefined;
            }
            iouAction = reportAction;
        }
    }

    // sendMoneyFlow has only one IOU action...
    if (iouAction === null) {
        return undefined;
    }

    // ...which is 'pay'...
    const isFirstActionPay = getOriginalMessage(iouAction)?.type === CONST.IOU.REPORT_ACTION_TYPE.PAY;

    const {type, chatType, parentReportID, parentReportActionID} = chatReport;

    // ...and can only be triggered on DM chats
    const isDM = type === CONST.REPORT.TYPE.CHAT && !chatType && !(parentReportID && parentReportActionID);

    return isFirstActionPay && isDM ? iouAction : undefined;
}

/** Whether action has no linked report by design */
const isIOUActionTypeExcludedFromFiltering = (type: OriginalMessageIOU['type'] | undefined) =>
    [CONST.IOU.REPORT_ACTION_TYPE.SPLIT, CONST.IOU.REPORT_ACTION_TYPE.TRACK, CONST.IOU.REPORT_ACTION_TYPE.PAY].some((actionType) => actionType === type);

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
const isIOUActionMatchingTransactionList = (
    action: ReportAction,
    reportTransactionIDs?: string[],
    defaultToFalseForNonIOU = false,
): action is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> => {
    if (!isMoneyRequestAction(action)) {
        return !defaultToFalseForNonIOU;
    }

    if (isIOUActionTypeExcludedFromFiltering(getOriginalMessage(action)?.type) || reportTransactionIDs === undefined) {
        return true;
    }

    const {IOUTransactionID} = getOriginalMessage(action) ?? {};
    return !!IOUTransactionID && reportTransactionIDs.includes(IOUTransactionID);
};

/**
 * Gets the report action for the transaction thread associated with a report by iterating over the reportActions and identifying the IOU report actions.
 * Returns a report action if there is exactly one transaction thread for the report, and undefined otherwise.
 */
function getOneTransactionThreadReportAction(
    report: OnyxEntry<Pick<Report, 'type'>>,
    chatReport: OnyxEntry<Report>,
    reportActions: OnyxEntry<ReportActions> | ReportAction[],
    isOffline: boolean | undefined = undefined,
    reportTransactionIDs?: string[],
): ReportAction<'IOU'> | undefined {
    // If the report is not an IOU, Expense report, or Invoice, it shouldn't be treated as one-transaction report.
    if (report?.type !== CONST.REPORT.TYPE.IOU && report?.type !== CONST.REPORT.TYPE.EXPENSE && report?.type !== CONST.REPORT.TYPE.INVOICE) {
        return;
    }

    const reportActionsArray = Array.isArray(reportActions) ? reportActions : Object.values(reportActions ?? {});
    if (!reportActionsArray.length) {
        return;
    }

    const sendMoneyFlow = getSendMoneyFlowAction(reportActions, chatReport);

    if (sendMoneyFlow?.childReportID) {
        return sendMoneyFlow;
    }

    let iouRequestAction = null;
    for (const action of reportActionsArray) {
        // If the original message is a 'pay' IOU without IOUDetails, it shouldn't be added to the transaction count.
        // However, it is excluded from the matching function in order to display it properly, so we need to compare the type here.
        if (
            !isIOUActionMatchingTransactionList(action, reportTransactionIDs, true) ||
            (getOriginalMessage(action)?.type === CONST.IOU.REPORT_ACTION_TYPE.PAY && !getOriginalMessage(action)?.IOUDetails)
        ) {
            continue;
        }

        const originalMessage = getOriginalMessage(action);
        const actionType = originalMessage?.type;
        if (
            actionType &&
            iouRequestTypesSet.has(actionType) &&
            !!originalMessage?.IOUTransactionID &&
            // Include deleted IOU reportActions if the action is pending deletion and the user is offline
            (!isDeletedAction(action) || (action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && (isOffline ?? isNetworkOffline)))
        ) {
            if (iouRequestAction !== null) {
                // We found a second action so this is for sure not a one-transaction report
                return;
            }
            iouRequestAction = action;
        }
    }

    // If we don't have any IOU request actions, or we have more than one IOU request actions, this isn't a oneTransaction report
    if (iouRequestAction === null) {
        return;
    }

    // If there are multiple visible transactions, return undefined to indicate this is not a one-transaction report,
    // even if we only found one IOU action. This handles edge cases like importing legacy transactions
    // where the transactions exist but their corresponding IOU actions haven't been created yet.
    if (reportTransactionIDs && reportTransactionIDs.length > 1) {
        return;
    }

    const originalMessage = getOriginalMessage(iouRequestAction);

    // If there's only one IOU request action associated with the report but it's been deleted, then we don't consider this a oneTransaction report
    // and want to display it using the standard view
    if (((originalMessage?.deleted ?? '') !== '' || isDeletedAction(iouRequestAction)) && isMoneyRequestAction(iouRequestAction)) {
        return;
    }

    return iouRequestAction;
}

/**
 * Gets the reportID for the transaction thread associated with a report by iterating over the reportActions and identifying the IOU report actions.
 * Returns a reportID if there is exactly one transaction thread for the report, and undefined otherwise.
 */
function getOneTransactionThreadReportID(...args: Parameters<typeof getOneTransactionThreadReportAction>): string | undefined {
    const reportAction = getOneTransactionThreadReportAction(...args);
    if (reportAction) {
        // Since we don't always create transaction thread optimistically, we return CONST.FAKE_REPORT_ID
        return reportAction.childReportID ?? CONST.FAKE_REPORT_ID;
    }
}

/**
 * When we delete certain reports, we want to check whether there are any visible actions left to display.
 * If there are no visible actions left (including system messages), we can hide the report from view entirely
 */
function doesReportHaveVisibleActions(reportID: string, canUserPerformWriteAction?: boolean, actionsToMerge: ReportActions = {}): boolean {
    const reportActions = Object.values(fastMerge(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`] ?? {}, actionsToMerge, true));
    const visibleReportActions = Object.values(reportActions ?? {}).filter((action) => shouldReportActionBeVisibleAsLastAction(action, canUserPerformWriteAction));

    // Exclude the task system message and the created message
    const visibleReportActionsWithoutTaskSystemMessage = visibleReportActions.filter((action) => !isTaskAction(action) && !isCreatedAction(action));
    return visibleReportActionsWithoutTaskSystemMessage.length > 0;
}

function getAllReportActions(reportID: string | undefined): ReportActions {
    return allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`] ?? {};
}

/**
 * Check whether a report action is an attachment (a file, such as an image or a zip).
 *
 */
function isReportActionAttachment(reportAction: OnyxInputOrEntry<ReportAction>): boolean {
    const message = getReportActionMessage(reportAction);

    if (reportAction && ('isAttachmentOnly' in reportAction || 'isAttachmentWithText' in reportAction)) {
        return reportAction.isAttachmentOnly ?? reportAction.isAttachmentWithText ?? false;
    }

    if (message) {
        return isReportMessageAttachment(message);
    }

    return false;
}

// We pass getReportName as a param to avoid cyclic dependency.
function getMemberChangeMessageElements(
    translate: LocalizedTranslate,
    reportAction: OnyxEntry<ReportAction>,
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    getReportNameCallback: typeof getReportName,
): readonly MemberChangeMessageElement[] {
    const isInviteAction = isInviteMemberAction(reportAction);
    const isLeaveAction = isLeavePolicyAction(reportAction);

    if (!isMemberChangeAction(reportAction)) {
        return [];
    }

    // Currently, we only render messages when members are invited
    let verb = translate('workspace.invite.removed');
    if (isInviteAction) {
        verb = translate('workspace.invite.invited');
    }

    if (isLeaveAction) {
        verb = getPolicyChangeLogEmployeeLeftMessage(translate, reportAction);
    }

    const originalMessage = getOriginalMessage(reportAction);
    const targetAccountIDs: number[] = originalMessage?.targetAccountIDs ?? [];
    const personalDetails = getPersonalDetailsByIDs({accountIDs: targetAccountIDs, currentUserAccountID: 0});

    const mentionElements = targetAccountIDs.map((accountID): MemberChangeMessageUserMentionElement => {
        const personalDetail = personalDetails.find((personal) => personal.accountID === accountID);
        const handleText = getEffectiveDisplayName(formatPhoneNumber, personalDetail) ?? translate('common.hidden');

        return {
            kind: 'userMention',
            content: `@${handleText}`,
            accountID,
        };
    });

    const buildRoomElements = (): readonly MemberChangeMessageElement[] => {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const roomName = getReportNameCallback(allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${originalMessage?.reportID}`]) || originalMessage?.roomName;
        if (roomName && originalMessage) {
            const preposition = isInviteAction ? ` ${translate('workspace.invite.to')} ` : ` ${translate('workspace.invite.from')} `;

            if (originalMessage.reportID) {
                return [
                    {
                        kind: 'text',
                        content: preposition,
                    },
                    {
                        kind: 'roomReference',
                        roomName,
                        roomID: originalMessage.reportID,
                        content: roomName,
                    },
                ];
            }
        }

        return [];
    };

    return [
        {
            kind: 'text',
            content: `${verb} `,
        },
        ...formatMessageElementList(mentionElements),
        ...buildRoomElements(),
    ];
}

function getReportActionHtml(reportAction: PartialReportAction): string {
    return getReportActionMessage(reportAction)?.html ?? '';
}

function getReportActionText(reportAction: PartialReportAction): string {
    const message = getReportActionMessage(reportAction);
    // Sometime html can be an empty string
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const text = (message?.html || message?.text) ?? '';
    return text ? Parser.htmlToText(text) : '';
}

function getTextFromHtml(html?: string): string {
    return html ? Parser.htmlToText(html) : '';
}

function isOldDotLegacyAction(action: OldDotReportAction | PartialReportAction): action is PartialReportAction {
    return [
        CONST.REPORT.ACTIONS.TYPE.DELETED_ACCOUNT,
        CONST.REPORT.ACTIONS.TYPE.DONATION,
        CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_QUICK_BOOKS,
        CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_REQUESTED,
        CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_SETUP,
    ].some((oldDotActionName) => oldDotActionName === action?.actionName);
}

function isOldDotReportAction(action: ReportAction | OldDotReportAction) {
    if (!action || !action.actionName) {
        return false;
    }
    return [
        CONST.REPORT.ACTIONS.TYPE.CHANGE_FIELD,
        CONST.REPORT.ACTIONS.TYPE.CHANGE_TYPE,
        CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_CSV,
        CONST.REPORT.ACTIONS.TYPE.INTEGRATIONS_MESSAGE,
        CONST.REPORT.ACTIONS.TYPE.MANAGER_ATTACH_RECEIPT,
        CONST.REPORT.ACTIONS.TYPE.MANAGER_DETACH_RECEIPT,
        CONST.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED,
        CONST.REPORT.ACTIONS.TYPE.MARK_REIMBURSED_FROM_INTEGRATION,
        CONST.REPORT.ACTIONS.TYPE.OUTDATED_BANK_ACCOUNT,
        CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_BOUNCE,
        CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_CANCELED,
        CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACCOUNT_CHANGED,
        CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DELAYED,
        CONST.REPORT.ACTIONS.TYPE.SELECTED_FOR_RANDOM_AUDIT,
        CONST.REPORT.ACTIONS.TYPE.SHARE,
        CONST.REPORT.ACTIONS.TYPE.STRIPE_PAID,
        CONST.REPORT.ACTIONS.TYPE.UNSHARE,
        CONST.REPORT.ACTIONS.TYPE.DELETED_ACCOUNT,
        CONST.REPORT.ACTIONS.TYPE.DONATION,
        CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_QUICK_BOOKS,
        CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_REQUESTED,
        CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_SETUP,
    ].some((oldDotActionName) => oldDotActionName === action.actionName);
}

function getMessageOfOldDotLegacyAction(legacyAction: PartialReportAction) {
    if (!Array.isArray(legacyAction?.message)) {
        return getReportActionText(legacyAction);
    }
    if (legacyAction.message.length !== 0) {
        // Sometime html can be an empty string
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        return legacyAction?.message?.map((element) => getTextFromHtml(element?.html || element?.text)).join('') ?? '';
    }
    return '';
}

/**
 * Helper method to format message of OldDot Actions.
 */
function getMessageOfOldDotReportAction(translate: LocalizedTranslate, oldDotAction: PartialReportAction | OldDotReportAction, withMarkdown = true): string {
    if (isOldDotLegacyAction(oldDotAction)) {
        return getMessageOfOldDotLegacyAction(oldDotAction);
    }

    const {originalMessage, actionName} = oldDotAction;
    switch (actionName) {
        case CONST.REPORT.ACTIONS.TYPE.CHANGE_FIELD: {
            const {oldValue, newValue, fieldName} = originalMessage;
            if (!oldValue) {
                return translate('report.actions.type.changeFieldEmpty', {newValue, fieldName});
            }
            return translate('report.actions.type.changeField', {oldValue, newValue, fieldName});
        }
        case CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_CSV:
            return translate('report.actions.type.exportedToCSV');
        case CONST.REPORT.ACTIONS.TYPE.INTEGRATIONS_MESSAGE: {
            const {result, label} = originalMessage;
            const errorMessage = result?.messages?.join(', ') ?? '';
            const linkText = result?.link?.text ?? '';
            const linkURL = result?.link?.url ?? '';
            if (errorMessage.includes(CONST.ERROR.INTEGRATION_MESSAGE_INVALID_CREDENTIALS)) {
                const translateErrorMessage = translate('report.actions.error.invalidCredentials');
                const translateLinkText = translate('report.connectionSettings');
                return translate('report.actions.type.integrationsMessage', {errorMessage: translateErrorMessage, label, linkText: translateLinkText, linkURL});
            }
            return translate('report.actions.type.integrationsMessage', {errorMessage, label, linkText, linkURL});
        }
        case CONST.REPORT.ACTIONS.TYPE.MANAGER_ATTACH_RECEIPT:
            return translate('report.actions.type.managerAttachReceipt');
        case CONST.REPORT.ACTIONS.TYPE.MANAGER_DETACH_RECEIPT:
            return translate('report.actions.type.managerDetachReceipt');
        case CONST.REPORT.ACTIONS.TYPE.MARK_REIMBURSED_FROM_INTEGRATION: {
            const {amount, currency} = originalMessage;
            return translate('report.actions.type.markedReimbursedFromIntegration', {amount, currency});
        }
        case CONST.REPORT.ACTIONS.TYPE.OUTDATED_BANK_ACCOUNT:
            return translate('report.actions.type.outdatedBankAccount');
        case CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_BOUNCE:
            return translate('report.actions.type.reimbursementACHBounce');
        case CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_CANCELED:
            return translate('report.actions.type.reimbursementACHCancelled');
        case CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACCOUNT_CHANGED:
            return translate('report.actions.type.reimbursementAccountChanged');
        case CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DELAYED:
            return translate('report.actions.type.reimbursementDelayed');
        case CONST.REPORT.ACTIONS.TYPE.SELECTED_FOR_RANDOM_AUDIT:
            return translate(`report.actions.type.selectedForRandomAudit${withMarkdown ? 'Markdown' : ''}`);
        case CONST.REPORT.ACTIONS.TYPE.SHARE:
            return translate('report.actions.type.share', {to: originalMessage.to});
        case CONST.REPORT.ACTIONS.TYPE.UNSHARE:
            return translate('report.actions.type.unshare', {to: originalMessage.to});
        case CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL:
            return translate('report.actions.type.takeControl');
        default:
            return '';
    }
}

function getTravelUpdateMessage(
    translate: LocalizedTranslate,
    action: ReportAction<'TRAVEL_TRIP_ROOM_UPDATE'>,
    formatDate?: (datetime: string, includeTimezone: boolean, isLowercase?: boolean | undefined) => string,
) {
    const details = getOriginalMessage(action);
    const formattedStartDate = formatDate?.(details?.start.date ?? '', false) ?? format(details?.start.date ?? '', CONST.DATE.FNS_DATE_TIME_FORMAT_STRING);

    switch (details?.operation) {
        case CONST.TRAVEL.UPDATE_OPERATION_TYPE.BOOKING_TICKETED:
            return translate(
                'travel.updates.bookingTicketed',
                details.route?.airlineCode ?? '',
                details.start.shortName ?? '',
                details.end?.shortName ?? '',
                formattedStartDate,
                details.confirmations?.at(0)?.value,
            );

        case CONST.TRAVEL.UPDATE_OPERATION_TYPE.TICKET_VOIDED:
            return translate('travel.updates.ticketVoided', details.route?.airlineCode ?? '', details.start.shortName ?? '', details.end?.shortName ?? '', formattedStartDate);

        case CONST.TRAVEL.UPDATE_OPERATION_TYPE.TICKET_REFUNDED:
            return translate('travel.updates.ticketRefunded', details.route?.airlineCode ?? '', details.start.shortName ?? '', details.end?.shortName ?? '', formattedStartDate);

        case CONST.TRAVEL.UPDATE_OPERATION_TYPE.FLIGHT_CANCELLED:
            return translate('travel.updates.flightCancelled', details.route?.airlineCode ?? '', details.start.shortName ?? '', details.end?.shortName ?? '', formattedStartDate);

        case CONST.TRAVEL.UPDATE_OPERATION_TYPE.FLIGHT_SCHEDULE_CHANGE_PENDING:
            return translate('travel.updates.flightScheduleChangePending', details.route?.airlineCode ?? '');

        case CONST.TRAVEL.UPDATE_OPERATION_TYPE.FLIGHT_SCHEDULE_CHANGE_CLOSED:
            return translate('travel.updates.flightScheduleChangeClosed', details.route?.airlineCode ?? '', formattedStartDate);

        case CONST.TRAVEL.UPDATE_OPERATION_TYPE.FLIGHT_CHANGED:
            return translate('travel.updates.flightUpdated', details.route?.airlineCode ?? '', details.start.shortName ?? '', details.end?.shortName ?? '', formattedStartDate);

        case CONST.TRAVEL.UPDATE_OPERATION_TYPE.FLIGHT_CABIN_CHANGED:
            return translate('travel.updates.flightCabinChanged', details.route?.airlineCode ?? '', details.route?.class ?? '');

        case CONST.TRAVEL.UPDATE_OPERATION_TYPE.FLIGHT_SEAT_CONFIRMED:
            return translate('travel.updates.flightSeatConfirmed', details.route?.airlineCode ?? '');

        case CONST.TRAVEL.UPDATE_OPERATION_TYPE.FLIGHT_SEAT_CHANGED:
            return translate('travel.updates.flightSeatChanged', details.route?.airlineCode ?? '');

        case CONST.TRAVEL.UPDATE_OPERATION_TYPE.FLIGHT_SEAT_CANCELLED:
            return translate('travel.updates.flightSeatCancelled', details.route?.airlineCode ?? '');

        case CONST.TRAVEL.UPDATE_OPERATION_TYPE.PAYMENT_DECLINED:
            return translate('travel.updates.paymentDeclined');

        case CONST.TRAVEL.UPDATE_OPERATION_TYPE.BOOKING_CANCELED_BY_TRAVELER:
            return translate('travel.updates.bookingCancelledByTraveler', {
                type: details.type,
                id: details.reservationID,
            });

        case CONST.TRAVEL.UPDATE_OPERATION_TYPE.BOOKING_CANCELED_BY_VENDOR:
            return translate('travel.updates.bookingCancelledByVendor', {
                type: details.type,
                id: details.reservationID,
            });

        case CONST.TRAVEL.UPDATE_OPERATION_TYPE.BOOKING_REBOOKED:
            return translate('travel.updates.bookingRebooked', {
                type: details.type,
                id: details.confirmations?.at(0)?.value,
            });

        case CONST.TRAVEL.UPDATE_OPERATION_TYPE.BOOKING_UPDATED:
            return translate('travel.updates.bookingUpdated', {
                type: details.type,
            });

        case CONST.TRAVEL.UPDATE_OPERATION_TYPE.TRIP_UPDATED:
            if (details.type === CONST.RESERVATION_TYPE.CAR || details.type === CONST.RESERVATION_TYPE.HOTEL) {
                return translate('travel.updates.defaultUpdate', {
                    type: details.type,
                });
            }
            if (details.type === CONST.RESERVATION_TYPE.TRAIN) {
                return translate('travel.updates.railTicketUpdate', {
                    origin: details.start.cityName ?? details.start.shortName ?? '',
                    destination: details.end.cityName ?? details.end.shortName ?? '',
                    startDate: formattedStartDate,
                });
            }
            return translate('travel.updates.flightUpdated', details.route?.airlineCode ?? '', details.start.shortName ?? '', details.end?.shortName ?? '', formattedStartDate);

        case CONST.TRAVEL.UPDATE_OPERATION_TYPE.BOOKING_OTHER_UPDATE:
            if (details.type === CONST.RESERVATION_TYPE.CAR || details.type === CONST.RESERVATION_TYPE.HOTEL) {
                return translate('travel.updates.defaultUpdate', {
                    type: details.type,
                });
            }
            if (details.type === CONST.RESERVATION_TYPE.TRAIN) {
                return translate('travel.updates.railTicketUpdate', {
                    origin: details.start.cityName ?? details.start.shortName ?? '',
                    destination: details.end.cityName ?? details.end.shortName ?? '',
                    startDate: formattedStartDate,
                });
            }
            return translate('travel.updates.flightUpdated', details.route?.airlineCode ?? '', details.start.shortName ?? '', details.end?.shortName ?? '', formattedStartDate);

        case CONST.TRAVEL.UPDATE_OPERATION_TYPE.REFUND:
            return translate('travel.updates.railTicketRefund', {
                origin: details.start.cityName ?? details.start.shortName ?? '',
                destination: details.end.cityName ?? details.end.shortName ?? '',
                startDate: formattedStartDate,
            });

        case CONST.TRAVEL.UPDATE_OPERATION_TYPE.EXCHANGE:
            return translate('travel.updates.railTicketExchange', {
                origin: details.start.cityName ?? details.start.shortName ?? '',
                destination: details.end.cityName ?? details.end.shortName ?? '',
                startDate: formattedStartDate,
            });

        default:
            return translate('travel.updates.defaultUpdate', {
                type: details?.type ?? '',
            });
    }
}

// eslint-disable-next-line @typescript-eslint/no-deprecated
function getMemberChangeMessageFragment(translate: LocalizedTranslate, reportAction: OnyxEntry<ReportAction>, getReportNameCallback: typeof getReportName): Message {
    const messageElements: readonly MemberChangeMessageElement[] = getMemberChangeMessageElements(translate, reportAction, getReportNameCallback);
    const html = messageElements
        .map((messageElement) => {
            switch (messageElement.kind) {
                case 'userMention':
                    return `<mention-user accountID=${messageElement.accountID}>${messageElement.content}</mention-user>`;
                case 'roomReference':
                    return `<a href="${environmentURL}/r/${messageElement.roomID}" target="_blank">${messageElement.roomName}</a>`;
                default:
                    return messageElement.content;
            }
        })
        .join('');

    return {
        html: `<muted-text>${html}</muted-text>`,
        text: getReportActionMessage(reportAction) ? getReportActionText(reportAction) : '',
        type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
    };
}

function getUpdateRoomDescriptionFragment(translate: LocalizedTranslate, reportAction: ReportAction): Message {
    const html = getUpdateRoomDescriptionMessage(translate, reportAction);
    return {
        html: `<muted-text>${html}</muted-text>`,
        text: getReportActionMessage(reportAction) ? getReportActionText(reportAction) : '',
        type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
    };
}

function getReportActionMessageFragments(translate: LocalizedTranslate, action: ReportAction): Message[] {
    if (isOldDotReportAction(action)) {
        const oldDotMessage = getMessageOfOldDotReportAction(translate, action);
        const html = isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.SELECTED_FOR_RANDOM_AUDIT) ? Parser.replace(oldDotMessage) : oldDotMessage;
        return [{text: oldDotMessage, html: `<muted-text>${html}</muted-text>`, type: 'COMMENT'}];
    }

    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.UPDATE_ROOM_DESCRIPTION)) {
        const message = getUpdateRoomDescriptionMessage(translate, action);
        return [{text: message, html: `<muted-text>${message}</muted-text>`, type: 'COMMENT'}];
    }

    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.UPDATE_ROOM_AVATAR)) {
        const message = getRoomAvatarUpdatedMessage(translate, action);
        return [{text: message, html: `<muted-text>${message}</muted-text>`, type: 'COMMENT'}];
    }

    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DESCRIPTION)) {
        const message = getWorkspaceDescriptionUpdatedMessage(translate, action);
        return [{text: message, html: `<muted-text>${message}</muted-text>`, type: 'COMMENT'}];
    }

    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.REIMBURSED)) {
        const message = getReportActionMessageText(action);
        return [{text: message, html: `<muted-text>${message}</muted-text>`, type: 'COMMENT'}];
    }

    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.RETRACTED)) {
        const message = translate('iou.retracted');
        return [{text: message, html: `<muted-text>${message}</muted-text>`, type: 'COMMENT'}];
    }

    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.REOPENED)) {
        const message = translate('iou.reopened');
        return [{text: message, html: `<muted-text>${message}</muted-text>`, type: 'COMMENT'}];
    }

    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.TRAVEL_UPDATE)) {
        const message = getTravelUpdateMessage(translate, action);
        return [{text: message, html: `<muted-text>${message}</muted-text>`, type: 'COMMENT'}];
    }

    if (isConciergeCategoryOptions(action) || isConciergeDescriptionOptions(action)) {
        const message = getReportActionMessageText(action);
        return [{text: message, html: message, type: 'COMMENT'}];
    }

    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED)) {
        const message = getDynamicExternalWorkflowRoutedMessage(action, translate);
        return [{text: message, html: `<muted-text>${message}</muted-text>`, type: 'COMMENT'}];
    }

    const actionMessage = action.previousMessage ?? action.message;
    if (Array.isArray(actionMessage)) {
        return actionMessage.filter((item): item is Message => !!item);
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
function hasRequestFromCurrentAccount(reportID: string | undefined, currentAccountID: number): boolean {
    if (!reportID) {
        return false;
    }

    const reportActions = Object.values(getAllReportActions(reportID));
    if (reportActions.length === 0) {
        return false;
    }

    return reportActions.some((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.IOU && action.actorAccountID === currentAccountID && !isDeletedAction(action));
}

/**
 * Constructs a message for an actionable mention whisper report action.
 * @param reportAction
 * @returns the actionable mention whisper message.
 */
function getActionableMentionWhisperMessage(translate: LocalizedTranslate, reportAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_MENTION_WHISPER>>): string {
    if (!reportAction) {
        return '';
    }
    const originalMessage = getOriginalMessage(reportAction);
    const targetAccountIDs: number[] = originalMessage?.inviteeAccountIDs ?? [];
    const personalDetails = getPersonalDetailsByIDs({accountIDs: targetAccountIDs, currentUserAccountID: 0});
    const mentionElements = targetAccountIDs.map((accountID): string => {
        const personalDetail = personalDetails.find((personal) => personal.accountID === accountID);
        const displayName = getEffectiveDisplayName(formatPhoneNumber, personalDetail);
        const handleText = isEmpty(displayName) ? translate('common.hidden') : displayName;
        return `<mention-user accountID=${accountID}>@${handleText}</mention-user>`;
    });
    const preMentionsText = 'Heads up, ';
    const mentions = mentionElements.join(', ').replaceAll(/, ([^,]*)$/g, ' and $1');
    const postMentionsText = ` ${mentionElements.length > 1 ? "aren't members" : "isn't a member"} of this room.`;

    return `${preMentionsText}${mentions}${postMentionsText}`;
}

/**
 * Note: Prefer `ReportActionsUtils.isCurrentActionUnread` over this method, if applicable.
 * Check whether a specific report action is unread.
 */
function isReportActionUnread(reportAction: OnyxEntry<ReportAction>, lastReadTime?: string) {
    if (!lastReadTime) {
        return !isCreatedAction(reportAction);
    }

    return !!(reportAction && lastReadTime && reportAction.created && lastReadTime < reportAction.created);
}

/**
 * Check whether the current report action of the report is unread or not
 *
 */
function isCurrentActionUnread(report: OnyxEntry<Report>, reportAction: ReportAction, visibleReportActions?: ReportAction[]): boolean {
    const lastReadTime = report?.lastReadTime ?? '';
    const sortedReportActions = visibleReportActions ?? getSortedReportActions(Object.values(getAllReportActions(report?.reportID)));
    const currentActionIndex = sortedReportActions.findIndex((action) => action.reportActionID === reportAction.reportActionID);
    if (currentActionIndex === -1) {
        return false;
    }
    const prevReportAction = sortedReportActions.at(currentActionIndex - 1);
    return isReportActionUnread(reportAction, lastReadTime) && (currentActionIndex === 0 || !prevReportAction || !isReportActionUnread(prevReportAction, lastReadTime));
}

/**
 * Checks if a given report action corresponds to a join request action.
 * @param reportAction
 */
function isActionableJoinRequest(reportAction: OnyxEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_JOIN_REQUEST> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_JOIN_REQUEST);
}

function isActionableJoinRequestPendingReportAction(reportAction: OnyxEntry<ReportAction>): boolean {
    return isActionableJoinRequest(reportAction) && getOriginalMessage(reportAction)?.choice === ('' as JoinWorkspaceResolution);
}

function isConciergeCategoryOptions(reportAction: OnyxEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.CONCIERGE_CATEGORY_OPTIONS> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.CONCIERGE_CATEGORY_OPTIONS);
}

function isConciergeDescriptionOptions(reportAction: OnyxEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.CONCIERGE_DESCRIPTION_OPTIONS> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.CONCIERGE_DESCRIPTION_OPTIONS);
}

function getActionableJoinRequestPendingReportAction(reportID: string): OnyxEntry<ReportAction> {
    const findPendingRequest = Object.values(getAllReportActions(reportID)).find((reportActionItem) => isActionableJoinRequestPendingReportAction(reportActionItem));
    return findPendingRequest;
}

/**
 * Checks if any report actions correspond to a join request action that is still pending.
 * @param reportID
 */
function isActionableJoinRequestPending(reportID: string): boolean {
    return !!getActionableJoinRequestPendingReportAction(reportID);
}

function isApprovedOrSubmittedReportAction(action: OnyxEntry<ReportAction>) {
    return [CONST.REPORT.ACTIONS.TYPE.APPROVED, CONST.REPORT.ACTIONS.TYPE.SUBMITTED].some((type) => type === action?.actionName);
}

/**
 * Gets the text version of the message in a report action
 */
function getReportActionMessageText(reportAction: OnyxEntry<ReportAction>): string {
    if (!Array.isArray(reportAction?.message)) {
        return getReportActionText(reportAction);
    }
    // Sometime html can be an empty string
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return reportAction?.message?.reduce((acc, curr) => `${acc}${getTextFromHtml(curr?.html || curr?.text)}`, '') ?? '';
}

function getDismissedViolationMessageText(translate: LocalizedTranslate, originalMessage: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.DISMISSED_VIOLATION>['originalMessage']): string {
    const reason = originalMessage?.reason;
    const violationName = originalMessage?.violationName;
    return translate(`violationDismissal.${violationName}.${reason}` as TranslationPaths);
}

function getMentionedAccountIDsFromAction(reportAction: OnyxInputOrEntry<ReportAction>) {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT) ? (getOriginalMessage(reportAction)?.mentionedAccountIDs ?? []) : [];
}

function getMentionedEmailsFromMessage(message: string) {
    const mentionEmailRegex = /<mention-user>(.*?)<\/mention-user>/g;
    const matches = [...message.matchAll(mentionEmailRegex)];
    return matches.map((match) => Str.removeSMSDomain(match[1].substring(1)));
}

function didMessageMentionCurrentUser(reportAction: OnyxInputOrEntry<ReportAction>, currentUserEmail: string) {
    const accountIDsFromMessage = getMentionedAccountIDsFromAction(reportAction);
    const message = getReportActionMessage(reportAction)?.html ?? '';
    const emailsFromMessage = getMentionedEmailsFromMessage(message);
    return accountIDsFromMessage.includes(deprecatedCurrentUserAccountID ?? CONST.DEFAULT_NUMBER_ID) || emailsFromMessage.includes(currentUserEmail) || message.includes('<mention-here>');
}

/**
 * Check if the current user is the requestor of the action
 */
function wasActionTakenByCurrentUser(reportAction: OnyxInputOrEntry<ReportAction>): boolean {
    return deprecatedCurrentUserAccountID === reportAction?.actorAccountID;
}

/**
 * Get IOU action for a reportID and transactionID
 */
function getIOUActionForReportID(reportID: string | undefined, transactionID: string | undefined): OnyxEntry<ReportAction> {
    if (!reportID || !transactionID) {
        return undefined;
    }
    const reportActions = getAllReportActions(reportID);

    return getIOUActionForTransactionID(Object.values(reportActions ?? {}), transactionID);
}

/**
 * Get the IOU action for a transactionID from given reportActions
 */
function getIOUActionForTransactionID(reportActions: ReportAction[], transactionID: string): OnyxEntry<ReportAction> {
    return reportActions.find((reportAction) => {
        const IOUTransactionID = isMoneyRequestAction(reportAction) ? getOriginalMessage(reportAction)?.IOUTransactionID : undefined;
        return IOUTransactionID === transactionID;
    });
}

/**
 * Get the track expense actionable whisper of the corresponding track expense
 */
function getTrackExpenseActionableWhisper(transactionID: string | undefined, chatReportID: string | undefined) {
    if (!transactionID || !chatReportID) {
        return undefined;
    }

    const chatReportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`] ?? {};
    return Object.values(chatReportActions).find((action: ReportAction) => isActionableTrackExpense(action) && getOriginalMessage(action)?.transactionID === transactionID);
}

/**
 * Checks if a given report action corresponds to a add payment card action.
 * @param reportAction
 */
function isActionableAddPaymentCard(reportAction: OnyxEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_ADD_PAYMENT_CARD> {
    return reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_ADD_PAYMENT_CARD;
}
/**
 * Checks if a given report action corresponds to a actionable card fraud alert action.
 */
function isActionableCardFraudAlert(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_CARD_FRAUD_ALERT> {
    return reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_CARD_FRAUD_ALERT;
}

function getExportIntegrationLastMessageText(translate: LocalizedTranslate, reportAction: OnyxEntry<ReportAction>): string {
    const fragments = getExportIntegrationActionFragments(translate, reportAction);
    return fragments.reduce((acc, fragment) => `${acc} ${fragment.text}`, '');
}

function getExportIntegrationMessageHTML(translate: LocalizedTranslate, reportAction: OnyxEntry<ReportAction>): string {
    const fragments = getExportIntegrationActionFragments(translate, reportAction);
    const htmlFragments = fragments.map((fragment) => (fragment.url ? `<a href="${fragment.url}">${fragment.text}</a>` : fragment.text));
    return htmlFragments.join(' ');
}

function getExportIntegrationActionFragments(translate: LocalizedTranslate, reportAction: OnyxEntry<ReportAction>): Array<{text: string; url: string}> {
    if (reportAction?.actionName !== CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION) {
        throw Error(`received wrong action type. actionName: ${reportAction?.actionName}`);
    }

    const isPending = reportAction?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD;
    const originalMessage = (getOriginalMessage(reportAction) ?? {}) as OriginalMessageExportIntegration;
    const {label, markedManually, automaticAction} = originalMessage;
    const reimbursableUrls = originalMessage.reimbursableUrls ?? [];
    const nonReimbursableUrls = originalMessage.nonReimbursableUrls ?? [];
    const reportID = reportAction?.reportID;
    const wasExportedAfterBase62 = (reportAction?.created ?? '') > '2022-11-14';
    const base62ReportID = getBase62ReportID(Number(reportID));

    const result: Array<{text: string; url: string}> = [];
    if (isPending) {
        result.push({
            text: translate('report.actions.type.exportedToIntegration.pending', label),
            url: '',
        });
    } else if (markedManually) {
        result.push({
            text: translate('report.actions.type.exportedToIntegration.manual', label),
            url: '',
        });
    } else if (automaticAction) {
        result.push({
            text: translate('report.actions.type.exportedToIntegration.automaticActionOne', label),
            url: '',
        });
        const url = CONST.HELP_DOC_LINKS[label as keyof typeof CONST.HELP_DOC_LINKS];
        result.push({
            text: translate('report.actions.type.exportedToIntegration.automaticActionTwo'),
            url: url || '',
        });
    } else {
        result.push({
            text: translate('report.actions.type.exportedToIntegration.automatic', label),
            url: '',
        });
    }
    if (reimbursableUrls.length || nonReimbursableUrls.length) {
        result.push({
            text: translate('report.actions.type.exportedToIntegration.automaticActionThree'),
            url: '',
        });
    }

    if (reimbursableUrls.length === 1) {
        const shouldAddPeriod = nonReimbursableUrls.length === 0;
        const reimbursableUrl = reimbursableUrls.at(0) ?? '';
        result.push({
            text: translate('report.actions.type.exportedToIntegration.reimburseableLink') + (shouldAddPeriod ? '.' : ''),
            url: reimbursableUrl.startsWith('https://') ? reimbursableUrl : '',
        });
    }
    if (reimbursableUrls.length === 1 && nonReimbursableUrls.length) {
        result.push({
            text: translate('common.and'),
            url: '',
        });
    }
    if (nonReimbursableUrls.length) {
        const text = translate('report.actions.type.exportedToIntegration.nonReimbursableLink');
        let url = '';

        if (nonReimbursableUrls.length === 1) {
            const nonReimbursableUrl = nonReimbursableUrls.at(0) ?? '';
            url = nonReimbursableUrl.startsWith('https://') ? nonReimbursableUrl : '';
        } else {
            switch (label) {
                case CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.xero:
                    url = XERO_NON_REIMBURSABLE_EXPENSES_URL;
                    break;
                case CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.netsuite:
                    url = NETSUITE_NON_REIMBURSABLE_EXPENSES_URL_PREFIX;
                    url += wasExportedAfterBase62 ? base62ReportID : reportID;
                    break;
                case CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.financialForce:
                    // The first three characters in a Salesforce ID is the expense type
                    url = nonReimbursableUrls.at(0)?.substring(0, SALESFORCE_EXPENSES_URL_PREFIX.length + 3) ?? '';
                    break;
                default:
                    url = QBO_EXPENSES_URL;
            }
        }

        result.push({text, url});
    }

    return result;
}

function getUpdateRoomDescriptionMessage(translate: LocalizedTranslate, reportAction: ReportAction): string {
    const originalMessage = getOriginalMessage(reportAction) as OriginalMessageChangeLog;
    if (originalMessage?.description) {
        return `${translate('roomChangeLog.updateRoomDescription')} ${originalMessage?.description}`;
    }
    return translate('roomChangeLog.clearRoomDescription');
}

function getRoomAvatarUpdatedMessage(translate: LocalizedTranslate, reportAction: ReportAction): string {
    const originalMessage = getOriginalMessage(reportAction) as OriginalMessageChangeLog;
    if (originalMessage?.avatarURL) {
        return translate('roomChangeLog.changedRoomAvatar');
    }

    return translate('roomChangeLog.removedRoomAvatar');
}

function isPolicyChangeLogAddEmployeeMessage(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_EMPLOYEE> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_EMPLOYEE);
}

function getPolicyChangeLogAddEmployeeMessage(translate: LocalizedTranslate, reportAction: OnyxInputOrEntry<ReportAction>): string {
    if (!isPolicyChangeLogAddEmployeeMessage(reportAction)) {
        return '';
    }

    const originalMessage = getOriginalMessage(reportAction);
    const email = originalMessage?.email ?? '';
    const role = translate('workspace.common.roleName', {role: originalMessage?.role ?? ''}).toLowerCase();
    const formattedEmail = formatPhoneNumber(email);
    return translate('report.actions.type.addEmployee', formattedEmail, role);
}

function isPolicyChangeLogChangeRoleMessage(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EMPLOYEE> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EMPLOYEE);
}

function buildPolicyChangeLogUpdateEmployeeSingleFieldMessage(translate: LocalizedTranslate, field: string | undefined, oldValue: unknown, newValue: unknown, rawEmail: string): string {
    if (!field) {
        return '';
    }

    const email = formatPhoneNumber(rawEmail ?? '');
    const stringOldValue = typeof oldValue === 'string' ? oldValue : '';
    const stringNewValue = typeof newValue === 'string' ? newValue : '';
    const customFieldType = Object.values(CONST.CUSTOM_FIELD_KEYS).find((value) => value === field);
    if (customFieldType) {
        const translationKey = field === CONST.CUSTOM_FIELD_KEYS.customField1 ? 'report.actions.type.updatedCustomField1' : 'report.actions.type.updatedCustomField2';
        return translate(translationKey, {
            email,
            newValue: stringNewValue,
            previousValue: stringOldValue,
        });
    }

    const newRole = translate('workspace.common.roleName', {role: stringNewValue}).toLowerCase();
    const oldRole = translate('workspace.common.roleName', {role: stringOldValue}).toLowerCase();
    return translate('report.actions.type.updateRole', {email, newRole, currentRole: oldRole});
}

function getPolicyChangeLogUpdateEmployee(translate: LocalizedTranslate, reportAction: OnyxInputOrEntry<ReportAction>): string {
    if (!isPolicyChangeLogChangeRoleMessage(reportAction)) {
        return '';
    }

    const originalMessage = getOriginalMessage(reportAction);
    const email = originalMessage?.email ?? '';
    const fieldChanges = originalMessage?.fields;

    if (Array.isArray(fieldChanges) && fieldChanges.length > 0) {
        const messages = fieldChanges
            .map((fieldChange) => {
                if (!fieldChange || typeof fieldChange !== 'object') {
                    return '';
                }
                return buildPolicyChangeLogUpdateEmployeeSingleFieldMessage(translate, fieldChange.field, fieldChange.oldValue, fieldChange.newValue, email);
            })
            .filter(Boolean);

        return messages.join(', ');
    }

    return buildPolicyChangeLogUpdateEmployeeSingleFieldMessage(translate, originalMessage?.field, originalMessage?.oldValue, originalMessage?.newValue, email);
}

function getPolicyChangeLogEmployeeLeftMessage(translate: LocalizedTranslate, reportAction: ReportAction, useName = false): string {
    if (!isLeavePolicyAction(reportAction)) {
        return '';
    }
    const originalMessage = getOriginalMessage(reportAction);
    const personalDetails = getPersonalDetailsByIDs({accountIDs: reportAction.actorAccountID ? [reportAction.actorAccountID] : [], currentUserAccountID: 0})?.at(0);
    if (!!originalMessage && !originalMessage.email) {
        originalMessage.email = personalDetails?.login;
    }
    const nameOrEmail = useName && !!personalDetails?.firstName ? `${personalDetails?.firstName}:` : (originalMessage?.email ?? '');
    const formattedNameOrEmail = formatPhoneNumber(nameOrEmail);
    return translate('report.actions.type.leftWorkspace', {nameOrEmail: formattedNameOrEmail});
}

function isPolicyChangeLogDeleteMemberMessage(
    reportAction: OnyxInputOrEntry<ReportAction>,
): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_EMPLOYEE> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_EMPLOYEE);
}

function getWorkspaceDescriptionUpdatedMessage(translate: LocalizedTranslate, action: ReportAction) {
    const {oldDescription, newDescription} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DESCRIPTION>) ?? {};
    const message =
        typeof oldDescription === 'string' && newDescription ? translate('workspaceActions.updateWorkspaceDescription', {newDescription, oldDescription}) : getReportActionText(action);
    return message;
}

function getWorkspaceCurrencyUpdateMessage(translate: LocalizedTranslate, action: ReportAction) {
    const {oldCurrency, newCurrency} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CURRENCY>) ?? {};
    const message = oldCurrency && newCurrency ? translate('workspaceActions.updatedWorkspaceCurrencyAction', {oldCurrency, newCurrency}) : getReportActionText(action);
    return message;
}

type AutoReportingFrequencyKey = ValueOf<typeof CONST.POLICY.AUTO_REPORTING_FREQUENCIES>;
type AutoReportingFrequencyDisplayNames = Record<AutoReportingFrequencyKey, string>;

const getAutoReportingFrequencyDisplayNames = (translate: LocalizedTranslate): AutoReportingFrequencyDisplayNames => ({
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY]: translate('workflowsPage.frequencies.monthly'),
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE]: translate('workflowsPage.frequencies.daily'),
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY]: translate('workflowsPage.frequencies.weekly'),
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.SEMI_MONTHLY]: translate('workflowsPage.frequencies.twiceAMonth'),
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.TRIP]: translate('workflowsPage.frequencies.byTrip'),
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL]: translate('workflowsPage.frequencies.manually'),
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT]: translate('workflowsPage.frequencies.instant'),
});

function getWorkspaceFrequencyUpdateMessage(translate: LocalizedTranslate, action: ReportAction): string {
    const {oldFrequency, newFrequency} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_REPORTING_FREQUENCY>) ?? {};

    if (!oldFrequency || !newFrequency) {
        return getReportActionText(action);
    }

    const frequencyDisplayNames = getAutoReportingFrequencyDisplayNames(translate);
    const oldFrequencyTranslation = frequencyDisplayNames[oldFrequency]?.toLowerCase();
    const newFrequencyTranslation = frequencyDisplayNames[newFrequency]?.toLowerCase();

    if (!oldFrequencyTranslation || !newFrequencyTranslation) {
        return getReportActionText(action);
    }
    return translate('workspaceActions.updatedWorkspaceFrequencyAction', {
        oldFrequency: oldFrequencyTranslation,
        newFrequency: newFrequencyTranslation,
    });
}

function getWorkspaceCategoryUpdateMessage(translate: LocalizedTranslate, action: ReportAction, policy?: OnyxEntry<Policy>): string {
    const {categoryName, oldValue, newName, oldName, updatedField, newValue, currency} =
        getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CATEGORY>) ?? {};

    const decodedOptionName = getDecodedCategoryName(categoryName ?? '');

    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CATEGORY && categoryName) {
        return translate('workspaceActions.addCategory', {
            categoryName: decodedOptionName,
        });
    }

    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CATEGORY && categoryName) {
        return translate('workspaceActions.deleteCategory', {
            categoryName: decodedOptionName,
        });
    }

    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CATEGORY && categoryName) {
        if (updatedField === 'commentHint') {
            return translate('workspaceActions.updatedDescriptionHint', {
                oldValue: oldValue as string | undefined,
                newValue: newValue as string | undefined,
                categoryName: decodedOptionName,
            });
        }

        if (updatedField === 'enabled') {
            return translate('workspaceActions.updateCategory', {
                oldValue: !!oldValue,
                categoryName: decodedOptionName,
            });
        }

        if (updatedField === 'areCommentsRequired' && typeof oldValue === 'boolean') {
            return translate('workspaceActions.updateAreCommentsRequired', {
                oldValue,
                categoryName: decodedOptionName,
            });
        }

        if (updatedField === 'Payroll Code' && typeof oldValue === 'string' && typeof newValue === 'string') {
            return translate('workspaceActions.updateCategoryPayrollCode', {
                oldValue,
                categoryName: decodedOptionName,
                newValue,
            });
        }

        if (updatedField === 'GL Code' && typeof oldValue === 'string' && typeof newValue === 'string') {
            return translate('workspaceActions.updateCategoryGLCode', {
                oldValue,
                categoryName: decodedOptionName,
                newValue,
            });
        }

        if (updatedField === 'maxExpenseAmount' && (typeof oldValue === 'string' || typeof oldValue === 'number')) {
            return translate('workspaceActions.updateCategoryMaxExpenseAmount', {
                oldAmount: Number(oldValue) ? convertAmountToDisplayString(Number(oldValue), currency) : undefined,
                newAmount: Number(newValue ?? 0) ? convertAmountToDisplayString(Number(newValue), currency) : undefined,
                categoryName: decodedOptionName,
            });
        }

        if (updatedField === 'expenseLimitType' && typeof newValue === 'string' && typeof oldValue === 'string') {
            return translate('workspaceActions.updateCategoryExpenseLimitType', {
                categoryName: decodedOptionName,
                oldValue: oldValue ? translate(`workspace.rules.categoryRules.expenseLimitTypes.${oldValue}` as TranslationPaths) : undefined,
                newValue: translate(`workspace.rules.categoryRules.expenseLimitTypes.${newValue}` as TranslationPaths),
            });
        }

        if (updatedField === 'maxAmountNoReceipt' && typeof oldValue !== 'boolean' && typeof newValue !== 'boolean') {
            const maxExpenseAmountToDisplay = policy?.maxExpenseAmountNoReceipt === CONST.DISABLED_MAX_EXPENSE_VALUE ? 0 : policy?.maxExpenseAmountNoReceipt;

            const formatAmount = () => convertToShortDisplayString(maxExpenseAmountToDisplay, policy?.outputCurrency ?? CONST.CURRENCY.USD);
            const getTranslation = (value?: number | string) => {
                if (value === CONST.DISABLED_MAX_EXPENSE_VALUE) {
                    return translate('workspace.rules.categoryRules.requireReceiptsOverList.never');
                }
                if (value === 0) {
                    return translate('workspace.rules.categoryRules.requireReceiptsOverList.always');
                }
                return translate('workspace.rules.categoryRules.requireReceiptsOverList.default', formatAmount());
            };
            return translate('workspaceActions.updateCategoryMaxAmountNoReceipt', {
                categoryName: decodedOptionName,
                oldValue: getTranslation(oldValue),
                newValue: getTranslation(newValue),
            });
        }
    }

    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.SET_CATEGORY_NAME && oldName && newName) {
        return translate('workspaceActions.setCategoryName', {
            oldName: getDecodedCategoryName(oldName),
            newName: getDecodedCategoryName(newName),
        });
    }

    return getReportActionText(action);
}

function getWorkspaceTaxUpdateMessage(translate: LocalizedTranslate, action: ReportAction): string {
    const {taxName, oldValue, newValue, updatedField} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_TAX>) ?? {};

    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_TAX && taxName) {
        return translate('workspaceActions.addTax', {taxName});
    }

    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_TAX && taxName) {
        return translate('workspaceActions.deleteTax', {taxName});
    }

    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAX && taxName) {
        return translate('workspaceActions.updateTax', {taxName, oldValue, newValue, updatedField});
    }

    return getReportActionText(action);
}

function getWorkspaceTagUpdateMessage(translate: LocalizedTranslate, action: ReportAction | undefined): string {
    const {tagListName, tagName, enabled, newName, newValue, oldName, oldValue, updatedField, count} =
        getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CATEGORY>) ?? {};

    if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_TAG && tagListName && tagName) {
        return translate('workspaceActions.addTag', {
            tagListName,
            tagName,
        });
    }

    if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_TAG && tagListName && tagName) {
        return translate('workspaceActions.deleteTag', {
            tagListName,
            tagName,
        });
    }

    if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_MULTIPLE_TAGS && count && tagListName) {
        return translate('workspaceActions.deleteMultipleTags', {
            count,
            tagListName,
        });
    }

    if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_ENABLED && tagListName && tagName) {
        return translate('workspaceActions.updateTagEnabled', {
            tagListName,
            tagName,
            enabled,
        });
    }

    if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_NAME && tagListName && newName && oldName) {
        return translate('workspaceActions.updateTagName', {
            tagListName,
            newName,
            oldName,
        });
    }

    if (
        action?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG &&
        tagListName &&
        (typeof oldValue === 'string' || typeof oldValue === 'undefined') &&
        typeof newValue === 'string' &&
        tagName &&
        updatedField
    ) {
        return translate('workspaceActions.updateTag', {
            tagListName,
            oldValue,
            newValue,
            tagName,
            updatedField,
        });
    }

    return getReportActionText(action);
}

function getTagListNameUpdatedMessage(translate: LocalizedTranslate, action: ReportAction): string {
    const {oldName, newName} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_LIST_NAME>) ?? {};
    if (newName && oldName) {
        return translate('workspaceActions.updateTagListName', {
            oldName,
            newName,
        });
    }
    return getReportActionText(action);
}

function getWorkspaceCustomUnitUpdatedMessage(translate: LocalizedTranslate, action: ReportAction): string {
    const {oldValue, newValue, customUnitName, updatedField} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT>) ?? {};

    if (customUnitName === 'Distance' && updatedField === 'taxEnabled' && typeof newValue === 'boolean') {
        return translate('workspaceActions.updateCustomUnitTaxEnabled', {
            newValue,
        });
    }

    if (customUnitName && typeof oldValue === 'string' && typeof newValue === 'string' && updatedField) {
        return translate('workspaceActions.updateCustomUnit', {
            customUnitName,
            newValue,
            oldValue,
            updatedField,
        });
    }

    return getReportActionText(action);
}

function getWorkspaceCustomUnitRateAddedMessage(translate: LocalizedTranslate, action: ReportAction): string {
    const {customUnitName, rateName} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CATEGORY>) ?? {};

    if (customUnitName && rateName) {
        return translate('workspaceActions.addCustomUnitRate', customUnitName, rateName);
    }

    return getReportActionText(action);
}

function getWorkspaceCustomUnitRateUpdatedMessage(translate: LocalizedTranslate, action: ReportAction): string {
    const {customUnitName, customUnitRateName, updatedField, oldValue, newValue, newTaxPercentage, oldTaxPercentage} =
        getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT_RATE>) ?? {};

    if (customUnitName && customUnitRateName && updatedField === 'rate' && typeof oldValue === 'string' && typeof newValue === 'string') {
        return translate('workspaceActions.updatedCustomUnitRate', {
            customUnitName,
            customUnitRateName,
            updatedField,
            oldValue,
            newValue,
        });
    }

    if (customUnitRateName && updatedField === 'taxRateExternalID' && typeof newValue === 'string' && newTaxPercentage) {
        return translate('workspaceActions.updatedCustomUnitTaxRateExternalID', {
            customUnitRateName,
            newValue,
            newTaxPercentage,
            oldTaxPercentage,
            oldValue: oldValue as string | undefined,
        });
    }

    if (customUnitRateName && updatedField === 'taxClaimablePercentage' && typeof newValue === 'number' && customUnitRateName) {
        return translate('workspaceActions.updatedCustomUnitTaxClaimablePercentage', {
            customUnitRateName,
            newValue: parseFloat(parseFloat(newValue ?? 0).toFixed(2)),
            oldValue: typeof oldValue === 'number' ? parseFloat(parseFloat(oldValue ?? 0).toFixed(2)) : undefined,
        });
    }

    if (customUnitName && customUnitRateName && updatedField === 'enabled' && typeof oldValue === 'boolean' && typeof newValue === 'boolean') {
        return translate('workspaceActions.updatedCustomUnitRateEnabled', {
            customUnitName,
            customUnitRateName,
            oldValue,
            newValue,
        });
    }

    return getReportActionText(action);
}

function getWorkspaceCustomUnitRateDeletedMessage(translate: LocalizedTranslate, action: ReportAction): string {
    const {customUnitName, rateName} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CUSTOM_UNIT_RATE>) ?? {};
    if (customUnitName && rateName) {
        return translate('workspaceActions.deleteCustomUnitRate', customUnitName, rateName);
    }

    return getReportActionText(action);
}

function getWorkspaceReportFieldAddMessage(translate: LocalizedTranslate, action: ReportAction): string {
    const {fieldName, fieldType} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CATEGORY>) ?? {};

    if (fieldName && fieldType) {
        return translate('workspaceActions.addedReportField', translate(getReportFieldTypeTranslationKey(fieldType as PolicyReportFieldType)).toLowerCase(), fieldName);
    }

    return getReportActionText(action);
}

function getWorkspaceReportFieldUpdateMessage(translate: LocalizedTranslate, action: ReportAction): string {
    const {updateType, fieldName, defaultValue, optionName, allEnabled, optionEnabled, toggledOptionsCount} =
        getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REPORT_FIELD>) ?? {};

    if (updateType === 'updatedDefaultValue' && fieldName && defaultValue) {
        return translate('workspaceActions.updateReportFieldDefaultValue', {
            fieldName,
            defaultValue,
        });
    }

    if (updateType === 'addedOption' && fieldName && optionName) {
        return translate('workspaceActions.addedReportFieldOption', {
            fieldName,
            optionName,
        });
    }

    if (updateType === 'changedOptionDisabled' && fieldName && optionName) {
        return translate('workspaceActions.updateReportFieldOptionDisabled', {
            fieldName,
            optionName,
            optionEnabled: !!optionEnabled,
        });
    }

    if (updateType === 'updatedAllDisabled' && fieldName && optionName) {
        return translate('workspaceActions.updateReportFieldAllOptionsDisabled', {
            fieldName,
            optionName,
            allEnabled: !!allEnabled,
            toggledOptionsCount,
        });
    }

    if (updateType === 'removedOption' && fieldName && optionName) {
        return translate('workspaceActions.removedReportFieldOption', {
            fieldName,
            optionName,
        });
    }

    return getReportActionText(action);
}

function getWorkspaceReportFieldDeleteMessage(translate: LocalizedTranslate, action: ReportAction): string {
    const {fieldType, fieldName} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CATEGORY>) ?? {};

    if (fieldType && fieldName) {
        return translate('workspaceActions.deleteReportField', translate(getReportFieldTypeTranslationKey(fieldType as PolicyReportFieldType)).toLowerCase(), fieldName);
    }

    return getReportActionText(action);
}

function getWorkspaceUpdateFieldMessage(translate: LocalizedTranslate, action: ReportAction): string {
    const {newValue, oldValue, updatedField} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FIELD>) ?? {};

    const newValueTranslationKey = CONST.POLICY.APPROVAL_MODE_TRANSLATION_KEYS[newValue as keyof typeof CONST.POLICY.APPROVAL_MODE_TRANSLATION_KEYS];
    const oldValueTranslationKey = CONST.POLICY.APPROVAL_MODE_TRANSLATION_KEYS[oldValue as keyof typeof CONST.POLICY.APPROVAL_MODE_TRANSLATION_KEYS];

    if (updatedField && updatedField === CONST.POLICY.COLLECTION_KEYS.APPROVAL_MODE && oldValueTranslationKey && newValueTranslationKey) {
        return translate('workspaceActions.updateApprovalMode', {
            newValue: translate(`workspaceApprovalModes.${newValueTranslationKey}` as TranslationPaths),
            oldValue: translate(`workspaceApprovalModes.${oldValueTranslationKey}` as TranslationPaths),
            fieldName: updatedField,
        });
    }

    if (updatedField && updatedField === CONST.POLICY.EXPENSE_REPORT_RULES.PREVENT_SELF_APPROVAL && typeof oldValue === 'string' && typeof newValue === 'string') {
        return translate('workspaceActions.preventSelfApproval', {
            oldValue,
            newValue,
        });
    }

    if (
        updatedField &&
        updatedField === CONST.POLICY.EXPENSE_REPORT_RULES.MAX_EXPENSE_AGE &&
        ((typeof oldValue === 'string' && typeof newValue === 'string') || (typeof oldValue === 'number' && typeof newValue === 'number'))
    ) {
        const isDisabled = (value: string | number): boolean => {
            return value === String(CONST.POLICY.DISABLED_MAX_EXPENSE_AGE) || value === CONST.POLICY.DISABLED_MAX_EXPENSE_AGE || value === 'false';
        };
        const oldIsDisabled = isDisabled(oldValue);
        const newIsDisabled = isDisabled(newValue);
        const oldFormatted = oldIsDisabled ? '' : String(oldValue);
        const newFormatted = newIsDisabled ? '' : String(newValue);

        if (oldIsDisabled && !newIsDisabled) {
            return translate('workspaceActions.setMaxExpenseAge', {oldValue: oldFormatted, newValue: newFormatted});
        }

        if (!oldIsDisabled && newIsDisabled) {
            return translate('workspaceActions.removedMaxExpenseAge', {oldValue: oldFormatted, newValue: newFormatted});
        }
        return translate('workspaceActions.changedMaxExpenseAge', {oldValue: oldFormatted, newValue: newFormatted});
    }
    if (
        updatedField &&
        updatedField === CONST.POLICY.COLLECTION_KEYS.AUTOREPORTING_OFFSET &&
        (typeof oldValue === 'string' || typeof oldValue === 'number') &&
        (typeof newValue === 'string' || typeof newValue === 'number')
    ) {
        const getAutoReportingOffsetToDisplay = (autoReportingOffset: string | number) => {
            if (autoReportingOffset === CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_DAY_OF_MONTH) {
                return translate('workflowsPage.frequencies.lastDayOfMonth');
            }
            if (autoReportingOffset === CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_BUSINESS_DAY_OF_MONTH) {
                return translate('workflowsPage.frequencies.lastBusinessDayOfMonth');
            }
            if (typeof autoReportingOffset === 'number') {
                return toLocaleOrdinal(IntlStore.getCurrentLocale(), autoReportingOffset, false);
            }
            return '';
        };
        return translate('workspaceActions.updateMonthlyOffset', {
            newValue: getAutoReportingOffsetToDisplay(newValue),
            oldValue: getAutoReportingOffsetToDisplay(oldValue),
        });
    }
    return getReportActionText(action);
}

type CompanyAddressOriginalMessage = {
    newAddress: {addressStreet?: string; city?: string; state?: string; zipCode?: string; country?: string};
    oldAddress?: {addressStreet?: string; city?: string; state?: string; zipCode?: string; country?: string} | null;
};

/**
 * Format address as "street1, street2 (if exists), city, state zipCode"
 */
function formatAddressToString(address: CompanyAddressOriginalMessage['newAddress'] | null | undefined): string {
    if (!address) {
        return '';
    }

    const [street1Raw, street2Raw] = (address.addressStreet ?? '').split('\n');
    const street1 = street1Raw?.trim() ?? '';
    const street2 = street2Raw?.trim() ?? '';

    const parts: string[] = [];

    if (street1) {
        parts.push(street1);
    }
    if (street2) {
        parts.push(street2);
    }
    if (address.city) {
        parts.push(address.city);
    }

    let stateZip = '';
    if (address.state) {
        stateZip = address.state;
        if (address.zipCode) {
            stateZip += ` ${address.zipCode}`;
        }
    } else if (address.zipCode) {
        stateZip = address.zipCode;
    }

    if (stateZip) {
        parts.push(stateZip);
    }

    return parts.join(', ');
}

function getCompanyAddressUpdateMessage(translate: LocalizedTranslate, action: ReportAction): string {
    const originalMessage = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_ADDRESS>) as CompanyAddressOriginalMessage | undefined;

    if (!originalMessage) {
        return getReportActionText(action);
    }

    const newAddressStr = formatAddressToString(originalMessage.newAddress);
    const oldAddressStr = formatAddressToString(originalMessage.oldAddress);

    return translate('workspaceActions.changedCompanyAddress', {
        newAddress: newAddressStr,
        previousAddress: oldAddressStr || undefined,
    });
}

function getWorkspaceFeatureEnabledMessage(translate: LocalizedTranslate, action: ReportAction): string {
    const {enabled, featureName} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FEATURE_ENABLED>) ?? {};

    return translate('workspaceActions.updatedFeatureEnabled', {
        enabled: !!enabled,
        featureName: featureName ?? '',
    });
}

function getWorkspaceAttendeeTrackingUpdateMessage(translate: LocalizedTranslate, action: ReportAction): string {
    const {enabled} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_IS_ATTENDEE_TRACKING_ENABLED>) ?? {};

    return translate('workspaceActions.updatedAttendeeTracking', {enabled: !!enabled});
}

type DefaultApproverOriginalMessage = {
    approver: {email: string; name: string; accountID: number};
    previousApprover?: {email: string; name: string; accountID: number};
};

type SubmitsToOriginalMessage = {
    members: Array<{email: string; name: string; accountID: number}>;
    approver?: {email: string; name: string; accountID: number};
    previousApprover?: {email: string; name: string; accountID: number};
    isDefaultApprover?: boolean;
    wasDefaultApprover?: boolean;
};

type ForwardsToOriginalMessage = {
    approvers: Array<{email: string; name: string; accountID: number}>;
    forwardsTo?: {email: string; name: string; accountID: number};
    previousForwardsTo?: {email: string; name: string; accountID: number};
};

function formatMemberListWithAnd(members: Array<{email: string; name: string}>): string {
    const emails = members.map((m) => Str.removeSMSDomain(m.email));

    if (emails.length === 1) {
        return emails.at(0) ?? '';
    }
    if (emails.length === 2) {
        return `${emails.at(0)} and ${emails.at(1)}`;
    }

    const allButLast = emails.slice(0, -1);
    const last = emails.at(-1);
    return `${allButLast.join(', ')}, and ${last}`;
}

function getDefaultApproverUpdateMessage(translate: LocalizedTranslate, action: ReportAction): string {
    const originalMessage = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_APPROVER>) as
        | DefaultApproverOriginalMessage
        | undefined;

    if (!originalMessage) {
        return getReportActionText(action);
    }

    const newApprover = formatPhoneNumber(originalMessage.approver?.email ?? '');
    const previousApprover = originalMessage.previousApprover ? formatPhoneNumber(originalMessage.previousApprover.email) : undefined;
    return translate('workspaceActions.changedDefaultApprover', {newApprover, previousApprover});
}

function getSubmitsToUpdateMessage(translate: LocalizedTranslate, action: ReportAction): string {
    const originalMessage = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_SUBMITS_TO>) as SubmitsToOriginalMessage | undefined;

    if (!originalMessage) {
        return getReportActionText(action);
    }

    const members = formatMemberListWithAnd(originalMessage.members ?? []);
    const isDefaultApprover = originalMessage.isDefaultApprover ?? false;
    const wasDefaultApprover = originalMessage.wasDefaultApprover ?? false;
    const approverEmail = originalMessage.approver ? formatPhoneNumber(originalMessage.approver.email) : '';
    const previousApproverEmail = originalMessage.previousApprover ? formatPhoneNumber(originalMessage.previousApprover.email) : undefined;

    if (isDefaultApprover) {
        return translate('workspaceActions.changedSubmitsToDefault', {
            members,
            approver: approverEmail,
            previousApprover: previousApproverEmail,
            wasDefaultApprover,
        });
    }

    return translate('workspaceActions.changedSubmitsToApprover', {
        members,
        approver: approverEmail,
        previousApprover: previousApproverEmail,
        wasDefaultApprover,
    });
}

function getForwardsToUpdateMessage(translate: LocalizedTranslate, action: ReportAction): string {
    const originalMessage = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FORWARDS_TO>) as ForwardsToOriginalMessage | undefined;

    if (!originalMessage) {
        return getReportActionText(action);
    }

    const approvers = formatMemberListWithAnd(originalMessage.approvers ?? []);
    const forwardsToEmail = originalMessage.forwardsTo ? formatPhoneNumber(originalMessage.forwardsTo.email) : '';
    const previousForwardsTo = originalMessage.previousForwardsTo ? formatPhoneNumber(originalMessage.previousForwardsTo.email) : undefined;

    if (!forwardsToEmail) {
        return translate('workspaceActions.removedForwardsTo', {approver: approvers, previousForwardsTo});
    }

    return translate('workspaceActions.changedForwardsTo', {approver: approvers, forwardsTo: forwardsToEmail, previousForwardsTo});
}

function getInvoiceCompanyNameUpdateMessage(translate: LocalizedTranslate, action: ReportAction): string {
    const {newValue, oldValue} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_INVOICE_COMPANY_NAME>) ?? {};

    if (typeof newValue === 'string') {
        return translate('workspaceActions.changedInvoiceCompanyName', {newValue, oldValue: typeof oldValue === 'string' ? oldValue : undefined});
    }

    return getReportActionText(action);
}

function getInvoiceCompanyWebsiteUpdateMessage(translate: LocalizedTranslate, action: ReportAction): string {
    const {newValue, oldValue} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_INVOICE_COMPANY_WEBSITE>) ?? {};

    if (typeof newValue === 'string') {
        return translate('workspaceActions.changedInvoiceCompanyWebsite', {newValue, oldValue: typeof oldValue === 'string' ? oldValue : undefined});
    }

    return getReportActionText(action);
}

function getReimburserUpdateMessage(translate: LocalizedTranslate, action: ReportAction): string {
    const originalMessage = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REIMBURSER>);

    if (originalMessage?.reimburser?.email && originalMessage?.previousReimburser?.email) {
        const newReimburser = formatPhoneNumber(originalMessage.reimburser.email);
        const previousReimburser = formatPhoneNumber(originalMessage.previousReimburser.email);

        return translate('workspaceActions.changedReimburser', {newReimburser, previousReimburser});
    }

    return getReportActionText(action);
}

function getWorkspaceReimbursementUpdateMessage(translate: LocalizedTranslate, action: ReportAction): string {
    const {enabled} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REIMBURSEMENT_ENABLED>) ?? {};

    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REIMBURSEMENT_ENABLED && typeof enabled === 'boolean') {
        return translate('workspaceActions.updateReimbursementEnabled', {enabled});
    }

    return getReportActionText(action);
}

type UpdateACHAccountOriginalMessage = {
    bankAccountName?: string;
    maskedBankAccountNumber?: string;
    oldBankAccountName?: string;
    oldMaskedBankAccountNumber?: string;
};

function getUpdateACHAccountMessage(translate: LocalizedTranslate, action: ReportAction): string {
    const {bankAccountName, maskedBankAccountNumber, oldBankAccountName, oldMaskedBankAccountNumber} =
        (getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_ACH_ACCOUNT>) as UpdateACHAccountOriginalMessage | undefined) ?? {};

    if (!!maskedBankAccountNumber && !oldMaskedBankAccountNumber) {
        return translate('workspaceActions.setDefaultBankAccount', {bankAccountName: bankAccountName ?? '', maskedBankAccountNumber});
    }
    if (!maskedBankAccountNumber && oldMaskedBankAccountNumber) {
        return translate('workspaceActions.removedDefaultBankAccount', {bankAccountName: oldBankAccountName ?? '', maskedBankAccountNumber: oldMaskedBankAccountNumber});
    }

    if (!!maskedBankAccountNumber && !!oldMaskedBankAccountNumber) {
        return translate('workspaceActions.changedDefaultBankAccount', {
            bankAccountName: bankAccountName ?? '',
            maskedBankAccountNumber,
            oldBankAccountName: oldBankAccountName ?? '',
            oldMaskedBankAccountNumber,
        });
    }

    return getReportActionText(action);
}

function getPolicyChangeLogMaxExpenseAmountNoReceiptMessage(translate: LocalizedTranslate, action: ReportAction): string {
    const {oldMaxExpenseAmountNoReceipt, newMaxExpenseAmountNoReceipt, currency} =
        getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT_NO_RECEIPT>) ?? {};

    if (typeof oldMaxExpenseAmountNoReceipt === 'number' && typeof newMaxExpenseAmountNoReceipt === 'number') {
        const oldIsDisabled = oldMaxExpenseAmountNoReceipt === CONST.DISABLED_MAX_EXPENSE_VALUE;
        const newIsDisabled = newMaxExpenseAmountNoReceipt === CONST.DISABLED_MAX_EXPENSE_VALUE;
        const oldValue = oldIsDisabled ? '' : convertToDisplayString(oldMaxExpenseAmountNoReceipt, currency);
        const newValue = newIsDisabled ? '' : convertToDisplayString(newMaxExpenseAmountNoReceipt, currency);

        if (oldIsDisabled && !newIsDisabled) {
            return translate('workspaceActions.setReceiptRequiredAmount', {oldValue, newValue});
        }

        if (!oldIsDisabled && newIsDisabled) {
            return translate('workspaceActions.removedReceiptRequiredAmount', {oldValue, newValue});
        }

        return translate('workspaceActions.changedReceiptRequiredAmount', {oldValue, newValue});
    }

    return getReportActionText(action);
}

function getPolicyChangeLogMaxExpenseAmountMessage(translate: LocalizedTranslate, action: ReportAction): string {
    const {oldMaxExpenseAmount, newMaxExpenseAmount, currency} =
        getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT>) ?? {};

    if (typeof oldMaxExpenseAmount === 'number' && typeof newMaxExpenseAmount === 'number') {
        const oldIsDisabled = oldMaxExpenseAmount === CONST.DISABLED_MAX_EXPENSE_VALUE;
        const newIsDisabled = newMaxExpenseAmount === CONST.DISABLED_MAX_EXPENSE_VALUE;
        const oldValue = oldIsDisabled ? '' : convertToDisplayString(oldMaxExpenseAmount, currency);
        const newValue = newIsDisabled ? '' : convertToDisplayString(newMaxExpenseAmount, currency);

        if (oldIsDisabled && !newIsDisabled) {
            return translate('workspaceActions.setMaxExpenseAmount', {oldValue, newValue});
        }

        if (!oldIsDisabled && newIsDisabled) {
            return translate('workspaceActions.removedMaxExpenseAmount', {oldValue, newValue});
        }

        return translate('workspaceActions.changedMaxExpenseAmount', {oldValue, newValue});
    }

    return getReportActionText(action);
}

function getPolicyChangeLogMaxExpenseAgeMessage(translate: LocalizedTranslate, action: ReportAction): string {
    const {oldMaxExpenseAge, newMaxExpenseAge} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AGE>) ?? {};

    if (typeof oldMaxExpenseAge === 'number' && typeof newMaxExpenseAge === 'number') {
        const oldIsDisabled = oldMaxExpenseAge === CONST.POLICY.DISABLED_MAX_EXPENSE_AGE;
        const newIsDisabled = newMaxExpenseAge === CONST.POLICY.DISABLED_MAX_EXPENSE_AGE;
        const oldValue = oldIsDisabled ? '' : String(oldMaxExpenseAge);
        const newValue = newIsDisabled ? '' : String(newMaxExpenseAge);

        if (oldIsDisabled && !newIsDisabled) {
            return translate('workspaceActions.setMaxExpenseAge', {oldValue, newValue});
        }

        if (!oldIsDisabled && newIsDisabled) {
            return translate('workspaceActions.removedMaxExpenseAge', {oldValue, newValue});
        }

        return translate('workspaceActions.changedMaxExpenseAge', {oldValue, newValue});
    }

    return getReportActionText(action);
}

function getPolicyChangeLogDefaultBillableMessage(translate: LocalizedTranslate, action: ReportAction): string {
    const {oldDefaultBillable, newDefaultBillable} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_BILLABLE>) ?? {};

    if (typeof oldDefaultBillable === 'string' && typeof newDefaultBillable === 'string') {
        return translate('workspaceActions.updateDefaultBillable', {
            oldValue: oldDefaultBillable,
            newValue: newDefaultBillable,
        });
    }

    return getReportActionText(action);
}

function getPolicyChangeLogDefaultReimbursableMessage(translate: LocalizedTranslate, action: ReportAction): string {
    const {oldDefaultReimbursable, newDefaultReimbursable} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_REIMBURSABLE>) ?? {};

    if (typeof oldDefaultReimbursable === 'string' && typeof newDefaultReimbursable === 'string') {
        return translate('workspaceActions.updateDefaultReimbursable', {
            oldValue: oldDefaultReimbursable,
            newValue: newDefaultReimbursable,
        });
    }

    return getReportActionText(action);
}

function getPolicyChangeLogDefaultTitleMessage(translate: LocalizedTranslate, action: ReportAction): string {
    const {oldDefaultTitle, newDefaultTitle} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_TITLE>) ?? {};

    if (typeof oldDefaultTitle === 'string' && typeof newDefaultTitle === 'string') {
        return translate('workspaceActions.changedCustomReportNameFormula', {
            newValue: newDefaultTitle,
            oldValue: oldDefaultTitle,
        });
    }

    return getReportActionText(action);
}

function getPolicyChangeLogDefaultTitleEnforcedMessage(translate: LocalizedTranslate, action: ReportAction): string {
    const {value} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_TITLE_ENFORCED>) ?? {};

    if (typeof value === 'boolean') {
        return translate('workspaceActions.updateDefaultTitleEnforced', {
            value,
        });
    }

    return getReportActionText(action);
}

function getPolicyChangeLogDeleteMemberMessage(translate: LocalizedTranslate, reportAction: OnyxInputOrEntry<ReportAction>): string {
    if (!isPolicyChangeLogDeleteMemberMessage(reportAction)) {
        return '';
    }
    const originalMessage = getOriginalMessage(reportAction);
    const email = formatPhoneNumber(originalMessage?.email ?? '');
    const role = translate('workspace.common.roleName', {role: originalMessage?.role ?? ''}).toLowerCase();
    return translate('report.actions.type.removeMember', email, role);
}

function getAddedConnectionMessage(translate: LocalizedTranslate, reportAction: OnyxEntry<ReportAction>): string {
    if (!isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_INTEGRATION)) {
        return '';
    }
    const originalMessage = getOriginalMessage(reportAction);
    const connectionName = originalMessage?.connectionName;
    return connectionName ? translate('report.actions.type.addedConnection', {connectionName}) : '';
}

function getRemovedConnectionMessage(translate: LocalizedTranslate, reportAction: OnyxEntry<ReportAction>): string {
    if (!isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_INTEGRATION)) {
        return '';
    }
    const originalMessage = getOriginalMessage(reportAction);
    const connectionName = originalMessage?.connectionName;
    return connectionName ? translate('report.actions.type.removedConnection', {connectionName}) : '';
}

function getRenamedAction(translate: LocalizedTranslate, reportAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.RENAMED>>, isExpenseReport: boolean, actorName?: string) {
    const originalMessage = getOriginalMessage(reportAction);
    return translate('newRoomPage.renamedRoomAction', {
        actorName,
        isExpenseReport,
        oldName: originalMessage?.oldName ?? '',
        newName: originalMessage?.newName ?? '',
    });
}

function getAddedApprovalRuleMessage(translate: LocalizedTranslate, reportAction: OnyxEntry<ReportAction>) {
    const {name, approverAccountID, approverEmail, field, approverName} =
        getOriginalMessage(reportAction as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_APPROVER_RULE>) ?? {};

    if (name && approverAccountID && approverEmail && field && approverName) {
        return translate('workspaceActions.addApprovalRule', approverEmail, approverName, field, name);
    }

    return getReportActionText(reportAction);
}

function getDeletedApprovalRuleMessage(translate: LocalizedTranslate, reportAction: OnyxEntry<ReportAction>) {
    const {name, approverAccountID, approverEmail, field, approverName} =
        getOriginalMessage(reportAction as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_APPROVER_RULE>) ?? {};

    if (name && approverAccountID && approverEmail && field && approverName) {
        return translate('workspaceActions.deleteApprovalRule', approverEmail, approverName, field, name);
    }

    return getReportActionText(reportAction);
}

function getActionableCardFraudAlertResolutionMessage(translate: LocalizedTranslate, reportAction: OnyxEntry<ReportAction>) {
    const {maskedCardNumber, resolution} = getOriginalMessage(reportAction as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_CARD_FRAUD_ALERT>) ?? {};
    if (resolution === CONST.CARD_FRAUD_ALERT_RESOLUTION.RECOGNIZED) {
        return translate('cardPage.cardFraudAlert.clearedMessage', {cardLastFour: maskedCardNumber?.slice(-4) ?? ''});
    }
    return translate('cardPage.cardFraudAlert.deactivatedMessage', {cardLastFour: maskedCardNumber?.slice(-4) ?? ''});
}

function getUpdatedApprovalRuleMessage(translate: LocalizedTranslate, reportAction: OnyxEntry<ReportAction>) {
    const {field, oldApproverEmail, oldApproverName, newApproverEmail, newApproverName, name} =
        getOriginalMessage(reportAction as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_APPROVER_RULE>) ?? {};

    if (field && oldApproverEmail && newApproverEmail && name) {
        return translate('workspaceActions.updateApprovalRule', {
            field,
            name,
            newApproverEmail,
            newApproverName,
            oldApproverEmail,
            oldApproverName,
        });
    }
    return getReportActionText(reportAction);
}

function getRemovedFromApprovalChainMessage(translate: LocalizedTranslate, reportAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REMOVED_FROM_APPROVAL_CHAIN>>) {
    const originalMessage = getOriginalMessage(reportAction);
    const submittersNames = getPersonalDetailsByIDs({
        accountIDs: originalMessage?.submittersAccountIDs ?? [],
        currentUserAccountID: deprecatedCurrentUserAccountID ?? CONST.DEFAULT_NUMBER_ID,
    }).map(({displayName, login}) => displayName ?? login ?? 'Unknown Submitter');
    return translate('workspaceActions.removedFromApprovalWorkflow', {submittersNames, count: submittersNames.length});
}

function getActionableCardFraudAlertMessage(
    translate: LocalizedTranslate,
    reportAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_CARD_FRAUD_ALERT>>,
    getLocalDateFromDatetime: LocaleContextProps['getLocalDateFromDatetime'],
) {
    const fraudMessage = getOriginalMessage(reportAction);
    const cardLastFour = fraudMessage?.maskedCardNumber?.slice(-4) ?? '';
    const merchant = fraudMessage?.triggerMerchant ?? '';
    const formattedAmount = convertToDisplayString(fraudMessage?.triggerAmount ?? 0, fraudMessage?.currency ?? CONST.CURRENCY.USD);
    const resolution = fraudMessage?.resolution;
    const formattedDate = reportAction?.created ? format(getLocalDateFromDatetime(reportAction?.created), 'MMM. d - h:mma').replaceAll(/am|pm/gi, (match) => match.toUpperCase()) : '';

    if (resolution === CONST.CARD_FRAUD_ALERT_RESOLUTION.RECOGNIZED) {
        return translate('cardPage.cardFraudAlert.clearedMessage', {cardLastFour});
    }

    if (resolution === CONST.CARD_FRAUD_ALERT_RESOLUTION.FRAUD) {
        return translate('cardPage.cardFraudAlert.deactivatedMessage', {cardLastFour});
    }
    return translate('cardPage.cardFraudAlert.alertMessage', {
        cardLastFour,
        amount: formattedAmount,
        merchant,
        date: formattedDate,
    });
}

function getDemotedFromWorkspaceMessage(translate: LocalizedTranslate, reportAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.DEMOTED_FROM_WORKSPACE>>) {
    const originalMessage = getOriginalMessage(reportAction);
    const policyName = originalMessage?.policyName ?? translate('workspace.common.workspace');
    const oldRole = translate('workspace.common.roleName', {role: originalMessage?.oldRole}).toLowerCase();
    return translate('workspaceActions.demotedFromWorkspace', policyName, oldRole);
}

function getUpdatedAuditRateMessage(translate: LocalizedTranslate, reportAction: OnyxEntry<ReportAction>) {
    const {oldAuditRate, newAuditRate} = getOriginalMessage(reportAction as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUDIT_RATE>) ?? {};

    if (typeof oldAuditRate !== 'number' || typeof newAuditRate !== 'number') {
        return getReportActionText(reportAction);
    }
    return translate('workspaceActions.updatedAuditRate', {oldAuditRate, newAuditRate});
}

function getUpdatedManualApprovalThresholdMessage(translate: LocalizedTranslate, reportAction: OnyxEntry<ReportAction>) {
    const {
        oldLimit,
        newLimit,
        currency = CONST.CURRENCY.USD,
    } = getOriginalMessage(reportAction as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MANUAL_APPROVAL_THRESHOLD>) ?? {};

    if (typeof oldLimit !== 'number' || typeof oldLimit !== 'number') {
        return getReportActionText(reportAction);
    }
    return translate('workspaceActions.updatedManualApprovalThreshold', {oldLimit: convertToDisplayString(oldLimit, currency), newLimit: convertToDisplayString(newLimit, currency)});
}

function getChangedApproverActionMessage<T extends typeof CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL | typeof CONST.REPORT.ACTIONS.TYPE.REROUTE>(
    translate: LocalizedTranslate,
    reportAction: OnyxEntry<ReportAction>,
) {
    const {mentionedAccountIDs} = getOriginalMessage(reportAction as ReportAction<T>) ?? {};

    // If mentionedAccountIDs exists and has values, use the first one
    if (mentionedAccountIDs?.length) {
        return translate('iou.changeApprover.changedApproverMessage', mentionedAccountIDs.at(0) ?? CONST.DEFAULT_NUMBER_ID);
    }

    // Fallback: If mentionedAccountIDs is missing (common with OldDot take control actions),
    // use the actorAccountID (who performed the take control action) as the new approver
    const actorAccountID = reportAction?.actorAccountID;
    if (!actorAccountID) {
        return '';
    }
    return translate('iou.changeApprover.changedApproverMessage', actorAccountID);
}

function getHarvestCreatedExpenseReportMessage(reportID: string | undefined, reportName: string, translate: LocalizedTranslate) {
    const reportUrl = getReportURLForCurrentContext(reportID);
    return translate('reportAction.harvestCreatedExpenseReport', reportUrl, reportName);
}

function getCreatedReportForUnapprovedTransactionsMessage(reportID: string | undefined, reportName: string, translate: LocalizedTranslate): string {
    const reportUrl = getReportURLForCurrentContext(reportID);
    return translate('reportAction.createdReportForUnapprovedTransactions', {reportUrl, reportName});
}

function getDynamicExternalWorkflowRoutedMessage(
    action: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED>>,
    translate: LocaleContextProps['translate'],
) {
    return translate('iou.routedDueToDEW', {to: getOriginalMessage(action)?.to ?? ''});
}

function isCardIssuedAction(
    reportAction: OnyxEntry<ReportAction>,
): reportAction is ReportAction<
    | typeof CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED
    | typeof CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED_VIRTUAL
    | typeof CONST.REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS
    | typeof CONST.REPORT.ACTIONS.TYPE.CARD_ASSIGNED
    | typeof CONST.REPORT.ACTIONS.TYPE.CARD_REPLACED_VIRTUAL
    | typeof CONST.REPORT.ACTIONS.TYPE.CARD_REPLACED
> {
    return (
        isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED) ||
        isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED_VIRTUAL) ||
        isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS) ||
        isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.CARD_ASSIGNED) ||
        isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.CARD_REPLACED_VIRTUAL) ||
        isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.CARD_REPLACED)
    );
}

function shouldShowAddMissingDetails(actionName?: ReportActionName, privatePersonalDetail?: PrivatePersonalDetails) {
    const missingDetails = arePersonalDetailsMissing(privatePersonalDetail);
    return actionName === CONST.REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS && missingDetails;
}

function shouldShowActivateCard(actionName?: ReportActionName, card?: Card, privatePersonalDetail?: PrivatePersonalDetails) {
    const missingDetails = arePersonalDetailsMissing(privatePersonalDetail);
    return (actionName === CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED || actionName === CONST.REPORT.ACTIONS.TYPE.CARD_REPLACED) && isCardPendingActivate(card) && !missingDetails;
}

function getJoinRequestMessage(translate: LocalizedTranslate, reportAction: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_JOIN_REQUEST>) {
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const policy = getPolicy(getOriginalMessage(reportAction)?.policyID);
    const userDetail = getPersonalDetailByEmail(getOriginalMessage(reportAction)?.email ?? '');
    const userName = userDetail?.firstName ? `${userDetail.displayName} (${userDetail.login})` : (userDetail?.login ?? getOriginalMessage(reportAction)?.email);
    return translate('workspace.inviteMessage.joinRequest', {user: userName ?? '', workspaceName: policy?.name ?? ''});
}
function isCardActive(card?: Card): boolean {
    if (!card) {
        return false;
    }
    const closedStates = new Set<number>([CONST.EXPENSIFY_CARD.STATE.CLOSED, CONST.EXPENSIFY_CARD.STATE.STATE_DEACTIVATED, CONST.EXPENSIFY_CARD.STATE.STATE_SUSPENDED]);
    return !closedStates.has(card.state);
}

function getCardIssuedMessage({
    reportAction,
    shouldRenderHTML = false,
    policyID = '-1',
    expensifyCard,
    companyCard,
    translate,
}: {
    reportAction: OnyxEntry<ReportAction>;
    shouldRenderHTML?: boolean;
    policyID?: string;
    expensifyCard?: Card;
    companyCard?: Card;
    translate: LocaleContextProps['translate'];
}) {
    const cardIssuedActionOriginalMessage = isCardIssuedAction(reportAction) ? getOriginalMessage(reportAction) : undefined;

    const assigneeAccountID = cardIssuedActionOriginalMessage?.assigneeAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const cardID = cardIssuedActionOriginalMessage?.cardID ?? CONST.DEFAULT_NUMBER_ID;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const isPolicyAdmin = isPolicyAdminPolicyUtils(getPolicy(policyID));
    const assignee = shouldRenderHTML ? `<mention-user accountID="${assigneeAccountID}"/>` : Parser.htmlToText(`<mention-user accountID="${assigneeAccountID}"/>`);
    const navigateRoute = isPolicyAdmin ? ROUTES.EXPENSIFY_CARD_DETAILS.getRoute(policyID, String(cardID)) : ROUTES.SETTINGS_DOMAIN_CARD_DETAIL.getRoute(String(cardID));
    const isExpensifyCardActive = isCardActive(expensifyCard);
    const expensifyCardLink = (expensifyCardLinkText: string) =>
        shouldRenderHTML && isExpensifyCardActive ? `<a href='${environmentURL}/${navigateRoute}'>${expensifyCardLinkText}</a>` : expensifyCardLinkText;
    const isAssigneeCurrentUser = deprecatedCurrentUserAccountID === assigneeAccountID;
    const companyCardLink =
        shouldRenderHTML && isAssigneeCurrentUser && companyCard
            ? `<a href='${environmentURL}/${ROUTES.SETTINGS_WALLET}'>${translate('workspace.companyCards.companyCard')}</a>`
            : translate('workspace.companyCards.companyCard');
    switch (reportAction?.actionName) {
        case CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED: {
            if (cardIssuedActionOriginalMessage?.hadMissingAddress) {
                return translate('workspace.expensifyCard.addedShippingDetails', assignee);
            }
            return translate('workspace.expensifyCard.issuedCard', assignee);
        }
        case CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED_VIRTUAL:
            return translate('workspace.expensifyCard.issuedCardVirtual', {assignee, link: expensifyCardLink(translate('workspace.expensifyCard.card'))});
        case CONST.REPORT.ACTIONS.TYPE.CARD_ASSIGNED:
            return translate('workspace.companyCards.assignedCard', assignee, companyCardLink);
        case CONST.REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS:
            return translate('workspace.expensifyCard.issuedCardNoShippingDetails', assignee);
        case CONST.REPORT.ACTIONS.TYPE.CARD_REPLACED_VIRTUAL:
            return translate('workspace.expensifyCard.replacedVirtualCard', {assignee, link: expensifyCardLink(translate('workspace.expensifyCard.replacementCard'))});
        case CONST.REPORT.ACTIONS.TYPE.CARD_REPLACED:
            return translate('workspace.expensifyCard.replacedCard', assignee);
        default:
            return '';
    }
}

function getRoomChangeLogMessage(translate: LocalizedTranslate, reportAction: ReportAction) {
    if (!isInviteOrRemovedAction(reportAction)) {
        return '';
    }
    const originalMessage = getOriginalMessage(reportAction);
    const targetAccountIDs: number[] = originalMessage?.targetAccountIDs ?? [];
    const actionText =
        isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM) || isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.INVITE_TO_ROOM)
            ? translate('workspace.invite.invited')
            : translate('workspace.invite.removed');
    const userText = (targetAccountIDs.length === 1 ? translate('common.member') : translate('common.members')).toLowerCase();
    return `${actionText} ${targetAccountIDs.length} ${userText}`;
}

/**
 * @private
 */
function wasActionCreatedWhileOffline(
    action: ReportAction,
    isOffline: boolean,
    lastOfflineAt: Date | undefined,
    lastOnlineAt: Date | undefined,
    getLocalDateFromDatetime: LocaleContextProps['getLocalDateFromDatetime'],
): boolean {
    // The user has never gone offline or never come back online
    if (!lastOfflineAt || !lastOnlineAt) {
        return false;
    }

    const actionCreatedAt = getLocalDateFromDatetime(action.created);

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
function wasMessageReceivedWhileOffline(
    action: ReportAction,
    isOffline: boolean,
    lastOfflineAt: Date | undefined,
    lastOnlineAt: Date | undefined,
    getLocalDateFromDatetime: LocaleContextProps['getLocalDateFromDatetime'],
) {
    const wasByCurrentUser = wasActionTakenByCurrentUser(action);
    const wasCreatedOffline = wasActionCreatedWhileOffline(action, isOffline, lastOfflineAt, lastOnlineAt, getLocalDateFromDatetime);

    return !wasByCurrentUser && wasCreatedOffline && !(action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD || action.isOptimisticAction);
}

function getIntegrationSyncFailedMessage(translate: LocalizedTranslate, action: OnyxEntry<ReportAction>, policyID?: string, shouldShowOldDotLink = false): string {
    const {label, errorMessage} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.INTEGRATION_SYNC_FAILED>) ?? {label: '', errorMessage: ''};

    const param = encodeURIComponent(`{"policyID": "${policyID}"}`);
    const workspaceAccountingLink = shouldShowOldDotLink ? `${oldDotEnvironmentURL}/policy?param=${param}#connections` : `${environmentURL}/${ROUTES.POLICY_ACCOUNTING.getRoute(policyID)}`;
    return translate('report.actions.type.integrationSyncFailed', {
        label,
        errorMessage,
        workspaceAccountingLink,
    });
}

function getCompanyCardConnectionBrokenMessage(translate: LocalizedTranslate, action: OnyxEntry<ReportAction>): string {
    const {feedName, policyID} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.COMPANY_CARD_CONNECTION_BROKEN>) ?? {feedName: '', policyID: ''};
    const workspaceCompanyCardRoute = `${environmentURL}/${ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID)}`;
    return translate('report.actions.type.companyCardConnectionBroken', {
        feedName,
        workspaceCompanyCardRoute,
    });
}

function getManagerOnVacation(action: OnyxEntry<ReportAction>): string | undefined {
    if (!isApprovedAction(action)) {
        return;
    }

    return getOriginalMessage(action)?.managerOnVacation;
}

function getVacationer(action: OnyxEntry<ReportAction>): string | undefined {
    if (!isSubmittedAction(action) && !isSubmittedAndClosedAction(action)) {
        return;
    }

    return getOriginalMessage(action)?.vacationer;
}

function getSubmittedTo(action: OnyxEntry<ReportAction>): string | undefined {
    if (!isSubmittedAction(action) && !isSubmittedAndClosedAction(action)) {
        return;
    }

    return getOriginalMessage(action)?.to;
}

function isSystemUserMentioned(action: OnyxInputOrEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_MENTION_WHISPER>>): boolean {
    const mentionedUsers = getOriginalMessage(action)?.inviteeAccountIDs;
    const systemAccountIDs = new Set(Object.values(CONST.ACCOUNT_ID));
    return mentionedUsers?.some((accountID) => systemAccountIDs.has(accountID)) ?? false;
}

export {
    doesReportHaveVisibleActions,
    extractLinksFromMessageHtml,
    formatLastMessageText,
    isReportActionUnread,
    getHtmlWithAttachmentID,
    getActionableMentionWhisperMessage,
    getAllReportActions,
    getCombinedReportActions,
    getDismissedViolationMessageText,
    getFirstVisibleReportActionID,
    getIOUActionForReportID,
    getIOUActionForTransactionID,
    getIOUReportIDFromReportActionPreview,
    getLastVisibleAction,
    getLastVisibleMessage,
    getLatestReportActionFromOnyxData,
    getLinkedTransactionID,
    getMarkedReimbursedMessage,
    getMemberChangeMessageFragment,
    getUpdateRoomDescriptionFragment,
    getReportActionMessageFragments,
    getMessageOfOldDotReportAction,
    getMostRecentIOURequestActionID,
    getNumberOfMoneyRequests,
    getOneTransactionThreadReportAction,
    getOneTransactionThreadReportID,
    getOriginalMessage,
    getAddedApprovalRuleMessage,
    getDeletedApprovalRuleMessage,
    getUpdatedApprovalRuleMessage,
    getRemovedFromApprovalChainMessage,
    getDemotedFromWorkspaceMessage,
    getDynamicExternalWorkflowRoutedMessage,
    getReportAction,
    getReportActionHtml,
    getReportActionMessage,
    getReportActionMessageText,
    getReportActionText,
    getSortedReportActions,
    getSortedReportActionsForDisplay,
    getTextFromHtml,
    getTrackExpenseActionableWhisper,
    getWhisperedTo,
    hasRequestFromCurrentAccount,
    isActionOfType,
    isActionableWhisper,
    isActionableJoinRequest,
    isActionableJoinRequestPending,
    isActionableMentionWhisper,
    isActionableMentionInviteToSubmitExpenseConfirmWhisper,
    isActionableReportMentionWhisper,
    isActionableTrackExpense,
    isExpenseChatWelcomeWhisper,
    isConciergeCategoryOptions,
    isConciergeDescriptionOptions,
    isResolvedConciergeCategoryOptions,
    isResolvedConciergeDescriptionOptions,
    isAddCommentAction,
    isApprovedOrSubmittedReportAction,
    isIOURequestReportAction,
    isChronosOOOListAction,
    isClosedAction,
    isConsecutiveActionMadeByPreviousActor,
    isConsecutiveChronosAutomaticTimerAction,
    isExportedToIntegrationAction,
    hasNextActionMadeBySameActor,
    isCreatedAction,
    isCreatedTaskReportAction,
    isCurrentActionUnread,
    isDeletedAction,
    isDeletedParentAction,
    isMemberChangeAction,
    isExportIntegrationAction,
    isIntegrationMessageAction,
    isMessageDeleted,
    useTableReportViewActionRenderConditionals,
    isModifiedExpenseAction,
    isMovedTransactionAction,
    isMoneyRequestAction,
    isOldDotReportAction,
    isPayAction,
    isPendingRemove,
    isPolicyChangeLogAction,
    isReimbursementCanceledAction,
    isReimbursementDeQueuedAction,
    isReimbursementDeQueuedOrCanceledAction,
    isReimbursementQueuedAction,
    isRenamedAction,
    isReportActionAttachment,
    isReportActionDeprecated,
    isReportPreviewAction,
    isReversedTransaction,
    getMentionedAccountIDsFromAction,
    isRoomChangeLogAction,
    isSentMoneyReportAction,
    isSplitBillAction,
    isTaskAction,
    isMovedAction,
    isThreadParentMessage,
    isTrackExpenseAction,
    isTransactionThread,
    isTripPreview,
    isHoldAction,
    isWhisperAction,
    isSubmittedAction,
    isSubmittedAndClosedAction,
    isDynamicExternalWorkflowSubmitAction,
    isMarkAsClosedAction,
    isApprovedAction,
    isDynamicExternalWorkflowForwardedAction,
    isUnapprovedAction,
    isForwardedAction,
    isDynamicExternalWorkflowSubmitFailedAction,
    getMostRecentActiveDEWSubmitFailedAction,
    hasPendingDEWSubmit,
    isDynamicExternalWorkflowApproveFailedAction,
    getMostRecentActiveDEWApproveFailedAction,
    hasPendingDEWApprove,
    isWhisperActionTargetedToOthers,
    isTagModificationAction,
    isIOUActionMatchingTransactionList,
    isResolvedActionableWhisper,
    isReimbursementDirectionInformationRequiredAction,
    shouldHideNewMarker,
    shouldReportActionBeVisible,
    shouldReportActionBeVisibleAsLastAction,
    wasActionTakenByCurrentUser,
    isInviteOrRemovedAction,
    isActionableAddPaymentCard,
    isActionableCardFraudAlert,
    getExportIntegrationActionFragments,
    getExportIntegrationLastMessageText,
    getExportIntegrationMessageHTML,
    getUpdateRoomDescriptionMessage,
    getRoomAvatarUpdatedMessage,
    didMessageMentionCurrentUser,
    getPolicyChangeLogAddEmployeeMessage,
    getPolicyChangeLogUpdateEmployee,
    getPolicyChangeLogDeleteMemberMessage,
    getPolicyChangeLogEmployeeLeftMessage,
    getRenamedAction,
    isCardIssuedAction,
    getCardIssuedMessage,
    getRemovedConnectionMessage,
    getActionableJoinRequestPendingReportAction,
    getFilteredReportActionsForReportView,
    wasMessageReceivedWhileOffline,
    shouldShowAddMissingDetails,
    getActionableCardFraudAlertResolutionMessage,
    getJoinRequestMessage,
    getTravelUpdateMessage,
    getWorkspaceCategoryUpdateMessage,
    getWorkspaceUpdateFieldMessage,
    getWorkspaceFeatureEnabledMessage,
    getWorkspaceAttendeeTrackingUpdateMessage,
    getCompanyAddressUpdateMessage,
    getDefaultApproverUpdateMessage,
    getSubmitsToUpdateMessage,
    getForwardsToUpdateMessage,
    getInvoiceCompanyNameUpdateMessage,
    getInvoiceCompanyWebsiteUpdateMessage,
    getReimburserUpdateMessage,
    getWorkspaceReimbursementUpdateMessage,
    getUpdateACHAccountMessage,
    getWorkspaceCurrencyUpdateMessage,
    getWorkspaceTaxUpdateMessage,
    getWorkspaceFrequencyUpdateMessage,
    getPolicyChangeLogMaxExpenseAmountNoReceiptMessage,
    getPolicyChangeLogMaxExpenseAmountMessage,
    getPolicyChangeLogMaxExpenseAgeMessage,
    getPolicyChangeLogDefaultBillableMessage,
    getPolicyChangeLogDefaultTitleMessage,
    getPolicyChangeLogDefaultTitleEnforcedMessage,
    getWorkspaceDescriptionUpdatedMessage,
    getWorkspaceReportFieldAddMessage,
    getWorkspaceCustomUnitRateAddedMessage,
    getSendMoneyFlowAction,
    getWorkspaceTagUpdateMessage,
    getWorkspaceReportFieldUpdateMessage,
    getWorkspaceReportFieldDeleteMessage,
    getUpdatedAuditRateMessage,
    getUpdatedManualApprovalThresholdMessage,
    getWorkspaceCustomUnitRateDeletedMessage,
    getAddedConnectionMessage,
    getWorkspaceCustomUnitRateUpdatedMessage,
    getTagListNameUpdatedMessage,
    getWorkspaceCustomUnitUpdatedMessage,
    getRoomChangeLogMessage,
    shouldShowActivateCard,
    isReopenedAction,
    isRetractedAction,
    getIntegrationSyncFailedMessage,
    getCompanyCardConnectionBrokenMessage,
    getPolicyChangeLogDefaultReimbursableMessage,
    getManagerOnVacation,
    getVacationer,
    getSubmittedTo,
    getChangedApproverActionMessage,
    getDelegateAccountIDFromReportAction,
    isPendingHide,
    filterOutDeprecatedReportActions,
    getActionableCardFraudAlertMessage,
    getHarvestCreatedExpenseReportMessage,
    getCreatedReportForUnapprovedTransactionsMessage,
    isSystemUserMentioned,
    withDEWRoutedActionsArray,
    withDEWRoutedActionsObject,
    getReportActionActorAccountID,
};

export type {LastVisibleMessage};
