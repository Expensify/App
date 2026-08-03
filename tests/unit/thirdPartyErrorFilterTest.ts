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
