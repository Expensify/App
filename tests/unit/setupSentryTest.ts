import setupSentry from '@src/setup/telemetry/setupSentry';

import {stringMatchesSomePattern} from '@sentry/core';

jest.mock('@sentry/react-native', () => ({
    init: jest.fn(),
    setTag: jest.fn(),
}));

jest.mock('@libs/telemetry/integrations', () => ({}));

const sentryMock = jest.requireMock<{init: jest.Mock<void, [{ignoreErrors?: Array<string | RegExp>}]>; setTag: jest.Mock}>('@sentry/react-native');

/** How the browser SDK words a promise rejected with a string. It carries no stack frames, so `ignoreErrors` is the only filter that can match it. */
function rejectionMessage(reason: string): string {
    return `Non-Error promise rejection captured with value: ${reason}`;
}

/** Runs Sentry's own matcher over the patterns setupSentry registered, the way `eventFiltersIntegration` does. */
function isIgnored(message: string): boolean {
    const initOptions = sentryMock.init.mock.calls.at(0)?.at(0);
    if (!initOptions) {
        throw new Error('setupSentry did not call Sentry.init');
    }

    return stringMatchesSomePattern(message, initOptions.ignoreErrors ?? []);
}

describe('setupSentry', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupSentry();
    });

    it('drops the bare-string rejection the Convert Experiments script emits when it reads a missing OnyxDB key', () => {
        expect(isIgnored(rejectionMessage('No data found for key reportActions_undefined'))).toBe(true);
    });

    it('keeps unhandled rejections that do not come from that third-party OnyxDB read', () => {
        expect(isIgnored(rejectionMessage("undefined is not an object (evaluating 'report.reportID')"))).toBe(false);
    });

    it('keeps a thrown Error carrying the same text, which unlike a bare rejection has a stack to act on', () => {
        expect(isIgnored('No data found for key reportActions_123')).toBe(false);
    });
});
