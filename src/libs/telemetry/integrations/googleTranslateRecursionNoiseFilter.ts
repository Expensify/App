import type {Event, Integration, StackFrame} from '@sentry/core';

import {THIRD_PARTY_CODE_TAG} from './classCallCheckNoiseFilter';

/** WebKit ends the message with a period, V8 does not. */
const STACK_OVERFLOW_MESSAGE = /^Maximum call stack size exceeded\.?$/;

const LOOP_PERIOD = 2;

/** `app:///` plus a basename with no dot: the page URL after `createReactNativeRewriteFrames`. Our chunks all have a dot. */
const ROUTE_FILENAME = /^app:\/\/\/[^./<]*$/;

/** Synthesized by the SDK for an `onerror` event with no stack. */
const SYNTHESIZED_FILENAME = 'app:///undefined';

function isRouteFilename(frame: StackFrame): boolean {
    const filename = frame.filename ?? '';
    return ROUTE_FILENAME.test(filename) && filename !== SYNTHESIZED_FILENAME;
}

function isSamePosition(a: StackFrame, b: StackFrame): boolean {
    return a.filename === b.filename && a.lineno === b.lineno && a.colno === b.colno;
}

/** Frames, from the innermost back, alternating between the innermost two positions. Function names change per build, so only positions are compared. */
function getTwoPositionCycleLength(frames: StackFrame[]): number {
    const a = frames.at(-1);
    const b = frames.at(-2);
    if (!a || !b || a.filename !== b.filename || isSamePosition(a, b)) {
        return 0;
    }

    let length = 0;
    for (let i = frames.length - 1; i >= 0; i--) {
        const current = frames.at(i);
        const expected = length % LOOP_PERIOD === 0 ? a : b;
        if (!current || !isSamePosition(current, expected)) {
            break;
        }
        length++;
    }
    return length;
}

/** The loop must repeat at least twice and fill most of the stack, whatever its length (Sentry keeps at most 50 frames). */
function endsInTwoPositionCycle(frames: StackFrame[]): boolean {
    const cycleLength = getTwoPositionCycleLength(frames);
    return cycleLength >= 2 * LOOP_PERIOD && cycleLength * 2 > frames.length;
}

/**
 * True for the Google Translate stack overflow from https://github.com/Expensify/App/issues/102044: Chrome iOS
 * injects Translate twice and two of its functions call each other until the stack overflows. Requires a
 * third-party tag, a single stack-overflow `RangeError`, only page-URL frames, and a two-position loop.
 */
function isGoogleTranslateRecursionNoise(event: Event): boolean {
    if (event.tags?.[THIRD_PARTY_CODE_TAG] !== true) {
        return false;
    }

    const values = event.exception?.values ?? [];
    if (values.length !== 1) {
        return false;
    }

    const [exception] = values;
    if (exception.type !== 'RangeError' || !STACK_OVERFLOW_MESSAGE.test(exception.value ?? '')) {
        return false;
    }

    const frames = exception.stacktrace?.frames ?? [];
    return frames.every(isRouteFilename) && endsInTwoPositionCycle(frames);
}

/** Must run after `thirdPartyErrorFilterIntegration`, which writes the tag this reads. */
const googleTranslateRecursionNoiseFilterIntegration: Integration = {
    name: 'GoogleTranslateRecursionNoiseFilter',
    processEvent: (event) => (isGoogleTranslateRecursionNoise(event) ? null : event),
};

export default googleTranslateRecursionNoiseFilterIntegration;
export {isGoogleTranslateRecursionNoise};
