import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import type {NavigationRoute} from '@libs/Navigation/types';
import {getAllReportActions, getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import Onyx from 'react-native-onyx';

import {getAllReports} from '.';

const REPORT_ID_ROUTE_PREFIXES = ['/r/', '/search/view/'];

function escapeForRegExp(value: string): string {
    return value.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Swaps a report ID inside a route path, matching only whole `/r/<reportID>` and `/search/view/<reportID>` segments.
 * A plain substring swap would also corrupt a longer ID that merely starts with the same digits.
 */
function replaceReportIDInPath(path: string, oldReportID: string, newReportID: string): string {
    const pattern = new RegExp(`(${REPORT_ID_ROUTE_PREFIXES.map(escapeForRegExp).join('|')})${escapeForRegExp(oldReportID)}(?=$|[/?#])`, 'g');
    return path.replaceAll(pattern, `$1${newReportID}`);
}

/**
 * Points every route that still references the report at `oldReportID` — through its own `reportID` param or through
 * an encoded `backTo` — at `newReportID`. Patching only the focused route is not enough: with an RHP open, the report
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
 * The backend does not reuse `optimisticHoldReportID` for this split, so the optimistic report has to go — but it must
 * never be dropped from under the user. Every route showing it is pointed at `realReportID` first, and each expense's
 * transaction thread is re-parented onto the backend report action so the open expense keeps resolving. Callers only
 * reach this once the backend report is known; guessing a destination would strand the user on the wrong report.
 *
 * Returns the updates to apply alongside the response rather than writing them, so the swap lands in the same Onyx
 * transaction as the backend data and the user never observes an in-between state.
 */
function reconcileMovedScanFailedReport(optimisticReportID: string, realReportID: string, realActionIDByTransactionID: Map<string, string>): AnyOnyxUpdate[] {
    const allReports = getAllReports();
    const optimisticReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`];
    if (!optimisticReport) {
        return [];
    }

    const chatReportID = optimisticReport.parentReportID;
    const reportPreviewActionID = optimisticReport.parentReportActionID;

    const updates: AnyOnyxUpdate[] = [
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

    const threadIDByParentActionID = getTransactionThreadsByParentActionID(allReports ?? {}, optimisticReportID);
    for (const optimisticAction of Object.values(getAllReportActions(optimisticReportID))) {
        if (!isMoneyRequestAction(optimisticAction)) {
            continue;
        }
        const transactionID = getOriginalMessage(optimisticAction)?.IOUTransactionID;
        const threadReportID = threadIDByParentActionID.get(optimisticAction.reportActionID);
        // The response does not always carry the backend report's actions; without them the thread keeps its own data
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
