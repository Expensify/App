/**
 * Builds the Onyx updates that retire the optimistic report created for scan-failed expenses on payment, and points
 * navigation, the moved transactions and their threads at the report the backend created for them instead.
 */
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import type {NavigationRoute} from '@libs/Navigation/types';
import {getAllReportActions, getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import {getAllReports} from '.';

/** Every key this reconciliation writes to, so the updates it builds are checked against the real Onyx value types. */
type ReconciliationUpdate = OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.TRANSACTION>;

const REPORT_ID_ROUTE_SEGMENTS = ['r', 'e', 'search/r', 'search/view'];

function escapeForRegExp(value: string): string {
    return value.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Swaps a report ID inside a route path, matching only a whole `<report route segment>/<reportID>` pair. The leading
 * slash is optional because the `ROUTES` helpers build paths without one while `Navigation.getActiveRoute` returns
 * them with one. A plain substring swap would also corrupt a longer ID that merely starts with the same digits.
 */
function replaceReportIDInPath(path: string, oldReportID: string, newReportID: string): string {
    const pattern = new RegExp(`(^|/)(${REPORT_ID_ROUTE_SEGMENTS.map(escapeForRegExp).join('|')})/${escapeForRegExp(oldReportID)}(?=$|[/?#])`, 'g');
    return path.replaceAll(pattern, `$1$2/${newReportID}`);
}

/**
 * Points every route that still references the report at `oldReportID`, through its own `reportID` param or through an
 * encoded `backTo`, at `newReportID`. Patching only the focused route is not enough: with an RHP open, the report
 * screen underneath keeps the stale ID and renders the not-found page once the RHP is dismissed.
 */
function pointRoutesToReport(routes: NavigationRoute[], oldReportID: string, newReportID: string) {
    for (const route of routes) {
        const params: unknown = route.params;
        const hasParams = !!params && typeof params === 'object';
        const routeReportID = hasParams && 'reportID' in params && typeof params.reportID === 'string' ? params.reportID : undefined;
        const routeBackTo = hasParams && 'backTo' in params && typeof params.backTo === 'string' ? params.backTo : undefined;

        const updatedParams: {reportID?: string; backTo?: string} = {};
        if (routeReportID === oldReportID) {
            updatedParams.reportID = newReportID;
        }
        if (routeBackTo) {
            const updatedBackTo = replaceReportIDInPath(routeBackTo, oldReportID, newReportID);
            if (updatedBackTo !== routeBackTo) {
                updatedParams.backTo = updatedBackTo;
            }
        }

        if (!isEmptyObject(updatedParams) && route.key) {
            Navigation.setParams(updatedParams, route.key);
        }

        if (route.state?.routes) {
            pointRoutesToReport(route.state.routes, oldReportID, newReportID);
        }
    }
}

/** The expenses the client optimistically moved into `optimisticReportID`, read back from the actions it created there. */
function getMovedScanFailedTransactionIDs(optimisticReportID: string): Set<string> {
    const transactionIDs = new Set<string>();
    for (const reportAction of Object.values(getAllReportActions(optimisticReportID))) {
        if (!isMoneyRequestAction(reportAction)) {
            continue;
        }
        const transactionID = getOriginalMessage(reportAction)?.IOUTransactionID;
        if (transactionID) {
            transactionIDs.add(transactionID);
        }
    }
    return transactionIDs;
}

function getTransactionThreadsByParentActionID(allReports: Record<string, Report | undefined>, optimisticReportID: string): Map<string, string> {
    const threadIDByParentActionID = new Map<string, string>();
    for (const report of Object.values(allReports)) {
        if (report?.parentReportID !== optimisticReportID || !report.parentReportActionID || !report.reportID) {
            continue;
        }
        threadIDByParentActionID.set(report.parentReportActionID, report.reportID);
    }
    return threadIDByParentActionID;
}

/**
 * Builds the Onyx updates that retire the optimistic report created for scan-failed expenses on payment, once the
 * backend has answered with the report it actually created for them.
 *
 * The backend does not reuse `optimisticHoldReportID` for this split, so the optimistic report has to go, but it must
 * never be dropped from under the user. Every route showing it is pointed at `realReportID` first, and the moved
 * expenses, their transaction threads and the workspace chat follow it, so nothing is left pointing at a report that
 * no longer exists. Callers only reach this once the backend report is known. Guessing a destination would strand the
 * user on the wrong report.
 *
 * `hasResponseValue` tells whether the response already carries a field for a key. Whatever the backend sent wins,
 * because these updates ride in `successData` and are merged on top of the response.
 *
 * Returns the updates to apply alongside the response rather than writing them, so the swap lands in the same Onyx
 * transaction as the backend data and the user never observes an in-between state.
 */
function reconcileMovedScanFailedReport(
    optimisticReportID: string,
    realReportID: string,
    realActionIDByTransactionID: Map<string, string>,
    hasResponseValue: (key: string, field: string) => boolean = () => false,
): ReconciliationUpdate[] {
    const allReports = getAllReports();
    const optimisticReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`];
    if (!optimisticReport) {
        return [];
    }

    const chatReportID = optimisticReport.parentReportID;
    const reportPreviewActionID = optimisticReport.parentReportActionID;

    const updates: ReconciliationUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticReportID}`,
            value: null,
        },
    ];

    if (chatReportID && reportPreviewActionID) {
        updates.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`,
            value: {[reportPreviewActionID]: null},
        });
    }

    const chatReportKey = `${ONYXKEYS.COLLECTION.REPORT}${chatReportID}` as const;
    const isChatPointingAtOptimisticReport = allReports?.[chatReportKey]?.iouReportID === optimisticReportID;
    if (chatReportID && isChatPointingAtOptimisticReport && !hasResponseValue(chatReportKey, 'iouReportID')) {
        updates.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: chatReportKey,
            value: {iouReportID: realReportID},
        });
    }

    const threadIDByParentActionID = getTransactionThreadsByParentActionID(allReports ?? {}, optimisticReportID);
    for (const optimisticAction of Object.values(getAllReportActions(optimisticReportID))) {
        if (!isMoneyRequestAction(optimisticAction)) {
            continue;
        }
        const transactionID = getOriginalMessage(optimisticAction)?.IOUTransactionID;
        const threadReportID = threadIDByParentActionID.get(optimisticAction.reportActionID);
        const transactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}` as const;
        if (transactionID && !hasResponseValue(transactionKey, 'reportID')) {
            updates.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: transactionKey,
                value: {reportID: realReportID},
            });
        }

        // The response does not always carry the backend report's actions. Without them the thread keeps its own data
        // and is re-parented by the backend on the next fetch.
        const realReportActionID = transactionID ? realActionIDByTransactionID.get(transactionID) : undefined;
        if (!threadReportID || !realReportActionID) {
            continue;
        }

        updates.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${threadReportID}`,
                value: {parentReportID: realReportID, parentReportActionID: realReportActionID, chatReportID: realReportID},
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${realReportID}`,
                value: {[realReportActionID]: {childReportID: threadReportID}},
            },
        );
    }

    if (navigationRef.isReady()) {
        pointRoutesToReport(navigationRef.getRootState()?.routes ?? [], optimisticReportID, realReportID);
    }

    return updates;
}

export default reconcileMovedScanFailedReport;
export {getMovedScanFailedTransactionIDs, replaceReportIDInPath};
