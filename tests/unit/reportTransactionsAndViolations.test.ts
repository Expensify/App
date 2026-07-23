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
        const result = reportTransactionsAndViolationsConfig.compute([{[transactionKey]: transaction}, {[violationKey]: [violation]}], {
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

    it('removes the report bucket when the last transaction is deleted', () => {
        const reportID = '91016-empty-report';
        const transactionID = '91016-empty-report-transaction';
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

        expect(result[reportID]).toBeUndefined();
    });

    it('does not carry empty currentValue buckets into a full recompute', () => {
        const staleReportID = '91016-stale-empty-report';
        const reportID = '91016-full-recompute';
        const transactionID = '91016-full-recompute-transaction';
        const transactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}` as const;
        const transaction: Transaction = {
            transactionID,
            reportID,
            amount: 8700,
            currency: CONST.CURRENCY.EUR,
            merchant: 'Merchant',
            created: '2026-06-10',
        };

        const result = reportTransactionsAndViolationsConfig.compute([{[transactionKey]: transaction}, {}], {
            currentValue: {
                [staleReportID]: {
                    transactions: {},
                    violations: {},
                },
            },
            sourceValues: undefined,
        });

        expect(result[staleReportID]).toBeUndefined();
        expect(result[reportID]?.transactions[transactionKey]).toBe(transaction);
    });

    it('does not carry deleted transactions from currentValue into a full recompute', () => {
        const reportID = '91016-non-empty-report';
        const deletedTransactionID = '91016-deleted-transaction';
        const remainingTransactionID = '91016-remaining-transaction';
        const deletedTransactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${deletedTransactionID}` as const;
        const remainingTransactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${remainingTransactionID}` as const;
        const deletedTransaction: Transaction = {
            transactionID: deletedTransactionID,
            reportID,
            amount: 8700,
            currency: CONST.CURRENCY.EUR,
            merchant: 'Deleted merchant',
            created: '2026-06-10',
        };
        const remainingTransaction: Transaction = {
            transactionID: remainingTransactionID,
            reportID,
            amount: 4200,
            currency: CONST.CURRENCY.EUR,
            merchant: 'Remaining merchant',
            created: '2026-06-10',
        };

        const result = reportTransactionsAndViolationsConfig.compute([{[remainingTransactionKey]: remainingTransaction}, {}], {
            currentValue: {
                [reportID]: {
                    transactions: {
                        [deletedTransactionKey]: deletedTransaction,
                        [remainingTransactionKey]: remainingTransaction,
                    },
                    violations: {},
                },
            },
            sourceValues: undefined,
        });

        expect(result[reportID]?.transactions[deletedTransactionKey]).toBeUndefined();
        expect(result[reportID]?.transactions[remainingTransactionKey]).toBe(remainingTransaction);
    });

    it('skips violation-only updates when the affected transaction is unavailable', () => {
        const transactionID = '91016-missing-transaction';
        const violationKey = `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}` as const;
        const violation = {
            name: CONST.VIOLATIONS.CATEGORY_OUT_OF_POLICY,
            type: CONST.VIOLATION_TYPES.VIOLATION,
            showInReview: true,
        } as TransactionViolation;
        const context = {
            currentValue: {},
            sourceValues: {
                [ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS]: {[violationKey]: [violation]},
            },
            shouldSkipUpdate: false,
        };

        const result = reportTransactionsAndViolationsConfig.compute([{}, {[violationKey]: [violation]}], context);

        expect(result).toEqual({});
        expect(context.shouldSkipUpdate).toBe(true);
    });

    it('skips violation-only updates when the affected transaction only exists in currentValue', () => {
        const reportID = '91016-current-value-only';
        const transactionID = '91016-current-value-only-transaction';
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
        const context = {
            currentValue,
            sourceValues: {
                [ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS]: {[violationKey]: [violation]},
            },
            shouldSkipUpdate: false,
        };

        const result = reportTransactionsAndViolationsConfig.compute([{}, {[violationKey]: [violation]}], context);

        expect(result).toEqual(currentValue);
        expect(context.shouldSkipUpdate).toBe(true);
    });

    it('skips initial dependency loads when a current derived value already exists', () => {
        const staleReportID = '91016-stale-initial-load';
        const currentReportID = '91016-current-initial-load';
        const staleTransactionID = '91016-stale-initial-load-transaction';
        const currentTransactionID = '91016-current-initial-load-transaction';
        const staleTransactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${staleTransactionID}` as const;
        const currentTransactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${currentTransactionID}` as const;
        const staleTransaction: Transaction = {
            transactionID: staleTransactionID,
            reportID: staleReportID,
            amount: 8700,
            currency: CONST.CURRENCY.EUR,
            merchant: 'Stale merchant',
            created: '2026-06-10',
        };
        const currentTransaction: Transaction = {
            transactionID: currentTransactionID,
            reportID: currentReportID,
            amount: 4200,
            currency: CONST.CURRENCY.EUR,
            merchant: 'Current merchant',
            created: '2026-06-10',
        };
        const currentValue = reportTransactionsAndViolationsConfig.compute([{[currentTransactionKey]: currentTransaction}, {}], {currentValue: undefined, sourceValues: undefined});
        const context = {
            currentValue,
            sourceValues: undefined,
            isInitialDependencyLoad: true,
            shouldSkipUpdate: false,
        };

        const result = reportTransactionsAndViolationsConfig.compute([{[staleTransactionKey]: staleTransaction}, {}], context);

        expect(result).toEqual(currentValue);
        expect(context.shouldSkipUpdate).toBe(true);
    });

    it('applies resolvable violation updates when the same batch has unresolved transactions', () => {
        const reportID = '91016-mixed-batch';
        const transactionID = '91016-visible-transaction';
        const missingTransactionID = '91016-missing-transaction';
        const transactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}` as const;
        const violationKey = `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}` as const;
        const missingViolationKey = `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${missingTransactionID}` as const;
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
        const missingViolation = {
            name: CONST.VIOLATIONS.TAG_OUT_OF_POLICY,
            type: CONST.VIOLATION_TYPES.VIOLATION,
            showInReview: true,
        } as TransactionViolation;
        const context = {
            currentValue: reportTransactionsAndViolationsConfig.compute([{[transactionKey]: transaction}, {}], {currentValue: undefined, sourceValues: undefined}),
            sourceValues: {
                [ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS]: {
                    [violationKey]: [violation],
                    [missingViolationKey]: [missingViolation],
                },
            },
            shouldSkipUpdate: false,
        };

        const result = reportTransactionsAndViolationsConfig.compute([{[transactionKey]: transaction}, {[violationKey]: [violation], [missingViolationKey]: [missingViolation]}], context);

        expect(context.shouldSkipUpdate).toBe(false);
        expect(result[reportID]?.transactions[transactionKey]).toBe(transaction);
        expect(result[reportID]?.violations[violationKey]).toEqual([violation]);
    });
});
