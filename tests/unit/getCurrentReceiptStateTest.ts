import getCurrentReceiptState from '@pages/iou/request/step/confirmation/submission/utils/getCurrentReceiptState';

import CONST from '@src/CONST';
import type {Receipt} from '@src/types/onyx/Transaction';
import type Transaction from '@src/types/onyx/Transaction';

import createRandomTransaction from '../utils/collections/transaction';

const TRANSACTION_ID = '1';

const RECEIPT: Receipt = {source: 'file://receipt.jpg'};

function buildScanTransaction(overrides: Partial<Transaction> = {}): Transaction {
    return {
        ...createRandomTransaction(Number(TRANSACTION_ID)),
        iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
        isAmountSet: false,
        isMerchantSet: false,
        isCreatedSet: false,
        ...overrides,
    };
}

describe('getCurrentReceiptState', () => {
    it('returns undefined when the transaction has no receipt file', () => {
        // Given a scan transaction whose ID has no entry in the receipt files
        const item = buildScanTransaction();

        // When the receipt state is resolved
        const result = getCurrentReceiptState({item, receiptFiles: {}, canEnterScanFieldsManually: true});

        // Then no state is set, since there is no receipt to submit
        expect(result).toBeUndefined();
    });

    it('returns undefined when the surface does not offer the manual scan fields', () => {
        // Given a scan transaction with a receipt, on a surface that never showed the amount / merchant / date fields
        const item = buildScanTransaction({isAmountSet: true, isMerchantSet: true, isCreatedSet: true});

        // When the receipt state is resolved
        const result = getCurrentReceiptState({item, receiptFiles: {[TRANSACTION_ID]: RECEIPT}, canEnterScanFieldsManually: false});

        // Then no state is set, so the flags carried by the transaction are ignored
        expect(result).toBeUndefined();
    });

    it('returns undefined for a test receipt', () => {
        // Given a scan transaction whose receipt is a test receipt
        const item = buildScanTransaction();

        // When the receipt state is resolved
        const result = getCurrentReceiptState({item, receiptFiles: {[TRANSACTION_ID]: {...RECEIPT, isTestReceipt: true}}, canEnterScanFieldsManually: true});

        // Then no state is set, because test receipts are not scanned
        expect(result).toBeUndefined();
    });

    it('returns undefined for a test drive receipt', () => {
        // Given a scan transaction whose receipt is a test drive receipt
        const item = buildScanTransaction();

        // When the receipt state is resolved
        const result = getCurrentReceiptState({item, receiptFiles: {[TRANSACTION_ID]: {...RECEIPT, isTestDriveReceipt: true}}, canEnterScanFieldsManually: true});

        // Then no state is set, because test drive receipts are not scanned
        expect(result).toBeUndefined();
    });

    it('returns undefined when the transaction is not a scan request', () => {
        // Given a manual transaction that has a receipt attached
        const item = buildScanTransaction({iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL});

        // When the receipt state is resolved
        const result = getCurrentReceiptState({item, receiptFiles: {[TRANSACTION_ID]: RECEIPT}, canEnterScanFieldsManually: true});

        // Then no state is set, since only scan requests decide between scanning and manual entry
        expect(result).toBeUndefined();
    });

    it('returns SCAN_READY when none of the manual scan fields are filled in', () => {
        // Given a scan transaction with a receipt and no amount, merchant or date entered
        const item = buildScanTransaction();

        // When the receipt state is resolved
        const result = getCurrentReceiptState({item, receiptFiles: {[TRANSACTION_ID]: RECEIPT}, canEnterScanFieldsManually: true});

        // Then the receipt is sent to SmartScan
        expect(result).toBe(CONST.IOU.RECEIPT_STATE.SCAN_READY);
    });

    it('returns SCAN_READY when only some of the manual scan fields are filled in', () => {
        // Given a scan transaction with a receipt where only the amount was entered
        const item = buildScanTransaction({isAmountSet: true});

        // When the receipt state is resolved
        const result = getCurrentReceiptState({item, receiptFiles: {[TRANSACTION_ID]: RECEIPT}, canEnterScanFieldsManually: true});

        // Then the receipt is still sent to SmartScan, because the fields are all-or-nothing
        expect(result).toBe(CONST.IOU.RECEIPT_STATE.SCAN_READY);
    });

    it('returns OPEN when all manual scan fields are filled in', () => {
        // Given a scan transaction with a receipt where amount, merchant and date were all entered
        const item = buildScanTransaction({isAmountSet: true, isMerchantSet: true, isCreatedSet: true});

        // When the receipt state is resolved
        const result = getCurrentReceiptState({item, receiptFiles: {[TRANSACTION_ID]: RECEIPT}, canEnterScanFieldsManually: true});

        // Then the expense is submitted as manual, so SmartScan never overwrites the entered values
        expect(result).toBe(CONST.IOU.RECEIPT_STATE.OPEN);
    });
});
