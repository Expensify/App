import * as PersistedRequests from '@libs/actions/PersistedRequests';
import {WRITE_COMMANDS} from '@libs/API/types';
import Log from '@libs/Log';
import {
    logReceiptCaptured,
    logReceiptDropped,
    logReceiptEnqueued,
    logReceiptImageEditFailed,
    logReceiptNotFound,
    logReceiptQueueSnapshot,
    logReceiptRolledBack,
    logReceiptShown,
    mintAndStampReceiptTraceId,
} from '@libs/telemetry/ReceiptObservability';

import ONYXKEYS from '@src/ONYXKEYS';
import type {FileObject} from '@src/types/utils/Attachment';

const RECEIPTS_FOLDER = '/var/mobile/Containers/Data/Application/AAAA-1111/Documents/Receipts-Upload';

jest.mock('@libs/getReceiptsUploadFolderPath', () => ({
    __esModule: true,
    default: () => RECEIPTS_FOLDER,
}));

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

    describe('alert lines for lost receipts', () => {
        let alertLines: Array<{message: string; params: Record<string, unknown>}>;
        let logAlertSpy: jest.SpyInstance<void, Parameters<typeof Log.alert>>;

        beforeEach(() => {
            alertLines = [];
            logAlertSpy = jest.spyOn(Log, 'alert').mockImplementation((message, params) => {
                if (!params || typeof params !== 'object' || Array.isArray(params) || params instanceof Error) {
                    return;
                }
                alertLines.push({message, params});
            });
        });

        afterEach(() => {
            logAlertSpy.mockRestore();
        });

        it('adds the source kind to a dropped line', () => {
            // Given a receipt whose file was in the image cache and was gone at upload time
            const source = 'file:///var/mobile/Containers/Data/Application/AAAA-1111/Library/Caches/ImageManipulator/abc.jpg';

            // When the drop is logged
            logReceiptDropped({
                receiptTraceId: 'trace-1',
                transactionID: '1',
                command: WRITE_COMMANDS.REQUEST_MONEY,
                source,
                localUri: source,
                fileName: 'abc.jpg',
                statError: undefined,
                receiptsFolder: {exists: true},
            });

            // Then the line names the cache, so drops can be counted by cause in Sentry, where paths are not sent
            expect(alertLines.at(0)?.params).toEqual(expect.objectContaining({event: 'dropped', sourceKind: 'imageManipulatorCache'}));
        });

        it('flags a queued receipt that is still in the image cache', () => {
            // Given a converted receipt that was never moved out of the image cache
            const receipt = {receiptTraceId: 'trace-2', source: 'file:///data/user/0/com.expensify.chat/cache/ImageManipulator/abc.jpg'};

            // When its request is queued
            logReceiptEnqueued({receipt, transactionID: '2', command: WRITE_COMMANDS.REQUEST_MONEY, persistedQueueLength: 0});

            // Then a nonDurableSource line is logged, which points to the code path that skipped the move
            expect(alertLines).toEqual([
                {
                    message: '[Receipt] nonDurableSource',
                    params: {event: 'nonDurableSource', receiptTraceId: 'trace-2', transactionID: '2', command: WRITE_COMMANDS.REQUEST_MONEY, sourceKind: 'imageManipulatorCache'},
                },
            ]);
        });

        it('does not flag a queued receipt that is safe', () => {
            // Given a receipt in the receipts folder, a replaced receipt whose path is on uri, and one already uploaded
            const receipts = [{source: `file://${RECEIPTS_FOLDER}/photo_1.jpg`}, {uri: `file://${RECEIPTS_FOLDER}/photo_2.jpg`}, {source: 'https://www.expensify.com/receipts/w_abc.jpg'}];

            // When each request is queued
            for (const receipt of receipts) {
                logReceiptEnqueued({receipt, transactionID: '3', command: WRITE_COMMANDS.REPLACE_RECEIPT, persistedQueueLength: 0});
            }

            // Then nothing is flagged, so the line only fires for receipts that can be lost
            expect(alertLines).toEqual([]);
        });

        it('logs a failed crop with the error name and not the message', () => {
            // Given a native crop error whose message contains the file path
            const error = new TypeError('Could not crop file:///var/mobile/receipt.jpg');

            // When the failure is logged
            logReceiptImageEditFailed({step: 'crop', error});

            // Then the path stays out of the log
            expect(alertLines).toEqual([{message: '[Receipt] cropFailed', params: {event: 'cropFailed', step: 'crop', errorName: 'TypeError'}}]);
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
            WRITE_COMMANDS.SEND_MONEY_ELSEWHERE,
            WRITE_COMMANDS.SEND_MONEY_WITH_WALLET,
            WRITE_COMMANDS.CATEGORIZE_TRACKED_EXPENSE,
            WRITE_COMMANDS.SHARE_TRACKED_EXPENSE,
            WRITE_COMMANDS.ADD_TRACKED_EXPENSE_TO_POLICY,
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

        it('skips requests with no top-level data.receipt (e.g. SplitBill, SendMoney without receipt)', () => {
            // Given two requests with no top-level data.receipt: a split bill, which is left out of the receipt-bearing
            // set because it nests its receipt inside the splits payload, and a send money request issued with no
            // receipt at all. A snapshot row with no trace id cannot be joined to the capture log and would only add noise.
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
    describe('logReceiptRolledBack', () => {
        it('logs the names of the reverted transaction fields but never their values', () => {
            // Given a failed merchant edit whose failure data writes back the whole queue-time transaction
            const failureData = [
                {key: `${ONYXKEYS.COLLECTION.TRANSACTION}1`, value: {merchant: 'Old Cafe', comment: {comment: 'private note'}, errorFields: {}}},
                {key: `${ONYXKEYS.COLLECTION.REPORT}9`, value: {total: 100}},
            ];

            // When the failure data is applied after a server rejection
            logReceiptRolledBack({command: WRITE_COMMANDS.UPDATE_MONEY_REQUEST_MERCHANT, data: {transactionID: '1'}, failureData, trigger: 'serverError'});

            // Then the line lists which transaction fields were reverted, so #3290 can see what a rollback undoes
            const line = logLines.find((logLine) => logLine.params.event === 'rolledBack');
            expect(line?.params).toMatchObject({transactionID: '1', trigger: 'serverError', revertedKeyCount: 2, revertedTransactionFields: 'comment,errorFields,merchant'});

            // And no reverted value reaches the log line
            expect(JSON.stringify(line?.params)).not.toContain('Old Cafe');
            expect(JSON.stringify(line?.params)).not.toContain('private note');
        });

        it('stays silent for commands outside the receipt trail', () => {
            // Given a failed report comment, which never touches an expense
            const failureData = [{key: `${ONYXKEYS.COLLECTION.REPORT}9`, value: {lastMessageText: 'hi'}}];

            // When its failure data is applied
            logReceiptRolledBack({command: WRITE_COMMANDS.ADD_COMMENT, data: {}, failureData, trigger: 'gaveUp'});

            // Then nothing is logged, so the rollback count only covers expense commands
            expect(logLines.filter((line) => line.params.event === 'rolledBack')).toHaveLength(0);
        });
    });

    describe('logReceiptShown', () => {
        it('logs once per receipt and per local or remote render', () => {
            // Given a receipt captured on this device, rendered from its local file twice and then from the server
            const receiptTraceId = 'trace-shown';

            // When the thumbnail loads three times
            logReceiptShown({receiptTraceId, transactionID: '5', source: 'file:///receipt.jpg'});
            logReceiptShown({receiptTraceId, transactionID: '5', source: 'file:///receipt.jpg'});
            logReceiptShown({receiptTraceId, transactionID: '5', source: 'https://www.expensify.com/receipts/w_1.jpg'});

            // Then a re-render does not log again, but the first remote render does, because it proves the server has the file
            const lines = logLines.filter((line) => line.params.event === 'receiptShown');
            expect(lines.map((line) => line.params.isRemoteSource)).toEqual(['false', 'true']);
        });

        it('skips receipts that were not captured on this device', () => {
            // Given a receipt with no trace id, e.g. one a coworker added
            // When its thumbnail loads
            logReceiptShown({receiptTraceId: undefined, transactionID: '6', source: 'https://www.expensify.com/receipts/w_2.jpg'});

            // Then nothing is logged, which keeps list scrolling from flooding the trail
            expect(logLines.filter((line) => line.params.event === 'receiptShown')).toHaveLength(0);
        });
    });

    describe('logReceiptNotFound', () => {
        it('logs whether a navigate-back URL is set instead of the URL itself', () => {
            // Given a report screen showing not-found right after an expense was deleted
            // When the not-found line is logged
            logReceiptNotFound({screen: 'report', reportID: '77', isOffline: false, hasDeleteTransactionNavigateBackUrl: true, isOptimisticDelete: true});

            // Then the flags arrive as strings and no URL is part of the line
            const line = logLines.find((logLine) => logLine.params.event === 'notFound');
            expect(line?.params).toMatchObject({screen: 'report', reportID: '77', isOffline: 'false', hasDeleteTransactionNavigateBackUrl: 'true', isOptimisticDelete: 'true'});
            expect(line?.params).not.toHaveProperty('deleteTransactionNavigateBackUrl');
        });
    });
});
