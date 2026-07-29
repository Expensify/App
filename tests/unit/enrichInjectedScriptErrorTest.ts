import enrichInjectedScriptErrorNative from '@libs/telemetry/middlewares/enrichInjectedScriptError';
import enrichInjectedScriptError, {
    describeInlineScripts,
    describeRawStack,
    FRAME_SOURCE,
    getFrames,
    getFrameSource,
    getOpaqueFrameLocation,
    getStackScriptHosts,
    hasOnlyOpaqueFrames,
    hashScriptContent,
} from '@libs/telemetry/middlewares/enrichInjectedScriptError.web';

import CONST from '@src/CONST';

import type {ErrorEvent, EventHint} from '@sentry/core';

const TARGET_MESSAGE = 'Cannot call a class as a function';

/**
 * Every string we send has to be a hostname, a fixed enum value, a marker key, or a base-36 digest.
 * None of those can contain a space, a slash, a `?`, or an `=`, so this pattern fails the moment a
 * future field starts carrying free text, script content, or a URL with a query string.
 */
const SAFE_STRING_REGEX = /^[a-z0-9.:-]*$/i;

function buildEvent(filenames: Array<string | undefined>, message = TARGET_MESSAGE, location?: {lineno: number; colno: number}): ErrorEvent {
    return {
        type: undefined,
        exception: {
            values: [
                {
                    value: message,
                    stacktrace: {frames: filenames.map((filename) => ({filename, lineno: location?.lineno, colno: location?.colno}))},
                },
            ],
        },
    };
}

function buildHint(stack?: string): EventHint {
    if (stack === undefined) {
        return {};
    }
    const error = new Error(TARGET_MESSAGE);
    error.stack = stack;
    return {originalException: error};
}

function addScript({content, src}: {content?: string; src?: string}): void {
    const script = document.createElement('script');
    // A non-JavaScript type keeps jsdom from executing or fetching the fixture; `document.scripts` still lists it
    script.type = 'text/plain';
    if (src) {
        script.src = src;
    }
    if (content) {
        script.textContent = content;
    }
    document.head.appendChild(script);
}

/** Collects every string found anywhere in the enrichment payload, however deeply nested. */
function collectStrings(value: unknown, found: string[] = []): string[] {
    if (typeof value === 'string') {
        found.push(value);
    } else if (Array.isArray(value)) {
        for (const item of value) {
            collectStrings(item, found);
        }
    } else if (value !== null && typeof value === 'object') {
        for (const item of Object.values(value)) {
            collectStrings(item, found);
        }
    }
    return found;
}

describe('enrichInjectedScriptError', () => {
    afterEach(() => {
        document.head.innerHTML = '';
    });

    describe('getStackScriptHosts', () => {
        it('returns only hostnames, never paths, query strings, or credentials', () => {
            const stack = [
                'TypeError: something broke for bob@corp.com',
                '    at fn (https://cdn.example.com/tag.js?token=SECRET123:12:34)',
                '    at https://user:hunter2@third.example.com/x.js:1:2',
                'g@https://y.example.com/b.js#access_token=SECRET:3:4',
            ].join('\n');
            const {hosts} = getStackScriptHosts(stack);
            expect(hosts).toEqual(['cdn.example.com', 'third.example.com', 'y.example.com']);
        });

        it('keeps the port as part of the host', () => {
            expect(getStackScriptHosts('    at fn (https://host.example.com:8082/app.js:3:4)').hosts).toEqual(['host.example.com:8082']);
        });

        it('keeps Chrome extension ids, which name the extension rather than the user', () => {
            expect(getStackScriptHosts('    at inj (chrome-extension://abcdefghijklmnop/content.js:3:4)').hosts).toEqual(['abcdefghijklmnop']);
        });

        it('reduces per-installation extension uuids to their scheme', () => {
            const stack = [
                '    at a (moz-extension://3f2b1c8e-0000-4a1d-9f00-aaaabbbbcccc/inject.js:1:2)',
                '    at b (safari-web-extension://11112222-3333-4444-5555-666677778888/inject.js:1:2)',
            ].join('\n');
            expect(getStackScriptHosts(stack).hosts).toEqual(['moz-extension', 'safari-web-extension']);
            expect(getStackScriptHosts(stack).hosts.join()).not.toContain('3f2b1c8e');
        });

        it('drops URLs that have no host at all', () => {
            expect(getStackScriptHosts('    at f (file:///Users/someone/Desktop/notes.js:1:2)').hosts).toEqual([]);
        });

        it('ignores data: URLs and unparsable tokens', () => {
            expect(getStackScriptHosts('    at d (data:text/javascript;base64,U0VDUkVU:1:1)').hosts).toEqual([]);
        });

        it('deduplicates hosts', () => {
            const stack = '    at a (https://cdn.example.com/a.js:1:1)\n    at b (https://cdn.example.com/b.js:2:2)';
            expect(getStackScriptHosts(stack).hosts).toEqual(['cdn.example.com']);
        });

        it('returns an empty list for a stack without URLs', () => {
            expect(getStackScriptHosts('Error: x\n    at fn (<anonymous>:1:1)').hosts).toEqual([]);
        });

        it('caps the host list and reports the truncation', () => {
            const stack = Array.from({length: 120}, (value, index) => `    at f (https://h${index}.example.com/a.js:1:1)`).join('\n');
            const {hosts, truncated} = getStackScriptHosts(stack);
            expect(hosts).toHaveLength(100);
            expect(truncated).toBe(true);
        });
    });

    describe('hasOnlyOpaqueFrames', () => {
        it('returns true when every frame lost its origin to the rewrite-frames integration', () => {
            expect(hasOnlyOpaqueFrames(getFrames(buildEvent(['app:///', 'app:///<anonymous>', 'app:///[native code]', undefined])))).toBe(true);
        });

        it('returns false when any frame still names a file, including our own bundles', () => {
            expect(hasOnlyOpaqueFrames(getFrames(buildEvent(['app:///', 'app:///main-33e5c3ee04228117.bundle.js'])))).toBe(false);
            expect(hasOnlyOpaqueFrames(getFrames(buildEvent(['app:///', 'app:///tag.js'])))).toBe(false);
            expect(hasOnlyOpaqueFrames(getFrames(buildEvent(['app:///', 'app:///search'])))).toBe(false);
        });

        it('returns true when the event carries no frames at all', () => {
            expect(hasOnlyOpaqueFrames(getFrames({type: undefined}))).toBe(true);
        });
    });

    describe('getOpaqueFrameLocation', () => {
        it('returns the innermost frame that reports both a line and a column', () => {
            const event: ErrorEvent = {
                type: undefined,
                exception: {
                    values: [
                        {
                            stacktrace: {
                                frames: [
                                    {filename: 'app:///', lineno: 101, colno: 96537},
                                    {filename: 'app:///', lineno: 101, colno: 98890},
                                    {filename: 'app:///', lineno: undefined, colno: undefined},
                                ],
                            },
                        },
                    ],
                },
            };
            expect(getOpaqueFrameLocation(getFrames(event))).toEqual({lineno: 101, colno: 98890});
        });

        it('returns undefined when no frame is positioned', () => {
            expect(getOpaqueFrameLocation(getFrames(buildEvent(['app:///'])))).toBeUndefined();
        });
    });

    describe('describeInlineScripts', () => {
        it('reports numbers only and never the script content', () => {
            const secret = 'SECRET_TOKEN_abc123';
            const content = `line one\nvar userEmail = "bob@corp.com"; var token = "${secret}";`;
            const {shapes} = describeInlineScripts([{src: '', textContent: content, nonce: 'abc'}], {lineno: 2, colno: 10});

            expect(shapes).toHaveLength(1);
            const shape = shapes.at(0);
            expect(shape?.len).toBe(content.length);
            expect(shape?.lines).toBe(2);
            expect(shape?.lenAtFrameLine).toBe(content.split('\n').at(1)?.length);
            expect(shape?.bracketsFrameCol).toBe(true);
            expect(shape?.hasNonce).toBe(true);
            expect(JSON.stringify(shapes)).not.toContain(secret);
            expect(JSON.stringify(shapes)).not.toContain('bob@corp.com');
        });

        it('marks a frame as outside a script whose matching line is too short', () => {
            const {shapes} = describeInlineScripts([{src: '', textContent: 'short', nonce: undefined}], {lineno: 1, colno: 98890});
            expect(shapes.at(0)?.bracketsFrameCol).toBe(false);
        });

        it('marks a frame as inside a script whose matching line is long enough', () => {
            const wideLine = 'x'.repeat(99000);
            const {shapes} = describeInlineScripts([{src: '', textContent: `${'\n'.repeat(100)}${wideLine}`, nonce: undefined}], {lineno: 101, colno: 98890});
            expect(shapes.at(0)?.bracketsFrameCol).toBe(true);
            expect(shapes.at(0)?.lenAtFrameLine).toBe(99000);
        });

        it('reports -1 for a line the script does not have', () => {
            const {shapes} = describeInlineScripts([{src: '', textContent: 'one line', nonce: undefined}], {lineno: 101, colno: 1});
            expect(shapes.at(0)?.lenAtFrameLine).toBe(-1);
            expect(shapes.at(0)?.bracketsFrameCol).toBe(false);
        });

        it('reports no line length for a frame that reports line 0, rather than reading the last line', () => {
            const {shapes} = describeInlineScripts([{src: '', textContent: `short\n${'x'.repeat(500)}`, nonce: undefined}], {lineno: 0, colno: 5});
            expect(shapes.at(0)?.lenAtFrameLine).toBe(-1);
            expect(shapes.at(0)?.bracketsFrameCol).toBe(false);
        });

        it('reports no bracket for a frame that reports column 0, which any existing line would satisfy vacuously', () => {
            const {shapes} = describeInlineScripts([{src: '', textContent: 'short\nx', nonce: undefined}], {lineno: 1, colno: 0});
            expect(shapes.at(0)?.lenAtFrameLine).toBe(5);
            expect(shapes.at(0)?.bracketsFrameCol).toBe(false);
        });

        it('keeps an over-budget script visible as a metadata-only shape and keeps describing the ones after it', () => {
            const scripts = [
                {src: '', textContent: 'x'.repeat(600 * 1024), nonce: 'abc'},
                {src: '', textContent: 'window.dataLayer.push({});', nonce: undefined},
            ];
            const {shapes, truncated} = describeInlineScripts(scripts, undefined);
            expect(truncated).toBe(true);
            expect(shapes).toHaveLength(2);
            expect(shapes.at(0)).toEqual({len: 600 * 1024, lines: -1, lenAtFrameLine: -1, bracketsFrameCol: false, hasNonce: true, markers: [], hash: '', skipped: true});
            expect(shapes.at(1)?.markers).toEqual(['gtm']);
            expect(shapes.at(1)?.skipped).toBe(false);
        });

        it('emits only allowlisted vendor marker keys', () => {
            const {shapes} = describeInlineScripts([{src: '', textContent: 'window.dataLayer.push({});function _classCallCheck(){}', nonce: undefined}], undefined);
            expect(shapes.at(0)?.markers).toEqual(['babel-class-helper', 'gtm']);
        });

        it('does not digest a script short enough for its digest to be brute-forced', () => {
            const {shapes} = describeInlineScripts([{src: '', textContent: 'var t = "123456";', nonce: undefined}], undefined);
            expect(shapes.at(0)?.hash).toBe('');
        });

        it('digests a script long enough to be the blob we are hunting', () => {
            const {shapes} = describeInlineScripts([{src: '', textContent: 'x'.repeat(512), nonce: undefined}], undefined);
            expect(shapes.at(0)?.hash).toMatch(/^[0-9a-z]+$/);
        });

        it('skips scripts that have a src, since those are covered by loadedScriptHosts', () => {
            const {shapes} = describeInlineScripts([{src: 'https://cdn.example.com/a.js', textContent: '', nonce: undefined}], undefined);
            expect(shapes).toHaveLength(0);
        });

        it('flags truncation once the inline script cap is reached', () => {
            const scripts = Array.from({length: 30}, () => ({src: '', textContent: 'x', nonce: undefined}));
            const {shapes, truncated} = describeInlineScripts(scripts, undefined);
            expect(shapes).toHaveLength(25);
            expect(truncated).toBe(true);
        });
    });

    describe('hashScriptContent', () => {
        it('is stable for identical content and differs for different content', () => {
            expect(hashScriptContent('abc')).toBe(hashScriptContent('abc'));
            expect(hashScriptContent('abc')).not.toBe(hashScriptContent('abd'));
        });

        it('emits base 36 characters only', () => {
            expect(hashScriptContent('window.dataLayer.push({user: "bob@corp.com"})')).toMatch(/^[0-9a-z]+$/);
        });
    });

    describe('getFrameSource', () => {
        const shape = {len: 1, lines: 1, lenAtFrameLine: 1, hasNonce: false, markers: [], hash: 'a', skipped: false};

        it('reports no-inline-scripts when the page has none', () => {
            expect(getFrameSource([], {lineno: 1, colno: 1})).toBe(FRAME_SOURCE.NO_INLINE_SCRIPTS);
        });

        it('reports inline-script when one brackets the frame', () => {
            expect(getFrameSource([{...shape, bracketsFrameCol: true}], {lineno: 1, colno: 1})).toBe(FRAME_SOURCE.INLINE_SCRIPT);
        });

        it('reports no-inline-script-match when none brackets the frame', () => {
            expect(getFrameSource([{...shape, bracketsFrameCol: false}], {lineno: 1, colno: 1})).toBe(FRAME_SOURCE.NO_INLINE_MATCH);
        });

        it('reports unknown-frame-location when the frame has no coordinates', () => {
            expect(getFrameSource([{...shape, bracketsFrameCol: false}], undefined)).toBe(FRAME_SOURCE.UNKNOWN);
        });
    });

    describe('describeRawStack', () => {
        it('detects our own bundle frames', () => {
            const stack = 'TypeError: x\n    at f (https://new.expensify.com/main-33e5c3ee04228117.bundle.js:1:2)';
            expect(describeRawStack(stack, 'https://new.expensify.com')).toEqual({lineCount: 2, referencesOwnBundle: true, referencesOwnOrigin: true});
        });

        it('reports no own bundle frame when only foreign code is on the stack', () => {
            const stack = 'TypeError: x\n    at a (https://cdn.example.com/tag.js:1:2)';
            expect(describeRawStack(stack, 'https://new.expensify.com')).toEqual({lineCount: 2, referencesOwnBundle: false, referencesOwnOrigin: false});
        });

        it('does not mistake a third-party *.bundle.js for our own bundle', () => {
            const stack = 'TypeError: x\n    at a (https://cdn.vendor.com/tag.bundle.js:1:2)\n    at b (https://cdn.vendor.com/data.bundle.json:1:2)';
            expect(describeRawStack(stack, 'https://new.expensify.com')).toEqual({lineCount: 3, referencesOwnBundle: false, referencesOwnOrigin: false});
        });

        it('does not attribute a hashed third-party bundle served from another origin to our code', () => {
            const stack = 'TypeError: x\n    at a (https://cdn.vendor.com/sdk-0123abcd4567.bundle.js:1:2)';
            expect(describeRawStack(stack, 'https://new.expensify.com')).toEqual({lineCount: 2, referencesOwnBundle: false, referencesOwnOrigin: false});
        });

        it('does not treat a superstring of our origin as our origin', () => {
            const stack = 'TypeError: x\n    at a (https://new.expensify.com.evil.example/main-33e5c3ee04228117.bundle.js:1:2)';
            expect(describeRawStack(stack, 'https://new.expensify.com')).toEqual({lineCount: 2, referencesOwnBundle: false, referencesOwnOrigin: false});
        });
    });

    describe('middleware', () => {
        it('passes through an error whose message is not one we are diagnosing', () => {
            addScript({content: 'window.x = 1;'});
            const event = buildEvent(['app:///'], 'Some other error');
            expect(enrichInjectedScriptError(event, buildHint())).toBe(event);
        });

        it('passes through a targeted error that still has a real frame', () => {
            const event = buildEvent(['app:///main-33e5c3ee04228117.bundle.js']);
            expect(enrichInjectedScriptError(event, buildHint())).toBe(event);
        });

        it('tags and enriches a targeted error with only opaque frames', () => {
            addScript({src: 'https://cdn-4.convertexperiments.com/v1/js/10042537-100413459.js?token=SECRET'});
            addScript({content: `${'\n'.repeat(100)}${'x'.repeat(99000)}window.dataLayer.push({});`});

            const event = buildEvent(['app:///'], TARGET_MESSAGE, {lineno: 101, colno: 98890});
            const enriched = enrichInjectedScriptError(event, buildHint(`TypeError: Cannot call a class as a function\na@${window.location.origin}/:101:98890`));

            expect(enriched?.tags?.[CONST.TELEMETRY.TAGS.INJECTED_SCRIPT_ERROR]).toBe('true');
            expect(enriched?.tags?.[CONST.TELEMETRY.TAGS.INJECTED_SCRIPT_FRAME_SOURCE]).toBe(FRAME_SOURCE.INLINE_SCRIPT);
            expect(enriched?.tags?.[CONST.TELEMETRY.TAGS.INJECTED_SCRIPT_OWN_BUNDLE_ON_STACK]).toBe('false');
            expect(enriched?.extra?.injectedScriptFrame).toEqual({lineno: 101, colno: 98890, frameCount: 1, source: FRAME_SOURCE.INLINE_SCRIPT});
            expect(enriched?.extra?.loadedScriptHosts).toEqual(['cdn-4.convertexperiments.com']);
            expect(enriched?.extra?.injectedScriptRawStack).toEqual({lineCount: 2, referencesOwnBundle: false, referencesOwnOrigin: true});
        });

        it('enriches a targeted error that carries its text in event.message with no exception values', () => {
            addScript({content: 'window.x = 1;'});

            const event: ErrorEvent = {type: undefined, message: `Uncaught (in promise) TypeError: ${TARGET_MESSAGE}`};
            const enriched = enrichInjectedScriptError(event, buildHint());

            expect(enriched?.tags?.[CONST.TELEMETRY.TAGS.INJECTED_SCRIPT_ERROR]).toBe('true');
            expect(enriched?.tags?.[CONST.TELEMETRY.TAGS.INJECTED_SCRIPT_OWN_BUNDLE_ON_STACK]).toBe('unknown');
            expect(enriched?.extra?.injectedScriptFrame).toEqual({lineno: -1, colno: -1, frameCount: 0, source: FRAME_SOURCE.UNKNOWN});
        });

        it('returns the original event untouched when reading the page throws', () => {
            const event = buildEvent(['app:///'], TARGET_MESSAGE, {lineno: 1, colno: 1});
            Object.defineProperty(document, 'scripts', {
                configurable: true,
                get() {
                    throw new Error('scripts is unavailable');
                },
            });

            try {
                expect(enrichInjectedScriptError(event, buildHint())).toBe(event);
            } finally {
                Reflect.deleteProperty(document, 'scripts');
            }
        });

        it('reads the raw stack off a non-Error exception, which is what cross-realm throws look like', () => {
            const event = buildEvent(['app:///'], TARGET_MESSAGE, {lineno: 1, colno: 5});
            const hint = {originalException: {stack: `TypeError: x\n    at f (${window.location.origin}/main-33e5c3ee04228117.bundle.js:1:2)`}} as EventHint;
            const enriched = enrichInjectedScriptError(event, hint);

            expect(enriched?.tags?.[CONST.TELEMETRY.TAGS.INJECTED_SCRIPT_OWN_BUNDLE_ON_STACK]).toBe('true');
            expect(enriched?.extra?.stackScriptHosts).toEqual([window.location.host]);
        });

        it('passes every event through on native, where the DOM implementation is not bundled', () => {
            const event = buildEvent(['app:///'], TARGET_MESSAGE, {lineno: 1, colno: 1});
            expect(enrichInjectedScriptErrorNative(event, buildHint())).toBe(event);
        });

        it('never emits a string that could carry content, a path, or a query string', () => {
            addScript({src: 'https://cdn.example.com/tag.js?token=SECRET123&email=bob@corp.com'});
            addScript({content: 'var token = "SECRET_TOKEN_abc123"; var email = "bob@corp.com";'});

            const event = buildEvent(['app:///'], TARGET_MESSAGE, {lineno: 1, colno: 5});
            const enriched = enrichInjectedScriptError(event, buildHint('TypeError: Cannot call a class as a function\na@https://new.expensify.com/?email=bob@corp.com:1:5'));
            const payload = JSON.stringify(enriched?.extra);

            expect(payload).not.toContain('SECRET123');
            expect(payload).not.toContain('SECRET_TOKEN_abc123');
            expect(payload).not.toContain('bob@corp.com');
            for (const value of collectStrings({extra: enriched?.extra, tags: enriched?.tags})) {
                expect(value).toMatch(SAFE_STRING_REGEX);
            }
        });
    });
});
