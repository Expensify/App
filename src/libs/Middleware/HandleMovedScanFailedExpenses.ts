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

/** `payMoneyRequest` sends the wallet command for Expensify Wallet payments and the plain one for everything else, both built from the same params. */
const PAYMENT_COMMANDS = new Set<string>([WRITE_COMMANDS.PAY_MONEY_REQUEST, WRITE_COMMANDS.PAY_MONEY_REQUEST_WITH_WALLET]);

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

function isOtherReport(reportID: string, {optimisticReportID, chatReportID, iouReportID}: MovedScanFailedContext): boolean {
    return !!reportID && reportID !== optimisticReportID && reportID !== iouReportID && reportID !== chatReportID;
}

/**
 * The strongest signal: a report in the response, other than the one that was paid, already carries an action for an
 * expense the client had moved into the optimistic report. Only available when the response happens to include the new
 * report's actions.
 */
function findReportClaimingMovedExpense(onyxData: ResponseUpdate[], context: MovedScanFailedContext, movedTransactionIDs: Set<string>): string | undefined {
    if (!movedTransactionIDs.size) {
        return undefined;
    }
    for (const update of onyxData) {
        if (!update.key?.startsWith(ONYXKEYS.COLLECTION.REPORT_ACTIONS) || !isRecord(update.value)) {
            continue;
        }
        const reportID = update.key.slice(ONYXKEYS.COLLECTION.REPORT_ACTIONS.length);
        if (!isOtherReport(reportID, context)) {
            continue;
        }
        const claimsMovedExpense = [...getActionIDByTransactionID(update.value).keys()].some((transactionID) => movedTransactionIDs.has(transactionID));
        if (claimsMovedExpense) {
            return reportID;
        }
    }
    return undefined;
}

/**
 * The fallback signal, used because the payment response carries the new report itself far more often than it carries
 * that report's actions: the one expense report the response introduces for this workspace chat which is neither the
 * report that was paid nor the optimistic one. More than one candidate is treated as no candidate.
 */
function findNewExpenseReportForChat(onyxData: ResponseUpdate[], context: MovedScanFailedContext): string | undefined {
    const candidates = new Set<string>();
    for (const update of onyxData) {
        if (!update.key?.startsWith(ONYXKEYS.COLLECTION.REPORT) || !isRecord(update.value)) {
            continue;
        }
        const reportID = update.key.slice(ONYXKEYS.COLLECTION.REPORT.length);
        if (!isOtherReport(reportID, context) || update.value.type !== CONST.REPORT.TYPE.EXPENSE || update.value.chatReportID !== context.chatReportID) {
            continue;
        }
        candidates.add(reportID);
    }
    return candidates.size === 1 ? candidates.values().next().value : undefined;
}

/**
 * Whether the response itself already sets `field` on `key`. The reconciliation updates ride in `successData` and are
 * merged after the response, so they have to leave anything the backend sent alone instead of overwriting it.
 */
function hasResponseValueFor(onyxData: ResponseUpdate[], key: string, field: string): boolean {
    return onyxData.some((update) => update.key === key && isRecord(update.value) && update.value[field] !== undefined);
}

/** Collects the report actions the response carries for `reportID`, which may be none. */
function collectActionIDsForReport(onyxData: ResponseUpdate[], reportID: string): Map<string, string> {
    let actionIDByTransactionID = new Map<string, string>();
    for (const update of onyxData) {
        if (update.key !== `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}` || !isRecord(update.value)) {
            continue;
        }
        actionIDByTransactionID = new Map([...actionIDByTransactionID, ...getActionIDByTransactionID(update.value)]);
    }
    return actionIDByTransactionID;
}

/**
 * Identifies the report the backend created for the moved expenses. Returns undefined when the response does not point
 * at exactly one such report. The reconciliation is then skipped entirely, because sending the user to a report that
 * is only a guess is worse than leaving the optimistic one in place.
 */
function findRealReport(onyxData: ResponseUpdate[], context: MovedScanFailedContext, movedTransactionIDs: Set<string>): RealReport | undefined {
    const reportID = findReportClaimingMovedExpense(onyxData, context, movedTransactionIDs) ?? findNewExpenseReportForChat(onyxData, context);
    if (!reportID) {
        return undefined;
    }
    return {reportID, actionIDByTransactionID: collectActionIDsForReport(onyxData, reportID)};
}

/**
 * When a report is paid while it still holds a scan-failed expense, the client optimistically moves that expense into a
 * report of its own so the split is visible offline. The backend performs the same split but under its own report ID,
 * which leaves the optimistic report stranded, and strands the user with it if they are looking at it.
 *
 * This middleware pairs the two: it reads the backend's report out of the response and hands it to the reconciliation.
 * The resulting updates are appended to the request's `successData` rather than to the response, so they land after the
 * pending-state cleanup that `successData` already carries. Merging them the other way round would resurrect the very
 * report actions being removed. Running from the response, rather than from a subscription opened when Pay was pressed,
 * is what makes this survive a reload between going offline and reconnecting, since the queued request is replayed
 * through the same pipeline.
 */
const handleMovedScanFailedExpenses: Middleware = (requestResponse, request) =>
    requestResponse.then((response) => {
        // A failed payment rolls the move back through failureData, which owns the cleanup in that case.
        if (!request?.command || !PAYMENT_COMMANDS.has(request.command) || response?.jsonCode !== CONST.JSON_CODE.SUCCESS) {
            return response;
        }

        const context = getMovedScanFailedContext(request.data);
        if (!context) {
            return response;
        }

        const onyxData: ResponseUpdate[] = response.onyxData ?? [];
        const realReport = findRealReport(onyxData, context, getMovedScanFailedTransactionIDs(context.optimisticReportID));
        if (!realReport) {
            return response;
        }

        const updates = reconcileMovedScanFailedReport(context.optimisticReportID, realReport.reportID, realReport.actionIDByTransactionID, (key, field) =>
            hasResponseValueFor(onyxData, key, field),
        );
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
