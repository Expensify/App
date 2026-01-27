import Onyx from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import {areTransactionsEligibleForMerge, mergeTransactionRequest, setMergeTransactionKey, setupMergeTransactionData} from '@libs/actions/MergeTransaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {MergeTransaction as MergeTransactionType, Report, Transaction, TransactionViolation, TransactionViolations} from '@src/types/onyx';
import createRandomMergeTransaction from '../utils/collections/mergeTransaction';
import {createExpenseReport} from '../utils/collections/reports';
import createRandomTransaction, {createRandomDistanceRequestTransaction} from '../utils/collections/transaction';
import * as TestHelper from '../utils/TestHelper';
import type {MockFetch} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Helper function to create mock violations
function createMockViolations(): TransactionViolation[] {
    return [
        {
            type: CONST.VIOLATION_TYPES.VIOLATION,
            name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION,
            showInReview: true,
        },
        {
            type: CONST.VIOLATION_TYPES.VIOLATION,
            name: CONST.VIOLATIONS.MISSING_CATEGORY,
            showInReview: true,
        },
    ];
}

// Helper function to create allTransactionViolations collection
function createAllTransactionViolations(
    targetTransactionID: string,
    sourceTransactionID: string,
    targetViolations?: TransactionViolation[],
    sourceViolations?: TransactionViolation[],
): OnyxCollection<TransactionViolations> {
    const allViolations: OnyxCollection<TransactionViolations> = {};
    if (targetViolations) {
        allViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${targetTransactionID}`] = targetViolations;
    }
    if (sourceViolations) {
        allViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${sourceTransactionID}`] = sourceViolations;
    }
    return allViolations;
}

describe('mergeTransactionRequest', () => {
    let mockFetch: MockFetch;

    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        global.fetch = TestHelper.getGlobalFetchMock();
        mockFetch = fetch as MockFetch;
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    it('should update target transaction with merged values optimistically', async () => {
        // Given:
        // - Target transaction with original merchant and category values
        // - Source transaction that will be deleted after merge (only transaction in its report)
        // - Merge transaction containing the final values to keep
        const targetTransaction = {
            ...createRandomTransaction(1),
            amount: 100,
            currency: 'USD',
            transactionID: 'target123',
            merchant: 'Original Merchant',
            category: 'Original Category',
            reportID: 'target-report-456',
        };
        const sourceExpenseReport = {
            ...createExpenseReport(1),
            reportID: 'source-report-123',
        };
        const sourceTransaction = {
            ...createRandomTransaction(2),
            transactionID: 'source456',
            reportID: sourceExpenseReport.reportID,
        };
        const mergeTransaction = {
            ...createRandomMergeTransaction(1),
            amount: 200,
            currency: 'USD',
            targetTransactionID: 'target123',
            sourceTransactionID: 'source456',
            merchant: 'Updated Merchant',
            category: 'Updated Category',
            tag: 'Updated Tag',
        };
        const mergeTransactionID = 'merge789';

        // Sample violations for testing
        const targetViolations: TransactionViolation[] = [
            {
                type: CONST.VIOLATION_TYPES.VIOLATION,
                name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION,
                showInReview: true,
            },
            {
                type: CONST.VIOLATION_TYPES.VIOLATION,
                name: CONST.VIOLATIONS.MISSING_TAG,
                showInReview: true,
            },
        ];
        const sourceViolations: TransactionViolation[] = [
            {
                type: CONST.VIOLATION_TYPES.VIOLATION,
                name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION,
                showInReview: true,
            },
            {
                type: CONST.VIOLATION_TYPES.VIOLATION,
                name: CONST.VIOLATIONS.OVER_LIMIT,
                showInReview: true,
            },
        ];

        // Set up initial state in Onyx
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${targetTransaction.transactionID}`, targetTransaction);
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${sourceTransaction.transactionID}`, sourceTransaction);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${sourceExpenseReport.reportID}`, sourceExpenseReport);
        await Onyx.set(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${mergeTransactionID}`, mergeTransaction);

        mockFetch?.pause?.();

        // When: The merge transaction request is initiated
        // This should immediately update the UI with optimistic values
        mergeTransactionRequest({
            mergeTransactionID,
            mergeTransaction,
            targetTransaction,
            sourceTransaction,
            targetTransactionThreadReport: {reportID: 'target-report-456'},
            targetTransactionThreadParentReport: undefined,
            targetTransactionThreadParentReportNextStep: undefined,
            allTransactionViolations: createAllTransactionViolations(targetTransaction.transactionID, sourceTransaction.transactionID, targetViolations, sourceViolations),
            policy: undefined,
            policyTags: undefined,
            policyCategories: undefined,
            currentUserAccountIDParam: 123,
            currentUserEmailParam: 'existing@example.com',
            isASAPSubmitBetaEnabled: false,
        });

        await mockFetch?.resume?.();
        await waitForBatchedUpdates();

        // Then: Verify that optimistic updates are applied correctly
        const updatedTargetTransaction = await new Promise<Transaction | null>((resolve) => {
            const connection = Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.TRANSACTION}${targetTransaction.transactionID}`,
                callback: (transaction) => {
                    Onyx.disconnect(connection);
                    resolve(transaction ?? null);
                },
            });
        });

        const updatedSourceTransaction = await new Promise<Transaction | null>((resolve) => {
            const connection = Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.TRANSACTION}${sourceTransaction.transactionID}`,
                callback: (transaction) => {
                    Onyx.disconnect(connection);
                    resolve(transaction ?? null);
                },
            });
        });

        const updatedSourceReport = await new Promise<Report | null>((resolve) => {
            const connection = Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.REPORT}${sourceExpenseReport.reportID}`,
                callback: (report) => {
                    Onyx.disconnect(connection);
                    resolve(report ?? null);
                },
            });
        });

        const updatedMergeTransaction = await new Promise<MergeTransactionType | null>((resolve) => {
            const connection = Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${mergeTransactionID}`,
                callback: (transaction) => {
                    Onyx.disconnect(connection);
                    resolve(transaction ?? null);
                },
            });
        });

        // Verify target transaction is updated with merged values
        expect(updatedTargetTransaction?.modifiedAmount).toBe(mergeTransaction.amount);
        expect(updatedTargetTransaction?.modifiedMerchant).toBe(mergeTransaction.merchant);
        expect(updatedTargetTransaction?.category).toBe(mergeTransaction.category);
        expect(updatedTargetTransaction?.tag).toBe(mergeTransaction.tag);
        expect(updatedTargetTransaction?.comment?.comment).toBe(mergeTransaction.description);

        // Verify source transaction is deleted
        expect(updatedSourceTransaction).toBeNull();

        // Verify source report is deleted (since it only had one transaction)
        expect(updatedSourceReport).toBeNull();

        // Verify merge transaction is cleaned up
        expect(updatedMergeTransaction).toBeNull();
    });

    it('should restore original state when API returns error', async () => {
        // Given:
        // - Target transaction with original data that should be restored on failure
        // - Source transaction that should be restored if merge fails (only transaction in its report)
        // - Source report that should be restored if merge fails
        // - Transaction violations are set up in Onyx for both transactions
        const sourceReport = {
            ...createExpenseReport(1),
            reportID: 'source-report-123',
        };
        const targetTransaction = {
            ...createRandomTransaction(1),
            transactionID: 'target123',
            merchant: 'Original Merchant',
            category: 'Original Category',
            reportID: 'target-report-456',
        };
        const sourceTransaction = {
            ...createRandomTransaction(2),
            transactionID: 'source456',
            merchant: 'Source Merchant',
            reportID: sourceReport.reportID,
        };
        const mergeTransaction = {
            ...createRandomMergeTransaction(1),
            targetTransactionID: 'target123',
            sourceTransactionID: 'source456',
            merchant: 'Updated Merchant',
            category: 'Updated Category',
        };
        const mergeTransactionID = 'merge789';

        const mockViolations = createMockViolations();

        mockFetch?.pause?.();

        // Set up initial state in Onyx
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${targetTransaction.transactionID}`, targetTransaction);
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${sourceTransaction.transactionID}`, sourceTransaction);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${sourceReport.reportID}`, sourceReport);
        await Onyx.set(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${mergeTransactionID}`, mergeTransaction);
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${targetTransaction.transactionID}`, mockViolations);
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${sourceTransaction.transactionID}`, mockViolations);
        await waitForBatchedUpdates();

        // When: The merge request is executed but the API will return an error
        mockFetch?.fail?.();

        mergeTransactionRequest({
            mergeTransactionID,
            mergeTransaction,
            targetTransaction,
            sourceTransaction,
            targetTransactionThreadReport: {reportID: 'target-report-456'},
            targetTransactionThreadParentReport: undefined,
            targetTransactionThreadParentReportNextStep: undefined,
            allTransactionViolations: createAllTransactionViolations(targetTransaction.transactionID, sourceTransaction.transactionID, mockViolations, mockViolations),
            policy: undefined,
            policyTags: undefined,
            policyCategories: undefined,
            currentUserAccountIDParam: 123,
            currentUserEmailParam: 'existing@example.com',
            isASAPSubmitBetaEnabled: false,
        });

        await waitForBatchedUpdates();

        // Resume fetch to process the failed API response
        await mockFetch?.resume?.();
        await waitForBatchedUpdates();

        // Then: Verify that original state is restored after API failure
        const restoredTargetTransaction = await new Promise<Transaction | null>((resolve) => {
            const connection = Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.TRANSACTION}${targetTransaction.transactionID}`,
                callback: (transaction) => {
                    Onyx.disconnect(connection);
                    resolve(transaction ?? null);
                },
            });
        });

        const restoredSourceTransaction = await new Promise<Transaction | null>((resolve) => {
            const connection = Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.TRANSACTION}${sourceTransaction.transactionID}`,
                callback: (transaction) => {
                    Onyx.disconnect(connection);
                    resolve(transaction ?? null);
                },
            });
        });

        const restoredSourceReport = await new Promise<Report | null>((resolve) => {
            const connection = Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.REPORT}${sourceReport.reportID}`,
                callback: (report) => {
                    Onyx.disconnect(connection);
                    resolve(report ?? null);
                },
            });
        });

        // Verify target transaction is restored to original state
        expect(restoredTargetTransaction?.merchant).toBe('Original Merchant');
        expect(restoredTargetTransaction?.category).toBe('Original Category');

        // Verify source transaction is restored (not deleted)
        expect(restoredSourceTransaction?.transactionID).toBe('source456');
        expect(restoredSourceTransaction?.merchant).toBe('Source Merchant');

        // Verify source report is restored (not deleted)
        expect(restoredSourceReport?.reportID).toBe(sourceReport.reportID);
        expect(restoredSourceReport).toEqual(sourceReport);
    });

    it('should handle transaction violations correctly during merge', async () => {
        // Given:
        // - Both transactions have DUPLICATED_TRANSACTION and MISSING_CATEGORY violations set in Onyx
        // - When merged, duplicate violations should be removed optimistically
        // - On success, only non-duplicate violations should remain
        const targetTransaction = {
            ...createRandomTransaction(1),
            transactionID: 'target123',
        };
        const sourceTransaction = {
            ...createRandomTransaction(2),
            transactionID: 'source456',
        };
        const mergeTransaction = {
            ...createRandomMergeTransaction(1),
            targetTransactionID: 'target123',
            sourceTransactionID: 'source456',
        };
        const mergeTransactionID = 'merge789';

        const mockViolations = createMockViolations();

        // Set up initial state with violations in Onyx
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${targetTransaction.transactionID}`, targetTransaction);
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${sourceTransaction.transactionID}`, sourceTransaction);
        await Onyx.set(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${mergeTransactionID}`, mergeTransaction);
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${targetTransaction.transactionID}`, mockViolations);
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${sourceTransaction.transactionID}`, mockViolations);

        mockFetch?.pause?.();

        // When: The merge request is executed, which should handle violation updates
        // - Optimistically remove DUPLICATED_TRANSACTION violations since transactions are being merged
        // - Keep other violations like MISSING_CATEGORY intact
        mergeTransactionRequest({
            mergeTransactionID,
            mergeTransaction,
            targetTransaction,
            sourceTransaction,
            targetTransactionThreadReport: {reportID: 'target123'},
            targetTransactionThreadParentReport: undefined,
            targetTransactionThreadParentReportNextStep: undefined,
            allTransactionViolations: createAllTransactionViolations(targetTransaction.transactionID, sourceTransaction.transactionID, mockViolations, mockViolations),
            policy: undefined,
            policyTags: undefined,
            policyCategories: undefined,
            currentUserAccountIDParam: 123,
            currentUserEmailParam: 'existing@example.com',
            isASAPSubmitBetaEnabled: false,
        });

        await mockFetch?.resume?.();
        await waitForBatchedUpdates();

        // Then: Verify that violations are updated correctly during optimistic phase
        // - DUPLICATED_TRANSACTION violations should be filtered out
        // - Other violations should remain unchanged
        const updatedTargetViolations = await new Promise<TransactionViolation[] | null>((resolve) => {
            const connection = Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${targetTransaction.transactionID}`,
                callback: (violations) => {
                    Onyx.disconnect(connection);
                    resolve(violations ?? null);
                },
            });
        });

        // Should only contain non-duplicate violations
        expect(updatedTargetViolations).toEqual([
            expect.objectContaining({
                name: CONST.VIOLATIONS.MISSING_CATEGORY,
            }),
        ]);

        // Should not contain duplicate transaction violations
        expect(updatedTargetViolations?.some((v) => v.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)).toBeFalsy();
    });

    describe('Report deletion logic', () => {
        it('should NOT delete source report optimistically when it contains multiple transactions', async () => {
            // Given: A source transaction that is one of multiple transactions in its report
            const sourceReport = {
                ...createExpenseReport(1),
                reportID: 'source-report-123',
            };
            const targetTransaction = {
                ...createRandomTransaction(1),
                transactionID: 'target123',
                reportID: 'target-report-456',
            };
            const sourceTransaction = {
                ...createRandomTransaction(2),
                transactionID: 'source456',
                reportID: sourceReport.reportID,
            };
            const otherTransaction = {
                ...createRandomTransaction(3),
                transactionID: 'other789',
                reportID: sourceReport.reportID,
            };
            const mergeTransaction = {
                ...createRandomMergeTransaction(1),
                targetTransactionID: 'target123',
                sourceTransactionID: 'source456',
            };
            const mergeTransactionID = 'merge789';

            // Sample violations for testing
            const targetViolations: TransactionViolation[] = [
                {
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                    name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION,
                    showInReview: true,
                },
                {
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                    name: CONST.VIOLATIONS.MISSING_COMMENT,
                    showInReview: true,
                },
            ];
            const sourceViolations: TransactionViolation[] = [
                {
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                    name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION,
                    showInReview: true,
                },
                {
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                    name: CONST.VIOLATIONS.RECEIPT_REQUIRED,
                    showInReview: true,
                },
            ];

            // Set up initial state
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${targetTransaction.transactionID}`, targetTransaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${sourceTransaction.transactionID}`, sourceTransaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${otherTransaction.transactionID}`, otherTransaction);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${sourceReport.reportID}`, sourceReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${mergeTransactionID}`, mergeTransaction);

            mockFetch?.pause?.();

            // When: The merge request is executed
            mergeTransactionRequest({
                mergeTransactionID,
                mergeTransaction,
                targetTransaction,
                sourceTransaction,
                targetTransactionThreadReport: {reportID: 'target-report-456'},
                targetTransactionThreadParentReport: undefined,
                targetTransactionThreadParentReportNextStep: undefined,
                allTransactionViolations: createAllTransactionViolations(targetTransaction.transactionID, sourceTransaction.transactionID, targetViolations, sourceViolations),
                policy: undefined,
                policyTags: undefined,
                policyCategories: undefined,
                currentUserAccountIDParam: 123,
                currentUserEmailParam: 'existing@example.com',
                isASAPSubmitBetaEnabled: false,
            });

            await mockFetch?.resume?.();
            await waitForBatchedUpdates();

            // Then: The source report should NOT be deleted (should still exist)
            const updatedSourceReport = await new Promise<Report | null>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${sourceReport.reportID}`,
                    callback: (report) => {
                        Onyx.disconnect(connection);
                        resolve(report ?? null);
                    },
                });
            });

            expect(updatedSourceReport).toEqual(sourceReport);
            expect(updatedSourceReport?.reportID).toBe(sourceReport.reportID);
        });
    });
});

describe('setupMergeTransactionData', () => {
    beforeEach(() => {
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    it('should set merge transaction data with initial values', async () => {
        // Given a transaction ID
        const transactionID = 'test-transaction-123';

        // When we setup merge transaction data
        setupMergeTransactionData(transactionID, {targetTransactionID: transactionID});
        await waitForBatchedUpdates();

        // Then merge transaction should be created with the target transaction ID
        const mergeTransaction = await new Promise<MergeTransactionType | null>((resolve) => {
            const connection = Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${transactionID}`,
                callback: (transaction) => {
                    Onyx.disconnect(connection);
                    resolve(transaction ?? null);
                },
            });
        });

        expect(mergeTransaction).toEqual({
            targetTransactionID: transactionID,
        });
    });
});

describe('setMergeTransactionKey', () => {
    beforeEach(() => {
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    it('should merge values into existing merge transaction data', async () => {
        // Given an existing merge transaction
        const transactionID = 'test-transaction-789';
        const existingMergeTransaction = {
            targetTransactionID: transactionID,
            merchant: 'Original Merchant',
            amount: 1000,
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${transactionID}`, existingMergeTransaction);

        // When we set new merge transaction values
        const newValues = {
            merchant: 'Updated Merchant',
            category: 'New Category',
            description: 'New Description',
        };

        setMergeTransactionKey(transactionID, newValues);
        await waitForBatchedUpdates();

        // Then it should merge the new values with existing data
        const mergeTransaction = await new Promise<MergeTransactionType | null>((resolve) => {
            const connection = Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.MERGE_TRANSACTION}${transactionID}`,
                callback: (transaction) => {
                    Onyx.disconnect(connection);
                    resolve(transaction ?? null);
                },
            });
        });

        expect(mergeTransaction).toEqual({
            targetTransactionID: transactionID,
            merchant: 'Updated Merchant', // Updated
            amount: 1000, // Preserved
            category: 'New Category', // Added
            description: 'New Description', // Added
        });
    });
});

describe('areTransactionsEligibleForMerge', () => {
    describe('Card Transaction Rules', () => {
        it('should return false when both transactions are card transactions', () => {
            // Given two card transactions
            const cardTransaction1 = {
                ...createRandomTransaction(0),
                managedCard: true,
                amount: 1000,
            };
            const cardTransaction2 = {
                ...createRandomTransaction(1),
                managedCard: true,
                amount: 2000,
            };

            // When we check if they are eligible for merge
            const result = areTransactionsEligibleForMerge(cardTransaction1, cardTransaction2);

            // Then it should return false because both are card transactions
            expect(result).toBe(false);
        });

        it('should return true when one is card and one is cash transaction', () => {
            // Given one card transaction and one cash transaction
            const cardTransaction = {
                ...createRandomTransaction(0),
                managedCard: true,
                amount: 1000,
            };
            const cashTransaction = {
                ...createRandomTransaction(1),
                managedCard: false,
                cardName: CONST.EXPENSE.TYPE.CASH_CARD_NAME,
                amount: 2000,
            };

            // When we check if they are eligible for merge
            const result = areTransactionsEligibleForMerge(cardTransaction, cashTransaction);

            // Then it should return true because one is card and one is cash
            expect(result).toBe(true);
        });
    });

    describe('Zero Amount Rules', () => {
        it('should return false when both transactions have $0 amount', () => {
            // Given two transactions with $0 amount
            const zeroTransaction1 = {
                ...createRandomTransaction(0),
                amount: 0,
                managedCard: false,
                cardName: CONST.EXPENSE.TYPE.CASH_CARD_NAME,
            };
            const zeroTransaction2 = {
                ...createRandomTransaction(1),
                amount: 0,
                managedCard: false,
                cardName: CONST.EXPENSE.TYPE.CASH_CARD_NAME,
            };

            // When we check if they are eligible for merge
            const result = areTransactionsEligibleForMerge(zeroTransaction1, zeroTransaction2);

            // Then it should return false because both have $0 amount
            expect(result).toBe(false);
        });

        it('should return true when only one transaction has $0 amount', () => {
            // Given one transaction with $0 amount and one with non-zero amount
            const zeroTransaction = {
                ...createRandomTransaction(0),
                amount: 0,
                currency: CONST.CURRENCY.USD,
                managedCard: false,
                cardName: CONST.EXPENSE.TYPE.CASH_CARD_NAME,
            };
            const nonZeroTransaction = {
                ...createRandomTransaction(1),
                amount: -1000, // Negative amount as stored in database
                currency: CONST.CURRENCY.USD,
                managedCard: false,
                cardName: CONST.EXPENSE.TYPE.CASH_CARD_NAME,
            };

            // When we check if they are eligible for merge
            const result = areTransactionsEligibleForMerge(zeroTransaction, nonZeroTransaction);

            // Then it should return true because only one has $0 amount
            expect(result).toBe(true);
        });
    });

    describe('Distance Request Rules', () => {
        it('should return false when one is distance request and other is not', () => {
            // Given one distance request and one regular transaction
            const distanceTransaction = createRandomDistanceRequestTransaction(0);
            const regularTransaction = createRandomTransaction(1);

            // When we check if they are eligible for merge
            const result = areTransactionsEligibleForMerge(distanceTransaction, regularTransaction);

            // Then it should return false because one is distance request and other is not
            expect(result).toBe(false);
        });

        it('should return true when both are distance requests with valid amounts', () => {
            // Given two distance request transactions with non-zero amounts
            const distanceTransaction1 = {
                ...createRandomDistanceRequestTransaction(0),
                amount: 1000,
                managedCard: false,
                cardName: CONST.EXPENSE.TYPE.CASH_CARD_NAME,
            };
            const distanceTransaction2 = {
                ...createRandomDistanceRequestTransaction(1),
                amount: 2000,
                managedCard: false,
                cardName: CONST.EXPENSE.TYPE.CASH_CARD_NAME,
            };

            // When we check if they are eligible for merge
            const result = areTransactionsEligibleForMerge(distanceTransaction1, distanceTransaction2);

            // Then it should return true because both are distance requests
            expect(result).toBe(true);
        });
    });

    describe('Valid Merge Cases', () => {
        it('should return true when both are cash transactions with non-zero amounts', () => {
            // Given two cash transactions with non-zero amounts
            const cashTransaction1 = {
                ...createRandomTransaction(0),
                managedCard: false,
                cardName: CONST.EXPENSE.TYPE.CASH_CARD_NAME,
                amount: 1000,
            };
            const cashTransaction2 = {
                ...createRandomTransaction(1),
                cardName: CONST.EXPENSE.TYPE.CASH_CARD_NAME,
                managedCard: false,
                amount: 2000,
            };

            // When we check if they are eligible for merge
            const result = areTransactionsEligibleForMerge(cashTransaction1, cashTransaction2);

            // Then it should return true because both are cash transactions with non-zero amounts
            expect(result).toBe(true);
        });
    });

    describe('Split Expense Rules', () => {
        it('can not merge 2 split expenses', () => {
            const splitExpenseTransaction1 = {
                ...createRandomTransaction(1),
                reportID: CONST.REPORT.SPLIT_REPORT_ID,
                managedCard: false,
                cardName: CONST.EXPENSE.TYPE.CASH_CARD_NAME,
                comment: {
                    ...createRandomTransaction(1).comment,
                    originalTransactionID: 'original-1',
                    source: CONST.IOU.TYPE.SPLIT,
                },
            } as Transaction;
            const splitExpenseTransaction2 = {
                ...createRandomTransaction(2),
                reportID: CONST.REPORT.SPLIT_REPORT_ID,
                managedCard: false,
                cardName: CONST.EXPENSE.TYPE.CASH_CARD_NAME,
                comment: {
                    ...createRandomTransaction(2).comment,
                    originalTransactionID: 'original-2',
                    source: CONST.IOU.TYPE.SPLIT,
                },
            } as Transaction;

            const result = areTransactionsEligibleForMerge(splitExpenseTransaction1, splitExpenseTransaction2);
            expect(result).toBe(false);
        });

        it('can merge split expense with cash transaction', () => {
            const splitExpenseTransaction = {
                ...createRandomTransaction(1),
                amount: 1000,
                cardName: CONST.EXPENSE.TYPE.CASH_CARD_NAME,
                managedCard: false,
                comment: {
                    ...createRandomTransaction(1).comment,
                    originalTransactionID: 'original-split-transaction',
                    source: CONST.IOU.TYPE.SPLIT,
                },
                reportID: 'expense-report-123',
            } as Transaction;
            const cashTransaction = {
                ...createRandomTransaction(2),
                amount: 1500,
                cardName: CONST.EXPENSE.TYPE.CASH_CARD_NAME,
                managedCard: false,
                reportID: 'expense-report-456',
            } as Transaction;

            const result = areTransactionsEligibleForMerge(splitExpenseTransaction, cashTransaction);
            expect(result).toBe(true);
        });

        it('can merge split expense with card transaction', () => {
            const splitExpenseTransaction = {
                ...createRandomTransaction(1),
                amount: 1000,
                cardName: CONST.EXPENSE.TYPE.CASH_CARD_NAME,
                managedCard: false,
                comment: {
                    ...createRandomTransaction(1).comment,
                    originalTransactionID: 'original-split-transaction',
                    source: CONST.IOU.TYPE.SPLIT,
                },
            } as Transaction;
            const cardTransaction = {
                ...createRandomTransaction(2),
                amount: 2000,
                managedCard: true,
            } as Transaction;

            const result = areTransactionsEligibleForMerge(splitExpenseTransaction, cardTransaction);
            expect(result).toBe(true);
        });
    });
});
