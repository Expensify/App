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
        // Given a [Reauthenticate] line that happens to carry generic `event`/`transactionID` params
        const packet = packetWith('[info] [Reauthenticate] refreshing token', {
            event: 'something-unrelated',
            transactionID: 'should-not-leak',
            command: 'Reauthenticate',
        });

        // When the packet is mirrored to Sentry
        forwardLogsToSentry(packet);

        // Then the globally whitelisted key is forwarded, but the receipt-scoped keys are not
        const breadcrumb = jest.mocked(Sentry.addBreadcrumb).mock.calls.at(0)?.[0];
        expect(breadcrumb?.data).toEqual(expect.objectContaining({command: 'Reauthenticate'}));
        expect(breadcrumb?.data).not.toHaveProperty('event');
        expect(breadcrumb?.data).not.toHaveProperty('transactionID');
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
