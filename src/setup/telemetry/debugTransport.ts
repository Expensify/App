import type {BaseTransportOptions, Transport, TransportRequest, TransportRequestExecutor} from '@sentry/core';
import {createTransport} from '@sentry/core';

/**
 * Enable this to log Sentry requests to console in development.
 * Sentry requests are NOT sent to Sentry servers in development.
 */
const DEBUG_SENTRY_ENABLED = false;

/**
 * List of span operations to highlight in debug logs.
 * Add span.op values here to see detailed logs for specific operations.
 * Note: span.op in code corresponds to span.name in Sentry dashboard.
 * Example: ['ui.interaction.click', 'ui.interaction.scroll', 'ui.load', 'navigation']
 */
const HIGHLIGHTED_SPAN_OPS: string[] = [''];

function formatLogPrefix(category: string, op?: string): string {
    if (op) {
        return `[SENTRY][${category}][${op}]`;
    }
    return `[SENTRY][${category}]`;
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
    return HIGHLIGHTED_SPAN_OPS.some((highlightedOp) => op === highlightedOp || op.startsWith(`${highlightedOp}.`));
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

function processEnvelopeItems(items: unknown[]): void {
    console.debug(formatLogPrefix('REQUEST'), items);

    for (const item of items) {
        processHighlightedSpans(item);
    }
}

function makeDebugTransport(options: BaseTransportOptions): Transport {
    const makeRequest: TransportRequestExecutor = (request: TransportRequest) => {
        if (DEBUG_SENTRY_ENABLED) {
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
export {DEBUG_SENTRY_ENABLED};
