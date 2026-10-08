import type {Event, Integration, StackFrame} from '@sentry/core';

import {THIRD_PARTY_CODE_TAG} from './classCallCheckNoiseFilter';

/** WebKit ends the message with a period, V8 does not. */
const STACK_OVERFLOW_MESSAGE = /^Maximum call stack size exceeded\.?$/;

/** `app:///` plus a basename with no dot: the page URL after `createReactNativeRewriteFrames`. Our chunks all have a dot. */
const PAGE_URL_FILENAME = /^app:\/\/\/[^./<]*$/;

/** Synthesized by the SDK for an `onerror` event with no stack (APP-ZF), which cannot be told apart from a real error. */
const SYNTHESIZED_FILENAME = 'app:///undefined';

function isPageUrlFrame({filename = ''}: StackFrame): boolean {
    return PAGE_URL_FILENAME.test(filename) && filename !== SYNTHESIZED_FILENAME;
}

/**
 * True for the Google Translate stack overflow from https://github.com/Expensify/App/issues/102044: Chrome iOS
 * injects Translate twice and two of its functions call each other until the stack overflows. Requires a
 * third-party tag, a single stack-overflow `RangeError`, and only page-URL frames.
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
    return frames.length > 0 && frames.every(isPageUrlFrame);
}

/** Must run after `thirdPartyErrorFilterIntegration`, which writes the tag this reads. */
const googleTranslateRecursionNoiseFilterIntegration: Integration = {
    name: 'GoogleTranslateRecursionNoiseFilter',
    processEvent: (event) => (isGoogleTranslateRecursionNoise(event) ? null : event),
};

export default googleTranslateRecursionNoiseFilterIntegration;
export {isGoogleTranslateRecursionNoise};
