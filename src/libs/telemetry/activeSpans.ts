import type {StartSpanOptions} from '@sentry/core';
import * as Sentry from '@sentry/react-native';
import CONST from '@src/CONST';

const DURATION_THRESHOLD_MS = 180000; // 3 minutes

const activeSpans = new Map<string, ReturnType<typeof Sentry.startInactiveSpan>>();
const spanStartTimes = new Map<string, number>();

function startSpan(spanId: string, options: StartSpanOptions) {
    // End any existing span for this name
    endSpan(spanId);

    const span = Sentry.startInactiveSpan(options);

    if (span) {
        activeSpans.set(spanId, span);
        spanStartTimes.set(spanId, Date.now());
    }

    return span;
}

function endSpan(spanId: string) {
    const span = activeSpans.get(spanId);
    const startTime = spanStartTimes.get(spanId);

    if (!span) {
        return;
    }

    const durationMs = Date.now() - (startTime ?? Date.now());
    if (durationMs > DURATION_THRESHOLD_MS) {
        span.setAttribute(CONST.TELEMETRY.ATTRIBUTE_EXCESSIVE_DURATION, true);
    }
    span.end();
    activeSpans.delete(spanId);
}

export {startSpan, endSpan};
