import {format} from 'date-fns';
import {fastMerge, Str} from 'expensify-common';
import clone from 'lodash/clone';
import isEmpty from 'lodash/isEmpty';
import type {NullishDeep, OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import usePrevious from '@hooks/usePrevious';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Card, OnyxInputOrEntry, OriginalMessageIOU, Policy, PrivatePersonalDetails} from '@src/types/onyx';
import type {JoinWorkspaceResolution, OriginalMessageChangeLog, OriginalMessageExportIntegration} from '@src/types/onyx/OriginalMessage';
import type {PolicyReportFieldType} from '@src/types/onyx/Policy';
import type Report from '@src/types/onyx/Report';
import type ReportAction from '@src/types/onyx/ReportAction';
import type {Message, OldDotReportAction, OriginalMessage, ReportActions} from '@src/types/onyx/ReportAction';
import type ReportActionName from '@src/types/onyx/ReportActionName';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {getDecodedCategoryName} from './CategoryUtils';
import {convertAmountToDisplayString, convertToDisplayString, convertToShortDisplayString} from './CurrencyUtils';
import {getEnvironmentURL, getOldDotEnvironmentURL} from './Environment/Environment';
import getBase62ReportID from './getBase62ReportID';
import {isReportMessageAttachment} from './isReportMessageAttachment';
import {toLocaleOrdinal} from './LocaleDigitUtils';
import {formatPhoneNumber} from './LocalePhoneNumber';
// eslint-disable-next-line @typescript-eslint/no-deprecated
import {formatMessageElementList, translateLocal} from './Localize';
import Log from './Log';
import type {MessageElementBase, MessageTextElement} from './MessageElement';
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

let currentUserAccountID: number | undefined;
let currentEmail = '';
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        // When signed out, value is undefined
        if (!value) {
            return;
        }

        currentUserAccountID = value.accountID;
        currentEmail = value?.email ?? '';
    },
});

let privatePersonalDetails: PrivatePersonalDetails | undefined;
Onyx.connect({
    key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
    callback: (personalDetails) => {
        privatePersonalDetails = personalDetails;
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
    if (reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DIRECTOR_INFORMATION_REQUIRED) {
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

function isReportPreviewAction(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW);
}

function isSubmittedAction(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.SUBMITTED> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.SUBMITTED);
}

function isSubmittedAndClosedAction(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED);
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
    return !getWhisperedTo(reportAction).includes(currentUserAccountID ?? CONST.DEFAULT_NUMBER_ID);
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
    if (isEmpty(transactionThreadReportID) || isSentMoneyReport) {
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

    if (isSubmittedAction(currentAction) || isSubmittedAndClosedAction(currentAction)) {
        const currentActionAdminAccountID = currentAction.adminAccountID;
        return typeof currentActionAdminAccountID === 'number'
            ? currentActionAdminAccountID === adjacentAction.actorAccountID
            : currentAction.actorAccountID === adjacentAction.actorAccountID;
    }

    if (isSubmittedAction(adjacentAction) || isSubmittedAndClosedAction(adjacentAction)) {
        return typeof adjacentAction.adminAccountID === 'number'
            ? currentAction.actorAccountID === adjacentAction.adminAccountID
            : currentAction.actorAccountID === adjacentAction.actorAccountID;
    }

    return currentAction.actorAccountID === adjacentAction.actorAccountID;
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

    const deprecatedOldDotReportActions: ReportActionName[] = [
        CONST.REPORT.ACTIONS.TYPE.DELETED_ACCOUNT,
        CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_REQUESTED,
        CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_SETUP_REQUESTED,
        CONST.REPORT.ACTIONS.TYPE.DONATION,
        CONST.REPORT.ACTIONS.TYPE.REIMBURSED,
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

    if (isReportActionDeprecated(reportAction, key)) {
        return false;
    }

    // Filter out any unsupported reportAction types
    if (!supportedActionTypes.has(reportAction.actionName)) {
        return false;
    }

    if (isMovedTransactionAction(reportAction)) {
        const movedTransactionOriginalMessage = getOriginalMessage(reportAction);
        const toReportID = movedTransactionOriginalMessage?.toReportID;
        const toReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${toReportID}`];
        return !!toReport;
    }

    // Ignore closed action here since we're already displaying a footer that explains why the report was closed
    if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CLOSED && !isMarkAsClosedAction(reportAction)) {
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
    const isDeleted = isDeletedAction(reportAction);
    const isPending = !!reportAction.pendingAction;

    return !isDeleted || isPending || isDeletedParentAction(reportAction) || isReversedTransaction(reportAction);
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
    const isHiddenReportPreviewWithoutPendingAction = isReportPreviewAction(action) && action.pendingAction === undefined && !action.shouldShow;

    return !isDeletedMoneyRequest && !isHiddenReportPreviewWithoutPendingAction;
}

/**
 * Helper for filtering out report actions that should not be displayed in the report view.
 * Delegates visibility logic to isVisiblePreviewOrMoneyRequest.
 */
function getFilteredReportActionsForReportView(actions: ReportAction[]) {
    return actions.filter(isVisiblePreviewOrMoneyRequest);
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
    return getSortedReportActions(baseURLAdjustedReportActions, true);
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
            // Include deleted IOU reportActions if:
            // - they have an associated IOU transaction ID or
            // - the action is pending deletion and the user is offline
            (!!originalMessage?.IOUTransactionID || (action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && (isOffline ?? isNetworkOffline)))
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
function getMemberChangeMessageElements(reportAction: OnyxEntry<ReportAction>, getReportNameCallback: typeof getReportName): readonly MemberChangeMessageElement[] {
    const isInviteAction = isInviteMemberAction(reportAction);
    const isLeaveAction = isLeavePolicyAction(reportAction);

    if (!isMemberChangeAction(reportAction)) {
        return [];
    }

    // Currently, we only render messages when members are invited
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    let verb = translateLocal('workspace.invite.removed');
    if (isInviteAction) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        verb = translateLocal('workspace.invite.invited');
    }

    if (isLeaveAction) {
        verb = getPolicyChangeLogEmployeeLeftMessage(reportAction);
    }

    const originalMessage = getOriginalMessage(reportAction);
    const targetAccountIDs: number[] = originalMessage?.targetAccountIDs ?? [];
    const personalDetails = getPersonalDetailsByIDs({accountIDs: targetAccountIDs, currentUserAccountID: 0});

    const mentionElements = targetAccountIDs.map((accountID): MemberChangeMessageUserMentionElement => {
        const personalDetail = personalDetails.find((personal) => personal.accountID === accountID);
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const handleText = getEffectiveDisplayName(formatPhoneNumber, personalDetail) ?? translateLocal('common.hidden');

        return {
            kind: 'userMention',
            content: `@${handleText}`,
            accountID,
        };
    });

    const buildRoomElements = (): readonly MemberChangeMessageElement[] => {
        const roomName = getReportNameCallback(allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${originalMessage?.reportID}`]) || originalMessage?.roomName;
        if (roomName && originalMessage) {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            const preposition = isInviteAction ? ` ${translateLocal('workspace.invite.to')} ` : ` ${translateLocal('workspace.invite.from')} `;

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
function getMessageOfOldDotReportAction(oldDotAction: PartialReportAction | OldDotReportAction, withMarkdown = true): string {
    if (isOldDotLegacyAction(oldDotAction)) {
        return getMessageOfOldDotLegacyAction(oldDotAction);
    }

    const {originalMessage, actionName} = oldDotAction;
    switch (actionName) {
        case CONST.REPORT.ACTIONS.TYPE.CHANGE_FIELD: {
            const {oldValue, newValue, fieldName} = originalMessage;
            if (!oldValue) {
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                return translateLocal('report.actions.type.changeFieldEmpty', {newValue, fieldName});
            }
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('report.actions.type.changeField', {oldValue, newValue, fieldName});
        }
        case CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_CSV:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('report.actions.type.exportedToCSV');
        case CONST.REPORT.ACTIONS.TYPE.INTEGRATIONS_MESSAGE: {
            const {result, label} = originalMessage;
            const errorMessage = result?.messages?.join(', ') ?? '';
            const linkText = result?.link?.text ?? '';
            const linkURL = result?.link?.url ?? '';
            if (errorMessage.includes(CONST.ERROR.INTEGRATION_MESSAGE_INVALID_CREDENTIALS)) {
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                const translateErrorMessage = translateLocal('report.actions.error.invalidCredentials');
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                const translateLinkText = translateLocal('report.connectionSettings');
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                return translateLocal('report.actions.type.integrationsMessage', {errorMessage: translateErrorMessage, label, linkText: translateLinkText, linkURL});
            }
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('report.actions.type.integrationsMessage', {errorMessage, label, linkText, linkURL});
        }
        case CONST.REPORT.ACTIONS.TYPE.MANAGER_ATTACH_RECEIPT:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('report.actions.type.managerAttachReceipt');
        case CONST.REPORT.ACTIONS.TYPE.MANAGER_DETACH_RECEIPT:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('report.actions.type.managerDetachReceipt');
        case CONST.REPORT.ACTIONS.TYPE.MARK_REIMBURSED_FROM_INTEGRATION: {
            const {amount, currency} = originalMessage;
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('report.actions.type.markedReimbursedFromIntegration', {amount, currency});
        }
        case CONST.REPORT.ACTIONS.TYPE.OUTDATED_BANK_ACCOUNT:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('report.actions.type.outdatedBankAccount');
        case CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_BOUNCE:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('report.actions.type.reimbursementACHBounce');
        case CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_CANCELED:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('report.actions.type.reimbursementACHCancelled');
        case CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACCOUNT_CHANGED:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('report.actions.type.reimbursementAccountChanged');
        case CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DELAYED:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('report.actions.type.reimbursementDelayed');
        case CONST.REPORT.ACTIONS.TYPE.SELECTED_FOR_RANDOM_AUDIT:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal(`report.actions.type.selectedForRandomAudit${withMarkdown ? 'Markdown' : ''}`);
        case CONST.REPORT.ACTIONS.TYPE.SHARE:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('report.actions.type.share', {to: originalMessage.to});
        case CONST.REPORT.ACTIONS.TYPE.UNSHARE:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('report.actions.type.unshare', {to: originalMessage.to});
        case CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('report.actions.type.takeControl');
        default:
            return '';
    }
}

function getTravelUpdateMessage(action: ReportAction<'TRAVEL_TRIP_ROOM_UPDATE'>, formatDate?: (datetime: string, includeTimezone: boolean, isLowercase?: boolean | undefined) => string) {
    const details = getOriginalMessage(action);
    const formattedStartDate = formatDate?.(details?.start.date ?? '', false) ?? format(details?.start.date ?? '', CONST.DATE.FNS_DATE_TIME_FORMAT_STRING);

    switch (details?.operation) {
        case CONST.TRAVEL.UPDATE_OPERATION_TYPE.BOOKING_TICKETED:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('travel.updates.bookingTicketed', {
                airlineCode: details.route?.airlineCode ?? '',
                origin: details.start.shortName ?? '',
                destination: details.end?.shortName ?? '',
                startDate: formattedStartDate,
                confirmationID: details.confirmations?.at(0)?.value,
            });

        case CONST.TRAVEL.UPDATE_OPERATION_TYPE.TICKET_VOIDED:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('travel.updates.ticketVoided', {
                airlineCode: details.route?.airlineCode ?? '',
                origin: details.start.shortName ?? '',
                destination: details.end?.shortName ?? '',
                startDate: formattedStartDate,
            });

        case CONST.TRAVEL.UPDATE_OPERATION_TYPE.TICKET_REFUNDED:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('travel.updates.ticketRefunded', {
                airlineCode: details.route?.airlineCode ?? '',
                origin: details.start.shortName ?? '',
                destination: details.end?.shortName ?? '',
                startDate: formattedStartDate,
            });

        case CONST.TRAVEL.UPDATE_OPERATION_TYPE.FLIGHT_CANCELLED:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('travel.updates.flightCancelled', {
                airlineCode: details.route?.airlineCode ?? '',
                origin: details.start.shortName ?? '',
                destination: details.end?.shortName ?? '',
                startDate: formattedStartDate,
            });

        case CONST.TRAVEL.UPDATE_OPERATION_TYPE.FLIGHT_SCHEDULE_CHANGE_PENDING:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('travel.updates.flightScheduleChangePending', {
                airlineCode: details.route?.airlineCode ?? '',
            });

        case CONST.TRAVEL.UPDATE_OPERATION_TYPE.FLIGHT_SCHEDULE_CHANGE_CLOSED:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('travel.updates.flightScheduleChangeClosed', {
                airlineCode: details.route?.airlineCode ?? '',
                startDate: formattedStartDate,
            });

        case CONST.TRAVEL.UPDATE_OPERATION_TYPE.FLIGHT_CHANGED:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('travel.updates.flightUpdated', {
                airlineCode: details.route?.airlineCode ?? '',
                origin: details.start.shortName ?? '',
                destination: details.end?.shortName ?? '',
                startDate: formattedStartDate,
            });

        case CONST.TRAVEL.UPDATE_OPERATION_TYPE.FLIGHT_CABIN_CHANGED:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('travel.updates.flightCabinChanged', {
                airlineCode: details.route?.airlineCode ?? '',
                cabinClass: details.route?.class ?? '',
            });

        case CONST.TRAVEL.UPDATE_OPERATION_TYPE.FLIGHT_SEAT_CONFIRMED:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('travel.updates.flightSeatConfirmed', {
                airlineCode: details.route?.airlineCode ?? '',
            });

        case CONST.TRAVEL.UPDATE_OPERATION_TYPE.FLIGHT_SEAT_CHANGED:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('travel.updates.flightSeatChanged', {
                airlineCode: details.route?.airlineCode ?? '',
            });

        case CONST.TRAVEL.UPDATE_OPERATION_TYPE.FLIGHT_SEAT_CANCELLED:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('travel.updates.flightSeatCancelled', {
                airlineCode: details.route?.airlineCode ?? '',
            });

        case CONST.TRAVEL.UPDATE_OPERATION_TYPE.PAYMENT_DECLINED:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('travel.updates.paymentDeclined');

        case CONST.TRAVEL.UPDATE_OPERATION_TYPE.BOOKING_CANCELED_BY_TRAVELER:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('travel.updates.bookingCancelledByTraveler', {
                type: details.type,
                id: details.reservationID,
            });

        case CONST.TRAVEL.UPDATE_OPERATION_TYPE.BOOKING_CANCELED_BY_VENDOR:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('travel.updates.bookingCancelledByVendor', {
                type: details.type,
                id: details.reservationID,
            });

        case CONST.TRAVEL.UPDATE_OPERATION_TYPE.BOOKING_REBOOKED:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('travel.updates.bookingRebooked', {
                type: details.type,
                id: details.confirmations?.at(0)?.value,
            });

        case CONST.TRAVEL.UPDATE_OPERATION_TYPE.BOOKING_UPDATED:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('travel.updates.bookingUpdated', {
                type: details.type,
            });

        case CONST.TRAVEL.UPDATE_OPERATION_TYPE.TRIP_UPDATED:
            if (details.type === CONST.RESERVATION_TYPE.CAR || details.type === CONST.RESERVATION_TYPE.HOTEL) {
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                return translateLocal('travel.updates.defaultUpdate', {
                    type: details.type,
                });
            }
            if (details.type === CONST.RESERVATION_TYPE.TRAIN) {
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                return translateLocal('travel.updates.railTicketUpdate', {
                    origin: details.start.cityName ?? details.start.shortName ?? '',
                    destination: details.end.cityName ?? details.end.shortName ?? '',
                    startDate: formattedStartDate,
                });
            }
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('travel.updates.flightUpdated', {
                airlineCode: details.route?.airlineCode ?? '',
                origin: details.start.shortName ?? '',
                destination: details.end?.shortName ?? '',
                startDate: formattedStartDate,
            });
        case CONST.TRAVEL.UPDATE_OPERATION_TYPE.BOOKING_OTHER_UPDATE:
            if (details.type === CONST.RESERVATION_TYPE.CAR || details.type === CONST.RESERVATION_TYPE.HOTEL) {
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                return translateLocal('travel.updates.defaultUpdate', {
                    type: details.type,
                });
            }
            if (details.type === CONST.RESERVATION_TYPE.TRAIN) {
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                return translateLocal('travel.updates.railTicketUpdate', {
                    origin: details.start.cityName ?? details.start.shortName ?? '',
                    destination: details.end.cityName ?? details.end.shortName ?? '',
                    startDate: formattedStartDate,
                });
            }
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('travel.updates.flightUpdated', {
                airlineCode: details.route?.airlineCode ?? '',
                origin: details.start.shortName ?? '',
                destination: details.end?.shortName ?? '',
                startDate: formattedStartDate,
            });

        case CONST.TRAVEL.UPDATE_OPERATION_TYPE.REFUND:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('travel.updates.railTicketRefund', {
                origin: details.start.cityName ?? details.start.shortName ?? '',
                destination: details.end.cityName ?? details.end.shortName ?? '',
                startDate: formattedStartDate,
            });

        case CONST.TRAVEL.UPDATE_OPERATION_TYPE.EXCHANGE:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('travel.updates.railTicketExchange', {
                origin: details.start.cityName ?? details.start.shortName ?? '',
                destination: details.end.cityName ?? details.end.shortName ?? '',
                startDate: formattedStartDate,
            });

        default:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('travel.updates.defaultUpdate', {
                type: details?.type ?? '',
            });
    }
}

function getMemberChangeMessageFragment(reportAction: OnyxEntry<ReportAction>, getReportNameCallback: typeof getReportName): Message {
    const messageElements: readonly MemberChangeMessageElement[] = getMemberChangeMessageElements(reportAction, getReportNameCallback);
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

function getLeaveRoomMessage() {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return translateLocal('report.actions.type.leftTheChat');
}

function getReopenedMessage(): string {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return translateLocal('iou.reopened');
}

function getReceiptScanFailedMessage() {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return translateLocal('iou.receiptScanningFailed');
}

function getUpdateRoomDescriptionFragment(reportAction: ReportAction): Message {
    const html = getUpdateRoomDescriptionMessage(reportAction);
    return {
        html: `<muted-text>${html}</muted-text>`,
        text: getReportActionMessage(reportAction) ? getReportActionText(reportAction) : '',
        type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
    };
}

function getReportActionMessageFragments(action: ReportAction): Message[] {
    if (isOldDotReportAction(action)) {
        const oldDotMessage = getMessageOfOldDotReportAction(action);
        const html = isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.SELECTED_FOR_RANDOM_AUDIT) ? Parser.replace(oldDotMessage) : oldDotMessage;
        return [{text: oldDotMessage, html: `<muted-text>${html}</muted-text>`, type: 'COMMENT'}];
    }

    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.UPDATE_ROOM_DESCRIPTION)) {
        const message = getUpdateRoomDescriptionMessage(action);
        return [{text: message, html: `<muted-text>${message}</muted-text>`, type: 'COMMENT'}];
    }

    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.UPDATE_ROOM_AVATAR)) {
        const message = getRoomAvatarUpdatedMessage(action);
        return [{text: message, html: `<muted-text>${message}</muted-text>`, type: 'COMMENT'}];
    }

    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DESCRIPTION)) {
        const message = getWorkspaceDescriptionUpdatedMessage(action);
        return [{text: message, html: `<muted-text>${message}</muted-text>`, type: 'COMMENT'}];
    }

    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.REIMBURSED)) {
        const message = getReportActionMessageText(action);
        return [{text: message, html: `<muted-text>${message}</muted-text>`, type: 'COMMENT'}];
    }

    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.RETRACTED)) {
        const message = getRetractedMessage();
        return [{text: message, html: `<muted-text>${message}</muted-text>`, type: 'COMMENT'}];
    }

    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.REOPENED)) {
        const message = getReopenedMessage();
        return [{text: message, html: `<muted-text>${message}</muted-text>`, type: 'COMMENT'}];
    }

    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.TRAVEL_UPDATE)) {
        const message = getTravelUpdateMessage(action);
        return [{text: message, html: `<muted-text>${message}</muted-text>`, type: 'COMMENT'}];
    }

    if (isConciergeCategoryOptions(action) || isConciergeDescriptionOptions(action)) {
        const message = getReportActionMessageText(action);
        return [{text: message, html: message, type: 'COMMENT'}];
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
function getActionableMentionWhisperMessage(reportAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_MENTION_WHISPER>>): string {
    if (!reportAction) {
        return '';
    }
    const originalMessage = getOriginalMessage(reportAction);
    const targetAccountIDs: number[] = originalMessage?.inviteeAccountIDs ?? [];
    const personalDetails = getPersonalDetailsByIDs({accountIDs: targetAccountIDs, currentUserAccountID: 0});
    const mentionElements = targetAccountIDs.map((accountID): string => {
        const personalDetail = personalDetails.find((personal) => personal.accountID === accountID);
        const displayName = getEffectiveDisplayName(formatPhoneNumber, personalDetail);
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const handleText = isEmpty(displayName) ? translateLocal('common.hidden') : displayName;
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

function getDismissedViolationMessageText(originalMessage: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.DISMISSED_VIOLATION>['originalMessage']): string {
    const reason = originalMessage?.reason;
    const violationName = originalMessage?.violationName;
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return translateLocal(`violationDismissal.${violationName}.${reason}` as TranslationPaths);
}

function getMentionedAccountIDsFromAction(reportAction: OnyxInputOrEntry<ReportAction>) {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT) ? (getOriginalMessage(reportAction)?.mentionedAccountIDs ?? []) : [];
}

function getMentionedEmailsFromMessage(message: string) {
    const mentionEmailRegex = /<mention-user>(.*?)<\/mention-user>/g;
    const matches = [...message.matchAll(mentionEmailRegex)];
    return matches.map((match) => Str.removeSMSDomain(match[1].substring(1)));
}

function didMessageMentionCurrentUser(reportAction: OnyxInputOrEntry<ReportAction>) {
    const accountIDsFromMessage = getMentionedAccountIDsFromAction(reportAction);
    const message = getReportActionMessage(reportAction)?.html ?? '';
    const emailsFromMessage = getMentionedEmailsFromMessage(message);
    return accountIDsFromMessage.includes(currentUserAccountID ?? CONST.DEFAULT_NUMBER_ID) || emailsFromMessage.includes(currentEmail) || message.includes('<mention-here>');
}

/**
 * Check if the current user is the requestor of the action
 */
function wasActionTakenByCurrentUser(reportAction: OnyxInputOrEntry<ReportAction>): boolean {
    return currentUserAccountID === reportAction?.actorAccountID;
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

function getExportIntegrationLastMessageText(reportAction: OnyxEntry<ReportAction>): string {
    const fragments = getExportIntegrationActionFragments(reportAction);
    return fragments.reduce((acc, fragment) => `${acc} ${fragment.text}`, '');
}

function getExportIntegrationMessageHTML(reportAction: OnyxEntry<ReportAction>): string {
    const fragments = getExportIntegrationActionFragments(reportAction);
    const htmlFragments = fragments.map((fragment) => (fragment.url ? `<a href="${fragment.url}">${fragment.text}</a>` : fragment.text));
    return htmlFragments.join(' ');
}

function getExportIntegrationActionFragments(reportAction: OnyxEntry<ReportAction>): Array<{text: string; url: string}> {
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
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            text: translateLocal('report.actions.type.exportedToIntegration.pending', {label}),
            url: '',
        });
    } else if (markedManually) {
        result.push({
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            text: translateLocal('report.actions.type.exportedToIntegration.manual', {label}),
            url: '',
        });
    } else if (automaticAction) {
        result.push({
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            text: translateLocal('report.actions.type.exportedToIntegration.automaticActionOne', {label}),
            url: '',
        });
        const url = CONST.HELP_DOC_LINKS[label as keyof typeof CONST.HELP_DOC_LINKS];
        result.push({
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            text: translateLocal('report.actions.type.exportedToIntegration.automaticActionTwo'),
            url: url || '',
        });
    } else {
        result.push({
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            text: translateLocal('report.actions.type.exportedToIntegration.automatic', {label}),
            url: '',
        });
    }
    if (reimbursableUrls.length || nonReimbursableUrls.length) {
        result.push({
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            text: translateLocal('report.actions.type.exportedToIntegration.automaticActionThree'),
            url: '',
        });
    }

    if (reimbursableUrls.length === 1) {
        const shouldAddPeriod = nonReimbursableUrls.length === 0;
        const reimbursableUrl = reimbursableUrls.at(0) ?? '';
        result.push({
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            text: translateLocal('report.actions.type.exportedToIntegration.reimburseableLink') + (shouldAddPeriod ? '.' : ''),
            url: reimbursableUrl.startsWith('https://') ? reimbursableUrl : '',
        });
    }
    if (reimbursableUrls.length === 1 && nonReimbursableUrls.length) {
        result.push({
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            text: translateLocal('common.and'),
            url: '',
        });
    }
    if (nonReimbursableUrls.length) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const text = translateLocal('report.actions.type.exportedToIntegration.nonReimbursableLink');
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

function getUpdateRoomDescriptionMessage(reportAction: ReportAction): string {
    const originalMessage = getOriginalMessage(reportAction) as OriginalMessageChangeLog;
    if (originalMessage?.description) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return `${translateLocal('roomChangeLog.updateRoomDescription')} ${originalMessage?.description}`;
    }
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return translateLocal('roomChangeLog.clearRoomDescription');
}

function getRoomAvatarUpdatedMessage(reportAction: ReportAction): string {
    const originalMessage = getOriginalMessage(reportAction) as OriginalMessageChangeLog;
    if (originalMessage?.avatarURL) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('roomChangeLog.changedRoomAvatar');
    }

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return translateLocal('roomChangeLog.removedRoomAvatar');
}

function getRetractedMessage(): string {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return translateLocal('iou.retracted');
}

function isPolicyChangeLogAddEmployeeMessage(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_EMPLOYEE> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_EMPLOYEE);
}

function getPolicyChangeLogAddEmployeeMessage(reportAction: OnyxInputOrEntry<ReportAction>): string {
    if (!isPolicyChangeLogAddEmployeeMessage(reportAction)) {
        return '';
    }

    const originalMessage = getOriginalMessage(reportAction);
    const email = originalMessage?.email ?? '';
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const role = translateLocal('workspace.common.roleName', {role: originalMessage?.role ?? ''}).toLowerCase();
    const formattedEmail = formatPhoneNumber(email);
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return translateLocal('report.actions.type.addEmployee', {email: formattedEmail, role});
}

function isPolicyChangeLogChangeRoleMessage(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EMPLOYEE> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EMPLOYEE);
}

function getPolicyChangeLogUpdateEmployee(reportAction: OnyxInputOrEntry<ReportAction>): string {
    if (!isPolicyChangeLogChangeRoleMessage(reportAction)) {
        return '';
    }

    const originalMessage = getOriginalMessage(reportAction);
    const email = formatPhoneNumber(originalMessage?.email ?? '');
    const field = originalMessage?.field;
    const customFieldType = Object.values(CONST.CUSTOM_FIELD_KEYS).find((value) => value === field);
    if (customFieldType) {
        const translationKey = field === CONST.CUSTOM_FIELD_KEYS.customField1 ? 'report.actions.type.updatedCustomField1' : 'report.actions.type.updatedCustomField2';
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal(translationKey, {
            email,
            newValue: typeof originalMessage?.newValue === 'string' ? originalMessage?.newValue : '',
            previousValue: typeof originalMessage?.oldValue === 'string' ? originalMessage?.oldValue : '',
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const newRole = translateLocal('workspace.common.roleName', {role: typeof originalMessage?.newValue === 'string' ? originalMessage?.newValue : ''}).toLowerCase();
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const oldRole = translateLocal('workspace.common.roleName', {role: typeof originalMessage?.oldValue === 'string' ? originalMessage?.oldValue : ''}).toLowerCase();
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return translateLocal('report.actions.type.updateRole', {email, newRole, currentRole: oldRole});
}

function getPolicyChangeLogEmployeeLeftMessage(reportAction: ReportAction, useName = false): string {
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
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return translateLocal('report.actions.type.leftWorkspace', {nameOrEmail: formattedNameOrEmail});
}

function isPolicyChangeLogDeleteMemberMessage(
    reportAction: OnyxInputOrEntry<ReportAction>,
): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_EMPLOYEE> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_EMPLOYEE);
}

function getWorkspaceDescriptionUpdatedMessage(action: ReportAction) {
    const {oldDescription, newDescription} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DESCRIPTION>) ?? {};
    const message =
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        typeof oldDescription === 'string' && newDescription ? translateLocal('workspaceActions.updateWorkspaceDescription', {newDescription, oldDescription}) : getReportActionText(action);
    return message;
}

function getWorkspaceCurrencyUpdateMessage(action: ReportAction) {
    const {oldCurrency, newCurrency} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CURRENCY>) ?? {};
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const message = oldCurrency && newCurrency ? translateLocal('workspaceActions.updatedWorkspaceCurrencyAction', {oldCurrency, newCurrency}) : getReportActionText(action);
    return message;
}

type AutoReportingFrequencyKey = ValueOf<typeof CONST.POLICY.AUTO_REPORTING_FREQUENCIES>;
type AutoReportingFrequencyDisplayNames = Record<AutoReportingFrequencyKey, string>;

const getAutoReportingFrequencyDisplayNames = (): AutoReportingFrequencyDisplayNames => ({
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY]: translateLocal('workflowsPage.frequencies.monthly'),
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE]: translateLocal('workflowsPage.frequencies.daily'),
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY]: translateLocal('workflowsPage.frequencies.weekly'),
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.SEMI_MONTHLY]: translateLocal('workflowsPage.frequencies.twiceAMonth'),
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.TRIP]: translateLocal('workflowsPage.frequencies.byTrip'),
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL]: translateLocal('workflowsPage.frequencies.manually'),
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT]: translateLocal('workflowsPage.frequencies.instant'),
});

function getWorkspaceFrequencyUpdateMessage(action: ReportAction): string {
    const {oldFrequency, newFrequency} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_REPORTING_FREQUENCY>) ?? {};

    if (!oldFrequency || !newFrequency) {
        return getReportActionText(action);
    }

    const frequencyDisplayNames = getAutoReportingFrequencyDisplayNames();
    const oldFrequencyTranslation = frequencyDisplayNames[oldFrequency]?.toLowerCase();
    const newFrequencyTranslation = frequencyDisplayNames[newFrequency]?.toLowerCase();

    if (!oldFrequencyTranslation || !newFrequencyTranslation) {
        return getReportActionText(action);
    }
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return translateLocal('workspaceActions.updatedWorkspaceFrequencyAction', {
        oldFrequency: oldFrequencyTranslation,
        newFrequency: newFrequencyTranslation,
    });
}

function getWorkspaceCategoryUpdateMessage(action: ReportAction, policy?: OnyxEntry<Policy>): string {
    const {categoryName, oldValue, newName, oldName, updatedField, newValue, currency} =
        getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CATEGORY>) ?? {};

    const decodedOptionName = getDecodedCategoryName(categoryName ?? '');

    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CATEGORY && categoryName) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.addCategory', {
            categoryName: decodedOptionName,
        });
    }

    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CATEGORY && categoryName) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.deleteCategory', {
            categoryName: decodedOptionName,
        });
    }

    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CATEGORY && categoryName) {
        if (updatedField === 'commentHint') {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('workspaceActions.updatedDescriptionHint', {
                oldValue: oldValue as string | undefined,
                newValue: newValue as string | undefined,
                categoryName: decodedOptionName,
            });
        }

        if (updatedField === 'enabled') {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('workspaceActions.updateCategory', {
                oldValue: !!oldValue,
                categoryName: decodedOptionName,
            });
        }

        if (updatedField === 'areCommentsRequired' && typeof oldValue === 'boolean') {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('workspaceActions.updateAreCommentsRequired', {
                oldValue,
                categoryName: decodedOptionName,
            });
        }

        if (updatedField === 'Payroll Code' && typeof oldValue === 'string' && typeof newValue === 'string') {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('workspaceActions.updateCategoryPayrollCode', {
                oldValue,
                categoryName: decodedOptionName,
                newValue,
            });
        }

        if (updatedField === 'GL Code' && typeof oldValue === 'string' && typeof newValue === 'string') {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('workspaceActions.updateCategoryGLCode', {
                oldValue,
                categoryName: decodedOptionName,
                newValue,
            });
        }

        if (updatedField === 'maxExpenseAmount' && (typeof oldValue === 'string' || typeof oldValue === 'number')) {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('workspaceActions.updateCategoryMaxExpenseAmount', {
                oldAmount: Number(oldValue) ? convertAmountToDisplayString(Number(oldValue), currency) : undefined,
                newAmount: Number(newValue ?? 0) ? convertAmountToDisplayString(Number(newValue), currency) : undefined,
                categoryName: decodedOptionName,
            });
        }

        if (updatedField === 'expenseLimitType' && typeof newValue === 'string' && typeof oldValue === 'string') {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('workspaceActions.updateCategoryExpenseLimitType', {
                categoryName: decodedOptionName,
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                oldValue: oldValue ? translateLocal(`workspace.rules.categoryRules.expenseLimitTypes.${oldValue}` as TranslationPaths) : undefined,
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                newValue: translateLocal(`workspace.rules.categoryRules.expenseLimitTypes.${newValue}` as TranslationPaths),
            });
        }

        if (updatedField === 'maxAmountNoReceipt' && typeof oldValue !== 'boolean' && typeof newValue !== 'boolean') {
            const maxExpenseAmountToDisplay = policy?.maxExpenseAmountNoReceipt === CONST.DISABLED_MAX_EXPENSE_VALUE ? 0 : policy?.maxExpenseAmountNoReceipt;

            const formatAmount = () => convertToShortDisplayString(maxExpenseAmountToDisplay, policy?.outputCurrency ?? CONST.CURRENCY.USD);
            const getTranslation = (value?: number | string) => {
                if (value === CONST.DISABLED_MAX_EXPENSE_VALUE) {
                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                    return translateLocal('workspace.rules.categoryRules.requireReceiptsOverList.never');
                }
                if (value === 0) {
                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                    return translateLocal('workspace.rules.categoryRules.requireReceiptsOverList.always');
                }
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                return translateLocal('workspace.rules.categoryRules.requireReceiptsOverList.default', {defaultAmount: formatAmount()});
            };
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('workspaceActions.updateCategoryMaxAmountNoReceipt', {
                categoryName: decodedOptionName,
                oldValue: getTranslation(oldValue),
                newValue: getTranslation(newValue),
            });
        }
    }

    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.SET_CATEGORY_NAME && oldName && newName) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.setCategoryName', {
            oldName: getDecodedCategoryName(oldName),
            newName: getDecodedCategoryName(newName),
        });
    }

    return getReportActionText(action);
}

function getWorkspaceTaxUpdateMessage(action: ReportAction): string {
    const {taxName, oldValue, newValue, updatedField} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_TAX>) ?? {};

    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_TAX && taxName) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.addTax', {taxName});
    }

    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_TAX && taxName) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.deleteTax', {taxName});
    }

    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAX && taxName) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.updateTax', {taxName, oldValue, newValue, updatedField});
    }

    return getReportActionText(action);
}

function getWorkspaceTagUpdateMessage(action: ReportAction | undefined): string {
    const {tagListName, tagName, enabled, newName, newValue, oldName, oldValue, updatedField, count} =
        getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CATEGORY>) ?? {};

    if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_TAG && tagListName && tagName) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.addTag', {
            tagListName,
            tagName,
        });
    }

    if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_TAG && tagListName && tagName) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.deleteTag', {
            tagListName,
            tagName,
        });
    }

    if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_MULTIPLE_TAGS && count && tagListName) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.deleteMultipleTags', {
            count,
            tagListName,
        });
    }

    if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_ENABLED && tagListName && tagName) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.updateTagEnabled', {
            tagListName,
            tagName,
            enabled,
        });
    }

    if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_NAME && tagListName && newName && oldName) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.updateTagName', {
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
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.updateTag', {
            tagListName,
            oldValue,
            newValue,
            tagName,
            updatedField,
        });
    }

    return getReportActionText(action);
}

function getTagListNameUpdatedMessage(action: ReportAction): string {
    const {oldName, newName} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_LIST_NAME>) ?? {};
    if (newName && oldName) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.updateTagListName', {
            oldName,
            newName,
        });
    }
    return getReportActionText(action);
}

function getWorkspaceCustomUnitUpdatedMessage(action: ReportAction): string {
    const {oldValue, newValue, customUnitName, updatedField} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT>) ?? {};

    if (customUnitName === 'Distance' && updatedField === 'taxEnabled' && typeof newValue === 'boolean') {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.updateCustomUnitTaxEnabled', {
            newValue,
        });
    }

    if (customUnitName && typeof oldValue === 'string' && typeof newValue === 'string' && updatedField) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.updateCustomUnit', {
            customUnitName,
            newValue,
            oldValue,
            updatedField,
        });
    }

    return getReportActionText(action);
}

function getWorkspaceCustomUnitRateAddedMessage(action: ReportAction): string {
    const {customUnitName, rateName} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CATEGORY>) ?? {};

    if (customUnitName && rateName) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.addCustomUnitRate', {
            customUnitName,
            rateName,
        });
    }

    return getReportActionText(action);
}

function getWorkspaceCustomUnitRateUpdatedMessage(action: ReportAction): string {
    const {customUnitName, customUnitRateName, updatedField, oldValue, newValue, newTaxPercentage, oldTaxPercentage} =
        getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT_RATE>) ?? {};

    if (customUnitName && customUnitRateName && updatedField === 'rate' && typeof oldValue === 'string' && typeof newValue === 'string') {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.updatedCustomUnitRate', {
            customUnitName,
            customUnitRateName,
            updatedField,
            oldValue,
            newValue,
        });
    }

    if (customUnitRateName && updatedField === 'taxRateExternalID' && typeof newValue === 'string' && newTaxPercentage) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.updatedCustomUnitTaxRateExternalID', {
            customUnitRateName,
            newValue,
            newTaxPercentage,
            oldTaxPercentage,
            oldValue: oldValue as string | undefined,
        });
    }

    if (customUnitRateName && updatedField === 'taxClaimablePercentage' && typeof newValue === 'number' && customUnitRateName) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.updatedCustomUnitTaxClaimablePercentage', {
            customUnitRateName,
            newValue: parseFloat(parseFloat(newValue ?? 0).toFixed(2)),
            oldValue: typeof oldValue === 'number' ? parseFloat(parseFloat(oldValue ?? 0).toFixed(2)) : undefined,
        });
    }

    return getReportActionText(action);
}

function getWorkspaceCustomUnitRateDeletedMessage(action: ReportAction): string {
    const {customUnitName, rateName} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CUSTOM_UNIT_RATE>) ?? {};
    if (customUnitName && rateName) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.deleteCustomUnitRate', {
            customUnitName,
            rateName,
        });
    }

    return getReportActionText(action);
}

function getWorkspaceReportFieldAddMessage(action: ReportAction): string {
    const {fieldName, fieldType} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CATEGORY>) ?? {};

    if (fieldName && fieldType) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.addedReportField', {
            fieldName,
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            fieldType: translateLocal(getReportFieldTypeTranslationKey(fieldType as PolicyReportFieldType)).toLowerCase(),
        });
    }

    return getReportActionText(action);
}

function getWorkspaceReportFieldUpdateMessage(action: ReportAction): string {
    const {updateType, fieldName, defaultValue, optionName, allEnabled, optionEnabled, toggledOptionsCount} =
        getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REPORT_FIELD>) ?? {};

    if (updateType === 'updatedDefaultValue' && fieldName && defaultValue) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.updateReportFieldDefaultValue', {
            fieldName,
            defaultValue,
        });
    }

    if (updateType === 'addedOption' && fieldName && optionName) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.addedReportFieldOption', {
            fieldName,
            optionName,
        });
    }

    if (updateType === 'changedOptionDisabled' && fieldName && optionName) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.updateReportFieldOptionDisabled', {
            fieldName,
            optionName,
            optionEnabled: !!optionEnabled,
        });
    }

    if (updateType === 'updatedAllDisabled' && fieldName && optionName) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.updateReportFieldAllOptionsDisabled', {
            fieldName,
            optionName,
            allEnabled: !!allEnabled,
            toggledOptionsCount,
        });
    }

    if (updateType === 'removedOption' && fieldName && optionName) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.removedReportFieldOption', {
            fieldName,
            optionName,
        });
    }

    return getReportActionText(action);
}

function getWorkspaceReportFieldDeleteMessage(action: ReportAction): string {
    const {fieldType, fieldName} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CATEGORY>) ?? {};

    if (fieldType && fieldName) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.deleteReportField', {
            fieldName,
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            fieldType: translateLocal(getReportFieldTypeTranslationKey(fieldType as PolicyReportFieldType)).toLowerCase(),
        });
    }

    return getReportActionText(action);
}

function getWorkspaceUpdateFieldMessage(action: ReportAction): string {
    const {newValue, oldValue, updatedField} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FIELD>) ?? {};

    const newValueTranslationKey = CONST.POLICY.APPROVAL_MODE_TRANSLATION_KEYS[newValue as keyof typeof CONST.POLICY.APPROVAL_MODE_TRANSLATION_KEYS];
    const oldValueTranslationKey = CONST.POLICY.APPROVAL_MODE_TRANSLATION_KEYS[oldValue as keyof typeof CONST.POLICY.APPROVAL_MODE_TRANSLATION_KEYS];

    if (updatedField && updatedField === CONST.POLICY.COLLECTION_KEYS.APPROVAL_MODE && oldValueTranslationKey && newValueTranslationKey) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.updateApprovalMode', {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            newValue: translateLocal(`workspaceApprovalModes.${newValueTranslationKey}` as TranslationPaths),
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            oldValue: translateLocal(`workspaceApprovalModes.${oldValueTranslationKey}` as TranslationPaths),
            fieldName: updatedField,
        });
    }

    if (updatedField && updatedField === CONST.POLICY.EXPENSE_REPORT_RULES.PREVENT_SELF_APPROVAL && typeof oldValue === 'string' && typeof newValue === 'string') {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.preventSelfApproval', {
            oldValue,
            newValue,
        });
    }

    if (updatedField && updatedField === CONST.POLICY.EXPENSE_REPORT_RULES.MAX_EXPENSE_AGE && typeof oldValue === 'string' && typeof newValue === 'string') {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.updateMaxExpenseAge', {
            oldValue,
            newValue,
        });
    }
    if (
        updatedField &&
        updatedField === CONST.POLICY.COLLECTION_KEYS.AUTOREPORTING_OFFSET &&
        (typeof oldValue === 'string' || typeof oldValue === 'number') &&
        (typeof newValue === 'string' || typeof newValue === 'number')
    ) {
        const getAutoReportingOffsetToDisplay = (autoReportingOffset: string | number) => {
            if (autoReportingOffset === CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_DAY_OF_MONTH) {
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                return translateLocal('workflowsPage.frequencies.lastDayOfMonth');
            }
            if (autoReportingOffset === CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_BUSINESS_DAY_OF_MONTH) {
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                return translateLocal('workflowsPage.frequencies.lastBusinessDayOfMonth');
            }
            if (typeof autoReportingOffset === 'number') {
                return toLocaleOrdinal(IntlStore.getCurrentLocale(), autoReportingOffset, false);
            }
            return '';
        };
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.updateMonthlyOffset', {
            newValue: getAutoReportingOffsetToDisplay(newValue),
            oldValue: getAutoReportingOffsetToDisplay(oldValue),
        });
    }
    return getReportActionText(action);
}

function getWorkspaceAttendeeTrackingUpdateMessage(action: ReportAction): string {
    const {enabled} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_IS_ATTENDEE_TRACKING_ENABLED>) ?? {};

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return translateLocal('workspaceActions.updatedAttendeeTracking', {enabled: !!enabled});
}

function getWorkspaceReimbursementUpdateMessage(action: ReportAction): string {
    const {enabled} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REIMBURSEMENT_ENABLED>) ?? {};

    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REIMBURSEMENT_ENABLED && typeof enabled === 'boolean') {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.updateReimbursementEnabled', {enabled});
    }

    return getReportActionText(action);
}

function getPolicyChangeLogMaxExpenseAmountNoReceiptMessage(action: ReportAction): string {
    const {oldMaxExpenseAmountNoReceipt, newMaxExpenseAmountNoReceipt, currency} =
        getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT_NO_RECEIPT>) ?? {};

    if (typeof oldMaxExpenseAmountNoReceipt === 'number' && typeof newMaxExpenseAmountNoReceipt === 'number') {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.updateMaxExpenseAmountNoReceipt', {
            oldValue: convertToDisplayString(oldMaxExpenseAmountNoReceipt, currency),
            newValue: convertToDisplayString(newMaxExpenseAmountNoReceipt, currency),
        });
    }

    return getReportActionText(action);
}

function getPolicyChangeLogMaxExpenseAmountMessage(action: ReportAction): string {
    const {oldMaxExpenseAmount, newMaxExpenseAmount, currency} =
        getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT>) ?? {};

    if (typeof oldMaxExpenseAmount === 'number' && typeof newMaxExpenseAmount === 'number') {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.updateMaxExpenseAmount', {
            oldValue: convertToDisplayString(oldMaxExpenseAmount, currency),
            newValue: convertToDisplayString(newMaxExpenseAmount, currency),
        });
    }

    return getReportActionText(action);
}

function getPolicyChangeLogDefaultBillableMessage(action: ReportAction): string {
    const {oldDefaultBillable, newDefaultBillable} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_BILLABLE>) ?? {};

    if (typeof oldDefaultBillable === 'string' && typeof newDefaultBillable === 'string') {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.updateDefaultBillable', {
            oldValue: oldDefaultBillable,
            newValue: newDefaultBillable,
        });
    }

    return getReportActionText(action);
}

function getPolicyChangeLogDefaultReimbursableMessage(action: ReportAction): string {
    const {oldDefaultReimbursable, newDefaultReimbursable} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_REIMBURSABLE>) ?? {};

    if (typeof oldDefaultReimbursable === 'string' && typeof newDefaultReimbursable === 'string') {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.updateDefaultReimbursable', {
            oldValue: oldDefaultReimbursable,
            newValue: newDefaultReimbursable,
        });
    }

    return getReportActionText(action);
}

function getPolicyChangeLogDefaultTitleEnforcedMessage(action: ReportAction): string {
    const {value} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_TITLE_ENFORCED>) ?? {};

    if (typeof value === 'boolean') {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.updateDefaultTitleEnforced', {
            value,
        });
    }

    return getReportActionText(action);
}

function getPolicyChangeLogDeleteMemberMessage(reportAction: OnyxInputOrEntry<ReportAction>): string {
    if (!isPolicyChangeLogDeleteMemberMessage(reportAction)) {
        return '';
    }
    const originalMessage = getOriginalMessage(reportAction);
    const email = formatPhoneNumber(originalMessage?.email ?? '');
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const role = translateLocal('workspace.common.roleName', {role: originalMessage?.role ?? ''}).toLowerCase();
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return translateLocal('report.actions.type.removeMember', {email, role});
}

function getAddedConnectionMessage(reportAction: OnyxEntry<ReportAction>): string {
    if (!isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_INTEGRATION)) {
        return '';
    }
    const originalMessage = getOriginalMessage(reportAction);
    const connectionName = originalMessage?.connectionName;
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return connectionName ? translateLocal('report.actions.type.addedConnection', {connectionName}) : '';
}

function getRemovedConnectionMessage(reportAction: OnyxEntry<ReportAction>): string {
    if (!isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_INTEGRATION)) {
        return '';
    }
    const originalMessage = getOriginalMessage(reportAction);
    const connectionName = originalMessage?.connectionName;
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return connectionName ? translateLocal('report.actions.type.removedConnection', {connectionName}) : '';
}

function getRenamedAction(reportAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.RENAMED>>, isExpenseReport: boolean, actorName?: string) {
    const originalMessage = getOriginalMessage(reportAction);
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return translateLocal('newRoomPage.renamedRoomAction', {
        actorName,
        isExpenseReport,
        oldName: originalMessage?.oldName ?? '',
        newName: originalMessage?.newName ?? '',
    });
}

function getAddedApprovalRuleMessage(reportAction: OnyxEntry<ReportAction>) {
    const {name, approverAccountID, approverEmail, field, approverName} =
        getOriginalMessage(reportAction as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_APPROVER_RULE>) ?? {};

    if (name && approverAccountID && approverEmail && field && approverName) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.addApprovalRule', {
            approverEmail,
            approverName,
            field,
            name,
        });
    }

    return getReportActionText(reportAction);
}

function getDeletedApprovalRuleMessage(reportAction: OnyxEntry<ReportAction>) {
    const {name, approverAccountID, approverEmail, field, approverName} =
        getOriginalMessage(reportAction as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_APPROVER_RULE>) ?? {};

    if (name && approverAccountID && approverEmail && field && approverName) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.deleteApprovalRule', {
            approverEmail,
            approverName,
            field,
            name,
        });
    }

    return getReportActionText(reportAction);
}

function getActionableCardFraudAlertResolutionMessage(reportAction: OnyxEntry<ReportAction>) {
    const {maskedCardNumber, resolution} = getOriginalMessage(reportAction as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_CARD_FRAUD_ALERT>) ?? {};
    if (resolution === CONST.CARD_FRAUD_ALERT_RESOLUTION.RECOGNIZED) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('cardPage.cardFraudAlert.clearedMessage', {cardLastFour: maskedCardNumber?.slice(-4) ?? ''});
    }
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return translateLocal('cardPage.cardFraudAlert.deactivatedMessage', {cardLastFour: maskedCardNumber?.slice(-4) ?? ''});
}

function getUpdatedApprovalRuleMessage(reportAction: OnyxEntry<ReportAction>) {
    const {field, oldApproverEmail, oldApproverName, newApproverEmail, newApproverName, name} =
        getOriginalMessage(reportAction as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_APPROVER_RULE>) ?? {};

    if (field && oldApproverEmail && newApproverEmail && name) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.updateApprovalRule', {
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

function getRemovedFromApprovalChainMessage(reportAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REMOVED_FROM_APPROVAL_CHAIN>>) {
    const originalMessage = getOriginalMessage(reportAction);
    const submittersNames = getPersonalDetailsByIDs({
        accountIDs: originalMessage?.submittersAccountIDs ?? [],
        currentUserAccountID: currentUserAccountID ?? CONST.DEFAULT_NUMBER_ID,
    }).map(({displayName, login}) => displayName ?? login ?? 'Unknown Submitter');
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return translateLocal('workspaceActions.removedFromApprovalWorkflow', {submittersNames, count: submittersNames.length});
}

function getActionableCardFraudAlertMessage(
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
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('cardPage.cardFraudAlert.clearedMessage', {cardLastFour});
    }

    if (resolution === CONST.CARD_FRAUD_ALERT_RESOLUTION.FRAUD) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('cardPage.cardFraudAlert.deactivatedMessage', {cardLastFour});
    }
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return translateLocal('cardPage.cardFraudAlert.alertMessage', {
        cardLastFour,
        amount: formattedAmount,
        merchant,
        date: formattedDate,
    });
}

function getDemotedFromWorkspaceMessage(reportAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.DEMOTED_FROM_WORKSPACE>>) {
    const originalMessage = getOriginalMessage(reportAction);
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const policyName = originalMessage?.policyName ?? translateLocal('workspace.common.workspace');
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const oldRole = translateLocal('workspace.common.roleName', {role: originalMessage?.oldRole}).toLowerCase();
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return translateLocal('workspaceActions.demotedFromWorkspace', {policyName, oldRole});
}

function getUpdatedAuditRateMessage(reportAction: OnyxEntry<ReportAction>) {
    const {oldAuditRate, newAuditRate} = getOriginalMessage(reportAction as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUDIT_RATE>) ?? {};

    if (typeof oldAuditRate !== 'number' || typeof newAuditRate !== 'number') {
        return getReportActionText(reportAction);
    }
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return translateLocal('workspaceActions.updatedAuditRate', {oldAuditRate, newAuditRate});
}

function getUpdatedManualApprovalThresholdMessage(reportAction: OnyxEntry<ReportAction>) {
    const {
        oldLimit,
        newLimit,
        currency = CONST.CURRENCY.USD,
    } = getOriginalMessage(reportAction as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MANUAL_APPROVAL_THRESHOLD>) ?? {};

    if (typeof oldLimit !== 'number' || typeof oldLimit !== 'number') {
        return getReportActionText(reportAction);
    }
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return translateLocal('workspaceActions.updatedManualApprovalThreshold', {oldLimit: convertToDisplayString(oldLimit, currency), newLimit: convertToDisplayString(newLimit, currency)});
}

function getChangedApproverActionMessage<T extends typeof CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL | typeof CONST.REPORT.ACTIONS.TYPE.REROUTE>(reportAction: OnyxEntry<ReportAction>) {
    const {mentionedAccountIDs} = getOriginalMessage(reportAction as ReportAction<T>) ?? {};

    // If mentionedAccountIDs exists and has values, use the first one
    if (mentionedAccountIDs?.length) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('iou.changeApprover.changedApproverMessage', {managerID: mentionedAccountIDs.at(0) ?? CONST.DEFAULT_NUMBER_ID});
    }

    // Fallback: If mentionedAccountIDs is missing (common with OldDot take control actions),
    // use the actorAccountID (who performed the take control action) as the new approver
    const actorAccountID = reportAction?.actorAccountID;
    if (!actorAccountID) {
        return '';
    }
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return translateLocal('iou.changeApprover.changedApproverMessage', {managerID: actorAccountID});
}

function isCardIssuedAction(
    reportAction: OnyxEntry<ReportAction>,
): reportAction is ReportAction<
    | typeof CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED
    | typeof CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED_VIRTUAL
    | typeof CONST.REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS
    | typeof CONST.REPORT.ACTIONS.TYPE.CARD_ASSIGNED
> {
    return (
        isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED) ||
        isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED_VIRTUAL) ||
        isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS) ||
        isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.CARD_ASSIGNED)
    );
}

function shouldShowAddMissingDetails(actionName?: ReportActionName, card?: Card) {
    const missingDetails = arePersonalDetailsMissing(privatePersonalDetails);

    return actionName === CONST.REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS && (card?.state === CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED || missingDetails);
}

function getJoinRequestMessage(reportAction: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_JOIN_REQUEST>) {
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const policy = getPolicy(getOriginalMessage(reportAction)?.policyID);
    const userDetail = getPersonalDetailByEmail(getOriginalMessage(reportAction)?.email ?? '');
    const userName = userDetail?.firstName ? `${userDetail.displayName} (${userDetail.login})` : (userDetail?.login ?? getOriginalMessage(reportAction)?.email);
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return translateLocal('workspace.inviteMessage.joinRequest', {user: userName ?? '', workspaceName: policy?.name ?? ''});
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
}: {
    reportAction: OnyxEntry<ReportAction>;
    shouldRenderHTML?: boolean;
    policyID?: string;
    expensifyCard?: Card;
    companyCard?: Card;
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
    const expensifyCardLink =
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        shouldRenderHTML && isExpensifyCardActive ? `<a href='${environmentURL}/${navigateRoute}'>${translateLocal('cardPage.expensifyCard')}</a>` : translateLocal('cardPage.expensifyCard');
    const isAssigneeCurrentUser = currentUserAccountID === assigneeAccountID;
    const companyCardLink =
        shouldRenderHTML && isAssigneeCurrentUser && companyCard
            ? // eslint-disable-next-line @typescript-eslint/no-deprecated
              `<a href='${environmentURL}/${ROUTES.SETTINGS_WALLET}'>${translateLocal('workspace.companyCards.companyCard')}</a>`
            : // eslint-disable-next-line @typescript-eslint/no-deprecated
              translateLocal('workspace.companyCards.companyCard');
    const shouldShowAddMissingDetailsMessage = !isAssigneeCurrentUser || shouldShowAddMissingDetails(reportAction?.actionName, expensifyCard);
    switch (reportAction?.actionName) {
        case CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('workspace.expensifyCard.issuedCard', {assignee});
        case CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED_VIRTUAL:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('workspace.expensifyCard.issuedCardVirtual', {assignee, link: expensifyCardLink});
        case CONST.REPORT.ACTIONS.TYPE.CARD_ASSIGNED:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('workspace.companyCards.assignedCard', {assignee, link: companyCardLink});
        case CONST.REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS:
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal(`workspace.expensifyCard.${shouldShowAddMissingDetailsMessage ? 'issuedCardNoShippingDetails' : 'addedShippingDetails'}`, {assignee});
        default:
            return '';
    }
}

function getRoomChangeLogMessage(reportAction: ReportAction) {
    if (!isInviteOrRemovedAction(reportAction)) {
        return '';
    }
    const originalMessage = getOriginalMessage(reportAction);
    const targetAccountIDs: number[] = originalMessage?.targetAccountIDs ?? [];
    const actionText =
        isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM) || isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.INVITE_TO_ROOM)
            ? // eslint-disable-next-line @typescript-eslint/no-deprecated
              translateLocal('workspace.invite.invited')
            : // eslint-disable-next-line @typescript-eslint/no-deprecated
              translateLocal('workspace.invite.removed');
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const userText = (targetAccountIDs.length === 1 ? translateLocal('common.member') : translateLocal('common.members')).toLowerCase();
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

function getIntegrationSyncFailedMessage(action: OnyxEntry<ReportAction>, policyID?: string, shouldShowOldDotLink = false): string {
    const {label, errorMessage} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.INTEGRATION_SYNC_FAILED>) ?? {label: '', errorMessage: ''};

    const param = encodeURIComponent(`{"policyID": "${policyID}"}`);
    const workspaceAccountingLink = shouldShowOldDotLink ? `${oldDotEnvironmentURL}/policy?param=${param}#connections` : `${environmentURL}/${ROUTES.POLICY_ACCOUNTING.getRoute(policyID)}`;
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return translateLocal('report.actions.type.integrationSyncFailed', {
        label,
        errorMessage,
        workspaceAccountingLink,
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
    isMarkAsClosedAction,
    isApprovedAction,
    isUnapprovedAction,
    isForwardedAction,
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
    getWorkspaceAttendeeTrackingUpdateMessage,
    getWorkspaceReimbursementUpdateMessage,
    getWorkspaceCurrencyUpdateMessage,
    getWorkspaceTaxUpdateMessage,
    getWorkspaceFrequencyUpdateMessage,
    getPolicyChangeLogMaxExpenseAmountNoReceiptMessage,
    getPolicyChangeLogMaxExpenseAmountMessage,
    getPolicyChangeLogDefaultBillableMessage,
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
    getReopenedMessage,
    getLeaveRoomMessage,
    getRetractedMessage,
    isReopenedAction,
    isRetractedAction,
    getIntegrationSyncFailedMessage,
    getPolicyChangeLogDefaultReimbursableMessage,
    getManagerOnVacation,
    getVacationer,
    getSubmittedTo,
    getReceiptScanFailedMessage,
    getChangedApproverActionMessage,
    getDelegateAccountIDFromReportAction,
    isPendingHide,
    filterOutDeprecatedReportActions,
    getActionableCardFraudAlertMessage,
};

export type {LastVisibleMessage};
