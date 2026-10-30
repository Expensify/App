import googleTranslateRecursionNoiseFilterIntegration, {isGoogleTranslateRecursionNoise} from '@libs/telemetry/integrations/googleTranslateRecursionNoiseFilter';
import {googleTranslateRecursionNoiseFilterIntegration as webGoogleTranslateRecursionNoiseFilterIntegration} from '@libs/telemetry/integrations/index.web';

import type {ErrorEvent, StackFrame} from '@sentry/core';

import {buildErrorEvent, sentryClientStub, THIRD_PARTY_TAGS} from '../utils/SentryEventTestUtils';

const WEBKIT_MESSAGE = 'Maximum call stack size exceeded.';
const V8_MESSAGE = 'Maximum call stack size exceeded';

type Position = [lineno: number, colno: number];

function frame(filename: string, [lineno, colno]: Position): StackFrame {
    return {filename, lineno, colno};
}

function callers(filename: string, positions: Position[]): StackFrame[] {
    return positions.map((position) => frame(filename, position));
}

/** `count` frames alternating between two positions, `innermost` last. */
function cycle(filename: string, innermost: Position, other: Position, count: number): StackFrame[] {
    return Array.from({length: count}, (_, index) => frame(filename, (count - 1 - index) % 2 === 0 ? innermost : other));
}

function buildStackOverflowEvent(frames: StackFrame[], tags: ErrorEvent['tags'] = THIRD_PARTY_TAGS, value = WEBKIT_MESSAGE): ErrorEvent {
    return buildErrorEvent([{type: 'RangeError', value, stacktrace: {frames}}], tags);
}

/** APP-M6P, Chrome iOS. */
const APP_M6P_FRAMES: StackFrame[] = [
    ...callers('app:///home', [
        [190, 70],
        [197, 363],
        [190, 41],
        [198, 237],
        [226, 382],
    ]),
    ...cycle('app:///home', [226, 63], [226, 408], 45),
];

/** APP-KQF: the cycle sits under a different route than its callers. */
const APP_KQF_FRAMES: StackFrame[] = [
    ...callers('app:///home', [
        [190, 70],
        [197, 363],
        [190, 41],
        [198, 237],
    ]),
    frame('app:///transition', [226, 382]),
    ...cycle('app:///transition', [226, 63], [226, 408], 45),
];

/** APP-M27: a page URL with no basename. */
const APP_M27_FRAMES: StackFrame[] = APP_M6P_FRAMES.map((entry) => ({...entry, filename: 'app:///'}));

/** APP-MTE, desktop Chrome: the script reported under its own URL. */
const APP_MTE_FRAMES: StackFrame[] = [
    ...callers('app:///m=el_main', [
        [197, 128],
        [190, 39],
        [198, 235],
        [226, 380],
    ]),
    ...cycle('app:///m=el_main', [226, 406], [226, 61], 46),
];

/** APP-KFE, an older Translate build: the loop sits on line 228, not 226. */
const APP_KFE_FRAMES: StackFrame[] = [
    ...callers('app:///', [
        [190, 70],
        [197, 363],
        [190, 41],
        [198, 237],
        [228, 382],
    ]),
    ...cycle('app:///', [228, 63], [228, 408], 45),
];

describe('googleTranslateRecursionNoiseFilter', () => {
    it.each([
        ['APP-M6P', APP_M6P_FRAMES, WEBKIT_MESSAGE],
        ['APP-KQF', APP_KQF_FRAMES, WEBKIT_MESSAGE],
        ['APP-M27', APP_M27_FRAMES, WEBKIT_MESSAGE],
        ['APP-MTE', APP_MTE_FRAMES, V8_MESSAGE],
        ['APP-KFE', APP_KFE_FRAMES, WEBKIT_MESSAGE],
    ])('drops %s', (_, frames, message) => {
        // Given the exact frames Sentry recorded for one Translate build, because each build moves the loop and renames its functions
        const event = buildStackOverflowEvent(frames, THIRD_PARTY_TAGS, message);

        // When the predicate runs on the recorded shape
        // Then it is dropped, because the filter must recognize every Translate build seen so far without pinning any one of them
        expect(isGoogleTranslateRecursionNoise(event)).toBe(true);
    });

    it.each([
        ['an untagged event', buildStackOverflowEvent(APP_M6P_FRAMES, {})],
        ['a different error type', buildErrorEvent([{type: 'TypeError', value: WEBKIT_MESSAGE, stacktrace: {frames: APP_M6P_FRAMES}}])],
        [
            'a chained error',
            buildErrorEvent([
                {type: 'RangeError', value: WEBKIT_MESSAGE, stacktrace: {frames: APP_M6P_FRAMES}},
                {type: 'RangeError', value: WEBKIT_MESSAGE},
            ]),
        ],
        ['a frame in one of our chunks', buildStackOverflowEvent([frame('app:///76-f662df2d477d1a4f.bundle.js', [1, 1]), ...APP_M6P_FRAMES])],
        ['an <anonymous> script', buildStackOverflowEvent(cycle('app:///<anonymous>', [16, 9], [4, 13], 45))],
        ['APP-ZF, a synthesized frame with no stack', buildStackOverflowEvent([frame('app:///undefined', [192, 70])])],
        ['APP-2NH, a vendor script under its own dotted URL', buildStackOverflowEvent(cycle('app:///10042537-100413459.js', [4541, 17291], [4541, 17291], 50))],
        ['a stack overflow with no frames', buildStackOverflowEvent([])],
        ['a RangeError that is not a stack overflow', buildStackOverflowEvent(APP_M6P_FRAMES, THIRD_PARTY_TAGS, 'Invalid array length')],
        ['a wasm frame compiled without a URL, which has no line number', buildStackOverflowEvent([{filename: 'app:///00b2a5aa:wasm-function[38]:0x1b6c'}, ...APP_M6P_FRAMES])],
    ])('keeps %s', (_, event) => {
        // Given an event that satisfies all but one condition of the signature
        // When the predicate runs
        // Then it is kept, because one missed condition is enough to mean this could be an App error we would otherwise lose
        expect(isGoogleTranslateRecursionNoise(event)).toBe(false);
    });

    it('drops the noise and passes anything else through as an integration', () => {
        // Given the integration and one matching and one non-matching event, because Sentry calls `processEvent`, not the predicate
        const kept = buildStackOverflowEvent(APP_M6P_FRAMES, {});

        // When each goes through `processEvent`
        // Then the noise maps to `null`, which is how the SDK drops an event, and the other comes back as the same object so nothing downstream sees a copy
        expect(googleTranslateRecursionNoiseFilterIntegration.processEvent?.(buildStackOverflowEvent(APP_M6P_FRAMES), {}, sentryClientStub)).toBeNull();
        expect(googleTranslateRecursionNoiseFilterIntegration.processEvent?.(kept, {}, sentryClientStub)).toBe(kept);
    });

    it('is exported from the web index', () => {
        // Given that the native index ships an `undefined` stub and `setupSentryIntegrationOrderTest` mocks the whole module
        // When the unmocked web index export is read
        // Then it is the real filter, because web is the only platform this runs on and nothing else checks the wiring
        expect(webGoogleTranslateRecursionNoiseFilterIntegration).toBe(googleTranslateRecursionNoiseFilterIntegration);
    });
});
