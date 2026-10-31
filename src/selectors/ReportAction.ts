import {
    filterOutDeprecatedReportActions,
    getIOUActionForTransactionID,
    getLatestConciergeFeedbackActionIDFromReportActions,
    getLinkedTransactionID,
    getOriginalMessage,
    getSortedReportActions,
    isActionOfType,
} from '@libs/ReportActionsUtils';
import {hasReportBeenForwardedSinceLastSubmit} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, ReportActions} from '@src/types/onyx';
import type {VisibleReportActionsDerivedValue} from '@src/types/onyx/DerivedValues';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import lodashFindLast from 'lodash/findLast';

type NewestReportAction = Pick<ReportAction, 'reportActionID' | 'actorAccountID' | 'actionName'>;

/**
 * Scopes VISIBLE_REPORT_ACTIONS to one report, pre-wrapped in the `{[reportID]: slice}` shape
 * `isReportActionVisible` expects. Built here (not inline in the hook) so the consumer has no computed-key
 * literal, which the React Compiler won't memoize; `useOnyx` returns a stable ref while the slice is unchanged.
 */
const reportVisibleActionsSelector = (reportID: string | undefined) => (data: VisibleReportActionsDerivedValue | undefined) =>
    reportID && data?.[reportID] ? {[reportID]: data[reportID]} : undefined;

function getParentReportActionSelector(parentReportActions: OnyxEntry<ReportActions>, parentReportActionID?: string): OnyxEntry<ReportAction> {
    if (!parentReportActions || !parentReportActionID) {
        return;
    }
    return parentReportActions[parentReportActionID];
}

/**
 * In some cases, there can be multiple closed report actions in a chat report.
 * This method returns the last closed report action so we can always show the correct archived report reason.
 * Additionally, archived #admins and #announce do not have the closed report action so we will return null if none is found.
 *
 */
function getLastClosedReportAction(reportActions: OnyxEntry<ReportActions>): OnyxEntry<ReportAction> {
    // If closed report action is not present, return early
    if (
        !Object.values(reportActions ?? {}).some((action) => {
            return action?.actionName === CONST.REPORT.ACTIONS.TYPE.CLOSED;
        })
    ) {
        return undefined;
    }

    const filteredReportActions = filterOutDeprecatedReportActions(reportActions);
    const sortedReportActions = getSortedReportActions(filteredReportActions);
    return lodashFindLast(sortedReportActions, (action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.CLOSED);
}

function getReportActionByIDSelector(reportActions: OnyxEntry<ReportActions>, reportActionID?: string): OnyxEntry<ReportAction> {
    if (!reportActions || !reportActionID) {
        return;
    }
    return reportActions[reportActionID];
}

function getReimbursedExpectedDateSelector(reportActions: OnyxEntry<ReportActions>, paymentCreated: string): string | undefined {
    let latestReimbursedAction: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSED> | undefined;
    for (const reportAction of Object.values(reportActions ?? {})) {
        if (!isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.REIMBURSED) || reportAction.created > paymentCreated) {
            continue;
        }
        if (!latestReimbursedAction || reportAction.created > latestReimbursedAction.created) {
            latestReimbursedAction = reportAction;
        }
    }
    return getOriginalMessage(latestReimbursedAction)?.expectedDate;
}

/**
 * Selector that extracts the newest report action's identifying fields.
 *
 * Sorts by `created` timestamp (ISO strings compare chronologically), with reportActionID as a
 * tiebreaker. reportActionID alone is unreliable because optimistic actions use random IDs, so
 * a purely numeric comparison can rank them ahead of real server actions.
 */
function getNewestReportActionSelector(reportActions: OnyxEntry<ReportActions>): NewestReportAction | undefined {
    const actions = Object.values(reportActions ?? {}).filter(Boolean);
    if (actions.length === 0) {
        return undefined;
    }
    const newest = actions.reduce((a, b) => {
        const createdA = a.created ?? '';
        const createdB = b.created ?? '';
        if (createdA !== createdB) {
            return createdA > createdB ? a : b;
        }
        return a.reportActionID > b.reportActionID ? a : b;
    });

    return {
        reportActionID: newest.reportActionID,
        actorAccountID: newest.actorAccountID,
        actionName: newest.actionName,
    };
}

/**
 * Finds the IOU action associated with a RECEIPT_SCAN_FAILED report action.
 * Prefer parentReportActionID (specific IOU action when `report` is a transaction thread).
 * Fall back to childReportID match, then to the only IOU action for one-transaction reports.
 */
function findIOUActionForReceiptScanFailed(
    reportActions: OnyxEntry<ReportActions>,
    isIOUReport: boolean,
    parentReportActionID: string | undefined,
    actionReportID: string | undefined,
): OnyxEntry<ReportAction> {
    if (!isIOUReport && parentReportActionID) {
        const candidate = reportActions?.[parentReportActionID];
        if (isActionOfType(candidate, CONST.REPORT.ACTIONS.TYPE.IOU)) {
            return candidate;
        }
    }
    const IOUActions = Object.values(reportActions ?? {}).filter((action): action is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> =>
        isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.IOU),
    );
    if (actionReportID) {
        const match = IOUActions.find((action) => action.childReportID === actionReportID);
        if (match) {
            return match;
        }
    }
    return IOUActions.length === 1 ? IOUActions.at(0) : undefined;
}

/** Resolves the IOU action for a RECEIPT_SCAN_FAILED message and returns only the primitive fields the UI needs. */
function getReceiptScanFailedIOUActionDataSelector(
    reportActions: OnyxEntry<ReportActions>,
    isIOUReport: boolean,
    parentReportActionID: string | undefined,
    actionReportID: string | undefined,
): {transactionID: string | undefined; actorAccountID: number | undefined} {
    const IOUAction = findIOUActionForReceiptScanFailed(reportActions, isIOUReport, parentReportActionID, actionReportID);

    return {
        transactionID: getLinkedTransactionID(IOUAction),
        actorAccountID: IOUAction?.actorAccountID,
    };
}

/** Returns the transaction thread reportID (childReportID of the transaction's IOU action) from the expense report's actions. */
const transactionThreadReportIDSelector = (transactionID: string | undefined) => (reportActions: OnyxEntry<ReportActions>) =>
    transactionID ? getIOUActionForTransactionID(Object.values(reportActions ?? {}), transactionID)?.childReportID : undefined;

/**
 * Keeps only the fields `clearAllRelatedReportActionErrors` reads when walking related report actions.
 * Nested fields (`errors`, `message`, `originalMessage`) are copied by reference so equality checks on the
 * projected result short-circuit and unrelated action updates (reactions, read receipts, person data, ...)
 * neither re-render the subscriber nor pay a deep comparison.
 */
function reportActionErrorFieldsSelector(reportAction: OnyxEntry<ReportAction>): OnyxEntry<ReportAction> {
    return (
        reportAction && {
            reportActionID: reportAction.reportActionID,
            actionName: reportAction.actionName,
            created: reportAction.created,
            pendingAction: reportAction.pendingAction,
            isOptimisticAction: reportAction.isOptimisticAction,
            childReportID: reportAction.childReportID,
            errors: reportAction.errors,
            message: reportAction.message,
            // Copying the deprecated originalMessage field is intentional. The projection must preserve the raw
            // data so downstream helpers can resolve it through getOriginalMessage.
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            originalMessage: reportAction.originalMessage,
        }
    );
}

function projectReportActionsErrorFields(actions: ReportActions): ReportActions {
    const projectedActions: ReportActions = {};
    for (const [reportActionID, reportAction] of Object.entries(actions)) {
        const projectedAction = reportActionErrorFieldsSelector(reportAction);
        if (projectedAction) {
            projectedActions[reportActionID] = projectedAction;
        }
    }
    return projectedActions;
}

/**
 * Creates a selector returning the report actions `clearAllRelatedReportActionErrors` walks, narrowed to the fields it
 * reads: the actions of every report in `reportIDs` (the report whose error is dismissed, its ancestors and the original
 * report holding the dismissed action), plus the threads below `childRootReportID` that hang off actions with errors.
 * The walk returns early from an action without errors, so following only errored actions downward is exact.
 * Only those keys are looked up, so a write to an unrelated report action neither maps the whole collection nor pays
 * a deep comparison over it.
 */
function relatedReportActionsErrorFieldsSelector(reportIDs: Array<string | undefined>, childRootReportID: string | undefined) {
    return function selectRelatedReportActionsErrorFields(reportActions: OnyxCollection<ReportActions>): OnyxCollection<ReportActions> {
        const result: OnyxCollection<ReportActions> = {};
        const visitedReportIDs = new Set<string>();
        const collect = (reportID: string | undefined, shouldFollowErroredThreads: boolean) => {
            // The visited set also terminates the walk when thread links form a cycle
            if (!reportID || visitedReportIDs.has(reportID)) {
                return;
            }
            visitedReportIDs.add(reportID);
            const actions = reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`];
            if (!actions) {
                return;
            }
            result[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`] = projectReportActionsErrorFields(actions);
            if (!shouldFollowErroredThreads) {
                return;
            }
            for (const action of Object.values(actions)) {
                if (action.childReportID && Object.keys(action.errors ?? {}).length > 0) {
                    collect(action.childReportID, true);
                }
            }
        };
        // The child root is usually also one of `reportIDs`, so descend from it before the plain lookups mark it visited
        collect(childRootReportID, true);
        for (const reportID of reportIDs) {
            collect(reportID, false);
        }
        return result;
    };
}

/** Returns the ID of the author's newest comment in the report that can show the feedback prompt. */
const getLatestFeedbackActionIDByAuthorSelector = (authorAccountID: number | undefined) => (reportActions: OnyxEntry<ReportActions>) =>
    authorAccountID ? getLatestConciergeFeedbackActionIDFromReportActions(reportActions, authorAccountID) : undefined;

// IDs of reports forwarded since their last submit, so re-renders only happen on a yes/no flip per report.
function forwardedSinceLastSubmitReportIDsSelector(allReportActions: OnyxCollection<ReportActions>): Record<string, true> | undefined {
    if (!allReportActions) {
        return undefined;
    }

    const result: Record<string, true> = {};
    for (const key of Object.keys(allReportActions)) {
        const reportID = key.slice(ONYXKEYS.COLLECTION.REPORT_ACTIONS.length);
        if (hasReportBeenForwardedSinceLastSubmit({reportID}, allReportActions[key] ?? {})) {
            result[reportID] = true;
        }
    }
    return result;
}

type ThreadReplyCounterFields = 'childVisibleActionCount' | 'childCommenterCount' | 'childLastVisibleActionCreated' | 'childOldestFourAccountIDs';

type ReportActionWithoutThreadReplyCounters = Omit<ReportAction, ThreadReplyCounterFields>;

/** Strips the reply counters, which change on every reply in the thread, so components that only show the parent message don't re-render for each reply. */
function getParentReportActionWithoutThreadRepliesSelector(parentReportActions: OnyxEntry<ReportActions>, parentReportActionID?: string): ReportActionWithoutThreadReplyCounters | undefined {
    const parentReportAction = getParentReportActionSelector(parentReportActions, parentReportActionID);
    if (!parentReportAction) {
        return undefined;
    }
    const {childVisibleActionCount, childCommenterCount, childLastVisibleActionCreated, childOldestFourAccountIDs, ...parentReportActionWithoutThreadReplies} = parentReportAction;
    return parentReportActionWithoutThreadReplies;
}

export {
    getLatestFeedbackActionIDByAuthorSelector,
    getParentReportActionSelector,
    getLastClosedReportAction,
    getNewestReportActionSelector,
    getReimbursedExpectedDateSelector,
    getReportActionByIDSelector,
    getReceiptScanFailedIOUActionDataSelector,
    reportVisibleActionsSelector,
    relatedReportActionsErrorFieldsSelector,
    forwardedSinceLastSubmitReportIDsSelector,
    transactionThreadReportIDSelector,
    getParentReportActionWithoutThreadRepliesSelector,
};
export type {NewestReportAction, ReportActionWithoutThreadReplyCounters};
