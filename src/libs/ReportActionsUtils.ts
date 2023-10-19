import {isEqual, max, parseISO} from 'date-fns';
import _ from 'lodash';
import lodashFindLast from 'lodash/findLast';
import Onyx, {OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import {ValueOf} from 'type-fest';
import CONST from '../CONST';
import ONYXKEYS from '../ONYXKEYS';
import ReportAction, {ReportActions} from '../types/onyx/ReportAction';
import Report from '../types/onyx/Report';
import {ActionName} from '../types/onyx/OriginalMessage';
import * as CollectionUtils from './CollectionUtils';
import Log from './Log';
import isReportMessageAttachment from './isReportMessageAttachment';
import * as Environment from './Environment/Environment';

type LastVisibleMessage = {
    lastMessageTranslationKey?: string;
    lastMessageText: string;
    lastMessageHtml?: string;
};

const allReports: OnyxCollection<Report> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    callback: (report, key) => {
        if (!key || !report) {
            return;
        }

        const reportID = CollectionUtils.extractCollectionItemID(key);
        allReports[reportID] = report;
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

let environmentURL: string;
Environment.getEnvironmentURL().then((url: string) => (environmentURL = url));

function isCreatedAction(reportAction: OnyxEntry<ReportAction>): boolean {
    return reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED;
}

function isDeletedAction(reportAction: OnyxEntry<ReportAction>): boolean {
    // A deleted comment has either an empty array or an object with html field with empty string as value
    const message = reportAction?.message ?? [];
    return message.length === 0 || message[0]?.html === '';
}

function isDeletedParentAction(reportAction: OnyxEntry<ReportAction>): boolean {
    return (reportAction?.message?.[0]?.isDeletedParentAction ?? false) && (reportAction?.childVisibleActionCount ?? 0) > 0;
}

function isReversedTransaction(reportAction: OnyxEntry<ReportAction>) {
    return (reportAction?.message?.[0].isReversedTransaction ?? false) && (reportAction?.childVisibleActionCount ?? 0) > 0;
}

function isPendingRemove(reportAction: OnyxEntry<ReportAction>): boolean {
    return reportAction?.message?.[0]?.moderationDecision?.decision === CONST.MODERATION.MODERATOR_DECISION_PENDING_REMOVE;
}

function isMoneyRequestAction(reportAction: OnyxEntry<ReportAction>): boolean {
    return reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU;
}

function isReportPreviewAction(reportAction: OnyxEntry<ReportAction>): boolean {
    return reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORTPREVIEW;
}

function isModifiedExpenseAction(reportAction: OnyxEntry<ReportAction>): boolean {
    return reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.MODIFIEDEXPENSE;
}

function isWhisperAction(reportAction: OnyxEntry<ReportAction>): boolean {
    return (reportAction?.whisperedToAccountIDs ?? []).length > 0;
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
function getParentReportAction(report: OnyxEntry<Report>, allReportActionsParam?: OnyxCollection<ReportActions>): ReportAction | Record<string, never> {
    if (!report?.parentReportID || !report.parentReportActionID) {
        return {};
    }
    return (allReportActionsParam ?? allReportActions)?.[report.parentReportID]?.[report.parentReportActionID] ?? {};
}

/**
 * Determines if the given report action is sent money report action by checking for 'pay' type and presence of IOUDetails object.
 */
function isSentMoneyReportAction(reportAction: OnyxEntry<ReportAction>): boolean {
    return (
        reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU && reportAction?.originalMessage?.type === CONST.IOU.REPORT_ACTION_TYPE.PAY && !!reportAction?.originalMessage?.IOUDetails
    );
}

/**
 * Returns whether the thread is a transaction thread, which is any thread with IOU parent
 * report action from requesting money (type - create) or from sending money (type - pay with IOUDetails field)
 */
function isTransactionThread(parentReportAction: OnyxEntry<ReportAction>): boolean {
    return (
        parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU &&
        (parentReportAction.originalMessage.type === CONST.IOU.REPORT_ACTION_TYPE.CREATE ||
            (parentReportAction.originalMessage.type === CONST.IOU.REPORT_ACTION_TYPE.PAY && !!parentReportAction.originalMessage.IOUDetails))
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

    return reportActions.filter(Boolean).sort((first, second) => {
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
}

/**
 * Finds most recent IOU request action ID.
 */
function getMostRecentIOURequestActionID(reportActions: ReportAction[] | null): string | null {
    const iouRequestTypes: Array<ValueOf<typeof CONST.IOU.REPORT_ACTION_TYPE>> = [CONST.IOU.REPORT_ACTION_TYPE.CREATE, CONST.IOU.REPORT_ACTION_TYPE.SPLIT];
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

    return currentAction.actorAccountID === previousAction.actorAccountID;
}

/**
 * Checks if a reportAction is deprecated.
 */
function isReportActionDeprecated(reportAction: OnyxEntry<ReportAction>, key: string): boolean {
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

/**
 * Checks if a reportAction is fit for display, meaning that it's not deprecated, is of a valid
 * and supported type, it's not deleted and also not closed.
 */
function shouldReportActionBeVisible(reportAction: OnyxEntry<ReportAction>, key: string): boolean {
    if (!reportAction) {
        return false;
    }

    if (isReportActionDeprecated(reportAction, key)) {
        return false;
    }

    if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.TASKEDITED) {
        return false;
    }

    const {POLICYCHANGELOG: policyChangelogTypes, ROOMCHANGELOG: roomChangeLogTypes, ...otherActionTypes} = CONST.REPORT.ACTIONS.TYPE;
    const supportedActionTypes: ActionName[] = [...Object.values(otherActionTypes), ...Object.values(policyChangelogTypes), ...Object.values(roomChangeLogTypes)];

    // Filter out any unsupported reportAction types
    if (!supportedActionTypes.includes(reportAction.actionName)) {
        return false;
    }

    // Ignore closed action here since we're already displaying a footer that explains why the report was closed
    if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CLOSED) {
        return false;
    }

    if (isPendingRemove(reportAction)) {
        return false;
    }

    // All other actions are displayed except thread parents, deleted, or non-pending actions
    const isDeleted = isDeletedAction(reportAction);
    const isPending = !!reportAction.pendingAction;
    return !isDeleted || isPending || isDeletedParentAction(reportAction) || isReversedTransaction(reportAction);
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
 * For invite to room and remove from room policy change logs, report URLs are generated in the server,
 * which includes a baseURL placeholder that's replaced in the client.
 */
function replaceBaseURL(reportAction: ReportAction): ReportAction {
    if (!reportAction) {
        return reportAction;
    }

    if (
        !reportAction ||
        (reportAction.actionName !== CONST.REPORT.ACTIONS.TYPE.POLICYCHANGELOG.INVITE_TO_ROOM && reportAction.actionName !== CONST.REPORT.ACTIONS.TYPE.POLICYCHANGELOG.REMOVE_FROM_ROOM)
    ) {
        return reportAction;
    }
    if (!reportAction.message) {
        return reportAction;
    }
    const updatedReportAction = _.clone(reportAction);
    if (!updatedReportAction.message) {
        return updatedReportAction;
    }
    updatedReportAction.message[0].html = reportAction.message[0].html.replace('%baseURL', environmentURL);
    return updatedReportAction;
}

/**
 */
function getLastVisibleAction(reportID: string, actionsToMerge: ReportActions = {}): OnyxEntry<ReportAction> {
    const updatedActionsToMerge: ReportActions = {};
    if (actionsToMerge && Object.keys(actionsToMerge).length !== 0) {
        Object.keys(actionsToMerge).forEach(
            (actionToMergeID) => (updatedActionsToMerge[actionToMergeID] = {...allReportActions?.[reportID]?.[actionToMergeID], ...actionsToMerge[actionToMergeID]}),
        );
    }
    const actions = Object.values({
        ...allReportActions?.[reportID],
        ...updatedActionsToMerge,
    });
    const visibleActions = actions.filter((action) => shouldReportActionBeVisibleAsLastAction(action));

    if (visibleActions.length === 0) {
        return null;
    }
    const maxDate = max(visibleActions.map((action) => parseISO(action.created)));
    const maxAction = visibleActions.find((action) => isEqual(parseISO(action.created), maxDate));
    return maxAction ?? null;
}

function getLastVisibleMessage(reportID: string, actionsToMerge: ReportActions = {}): LastVisibleMessage {
    const lastVisibleAction = getLastVisibleAction(reportID, actionsToMerge);
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

    const messageText = message?.text ?? '';
    return {
        lastMessageText: String(messageText).replace(CONST.REGEX.AFTER_FIRST_LINE_BREAK, '').substring(0, CONST.REPORT.LAST_MESSAGE_TEXT_MAX_LENGTH).trim(),
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
function getSortedReportActionsForDisplay(reportActions: ReportActions | null): ReportAction[] {
    const filteredReportActions = Object.entries(reportActions ?? {})
        .filter(([key, reportAction]) => shouldReportActionBeVisible(reportAction, key))
        .map((entry) => entry[1]);
    const baseURLAdjustedReportActions = filteredReportActions.map((reportAction) => replaceBaseURL(reportAction));
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
function getLinkedTransactionID(reportID: string, reportActionID: string): string | null {
    const reportAction = allReportActions?.[reportID]?.[reportActionID];
    if (!reportAction || reportAction.actionName !== CONST.REPORT.ACTIONS.TYPE.IOU) {
        return null;
    }
    return reportAction.originalMessage.IOUTransactionID ?? null;
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
    return reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORTPREVIEW ? reportAction.originalMessage.linkedReportID : '';
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

function isTaskAction(reportAction: OnyxEntry<ReportAction>): boolean {
    const reportActionName = reportAction?.actionName;
    return (
        reportActionName === CONST.REPORT.ACTIONS.TYPE.TASKCOMPLETED ||
        reportActionName === CONST.REPORT.ACTIONS.TYPE.TASKCANCELLED ||
        reportActionName === CONST.REPORT.ACTIONS.TYPE.TASKREOPENED
    );
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

    if (reportAction && 'isAttachment' in reportAction) {
        return reportAction.isAttachment ?? false;
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

export {
    extractLinksFromMessageHtml,
    getAllReportActions,
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
    isTaskAction,
    isThreadParentMessage,
    isTransactionThread,
    isWhisperAction,
    shouldReportActionBeVisible,
    shouldReportActionBeVisibleAsLastAction,
};
