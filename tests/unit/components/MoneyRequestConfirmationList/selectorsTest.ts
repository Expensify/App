import {merchantStateSelector} from '@components/MoneyRequestConfirmationList/sections/selectors';
import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';

function createTransaction(overrides: Partial<Transaction> = {}): Transaction {
    return {
        transactionID: 'txn1',
        amount: 100,
        currency: 'USD',
        merchant: 'Coffee Shop',
        ...overrides,
    } as Transaction;
}

describe('MoneyRequestConfirmationList selectors', () => {
    describe('merchantStateSelector', () => {
        it('returns undefined when transaction is undefined', () => {
            expect(merchantStateSelector(undefined)).toBeUndefined();
        });

        it('returns merchant state for a valid transaction', () => {
            const transaction = createTransaction({merchant: 'Starbucks', isMerchantSet: true});

            expect(merchantStateSelector(transaction)).toEqual({
                merchant: 'Starbucks',
                isMerchantSet: true,
                isMissing: false,
                hasReceipt: false,
            });
        });

        it('prefers modifiedMerchant over merchant', () => {
            const transaction = createTransaction({
                merchant: 'Original Merchant',
                modifiedMerchant: 'Updated Merchant',
            });

            expect(merchantStateSelector(transaction)?.merchant).toBe('Updated Merchant');
        });

        it('defaults isMerchantSet to false when not set', () => {
            const transaction = createTransaction({merchant: 'Starbucks'});

            expect(merchantStateSelector(transaction)?.isMerchantSet).toBe(false);
        });

        it('marks default merchant values as missing', () => {
            expect(merchantStateSelector(createTransaction({merchant: CONST.TRANSACTION.DEFAULT_MERCHANT}))?.isMissing).toBe(true);
            expect(merchantStateSelector(createTransaction({merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT}))?.isMissing).toBe(true);
            expect(merchantStateSelector(createTransaction({merchant: ''}))?.isMissing).toBe(true);
        });

        it('returns hasReceipt true when transaction has a receipt state', () => {
            const transaction = createTransaction({
                receipt: {state: CONST.IOU.RECEIPT_STATE.SCAN_COMPLETE},
            });

            expect(merchantStateSelector(transaction)?.hasReceipt).toBe(true);
        });
    });
});
