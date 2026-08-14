import thirdPartyErrorFilter from '@libs/telemetry/middlewares/thirdPartyErrorFilter';

import type {ErrorEvent, StackFrame} from '@sentry/core';

function buildErrorEvent(frames: StackFrame[]): ErrorEvent {
    return {
        type: undefined,
        exception: {
            values: [
                {
                    type: 'TypeError',
                    value: "Cannot set properties of null (setting 'innerText')",
                    stacktrace: {frames},
                },
            ],
        },
    };
}

describe('thirdPartyErrorFilter', () => {
    it('drops an error whose frames all come from a browser extension', () => {
        // eslint-disable-next-line @typescript-eslint/naming-convention -- Sentry protocol field name
        const event = buildErrorEvent([{filename: 'safari-web-extension://ABC/injected.js', abs_path: 'safari-web-extension://ABC/injected.js'}]);
        expect(thirdPartyErrorFilter(event, {})).toBeNull();
    });

    it('drops an error with frames from multiple extension schemes', () => {
        const event = buildErrorEvent([{filename: 'chrome-extension://ABC/content.js'}, {filename: 'moz-extension://DEF/inject.js'}, {filename: 'webkit-masked-url://hidden/'}]);
        expect(thirdPartyErrorFilter(event, {})).toBeNull();
    });

    it('drops an extension error even when Sentry adds a [native code] sentinel frame', () => {
        // The common Mobile Safari onunhandledrejection shape: an extension frame plus a native-machinery frame.
        const event = buildErrorEvent([{filename: 'safari-web-extension://ABC/injected.js'}, {filename: '[native code]'}]);
        expect(thirdPartyErrorFilter(event, {})).toBeNull();
    });

    it('drops an extension error even when Sentry adds an <anonymous> sentinel frame', () => {
        const event = buildErrorEvent([{filename: 'chrome-extension://ABC/content.js'}, {filename: '<anonymous>'}]);
        expect(thirdPartyErrorFilter(event, {})).toBeNull();
    });

    it('drops a chained (multi-value) error when every value is third-party', () => {
        const event: ErrorEvent = {
            type: undefined,
            exception: {
                values: [
                    {type: 'TypeError', value: 'x', stacktrace: {frames: [{filename: 'chrome-extension://ABC/content.js'}]}},
                    {type: 'Error', value: 'y', stacktrace: {frames: [{filename: 'moz-extension://DEF/inject.js'}, {filename: '[native code]'}]}},
                ],
            },
        };
        expect(thirdPartyErrorFilter(event, {})).toBeNull();
    });

    it('keeps a chained (multi-value) error when any value comes from our bundle', () => {
        const event: ErrorEvent = {
            type: undefined,
            exception: {
                values: [
                    {type: 'TypeError', value: 'x', stacktrace: {frames: [{filename: 'chrome-extension://ABC/content.js'}]}},
                    {type: 'Error', value: 'y', stacktrace: {frames: [{filename: 'https://new.expensify.com/main.js'}]}},
                ],
            },
        };
        expect(thirdPartyErrorFilter(event, {})).toBe(event);
    });

    it('keeps an own-bundle error whose only other frame is a [native code] sentinel', () => {
        const event = buildErrorEvent([{filename: 'https://new.expensify.com/main.js'}, {filename: '[native code]'}]);
        expect(thirdPartyErrorFilter(event, {})).toBe(event);
    });

    it('keeps an error whose only frames are Sentry sentinels', () => {
        const event = buildErrorEvent([{filename: '[native code]'}, {filename: '<anonymous>'}]);
        expect(thirdPartyErrorFilter(event, {})).toBe(event);
    });

    it('keeps an error thrown from our own bundle', () => {
        const event = buildErrorEvent([{filename: 'https://new.expensify.com/main.js'}]);
        expect(thirdPartyErrorFilter(event, {})).toBe(event);
    });

    it('keeps an error when at least one frame originates from our bundle', () => {
        const event = buildErrorEvent([{filename: 'chrome-extension://ABC/content.js'}, {filename: 'https://new.expensify.com/main.js'}]);
        expect(thirdPartyErrorFilter(event, {})).toBe(event);
    });

    it('keeps an error that has no frame URLs to judge by', () => {
        const event = buildErrorEvent([{}]);
        expect(thirdPartyErrorFilter(event, {})).toBe(event);
    });

    it('keeps an error with no exception values', () => {
        const event: ErrorEvent = {type: undefined};
        expect(thirdPartyErrorFilter(event, {})).toBe(event);
    });
});
