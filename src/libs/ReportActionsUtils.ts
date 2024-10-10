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
import type {OnyxInputOrEntry, PrivatePersonalDetails} from '@src/types/onyx';
import type {JoinWorkspaceResolution, OriginalMessageChangeLog, OriginalMessageExportIntegration} from '@src/types/onyx/OriginalMessage';
import type Report from '@src/types/onyx/Report';
import type ReportAction from '@src/types/onyx/ReportAction';
import type {Message, OldDotReportAction, OriginalMessage, ReportActions} from '@src/types/onyx/ReportAction';
import type ReportActionName from '@src/types/onyx/ReportActionName';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import DateUtils from './DateUtils';
import * as Environment from './Environment/Environment';
import getBase62ReportID from './getBase62ReportID';
import isReportMessageAttachment from './isReportMessageAttachment';
import * as Localize from './Localize';
import Log from './Log';
import type {MessageElementBase, MessageTextElement} from './MessageElement';
import Parser from './Parser';
import * as PersonalDetailsUtils from './PersonalDetailsUtils';
import * as PolicyUtils from './PolicyUtils';
import * as ReportConnection from './ReportConnection';
import type {OptimisticIOUReportAction, PartialReportAction} from './ReportUtils';
import StringUtils from './StringUtils';
// eslint-disable-next-line import/no-cycle
import * as TransactionUtils from './TransactionUtils';

type LastVisibleMessage = {
    lastMessageTranslationKey?: string;
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
Environment.getEnvironmentURL().then((url: string) => (environmentURL = url));

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
    const message = reportAction?.message ?? [];

    if (!Array.isArray(message)) {
        return message?.html === '' ?? message?.deleted;
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
    return !getWhisperedTo(reportAction).includes(currentUserAccountID ?? -1);
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
function isThreadParentMessage(reportAction: OnyxEntry<ReportAction>, reportID: string): boolean {
    const {childType, childVisibleActionCount = 0, childReportID} = reportAction ?? {};
    return childType === CONST.REPORT.TYPE.CHAT && (childVisibleActionCount > 0 || String(childReportID) === reportID);
}

/**
 * Returns the parentReportAction if the given report is a thread/task.
 *
 * @deprecated Use Onyx.connect() or withOnyx() instead
 */
function getParentReportAction(report: OnyxInputOrEntry<Report>): OnyxEntry<ReportAction> {
    if (!report?.parentReportID || !report.parentReportActionID) {
        return undefined;
    }
    return allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID}`]?.[report.parentReportActionID];
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
        // First sort by timestamp
        if (first.created !== second.created) {
            return (first.created < second.created ? -1 : 1) * invertedMultiplier;
        }

        // Then by action type, ensuring that `CREATED` actions always come first if they have the same timestamp as another action type
        if ((first.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED || second.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED) && first.actionName !== second.actionName) {
            return (first.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED ? -1 : 1) * invertedMultiplier;
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

    const report = ReportConnection.getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
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
function findPreviousAction(reportActions: ReportAction[] | undefined, actionIndex: number): OnyxEntry<ReportAction> {
    if (!reportActions) {
        return undefined;
    }

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
 * Returns true when the report action immediately before the specified index is a comment made by the same actor who who is leaving a comment in the action at the specified index.
 * Also checks to ensure that the comment is not too old to be shown as a grouped comment.
 *
 * @param actionIndex - index of the comment item in state to check
 */
function isConsecutiveActionMadeByPreviousActor(reportActions: ReportAction[] | undefined, actionIndex: number): boolean {
    const previousAction = findPreviousAction(reportActions, actionIndex);
    const currentAction = reportActions?.[actionIndex];

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
 * Checks if a reportAction is fit for display, meaning that it's not deprecated, is of a valid
 * and supported type, it's not deleted and also not closed.
 */
function shouldReportActionBeVisible(reportAction: OnyxEntry<ReportAction>, key: string | number): boolean {
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

    if (isTripPreview(reportAction)) {
        return true;
    }

    // If action is actionable whisper and resolved by user, then we don't want to render anything
    if (isActionableWhisper(reportAction) && getOriginalMessage(reportAction)?.resolution) {
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
function shouldReportActionBeVisibleAsLastAction(reportAction: OnyxInputOrEntry<ReportAction>): boolean {
    if (!reportAction) {
        return false;
    }

    if (Object.keys(reportAction.errors ?? {}).length > 0) {
        return false;
    }

    // If a whisper action is the REPORT_PREVIEW action, we are displaying it.
    // If the action's message text is empty and it is not a deleted parent with visible child actions, hide it. Else, consider the action to be displayable.
    return (
        shouldReportActionBeVisible(reportAction, reportAction.reportActionID) &&
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

function getLastVisibleAction(reportID: string, actionsToMerge: Record<string, NullishDeep<ReportAction> | null> = {}): OnyxEntry<ReportAction> {
    let reportActions: Array<ReportAction | null | undefined> = [];
    if (!isEmpty(actionsToMerge)) {
        reportActions = Object.values(fastMerge(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`] ?? {}, actionsToMerge ?? {}, true)) as Array<
            ReportAction | null | undefined
        >;
    } else {
        reportActions = Object.values(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`] ?? {});
    }
    const visibleReportActions = reportActions.filter((action): action is ReportAction => shouldReportActionBeVisibleAsLastAction(action));
    const sortedReportActions = getSortedReportActions(visibleReportActions, true);
    if (sortedReportActions.length === 0) {
        return undefined;
    }
    return sortedReportActions.at(0);
}

function formatLastMessageText(lastMessageText: string) {
    const trimmedMessage = String(lastMessageText).trim();

    // Add support for inline code containing only space characters
    // The message will appear as a blank space in the LHN
    if ((trimmedMessage === '' && lastMessageText.length > 0) || (trimmedMessage === '?\u2026' && lastMessageText.length > CONST.REPORT.MIN_LENGTH_LAST_MESSAGE_WITH_ELLIPSIS)) {
        return ' ';
    }

    return StringUtils.lineBreaksToSpaces(trimmedMessage).substring(0, CONST.REPORT.LAST_MESSAGE_TEXT_MAX_LENGTH).trim();
}

function getLastVisibleMessage(
    reportID: string,
    actionsToMerge: Record<string, NullishDeep<ReportAction> | null> = {},
    reportAction: OnyxInputOrEntry<ReportAction> | undefined = undefined,
): LastVisibleMessage {
    const lastVisibleAction = reportAction ?? getLastVisibleAction(reportID, actionsToMerge);
    const message = getReportActionMessage(lastVisibleAction);

    if (message && isReportMessageAttachment(message)) {
        return {
            lastMessageTranslationKey: CONST.TRANSLATION_KEYS.ATTACHMENT,
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
function getSortedReportActionsForDisplay(reportActions: OnyxEntry<ReportActions> | ReportAction[], shouldIncludeInvisibleActions = false): ReportAction[] {
    let filteredReportActions: ReportAction[] = [];
    if (!reportActions) {
        return [];
    }

    if (shouldIncludeInvisibleActions) {
        filteredReportActions = Object.values(reportActions).filter(Boolean);
    } else {
        filteredReportActions = Object.entries(reportActions)
            .filter(([key, reportAction]) => shouldReportActionBeVisible(reportAction, key))
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
function getFirstVisibleReportActionID(sortedReportActions: ReportAction[] = [], isOffline = false): string {
    if (!Array.isArray(sortedReportActions)) {
        return '';
    }
    const sortedFilterReportActions = sortedReportActions.filter((action) => !isDeletedAction(action) || (action?.childVisibleActionCount ?? 0) > 0 || isOffline);
    return sortedFilterReportActions.length > 1 ? sortedFilterReportActions.at(sortedFilterReportActions.length - 2)?.reportActionID ?? '-1' : '';
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
function getLinkedTransactionID(reportActionOrID: string | OnyxEntry<ReportAction>, reportID?: string): string | null {
    const reportAction = typeof reportActionOrID === 'string' ? allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`]?.[reportActionOrID] : reportActionOrID;
    if (!reportAction || !isMoneyRequestAction(reportAction)) {
        return null;
    }
    return getOriginalMessage(reportAction)?.IOUTransactionID ?? null;
}

function getReportAction(reportID: string, reportActionID: string): ReportAction | undefined {
    return allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`]?.[reportActionID];
}

function getMostRecentReportActionLastModified(): string {
    // Start with the oldest date possible
    let mostRecentReportActionLastModified = DateUtils.getDBTime(0);

    // Flatten all the actions
    // Loop over them all to find the one that is the most recent
    const flatReportActions = Object.values(allReportActions ?? {})
        .flatMap((actions) => (actions ? Object.values(actions) : []))
        .filter(Boolean);
    flatReportActions.forEach((action) => {
        // Pending actions should not be counted here as a user could create a comment or some other action while offline and the server might know about
        // messages they have not seen yet.
        if (action.pendingAction) {
            return;
        }

        const lastModified = action.lastModified ?? action.created;

        if (lastModified < mostRecentReportActionLastModified) {
            return;
        }

        mostRecentReportActionLastModified = lastModified;
    });

    // We might not have actions so we also look at the report objects to see if any have a lastVisibleActionLastModified that is more recent. We don't need to get
    // any reports that have been updated before either a recently updated report or reportAction as we should be up to date on these
    Object.values(ReportConnection.getAllReports() ?? {}).forEach((report) => {
        const reportLastVisibleActionLastModified = report?.lastVisibleActionLastModified ?? report?.lastVisibleActionCreated;
        if (!reportLastVisibleActionLastModified || reportLastVisibleActionLastModified < mostRecentReportActionLastModified) {
            return;
        }

        mostRecentReportActionLastModified = reportLastVisibleActionLastModified;
    });

    return mostRecentReportActionLastModified;
}

/**
 * @returns The report preview action or `null` if one couldn't be found
 */
function getReportPreviewAction(chatReportID: string, iouReportID: string): OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>> {
    return Object.values(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`] ?? {}).find(
        (reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW> =>
            reportAction && isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) && getOriginalMessage(reportAction)?.linkedReportID === iouReportID,
    );
}

/**
 * Get the iouReportID for a given report action.
 */
function getIOUReportIDFromReportActionPreview(reportAction: OnyxEntry<ReportAction>): string {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) ? getOriginalMessage(reportAction)?.linkedReportID ?? '-1' : '-1';
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
function getOneTransactionThreadReportID(reportID: string, reportActions: OnyxEntry<ReportActions> | ReportAction[], isOffline: boolean | undefined = undefined): string | undefined {
    // If the report is not an IOU, Expense report, or Invoice, it shouldn't be treated as one-transaction report.
    const report = ReportConnection.getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
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
    if ((originalMessage?.deleted ?? '') !== '' && isMoneyRequestAction(singleAction)) {
        return;
    }

    // Ensure we have a childReportID associated with the IOU report action
    return singleAction?.childReportID;
}

/**
 * When we delete certain reports, we want to check whether there are any visible actions left to display.
 * If there are no visible actions left (including system messages), we can hide the report from view entirely
 */
function doesReportHaveVisibleActions(reportID: string, actionsToMerge: ReportActions = {}): boolean {
    const reportActions = Object.values(fastMerge(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`] ?? {}, actionsToMerge, true));
    const visibleReportActions = Object.values(reportActions ?? {}).filter((action) => shouldReportActionBeVisibleAsLastAction(action));

    // Exclude the task system message and the created message
    const visibleReportActionsWithoutTaskSystemMessage = visibleReportActions.filter((action) => !isTaskAction(action) && !isCreatedAction(action));
    return visibleReportActionsWithoutTaskSystemMessage.length > 0;
}

function getAllReportActions(reportID: string): ReportActions {
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

function getMemberChangeMessageElements(reportAction: OnyxEntry<ReportAction>): readonly MemberChangeMessageElement[] {
    const isInviteAction = isInviteMemberAction(reportAction);
    const isLeaveAction = isLeavePolicyAction(reportAction);

    if (!isMemberChangeAction(reportAction)) {
        return [];
    }

    // Currently, we only render messages when members are invited
    let verb = Localize.translateLocal('workspace.invite.removed');
    if (isInviteAction) {
        verb = Localize.translateLocal('workspace.invite.invited');
    }

    if (isLeaveAction) {
        verb = Localize.translateLocal('workspace.invite.leftWorkspace');
    }

    const originalMessage = getOriginalMessage(reportAction);
    const targetAccountIDs: number[] = originalMessage?.targetAccountIDs ?? [];
    const personalDetails = PersonalDetailsUtils.getPersonalDetailsByIDs(targetAccountIDs, 0);

    const mentionElements = targetAccountIDs.map((accountID): MemberChangeMessageUserMentionElement => {
        const personalDetail = personalDetails.find((personal) => personal.accountID === accountID);
        const handleText = PersonalDetailsUtils.getEffectiveDisplayName(personalDetail) ?? Localize.translateLocal('common.hidden');

        return {
            kind: 'userMention',
            content: `@${handleText}`,
            accountID,
        };
    });

    const buildRoomElements = (): readonly MemberChangeMessageElement[] => {
        const roomName = originalMessage?.roomName;

        if (roomName) {
            const preposition = isInviteAction ? ` ${Localize.translateLocal('workspace.invite.to')} ` : ` ${Localize.translateLocal('workspace.invite.from')} `;

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
        ...Localize.formatMessageElementList(mentionElements),
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
    return [
        CONST.REPORT.ACTIONS.TYPE.CHANGE_FIELD,
        CONST.REPORT.ACTIONS.TYPE.CHANGE_POLICY,
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
                return Localize.translateLocal('report.actions.type.changeFieldEmpty', {newValue, fieldName});
            }
            return Localize.translateLocal('report.actions.type.changeField', {oldValue, newValue, fieldName});
        }
        case CONST.REPORT.ACTIONS.TYPE.CHANGE_POLICY: {
            const {fromPolicy, toPolicy} = originalMessage;
            return Localize.translateLocal('report.actions.type.changePolicy', {fromPolicy, toPolicy});
        }
        case CONST.REPORT.ACTIONS.TYPE.DELEGATE_SUBMIT: {
            const {delegateUser, originalManager} = originalMessage;
            return Localize.translateLocal('report.actions.type.delegateSubmit', {delegateUser, originalManager});
        }
        case CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_CSV:
            return Localize.translateLocal('report.actions.type.exportedToCSV');
        case CONST.REPORT.ACTIONS.TYPE.INTEGRATIONS_MESSAGE: {
            const {result, label} = originalMessage;
            const errorMessage = result?.messages?.join(', ') ?? '';
            return Localize.translateLocal('report.actions.type.integrationsMessage', {errorMessage, label});
        }
        case CONST.REPORT.ACTIONS.TYPE.MANAGER_ATTACH_RECEIPT:
            return Localize.translateLocal('report.actions.type.managerAttachReceipt');
        case CONST.REPORT.ACTIONS.TYPE.MANAGER_DETACH_RECEIPT:
            return Localize.translateLocal('report.actions.type.managerDetachReceipt');
        case CONST.REPORT.ACTIONS.TYPE.MARK_REIMBURSED_FROM_INTEGRATION: {
            const {amount, currency} = originalMessage;
            return Localize.translateLocal('report.actions.type.markedReimbursedFromIntegration', {amount, currency});
        }
        case CONST.REPORT.ACTIONS.TYPE.OUTDATED_BANK_ACCOUNT:
            return Localize.translateLocal('report.actions.type.outdatedBankAccount');
        case CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_BOUNCE:
            return Localize.translateLocal('report.actions.type.reimbursementACHBounce');
        case CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_CANCELLED:
            return Localize.translateLocal('report.actions.type.reimbursementACHCancelled');
        case CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACCOUNT_CHANGED:
            return Localize.translateLocal('report.actions.type.reimbursementAccountChanged');
        case CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DELAYED:
            return Localize.translateLocal('report.actions.type.reimbursementDelayed');
        case CONST.REPORT.ACTIONS.TYPE.SELECTED_FOR_RANDOM_AUDIT:
            return Localize.translateLocal(`report.actions.type.selectedForRandomAudit${withMarkdown ? 'Markdown' : ''}`);
        case CONST.REPORT.ACTIONS.TYPE.SHARE:
            return Localize.translateLocal('report.actions.type.share', {to: originalMessage.to});
        case CONST.REPORT.ACTIONS.TYPE.UNSHARE:
            return Localize.translateLocal('report.actions.type.unshare', {to: originalMessage.to});
        case CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL:
            return Localize.translateLocal('report.actions.type.takeControl');
        default:
            return '';
    }
}

function getMemberChangeMessageFragment(reportAction: OnyxEntry<ReportAction>): Message {
    const messageElements: readonly MemberChangeMessageElement[] = getMemberChangeMessageElements(reportAction);
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

function getMemberChangeMessagePlainText(reportAction: OnyxEntry<ReportAction>): string {
    const messageElements = getMemberChangeMessageElements(reportAction);
    return messageElements.map((element) => element.content).join('');
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
    const personalDetails = PersonalDetailsUtils.getPersonalDetailsByIDs(targetAccountIDs, 0);
    const mentionElements = targetAccountIDs.map((accountID): string => {
        const personalDetail = personalDetails.find((personal) => personal.accountID === accountID);
        const displayName = PersonalDetailsUtils.getEffectiveDisplayName(personalDetail);
        const handleText = isEmpty(displayName) ? Localize.translateLocal('common.hidden') : displayName;
        return `<mention-user accountID=${accountID}>@${handleText}</mention-user>`;
    });
    const preMentionsText = 'Heads up, ';
    const mentions = mentionElements.join(', ').replace(/, ([^,]*)$/, ' and $1');
    const postMentionsText = ` ${mentionElements.length > 1 ? "aren't members" : "isn't a member"} of this room.`;

    return `${preMentionsText}${mentions}${postMentionsText}`;
}

/**
 * @private
 */
function isReportActionUnread(reportAction: OnyxEntry<ReportAction>, lastReadTime: string) {
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
    const sortedReportActions = getSortedReportActions(Object.values(getAllReportActions(report?.reportID ?? '-1')));
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

function getActionableJoinRequestPendingReportAction(reportID: string): OnyxEntry<ReportAction> {
    const findPendingRequest = Object.values(getAllReportActions(reportID)).find(
        (reportActionItem) => isActionableJoinRequest(reportActionItem) && getOriginalMessage(reportActionItem)?.choice === ('' as JoinWorkspaceResolution),
    );

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
    return Localize.translateLocal(`violationDismissal.${violationName}.${reason}` as TranslationPaths);
}

/**
 * Check if the linked transaction is on hold
 */
function isLinkedTransactionHeld(reportActionID: string, reportID: string): boolean {
    return TransactionUtils.isOnHoldByTransactionID(getLinkedTransactionID(reportActionID, reportID) ?? '-1');
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
    return accountIDsFromMessage.includes(currentUserAccountID ?? -1) || emailsFromMessage.includes(currentEmail) || message.includes('<mention-here>');
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
function getIOUActionForReportID(reportID: string, transactionID: string): OnyxEntry<ReportAction> {
    const report = ReportConnection.getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    const reportActions = getAllReportActions(report?.reportID ?? '');
    const action = Object.values(reportActions ?? {})?.find((reportAction) => {
        const IOUTransactionID = isMoneyRequestAction(reportAction) ? getOriginalMessage(reportAction)?.IOUTransactionID : -1;
        return IOUTransactionID === transactionID;
    });
    return action;
}

/**
 * Get the track expense actionable whisper of the corresponding track expense
 */
function getTrackExpenseActionableWhisper(transactionID: string, chatReportID: string) {
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
    const {label, markedManually} = originalMessage;
    const reimbursableUrls = originalMessage.reimbursableUrls ?? [];
    const nonReimbursableUrls = originalMessage.nonReimbursableUrls ?? [];
    const reportID = reportAction?.reportID ?? '';
    const wasExportedAfterBase62 = (reportAction?.created ?? '') > '2022-11-14';
    const base62ReportID = getBase62ReportID(Number(reportID));

    const result: Array<{text: string; url: string}> = [];
    if (isPending) {
        result.push({
            text: Localize.translateLocal('report.actions.type.exportedToIntegration.pending', {label}),
            url: '',
        });
    } else if (markedManually) {
        result.push({
            text: Localize.translateLocal('report.actions.type.exportedToIntegration.manual', {label}),
            url: '',
        });
    } else {
        result.push({
            text: Localize.translateLocal('report.actions.type.exportedToIntegration.automatic', {label}),
            url: '',
        });
    }

    if (reimbursableUrls.length === 1) {
        result.push({
            text: Localize.translateLocal('report.actions.type.exportedToIntegration.reimburseableLink'),
            url: reimbursableUrls.at(0) ?? '',
        });
    }

    if (nonReimbursableUrls.length) {
        const text = Localize.translateLocal('report.actions.type.exportedToIntegration.nonReimbursableLink');
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
        return `${Localize.translateLocal('roomChangeLog.updateRoomDescription')} ${originalMessage?.description}`;
    }

    return Localize.translateLocal('roomChangeLog.clearRoomDescription');
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
    const role = originalMessage?.role ?? '';
    return Localize.translateLocal('report.actions.type.addEmployee', {email, role});
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
    const newRole = originalMessage?.newValue ?? '';
    const oldRole = originalMessage?.oldValue ?? '';
    return Localize.translateLocal('report.actions.type.updateRole', {email, newRole, currentRole: oldRole});
}

function isPolicyChangeLogDeleteMemberMessage(
    reportAction: OnyxInputOrEntry<ReportAction>,
): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_EMPLOYEE> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_EMPLOYEE);
}

function getPolicyChangeLogDeleteMemberMessage(reportAction: OnyxInputOrEntry<ReportAction>): string {
    if (!isPolicyChangeLogDeleteMemberMessage(reportAction)) {
        return '';
    }
    const originalMessage = getOriginalMessage(reportAction);
    const email = originalMessage?.email ?? '';
    const role = originalMessage?.role ?? '';
    return Localize.translateLocal('report.actions.type.removeMember', {email, role});
}

function getRemovedConnectionMessage(reportAction: OnyxEntry<ReportAction>): string {
    if (!isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_INTEGRATION)) {
        return '';
    }
    const originalMessage = getOriginalMessage(reportAction);
    const connectionName = originalMessage?.connectionName;
    return connectionName ? Localize.translateLocal('report.actions.type.removedConnection', {connectionName}) : '';
}

function getRenamedAction(reportAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.RENAMED>>) {
    const originalMessage = getOriginalMessage(reportAction);
    return Localize.translateLocal('newRoomPage.renamedRoomAction', {
        oldName: originalMessage?.oldName ?? '',
        newName: originalMessage?.newName ?? '',
    });
}

function getRemovedFromApprovalChainMessage(reportAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REMOVED_FROM_APPROVAL_CHAIN>>) {
    const originalMessage = getOriginalMessage(reportAction);
    const submittersNames = PersonalDetailsUtils.getPersonalDetailsByIDs(originalMessage?.submittersAccountIDs ?? [], currentUserAccountID ?? -1).map(
        ({displayName, login}) => displayName ?? login ?? 'Unknown Submitter',
    );
    return Localize.translateLocal('workspaceActions.removedFromApprovalWorkflow', {submittersNames, count: submittersNames.length});
}

function isCardIssuedAction(reportAction: OnyxEntry<ReportAction>) {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED, CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED_VIRTUAL, CONST.REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS);
}

function getCardIssuedMessage(reportAction: OnyxEntry<ReportAction>, shouldRenderHTML = false, policyID = '-1') {
    const cardIssuedActionOriginalMessage = isActionOfType(
        reportAction,
        CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED,
        CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED_VIRTUAL,
        CONST.REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS,
    )
        ? getOriginalMessage(reportAction)
        : undefined;

    const assigneeAccountID = cardIssuedActionOriginalMessage?.assigneeAccountID ?? -1;
    const cardID = cardIssuedActionOriginalMessage?.cardID ?? -1;
    const assigneeDetails = PersonalDetailsUtils.getPersonalDetailsByIDs([assigneeAccountID], currentUserAccountID ?? -1).at(0);
    const isPolicyAdmin = PolicyUtils.isPolicyAdmin(PolicyUtils.getPolicy(policyID));
    const assignee = shouldRenderHTML ? `<mention-user accountID="${assigneeAccountID}"/>` : assigneeDetails?.firstName ?? assigneeDetails?.login ?? '';
    const navigateRoute = isPolicyAdmin ? ROUTES.EXPENSIFY_CARD_DETAILS.getRoute(policyID, String(cardID)) : ROUTES.SETTINGS_DOMAINCARD_DETAIL.getRoute(String(cardID));
    const link = shouldRenderHTML
        ? `<a href='${environmentURL}/${navigateRoute}'>${Localize.translateLocal('cardPage.expensifyCard')}</a>`
        : Localize.translateLocal('cardPage.expensifyCard');

    const missingDetails =
        !privatePersonalDetails?.legalFirstName ||
        !privatePersonalDetails?.legalLastName ||
        !privatePersonalDetails?.dob ||
        !privatePersonalDetails?.phoneNumber ||
        isEmptyObject(privatePersonalDetails?.addresses) ||
        privatePersonalDetails.addresses.length === 0;

    const isAssigneeCurrentUser = currentUserAccountID === assigneeAccountID;

    const shouldShowAddMissingDetailsButton = reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS && missingDetails && isAssigneeCurrentUser;
    switch (reportAction?.actionName) {
        case CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED:
            return Localize.translateLocal('workspace.expensifyCard.issuedCard', {assignee});
        case CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED_VIRTUAL:
            return Localize.translateLocal('workspace.expensifyCard.issuedCardVirtual', {assignee, link});
        case CONST.REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS:
            return Localize.translateLocal(`workspace.expensifyCard.${shouldShowAddMissingDetailsButton ? 'issuedCardNoShippingDetails' : 'addedShippingDetails'}`, {assignee});
        default:
            return '';
    }
}

export {
    doesReportHaveVisibleActions,
    extractLinksFromMessageHtml,
    formatLastMessageText,
    getActionableMentionWhisperMessage,
    getAllReportActions,
    getCombinedReportActions,
    getDismissedViolationMessageText,
    getFirstVisibleReportActionID,
    getIOUActionForReportID,
    getIOUReportIDFromReportActionPreview,
    getLastClosedReportAction,
    getLastVisibleAction,
    getLastVisibleMessage,
    getLatestReportActionFromOnyxData,
    getLinkedTransactionID,
    getMemberChangeMessageFragment,
    getUpdateRoomDescriptionFragment,
    getMemberChangeMessagePlainText,
    getReportActionMessageFragments,
    getMessageOfOldDotReportAction,
    getMostRecentIOURequestActionID,
    getMostRecentReportActionLastModified,
    getNumberOfMoneyRequests,
    getOneTransactionThreadReportID,
    getOriginalMessage,
    // eslint-disable-next-line deprecation/deprecation
    getParentReportAction,
    getRemovedFromApprovalChainMessage,
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
    getRenamedAction,
    isCardIssuedAction,
    getCardIssuedMessage,
    getRemovedConnectionMessage,
    getActionableJoinRequestPendingReportAction,
};

export type {LastVisibleMessage};
