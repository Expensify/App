import forwardLogsToSentry from '@libs/telemetry/forwardLogsToSentry';

import * as Sentry from '@sentry/react-native';

jest.mock('@sentry/react-native', () => ({
    logger: {debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn()},
    addBreadcrumb: jest.fn(),
}));

const packetWith = (message: string, parameters: Record<string, unknown>) => JSON.stringify([{message, parameters}]);

describe('forwardLogsToSentry', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('adds a breadcrumb carrying the receipt trail so a crash report shows it, with only whitelisted params', () => {
        // Given a forwarded [Receipt] log line carrying opaque ids alongside non-whitelisted file metadata
        const packet = packetWith('[info] [Receipt] enqueued', {
            event: 'enqueued',
            receiptTraceId: 'trace-Z',
            transactionID: '42',
            command: 'RequestMoney',
            source: 'file://secret.png',
            fileSizeBytes: 999,
        });

        // When the packet is mirrored to Sentry
        forwardLogsToSentry(packet);

        // Then a receipt breadcrumb is recorded carrying the correlation ids...
        expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
            expect.objectContaining({
                category: 'receipt',
                message: '[info] [Receipt] enqueued',
                data: expect.objectContaining({event: 'enqueued', receiptTraceId: 'trace-Z', transactionID: '42', command: 'RequestMoney'}),
            }),
        );

        // ...but never the receipt source or other non-whitelisted fields
        const breadcrumb = jest.mocked(Sentry.addBreadcrumb).mock.calls.at(0)?.[0];
        expect(breadcrumb?.data).not.toHaveProperty('source');
        expect(breadcrumb?.data).not.toHaveProperty('fileSizeBytes');
    });

    it('does not forward the receipt-scoped params (event/transactionID) for a different prefix', () => {
        // Given a forwarded [MFA] line that happens to carry the receipt-scoped `event`/`transactionID` params
        const packet = packetWith('[info] [MFA] verifying code', {
            event: 'something-unrelated',
            transactionID: 'should-not-leak',
            command: 'TestCommand',
        });

        // When the packet is mirrored to Sentry
        forwardLogsToSentry(packet);

        // Then the globally whitelisted key is forwarded, but the receipt-scoped keys are not
        const breadcrumb = jest.mocked(Sentry.addBreadcrumb).mock.calls.at(0)?.[0];
        expect(breadcrumb?.data).toEqual(expect.objectContaining({command: 'TestCommand'}));
        expect(breadcrumb?.data).not.toHaveProperty('event');
        expect(breadcrumb?.data).not.toHaveProperty('transactionID');
    });

    it('forwards a swallowed navigation call as an error, carrying the method and its call site', () => {
        // Given an inert navigation call reported by the withNavigationFallback stub, at alert level with a stack
        const packet = packetWith('[alrt] [withNavigationFallback] ignored navigation.setParams() outside a navigator screen', {
            method: 'setParams',
            stack: 'Error\n    at useReportActionsNewActionLiveTail',
        });

        // When the packet is mirrored to Sentry
        forwardLogsToSentry(packet);

        // Then it lands at error level, so a swallowed call is visible instead of silently doing nothing
        expect(Sentry.logger.error).toHaveBeenCalledWith(
            '[alrt] [withNavigationFallback] ignored navigation.setParams() outside a navigator screen',
            expect.objectContaining({method: 'setParams', stack: 'Error\n    at useReportActionsNewActionLiveTail'}),
        );
    });

    it('forwards a dynamic route query param collision without the colliding values', () => {
        // Given a [createDynamicRoute] collision whose values are user data (an email address and a full URL).
        // `mergeQueryStrings` no longer logs those values at all - this locks the whitelist as a second guard,
        // so re-adding them at the call site still would not leak them to Sentry.
        const packet = packetWith('[alrt] [createDynamicRoute] Query param exists in both base path and dynamic suffix with different values; suffix value takes precedence', {
            key: 'contactMethod',
            baseValue: 'user@example.com',
            suffixValue: 'https://www.expensify.com/secret',
            stack: 'Error\n    at MoneyRequestConfirmationList',
        });

        // When the packet is mirrored to Sentry
        forwardLogsToSentry(packet);

        // Then the param name and the call site are forwarded, so the collision is still locatable...
        expect(Sentry.logger.error).toHaveBeenCalledWith(
            expect.stringContaining('[createDynamicRoute]'),
            expect.objectContaining({key: 'contactMethod', stack: 'Error\n    at MoneyRequestConfirmationList'}),
        );

        // ...but the colliding values never leave the device
        const data = jest.mocked(Sentry.logger.error).mock.calls.at(0)?.[1];
        expect(data).not.toHaveProperty('baseValue');
        expect(data).not.toHaveProperty('suffixValue');
    });

    it('does not add a breadcrumb for log lines that are not forwarded', () => {
        // Given a log line without a forwarded prefix
        const packet = packetWith('[info] [SequentialQueue] push() called', {command: 'OpenReport'});

        // When the packet is processed
        forwardLogsToSentry(packet);

        // Then nothing is mirrored to Sentry
        expect(Sentry.addBreadcrumb).not.toHaveBeenCalled();
    });
});
