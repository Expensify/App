import {constructReceiptSourceFromFilename, getThumbnailAndImageURIs} from '@libs/ReceiptUtils';

import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';
import type {Receipt} from '@src/types/onyx/Transaction';

import createRandomTransaction from '../utils/collections/transaction';

const makeTransaction = (receipt: Receipt | undefined, overrides: Partial<Transaction> = {}): Transaction => ({
    ...createRandomTransaction(1),
    hasEReceipt: false,
    receipt,
    ...overrides,
});

describe('ReceiptUtils', () => {
    describe('getThumbnailAndImageURIs', () => {
        it('returns isEmptyReceipt for a genuinely empty receipt (no state, source, filename, or eReceipt)', () => {
            expect(getThumbnailAndImageURIs(makeTransaction({}))).toEqual({isEmptyReceipt: true});
        });

        it('returns isEmptyReceipt when there is no receipt at all', () => {
            expect(getThumbnailAndImageURIs(makeTransaction(undefined))).toEqual({isEmptyReceipt: true});
        });

        it('builds image/thumbnail URLs from source when receipt has a source but no state', () => {
            const source = 'https://www.expensify.com/receipts/w_abc123.jpg';
            const result = getThumbnailAndImageURIs(makeTransaction({source, filename: 'w_abc123.jpg'}));

            expect(result.isEmptyReceipt).toBeUndefined();
            expect(result.image).toBe(source);
            expect(result.thumbnail320).toBe(`${source}.320.jpg`);
            expect(result.thumbnail).toBe(`${source}.1024.jpg`);
        });

        it('builds URLs from filename when receipt has only a filename (e.g. email/billing receipts) and no state or source', () => {
            const filename = 'w_abc123.jpg';
            const expectedSource = constructReceiptSourceFromFilename(filename);
            const result = getThumbnailAndImageURIs(makeTransaction({filename}));

            expect(result.isEmptyReceipt).toBeUndefined();
            expect(result.image).toBe(expectedSource);
            expect(result.thumbnail320).toBe(`${expectedSource}.320.jpg`);
            expect(result.filename).toBe(filename);
        });

        it('still resolves a receipt that has a state (SmartScanned)', () => {
            const source = 'https://www.expensify.com/receipts/w_scanned.jpg';
            const result = getThumbnailAndImageURIs(makeTransaction({source, state: CONST.IOU.RECEIPT_STATE.OPEN}));

            expect(result.isEmptyReceipt).toBeUndefined();
            expect(result.image).toBe(source);
        });
    });
});
