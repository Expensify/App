import CONST from '@src/CONST';

import type {ErrorEvent, EventHint, StackFrame} from '@sentry/core';

import type {TelemetryBeforeSendError} from './index';

/** Hard cap on the number of hosts we attach per list. */
const MAX_HOSTS = 100;

/** Hard cap on the number of inline scripts we describe. */
const MAX_INLINE_SCRIPTS = 25;

/** Hard cap on the characters we scan across all inline scripts, so enrichment stays cheap on pathological pages. */
const MAX_SCANNED_CHARS = 512 * 1024;

/**
 * Error messages we are actively diagnosing. Enrichment only runs for these, which keeps the
 * `injected_script_error` filter precise and keeps us from attaching diagnostics to unrelated errors.
 * `Cannot call a class as a function` is the text Babel's `_classCallCheck` helper throws (GH #93837).
 */
const TARGETED_MESSAGES = ['Cannot call a class as a function'];

/**
 * Filenames that carry no origin once Sentry's rewrite-frames integration has run. A bare `app:///`
 * means the original URL ended in `/` — the document itself, i.e. an inline script. Frames for real
 * script URLs keep their basename (`app:///tag.js`, `app:///main-<hash>.bundle.js`) and are therefore
 * NOT opaque: treating them as opaque would match every first-party error too.
 */
const OPAQUE_FILENAMES = new Set(['', 'app:///', 'app:///<anonymous>', 'app:///[native code]', '<anonymous>', '[native code]', 'native']);

/** Matches the basename our web bundles are emitted with, e.g. `app:///main-33e5c3ee04228117.bundle.js`. */
const OWN_BUNDLE_REGEX = /\.bundle\.js/;

/**
 * Schemes whose "host" is a UUID generated per extension installation, so it identifies one browser
 * profile rather than the extension. We report the scheme instead. Chrome's extension IDs are shared
 * by every user of an extension, so they are not listed here.
 */
const PER_INSTALL_ID_SCHEMES = new Set(['moz-extension:', 'safari-web-extension:', 'safari-extension:']);

/**
 * Minimum content length before a script is digested. A digest of a very short script is a value a
 * dictionary attack could recover, and a script that short cannot be the ~100KB blob we are hunting.
 */
const MIN_HASHED_CHARS = 512;

/**
 * Where a frame's code lives. Derived locally from numeric comparisons only, so the verdict can be
 * read straight off the Sentry event without any page content being sent.
 */
const FRAME_SOURCE = {
    /** An inline script on the page is long enough to contain the reported line:column. */
    INLINE_SCRIPT: 'inline-script',
    /** Inline scripts exist, but none of them reaches the reported line:column. */
    NO_INLINE_MATCH: 'no-inline-script-match',
    /** The page has no inline scripts at all. */
    NO_INLINE_SCRIPTS: 'no-inline-scripts',
    /** No frame carried both a line and a column, so no comparison was possible. */
    UNKNOWN: 'unknown-frame-location',
} as const;

/**
 * Vendor fingerprints. Only the `key` is ever sent, never the matched text or its surroundings, so
 * this identifies the injecting party without shipping any script content.
 */
const VENDOR_MARKERS = [
    {key: 'babel-class-helper', pattern: /classCallCheck|Cannot call a class as a function/},
    {key: 'clarity', pattern: /clarity\.ms|window\.clarity/i},
    {key: 'convert', pattern: /_conv_|convertexperiments/i},
    {key: 'expensify', pattern: /expensify|new\.expensify|onyx/i},
    {key: 'fullstory', pattern: /_fs_|fullstory/i},
    {key: 'gtm', pattern: /googletagmanager|dataLayer|gtm\./i},
    {key: 'hotjar', pattern: /hotjar|_hjSettings/i},
    {key: 'ketch', pattern: /ketchcdn|window\.ketch/i},
    {key: 'optimizely', pattern: /optimizely/i},
    {key: 'segment', pattern: /cdn\.segment\.com|analytics\.load/i},
] as const;

/**
 * Matches any absolute URL inside a stack trace:
 *   [a-z][a-z0-9+.-]*  — the scheme per RFC 3986 (https, chrome-extension, moz-extension, …)
 *   :\/\/              — the literal ://
 *   [^\s'")]+          — the rest of the URL, up to the first whitespace, quote, or closing paren
 */
const URL_IN_STACK_REGEX = /[a-z][a-z0-9+.-]*:\/\/[^\s'")]+/gi;

/** Numeric-only description of one inline script, used to locate the code a frame points at. */
type InlineScriptShape = {
    /** Total characters of the script. */
    len: number;
    /** Number of lines in the script. */
    lines: number;
    /** Length of the line the frame points at, or -1 when the script has no such line. */
    lenAtFrameLine: number;
    /** Whether that line is long enough to contain the frame's column, i.e. the frame can live here. */
    bracketsFrameCol: boolean;
    /** Whether the script element carries a CSP nonce. Scripts injected after page load usually do not. */
    hasNonce: boolean;
    /** Keys of the vendor fingerprints found in the content. Keys only, never the matched text. */
    markers: string[];
    /**
     * 32-bit digest of the content, deliberately lossy: it groups identical scripts, it cannot be
     * reversed. Empty for scripts shorter than `MIN_HASHED_CHARS`.
     */
    hash: string;
};

/** The minimum shape of a script element we need, so this stays testable without a DOM. */
type ScriptLike = {
    src: string;
    textContent: string | null;
    nonce?: string;
};

/** A frame's reported position in its file. */
type FrameLocation = {
    lineno: number;
    colno: number;
};

/**
 * Reduces a URL to the part that names the code's origin and nothing else: its host. Paths, query
 * strings, fragments, and `user:password@` credentials are dropped by construction.
 *
 * Firefox and Safari address extension resources through a UUID that is generated per installation,
 * so that "host" is a stable pseudonymous identifier for one browser profile rather than a name for
 * the extension. Those are reduced to the scheme, which is all the diagnosis needs. Chrome extension
 * IDs are the same for every user of a given extension, so they are kept — they name the extension.
 */
function getReportableHost(url: string, base?: string): string | undefined {
    const {protocol, host} = new URL(url, base);
    if (PER_INSTALL_ID_SCHEMES.has(protocol)) {
        return protocol.replace(':', '');
    }
    return host || undefined;
}

/**
 * Extracts only the hosts of URLs found in a raw stack trace. The raw stack itself never ships —
 * only parsed hostnames do — so paths, query strings, credentials, and message text structurally
 * cannot reach Sentry. If the regex misses a URL we lose a host, never gain unsanitized output.
 */
function getStackScriptHosts(stack: string): string[] {
    const hosts = new Set<string>();
    for (const urlToken of stack.match(URL_IN_STACK_REGEX) ?? []) {
        try {
            const host = getReportableHost(urlToken);
            if (host) {
                hosts.add(host);
            }
        } catch {
            // Skip unparsable URL tokens
        }
    }
    return Array.from(hosts).sort().slice(0, MAX_HOSTS);
}

function getFrames(event: ErrorEvent): StackFrame[] {
    return event.exception?.values?.flatMap((exception) => exception.stacktrace?.frames ?? []) ?? [];
}

/**
 * True when every parsed frame of the event hides its origin, which is the signature of code injected
 * at runtime (tag manager tags, A/B experiment variations, consent tools, browser extensions) throwing
 * through our page. Events with no frames also qualify: an opaque cross-origin throw can arrive with
 * none, and page-level diagnostics are then the only signal available.
 */
function hasOnlyOpaqueFrames(event: ErrorEvent): boolean {
    return getFrames(event).every((frame) => OPAQUE_FILENAMES.has(frame.filename ?? ''));
}

/** True when the event is one of the errors we are diagnosing. */
function hasTargetedMessage(event: ErrorEvent): boolean {
    return (event.exception?.values ?? []).some((exception) => TARGETED_MESSAGES.some((message) => (exception.value ?? '').includes(message)));
}

/**
 * The innermost frame that reports both a line and a column. Sentry orders frames outermost first, so
 * the throwing frame is the last one, and its coordinates are what we match inline scripts against.
 */
function getOpaqueFrameLocation(event: ErrorEvent): FrameLocation | undefined {
    const frames = getFrames(event);
    for (let index = frames.length - 1; index >= 0; index--) {
        const {lineno, colno} = frames.at(index) ?? {};
        if (typeof lineno === 'number' && typeof colno === 'number') {
            return {lineno, colno};
        }
    }
    return undefined;
}

/**
 * djb2 digest of a script's content, emitted in base 36. Deliberately a 32-bit non-cryptographic hash:
 * enough to tell "the same script threw again" and to match against a candidate script we hash locally,
 * far too lossy to carry anything the content contained.
 */
function hashScriptContent(content: string): string {
    let hash = 5381;
    for (let index = 0; index < content.length; index++) {
        // eslint-disable-next-line no-bitwise
        hash = ((hash << 5) + hash + content.charCodeAt(index)) | 0;
    }
    // eslint-disable-next-line no-bitwise
    return (hash >>> 0).toString(36);
}

/**
 * Describes the page's inline scripts numerically so the frame's line:column can be located without
 * sending any script content. An inline script whose `bracketsFrameCol` is true is where the code ran:
 * our own inline scripts in `web/index.html` are a few short lines, so a match with thousands of
 * characters on a single line is code someone else put on the page.
 */
function describeInlineScripts(scripts: ScriptLike[], location: FrameLocation | undefined): {shapes: InlineScriptShape[]; truncated: boolean} {
    const shapes: InlineScriptShape[] = [];
    let scannedChars = 0;
    let truncated = false;

    for (const script of scripts) {
        // Scripts with a src are covered by `loadedScriptHosts`; only inline content needs locating
        if (script.src) {
            continue;
        }
        const content = script.textContent ?? '';
        if (shapes.length >= MAX_INLINE_SCRIPTS || scannedChars + content.length > MAX_SCANNED_CHARS) {
            truncated = true;
            break;
        }
        scannedChars += content.length;

        const lines = content.split('\n');
        const lenAtFrameLine = location ? (lines.at(location.lineno - 1)?.length ?? -1) : -1;
        shapes.push({
            len: content.length,
            lines: lines.length,
            lenAtFrameLine,
            bracketsFrameCol: !!location && lenAtFrameLine >= location.colno,
            hasNonce: !!script.nonce,
            markers: VENDOR_MARKERS.filter((marker) => marker.pattern.test(content)).map((marker) => marker.key),
            hash: content.length >= MIN_HASHED_CHARS ? hashScriptContent(content) : '',
        });
    }

    return {shapes, truncated};
}

/** Which of the described inline scripts, if any, the frame's coordinates fall inside. */
function getFrameSource(shapes: InlineScriptShape[], location: FrameLocation | undefined): (typeof FRAME_SOURCE)[keyof typeof FRAME_SOURCE] {
    if (shapes.length === 0) {
        return FRAME_SOURCE.NO_INLINE_SCRIPTS;
    }
    if (!location) {
        return FRAME_SOURCE.UNKNOWN;
    }
    return shapes.some((shape) => shape.bracketsFrameCol) ? FRAME_SOURCE.INLINE_SCRIPT : FRAME_SOURCE.NO_INLINE_MATCH;
}

/**
 * Booleans and counts taken from the raw stack. `referencesOwnBundle` is the decisive one: our web
 * bundles are the only scripts named `*.bundle.js`, so a stack that never names one has no Expensify
 * JavaScript on it. No part of the stack text itself is sent.
 */
function describeRawStack(stack: string, origin: string): {lineCount: number; referencesOwnBundle: boolean; referencesOwnOrigin: boolean} {
    return {
        lineCount: stack.split('\n').length,
        referencesOwnBundle: OWN_BUNDLE_REGEX.test(stack),
        referencesOwnOrigin: !!origin && stack.includes(origin),
    };
}

/** Hosts of every script the page loaded, from both the DOM and the resource timeline. */
function getLoadedScriptHosts(): {hosts: string[]; truncated: boolean} {
    const scriptHosts = new Set<string>();
    for (const script of Array.from(document.scripts)) {
        // Inline scripts have no hostname, so they are skipped to keep `loadedScriptHosts` host-only
        if (!script.src) {
            continue;
        }
        try {
            const host = getReportableHost(script.src, window.location.href);
            if (host) {
                scriptHosts.add(host);
            }
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
                const host = getReportableHost(entry.name, window.location.href);
                if (host) {
                    scriptHosts.add(host);
                }
            } catch {
                // Skip unparsable resource names
            }
        }
    }
    return {hosts: Array.from(scriptHosts).sort().slice(0, MAX_HOSTS), truncated: scriptHosts.size > MAX_HOSTS};
}

/**
 * Sentry's rewrite-frames integration replaces a frame's filename with `app:///` plus its basename and
 * deletes `abs_path`, so a frame whose original URL ended in `/` — the document, i.e. an inline script —
 * arrives as a bare `app:///` with no origin at all. Errors thrown by code injected into the page at
 * runtime (tag manager tags, A/B experiment variations, consent tools, browser extensions) look exactly
 * like that and never name the throwing script (see GH #93837).
 *
 * For the errors listed in `TARGETED_MESSAGES` that arrive with only opaque frames, this middleware
 * attaches evidence for a single question: did our code throw, or did someone else's? It sends script
 * hostnames, the numeric shape of the page's inline scripts, vendor fingerprint keys from a fixed
 * allowlist, and a lossy digest per inline script. It never sends script content, stack text, URL paths,
 * query strings, or any free text, so secrets and user data structurally cannot reach Sentry.
 *
 * Web only; on native the browser globals are absent and the event passes through untouched.
 */
const enrichInjectedScriptError: TelemetryBeforeSendError = (event: ErrorEvent, hint: EventHint): ErrorEvent => {
    try {
        if (typeof document === 'undefined' || !hasTargetedMessage(event) || !hasOnlyOpaqueFrames(event)) {
            return event;
        }

        const extra: Record<string, unknown> = {};
        const location = getOpaqueFrameLocation(event);
        const {shapes, truncated: inlineTruncated} = describeInlineScripts(Array.from(document.scripts), location);
        const {hosts, truncated: hostsTruncated} = getLoadedScriptHosts();
        const frameSource = getFrameSource(shapes, location);

        extra.injectedScriptFrame = {
            lineno: location?.lineno ?? -1,
            colno: location?.colno ?? -1,
            frameCount: getFrames(event).length,
            source: frameSource,
        };
        extra.injectedScriptInlineShapes = shapes;
        extra.loadedScriptHosts = hosts;
        extra.injectedScriptTruncated = inlineTruncated || hostsTruncated;

        const originalException = hint.originalException;
        const rawStack = originalException instanceof Error ? originalException.stack : undefined;
        if (rawStack) {
            extra.stackScriptHosts = getStackScriptHosts(rawStack);
            extra.injectedScriptRawStack = describeRawStack(rawStack, window.location.origin);
        }

        return {
            ...event,
            extra: {...event.extra, ...extra},
            // Sentry indexes tags but not `extra`, so the two bits that decide "our code or someone else's"
            // are tagged as well: only tags can be filtered and aggregated in issue search and Discover.
            tags: {
                ...event.tags,
                [CONST.TELEMETRY.TAGS.INJECTED_SCRIPT_ERROR]: true,
                [CONST.TELEMETRY.TAGS.INJECTED_SCRIPT_FRAME_SOURCE]: frameSource,
                [CONST.TELEMETRY.TAGS.INJECTED_SCRIPT_OWN_BUNDLE_ON_STACK]: rawStack ? OWN_BUNDLE_REGEX.test(rawStack) : 'unknown',
            },
        };
    } catch {
        // Enrichment is best-effort; never block or alter event delivery on failure
        return event;
    }
};

export default enrichInjectedScriptError;
export {FRAME_SOURCE, describeInlineScripts, describeRawStack, getFrameSource, getOpaqueFrameLocation, getStackScriptHosts, hasOnlyOpaqueFrames, hashScriptContent};
