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

    it('drops the ConstraintError the Convert Experiments script emits when it re-inserts an existing key', () => {
        // Given the message Sentry builds from a DOMException, as `type: value`
        const message = 'ConstraintError: Key already exists in the object store.';

        // When the registered patterns are matched against it
        // Then it is ignored, because only `add()` produces it and Onyx never calls `add()`
        expect(isIgnored(message)).toBe(true);
    });

    it('keeps the other IndexedDB failures Onyx reports, so a real storage problem still surfaces', () => {
        // Given a storage error Onyx does raise on its own write path
        const message = 'AbortError: IDB write transaction aborted without an error';

        // When the registered patterns are matched against it
        // Then it still reports
        expect(isIgnored(message)).toBe(false);
    });

    it('keeps a ConstraintError with different wording, which does not come from that third-party insert', () => {
        // Given a ConstraintError about a unique index rather than a duplicate key
        const message = "ConstraintError: Unable to add key to index 'byName': at least one key does not satisfy the uniqueness requirements.";

        // When the registered patterns are matched against it
        // Then it still reports
        expect(isIgnored(message)).toBe(false);
    });
});
