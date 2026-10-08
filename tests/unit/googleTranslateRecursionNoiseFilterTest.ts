import {THIRD_PARTY_CODE_TAG} from '@libs/telemetry/integrations/classCallCheckNoiseFilter';
import googleTranslateRecursionNoiseFilterIntegration, {isGoogleTranslateRecursionNoise} from '@libs/telemetry/integrations/googleTranslateRecursionNoiseFilter';
import {googleTranslateRecursionNoiseFilterIntegration as webGoogleTranslateRecursionNoiseFilterIntegration} from '@libs/telemetry/integrations/index.web';

import type {Client, ErrorEvent, Exception, StackFrame} from '@sentry/core';

const THIRD_PARTY_TAGS: ErrorEvent['tags'] = {[THIRD_PARTY_CODE_TAG]: true};
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

function buildEvent(values: Exception[], tags: ErrorEvent['tags'] = THIRD_PARTY_TAGS): ErrorEvent {
    return {type: undefined, tags, exception: {values}};
}

function buildStackOverflowEvent(frames: StackFrame[], tags: ErrorEvent['tags'] = THIRD_PARTY_TAGS, value = WEBKIT_MESSAGE): ErrorEvent {
    return buildEvent([{type: 'RangeError', value, stacktrace: {frames}}], tags);
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

describe('googleTranslateRecursionNoiseFilter', () => {
    it.each([
        ['APP-M6P', APP_M6P_FRAMES, WEBKIT_MESSAGE],
        ['APP-KQF', APP_KQF_FRAMES, WEBKIT_MESSAGE],
        ['APP-M27', APP_M27_FRAMES, WEBKIT_MESSAGE],
        ['APP-MTE', APP_MTE_FRAMES, V8_MESSAGE],
    ])('drops %s', (_, frames, message) => {
        // Given a recorded Translate stack overflow
        const event = buildStackOverflowEvent(frames, THIRD_PARTY_TAGS, message);

        // When the predicate runs
        // Then it is the noise
        expect(isGoogleTranslateRecursionNoise(event)).toBe(true);
    });

    it.each([
        ['an untagged event', buildStackOverflowEvent(APP_M6P_FRAMES, {})],
        ['a different error type', buildEvent([{type: 'TypeError', value: WEBKIT_MESSAGE, stacktrace: {frames: APP_M6P_FRAMES}}])],
        [
            'a chained error',
            buildEvent([
                {type: 'RangeError', value: WEBKIT_MESSAGE, stacktrace: {frames: APP_M6P_FRAMES}},
                {type: 'RangeError', value: WEBKIT_MESSAGE},
            ]),
        ],
        ['a frame in one of our chunks', buildStackOverflowEvent([frame('app:///76-f662df2d477d1a4f.bundle.js', [1, 1]), ...APP_M6P_FRAMES])],
        ['an <anonymous> script', buildStackOverflowEvent(cycle('app:///<anonymous>', [16, 9], [4, 13], 45))],
        ['APP-ZF, a synthesized frame with no stack', buildStackOverflowEvent([frame('app:///undefined', [192, 70])])],
        ['self-recursion (APP-2NH)', buildStackOverflowEvent(cycle('app:///home', [226, 63], [226, 63], 50))],
        [
            'a three-position cycle',
            buildStackOverflowEvent(
                Array.from({length: 10}, () =>
                    callers('app:///home', [
                        [226, 63],
                        [226, 408],
                        [226, 500],
                    ]),
                ).flat(),
            ),
        ],
        [
            'a short loop at the end of a deeper stack',
            buildStackOverflowEvent([
                ...callers(
                    'app:///home',
                    Array.from({length: 30}, (_, index): Position => [100 + index, 1]),
                ),
                ...cycle('app:///home', [226, 63], [226, 408], 10),
            ]),
        ],
        ['a single call pair', buildStackOverflowEvent(cycle('app:///home', [226, 63], [226, 408], 2))],
    ])('keeps %s', (_, event) => {
        // Given an event that misses one condition of the signature
        // When the predicate runs
        // Then it is kept
        expect(isGoogleTranslateRecursionNoise(event)).toBe(false);
    });

    it('drops the noise and passes anything else through as an integration', () => {
        // Given the integration and one matching and one non-matching event
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the filter never reads the client
        const client = Object.create(null) as Client;
        const kept = buildStackOverflowEvent(APP_M6P_FRAMES, {});

        // When each goes through `processEvent`
        // Then the noise is dropped and the other comes back untouched
        expect(googleTranslateRecursionNoiseFilterIntegration.processEvent?.(buildStackOverflowEvent(APP_M6P_FRAMES), {}, client)).toBeNull();
        expect(googleTranslateRecursionNoiseFilterIntegration.processEvent?.(kept, {}, client)).toBe(kept);
    });

    it('is exported from the web index', () => {
        // Given the native index ships an `undefined` stub
        // When the web index export is read
        // Then it is the real filter
        expect(webGoogleTranslateRecursionNoiseFilterIntegration).toBe(googleTranslateRecursionNoiseFilterIntegration);
    });
});
