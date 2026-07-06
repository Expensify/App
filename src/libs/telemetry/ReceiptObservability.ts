import {getAll as getAllPersistedRequests, getOngoingRequest} from '@libs/actions/PersistedRequests';
import {WRITE_COMMANDS} from '@libs/API/types';
import getPlatform from '@libs/getPlatform';
import Log from '@libs/Log';
import {getIsOffline} from '@libs/NetworkState';
import {rand64} from '@libs/NumberUtils';

import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';

/** Prefix on every receipt observability log line, so the logs can be filtered without parsing free text. */
const RECEIPT_LOG_PREFIX = '[Receipt]';

/** Lifecycle boundaries at which we snapshot the still-pending receipts. */
type ReceiptSnapshotTrigger = 'signOut' | 'background' | 'foreground';

/** How a receipt entered the app. */
type ReceiptCaptureSource = 'camera' | 'gallery' | 'file' | 'replace';

/**
 * Maps the picker-driven capture path to a `ReceiptCaptureSource`. On native the picker is the OS gallery; on web the
 * same callback fires for file-browse and drag-and-drop. Keep the mapping in one place so future platforms only need
 * one change.
 */
function getPickerCaptureSource(): ReceiptCaptureSource {
    return getPlatform() === CONST.PLATFORM.WEB ? 'file' : 'gallery';
}

/** Inputs for the enqueued milestone, captured at the moment the receipt request reaches the write queue. */
type ReceiptEnqueuedParams = {
    receiptTraceId: string | undefined;
    transactionID: string | undefined;
    command: string;
    persistedQueueLength: number;
};

/**
 * Write commands whose request params carry a captured receipt. A pending request with one of these commands is a
 * receipt that has not yet reached the server. Keep aligned with the durability slice's enumeration so the two
 * features never disagree on which queued requests own a local receipt file.
 */
const RECEIPT_BEARING_COMMANDS = new Set<string>([
    WRITE_COMMANDS.REQUEST_MONEY,
    WRITE_COMMANDS.TRACK_EXPENSE,
    WRITE_COMMANDS.SPLIT_BILL,
    WRITE_COMMANDS.SPLIT_BILL_AND_OPEN_REPORT,
    WRITE_COMMANDS.START_SPLIT_BILL,
    WRITE_COMMANDS.COMPLETE_SPLIT_BILL,
    WRITE_COMMANDS.REPLACE_RECEIPT,
    WRITE_COMMANDS.SEND_MONEY_ELSEWHERE,
    WRITE_COMMANDS.SEND_MONEY_WITH_WALLET,
    WRITE_COMMANDS.CATEGORIZE_TRACKED_EXPENSE,
    WRITE_COMMANDS.SHARE_TRACKED_EXPENSE,
]);

/** When each receipt was enqueued, keyed by transaction id, so a snapshot can report how long it has been waiting. */
const enqueuedAtByTransactionID = new Map<string, number>();

/**
 * Upper bound on the enqueue-timing map. It is normally drained in the snapshot path, but a session that never hits a
 * snapshot boundary (e.g. a long-lived web tab that never backgrounds or signs out) would otherwise grow it one entry
 * per submitted receipt without bound. The oldest entry is evicted past this cap; losing it only degrades a future
 * snapshot's `msSinceEnqueued` for that receipt, never correctness.
 */
const MAX_TRACKED_ENQUEUE_TIMESTAMPS = 100;

/**
 * Mints a unique, opaque correlation id for a captured receipt and stamps it on the in-memory file object.
 *
 * The id is added as an own-enumerable property so it rides along with the file through the submit path into the
 * final request params, and survives `JSON.stringify` and Onyx storage into the persisted request — even when the
 * receipt began life as a `File` on web, whose binary content never serializes.
 */
function mintAndStampReceiptTraceId(file: FileObject): string {
    const receiptTraceId = rand64();
    // eslint-disable-next-line no-param-reassign
    file.receiptTraceId = receiptTraceId;
    return receiptTraceId;
}

/**
 * Records the capture milestone: the moment a receipt image entered the app. Carries the entry point and the file
 * format and size, so a later investigation can test whether lost receipts skew toward a format (e.g. HEIC or PDF)
 * or toward large files. Delivered immediately so it survives a hard app kill.
 */
function logReceiptCaptured({file, captureSource, receiptTraceId}: {file: FileObject; captureSource: ReceiptCaptureSource; receiptTraceId: string}) {
    Log.info(`${RECEIPT_LOG_PREFIX} captured`, true, {
        event: 'captured',
        receiptTraceId,
        captureSource,
        mimeType: file.type,
        fileExtension: file.name?.includes('.') ? file.name.split('.').pop()?.toLowerCase() : undefined,
        fileSizeBytes: file.size ?? undefined,
        platform: getPlatform(),
    });
}

/**
 * Records the submit milestone, mapping the draft transaction id to the final transaction id. This is the join from
 * the capture-side logs to everything downstream, since the id changes from the constant draft id at submit.
 */
function logReceiptSubmitted({
    receiptTraceId,
    draftTransactionID,
    transactionID,
    command,
    iouType,
}: {
    receiptTraceId: string | undefined;
    draftTransactionID: string;
    transactionID: string;
    command: string;
    iouType: string;
}) {
    Log.info(`${RECEIPT_LOG_PREFIX} submitted`, true, {
        event: 'submitted',
        receiptTraceId,
        draftTransactionID,
        transactionID,
        command,
        iouType,
    });
}

/**
 * Records the enqueued milestone: the receipt upload reached the write queue. The gap between this and the existing
 * network "sent" log is the blocked-queue window the investigation is about. Records the offline state and the queue
 * depth so a normal offline wait can be told apart from a stuck queue.
 */
function logReceiptEnqueued({receiptTraceId, transactionID, command, persistedQueueLength}: ReceiptEnqueuedParams) {
    if (transactionID) {
        // Re-insert so the key moves to the newest slot (Map preserves insertion order), then trim the oldest entries
        // past the cap. This bounds the map even if a snapshot boundary is never reached to drain it.
        enqueuedAtByTransactionID.delete(transactionID);
        enqueuedAtByTransactionID.set(transactionID, Date.now());
        while (enqueuedAtByTransactionID.size > MAX_TRACKED_ENQUEUE_TIMESTAMPS) {
            const oldestTransactionID = enqueuedAtByTransactionID.keys().next().value;
            if (oldestTransactionID === undefined) {
                break;
            }
            enqueuedAtByTransactionID.delete(oldestTransactionID);
        }
    }

    Log.info(`${RECEIPT_LOG_PREFIX} enqueued`, true, {
        event: 'enqueued',
        receiptTraceId,
        transactionID,
        command,
        isOffline: getIsOffline(),
        persistedQueueLength,
    });
}

/**
 * Emits one snapshot line per receipt still pending in the write queue, tagged with the lifecycle boundary that
 * triggered it. Stays silent when nothing is pending, so the logs are quiet in the normal case. Delivered immediately
 * so the snapshot survives a hard app kill from the background.
 */
function logReceiptQueueSnapshot(trigger: ReceiptSnapshotTrigger) {
    const isOffline = getIsOffline();
    const now = Date.now();
    const pendingTransactionIDs = new Set<string>();

    // Include the ongoing request. Once processNextRequest() moves a receipt from the persisted queue into the ongoing
    // slot it is the one actively uploading, but it no longer shows up in getAll(). Without this it would be skipped here
    // and then dropped from the timing map by the cleanup below.
    const ongoingRequest = getOngoingRequest();
    const requests = ongoingRequest ? [ongoingRequest, ...getAllPersistedRequests()] : getAllPersistedRequests();

    for (const request of requests) {
        if (!RECEIPT_BEARING_COMMANDS.has(request.command)) {
            continue;
        }

        const data = (request.data ?? {}) as {transactionID?: string; receipt?: {receiptTraceId?: string}};
        // Skip when the receipt isn't reachable at data.receipt (e.g. SplitBill nests it inside the splits JSON; SendMoney
        // without an attached receipt has no receipt field). Logging without a trace id is noise — it cannot be joined to the
        // capture log and only pollutes the snapshot with non-correlatable rows.
        if (!data.receipt) {
            continue;
        }
        const transactionID = data.transactionID;
        if (transactionID) {
            pendingTransactionIDs.add(transactionID);
        }
        const enqueuedAt = transactionID ? enqueuedAtByTransactionID.get(transactionID) : undefined;

        Log.info(`${RECEIPT_LOG_PREFIX} queue snapshot`, true, {
            event: 'snapshot',
            trigger,
            receiptTraceId: data.receipt.receiptTraceId,
            transactionID,
            command: request.command,
            msSinceEnqueued: enqueuedAt !== undefined ? now - enqueuedAt : undefined,
            isOffline,
        });
    }

    // Drop timing entries for receipts that have drained from the queue, so the map stays bounded to pending receipts.
    for (const transactionID of enqueuedAtByTransactionID.keys()) {
        if (pendingTransactionIDs.has(transactionID)) {
            continue;
        }
        enqueuedAtByTransactionID.delete(transactionID);
    }
}

export {mintAndStampReceiptTraceId, logReceiptCaptured, logReceiptSubmitted, logReceiptEnqueued, logReceiptQueueSnapshot, getPickerCaptureSource, RECEIPT_BEARING_COMMANDS};
export type {ReceiptCaptureSource};
