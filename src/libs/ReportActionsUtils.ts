import fastMerge from 'expensify-common/lib/fastMerge';
import _ from 'lodash';
import lodashFindLast from 'lodash/findLast';
import type {OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {
    ActionName,
    ChangeLog,
    IOUMessage,
    OriginalMessageActionableMentionWhisper,
    OriginalMessageIOU,
    OriginalMessageJoinPolicyChangeLog,
    OriginalMessageReimbursementDequeued,
} from '@src/types/onyx/OriginalMessage';
import type Report from '@src/types/onyx/Report';
import type {Message, ReportActionBase, ReportActions} from '@src/types/onyx/ReportAction';
import type ReportAction from '@src/types/onyx/ReportAction';
import type {EmptyObject} from '@src/types/utils/EmptyObject';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import * as CollectionUtils from './CollectionUtils';
import * as Environment from './Environment/Environment';
import isReportMessageAttachment from './isReportMessageAttachment';
import * as Localize from './Localize';
import Log from './Log';
import type {MessageElementBase, MessageTextElement} from './MessageElement';
import * as PersonalDetailsUtils from './PersonalDetailsUtils';
import type {OptimisticIOUReportAction} from './ReportUtils';

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

const policyChangeActionsSet = new Set<string>(Object.values(CONST.REPORT.ACTIONS.TYPE.POLICYCHANGELOG));

let allReports: OnyxCollection<Report> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (reports) => {
        allReports = reports;
    },
});

const allReportActions: OnyxCollection<ReportActions> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    callback: (actions, key) => {
        if (!key || !actions) {
            return;
        }

        const reportID = CollectionUtils.extractCollectionItemID(key);
        allReportActions[reportID] = actions;
    },
});

let isNetworkOffline = false;
Onyx.connect({
    key: ONYXKEYS.NETWORK,
    callback: (val) => (isNetworkOffline = val?.isOffline ?? false),
});

let currentUserAccountID: number | undefined;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        // When signed out, value is undefined
        if (!value) {
            return;
        }

        currentUserAccountID = value.accountID;
    },
});

let environmentURL: string;
Environment.getEnvironmentURL().then((url: string) => (environmentURL = url));

function isCreatedAction(reportAction: OnyxEntry<ReportAction>): boolean {
    return reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED;
}

function isDeletedAction(reportAction: OnyxEntry<ReportAction | OptimisticIOUReportAction>): boolean {
    const message = reportAction?.message ?? [];

    // A legacy deleted comment has either an empty array or an object with html field with empty string as value
    const isLegacyDeletedComment = message.length === 0 || message[0]?.html === '';

    return isLegacyDeletedComment || !!message[0]?.deleted;
}

function isDeletedParentAction(reportAction: OnyxEntry<ReportAction>): boolean {
    return (reportAction?.message?.[0]?.isDeletedParentAction ?? false) && (reportAction?.childVisibleActionCount ?? 0) > 0;
}

function isReversedTransaction(reportAction: OnyxEntry<ReportAction | OptimisticIOUReportAction>) {
    return (reportAction?.message?.[0]?.isReversedTransaction ?? false) && ((reportAction as ReportAction)?.childVisibleActionCount ?? 0) > 0;
}

function isPendingRemove(reportAction: OnyxEntry<ReportAction> | EmptyObject): boolean {
    if (isEmptyObject(reportAction)) {
        return false;
    }
    return reportAction?.message?.[0]?.moderationDecision?.decision === CONST.MODERATION.MODERATOR_DECISION_PENDING_REMOVE;
}

function isMoneyRequestAction(reportAction: OnyxEntry<ReportAction>): reportAction is ReportAction & OriginalMessageIOU {
    return reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU;
}

function isReportPreviewAction(reportAction: OnyxEntry<ReportAction>): boolean {
    return reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORTPREVIEW;
}

function isReportActionSubmitted(reportAction: OnyxEntry<ReportAction>): boolean {
    return reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.SUBMITTED;
}

function isModifiedExpenseAction(reportAction: OnyxEntry<ReportAction> | ReportAction | Record<string, never>): boolean {
    return reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.MODIFIEDEXPENSE;
}

function isWhisperAction(reportAction: OnyxEntry<ReportAction> | EmptyObject): boolean {
    return (reportAction?.whisperedToAccountIDs ?? []).length > 0;
}

/**
 * Checks whether the report action is a whisper targeting someone other than the current user.
 */
function isWhisperActionTargetedToOthers(reportAction: OnyxEntry<ReportAction>): boolean {
    if (!isWhisperAction(reportAction)) {
        return false;
    }
    return !reportAction?.whisperedToAccountIDs?.includes(currentUserAccountID ?? 0);
}

function isReimbursementQueuedAction(reportAction: OnyxEntry<ReportAction>) {
    return reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENTQUEUED;
}

function isMemberChangeAction(reportAction: OnyxEntry<ReportAction>) {
    return (
        reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ROOMCHANGELOG.INVITE_TO_ROOM ||
        reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ROOMCHANGELOG.REMOVE_FROM_ROOM ||
        reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICYCHANGELOG.INVITE_TO_ROOM ||
        reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICYCHANGELOG.REMOVE_FROM_ROOM ||
        reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICYCHANGELOG.LEAVE_POLICY
    );
}

function isInviteMemberAction(reportAction: OnyxEntry<ReportAction>) {
    return reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ROOMCHANGELOG.INVITE_TO_ROOM || reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICYCHANGELOG.INVITE_TO_ROOM;
}

function isLeavePolicyAction(reportAction: OnyxEntry<ReportAction>) {
    return reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICYCHANGELOG.LEAVE_POLICY;
}

function isReimbursementDeQueuedAction(reportAction: OnyxEntry<ReportAction>): reportAction is ReportActionBase & OriginalMessageReimbursementDequeued {
    return reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENTDEQUEUED;
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
function getParentReportAction(report: OnyxEntry<Report> | EmptyObject): ReportAction | EmptyObject {
    if (!report?.parentReportID || !report.parentReportActionID) {
        return {};
    }
    return allReportActions?.[report.parentReportID]?.[report.parentReportActionID] ?? {};
}

/**
 * Determines if the given report action is sent money report action by checking for 'pay' type and presence of IOUDetails object.
 */
function isSentMoneyReportAction(reportAction: OnyxEntry<ReportAction | OptimisticIOUReportAction>): boolean {
    return (
        reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU &&
        (reportAction?.originalMessage as IOUMessage)?.type === CONST.IOU.REPORT_ACTION_TYPE.PAY &&
        !!(reportAction?.originalMessage as IOUMessage)?.IOUDetails
    );
}

/**
 * Returns whether the thread is a transaction thread, which is any thread with IOU parent
 * report action from requesting money (type - create) or from sending money (type - pay with IOUDetails field)
 */
function isTransactionThread(parentReportAction: OnyxEntry<ReportAction> | EmptyObject): boolean {
    return (
        parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU &&
        (parentReportAction.originalMessage.type === CONST.IOU.REPORT_ACTION_TYPE.CREATE ||
            parentReportAction.originalMessage.type === CONST.IOU.REPORT_ACTION_TYPE.TRACK ||
            (parentReportAction.originalMessage.type === CONST.IOU.REPORT_ACTION_TYPE.PAY && !!parentReportAction.originalMessage.IOUDetails))
    );
}

/**
 * Returns the reportID for the transaction thread associated with a report by iterating over the reportActions and identifying the IOU report actions with a childReportID. Returns a reportID if there is exactly one transaction thread for the report, and null otherwise.
 */
function getOneTransactionThreadReportID(reportID: string, reportActions: OnyxEntry<ReportActions> | ReportAction[]): string | null {
    // If the report is not an IOU or Expense report, it shouldn't be treated as one-transaction report.
    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    if (report?.type !== CONST.REPORT.TYPE.IOU && report?.type !== CONST.REPORT.TYPE.EXPENSE) {
        return null;
    }

    const reportActionsArray = Object.values(reportActions ?? {});

    if (!reportActionsArray.length) {
        return null;
    }

    // Get all IOU report actions for the report.
    const iouRequestTypes: Array<ValueOf<typeof CONST.IOU.REPORT_ACTION_TYPE>> = [
        CONST.IOU.REPORT_ACTION_TYPE.CREATE,
        CONST.IOU.REPORT_ACTION_TYPE.SPLIT,
        CONST.IOU.REPORT_ACTION_TYPE.PAY,
        CONST.IOU.REPORT_ACTION_TYPE.TRACK,
    ];
    const iouRequestActions = reportActionsArray.filter(
        (action) =>
            action.actionName === CONST.REPORT.ACTIONS.TYPE.IOU &&
            (iouRequestTypes.includes(action.originalMessage.type) ?? []) &&
            action.childReportID &&
            action.originalMessage.IOUTransactionID,
    );

    // If we don't have any IOU request actions, or we have more than one IOU request actions, this isn't a oneTransaction report
    if (!iouRequestActions.length || iouRequestActions.length > 1) {
        return null;
    }

    // Ensure we have a childReportID associated with the IOU report action
    return iouRequestActions[0].childReportID ?? null;
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
        // Ensure that `REPORTPREVIEW` actions always come after if they have the same timestamp as another action type
        if ((first.actionName === CONST.REPORT.ACTIONS.TYPE.REPORTPREVIEW || second.actionName === CONST.REPORT.ACTIONS.TYPE.REPORTPREVIEW) && first.actionName !== second.actionName) {
            return (first.actionName === CONST.REPORT.ACTIONS.TYPE.REPORTPREVIEW ? 1 : -1) * invertedMultiplier;
        }

        // Then fallback on reportActionID as the final sorting criteria. It is a random number,
        // but using this will ensure that the order of reportActions with the same created time and action type
        // will be consistent across all users and devices
        return (first.reportActionID < second.reportActionID ? -1 : 1) * invertedMultiplier;
    });

    return sortedActions;
}

/**
 * Returns the largest gapless range of reportActions including a the provided reportActionID, where a "gap" is defined as a reportAction's `previousReportActionID` not matching the previous reportAction in the sortedReportActions array.
 * See unit tests for example of inputs and expected outputs.
 * Note: sortedReportActions sorted in descending order
 */
function getContinuousReportActionChain(sortedReportActions: ReportAction[], id?: string): ReportAction[] {
    let index;

    if (id) {
        index = sortedReportActions.findIndex((reportAction) => reportAction.reportActionID === id);
    } else {
        index = sortedReportActions.findIndex(
            (reportAction) =>
                reportAction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD &&
                reportAction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE &&
                !reportAction.isOptimisticAction,
        );
    }

    if (index === -1) {
        // if no non-pending action is found, that means all actions on the report are optimistic
        // in this case, we'll assume the whole chain of reportActions is continuous and return it in its entirety
        return id ? [] : sortedReportActions;
    }

    let startIndex = index;
    let endIndex = index;

    // Iterate forwards through the array, starting from endIndex. This loop checks the continuity of actions by:
    // 1. Comparing the current item's previousReportActionID with the next item's reportActionID.
    //    This ensures that we are moving in a sequence of related actions from newer to older.
    while (
        (endIndex < sortedReportActions.length - 1 && sortedReportActions[endIndex].previousReportActionID === sortedReportActions[endIndex + 1].reportActionID) ||
        !!sortedReportActions[endIndex + 1]?.whisperedToAccountIDs?.length ||
        !!sortedReportActions[endIndex]?.whisperedToAccountIDs?.length ||
        sortedReportActions[endIndex]?.actionName === CONST.REPORT.ACTIONS.TYPE.ROOMCHANGELOG.INVITE_TO_ROOM ||
        sortedReportActions[endIndex + 1]?.actionName === CONST.REPORT.ACTIONS.TYPE.CLOSED ||
        sortedReportActions[endIndex + 1]?.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED
    ) {
        endIndex++;
    }

    // Iterate backwards through the sortedReportActions, starting from startIndex. This loop has two main checks:
    // 1. It compares the current item's reportActionID with the previous item's previousReportActionID.
    //    This is to ensure continuity in a sequence of actions.
    // 2. If the first condition fails, it then checks if the previous item has a pendingAction of 'add'.
    //    This additional check is to include recently sent messages that might not yet be part of the established sequence.
    while (
        (startIndex > 0 && sortedReportActions[startIndex].reportActionID === sortedReportActions[startIndex - 1].previousReportActionID) ||
        sortedReportActions[startIndex - 1]?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD ||
        sortedReportActions[startIndex - 1]?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ||
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        sortedReportActions[startIndex - 1]?.isOptimisticAction ||
        sortedReportActions[startIndex - 1]?.actionName === CONST.REPORT.ACTIONS.TYPE.ROOMCHANGELOG.INVITE_TO_ROOM
    ) {
        startIndex--;
    }

    return sortedReportActions.slice(startIndex, endIndex + 1);
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
    const iouRequestActions = reportActions?.filter((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.IOU && iouRequestTypes.includes(action.originalMessage.type)) ?? [];

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
    const htmlContent = reportAction?.message?.[0]?.html;

    // Regex to get link in href prop inside of <a/> component
    const regex = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"/gi;

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
function findPreviousAction(reportActions: ReportAction[] | null, actionIndex: number): OnyxEntry<ReportAction> {
    if (!reportActions) {
        return null;
    }

    for (let i = actionIndex + 1; i < reportActions.length; i++) {
        // Find the next non-pending deletion report action, as the pending delete action means that it is not displayed in the UI, but still is in the report actions list.
        // If we are offline, all actions are pending but shown in the UI, so we take the previous action, even if it is a delete.
        if (isNetworkOffline || reportActions[i].pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            return reportActions[i];
        }
    }

    return null;
}

/**
 * Returns true when the report action immediately before the specified index is a comment made by the same actor who who is leaving a comment in the action at the specified index.
 * Also checks to ensure that the comment is not too old to be shown as a grouped comment.
 *
 * @param actionIndex - index of the comment item in state to check
 */
function isConsecutiveActionMadeByPreviousActor(reportActions: ReportAction[] | null, actionIndex: number): boolean {
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

    if (isReportActionSubmitted(currentAction)) {
        const currentActionAdminAccountID = currentAction.adminAccountID;

        return currentActionAdminAccountID === previousAction.actorAccountID || currentActionAdminAccountID === previousAction.adminAccountID;
    }

    if (isReportActionSubmitted(previousAction)) {
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
    if (String(reportAction.sequenceNumber) === key) {
        Log.info('Front-end filtered out reportAction keyed by sequenceNumber!', false, reportAction);
        return true;
    }

    return false;
}

const {POLICYCHANGELOG: policyChangelogTypes, ROOMCHANGELOG: roomChangeLogTypes, ...otherActionTypes} = CONST.REPORT.ACTIONS.TYPE;
const supportedActionTypes: ActionName[] = [...Object.values(otherActionTypes), ...Object.values(policyChangelogTypes), ...Object.values(roomChangeLogTypes)];

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

    // Ignore markedAsReimbursed action here since we're already display message that explains the request was paid
    // elsewhere in the IOU reportAction
    if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.MARKEDREIMBURSED) {
        return false;
    }

    if (isWhisperActionTargetedToOthers(reportAction)) {
        return false;
    }

    if (isPendingRemove(reportAction) && !reportAction.childVisibleActionCount) {
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
function shouldReportActionBeVisibleAsLastAction(reportAction: OnyxEntry<ReportAction>): boolean {
    if (!reportAction) {
        return false;
    }

    if (Object.keys(reportAction.errors ?? {}).length > 0) {
        return false;
    }

    // If a whisper action is the REPORTPREVIEW action, we are displaying it.
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
    if (!reportAction?.message || !policyChangeActionsSet.has(reportAction?.actionName)) {
        return reportAction;
    }

    const updatedReportAction = _.clone(reportAction);

    if (!updatedReportAction.message) {
        return updatedReportAction;
    }

    if (updatedReportAction.message[0]) {
        updatedReportAction.message[0].html = reportAction.message?.[0]?.html?.replace('%baseURL', environmentURL);
    }

    return updatedReportAction;
}

function getLastVisibleAction(reportID: string, actionsToMerge: OnyxCollection<ReportAction> = {}): OnyxEntry<ReportAction> {
    const reportActions = Object.values(fastMerge(allReportActions?.[reportID] ?? {}, actionsToMerge ?? {}, true));
    const visibleReportActions = Object.values(reportActions ?? {}).filter((action): action is ReportAction => shouldReportActionBeVisibleAsLastAction(action));
    const sortedReportActions = getSortedReportActions(visibleReportActions, true);
    if (sortedReportActions.length === 0) {
        return null;
    }
    return sortedReportActions[0];
}

function getLastVisibleMessage(reportID: string, actionsToMerge: OnyxCollection<ReportAction> = {}, reportAction: OnyxEntry<ReportAction> | undefined = undefined): LastVisibleMessage {
    const lastVisibleAction = reportAction ?? getLastVisibleAction(reportID, actionsToMerge);
    const message = lastVisibleAction?.message?.[0];

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

    let messageText = message?.text ?? '';
    if (messageText) {
        messageText = String(messageText).replace(CONST.REGEX.LINE_BREAK, ' ').substring(0, CONST.REPORT.LAST_MESSAGE_TEXT_MAX_LENGTH).trim();
    }
    return {
        lastMessageText: messageText,
    };
}

/**
 * A helper method to filter out report actions keyed by sequenceNumbers.
 */
function filterOutDeprecatedReportActions(reportActions: ReportActions | null): ReportAction[] {
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
function getSortedReportActionsForDisplay(reportActions: ReportActions | null | ReportAction[], shouldIncludeInvisibleActions = false): ReportAction[] {
    let filteredReportActions: ReportAction[] = [];
    if (!reportActions) {
        return [];
    }

    if (shouldIncludeInvisibleActions) {
        filteredReportActions = Object.values(reportActions);
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
function getLastClosedReportAction(reportActions: ReportActions | null): OnyxEntry<ReportAction> {
    // If closed report action is not present, return early
    if (!Object.values(reportActions ?? {}).some((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.CLOSED)) {
        return null;
    }

    const filteredReportActions = filterOutDeprecatedReportActions(reportActions);
    const sortedReportActions = getSortedReportActions(filteredReportActions);
    return lodashFindLast(sortedReportActions, (action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.CLOSED) ?? null;
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
    return sortedFilterReportActions.length > 1 ? sortedFilterReportActions[sortedFilterReportActions.length - 2].reportActionID : '';
}

/**
 * @returns The latest report action in the `onyxData` or `null` if one couldn't be found
 */
function getLatestReportActionFromOnyxData(onyxData: OnyxUpdate[] | null): OnyxEntry<ReportAction> {
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
    const reportAction = typeof reportActionOrID === 'string' ? allReportActions?.[reportID ?? '']?.[reportActionOrID] : reportActionOrID;
    if (!reportAction || reportAction.actionName !== CONST.REPORT.ACTIONS.TYPE.IOU) {
        return null;
    }
    return reportAction.originalMessage?.IOUTransactionID ?? null;
}

function getReportAction(reportID: string, reportActionID: string): OnyxEntry<ReportAction> {
    return allReportActions?.[reportID]?.[reportActionID] ?? null;
}

function getMostRecentReportActionLastModified(): string {
    // Start with the oldest date possible
    let mostRecentReportActionLastModified = new Date(0).toISOString();

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
    Object.values(allReports ?? {}).forEach((report) => {
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
function getReportPreviewAction(chatReportID: string, iouReportID: string): OnyxEntry<ReportAction> {
    return (
        Object.values(allReportActions?.[chatReportID] ?? {}).find(
            (reportAction) => reportAction && reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.REPORTPREVIEW && reportAction.originalMessage.linkedReportID === iouReportID,
        ) ?? null
    );
}

/**
 * Get the iouReportID for a given report action.
 */
function getIOUReportIDFromReportActionPreview(reportAction: OnyxEntry<ReportAction>): string {
    return reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORTPREVIEW ? reportAction.originalMessage.linkedReportID : '0';
}

function isCreatedTaskReportAction(reportAction: OnyxEntry<ReportAction>): boolean {
    return reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT && !!reportAction.originalMessage?.taskReportID;
}

/**
 * A helper method to identify if the message is deleted or not.
 */
function isMessageDeleted(reportAction: OnyxEntry<ReportAction>): boolean {
    return reportAction?.message?.[0]?.isDeletedParentAction ?? false;
}

/**
 * Returns the number of money requests associated with a report preview
 */
function getNumberOfMoneyRequests(reportPreviewAction: OnyxEntry<ReportAction>): number {
    return reportPreviewAction?.childMoneyRequestCount ?? 0;
}

function isSplitBillAction(reportAction: OnyxEntry<ReportAction>): boolean {
    return reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU && reportAction.originalMessage.type === CONST.IOU.REPORT_ACTION_TYPE.SPLIT;
}

function isTrackExpenseAction(reportAction: OnyxEntry<ReportAction | OptimisticIOUReportAction>): boolean {
    return reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU && (reportAction.originalMessage as IOUMessage).type === CONST.IOU.REPORT_ACTION_TYPE.TRACK;
}

function isTaskAction(reportAction: OnyxEntry<ReportAction>): boolean {
    const reportActionName = reportAction?.actionName;
    return (
        reportActionName === CONST.REPORT.ACTIONS.TYPE.TASKCOMPLETED ||
        reportActionName === CONST.REPORT.ACTIONS.TYPE.TASKCANCELLED ||
        reportActionName === CONST.REPORT.ACTIONS.TYPE.TASKREOPENED ||
        reportActionName === CONST.REPORT.ACTIONS.TYPE.TASKEDITED
    );
}

/**
 * When we delete certain reports, we want to check whether there are any visible actions left to display.
 * If there are no visible actions left (including system messages), we can hide the report from view entirely
 */
function doesReportHaveVisibleActions(reportID: string, actionsToMerge: ReportActions = {}): boolean {
    const reportActions = Object.values(fastMerge(allReportActions?.[reportID] ?? {}, actionsToMerge, true));
    const visibleReportActions = Object.values(reportActions ?? {}).filter((action) => shouldReportActionBeVisibleAsLastAction(action));

    // Exclude the task system message and the created message
    const visibleReportActionsWithoutTaskSystemMessage = visibleReportActions.filter((action) => !isTaskAction(action) && !isCreatedAction(action));
    return visibleReportActionsWithoutTaskSystemMessage.length > 0;
}

function getAllReportActions(reportID: string): ReportActions {
    return allReportActions?.[reportID] ?? {};
}

/**
 * Check whether a report action is an attachment (a file, such as an image or a zip).
 *
 */
function isReportActionAttachment(reportAction: OnyxEntry<ReportAction>): boolean {
    const message = reportAction?.message?.[0];

    if (reportAction && ('isAttachment' in reportAction || 'attachmentInfo' in reportAction)) {
        return reportAction?.isAttachment ?? !!reportAction?.attachmentInfo ?? false;
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

    const actions: ActionName[] = [CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT, CONST.REPORT.ACTIONS.TYPE.IOU, CONST.REPORT.ACTIONS.TYPE.MODIFIEDEXPENSE];

    return actions.includes(reportAction.actionName);
}

function getMemberChangeMessageElements(reportAction: OnyxEntry<ReportAction>): readonly MemberChangeMessageElement[] {
    const isInviteAction = isInviteMemberAction(reportAction);
    const isLeaveAction = isLeavePolicyAction(reportAction);

    // Currently, we only render messages when members are invited
    let verb = Localize.translateLocal('workspace.invite.removed');
    if (isInviteAction) {
        verb = Localize.translateLocal('workspace.invite.invited');
    }

    if (isLeaveAction) {
        verb = Localize.translateLocal('workspace.invite.leftWorkspace');
    }

    const originalMessage = reportAction?.originalMessage as ChangeLog;
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
        text: reportAction?.message?.[0] ? reportAction?.message?.[0]?.text : '',
        type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
    };
}

function isOldDotReportAction(action: ReportAction): boolean {
    return [
        CONST.REPORT.ACTIONS.TYPE.CHANGEFIELD,
        CONST.REPORT.ACTIONS.TYPE.CHANGEPOLICY,
        CONST.REPORT.ACTIONS.TYPE.CHANGETYPE,
        CONST.REPORT.ACTIONS.TYPE.DELEGATESUBMIT,
        CONST.REPORT.ACTIONS.TYPE.DELETEDACCOUNT,
        CONST.REPORT.ACTIONS.TYPE.DONATION,
        CONST.REPORT.ACTIONS.TYPE.EXPORTEDTOCSV,
        CONST.REPORT.ACTIONS.TYPE.EXPORTEDTOINTEGRATION,
        CONST.REPORT.ACTIONS.TYPE.EXPORTEDTOQUICKBOOKS,
        CONST.REPORT.ACTIONS.TYPE.FORWARDED,
        CONST.REPORT.ACTIONS.TYPE.INTEGRATIONSMESSAGE,
        CONST.REPORT.ACTIONS.TYPE.MANAGERATTACHRECEIPT,
        CONST.REPORT.ACTIONS.TYPE.MANAGERDETACHRECEIPT,
        CONST.REPORT.ACTIONS.TYPE.MARKEDREIMBURSED,
        CONST.REPORT.ACTIONS.TYPE.MARKREIMBURSEDFROMINTEGRATION,
        CONST.REPORT.ACTIONS.TYPE.OUTDATEDBANKACCOUNT,
        CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENTACHBOUNCE,
        CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENTACHCANCELLED,
        CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENTACCOUNTCHANGED,
        CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENTDELAYED,
        CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENTREQUESTED,
        CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENTSETUP,
        CONST.REPORT.ACTIONS.TYPE.SELECTEDFORRANDOMAUDIT,
        CONST.REPORT.ACTIONS.TYPE.SHARE,
        CONST.REPORT.ACTIONS.TYPE.STRIPEPAID,
        CONST.REPORT.ACTIONS.TYPE.TAKECONTROL,
        CONST.REPORT.ACTIONS.TYPE.UNAPPROVED,
        CONST.REPORT.ACTIONS.TYPE.UNSHARE,
    ].some((oldDotActionName) => oldDotActionName === action.actionName);
}

/**
 * Helper method to format message of OldDot Actions.
 * For now, we just concat all of the text elements of the message to create the full message.
 */
function getMessageOfOldDotReportAction(reportAction: OnyxEntry<ReportAction>): string {
    return reportAction?.message?.map((element) => element?.text).join('') ?? '';
}

function getMemberChangeMessagePlainText(reportAction: OnyxEntry<ReportAction>): string {
    const messageElements = getMemberChangeMessageElements(reportAction);
    return messageElements.map((element) => element.content).join('');
}

/**
 * Helper method to determine if the provided accountID has made a request on the specified report.
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
 * Checks if a given report action corresponds to an actionable mention whisper.
 * @param reportAction
 */
function isActionableMentionWhisper(reportAction: OnyxEntry<ReportAction>): reportAction is ReportActionBase & OriginalMessageActionableMentionWhisper {
    return reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ACTIONABLEMENTIONWHISPER;
}

/**
 * Constructs a message for an actionable mention whisper report action.
 * @param reportAction
 * @returns the actionable mention whisper message.
 */
function getActionableMentionWhisperMessage(reportAction: OnyxEntry<ReportAction>): string {
    const originalMessage = reportAction?.originalMessage as OriginalMessageActionableMentionWhisper['originalMessage'];
    const targetAccountIDs: number[] = originalMessage?.inviteeAccountIDs ?? [];
    const personalDetails = PersonalDetailsUtils.getPersonalDetailsByIDs(targetAccountIDs, 0);
    const mentionElements = targetAccountIDs.map((accountID): string => {
        const personalDetail = personalDetails.find((personal) => personal.accountID === accountID);
        const displayName = PersonalDetailsUtils.getEffectiveDisplayName(personalDetail);
        const handleText = _.isEmpty(displayName) ? Localize.translateLocal('common.hidden') : displayName;
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

    return Boolean(reportAction && lastReadTime && reportAction.created && lastReadTime < reportAction.created);
}

/**
 * Check whether the current report action of the report is unread or not
 *
 */
function isCurrentActionUnread(report: Report | EmptyObject, reportAction: ReportAction): boolean {
    const lastReadTime = report.lastReadTime ?? '';
    const sortedReportActions = getSortedReportActions(Object.values(getAllReportActions(report.reportID)));
    const currentActionIndex = sortedReportActions.findIndex((action) => action.reportActionID === reportAction.reportActionID);
    if (currentActionIndex === -1) {
        return false;
    }
    const prevReportAction = sortedReportActions[currentActionIndex - 1];
    return isReportActionUnread(reportAction, lastReadTime) && (!prevReportAction || !isReportActionUnread(prevReportAction, lastReadTime));
}

/**
 * Checks if a given report action corresponds to a join request action.
 * @param reportAction
 */
function isActionableJoinRequest(reportAction: OnyxEntry<ReportAction>): boolean {
    return reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ACTIONABLEJOINREQUEST;
}

function isActionableTrackExpense(reportAction: OnyxEntry<ReportAction>): boolean {
    return reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ACTIONABLETRACKEXPENSEWHISPER;
}

/**
 * Checks if any report actions correspond to a join request action that is still pending.
 * @param reportID
 */
function isActionableJoinRequestPending(reportID: string): boolean {
    const sortedReportActions = getSortedReportActions(Object.values(getAllReportActions(reportID)));
    const findPendingRequest = sortedReportActions.find(
        (reportActionItem) => isActionableJoinRequest(reportActionItem) && (reportActionItem as OriginalMessageJoinPolicyChangeLog)?.originalMessage?.choice === '',
    );
    return !!findPendingRequest;
}

function isApprovedOrSubmittedReportAction(action: OnyxEntry<ReportAction> | EmptyObject) {
    return [CONST.REPORT.ACTIONS.TYPE.APPROVED, CONST.REPORT.ACTIONS.TYPE.SUBMITTED].some((type) => type === action?.actionName);
}

/**
 * Gets the text version of the message in a report action
 */
function getReportActionMessageText(reportAction: OnyxEntry<ReportAction> | EmptyObject): string {
    return reportAction?.message?.reduce((acc, curr) => `${acc}${curr?.text}`, '') ?? '';
}

export {
    extractLinksFromMessageHtml,
    getOneTransactionThreadReportID,
    getIOUReportIDFromReportActionPreview,
    getLastClosedReportAction,
    getLastVisibleAction,
    getLastVisibleMessage,
    getLatestReportActionFromOnyxData,
    getLinkedTransactionID,
    getMostRecentIOURequestActionID,
    getMostRecentReportActionLastModified,
    getNumberOfMoneyRequests,
    getParentReportAction,
    getReportAction,
    getReportActionMessageText,
    isApprovedOrSubmittedReportAction,
    getReportPreviewAction,
    getSortedReportActions,
    getSortedReportActionsForDisplay,
    isConsecutiveActionMadeByPreviousActor,
    isCreatedAction,
    isCreatedTaskReportAction,
    isDeletedAction,
    isDeletedParentAction,
    isMessageDeleted,
    isModifiedExpenseAction,
    isMoneyRequestAction,
    isNotifiableReportAction,
    isPendingRemove,
    isReversedTransaction,
    isReportActionAttachment,
    isReportActionDeprecated,
    isReportPreviewAction,
    isSentMoneyReportAction,
    isSplitBillAction,
    isTrackExpenseAction,
    isTaskAction,
    doesReportHaveVisibleActions,
    isThreadParentMessage,
    isTransactionThread,
    isWhisperAction,
    isWhisperActionTargetedToOthers,
    isReimbursementQueuedAction,
    shouldReportActionBeVisible,
    shouldHideNewMarker,
    shouldReportActionBeVisibleAsLastAction,
    getContinuousReportActionChain,
    hasRequestFromCurrentAccount,
    getFirstVisibleReportActionID,
    isMemberChangeAction,
    getMemberChangeMessageFragment,
    isOldDotReportAction,
    getMessageOfOldDotReportAction,
    getMemberChangeMessagePlainText,
    isReimbursementDeQueuedAction,
    isActionableMentionWhisper,
    getActionableMentionWhisperMessage,
    isCurrentActionUnread,
    isActionableJoinRequest,
    isActionableJoinRequestPending,
    isActionableTrackExpense,
};

export type {LastVisibleMessage};
