import {WRITE_COMMANDS} from '@libs/API/types';
import type {Middleware} from '@libs/Request';

import reconcileMovedScanFailedReport, {getMovedScanFailedTransactionIDs} from '@userActions/IOU/reconcileMovedScanFailedReport';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';

import type {OnyxKey} from 'react-native-onyx';

/** The shape of a response update this middleware reads, kept loose so it accepts the updates of any command. */
type ResponseUpdate = {
    key: OnyxKey;
    value?: unknown;
};

type MovedScanFailedContext = {
    optimisticReportID: string;
    chatReportID: string | undefined;
    iouReportID: string | undefined;
};

type RealReport = {
    reportID: string;
    actionIDByTransactionID: Map<string, string>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return !!value && typeof value === 'object';
}

function getString(value: unknown): string | undefined {
    return typeof value === 'string' ? value : undefined;
}

/**
 * A hold split is the only other flow that sends an optimistic hold report, and it always pays part of the report
 * (`full: false`). A full payment carrying one therefore means the client optimistically moved scan-failed expenses out.
 */
function getMovedScanFailedContext(data: Record<string, unknown> | undefined): MovedScanFailedContext | undefined {
    const optimisticReportID = getString(data?.optimisticHoldReportID);
    if (!optimisticReportID || !data?.full) {
        return undefined;
    }
    return {
        optimisticReportID,
        chatReportID: getString(data.chatReportID),
        iouReportID: getString(data.iouReportID),
    };
}

/** Reads the `transactionID -> reportActionID` pairs out of one report-actions update in the response. */
function getActionIDByTransactionID(value: Record<string, unknown>): Map<string, string> {
    const actionIDByTransactionID = new Map<string, string>();
    for (const reportAction of Object.values(value)) {
        if (!isRecord(reportAction) || reportAction.actionName !== CONST.REPORT.ACTIONS.TYPE.IOU) {
            continue;
        }
        const reportActionID = getString(reportAction.reportActionID);
        const transactionID = isRecord(reportAction.originalMessage) ? getString(reportAction.originalMessage.IOUTransactionID) : undefined;
        if (!reportActionID || !transactionID) {
            continue;
        }
        actionIDByTransactionID.set(transactionID, reportActionID);
    }
    return actionIDByTransactionID;
}

/**
 * Finds the report the backend created for the moved expenses by evidence rather than by shape: it is the report in the
 * response, other than the one that was paid, that carries an action for an expense the client had moved into the
 * optimistic report. Returns undefined when nothing in the response claims one of those expenses.
 */
function findRealReport(onyxData: ResponseUpdate[], {optimisticReportID, chatReportID, iouReportID}: MovedScanFailedContext, movedTransactionIDs: Set<string>): RealReport | undefined {
    if (!movedTransactionIDs.size) {
        return undefined;
    }
    for (const update of onyxData) {
        if (!update.key?.startsWith(ONYXKEYS.COLLECTION.REPORT_ACTIONS) || !isRecord(update.value)) {
            continue;
        }
        const reportID = update.key.slice(ONYXKEYS.COLLECTION.REPORT_ACTIONS.length);
        if (!reportID || reportID === optimisticReportID || reportID === iouReportID || reportID === chatReportID) {
            continue;
        }
        const actionIDByTransactionID = getActionIDByTransactionID(update.value);
        const claimsMovedExpense = [...actionIDByTransactionID.keys()].some((transactionID) => movedTransactionIDs.has(transactionID));
        if (!claimsMovedExpense) {
            continue;
        }
        return {reportID, actionIDByTransactionID};
    }
    return undefined;
}

/**
 * When a report is paid while it still holds a scan-failed expense, the client optimistically moves that expense into a
 * report of its own so the split is visible offline. The backend performs the same split but under its own report ID,
 * which leaves the optimistic report stranded — and strands the user with it if they are looking at it.
 *
 * This middleware pairs the two: it reads the backend's report out of the response and hands it to the reconciliation.
 * The resulting updates are appended to the request's `successData` rather than to the response, so they land after the
 * pending-state cleanup that `successData` already carries — merging them the other way round would resurrect the very
 * report actions being removed. Running from the response (rather than from a subscription opened when Pay was pressed)
 * is what makes this survive a reload between going offline and reconnecting, since the queued request is replayed
 * through the same pipeline.
 */
const handleMovedScanFailedExpenses: Middleware = (requestResponse, request) =>
    requestResponse.then((response) => {
        // A failed payment rolls the move back through failureData, which owns the cleanup in that case.
        if (request?.command !== WRITE_COMMANDS.PAY_MONEY_REQUEST || response?.jsonCode !== CONST.JSON_CODE.SUCCESS) {
            return response;
        }

        const context = getMovedScanFailedContext(request.data);
        if (!context) {
            return response;
        }

        const onyxData: ResponseUpdate[] = response.onyxData ?? [];
        const realReport = findRealReport(onyxData, context, getMovedScanFailedTransactionIDs(context.optimisticReportID));
        const updates = reconcileMovedScanFailedReport(context.optimisticReportID, realReport?.reportID, realReport?.actionIDByTransactionID ?? new Map<string, string>());
        if (!updates.length) {
            return response;
        }

        if (!request.successData) {
            request.successData = [];
        }
        (request.successData as AnyOnyxUpdate[]).push(...updates);

        return response;
    });

export default handleMovedScanFailedExpenses;
