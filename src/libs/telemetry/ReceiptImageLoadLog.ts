/** Logs receipt image errors, stalls, retries and recoveries under the [Receipt] prefix, without the image URL */
import type {ImageLoadEvent, ImageLoadEventReporter} from '@components/ImageLoadEventContext';

import Log from '@libs/Log';
import {getIsOffline} from '@libs/NetworkState';

import type {Transaction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

import RECEIPT_LOG_PREFIX from './receiptLogPrefix';

type ReceiptImageSurface = 'expense' | 'list' | 'modal';

/** Logged instead of the source, which can be a signed URL or a device path */
type ReceiptSourceKind = 'remote' | 'blob' | 'data' | 'local' | 'bundled' | 'missing';

const EVENT_NAMES = {
    error: 'uiError',
    stall: 'uiStall',
    retry: 'uiRetry',
    recovered: 'uiRecovered',
} as const satisfies Record<ImageLoadEvent['type'], string>;

// A dropped connection fails every thumbnail on a Search page at once, so each receipt, surface, event and source logs once
const loggedKeys = new Set<string>();
const MAX_LOGGED_KEYS = 1000;

// Distinct receipts failing together in a list or a chat full of previews still flood the JS thread, so every surface but the
// single-receipt modal is capped per window
const BURST_WINDOW_MS = 10_000;
const MAX_LINES_PER_WINDOW = 10;
const bursts = new Map<string, {windowStart: number; lineCount: number; suppressedCount: number}>();

function getReceiptSourceKind(source: string | number | undefined): ReceiptSourceKind {
    if (typeof source === 'number') {
        return 'bundled';
    }
    if (!source) {
        return 'missing';
    }
    if (source.startsWith('https:') || source.startsWith('http:')) {
        return 'remote';
    }
    if (source.startsWith('blob:')) {
        return 'blob';
    }
    if (source.startsWith('data:')) {
        return 'data';
    }
    return 'local';
}

/** Keeps signed URL tokens and large data URIs out of the dedupe key, so a rotated token still dedupes */
function getSourceIdentity(source: string | number | undefined): string {
    if (typeof source !== 'string') {
        return String(source);
    }
    if (source.startsWith('data:')) {
        return 'data';
    }
    return source.split(/[?#]/, 1).at(0) ?? '';
}

/** Returns how many lines were dropped before this one, or null when this line is over the cap and must be dropped too */
function takeBurstSlot(surface: ReceiptImageSurface, type: ImageLoadEvent['type']): number | null {
    const now = Date.now();
    const burstKey = `${surface}|${type}`;
    let burst = bursts.get(burstKey);
    if (!burst || now - burst.windowStart >= BURST_WINDOW_MS) {
        burst = {windowStart: now, lineCount: 0, suppressedCount: burst?.suppressedCount ?? 0};
        bursts.set(burstKey, burst);
    }
    if (burst.lineCount >= MAX_LINES_PER_WINDOW) {
        burst.suppressedCount++;
        return null;
    }
    burst.lineCount++;
    const suppressedCount = burst.suppressedCount;
    burst.suppressedCount = 0;
    return suppressedCount;
}

function logReceiptImageLoadEvent(transaction: OnyxEntry<Transaction>, surface: ReceiptImageSurface, event: ImageLoadEvent) {
    const transactionID = transaction?.transactionID;
    const key = [transactionID, surface, event.type, getSourceIdentity(event.source)].join('|');
    if (loggedKeys.has(key)) {
        return;
    }
    if (loggedKeys.size >= MAX_LOGGED_KEYS) {
        loggedKeys.clear();
    }
    loggedKeys.add(key);

    const suppressedCount = surface === 'modal' ? 0 : takeBurstSlot(surface, event.type);
    if (suppressedCount === null) {
        return;
    }

    const eventName = EVENT_NAMES[event.type];
    const parameters = {
        event: eventName,
        transactionID,
        receiptTraceId: transaction?.receipt?.receiptTraceId,
        surface,
        component: event.component,
        receiptSourceKind: getReceiptSourceKind(event.source),
        reason: event.type === 'stall' ? event.reason : undefined,
        afterTimeout: event.type === 'error' ? event.afterTimeout : undefined,
        receiptState: transaction?.receipt?.state,
        pendingAction: transaction?.pendingAction ?? undefined,
        isReceiptPending: !!transaction?.pendingFields?.receipt,
        hasErrors: !isEmptyObject(transaction?.errors) || !isEmptyObject(transaction?.errorFields?.receipt),
        isOffline: getIsOffline(),
        suppressedCount: suppressedCount || undefined,
    };
    const message = `${RECEIPT_LOG_PREFIX} ${eventName}`;

    // Errors and stalls are what we count. Retries and recoveries only explain what came after them
    if (event.type === 'error' || event.type === 'stall') {
        Log.hmmm(message, parameters);
        return;
    }
    Log.info(message, false, parameters);
}

function createReceiptImageLoadReporter(transaction: OnyxEntry<Transaction>, surface: ReceiptImageSurface): ImageLoadEventReporter {
    return (event) => logReceiptImageLoadEvent(transaction, surface, event);
}

function resetLoggedReceiptImageLoadEvents() {
    loggedKeys.clear();
    bursts.clear();
}

export {createReceiptImageLoadReporter, getReceiptSourceKind, resetLoggedReceiptImageLoadEvents};
