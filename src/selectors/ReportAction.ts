import lodashFindLast from 'lodash/findLast';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {filterOutDeprecatedReportActions, getLinkedTransactionID, getSortedReportActions, isActionOfType} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, ReportActions} from '@src/types/onyx';

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

/**
 * Selector that filters a report actions collection to only include actions for the specified report IDs.
 */
function getReportActionsForReportIDs(allReportActions: OnyxCollection<ReportActions>, reportIDs: string[]): OnyxCollection<ReportActions> {
    if (!allReportActions || reportIDs.length === 0) {
        return {};
    }
    const filteredReportActions: OnyxCollection<ReportActions> = {};
    for (const reportID of reportIDs) {
        const key = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`;
        filteredReportActions[key] = allReportActions[key];
    }
    return filteredReportActions;
}

function getReportActionByIDSelector(reportActions: OnyxEntry<ReportActions>, reportActionID?: string): OnyxEntry<ReportAction> {
    if (!reportActions || !reportActionID) {
        return;
    }
    return reportActions[reportActionID];
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

export {getParentReportActionSelector, getLastClosedReportAction, getReportActionsForReportIDs, getReportActionByIDSelector, getReceiptScanFailedIOUActionDataSelector};
