import {buildMergedTransactionData, getMergeableDataAndConflictFields, selectTargetAndSourceTransactionIDsForMerge} from '@libs/MergeTransactionUtils';
import CONST from '@src/CONST';
import createRandomMergeTransaction from '../utils/collections/mergeTransaction';
import createRandomTransaction from '../utils/collections/transaction';

describe('MergeTransactionUtils', () => {
    describe('getMergeableDataAndConflictFields', () => {
        it('should merge matching values and identify conflicts for different ones', () => {
            // When target and source have some same, and some different values
            const targetTransaction = {
                ...createRandomTransaction(0),
                amount: 1000,
                currency: CONST.CURRENCY.USD,
                merchant: 'Same Merchant',
                modifiedMerchant: 'Same Merchant',
                category: 'Food',
                tag: '', // Empty
                comment: {comment: 'Different description 1'},
                reimbursable: true,
                billable: false,
            };
            const sourceTransaction = {
                ...createRandomTransaction(1),
                amount: 1000, // Same amount but different currency
                currency: CONST.CURRENCY.AUD,
                merchant: '', // Empty
                modifiedMerchant: '',
                category: 'Food', // Same
                tag: 'Same Tag', // Have value
                comment: {comment: 'Different description 2'}, // Different
                reimbursable: false, // Different
                billable: undefined, // Undefined value
            };

            const result = getMergeableDataAndConflictFields(targetTransaction, sourceTransaction);

            // Only the different values are in the conflict fields
            expect(result.conflictFields).toEqual(['amount', 'description', 'reimbursable']);

            // The same values or either target or source has value are in the mergeable data
            expect(result.mergeableData).toEqual({
                merchant: 'Same Merchant',
                category: 'Food',
                tag: 'Same Tag',
                billable: false,
            });
        });

        it('should merge amount field correctly when they are same', () => {
            const targetTransaction = {
                ...createRandomTransaction(1),
                amount: 1000,
                currency: CONST.CURRENCY.USD,
            };
            const sourceTransaction = {
                ...createRandomTransaction(2),
                amount: 1000,
                currency: CONST.CURRENCY.USD,
            };

            const result = getMergeableDataAndConflictFields(targetTransaction, sourceTransaction);

            expect(result.conflictFields).not.toContain('amount');
            expect(result.mergeableData).toMatchObject({
                amount: -1000,
            });
        });
    });

    describe('buildMergedTransactionData', () => {
        it('should build merged transaction data correctly', () => {
            const targetTransaction = {
                ...createRandomTransaction(0),
                amount: 1000,
                merchant: 'Original Merchant',
                category: 'Original Category',
                tag: 'Original Tag',
                comment: {
                    comment: 'Original description',
                    waypoints: {waypoint0: {name: 'Original waypoint'}},
                },
                reimbursable: true,
                billable: false,
                receipt: {receiptID: 1234, source: 'original.jpg'},
            };

            const mergeTransaction = {
                ...createRandomMergeTransaction(0),
                amount: 2000,
                merchant: 'Merged Merchant',
                category: 'Merged Category',
                tag: 'Merged Tag',
                description: 'Merged description',
                reimbursable: false,
                billable: true,
                receipt: {receiptID: 1235, source: 'merged.jpg'},
            };

            const result = buildMergedTransactionData(targetTransaction, mergeTransaction);

            // The result should be the target transaction with the merge transaction updates
            expect(result).toEqual({
                ...targetTransaction,
                amount: 2000,
                modifiedAmount: 2000,
                merchant: 'Merged Merchant',
                modifiedMerchant: 'Merged Merchant',
                modifiedCurrency: 'USD',
                category: 'Merged Category',
                tag: 'Merged Tag',
                comment: {
                    ...targetTransaction.comment,
                    comment: 'Merged description',
                },
                reimbursable: false,
                billable: true,
                receipt: {receiptID: 1235, source: 'merged.jpg'},
            });
        });
    });

    describe('selectTargetAndSourceTransactionIDsForMerge', () => {
        it('should handle undefined transactions gracefully', () => {
            const result = selectTargetAndSourceTransactionIDsForMerge(undefined, undefined);

            expect(result).toEqual({
                targetTransactionID: undefined,
                sourceTransactionID: undefined,
            });
        });

        it('should make card transaction the target when 2nd transaction is card transaction', () => {
            const cashTransaction = {
                ...createRandomTransaction(0),
                transactionID: 'cash1',
                managedCard: undefined,
            };
            const cardTransaction = {
                ...createRandomTransaction(1),
                transactionID: 'card1',
                managedCard: true,
            };

            const result = selectTargetAndSourceTransactionIDsForMerge(cashTransaction, cardTransaction);

            expect(result).toEqual({
                targetTransactionID: 'card1',
                sourceTransactionID: 'cash1',
            });
        });

        it('should keep original order when 1st transaction is card transaction', () => {
            const cardTransaction = {
                ...createRandomTransaction(0),
                transactionID: 'card1',
                managedCard: true,
            };
            const cashTransaction = {
                ...createRandomTransaction(1),
                transactionID: 'cash1',
                managedCard: undefined,
            };

            const result = selectTargetAndSourceTransactionIDsForMerge(cardTransaction, cashTransaction);

            expect(result).toEqual({
                targetTransactionID: 'card1',
                sourceTransactionID: 'cash1',
            });
        });

        it('should keep original order when both are cash transactions', () => {
            const cashTransaction1 = {
                ...createRandomTransaction(0),
                transactionID: 'cash1',
                managedCard: undefined,
            };
            const cashTransaction2 = {
                ...createRandomTransaction(1),
                transactionID: 'cash2',
                managedCard: undefined,
            };

            const result = selectTargetAndSourceTransactionIDsForMerge(cashTransaction1, cashTransaction2);

            expect(result).toEqual({
                targetTransactionID: 'cash1',
                sourceTransactionID: 'cash2',
            });
        });
    });
});
