import {constructReceiptSourceFromFilename, getThumbnailAndImageURIs, shouldValidateFile} from '@libs/ReceiptUtils';

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

    describe('shouldValidateFile', () => {
        it('validates a shared HEIF file so it is converted to JPEG like HEIC', () => {
            // Given a file shared as image/heif, which Android sends for .heif files
            const file = {id: 'photo.heif', content: 'file:///photo.heif', mimeType: CONST.SHARE_FILE_MIMETYPE.HEIF};

            // When checking whether the share flow should validate it
            const result = shouldValidateFile(file);

            // Then it is validated, so the HEIF is converted before upload instead of being sent as is
            expect(result).toBe(true);
        });

        it('does not validate a shared JPEG file', () => {
            // Given a file shared as image/jpeg, which needs no conversion
            const file = {id: 'photo.jpg', content: 'file:///photo.jpg', mimeType: CONST.SHARE_FILE_MIMETYPE.JPEG};

            // When checking whether the share flow should validate it
            const result = shouldValidateFile(file);

            // Then it is not validated, so the JPEG is used as is
            expect(result).toBe(false);
        });
    });
});
