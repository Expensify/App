import CONST from '@src/CONST';

import type {ErrorEvent, EventHint} from '@sentry/core';

import type {TelemetryBeforeSendError} from './index';

const OPAQUE_REJECTION_MESSAGE = 'Cannot call a class as a function';

/**
 * Sentry rewrites stack frame filenames to `app:///…`, which hides the real URL of scripts injected
 * at runtime (tag manager tags, A/B experiment variations, consent tools, browser extensions). For the
 * opaque "Cannot call a class as a function" unhandled rejections (GH #93837) every frame ends up as an
 * empty `app:///`, so the events never name the throwing script.
 *
 * This middleware attaches the untouched raw stack (which still contains the real script URL) and an
 * inventory of script hosts present on the page, so the next event identifies the culprit. Hosts only —
 * no query strings, no PII. Web only; on native the browser globals are absent and the event passes through.
 */
const enrichOpaqueRejection: TelemetryBeforeSendError = (event: ErrorEvent, hint: EventHint): ErrorEvent => {
    try {
        const isOpaqueRejection = event.exception?.values?.some((exception) => exception.value?.includes(OPAQUE_REJECTION_MESSAGE)) ?? false;
        if (!isOpaqueRejection || typeof document === 'undefined') {
            return event;
        }

        const extra: Record<string, unknown> = {};

        const originalException = hint.originalException;
        if (originalException instanceof Error && originalException.stack) {
            extra.opaqueRejectionRawStack = originalException.stack;
        }
        if (originalException !== null && typeof originalException === 'object') {
            extra.opaqueRejectionReasonCtor = originalException.constructor?.name;
        }

        const scriptHosts = new Set<string>();
        for (const script of Array.from(document.scripts)) {
            if (!script.src) {
                scriptHosts.add('<inline>');
                continue;
            }
            try {
                scriptHosts.add(new URL(script.src, window.location.href).host);
            } catch {
                // Skip unparsable src values
            }
        }
        if (typeof performance !== 'undefined' && typeof performance.getEntriesByType === 'function') {
            for (const entry of performance.getEntriesByType('resource')) {
                if (!(entry instanceof PerformanceResourceTiming) || entry.initiatorType !== 'script') {
                    continue;
                }
                try {
                    scriptHosts.add(new URL(entry.name, window.location.href).host);
                } catch {
                    // Skip unparsable resource names
                }
            }
        }
        extra.loadedScriptHosts = Array.from(scriptHosts).sort();

        return {
            ...event,
            extra: {...event.extra, ...extra},
            tags: {...event.tags, [CONST.TELEMETRY.TAGS.OPAQUE_INJECTED_REJECTION]: true},
        };
    } catch {
        // Enrichment is best-effort; never block or alter event delivery on failure
        return event;
    }
};

export default enrichOpaqueRejection;
