import CONST from '@src/CONST';

import type {ErrorEvent, EventHint} from '@sentry/core';

import type {TelemetryBeforeSendError} from './index';

/** Hard cap on the number of hosts we attach per list. */
const MAX_HOSTS = 100;

/**
 * Matches any absolute URL inside a stack trace:
 *   [a-z][a-z0-9+.-]*  — the scheme per RFC 3986 (https, chrome-extension, moz-extension, …)
 *   :\/\/              — the literal ://
 *   [^\s'")]+          — the rest of the URL, up to the first whitespace, quote, or closing paren
 */
const URL_IN_STACK_REGEX = /[a-z][a-z0-9+.-]*:\/\/[^\s'")]+/gi;

/**
 * Extracts only the hosts of URLs found in a raw stack trace. The raw stack itself never ships —
 * only parsed hostnames do — so paths, query strings, credentials, and message text structurally
 * cannot reach Sentry. If the regex misses a URL we lose a host, never gain unsanitized output.
 */
function getStackScriptHosts(stack: string): string[] {
    const hosts = new Set<string>();
    for (const urlToken of stack.match(URL_IN_STACK_REGEX) ?? []) {
        try {
            hosts.add(new URL(urlToken).host);
        } catch {
            // Skip unparsable URL tokens
        }
    }
    return Array.from(hosts).sort().slice(0, MAX_HOSTS);
}

/**
 * True when every parsed frame of the event hides its origin — no filename, Sentry's `app:///`
 * placeholder, or `<anonymous>` — which is the signature of code injected at runtime (tag manager
 * tags, A/B experiment variations, consent tools, browser extensions) throwing through our bundle.
 */
function hasOnlyOpaqueFrames(event: ErrorEvent): boolean {
    const frames = event.exception?.values?.flatMap((exception) => exception.stacktrace?.frames ?? []) ?? [];
    if (frames.length === 0) {
        return false;
    }
    return frames.every((frame) => {
        const filename = frame.filename ?? '';
        return filename === '' || filename === 'app:///' || filename === '<anonymous>';
    });
}

/**
 * Sentry rewrites stack frame filenames to `app:///…`, which hides the real URL of scripts injected
 * at runtime (tag manager tags, A/B experiment variations, consent tools, browser extensions), so
 * errors thrown by injected code arrive with every frame blank and never name the throwing script
 * (see GH #93837 for one instance).
 *
 * This middleware detects such errors structurally (all frames opaque) and attaches two lists of
 * hostnames: hosts referenced by the raw stack (which still knows the real script URL) and hosts of
 * scripts present on the page. Hosts only — no paths, no query strings, no free text, no PII.
 * Web only; on native the browser globals are absent and the event passes through.
 */
const enrichInjectedScriptError: TelemetryBeforeSendError = (event: ErrorEvent, hint: EventHint): ErrorEvent => {
    try {
        if (typeof document === 'undefined' || !hasOnlyOpaqueFrames(event)) {
            return event;
        }

        const extra: Record<string, unknown> = {};

        const originalException = hint.originalException;
        if (originalException instanceof Error && originalException.stack) {
            extra.stackScriptHosts = getStackScriptHosts(originalException.stack);
        }
        if (originalException !== null && typeof originalException === 'object') {
            extra.injectedScriptErrorReasonCtor = originalException.constructor?.name;
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
        extra.loadedScriptHosts = Array.from(scriptHosts).sort().slice(0, MAX_HOSTS);

        return {
            ...event,
            extra: {...event.extra, ...extra},
            tags: {...event.tags, [CONST.TELEMETRY.TAGS.INJECTED_SCRIPT_ERROR]: true},
        };
    } catch {
        // Enrichment is best-effort; never block or alter event delivery on failure
        return event;
    }
};

export default enrichInjectedScriptError;
export {getStackScriptHosts, hasOnlyOpaqueFrames};
