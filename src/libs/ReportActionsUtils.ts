import {fastMerge, Str} from 'expensify-common';
import clone from 'lodash/clone';
import lodashFindLast from 'lodash/findLast';
import isEmpty from 'lodash/isEmpty';
import type {NullishDeep, OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Card, Locale, OnyxInputOrEntry, PrivatePersonalDetails} from '@src/types/onyx';
import type {JoinWorkspaceResolution, OriginalMessageChangeLog, OriginalMessageExportIntegration} from '@src/types/onyx/OriginalMessage';
import type {PolicyReportFieldType} from '@src/types/onyx/Policy';
import type Report from '@src/types/onyx/Report';
import type ReportAction from '@src/types/onyx/ReportAction';
import type {Message, OldDotReportAction, OriginalMessage, ReportActions} from '@src/types/onyx/ReportAction';
import type ReportActionName from '@src/types/onyx/ReportActionName';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {convertToDisplayString} from './CurrencyUtils';
import DateUtils from './DateUtils';
import {getEnvironmentURL} from './Environment/Environment';
import getBase62ReportID from './getBase62ReportID';
import isReportMessageAttachment from './isReportMessageAttachment';
import {toLocaleOrdinal} from './LocaleDigitUtils';
import {formatPhoneNumber} from './LocalePhoneNumber';
import {formatMessageElementList, translateLocal} from './Localize';
import Log from './Log';
import type {MessageElementBase, MessageTextElement} from './MessageElement';
import Parser from './Parser';
import {getEffectiveDisplayName, getPersonalDetailsByIDs} from './PersonalDetailsUtils';
import {getPolicy, isPolicyAdmin as isPolicyAdminPolicyUtils} from './PolicyUtils';
import type {getReportName, OptimisticIOUReportAction, PartialReportAction} from './ReportUtils';
import StringUtils from './StringUtils';
import {isOnHoldByTransactionID} from './TransactionUtils';
import {getReportFieldAlternativeTextTranslationKey} from './WorkspaceReportFieldUtils';

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

let preferredLocale: DeepValueOf<typeof CONST.LOCALES> = CONST.LOCALES.DEFAULT;
Onyx.connect({
    key: ONYXKEYS.NVP_PREFERRED_LOCALE,
    callback: (value) => {
        if (!value) {
            return;
        }
        preferredLocale = value;
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

const POLICY_CHANGE_LOG_ARRAY = Object.values(CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG);

function isCreatedAction(reportAction: OnyxInputOrEntry<ReportAction>): boolean {
    return reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED;
}

function isDeletedAction(reportAction: OnyxInputOrEntry<ReportAction | OptimisticIOUReportAction>): boolean {
    if (isInviteOrRemovedAction(reportAction)) {
        return false;
    }

    const message = reportAction?.message ?? [];

    if (!Array.isArray(message)) {
        return message?.html === '' || !!message?.deleted;
    }

    // A legacy deleted comment has either an empty array or an object with html field with empty string as value
    const isLegacyDeletedComment = message.length === 0 || message.at(0)?.html === '';

    return isLegacyDeletedComment || !!message.at(0)?.deleted;
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

function isPolicyChangeLogAction(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<ValueOf<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG>> {
    return isActionOfType(reportAction, ...POLICY_CHANGE_LOG_ARRAY);
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

function isTripPreview(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.TRIPPREVIEW> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.TRIPPREVIEW);
}

function isActionOfType<T extends ReportActionName[]>(
    action: OnyxInputOrEntry<ReportAction>,
    ...actionNames: T
): action is {
    [K in keyof T]: ReportAction<T[K]>;
}[number] {
    const actionName = action?.actionName as T[number];

    // This is purely a performance optimization to limit the 'includes()' calls on Hermes
    for (const i of actionNames) {
        if (i === actionName) {
            return true;
        }
    }

    return false;
}

function getOriginalMessage<T extends ReportActionName>(reportAction: OnyxInputOrEntry<ReportAction<T>>): OriginalMessage<T> | undefined {
    if (!Array.isArray(reportAction?.message)) {
        // eslint-disable-next-line deprecation/deprecation
        return reportAction?.message ?? reportAction?.originalMessage;
    }
    // eslint-disable-next-line deprecation/deprecation
    return reportAction.originalMessage;
}

function isExportIntegrationAction(reportAction: OnyxInputOrEntry<ReportAction>): boolean {
    return reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION;
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
    return isActionOfType(
        reportAction,
        CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM,
        CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.REMOVE_FROM_ROOM,
        CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.INVITE_TO_ROOM,
        CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.REMOVE_FROM_ROOM,
        CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.LEAVE_POLICY,
    );
}

function isInviteMemberAction(
    reportAction: OnyxEntry<ReportAction>,
): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM | typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.INVITE_TO_ROOM> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.INVITE_TO_ROOM);
}

function isLeavePolicyAction(reportAction: OnyxEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.LEAVE_POLICY> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.LEAVE_POLICY);
}

function isReimbursementDeQueuedAction(reportAction: OnyxEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DEQUEUED> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DEQUEUED);
}

function isClosedAction(reportAction: OnyxEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.CLOSED> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.CLOSED);
}

function isRenamedAction(reportAction: OnyxEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.RENAMED> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.RENAMED);
}

function isRoomChangeLogAction(reportAction: OnyxEntry<ReportAction>): reportAction is ReportAction<ValueOf<typeof CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG>> {
    return isActionOfType(reportAction, ...Object.values(CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG));
}

function isInviteOrRemovedAction(
    reportAction: OnyxInputOrEntry<ReportAction>,
): reportAction is ReportAction<ValueOf<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG | typeof CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG>> {
    return isActionOfType(
        reportAction,
        CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM,
        CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.REMOVE_FROM_ROOM,
        CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.INVITE_TO_ROOM,
        CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.REMOVE_FROM_ROOM,
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
    shouldFilterIOUAction = true,
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
        if (!isMoneyRequestAction(action) || !shouldFilterIOUAction) {
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

/**
 * Finds most recent IOU request action ID.
 */
function getMostRecentIOURequestActionID(reportActions: ReportAction[] | null): string | null {
    if (!Array.isArray(reportActions)) {
        return null;
    }
    const iouRequestTypes: Array<ValueOf<typeof CONST.IOU.REPORT_ACTION_TYPE>> = [
        CONST.IOU.REPORT_ACTION_TYPE.CREATE,
        CONST.IOU.REPORT_ACTION_TYPE.SPLIT,
        CONST.IOU.REPORT_ACTION_TYPE.TRACK,
    ];
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
        // Find the next non-pending deletion report action, as the pending delete action means that it is not displayed in the UI, but still is in the report actions list.
        // If we are offline, all actions are pending but shown in the UI, so we take the previous action, even if it is a delete.
        if (isNetworkOffline || reportActions.at(i)?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
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
function findNextAction(reportActions: ReportAction[], actionIndex: number): OnyxEntry<ReportAction> {
    for (let i = actionIndex - 1; i > 0; i--) {
        // Find the next non-pending deletion report action, as the pending delete action means that it is not displayed in the UI, but still is in the report actions list.
        // If we are offline, all actions are pending but shown in the UI, so we take the previous action, even if it is a delete.
        if (isNetworkOffline || reportActions.at(i)?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
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
function isConsecutiveActionMadeByPreviousActor(reportActions: ReportAction[], actionIndex: number): boolean {
    const previousAction = findPreviousAction(reportActions, actionIndex);
    const currentAction = reportActions.at(actionIndex);

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
    if (previousAction.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED) {
        return false;
    }

    // Do not group if previous or current action was a renamed action
    if (previousAction.actionName === CONST.REPORT.ACTIONS.TYPE.RENAMED || currentAction.actionName === CONST.REPORT.ACTIONS.TYPE.RENAMED) {
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
        const currentActionAdminAccountID = currentAction.adminAccountID;

        return currentActionAdminAccountID === previousAction.actorAccountID || currentActionAdminAccountID === previousAction.adminAccountID;
    }

    if (isSubmittedAction(previousAction)) {
        return typeof previousAction.adminAccountID === 'number'
            ? currentAction.actorAccountID === previousAction.adminAccountID
            : currentAction.actorAccountID === previousAction.actorAccountID;
    }

    return currentAction.actorAccountID === previousAction.actorAccountID;
}

// Todo combine with `isConsecutiveActionMadeByPreviousActor` so as to not duplicate logic (issue: https://github.com/Expensify/App/issues/58625)
function hasNextActionMadeBySameActor(reportActions: ReportAction[], actionIndex: number) {
    const currentAction = reportActions.at(actionIndex);
    const nextAction = findNextAction(reportActions, actionIndex);

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
    if (nextAction.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED) {
        return false;
    }

    // Do not group if previous or current action was a renamed action
    if (nextAction.actionName === CONST.REPORT.ACTIONS.TYPE.RENAMED || currentAction.actionName === CONST.REPORT.ACTIONS.TYPE.RENAMED) {
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
        const currentActionAdminAccountID = currentAction.adminAccountID;

        return currentActionAdminAccountID === nextAction.actorAccountID || currentActionAdminAccountID === nextAction.adminAccountID;
    }

    if (isSubmittedAction(nextAction)) {
        return typeof nextAction.adminAccountID === 'number' ? currentAction.actorAccountID === nextAction.adminAccountID : currentAction.actorAccountID === nextAction.actorAccountID;
    }

    return currentAction.actorAccountID === nextAction.actorAccountID;
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
    // eslint-disable-next-line deprecation/deprecation
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
        Log.info('Front end filtered out reportAction for being an older, deprecated report action', false, reportAction);
        return true;
    }

    return false;
}

/**
 * Checks if a given report action corresponds to an actionable mention whisper.
 * @param reportAction
 */
function isActionableMentionWhisper(reportAction: OnyxEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_MENTION_WHISPER> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_MENTION_WHISPER);
}

/**
 * Checks if a given report action corresponds to an actionable report mention whisper.
 * @param reportAction
 */
function isActionableReportMentionWhisper(reportAction: OnyxEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_REPORT_MENTION_WHISPER> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_REPORT_MENTION_WHISPER);
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
> {
    return isActionableMentionWhisper(reportAction) || isActionableTrackExpense(reportAction) || isActionableReportMentionWhisper(reportAction);
}

const {POLICY_CHANGE_LOG: policyChangelogTypes, ROOM_CHANGE_LOG: roomChangeLogTypes, ...otherActionTypes} = CONST.REPORT.ACTIONS.TYPE;
const supportedActionTypes: ReportActionName[] = [...Object.values(otherActionTypes), ...Object.values(policyChangelogTypes), ...Object.values(roomChangeLogTypes)];

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
    if (!supportedActionTypes.includes(reportAction.actionName)) {
        return false;
    }

    // Ignore closed action here since we're already displaying a footer that explains why the report was closed
    if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CLOSED) {
        return false;
    }

    // Ignore markedAsReimbursed action here since we're already display message that explains the expense was paid
    // elsewhere in the IOU reportAction
    if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED) {
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
        !(isWhisperAction(reportAction) && !isReportPreviewAction(reportAction) && !isMoneyRequestAction(reportAction)) &&
        !(isDeletedAction(reportAction) && !isDeletedParentAction(reportAction))
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
 * In some cases, there can be multiple closed report actions in a chat report.
 * This method returns the last closed report action so we can always show the correct archived report reason.
 * Additionally, archived #admins and #announce do not have the closed report action so we will return null if none is found.
 *
 */
function getLastClosedReportAction(reportActions: OnyxEntry<ReportActions>): OnyxEntry<ReportAction> {
    // If closed report action is not present, return early
    if (!Object.values(reportActions ?? {}).some((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.CLOSED)) {
        return undefined;
    }

    const filteredReportActions = filterOutDeprecatedReportActions(reportActions);
    const sortedReportActions = getSortedReportActions(filteredReportActions);
    return lodashFindLast(sortedReportActions, (action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.CLOSED);
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
function getLinkedTransactionID(reportActionOrID: string | OnyxEntry<ReportAction> | undefined, reportID?: string): string | undefined {
    const reportAction = typeof reportActionOrID === 'string' ? allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`]?.[reportActionOrID] : reportActionOrID;
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
 * @returns The report preview action or `null` if one couldn't be found
 */
function getReportPreviewAction(chatReportID: string | undefined, iouReportID: string | undefined): OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>> {
    if (!chatReportID || !iouReportID) {
        return;
    }

    return Object.values(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`] ?? {}).find(
        (reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW> =>
            reportAction && isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) && getOriginalMessage(reportAction)?.linkedReportID === iouReportID,
    );
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
 * Returns the number of expenses associated with a report preview
 */
function getNumberOfMoneyRequests(reportPreviewAction: OnyxEntry<ReportAction>): number {
    return reportPreviewAction?.childMoneyRequestCount ?? 0;
}

function isSplitBillAction(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.IOU) && getOriginalMessage(reportAction)?.type === CONST.IOU.REPORT_ACTION_TYPE.SPLIT;
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
        actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG
    );
}

// Get all IOU report actions for the report.
const iouRequestTypes = new Set<ValueOf<typeof CONST.IOU.REPORT_ACTION_TYPE>>([
    CONST.IOU.REPORT_ACTION_TYPE.CREATE,
    CONST.IOU.REPORT_ACTION_TYPE.SPLIT,
    CONST.IOU.REPORT_ACTION_TYPE.PAY,
    CONST.IOU.REPORT_ACTION_TYPE.TRACK,
]);

/**
 * Gets the reportID for the transaction thread associated with a report by iterating over the reportActions and identifying the IOU report actions.
 * Returns a reportID if there is exactly one transaction thread for the report, and null otherwise.
 */
function getOneTransactionThreadReportID(
    reportID: string | undefined,
    reportActions: OnyxEntry<ReportActions> | ReportAction[],
    isOffline: boolean | undefined = undefined,
): string | undefined {
    // If the report is not an IOU, Expense report, or Invoice, it shouldn't be treated as one-transaction report.
    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    if (report?.type !== CONST.REPORT.TYPE.IOU && report?.type !== CONST.REPORT.TYPE.EXPENSE && report?.type !== CONST.REPORT.TYPE.INVOICE) {
        return;
    }

    const reportActionsArray = Array.isArray(reportActions) ? reportActions : Object.values(reportActions ?? {});
    if (!reportActionsArray.length) {
        return;
    }

    const iouRequestActions = [];
    for (const action of reportActionsArray) {
        if (!isMoneyRequestAction(action)) {
            // eslint-disable-next-line no-continue
            continue;
        }

        const originalMessage = getOriginalMessage(action);
        const actionType = originalMessage?.type;
        if (
            actionType &&
            iouRequestTypes.has(actionType) &&
            action.childReportID &&
            // Include deleted IOU reportActions if:
            // - they have an assocaited IOU transaction ID or
            // - they have visibile childActions (like comments) that we'd want to display
            // - the action is pending deletion and the user is offline
            (!!originalMessage?.IOUTransactionID ||
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                (isMessageDeleted(action) && action.childVisibleActionCount) ||
                (action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && (isOffline ?? isNetworkOffline)))
        ) {
            iouRequestActions.push(action);
        }
    }

    // If we don't have any IOU request actions, or we have more than one IOU request actions, this isn't a oneTransaction report
    if (!iouRequestActions.length || iouRequestActions.length > 1) {
        return;
    }

    const singleAction = iouRequestActions.at(0);
    const originalMessage = getOriginalMessage(singleAction);

    // If there's only one IOU request action associated with the report but it's been deleted, then we don't consider this a oneTransaction report
    // and want to display it using the standard view
    if (((originalMessage?.deleted ?? '') !== '' || isDeletedAction(singleAction)) && isMoneyRequestAction(singleAction)) {
        return;
    }

    // Ensure we have a childReportID associated with the IOU report action
    return singleAction?.childReportID;
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

// eslint-disable-next-line rulesdir/no-negated-variables
function isNotifiableReportAction(reportAction: OnyxEntry<ReportAction>): boolean {
    if (!reportAction) {
        return false;
    }

    const actions: ReportActionName[] = [CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, CONST.REPORT.ACTIONS.TYPE.IOU, CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE];

    return actions.includes(reportAction.actionName);
}

// We pass getReportName as a param to avoid cyclic dependency.
function getMemberChangeMessageElements(reportAction: OnyxEntry<ReportAction>, getReportNameCallback: typeof getReportName): readonly MemberChangeMessageElement[] {
    const isInviteAction = isInviteMemberAction(reportAction);
    const isLeaveAction = isLeavePolicyAction(reportAction);

    if (!isMemberChangeAction(reportAction)) {
        return [];
    }

    // Currently, we only render messages when members are invited
    let verb = translateLocal('workspace.invite.removed');
    if (isInviteAction) {
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
        const handleText = getEffectiveDisplayName(personalDetail) ?? translateLocal('common.hidden');

        return {
            kind: 'userMention',
            content: `@${handleText}`,
            accountID,
        };
    });

    const buildRoomElements = (): readonly MemberChangeMessageElement[] => {
        const roomName = getReportNameCallback(allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${originalMessage?.reportID}`]);
        if (roomName && originalMessage) {
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
        CONST.REPORT.ACTIONS.TYPE.DELEGATE_SUBMIT,
        CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_CSV,
        CONST.REPORT.ACTIONS.TYPE.INTEGRATIONS_MESSAGE,
        CONST.REPORT.ACTIONS.TYPE.MANAGER_ATTACH_RECEIPT,
        CONST.REPORT.ACTIONS.TYPE.MANAGER_DETACH_RECEIPT,
        CONST.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED,
        CONST.REPORT.ACTIONS.TYPE.MARK_REIMBURSED_FROM_INTEGRATION,
        CONST.REPORT.ACTIONS.TYPE.OUTDATED_BANK_ACCOUNT,
        CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_BOUNCE,
        CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_CANCELLED,
        CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACCOUNT_CHANGED,
        CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DELAYED,
        CONST.REPORT.ACTIONS.TYPE.SELECTED_FOR_RANDOM_AUDIT,
        CONST.REPORT.ACTIONS.TYPE.SHARE,
        CONST.REPORT.ACTIONS.TYPE.STRIPE_PAID,
        CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL,
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
                return translateLocal('report.actions.type.changeFieldEmpty', {newValue, fieldName});
            }
            return translateLocal('report.actions.type.changeField', {oldValue, newValue, fieldName});
        }
        case CONST.REPORT.ACTIONS.TYPE.DELEGATE_SUBMIT: {
            const {delegateUser, originalManager} = originalMessage;
            return translateLocal('report.actions.type.delegateSubmit', {delegateUser, originalManager});
        }
        case CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_CSV:
            return translateLocal('report.actions.type.exportedToCSV');
        case CONST.REPORT.ACTIONS.TYPE.INTEGRATIONS_MESSAGE: {
            const {result, label} = originalMessage;
            const errorMessage = result?.messages?.join(', ') ?? '';
            const linkText = result?.link?.text ?? '';
            const linkURL = result?.link?.url ?? '';
            return translateLocal('report.actions.type.integrationsMessage', {errorMessage, label, linkText, linkURL});
        }
        case CONST.REPORT.ACTIONS.TYPE.MANAGER_ATTACH_RECEIPT:
            return translateLocal('report.actions.type.managerAttachReceipt');
        case CONST.REPORT.ACTIONS.TYPE.MANAGER_DETACH_RECEIPT:
            return translateLocal('report.actions.type.managerDetachReceipt');
        case CONST.REPORT.ACTIONS.TYPE.MARK_REIMBURSED_FROM_INTEGRATION: {
            const {amount, currency} = originalMessage;
            return translateLocal('report.actions.type.markedReimbursedFromIntegration', {amount, currency});
        }
        case CONST.REPORT.ACTIONS.TYPE.OUTDATED_BANK_ACCOUNT:
            return translateLocal('report.actions.type.outdatedBankAccount');
        case CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_BOUNCE:
            return translateLocal('report.actions.type.reimbursementACHBounce');
        case CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_CANCELLED:
            return translateLocal('report.actions.type.reimbursementACHCancelled');
        case CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACCOUNT_CHANGED:
            return translateLocal('report.actions.type.reimbursementAccountChanged');
        case CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DELAYED:
            return translateLocal('report.actions.type.reimbursementDelayed');
        case CONST.REPORT.ACTIONS.TYPE.SELECTED_FOR_RANDOM_AUDIT:
            return translateLocal(`report.actions.type.selectedForRandomAudit${withMarkdown ? 'Markdown' : ''}`);
        case CONST.REPORT.ACTIONS.TYPE.SHARE:
            return translateLocal('report.actions.type.share', {to: originalMessage.to});
        case CONST.REPORT.ACTIONS.TYPE.UNSHARE:
            return translateLocal('report.actions.type.unshare', {to: originalMessage.to});
        case CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL:
            return translateLocal('report.actions.type.takeControl');
        default:
            return '';
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

    if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.REIMBURSED)) {
        const message = getReportActionMessageText(action);
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
function hasRequestFromCurrentAccount(reportID: string, currentAccountID: number): boolean {
    if (!reportID) {
        return false;
    }

    const reportActions = Object.values(getAllReportActions(reportID));
    if (reportActions.length === 0) {
        return false;
    }

    return reportActions.some((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.IOU && action.actorAccountID === currentAccountID);
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
        const displayName = getEffectiveDisplayName(personalDetail);
        const handleText = isEmpty(displayName) ? translateLocal('common.hidden') : displayName;
        return `<mention-user accountID=${accountID}>@${handleText}</mention-user>`;
    });
    const preMentionsText = 'Heads up, ';
    const mentions = mentionElements.join(', ').replace(/, ([^,]*)$/, ' and $1');
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
function isCurrentActionUnread(report: OnyxEntry<Report>, reportAction: ReportAction): boolean {
    const lastReadTime = report?.lastReadTime ?? '';
    const sortedReportActions = getSortedReportActions(Object.values(getAllReportActions(report?.reportID)));
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
    return translateLocal(`violationDismissal.${violationName}.${reason}` as TranslationPaths);
}

/**
 * Check if the linked transaction is on hold
 */
function isLinkedTransactionHeld(reportActionID: string, reportID: string): boolean {
    const linkedTransactionID = getLinkedTransactionID(reportActionID, reportID);
    return linkedTransactionID ? isOnHoldByTransactionID(linkedTransactionID) : false;
}

function getMentionedAccountIDsFromAction(reportAction: OnyxInputOrEntry<ReportAction>) {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT) ? getOriginalMessage(reportAction)?.mentionedAccountIDs ?? [] : [];
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
    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    const reportActions = getAllReportActions(report?.reportID);

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
    if (reportAction?.actionName !== 'EXPORTINTEGRATION') {
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
            text: translateLocal('report.actions.type.exportedToIntegration.pending', {label}),
            url: '',
        });
    } else if (markedManually) {
        result.push({
            text: translateLocal('report.actions.type.exportedToIntegration.manual', {label}),
            url: '',
        });
    } else if (automaticAction) {
        result.push({
            text: translateLocal('report.actions.type.exportedToIntegration.automaticActionOne', {label}),
            url: '',
        });
        const url = CONST.HELP_DOC_LINKS[label as keyof typeof CONST.HELP_DOC_LINKS];
        result.push({
            text: translateLocal('report.actions.type.exportedToIntegration.automaticActionTwo'),
            url: url || '',
        });
    } else {
        result.push({
            text: translateLocal('report.actions.type.exportedToIntegration.automatic', {label}),
            url: '',
        });
    }

    if (reimbursableUrls.length === 1) {
        result.push({
            text: translateLocal('report.actions.type.exportedToIntegration.reimburseableLink'),
            url: reimbursableUrls.at(0) ?? '',
        });
    }

    if (nonReimbursableUrls.length) {
        const text = translateLocal('report.actions.type.exportedToIntegration.nonReimbursableLink');
        let url = '';

        if (nonReimbursableUrls.length === 1) {
            url = nonReimbursableUrls.at(0) ?? '';
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
        return `${translateLocal('roomChangeLog.updateRoomDescription')} ${originalMessage?.description}`;
    }

    return translateLocal('roomChangeLog.clearRoomDescription');
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
    const role = translateLocal('workspace.common.roleName', {role: originalMessage?.role ?? ''}).toLowerCase();
    const formattedEmail = formatPhoneNumber(email);
    return translateLocal('report.actions.type.addEmployee', {email: formattedEmail, role});
}

function isPolicyChangeLogChangeRoleMessage(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EMPLOYEE> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EMPLOYEE);
}

function getPolicyChangeLogChangeRoleMessage(reportAction: OnyxInputOrEntry<ReportAction>): string {
    if (!isPolicyChangeLogChangeRoleMessage(reportAction)) {
        return '';
    }
    const originalMessage = getOriginalMessage(reportAction);
    const email = originalMessage?.email ?? '';
    const newRole = translateLocal('workspace.common.roleName', {role: typeof originalMessage?.newValue === 'string' ? originalMessage?.newValue : ''}).toLowerCase();
    const oldRole = translateLocal('workspace.common.roleName', {role: typeof originalMessage?.oldValue === 'string' ? originalMessage?.oldValue : ''}).toLowerCase();
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
    const nameOrEmail = useName && !!personalDetails?.firstName ? `${personalDetails?.firstName}:` : originalMessage?.email ?? '';
    const formattedNameOrEmail = formatPhoneNumber(nameOrEmail);
    return translateLocal('report.actions.type.leftWorkspace', {nameOrEmail: formattedNameOrEmail});
}

function isPolicyChangeLogDeleteMemberMessage(
    reportAction: OnyxInputOrEntry<ReportAction>,
): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_EMPLOYEE> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_EMPLOYEE);
}

function getWorkspaceNameUpdatedMessage(action: ReportAction) {
    const {oldName, newName} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_NAME>) ?? {};
    const message = oldName && newName ? translateLocal('workspaceActions.renamedWorkspaceNameAction', {oldName, newName}) : getReportActionText(action);
    return message;
}

function getWorkspaceDescriptionUpdatedMessage(action: ReportAction) {
    const {oldDescription, newDescription} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DESCRIPTION>) ?? {};
    const message =
        typeof oldDescription === 'string' && newDescription ? translateLocal('workspaceActions.updateWorkspaceDescription', {newDescription, oldDescription}) : getReportActionText(action);
    return message;
}

function getWorkspaceCurrencyUpdateMessage(action: ReportAction) {
    const {oldCurrency, newCurrency} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CURRENCY>) ?? {};
    const message = oldCurrency && newCurrency ? translateLocal('workspaceActions.updatedWorkspaceCurrencyAction', {oldCurrency, newCurrency}) : getReportActionText(action);
    return message;
}

type AutoReportingFrequencyKey = ValueOf<typeof CONST.POLICY.AUTO_REPORTING_FREQUENCIES>;
type AutoReportingFrequencyDisplayNames = Record<AutoReportingFrequencyKey, string>;

const getAutoReportingFrequencyDisplayNames = (): AutoReportingFrequencyDisplayNames => ({
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY]: translateLocal('workflowsPage.frequencies.monthly'),
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE]: translateLocal('workflowsPage.frequencies.daily'),
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY]: translateLocal('workflowsPage.frequencies.weekly'),
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.SEMI_MONTHLY]: translateLocal('workflowsPage.frequencies.twiceAMonth'),
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.TRIP]: translateLocal('workflowsPage.frequencies.byTrip'),
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL]: translateLocal('workflowsPage.frequencies.manually'),
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

    return translateLocal('workspaceActions.updatedWorkspaceFrequencyAction', {
        oldFrequency: oldFrequencyTranslation,
        newFrequency: newFrequencyTranslation,
    });
}

function getWorkspaceCategoryUpdateMessage(action: ReportAction): string {
    const {categoryName, oldValue, newName, oldName} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CATEGORY>) ?? {};

    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CATEGORY && categoryName) {
        return translateLocal('workspaceActions.addCategory', {
            categoryName,
        });
    }

    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CATEGORY && categoryName) {
        return translateLocal('workspaceActions.deleteCategory', {
            categoryName,
        });
    }

    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CATEGORY && categoryName) {
        return translateLocal('workspaceActions.updateCategory', {
            oldValue: !!oldValue,
            categoryName,
        });
    }

    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.SET_CATEGORY_NAME && oldName && newName) {
        return translateLocal('workspaceActions.setCategoryName', {
            oldName,
            newName,
        });
    }

    return getReportActionText(action);
}

function getWorkspaceTagUpdateMessage(action: ReportAction): string {
    const {tagListName, tagName, enabled, newName, newValue, oldName, oldValue, updatedField} =
        getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CATEGORY>) ?? {};

    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_TAG && tagListName && tagName) {
        return translateLocal('workspaceActions.addTag', {
            tagListName,
            tagName,
        });
    }

    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_TAG && tagListName && tagName) {
        return translateLocal('workspaceActions.deleteTag', {
            tagListName,
            tagName,
        });
    }

    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_ENABLED && tagListName && tagName) {
        return translateLocal('workspaceActions.updateTagEnabled', {
            tagListName,
            tagName,
            enabled,
        });
    }

    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_NAME && tagListName && newName && oldName) {
        return translateLocal('workspaceActions.updateTagName', {
            tagListName,
            newName,
            oldName,
        });
    }

    if (
        action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG &&
        tagListName &&
        typeof oldValue === 'string' &&
        typeof newValue === 'string' &&
        tagName &&
        updatedField
    ) {
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

function getWorkspaceCustomUnitRateAddedMessage(action: ReportAction): string {
    const {customUnitName, rateName} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CATEGORY>) ?? {};

    if (customUnitName && rateName) {
        return translateLocal('workspaceActions.addCustomUnitRate', {
            customUnitName,
            rateName,
        });
    }

    return getReportActionText(action);
}

function getWorkspaceReportFieldAddMessage(action: ReportAction): string {
    const {fieldName, fieldType} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CATEGORY>) ?? {};

    if (fieldName && fieldType) {
        return translateLocal('workspaceActions.addedReportField', {
            fieldName,
            fieldType: translateLocal(getReportFieldAlternativeTextTranslationKey(fieldType as PolicyReportFieldType)),
        });
    }

    return getReportActionText(action);
}

function getWorkspaceReportFieldUpdateMessage(action: ReportAction): string {
    const {updateType, fieldName, defaultValue} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CATEGORY>) ?? {};

    if (updateType === 'updatedDefaultValue' && fieldName && defaultValue) {
        return translateLocal('workspaceActions.updateReportFieldDefaultValue', {
            fieldName,
            defaultValue,
        });
    }

    return getReportActionText(action);
}

function getWorkspaceReportFieldDeleteMessage(action: ReportAction): string {
    const {fieldType, fieldName} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CATEGORY>) ?? {};

    if (fieldType && fieldName) {
        return translateLocal('workspaceActions.deleteReportField', {
            fieldName,
            fieldType: translateLocal(getReportFieldAlternativeTextTranslationKey(fieldType as PolicyReportFieldType)),
        });
    }

    return getReportActionText(action);
}

function getWorkspaceUpdateFieldMessage(action: ReportAction): string {
    const {newValue, oldValue, updatedField} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FIELD>) ?? {};

    const newValueTranslationKey = CONST.POLICY.APPROVAL_MODE_TRANSLATION_KEYS[newValue as keyof typeof CONST.POLICY.APPROVAL_MODE_TRANSLATION_KEYS];
    const oldValueTranslationKey = CONST.POLICY.APPROVAL_MODE_TRANSLATION_KEYS[oldValue as keyof typeof CONST.POLICY.APPROVAL_MODE_TRANSLATION_KEYS];

    if (updatedField && updatedField === CONST.POLICY.COLLECTION_KEYS.APPROVAL_MODE && oldValueTranslationKey && newValueTranslationKey) {
        return translateLocal('workspaceActions.updateApprovalMode', {
            newValue: translateLocal(`workspaceApprovalModes.${newValueTranslationKey}` as TranslationPaths),
            oldValue: translateLocal(`workspaceApprovalModes.${oldValueTranslationKey}` as TranslationPaths),
            fieldName: updatedField,
        });
    }

    if (updatedField && updatedField === CONST.POLICY.EXPENSE_REPORT_RULES.PREVENT_SELF_APPROVAL && typeof oldValue === 'string' && typeof newValue === 'string') {
        return translateLocal('workspaceActions.preventSelfApproval', {
            oldValue,
            newValue,
        });
    }

    if (updatedField && updatedField === CONST.POLICY.EXPENSE_REPORT_RULES.MAX_EXPENSE_AGE && typeof oldValue === 'string' && typeof newValue === 'string') {
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
                return translateLocal('workflowsPage.frequencies.lastDayOfMonth');
            }
            if (autoReportingOffset === CONST.POLICY.AUTO_REPORTING_OFFSET.LAST_BUSINESS_DAY_OF_MONTH) {
                return translateLocal('workflowsPage.frequencies.lastBusinessDayOfMonth');
            }
            if (typeof autoReportingOffset === 'number') {
                return toLocaleOrdinal(preferredLocale, autoReportingOffset, false);
            }
            return '';
        };
        return translateLocal('workspaceActions.updateMonthlyOffset', {
            newValue: getAutoReportingOffsetToDisplay(newValue),
            oldValue: getAutoReportingOffsetToDisplay(oldValue),
        });
    }
    return getReportActionText(action);
}

function getPolicyChangeLogMaxExpesnseAmountNoReceiptMessage(action: ReportAction): string {
    const {oldMaxExpenseAmountNoReceipt, newMaxExpenseAmountNoReceipt, currency} =
        getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT_NO_RECEIPT>) ?? {};

    if (typeof oldMaxExpenseAmountNoReceipt === 'number' && typeof newMaxExpenseAmountNoReceipt === 'number') {
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
        return translateLocal('workspaceActions.updateDefaultBillable', {
            oldValue: oldDefaultBillable,
            newValue: newDefaultBillable,
        });
    }

    return getReportActionText(action);
}

function getPolicyChangeLogDefaultTitleEnforcedMessage(action: ReportAction): string {
    const {value} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_TITLE_ENFORCED>) ?? {};

    if (typeof value === 'boolean') {
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
    const email = originalMessage?.email ?? '';
    const role = translateLocal('workspace.common.roleName', {role: originalMessage?.role ?? ''}).toLowerCase();
    return translateLocal('report.actions.type.removeMember', {email, role});
}

function getRemovedConnectionMessage(reportAction: OnyxEntry<ReportAction>): string {
    if (!isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_INTEGRATION)) {
        return '';
    }
    const originalMessage = getOriginalMessage(reportAction);
    const connectionName = originalMessage?.connectionName;
    return connectionName ? translateLocal('report.actions.type.removedConnection', {connectionName}) : '';
}

function getRenamedAction(reportAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.RENAMED>>) {
    const originalMessage = getOriginalMessage(reportAction);
    return translateLocal('newRoomPage.renamedRoomAction', {
        oldName: originalMessage?.oldName ?? '',
        newName: originalMessage?.newName ?? '',
    });
}

function getRemovedFromApprovalChainMessage(reportAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REMOVED_FROM_APPROVAL_CHAIN>>) {
    const originalMessage = getOriginalMessage(reportAction);
    const submittersNames = getPersonalDetailsByIDs({
        accountIDs: originalMessage?.submittersAccountIDs ?? [],
        currentUserAccountID: currentUserAccountID ?? CONST.DEFAULT_NUMBER_ID,
    }).map(({displayName, login}) => displayName ?? login ?? 'Unknown Submitter');
    return translateLocal('workspaceActions.removedFromApprovalWorkflow', {submittersNames, count: submittersNames.length});
}

function getDemotedFromWorkspaceMessage(reportAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.DEMOTED_FROM_WORKSPACE>>) {
    const originalMessage = getOriginalMessage(reportAction);
    const policyName = originalMessage?.policyName ?? translateLocal('workspace.common.workspace');
    const oldRole = translateLocal('workspace.common.roleName', {role: originalMessage?.oldRole}).toLowerCase();
    return translateLocal('workspaceActions.demotedFromWorkspace', {policyName, oldRole});
}

function isCardIssuedAction(reportAction: OnyxEntry<ReportAction>) {
    return isActionOfType(
        reportAction,
        CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED,
        CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED_VIRTUAL,
        CONST.REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS,
        CONST.REPORT.ACTIONS.TYPE.CARD_ASSIGNED,
    );
}

function shouldShowAddMissingDetails(actionName?: ReportActionName, card?: Card) {
    const missingDetails =
        !privatePersonalDetails?.legalFirstName ||
        !privatePersonalDetails?.legalLastName ||
        !privatePersonalDetails?.dob ||
        !privatePersonalDetails?.phoneNumber ||
        isEmptyObject(privatePersonalDetails?.addresses) ||
        privatePersonalDetails.addresses.length === 0;

    return actionName === CONST.REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS && (card?.state === CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED || missingDetails);
}

function getCardIssuedMessage({
    reportAction,
    shouldRenderHTML = false,
    policyID = '-1',
    card,
}: {
    reportAction: OnyxEntry<ReportAction>;
    shouldRenderHTML?: boolean;
    policyID?: string;
    card?: Card;
}) {
    const cardIssuedActionOriginalMessage = isActionOfType(
        reportAction,
        CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED,
        CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED_VIRTUAL,
        CONST.REPORT.ACTIONS.TYPE.CARD_ASSIGNED,
        CONST.REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS,
    )
        ? getOriginalMessage(reportAction)
        : undefined;

    const assigneeAccountID = cardIssuedActionOriginalMessage?.assigneeAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const cardID = cardIssuedActionOriginalMessage?.cardID ?? CONST.DEFAULT_NUMBER_ID;
    const isPolicyAdmin = isPolicyAdminPolicyUtils(getPolicy(policyID));
    const assignee = shouldRenderHTML ? `<mention-user accountID="${assigneeAccountID}"/>` : Parser.htmlToText(`<mention-user accountID="${assigneeAccountID}"/>`);
    const navigateRoute = isPolicyAdmin ? ROUTES.EXPENSIFY_CARD_DETAILS.getRoute(policyID, String(cardID)) : ROUTES.SETTINGS_DOMAINCARD_DETAIL.getRoute(String(cardID));
    const expensifyCardLink =
        shouldRenderHTML && !!card ? `<a href='${environmentURL}/${navigateRoute}'>${translateLocal('cardPage.expensifyCard')}</a>` : translateLocal('cardPage.expensifyCard');
    const companyCardLink = shouldRenderHTML
        ? `<a href='${environmentURL}/${ROUTES.SETTINGS_WALLET}'>${translateLocal('workspace.companyCards.companyCard')}</a>`
        : translateLocal('workspace.companyCards.companyCard');
    const isAssigneeCurrentUser = currentUserAccountID === assigneeAccountID;
    const shouldShowAddMissingDetailsMessage = !isAssigneeCurrentUser || shouldShowAddMissingDetails(reportAction?.actionName, card);
    switch (reportAction?.actionName) {
        case CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED:
            return translateLocal('workspace.expensifyCard.issuedCard', {assignee});
        case CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED_VIRTUAL:
            return translateLocal('workspace.expensifyCard.issuedCardVirtual', {assignee, link: expensifyCardLink});
        case CONST.REPORT.ACTIONS.TYPE.CARD_ASSIGNED:
            return translateLocal('workspace.companyCards.assignedCard', {assignee, link: companyCardLink});
        case CONST.REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS:
            return translateLocal(`workspace.expensifyCard.${shouldShowAddMissingDetailsMessage ? 'issuedCardNoShippingDetails' : 'addedShippingDetails'}`, {assignee});
        default:
            return '';
    }
}

function getReportActionsLength() {
    return Object.keys(allReportActions ?? {}).length;
}

function getReportActions(report: Report) {
    return allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`];
}

/**
 * @private
 */
function wasActionCreatedWhileOffline(action: ReportAction, isOffline: boolean, lastOfflineAt: Date | undefined, lastOnlineAt: Date | undefined, locale: Locale): boolean {
    // The user has never gone offline or never come back online
    if (!lastOfflineAt || !lastOnlineAt) {
        return false;
    }

    const actionCreatedAt = DateUtils.getLocalDateFromDatetime(locale, action.created);

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
function wasMessageReceivedWhileOffline(action: ReportAction, isOffline: boolean, lastOfflineAt: Date | undefined, lastOnlineAt: Date | undefined, locale: Locale) {
    const wasByCurrentUser = wasActionTakenByCurrentUser(action);
    const wasCreatedOffline = wasActionCreatedWhileOffline(action, isOffline, lastOfflineAt, lastOnlineAt, locale);

    return !wasByCurrentUser && wasCreatedOffline && !(action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD || action.isOptimisticAction);
}

export {
    doesReportHaveVisibleActions,
    extractLinksFromMessageHtml,
    formatLastMessageText,
    isReportActionUnread,
    getActionableMentionWhisperMessage,
    getAllReportActions,
    getCombinedReportActions,
    getDismissedViolationMessageText,
    getFirstVisibleReportActionID,
    getIOUActionForReportID,
    getIOUActionForTransactionID,
    getIOUReportIDFromReportActionPreview,
    getLastClosedReportAction,
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
    getOneTransactionThreadReportID,
    getOriginalMessage,
    getRemovedFromApprovalChainMessage,
    getDemotedFromWorkspaceMessage,
    getReportAction,
    getReportActionHtml,
    getReportActionMessage,
    getReportActionMessageText,
    getReportActionText,
    getReportPreviewAction,
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
    isActionableReportMentionWhisper,
    isActionableTrackExpense,
    isAddCommentAction,
    isApprovedOrSubmittedReportAction,
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
    isLinkedTransactionHeld,
    isMemberChangeAction,
    isExportIntegrationAction,
    isMessageDeleted,
    isModifiedExpenseAction,
    isMoneyRequestAction,
    isNotifiableReportAction,
    isOldDotReportAction,
    isPayAction,
    isPendingRemove,
    isPolicyChangeLogAction,
    isReimbursementDeQueuedAction,
    isReimbursementQueuedAction,
    isRenamedAction,
    isReportActionAttachment,
    isReportActionDeprecated,
    isReportPreviewAction,
    isReversedTransaction,
    isRoomChangeLogAction,
    isSentMoneyReportAction,
    isSplitBillAction,
    isTaskAction,
    isThreadParentMessage,
    isTrackExpenseAction,
    isTransactionThread,
    isTripPreview,
    isWhisperAction,
    isSubmittedAction,
    isSubmittedAndClosedAction,
    isApprovedAction,
    isUnapprovedAction,
    isForwardedAction,
    isWhisperActionTargetedToOthers,
    isTagModificationAction,
    shouldHideNewMarker,
    shouldReportActionBeVisible,
    shouldReportActionBeVisibleAsLastAction,
    wasActionTakenByCurrentUser,
    isInviteOrRemovedAction,
    isActionableAddPaymentCard,
    getExportIntegrationActionFragments,
    getExportIntegrationLastMessageText,
    getExportIntegrationMessageHTML,
    getUpdateRoomDescriptionMessage,
    didMessageMentionCurrentUser,
    getPolicyChangeLogAddEmployeeMessage,
    getPolicyChangeLogChangeRoleMessage,
    getPolicyChangeLogDeleteMemberMessage,
    getPolicyChangeLogEmployeeLeftMessage,
    getRenamedAction,
    isCardIssuedAction,
    getCardIssuedMessage,
    getRemovedConnectionMessage,
    getActionableJoinRequestPendingReportAction,
    getReportActionsLength,
    wasMessageReceivedWhileOffline,
    shouldShowAddMissingDetails,
    getWorkspaceCategoryUpdateMessage,
    getWorkspaceUpdateFieldMessage,
    getWorkspaceNameUpdatedMessage,
    getWorkspaceCurrencyUpdateMessage,
    getWorkspaceFrequencyUpdateMessage,
    getPolicyChangeLogMaxExpesnseAmountNoReceiptMessage,
    getPolicyChangeLogMaxExpenseAmountMessage,
    getPolicyChangeLogDefaultBillableMessage,
    getPolicyChangeLogDefaultTitleEnforcedMessage,
    getWorkspaceDescriptionUpdatedMessage,
    getWorkspaceReportFieldAddMessage,
    getWorkspaceCustomUnitRateAddedMessage,
    getWorkspaceTagUpdateMessage,
    getWorkspaceReportFieldUpdateMessage,
    getWorkspaceReportFieldDeleteMessage,
    getReportActions,
};

export type {LastVisibleMessage};
