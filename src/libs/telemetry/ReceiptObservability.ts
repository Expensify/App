import {getAll as getAllPersistedRequests, getOngoingRequest} from '@libs/actions/PersistedRequests';
import {WRITE_COMMANDS} from '@libs/API/types';
import getFirstLine from '@libs/cameraCapture/getFirstLine';
import getPlatform from '@libs/getPlatform';
import Log from '@libs/Log';
import {getIsOffline} from '@libs/NetworkState';
import {rand64} from '@libs/NumberUtils';
import {getReceiptSourceKind, isInDurableFolder} from '@libs/ReceiptStorage/durableFolder';

import type {SignOutReason} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReceiptSource} from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';

import RECEIPT_LOG_PREFIX from './receiptLogPrefix';

/** Points in the app lifecycle where we snapshot the receipts that are still pending. */
type ReceiptSnapshotTrigger = 'signOut' | 'background' | 'foreground';

/** How a receipt entered the app. */
type ReceiptCaptureSource = 'camera' | 'gallery' | 'file' | 'replace' | 'share' | 'odometer';

type ReceiptDerivingStep = 'convert' | 'resize';

type ReceiptImageEditStep = 'crop' | 'rotate';

/**
 * Maps the picker capture path to a source. On native the picker is the OS gallery. On web the same callback fires
 * for both file browsing and drag and drop. Keeping it here means a new platform only has to change one place.
 */
function getPickerCaptureSource(): ReceiptCaptureSource {
    return getPlatform() === CONST.PLATFORM.WEB ? 'file' : 'gallery';
}

/** The receipt as it sits on a persisted request, which is all a snapshot can read once the queue is waiting. */
type QueuedReceipt = {
    /** Joins this receipt back to its capture, submit and enqueue log lines. */
    receiptTraceId?: string;

    /** When the upload reached the write queue. Persisted with the request, so it survives an app restart. */
    receiptEnqueuedAt?: number;

    /** Where the file was stored. A remote URL once the server has it. */
    source?: ReceiptSource;

    /** The path on the device that created it, kept so a remote source does not trigger a reload. */
    localSource?: ReceiptSource;

    /** REPLACE_RECEIPT queues the raw File object, which keeps its local path here rather than on `source`. */
    uri?: string;
};

/** Inputs for the enqueued milestone, taken when the receipt request reaches the write queue. */
type ReceiptEnqueuedParams = {
    receipt: QueuedReceipt;
    transactionID: string | undefined;
    command: string;
    persistedQueueLength: number;
};

/**
 * Write commands whose params carry a captured receipt at data.receipt. A pending request with one of these commands
 * owns a local receipt file that has not reached the server yet. This is the single source of truth shared by the
 * receipt observability logs and the sign-out gallery save, so both features agree on which queued requests own a
 * receipt
 */
const RECEIPT_BEARING_COMMANDS = new Set<string>([
    WRITE_COMMANDS.REQUEST_MONEY,
    WRITE_COMMANDS.TRACK_EXPENSE,
    WRITE_COMMANDS.START_SPLIT_BILL,
    WRITE_COMMANDS.REPLACE_RECEIPT,
    WRITE_COMMANDS.SEND_MONEY_ELSEWHERE,
    WRITE_COMMANDS.SEND_MONEY_WITH_WALLET,
    WRITE_COMMANDS.CATEGORIZE_TRACKED_EXPENSE,
    WRITE_COMMANDS.SHARE_TRACKED_EXPENSE,
    WRITE_COMMANDS.ADD_TRACKED_EXPENSE_TO_POLICY,
    WRITE_COMMANDS.CREATE_DISTANCE_REQUEST,
]);

/** Commands that edit, move or merge an existing expense. Shared with the expense failure tracker so both lists stay in step. */
const EXPENSE_EDIT_COMMANDS: readonly string[] = [
    WRITE_COMMANDS.DETACH_RECEIPT,
    WRITE_COMMANDS.CHANGE_TRANSACTIONS_REPORT,
    WRITE_COMMANDS.MERGE_DUPLICATES,
    WRITE_COMMANDS.MERGE_TRANSACTION,
    WRITE_COMMANDS.UPDATE_MONEY_REQUEST,
    WRITE_COMMANDS.UPDATE_MONEY_REQUEST_ATTENDEES,
    WRITE_COMMANDS.UPDATE_MONEY_REQUEST_DATE,
    WRITE_COMMANDS.UPDATE_MONEY_REQUEST_REIMBURSABLE,
    WRITE_COMMANDS.UPDATE_MONEY_REQUEST_BILLABLE,
    WRITE_COMMANDS.UPDATE_MONEY_REQUEST_MERCHANT,
    WRITE_COMMANDS.UPDATE_MONEY_REQUEST_TAG,
    WRITE_COMMANDS.UPDATE_MONEY_REQUEST_TAX_AMOUNT,
    WRITE_COMMANDS.UPDATE_MONEY_REQUEST_TAX_RATE,
    WRITE_COMMANDS.UPDATE_MONEY_REQUEST_DISTANCE,
    WRITE_COMMANDS.UPDATE_MONEY_REQUEST_DISTANCE_RATE,
    WRITE_COMMANDS.UPDATE_MONEY_REQUEST_CATEGORY,
    WRITE_COMMANDS.UPDATE_MONEY_REQUEST_DESCRIPTION,
    WRITE_COMMANDS.UPDATE_MONEY_REQUEST_AMOUNT_AND_CURRENCY,
    WRITE_COMMANDS.UPDATE_MONEY_REQUEST_VENDOR,
];

/** Split, per diem, convert, delete, undelete and duplicate-resolve commands. They join the trail but not the expense failure tracker. */
const EXPENSE_TRAIL_ONLY_COMMANDS: readonly string[] = [
    WRITE_COMMANDS.DELETE_MONEY_REQUEST,
    WRITE_COMMANDS.SPLIT_BILL,
    WRITE_COMMANDS.SPLIT_BILL_AND_OPEN_REPORT,
    WRITE_COMMANDS.CREATE_PER_DIEM_REQUEST,
    WRITE_COMMANDS.CONVERT_TRACKED_EXPENSE_TO_REQUEST,
    WRITE_COMMANDS.SPLIT_TRANSACTION,
    WRITE_COMMANDS.UPDATE_SPLIT_TRANSACTION,
    WRITE_COMMANDS.REVERT_SPLIT_TRANSACTION,
    WRITE_COMMANDS.DELETE_APP_REPORT,
    WRITE_COMMANDS.UNDELETE_TRANSACTIONS,
    WRITE_COMMANDS.RESOLVE_DUPLICATES,
];

/**
 * Commands that create, edit, move, merge or delete an expense or its receipt. A failure on any of them can leave the
 * user with a missing receipt or a stale expense, so each one reports its server result on the receipt trail.
 */
const RECEIPT_TRAIL_COMMANDS = new Set<string>([...RECEIPT_BEARING_COMMANDS, ...EXPENSE_EDIT_COMMANDS, ...EXPENSE_TRAIL_ONLY_COMMANDS]);

/**
 * How a request on the receipt trail ended. alreadyCreated counts as a success, because it means an earlier attempt
 * reached the server and the retry found the record there.
 */
type ReceiptServerResultClass = 'success' | 'alreadyCreated' | 'transient' | 'permanent' | 'cancelled';

/**
 * The trail fields read from a request's params. ChangeTransactionsReport sends `transactionList`, a comma-separated
 * list, instead of `transactionID`. Merge and duplicate commands send the kept expense as `transactionID` and the
 * others, which they delete or hold, as the `transactionIDList` array.
 */
type ReceiptTrailRequestData = {
    transactionID?: unknown;
    transactionList?: unknown;
    transactionIDList?: unknown;
    receipt?: {receiptTraceId?: unknown; receiptEnqueuedAt?: unknown};
};

type ReceiptTrailFields = {
    receiptTraceId: string | undefined;
    transactionID: string | undefined;

    /** A move's ids when it carries more than one, or the ids a merge or duplicate command removes. Capped at MAX_LOGGED_TRANSACTION_IDS. */
    transactionIDs: string | undefined;

    /** How many ids the list carries. 0 for a move of every expense matching a search, which sends no list. */
    transactionCount: number | undefined;

    hasReceipt: boolean;
    receiptEnqueuedAt: number | undefined;
};

/** A bulk move can carry hundreds of expenses, so only the first ones are logged to keep the line small. */
const MAX_LOGGED_TRANSACTION_IDS = 20;

function getReceiptTrailFields(data: ReceiptTrailRequestData | undefined): ReceiptTrailFields {
    const receipt = data?.receipt;
    const transactionID = typeof data?.transactionID === 'string' && data.transactionID ? data.transactionID : undefined;
    const hasTransactionList = typeof data?.transactionList === 'string';
    const listedTransactionIDs = typeof data?.transactionList === 'string' ? data.transactionList.split(',').filter(Boolean) : [];

    // The removed expenses are logged too, or a receipt lost in a merge never shows up when searching by its id
    const otherTransactionIDs = Array.isArray(data?.transactionIDList) ? data.transactionIDList.filter((id): id is string => typeof id === 'string' && !!id) : undefined;

    // A single-expense move joins the trail by transactionID like every other command
    const movedTransactionID = listedTransactionIDs.length === 1 ? listedTransactionIDs.at(0) : undefined;
    const loggedTransactionIDs = otherTransactionIDs ?? (listedTransactionIDs.length > 1 ? listedTransactionIDs : []);

    return {
        receiptTraceId: typeof receipt?.receiptTraceId === 'string' ? receipt.receiptTraceId : undefined,
        transactionID: transactionID ?? movedTransactionID,
        transactionIDs: loggedTransactionIDs.length > 0 ? loggedTransactionIDs.slice(0, MAX_LOGGED_TRANSACTION_IDS).join(',') : undefined,
        transactionCount: otherTransactionIDs?.length ?? (hasTransactionList ? listedTransactionIDs.length : undefined),
        hasReceipt: !!receipt,
        receiptEnqueuedAt: typeof receipt?.receiptEnqueuedAt === 'number' ? receipt.receiptEnqueuedAt : undefined,
    };
}

/** Every request the queue rejects is retried, so a thrown error is transient unless it is one of these. */
function getThrownErrorResultClass(errorName: string | undefined, errorMessage: string | undefined): ReceiptServerResultClass {
    if (errorName === CONST.ERROR.REQUEST_CANCELLED) {
        return 'cancelled';
    }
    if (errorMessage === CONST.ERROR.ALREADY_CREATED || errorMessage === CONST.ERROR.DUPLICATE_RECORD) {
        return 'alreadyCreated';
    }
    return 'transient';
}

/** A 407 is answered by reauthenticating and replaying the request, so it is the only resolved failure that can recover. */
function getResponseResultClass(jsonCode: number | string | undefined): ReceiptServerResultClass {
    if (jsonCode === CONST.JSON_CODE.SUCCESS) {
        return 'success';
    }
    if (jsonCode === CONST.JSON_CODE.NOT_AUTHENTICATED) {
        return 'transient';
    }
    return 'permanent';
}

/**
 * Records the sent milestone, when a request carrying a receipt goes out to the server. A receipt that is enqueued
 * but never sent is stuck in the queue, which is the gap the enqueued line alone could not show.
 */
function logReceiptSent({command, fields}: {command: string; fields: ReceiptTrailFields}) {
    Log.info(`${RECEIPT_LOG_PREFIX} sent`, false, {
        event: 'sent',
        receiptTraceId: fields.receiptTraceId,
        transactionID: fields.transactionID,
        command,
        msSinceEnqueued: fields.receiptEnqueuedAt !== undefined ? Date.now() - fields.receiptEnqueuedAt : undefined,
        isOffline: String(getIsOffline()),
        platform: getPlatform(),
    });
}

/**
 * Records how the server answered a request on the receipt trail, one line per attempt. The server message can name
 * people or merchants, so it goes under serverMessage, which is left off the Sentry whitelist and stays in our own logs.
 */
function logReceiptServerResult({
    command,
    fields,
    resultClass,
    jsonCode,
    requestID,
    errorMessage,
    serverMessage,
}: {
    command: string;
    fields: ReceiptTrailFields;
    resultClass: ReceiptServerResultClass;
    jsonCode: number | string | undefined;
    requestID: string | undefined;
    errorMessage?: string;
    serverMessage?: string;
}) {
    const message = `${RECEIPT_LOG_PREFIX} server result`;
    const parameters = {
        event: 'serverResult',
        receiptTraceId: fields.receiptTraceId,
        transactionID: fields.transactionID,
        transactionIDs: fields.transactionIDs,
        transactionCount: fields.transactionCount,
        hasReceipt: String(fields.hasReceipt),
        command,
        resultClass,
        jsonCode,
        requestID,
        errorMessage,
        serverMessage,
        platform: getPlatform(),
    };

    // Only a rejected receipt is raised to alert level. Edit rejections are routine (e.g. report already approved),
    // and web turns every client alert into a server alert, so they stay at info and are filtered by resultClass.
    if (resultClass === 'permanent' && fields.hasReceipt) {
        Log.alert(message, parameters, false);
        return;
    }
    Log.info(message, false, parameters);
}

/** Why failure data was applied: a server rejection, retries running out, or every request failing at sign out. */
type ReceiptRollbackTrigger = 'serverError' | 'gaveUp' | 'failAll';

/**
 * Records the rolledBack step, when a request on the receipt trail applies its failure data. Only the names of the
 * transaction fields being written back are logged, never their values, so we can see which edits a rollback undoes.
 */
function logReceiptRolledBack({
    command,
    data,
    failureData,
    trigger,
}: {
    command: string;
    data: ReceiptTrailRequestData | undefined;
    failureData: ReadonlyArray<{key: string; value?: unknown}> | undefined;
    trigger: ReceiptRollbackTrigger;
}) {
    if (!RECEIPT_TRAIL_COMMANDS.has(command) || !failureData?.length) {
        return;
    }

    const revertedFields = new Set<string>();
    for (const update of failureData) {
        if (!update.key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION) || !update.value || typeof update.value !== 'object') {
            continue;
        }
        for (const field of Object.keys(update.value)) {
            revertedFields.add(field);
        }
    }

    const fields = getReceiptTrailFields(data);
    Log.info(`${RECEIPT_LOG_PREFIX} rolled back`, false, {
        event: 'rolledBack',
        receiptTraceId: fields.receiptTraceId,
        transactionID: fields.transactionID,
        transactionIDs: fields.transactionIDs,
        transactionCount: fields.transactionCount,
        hasReceipt: String(fields.hasReceipt),
        command,
        trigger,
        revertedKeyCount: failureData.length,
        revertedTransactionFields: [...revertedFields].sort().join(','),
        platform: getPlatform(),
    });
}

/**
 * Records a not-found page on a report or transaction thread screen. An expense that vanished after a failed request
 * often surfaces here first. The navigate-back URL can hold private route params, so only whether it is set is logged.
 */
function logReceiptNotFound({
    screen,
    reportID,
    isOptimisticDelete,
    isPendingCreation,
    isLoadingApp,
    isOffline,
    hasDeleteTransactionNavigateBackUrl,
    isInvalidReportPath,
    isBillHidden,
    isParentActionDeleted,
    isParentActionMissingAfterLoad,
}: {
    screen: 'report' | 'transactionThread';
    reportID: string | undefined;
    isOptimisticDelete?: boolean;
    isPendingCreation?: boolean;
    isLoadingApp?: boolean;
    isOffline: boolean;
    hasDeleteTransactionNavigateBackUrl?: boolean;
    isInvalidReportPath?: boolean;
    isBillHidden?: boolean;
    isParentActionDeleted?: boolean;
    isParentActionMissingAfterLoad?: boolean;
}) {
    const toFlag = (value: boolean | undefined) => (value === undefined ? undefined : String(value));
    Log.info(`${RECEIPT_LOG_PREFIX} not found page shown`, false, {
        event: 'notFound',
        screen,
        reportID,
        isOptimisticDelete: toFlag(isOptimisticDelete),
        isPendingCreation: toFlag(isPendingCreation),
        isLoadingApp: toFlag(isLoadingApp),
        isOffline: String(isOffline),
        hasDeleteTransactionNavigateBackUrl: toFlag(hasDeleteTransactionNavigateBackUrl),
        isInvalidReportPath: toFlag(isInvalidReportPath),
        isBillHidden: toFlag(isBillHidden),
        isParentActionDeleted: toFlag(isParentActionDeleted),
        isParentActionMissingAfterLoad: toFlag(isParentActionMissingAfterLoad),
        platform: getPlatform(),
    });
}

/** Receipts already reported as shown, so a thumbnail that re-renders in a list does not log again. */
const shownReceiptKeys = new Set<string>();

/** Upper bound on the shown set, for a long-lived web tab that keeps showing new receipts. */
const MAX_TRACKED_SHOWN_RECEIPTS = 200;

/**
 * Records the receiptShown step, the last step of the trail, when a receipt captured on this device renders. A local
 * and a remote render are logged separately, because only the remote one proves the server has the file.
 */
function logReceiptShown({receiptTraceId, transactionID, source}: {receiptTraceId: string | undefined; transactionID: string | undefined; source: ReceiptSource | undefined}) {
    if (!receiptTraceId) {
        return;
    }
    const isRemoteSource = typeof source === 'string' && source.startsWith('http');
    const key = `${receiptTraceId}:${String(isRemoteSource)}`;
    if (shownReceiptKeys.has(key)) {
        return;
    }
    shownReceiptKeys.add(key);
    if (shownReceiptKeys.size > MAX_TRACKED_SHOWN_RECEIPTS) {
        const oldestKey = shownReceiptKeys.values().next().value;
        if (oldestKey !== undefined) {
            shownReceiptKeys.delete(oldestKey);
        }
    }

    Log.info(`${RECEIPT_LOG_PREFIX} shown`, false, {
        event: 'receiptShown',
        receiptTraceId,
        transactionID,
        isRemoteSource: String(isRemoteSource),
        platform: getPlatform(),
    });
}

/** When each receipt was enqueued, keyed by transaction id, so a snapshot can report how long it has waited. */
const enqueuedAtByTransactionID = new Map<string, number>();

/** Receipts already reported by a teardown snapshot, keyed by trace id, so two redirects racing do not double-report. */
const clearReportedAtByReceipt = new Map<string, number>();

const CLEAR_DEDUPE_MS = 60 * 1000;

/**
 * Upper bound on the enqueue timing map. The snapshot path normally drains it, but a session that never backgrounds
 * or signs out, like a long-lived web tab, would keep adding one entry per receipt. Once we pass this cap we drop the
 * oldest entry. Losing it only makes a later snapshot miss the wait time for that receipt, so the data stays correct.
 */
const MAX_TRACKED_ENQUEUE_TIMESTAMPS = 100;

/**
 * Creates a unique correlation id for a captured receipt and stamps it on the in-memory file object.
 *
 * We add it as a normal property so it travels with the file through submit into the final request params, and
 * survives JSON.stringify and Onyx storage into the persisted request. This still works for a web File, whose binary
 * content never serializes.
 */
function mintAndStampReceiptTraceId(file: FileObject): string {
    const receiptTraceId = rand64();
    // eslint-disable-next-line no-param-reassign
    file.receiptTraceId = receiptTraceId;
    return receiptTraceId;
}

/**
 * Records the capture milestone, the moment a receipt image enters the app. It carries the entry point, file format,
 * and size, so we can later check whether lost receipts lean toward a format like HEIC or PDF, or toward large files.
 * Sent right away so it survives a hard app kill.
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
 * Records the submit milestone and maps the draft transaction id to the final one. This is what joins the capture
 * logs to everything downstream, because the id changes from the fixed draft id at submit.
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
 * Records the enqueued milestone, when the receipt upload reaches the write queue. The gap between this and the
 * existing network "sent" log is the window where the queue is blocked, which is what we want to see. It records the
 * offline state and queue depth so we can tell a normal offline wait apart from a stuck queue.
 */
function logReceiptEnqueued({receipt, transactionID, command, persistedQueueLength}: ReceiptEnqueuedParams) {
    if (transactionID) {
        // Re-insert so this key becomes the newest, then drop the oldest entries past the cap. This keeps the map
        // bounded even when no snapshot ever runs to drain it.
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

    const {receiptTraceId} = receipt;
    const sourceKind = getReceiptSourceKind(getQueuedReceiptPath(receipt));
    Log.info(`${RECEIPT_LOG_PREFIX} enqueued`, true, {
        event: 'enqueued',
        receiptTraceId,
        transactionID,
        command,
        isOffline: String(getIsOffline()),
        persistedQueueLength,
        platform: getPlatform(),
        sourceKind,
    });

    // Checked at enqueue, not when a draft is set: the share flow keeps its temp file until submit, so a draft check
    // would flag every share. A queued receipt outside the receipts folder can be cleared before it uploads.
    if (sourceKind === 'imageManipulatorCache' || sourceKind === 'otherTemp') {
        Log.alert(`${RECEIPT_LOG_PREFIX} nonDurableSource`, {
            event: 'nonDurableSource',
            receiptTraceId,
            transactionID,
            command,
            sourceKind,
        });
    }
}

/**
 * Records the dropped milestone: the receipt file was gone when we built the upload payload, so the request goes out
 * without it. Logged at alert level on the [Receipt] spine so it reaches Sentry and joins the capture, submit, and
 * enqueue lines by receiptTraceId. source, localUri and fileName are for the raw device log only; they are not
 * whitelisted, so they never reach Sentry.
 */
function logReceiptDropped({
    receiptTraceId,
    transactionID,
    command,
    source,
    localUri,
    fileName,
    statError,
    receiptsFolder,
}: {
    receiptTraceId: string | undefined;
    transactionID: string | undefined;
    command: string;
    source: string | undefined;
    localUri: string | undefined;
    fileName: string | undefined;
    statError: {message: string; code?: string} | undefined;
    receiptsFolder: {exists: boolean; entryCount?: number};
}) {
    Log.alert(`${RECEIPT_LOG_PREFIX} dropped`, {
        event: 'dropped',
        receiptTraceId,
        transactionID,
        command,
        source,
        localUri,
        fileName,
        sourceKind: getReceiptSourceKind(source),
        statErrorCode: statError?.code,
        statError: statError?.message,
        receiptsFolderExists: String(receiptsFolder.exists),
        receiptsFolderEntryCount: receiptsFolder.entryCount,
    });
}

function logReceiptGaveUp({
    receiptTraceId,
    transactionID,
    command,
    errorMessage,
    errorName,
}: {
    receiptTraceId: string | undefined;
    transactionID: string | undefined;
    command: string;
    errorMessage: string | undefined;
    errorName?: string;
}) {
    Log.alert(`${RECEIPT_LOG_PREFIX} gaveUp`, {
        event: 'gaveUp',
        receiptTraceId,
        transactionID,
        command,
        errorMessage,
        errorName,
    });
}

/** A superseded upload is intentionally never sent, rather than stuck in the queue. */
function logReceiptSuperseded({receiptTraceId, transactionID, command}: {receiptTraceId: string | undefined; transactionID: string | undefined; command: string}) {
    Log.info(`${RECEIPT_LOG_PREFIX} superseded`, true, {
        event: 'superseded',
        receiptTraceId,
        transactionID,
        command,
    });
}

function logReceiptStatFailed(code: string | undefined) {
    Log.info(`${RECEIPT_LOG_PREFIX} stat failed`, false, {
        event: 'statFailed',
        code,
    });
}

/** `step` is set for files made after capture (conversion, resize), to tell those failures apart. */
function logReceiptAdoptFailed({error, captureSource, step}: {error: unknown; captureSource: ReceiptCaptureSource; step?: ReceiptDerivingStep}) {
    Log.alert(`${RECEIPT_LOG_PREFIX} adopt failed`, {
        event: 'adoptFailed',
        captureSource,
        step,
        error: error instanceof Error ? error.message : String(error),
    });
}

/** Logs only the error name, because native crop errors can include the file path. */
function logReceiptImageEditFailed({step, error}: {step: ReceiptImageEditStep; error?: unknown}) {
    Log.alert(`${RECEIPT_LOG_PREFIX} ${step}Failed`, {
        event: `${step}Failed`,
        step,
        errorName: error instanceof Error ? error.name : undefined,
    });
}

/** The in-app camera failed to produce a photo, so the user tapped the shutter and got nothing back. */
function logCameraCaptureFailed(error: unknown) {
    Log.alert(`${RECEIPT_LOG_PREFIX} camera capture failed`, {
        event: 'cameraCaptureFailed',
        error: error instanceof Error ? error.message : String(error),
    });
}

/** VisionCamera reported a runtime error. v5 errors have no code, so the message's first line is what groups them. */
function logCameraRuntimeError(error: Error) {
    Log.alert(`${RECEIPT_LOG_PREFIX} camera runtime error`, {
        event: 'cameraRuntimeError',
        summary: getFirstLine(error.message),
        error: error.message,
    });
}

function getQueuedReceiptPath(receipt: QueuedReceipt): ReceiptSource | undefined {
    return receipt.localSource ?? receipt.source ?? receipt.uri;
}

/** One pending receipt, as it will be reported on a snapshot line. */
type PendingReceiptRow = {
    /** Joins the row back to the capture log. A row without one cannot be correlated. */
    receiptTraceId: string | undefined;

    /** Absent for commands that do not carry a transaction id. */
    transactionID: string | undefined;

    /** The write command holding the receipt, e.g. RequestMoney or ReplaceReceipt. */
    command: string;

    /** How long the receipt has waited in the queue. Undefined when the enqueue time was never recorded. */
    msSinceEnqueued: number | undefined;

    /** Whether the stored path points into the receipts folder. A path check, not proof the file is still there. */
    isSourceInDurableFolder: boolean;
};

/**
 * Logs one line per receipt still pending in the write queue, tagged with what triggered the snapshot. Stays quiet
 * when nothing is pending, so the normal case makes no noise. Sent right away so it survives a hard app kill from the
 * background.
 */
function logReceiptQueueSnapshot(trigger: ReceiptSnapshotTrigger, reason?: SignOutReason) {
    const isOffline = getIsOffline();
    const now = Date.now();
    const isClear = trigger === 'signOut';
    const pendingTransactionIDs = new Set<string>();
    const rows: PendingReceiptRow[] = [];

    // Include the ongoing request. Once processNextRequest moves a receipt into the ongoing slot it is the one
    // actively uploading, but it no longer shows up in getAll. Without this we would skip it here and then drop it
    // from the timing map in the cleanup below.
    const ongoingRequest = getOngoingRequest();
    const requests = ongoingRequest ? [ongoingRequest, ...getAllPersistedRequests()] : getAllPersistedRequests();

    for (const request of requests) {
        if (!RECEIPT_BEARING_COMMANDS.has(request.command)) {
            continue;
        }

        const data = (request.data ?? {}) as {transactionID?: string; receipt?: QueuedReceipt};
        // Skip when there is no receipt at data.receipt. SplitBill nests it inside the splits JSON, and SendMoney with
        // no attached receipt has no receipt field. A row without a trace id cannot be joined to the capture log, so
        // it would only add noise to the snapshot.
        if (!data.receipt) {
            continue;
        }
        const transactionID = data.transactionID;
        if (transactionID) {
            pendingTransactionIDs.add(transactionID);
        }

        // Receipts queued before receiptTraceId existed have none, so fall back to the request's own client index
        // rather than the transaction id: ReplaceReceipt can queue twice against one transaction, and keying on the
        // transaction would collapse the second row.
        const dedupeKey = data.receipt.receiptTraceId ?? (request.requestIndex !== undefined ? `request-${request.requestIndex}` : transactionID);
        if (isClear && dedupeKey) {
            const reportedAt = clearReportedAtByReceipt.get(dedupeKey);
            if (reportedAt !== undefined && now - reportedAt < CLEAR_DEDUPE_MS) {
                continue;
            }
            clearReportedAtByReceipt.set(dedupeKey, now);
        }

        const enqueuedAt = data.receipt.receiptEnqueuedAt ?? (transactionID ? enqueuedAtByTransactionID.get(transactionID) : undefined);

        rows.push({
            receiptTraceId: data.receipt.receiptTraceId,
            transactionID,
            command: request.command,
            msSinceEnqueued: enqueuedAt !== undefined ? now - enqueuedAt : undefined,
            isSourceInDurableFolder: isInDurableFolder(getQueuedReceiptPath(data.receipt)),
        });
    }

    const snapshotID = rand64();
    for (const row of rows) {
        Log.info(`${RECEIPT_LOG_PREFIX} queue snapshot`, true, {
            event: 'snapshot',
            trigger,
            reason,
            snapshotID,
            pendingReceiptCount: rows.length,
            receiptTraceId: row.receiptTraceId,
            transactionID: row.transactionID,
            command: row.command,
            msSinceEnqueued: row.msSinceEnqueued,
            isSourceInDurableFolder: String(row.isSourceInDurableFolder),
            isOffline: String(isOffline),
            platform: getPlatform(),
        });
    }

    // Drop timing entries for receipts that already left the queue, so the map only holds pending receipts.
    for (const transactionID of enqueuedAtByTransactionID.keys()) {
        if (pendingTransactionIDs.has(transactionID)) {
            continue;
        }
        enqueuedAtByTransactionID.delete(transactionID);
    }

    // Expiry is the only thing that drops an entry. Keying this on what the current snapshot emitted would let a
    // background snapshot, which never writes to the map, wipe the guard a teardown snapshot just set.
    for (const [key, reportedAt] of clearReportedAtByReceipt) {
        if (now - reportedAt < CLEAR_DEDUPE_MS) {
            continue;
        }
        clearReportedAtByReceipt.delete(key);
    }
}

export {
    mintAndStampReceiptTraceId,
    logReceiptCaptured,
    logReceiptSubmitted,
    logReceiptEnqueued,
    logReceiptDropped,
    logReceiptGaveUp,
    logReceiptSuperseded,
    logReceiptStatFailed,
    logReceiptAdoptFailed,
    logReceiptImageEditFailed,
    logCameraCaptureFailed,
    logCameraRuntimeError,
    logReceiptQueueSnapshot,
    logReceiptSent,
    logReceiptServerResult,
    logReceiptRolledBack,
    logReceiptShown,
    logReceiptNotFound,
    getReceiptTrailFields,
    getThrownErrorResultClass,
    getResponseResultClass,
    getPickerCaptureSource,
    RECEIPT_BEARING_COMMANDS,
    RECEIPT_TRAIL_COMMANDS,
    EXPENSE_EDIT_COMMANDS,
};
export type {ReceiptCaptureSource, ReceiptDerivingStep, QueuedReceipt};
