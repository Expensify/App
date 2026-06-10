import reportTransactionsAndViolationsConfig from '@libs/actions/OnyxDerived/configs/reportTransactionsAndViolations';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction, TransactionViolation} from '@src/types/onyx';

describe('reportTransactionsAndViolations derived value', () => {
    it('keeps the existing transaction when only transaction violations are updated', () => {
        const reportID = '91016';
        const transactionID = '91016-transaction';
        const transactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}` as const;
        const violationKey = `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}` as const;
        const transaction: Transaction = {
            transactionID,
            reportID,
            amount: 8700,
            currency: CONST.CURRENCY.EUR,
            merchant: 'Merchant',
            created: '2026-06-10',
        };
        const violation = {
            name: CONST.VIOLATIONS.CATEGORY_OUT_OF_POLICY,
            type: CONST.VIOLATION_TYPES.VIOLATION,
            showInReview: true,
        } as TransactionViolation;

        const currentValue = reportTransactionsAndViolationsConfig.compute([{[transactionKey]: transaction}, {}], {currentValue: undefined, sourceValues: undefined});
        const result = reportTransactionsAndViolationsConfig.compute([{}, {[violationKey]: [violation]}], {
            currentValue,
            sourceValues: {
                [ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS]: {[violationKey]: [violation]},
            },
        });

        expect(result[reportID]?.transactions[transactionKey]).toBe(transaction);
        expect(result[reportID]?.violations[violationKey]).toEqual([violation]);
    });

    it('still removes the existing transaction when the transaction collection sends a delete update', () => {
        const reportID = '91016-delete';
        const transactionID = '91016-delete-transaction';
        const transactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}` as const;
        const transaction: Transaction = {
            transactionID,
            reportID,
            amount: 8700,
            currency: CONST.CURRENCY.EUR,
            merchant: 'Merchant',
            created: '2026-06-10',
        };

        const currentValue = reportTransactionsAndViolationsConfig.compute([{[transactionKey]: transaction}, {}], {currentValue: undefined, sourceValues: undefined});
        const result = reportTransactionsAndViolationsConfig.compute([{[transactionKey]: undefined}, {}], {
            currentValue,
            sourceValues: {
                [ONYXKEYS.COLLECTION.TRANSACTION]: {[transactionKey]: undefined},
            },
        });

        expect(result[reportID]?.transactions[transactionKey]).toBeUndefined();
    });
});
