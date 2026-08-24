import {WRITE_COMMANDS} from '@libs/API/types';
import type {Middleware} from '@libs/Request';

import reconcileMovedScanFailedReport from '@userActions/IOU/reconcileMovedScanFailedReport';

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

/**
 * Finds the expense report the backend created for the moved expenses. It is the only report in the response that is
 * new to this workspace chat: neither the report that was just paid nor the optimistic one the client built. When the
 * response does not identify exactly one such report we return undefined and the caller falls back to the chat.
 */
function findRealReportID(onyxData: ResponseUpdate[], {optimisticReportID, chatReportID, iouReportID}: MovedScanFailedContext): string | undefined {
    const candidates = new Set<string>();
    for (const update of onyxData) {
        if (!update.key?.startsWith(ONYXKEYS.COLLECTION.REPORT) || !isRecord(update.value)) {
            continue;
        }
        const reportID = update.key.slice(ONYXKEYS.COLLECTION.REPORT.length);
        if (!reportID || reportID === optimisticReportID || reportID === iouReportID || reportID === chatReportID) {
            continue;
        }
        if (update.value.type !== CONST.REPORT.TYPE.EXPENSE || update.value.chatReportID !== chatReportID) {
            continue;
        }
        candidates.add(reportID);
    }
    return candidates.size === 1 ? candidates.values().next().value : undefined;
}

/** Maps each expense the backend report carries to the report action it created for it. */
function findRealActionIDByTransactionID(onyxData: ResponseUpdate[], realReportID: string | undefined): Map<string, string> {
    const actionIDByTransactionID = new Map<string, string>();
    if (!realReportID) {
        return actionIDByTransactionID;
    }
    for (const update of onyxData) {
        if (update.key !== `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${realReportID}` || !isRecord(update.value)) {
            continue;
        }
        for (const reportAction of Object.values(update.value)) {
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
    }
    return actionIDByTransactionID;
}

/**
 * When a report is paid while it still holds a scan-failed expense, the client optimistically moves that expense into a
 * report of its own so the split is visible offline. The backend performs the same split but under its own report ID,
 * which leaves the optimistic report stranded — and strands the user with it if they are looking at it.
 *
 * This middleware pairs the two: it reads the backend's report out of the response and hands it to the reconciliation,
 * whose updates ride along with the response so the swap is applied atomically. Running from the response (rather than
 * from a subscription opened when Pay was pressed) is what makes it survive a reload between going offline and
 * reconnecting, since the queued request is replayed through the same pipeline.
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
        const realReportID = findRealReportID(onyxData, context);
        const updates = reconcileMovedScanFailedReport(context.optimisticReportID, realReportID, findRealActionIDByTransactionID(onyxData, realReportID));
        if (!updates.length) {
            return response;
        }

        if (!response.onyxData) {
            response.onyxData = [];
        }
        (response.onyxData as AnyOnyxUpdate[]).push(...updates);

        return response;
    });

export default handleMovedScanFailedExpenses;
