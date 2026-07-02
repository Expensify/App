import lodashFindLast from 'lodash/findLast';
import type {OnyxEntry} from 'react-native-onyx';
import {filterOutDeprecatedReportActions, getLinkedTransactionID, getSortedReportActions, isActionOfType} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import type {ReportAction, ReportActions} from '@src/types/onyx';
import type {VisibleReportActionsDerivedValue} from '@src/types/onyx/DerivedValues';

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

export {
    getParentReportActionSelector,
    getLastClosedReportAction,
    getNewestReportActionSelector,
    getReportActionByIDSelector,
    getReceiptScanFailedIOUActionDataSelector,
    reportVisibleActionsSelector,
};
export type {NewestReportAction};
