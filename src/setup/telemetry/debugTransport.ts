import type {BaseTransportOptions, Transport, TransportRequest, TransportRequestExecutor} from '@sentry/core';
import {createTransport} from '@sentry/core';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Sentry debug settings controlled via Onyx from Troubleshoot panel.
 * These values are updated in real-time when changed in the UI.
 */
let isSentryDebugEnabled = false;
Onyx.connectWithoutView({
    key: ONYXKEYS.IS_SENTRY_DEBUG_ENABLED,
    callback: (value) => {
        isSentryDebugEnabled = value ?? false;
    },
});

let highlightedSpanOps: string[] = [];
Onyx.connectWithoutView({
    key: ONYXKEYS.SENTRY_DEBUG_HIGHLIGHTED_SPAN_OPS,
    callback: (value) => {
        highlightedSpanOps = value ?? [];
    },
});

const SENTRY_LOG_PREFIX = '[SENTRY]';

function formatLogPrefix(category: string, op?: string): string {
    if (op) {
        return `${SENTRY_LOG_PREFIX}[${category}][${op}]`;
    }
    return `${SENTRY_LOG_PREFIX}[${category}]`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
    return typeof value === 'string';
}

function hasOp(obj: Record<string, unknown>): obj is Record<string, unknown> & {op: string} {
    return 'op' in obj && isString(obj.op);
}

function hasSpansArray(obj: Record<string, unknown>): obj is Record<string, unknown> & {spans: unknown[]} {
    return 'spans' in obj && Array.isArray(obj.spans);
}

function isHighlightedSpanOp(op: string): boolean {
    return highlightedSpanOps.some((highlightedOp) => op === highlightedOp || op.startsWith(`${highlightedOp}.`));
}

function parseEnvelopeBody(body: string | Uint8Array): unknown[] {
    let bodyString: string;
    if (body instanceof Uint8Array) {
        bodyString = new TextDecoder().decode(body);
    } else {
        bodyString = body;
    }

    const lines = bodyString.split('\n').filter(Boolean);
    return lines.map((line) => {
        try {
            return JSON.parse(line) as unknown;
        } catch {
            return line;
        }
    });
}

function logSpan(span: Record<string, unknown>): void {
    const op = hasOp(span) ? span.op : undefined;
    const prefix = formatLogPrefix('SPAN', op);
    console.debug(prefix, span);
}

function processHighlightedSpans(item: unknown): void {
    if (!isRecord(item)) {
        return;
    }

    // Check if item itself is a standalone span with op
    if (hasOp(item) && isHighlightedSpanOp(item.op)) {
        logSpan(item);
    }

    // Check for spans array inside transaction (spans[].op)
    if (hasSpansArray(item)) {
        for (const span of item.spans) {
            if (isRecord(span) && hasOp(span) && isHighlightedSpanOp(span.op)) {
                logSpan(span);
            }
        }
    }
}

/**
 * Check if a log entry has [SENTRY] prefix in body.
 */
function isSentryDebugLogEntry(logEntry: unknown): boolean {
    if (!isRecord(logEntry) || !('body' in logEntry) || !isString(logEntry.body)) {
        return false;
    }
    return logEntry.body.startsWith(SENTRY_LOG_PREFIX);
}

/**
 * Check if item is a header (sdk info or type header).
 */
function isEnvelopeHeader(item: unknown): boolean {
    if (!isRecord(item)) {
        return false;
    }
    // SDK header: {"sdk": {...}}
    if ('sdk' in item && Object.keys(item).length === 1) {
        return true;
    }
    // Type header: {"type": "log", "item_count": ..., "content_type": ...}
    if ('type' in item && !('items' in item)) {
        return true;
    }
    return false;
}

/**
 * Filter out log entries with [SENTRY] prefix from items array to prevent recursive logging.
 * Returns a new items array with filtered log batches, or null if only headers remain.
 */
function filterSentryDebugLogs(items: unknown[]): unknown[] | null {
    const filtered = items
        .map((item) => {
            if (isRecord(item) && 'items' in item && Array.isArray(item.items)) {
                const filteredLogEntries = item.items.filter((logEntry: unknown) => !isSentryDebugLogEntry(logEntry));
                if (filteredLogEntries.length === 0) {
                    return null;
                }
                return {...item, items: filteredLogEntries};
            }
            return item;
        })
        .filter((item) => item !== null);

    const hasActualData = filtered.some((item) => !isEnvelopeHeader(item));
    if (!hasActualData) {
        return null;
    }

    return filtered;
}

function processEnvelopeItems(items: unknown[]): void {
    // Filter out [SENTRY] debug logs from items to prevent recursive logging
    const filteredItems = filterSentryDebugLogs(items);

    // Skip if nothing left after filtering (only headers remain)
    if (filteredItems === null) {
        return;
    }

    console.debug(formatLogPrefix('REQUEST'), filteredItems);

    for (const item of filteredItems) {
        processHighlightedSpans(item);
    }
}

function makeDebugTransport(options: BaseTransportOptions): Transport {
    const makeRequest: TransportRequestExecutor = (request: TransportRequest) => {
        if (isSentryDebugEnabled) {
            const items = parseEnvelopeBody(request.body);
            processEnvelopeItems(items);
        }

        return Promise.resolve({
            statusCode: 200,
        });
    };

    return createTransport(options, makeRequest);
}

export default makeDebugTransport;
