import * as PersistedRequests from '@libs/actions/PersistedRequests';
import {WRITE_COMMANDS} from '@libs/API/types';
import Log from '@libs/Log';
import {logReceiptCaptured, logReceiptQueueSnapshot, mintAndStampReceiptTraceId} from '@libs/telemetry/ReceiptObservability';
import type {FileObject} from '@src/types/utils/Attachment';

type CapturedLogLine = {message: string; sendNow?: boolean; params: Record<string, unknown>};

const receiptRequest = (transactionID: string, receiptTraceId: string) => ({
    command: WRITE_COMMANDS.REQUEST_MONEY,
    data: {transactionID, receipt: {source: `file://${transactionID}.png`, receiptTraceId}},
});

const nonReceiptRequest = {command: WRITE_COMMANDS.OPEN_REPORT, data: {reportID: '99'}};

describe('ReceiptObservability', () => {
    let logLines: CapturedLogLine[];
    let logInfoSpy: jest.SpyInstance<void, Parameters<typeof Log.info>>;

    beforeEach(() => {
        logLines = [];
        // Capture each emitted log line into a typed list so assertions never have to cast `mock.calls`.
        logInfoSpy = jest.spyOn(Log, 'info').mockImplementation((message, sendNow, params) => {
            if (!params || typeof params !== 'object' || Array.isArray(params) || params instanceof Error) {
                return;
            }
            logLines.push({message, sendNow, params});
        });
    });

    afterEach(() => {
        logInfoSpy.mockRestore();
    });

    describe('mintAndStampReceiptTraceId', () => {
        it('stamps an id that survives JSON serialization without leaking the image bytes', () => {
            // Given a captured receipt file carrying a large amount of image data
            const file: FileObject = new File(['x'.repeat(100_000)], 'receipt.png', {type: 'image/png'});

            // When we mint and stamp a trace id at capture time
            const traceId = mintAndStampReceiptTraceId(file);

            // Then the id is a non-empty, opaque string stamped on the file object
            expect(traceId).toBeTruthy();
            expect(file.receiptTraceId).toBe(traceId);

            // And it survives the JSON serialization used to persist the request (the correlation spine reaches the
            // persisted request), while the raw image bytes never serialize into the payload (no base64 bloat).
            const serialized = JSON.stringify(file);
            expect(serialized).toContain(traceId);
            expect(serialized.length).toBeLessThan(1_000);
        });
    });

    describe('logReceiptCaptured', () => {
        it('logs a [Receipt] captured line carrying the entry point and file metadata', () => {
            // Given a captured HEIC file from the camera
            const file: FileObject = new File(['x'.repeat(2048)], 'photo.HEIC', {type: 'image/heic'});

            // When we record the capture milestone
            logReceiptCaptured({file, captureSource: 'camera', receiptTraceId: 'trace-X'});

            // Then a [Receipt] captured line is emitted immediately, carrying the correlation id and file metadata
            const captured = logLines.find((line) => line.params.event === 'captured');
            expect(captured?.message).toContain('[Receipt]');
            expect(captured?.sendNow).toBe(true);
            expect(captured?.params).toMatchObject({
                event: 'captured',
                receiptTraceId: 'trace-X',
                captureSource: 'camera',
                mimeType: 'image/heic',
                fileExtension: 'heic',
                fileSizeBytes: 2048,
            });
        });
    });

    describe('logReceiptQueueSnapshot', () => {
        let getAllSpy: jest.SpyInstance;
        let getOngoingRequestSpy: jest.SpyInstance;

        beforeEach(() => {
            getAllSpy = jest.spyOn(PersistedRequests, 'getAll').mockReturnValue([]);
            getOngoingRequestSpy = jest.spyOn(PersistedRequests, 'getOngoingRequest').mockReturnValue(null);
        });

        afterEach(() => {
            getAllSpy.mockRestore();
            getOngoingRequestSpy.mockRestore();
        });

        it('emits one [Receipt] snapshot line per pending receipt and skips non-receipt requests', () => {
            // Given a queue holding two receipt-bearing requests and one unrelated request
            getAllSpy.mockReturnValue([receiptRequest('100', 'trace-A'), nonReceiptRequest, receiptRequest('200', 'trace-B')]);

            // When we snapshot the queue at a lifecycle boundary
            logReceiptQueueSnapshot('background');

            // Then exactly one snapshot line is emitted per pending receipt, none for the unrelated request
            const snapshots = logLines.filter((line) => line.params.event === 'snapshot');
            expect(snapshots).toHaveLength(2);

            // And each line carries the [Receipt] prefix, is sent immediately, and identifies the receipt
            for (const snapshot of snapshots) {
                expect(snapshot.message).toContain('[Receipt]');
                expect(snapshot.sendNow).toBe(true);
                expect(snapshot.params.trigger).toBe('background');
                expect(snapshot.params.command).toBe(WRITE_COMMANDS.REQUEST_MONEY);
            }
            expect(snapshots.map((snapshot) => snapshot.params.receiptTraceId)).toEqual(expect.arrayContaining(['trace-A', 'trace-B']));
            expect(snapshots.map((snapshot) => snapshot.params.transactionID)).toEqual(expect.arrayContaining(['100', '200']));
        });

        it('emits nothing when no receipt-bearing request is pending', () => {
            // Given a queue with no receipt-bearing requests
            getAllSpy.mockReturnValue([nonReceiptRequest]);

            // When we snapshot the queue
            logReceiptQueueSnapshot('signOut');

            // Then no snapshot line is emitted (zero noise in the common case)
            expect(logLines.filter((line) => line.params.event === 'snapshot')).toHaveLength(0);
        });

        it.each([
            WRITE_COMMANDS.SPLIT_BILL,
            WRITE_COMMANDS.SPLIT_BILL_AND_OPEN_REPORT,
            WRITE_COMMANDS.COMPLETE_SPLIT_BILL,
            WRITE_COMMANDS.SEND_MONEY_ELSEWHERE,
            WRITE_COMMANDS.SEND_MONEY_WITH_WALLET,
            WRITE_COMMANDS.CATEGORIZE_TRACKED_EXPENSE,
            WRITE_COMMANDS.SHARE_TRACKED_EXPENSE,
        ])('includes %s in the receipt-bearing set', (command) => {
            // Given a queued request for a receipt-bearing command outside the original 4-command allow-list
            getAllSpy.mockReturnValue([{command, data: {transactionID: '300', receipt: {source: 'file://300.png', receiptTraceId: 'trace-C'}}}]);

            // When we snapshot the queue
            logReceiptQueueSnapshot('background');

            // Then a snapshot line is emitted for it (without the expansion the receipt would be silently dropped)
            const snapshots = logLines.filter((line) => line.params.event === 'snapshot');
            expect(snapshots).toHaveLength(1);
            expect(snapshots.at(0)?.params).toMatchObject({command, transactionID: '300', receiptTraceId: 'trace-C'});
        });

        it('skips receipt-bearing commands whose data.receipt is missing (e.g. SplitBill, SendMoney without receipt)', () => {
            // Given a receipt-bearing command queued WITHOUT a top-level data.receipt — SplitBill nests it in the splits
            // JSON; SendMoney can be issued with no receipt at all. A snapshot row with no trace id is not joinable to
            // the capture log and would only add noise.
            getAllSpy.mockReturnValue([
                {command: WRITE_COMMANDS.SPLIT_BILL, data: {transactionID: '500', splits: '[...]'}},
                {command: WRITE_COMMANDS.SEND_MONEY_WITH_WALLET, data: {transactionID: '501'}},
            ]);

            // When we snapshot the queue
            logReceiptQueueSnapshot('background');

            // Then no snapshot line is emitted — non-correlatable rows are filtered out
            expect(logLines.filter((line) => line.params.event === 'snapshot')).toHaveLength(0);
        });

        it('includes the receipt promoted to the ongoing request slot', () => {
            // Given one receipt uploading in the ongoing slot and another still waiting in the queue
            getOngoingRequestSpy.mockReturnValue(receiptRequest('100', 'trace-A'));
            getAllSpy.mockReturnValue([receiptRequest('200', 'trace-B')]);

            // When we snapshot the queue at sign-out
            logReceiptQueueSnapshot('signOut');

            // Then the uploading receipt is captured alongside the queued one
            const snapshots = logLines.filter((line) => line.params.event === 'snapshot');
            expect(snapshots).toHaveLength(2);
            expect(snapshots.map((snapshot) => snapshot.params.receiptTraceId)).toEqual(expect.arrayContaining(['trace-A', 'trace-B']));
            expect(snapshots.map((snapshot) => snapshot.params.transactionID)).toEqual(expect.arrayContaining(['100', '200']));
        });
    });
});
