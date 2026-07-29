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

/**
 * Matches the basename our web bundles are emitted with, e.g. `app:///main-33e5c3ee04228117.bundle.js`
 * (`[name]-[contenthash].bundle.js` in release builds, the only builds that report to Sentry). The
 * content hash is required so a third-party script that happens to be named `*.bundle.js` cannot be
 * mistaken for our code.
 */
const OWN_BUNDLE_REGEX = /-[0-9a-f]{8,}\.bundle\.js\b/;

/**
 * Schemes whose "host" is a UUID generated per extension installation, so it identifies one browser
 * profile rather than the extension. We report the scheme instead. Chrome's extension IDs are shared
 * by every user of an extension, so they are not listed here.
 */
const PER_INSTALL_ID_SCHEMES = new Set(['moz-extension:', 'safari-web-extension:', 'safari-extension:']);

/**
 * Minimum content length before a script is digested. A script that short cannot be the ~100KB blob
 * we are hunting, so digesting it would only add noise.
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
    // cspell:disable-next-line
    {key: 'convert', pattern: /_conv_|convertexperiments/i},
    {key: 'expensify', pattern: /expensify|onyx/i},
    {key: 'fullstory', pattern: /_fs_|fullstory/i},
    // Our own GTM loader in `web/index.html` matches this, so `gtm` is expected on every web page load
    // and is not on its own a signal. `hasNonce` is what separates our loader from anything injected later.
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
    /**
     * True when the script exceeded the scan budget and only its metadata was recorded: `len` and
     * `hasNonce` are real, while `lines`, `lenAtFrameLine`, `bracketsFrameCol`, `markers`, and `hash`
     * carry their sentinel values.
     */
    skipped: boolean;
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
function getStackScriptHosts(stack: string): {hosts: string[]; truncated: boolean} {
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
    return {hosts: Array.from(hosts).sort().slice(0, MAX_HOSTS), truncated: hosts.size > MAX_HOSTS};
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
function hasOnlyOpaqueFrames(frames: StackFrame[]): boolean {
    return frames.every((frame) => OPAQUE_FILENAMES.has(frame.filename ?? ''));
}

/**
 * True when the event is one of the errors we are diagnosing. Thrown `Error`s carry their text in
 * `exception.values[].value`, but `captureMessage` and rejections whose reason is not an `Error` land
 * in `event.message` with no `exception` at all, so both have to be checked.
 */
function hasTargetedMessage(event: ErrorEvent): boolean {
    const texts = [typeof event.message === 'string' ? event.message : '', ...(event.exception?.values ?? []).map((exception) => exception.value ?? '')];
    return texts.some((text) => TARGETED_MESSAGES.some((message) => text.includes(message)));
}

/**
 * The innermost frame that reports both a line and a column. Sentry orders frames outermost first, so
 * the throwing frame is the last one, and its coordinates are what we match inline scripts against.
 */
function getOpaqueFrameLocation(frames: StackFrame[]): FrameLocation | undefined {
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
        if (shapes.length >= MAX_INLINE_SCRIPTS) {
            truncated = true;
            break;
        }
        const content = script.textContent ?? '';
        // A script over the remaining budget is not content-scanned, but it must stay visible: a giant
        // inline blob is the prime suspect, so a metadata-only shape is pushed (`len` and `hasNonce`
        // cost nothing) and the scan continues, since the blob we are hunting can sit anywhere in
        // `document.scripts` and one oversized script must not hide it
        if (scannedChars + content.length > MAX_SCANNED_CHARS) {
            truncated = true;
            shapes.push({len: content.length, lines: -1, lenAtFrameLine: -1, bracketsFrameCol: false, hasNonce: !!script.nonce, markers: [], hash: '', skipped: true});
            continue;
        }
        scannedChars += content.length;

        const lines = content.split('\n');
        // Frame line numbers are 1-based, but `lineno: 0` does occur on minified and injected frames.
        // `Array.at` reads a negative index from the end, so the index has to be guarded explicitly
        const lineIndex = location ? location.lineno - 1 : -1;
        const lenAtFrameLine = lineIndex >= 0 ? (lines.at(lineIndex)?.length ?? -1) : -1;
        shapes.push({
            len: content.length,
            lines: lines.length,
            lenAtFrameLine,
            // `colno: 0` occurs on minified and injected frames the same way `lineno: 0` does, and any
            // existing line satisfies `length >= 0`, so a non-positive column must not bracket vacuously
            bracketsFrameCol: !!location && location.colno >= 1 && lenAtFrameLine >= location.colno,
            hasNonce: !!script.nonce,
            markers: VENDOR_MARKERS.filter((marker) => marker.pattern.test(content)).map((marker) => marker.key),
            hash: content.length >= MIN_HASHED_CHARS ? hashScriptContent(content) : '',
            skipped: false,
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
 * Booleans and counts taken from the raw stack. `referencesOwnBundle` is the decisive one: a stack
 * that never names one of our bundles has no Expensify JavaScript on it. `[name]-[contenthash].bundle.js`
 * is stock webpack naming rather than Expensify-specific, so a frame only counts as our bundle when its
 * line also carries our origin — bundles are always served from the page's own origin (`assetPrefix: '/'`),
 * so requiring both costs no true positives. No part of the stack text itself is sent.
 */
function describeRawStack(stack: string, origin: string): {lineCount: number; referencesOwnBundle: boolean; referencesOwnOrigin: boolean} {
    const lines = stack.split('\n');
    // A stack URL always has a path, so matching `origin/` cannot match a superstring host like `${origin}.evil.example`
    const originWithSlash = origin ? `${origin}/` : '';
    return {
        lineCount: lines.length,
        referencesOwnBundle: !!originWithSlash && lines.some((line) => line.includes(originWithSlash) && OWN_BUNDLE_REGEX.test(line)),
        referencesOwnOrigin: !!originWithSlash && stack.includes(originWithSlash),
    };
}

/**
 * Hosts of every script the page loaded, from both the DOM and the resource timeline. Takes the same
 * snapshot of `document.scripts` the inline pass used, so both lists describe one state of the page.
 */
function getLoadedScriptHosts(scripts: ScriptLike[]): {hosts: string[]; truncated: boolean} {
    const scriptHosts = new Set<string>();
    for (const script of scripts) {
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
    // Browsers cap the resource timing buffer (commonly 250 entries), so a script loaded after the buffer
    // filled never appears here — a host missing from this pass is not proof it never loaded. The DOM pass
    // above still covers every script element currently on the page.
    if (typeof performance !== 'undefined' && typeof performance.getEntriesByType === 'function' && typeof PerformanceResourceTiming !== 'undefined') {
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
 * Web only: native resolves `enrichInjectedScriptError.ts`, which passes every event through untouched
 * so none of this DOM code is bundled there.
 */
const enrichInjectedScriptError: TelemetryBeforeSendError = (event: ErrorEvent, hint: EventHint): ErrorEvent => {
    try {
        // Cheap guards first: most events bail on the message check, so frames are only parsed for the few
        // that pass. The `document` check is not dead code even though this module only resolves on web:
        // it guards non-DOM contexts (workers, test environments without jsdom).
        if (typeof document === 'undefined' || !hasTargetedMessage(event)) {
            return event;
        }
        const frames = getFrames(event);
        if (!hasOnlyOpaqueFrames(frames)) {
            return event;
        }

        const extra: Record<string, unknown> = {};
        const location = getOpaqueFrameLocation(frames);
        const scripts = Array.from(document.scripts);
        const {shapes, truncated: inlineTruncated} = describeInlineScripts(scripts, location);
        const {hosts, truncated: hostsTruncated} = getLoadedScriptHosts(scripts);
        const frameSource = getFrameSource(shapes, location);

        // Duck-typed rather than `instanceof Error`: exceptions thrown across realms (iframes, extension
        // content scripts) fail instanceof, and injected-script scenarios are exactly where those show up.
        // Downstream consumers emit only parsed hosts and counts, so any string is safe to accept here.
        const originalException = hint.originalException;
        const exceptionStack = typeof originalException === 'object' && originalException !== null && 'stack' in originalException ? originalException.stack : undefined;
        const rawStack = typeof exceptionStack === 'string' ? exceptionStack : undefined;
        const {hosts: stackHosts, truncated: stackHostsTruncated} = rawStack ? getStackScriptHosts(rawStack) : {hosts: [], truncated: false};
        const rawStackShape = rawStack ? describeRawStack(rawStack, window.location.origin) : undefined;

        extra.injectedScriptFrame = {
            lineno: location?.lineno ?? -1,
            colno: location?.colno ?? -1,
            frameCount: frames.length,
            source: frameSource,
        };
        extra.injectedScriptInlineShapes = shapes;
        extra.loadedScriptHosts = hosts;
        // Split per list so a `true` says exactly which cap was hit — an absent host is only evidence of
        // absence when the list that would have carried it was not the one truncated
        extra.injectedScriptTruncated = {inline: inlineTruncated, hosts: hostsTruncated, stackHosts: stackHostsTruncated};

        if (rawStack) {
            extra.stackScriptHosts = stackHosts;
            extra.injectedScriptRawStack = rawStackShape;
        }

        return {
            ...event,
            extra: {...event.extra, ...extra},
            // Sentry indexes tags but not `extra`, so the two bits that decide "our code or someone else's"
            // are tagged as well: only tags can be filtered and aggregated in issue search and Discover.
            // Values are strings because Sentry stringifies tags on ingest anyway, and the own-bundle tag
            // is tri-state — writing `'unknown'` next to booleans invites a `Boolean(…)` that collapses it.
            tags: {
                ...event.tags,
                [CONST.TELEMETRY.TAGS.INJECTED_SCRIPT_ERROR]: 'true',
                [CONST.TELEMETRY.TAGS.INJECTED_SCRIPT_FRAME_SOURCE]: frameSource,
                [CONST.TELEMETRY.TAGS.INJECTED_SCRIPT_OWN_BUNDLE_ON_STACK]: rawStackShape ? String(rawStackShape.referencesOwnBundle) : 'unknown',
            },
        };
    } catch {
        // Enrichment is best-effort; never block or alter event delivery on failure
        return event;
    }
};

export default enrichInjectedScriptError;
export {FRAME_SOURCE, describeInlineScripts, describeRawStack, getFrameSource, getFrames, getOpaqueFrameLocation, getStackScriptHosts, hasOnlyOpaqueFrames, hashScriptContent};
