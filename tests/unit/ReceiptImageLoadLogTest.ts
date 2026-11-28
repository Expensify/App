import Log from '@libs/Log';
import {createReceiptImageLoadReporter, getReceiptSourceKind, resetLoggedReceiptImageLoadEvents} from '@libs/telemetry/ReceiptImageLoadLog';

import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';

import createRandomTransaction from '../utils/collections/transaction';

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Error);
}

const SIGNED_URL = 'https://www.expensify.com/receipts/w_abc123.jpg.320.jpg?authToken=secret';

const transaction: Transaction = {
    ...createRandomTransaction(1),
    transactionID: '42',
    receipt: {receiptTraceId: 'trace-1', state: CONST.IOU.RECEIPT_STATE.SCAN_READY, source: SIGNED_URL},
    pendingAction: undefined,
    pendingFields: {receipt: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
    errors: undefined,
    errorFields: undefined,
};

describe('ReceiptImageLoadLog', () => {
    let hmmmSpy: jest.SpiedFunction<typeof Log.hmmm>;
    let infoSpy: jest.SpiedFunction<typeof Log.info>;

    const countLinesForSurface = (surface: string) => hmmmSpy.mock.calls.filter(([, params]) => isPlainObject(params) && params.surface === surface).length;

    beforeEach(() => {
        resetLoggedReceiptImageLoadEvents();
        hmmmSpy = jest.spyOn(Log, 'hmmm').mockImplementation(() => {});
        infoSpy = jest.spyOn(Log, 'info').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('logs a failed receipt image with the transaction context and no URL', () => {
        // Given the reporter a receipt screen puts on the context
        const report = createReceiptImageLoadReporter(transaction, 'list');

        // When an image fails to load
        report({type: 'error', afterTimeout: false, component: 'ImageWithLoading', source: SIGNED_URL});

        // Then one uiError line carries what decides the state, and the signed URL appears nowhere in it
        expect(hmmmSpy).toHaveBeenCalledTimes(1);
        expect(hmmmSpy).toHaveBeenCalledWith(
            '[Receipt] uiError',
            expect.objectContaining({
                event: 'uiError',
                transactionID: '42',
                receiptTraceId: 'trace-1',
                surface: 'list',
                component: 'ImageWithLoading',
                receiptSourceKind: 'remote',
                afterTimeout: false,
                receiptState: CONST.IOU.RECEIPT_STATE.SCAN_READY,
                isReceiptPending: true,
                hasErrors: false,
            }),
        );
        expect(JSON.stringify(hmmmSpy.mock.calls)).not.toContain('w_abc123');
    });

    it('logs a stall with its reason, and a retry or recovery at info level', () => {
        // Given a receipt image in the modal
        const report = createReceiptImageLoadReporter(transaction, 'modal');

        // When it stalls, the user retries, and it then loads
        report({type: 'stall', reason: 'stall', component: 'ImageView', source: SIGNED_URL});
        report({type: 'retry', component: 'ImageView', source: SIGNED_URL});
        report({type: 'recovered', component: 'ImageView', source: SIGNED_URL});

        // Then the stall is the countable line, and the retry and recovery only explain what followed
        expect(hmmmSpy).toHaveBeenCalledWith('[Receipt] uiStall', expect.objectContaining({event: 'uiStall', reason: 'stall', surface: 'modal'}));
        expect(infoSpy).toHaveBeenCalledWith('[Receipt] uiRetry', false, expect.objectContaining({event: 'uiRetry'}));
        expect(infoSpy).toHaveBeenCalledWith('[Receipt] uiRecovered', false, expect.objectContaining({event: 'uiRecovered'}));
    });

    it('logs each receipt image event once, so a page of failing thumbnails does not flood the logs', () => {
        // Given two thumbnails of the same receipt on one page, and another receipt
        const report = createReceiptImageLoadReporter(transaction, 'list');
        const reportOther = createReceiptImageLoadReporter({...transaction, transactionID: '43'}, 'list');

        // When they all fail, twice over
        for (let i = 0; i < 2; i++) {
            report({type: 'error', afterTimeout: false, component: 'ImageWithLoading', source: SIGNED_URL});
            report({type: 'error', afterTimeout: false, component: 'ImageWithLoading', source: SIGNED_URL});
            reportOther({type: 'error', afterTimeout: false, component: 'ImageWithLoading', source: SIGNED_URL});
        }

        // Then each receipt is logged once
        expect(hmmmSpy).toHaveBeenCalledTimes(2);
    });

    it('treats the same receipt with a rotated auth token as one source', () => {
        // Given a receipt thumbnail that already failed
        const report = createReceiptImageLoadReporter(transaction, 'list');
        report({type: 'error', afterTimeout: false, component: 'ImageWithLoading', source: SIGNED_URL});

        // When it fails again after the auth token in its URL changed
        report({type: 'error', afterTimeout: false, component: 'ImageWithLoading', source: SIGNED_URL.replace('secret', 'rotated')});

        // Then it is still logged once
        expect(hmmmSpy).toHaveBeenCalledTimes(1);
    });

    it('caps a burst of failures outside the modal and reports how many lines it dropped', () => {
        jest.useFakeTimers();
        const failReceipt = (transactionID: string, surface: 'list' | 'expense' | 'modal') =>
            createReceiptImageLoadReporter({...transaction, transactionID}, surface)({type: 'error', afterTimeout: false, component: 'ImageWithLoading', source: SIGNED_URL});

        // Given 15 different receipts failing at once on a Search page, in chat previews, and in the modal
        for (let i = 0; i < 15; i++) {
            failReceipt(`list-${i}`, 'list');
            failReceipt(`expense-${i}`, 'expense');
            failReceipt(`modal-${i}`, 'modal');
        }

        // Then the list and the previews each log only 10 lines, while the modal, which shows one receipt at a time, is not capped
        expect(countLinesForSurface('list')).toBe(10);
        expect(countLinesForSurface('expense')).toBe(10);
        expect(countLinesForSurface('modal')).toBe(15);

        // When the next list failure comes after the window
        jest.advanceTimersByTime(10_000);
        failReceipt('list-late', 'list');

        // Then it carries the count of the 5 lines dropped before it
        expect(hmmmSpy).toHaveBeenLastCalledWith('[Receipt] uiError', expect.objectContaining({transactionID: 'list-late', suppressedCount: 5}));
        jest.useRealTimers();
    });

    it('names the source kind instead of the source', () => {
        // Given sources of every kind, some of which carry a signed URL or a device path
        // When each one is classified
        // Then only the kind comes back, which is what gets logged
        expect(getReceiptSourceKind(SIGNED_URL)).toBe('remote');
        expect(getReceiptSourceKind('blob:https://new.expensify.com/1234')).toBe('blob');
        expect(getReceiptSourceKind('file:///var/mobile/receipt.jpg')).toBe('local');
        expect(getReceiptSourceKind('data:image/png;base64,AAAA')).toBe('data');
        expect(getReceiptSourceKind(42)).toBe('bundled');
        expect(getReceiptSourceKind(undefined)).toBe('missing');
    });
});
