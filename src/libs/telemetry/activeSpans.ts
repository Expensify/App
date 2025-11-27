import type {StartSpanOptions} from '@sentry/core';
import * as Sentry from '@sentry/react-native';
import CONST from '@src/CONST';

const activeSpans = new Map<string, ReturnType<typeof Sentry.startInactiveSpan>>();
const activeTimeouts = new Map<string, NodeJS.Timeout>();

function startSpan(spanId: string, options: StartSpanOptions, timeoutMs?: number) {
    // End any existing span for this name
    cancelSpan(spanId);

    const span = Sentry.startInactiveSpan(options);

    if (span) {
        activeSpans.set(spanId, span);
        // Set up timeout if provided
        if (timeoutMs) {
            const timeoutId = setTimeout(() => {
                cancelSpan(spanId, {
                    [CONST.TELEMETRY.ATTRIBUTE_EXCEEDED_TIMEOUT]: true,
                });
            }, timeoutMs);
            activeTimeouts.set(spanId, timeoutId);
        }
    }

    return span;
}

function endSpan(spanId: string) {
    const span = activeSpans.get(spanId);

    if (!span) {
        return;
    }

    const timeoutId = activeTimeouts.get(spanId);
    if (timeoutId) {
        clearTimeout(timeoutId);
        activeTimeouts.delete(spanId);
    }
    span.setStatus({code: 1});
    span.end();
    activeSpans.delete(spanId);
}

function cancelSpan(spanId: string, additionalAttributes?: Record<string, unknown>) {
    const span = activeSpans.get(spanId);

    if (span) {
        span.setAttribute(CONST.TELEMETRY.ATTRIBUTE_CANCELED, true);
        if (additionalAttributes) {
            Object.entries(additionalAttributes).forEach(([key, value]) => {
                span.setAttribute(key, value as string | number | boolean);
            });
        }

        // In Sentry there are only OK or ERROR status codes.
        // We treat canceled spans as OK so we have ability to properly track spans that are not finished at all (their status would be different)
        span.setStatus({code: 1});
    }

    endSpan(spanId);
}

function getSpan(spanId: string) {
    return activeSpans.get(spanId);
}

export {startSpan, endSpan, getSpan, cancelSpan};
