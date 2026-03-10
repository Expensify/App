import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import {addSplitExpenseField, evenlyDistributeSplitExpenseAmounts, removeSplitExpenseField, updateSplitExpenseAmountField} from '@libs/actions/IOU/Split';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import type {SplitExpense} from '@src/types/onyx/IOU';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

/**
 * Tests for the split expense auto-adjustment feature.
 * When splitting an expense:
 * - Unedited splits auto-adjust to sum to 100%/total amount
 * - Manually edited splits are "locked" and preserved
 * - Adding a new split redistributes among unedited splits
 */
describe('Split Expense Auto-Adjustment', () => {
    const ORIGINAL_TRANSACTION_ID = 'originalTx123';
    const REPORT_ID = 'report123';
    const CURRENCY = 'USD';
    const TOTAL_AMOUNT = 1000; // $10.00 in cents

    // Helper to create a mock draft transaction
    const createMockDraftTransaction = (splitExpenses: SplitExpense[], amount = TOTAL_AMOUNT): Transaction =>
        ({
            transactionID: ORIGINAL_TRANSACTION_ID,
            reportID: REPORT_ID,
            amount,
            currency: CURRENCY,
            comment: {
                originalTransactionID: ORIGINAL_TRANSACTION_ID,
                splitExpenses,
            },
        }) as unknown as Transaction;

    // Helper to create a split expense
    const createSplitExpense = (transactionID: string, amount: number, isManuallyEdited = false): SplitExpense => ({
        transactionID,
        amount,
        created: '2024-01-01',
        isManuallyEdited,
    });

    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('addSplitExpenseField', () => {
        it('should redistribute evenly when adding a split to 2 unedited splits', async () => {
            // Setup: 2 splits at $5/$5 (50/50)
            const initialSplits = [createSplitExpense('split1', 500, false), createSplitExpense('split2', 500, false)];

            const mockTransaction = createMockDraftTransaction(initialSplits);

            await Onyx.set(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${ORIGINAL_TRANSACTION_ID}`, mockTransaction);
            await waitForBatchedUpdates();

            // Action: Add a third split
            addSplitExpenseField(mockTransaction, mockTransaction, undefined);
            await waitForBatchedUpdates();

            // Verify: Should be 3 splits at ~$3.33/$3.33/$3.34 (33/33/34%)
            const draftTransaction = await new Promise<OnyxEntry<Transaction>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${ORIGINAL_TRANSACTION_ID}`,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });

            const splitExpenses = draftTransaction?.comment?.splitExpenses ?? [];
            expect(splitExpenses.length).toBe(3);

            // Total should equal original amount
            const totalAmount = splitExpenses.reduce((sum, split) => sum + split.amount, 0);
            expect(totalAmount).toBe(TOTAL_AMOUNT);

            // All splits should be unedited
            expect(splitExpenses.every((split) => !split.isManuallyEdited)).toBe(true);
        });

        it('should preserve edited splits when adding a new split', async () => {
            // Setup: 2 splits - one edited at $3, one unedited at $7
            const initialSplits = [
                createSplitExpense('split1', 300, true), // Edited/locked
                createSplitExpense('split2', 700, false), // Unedited
            ];

            const mockTransaction = createMockDraftTransaction(initialSplits);

            await Onyx.set(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${ORIGINAL_TRANSACTION_ID}`, mockTransaction);
            await waitForBatchedUpdates();

            // Action: Add a new split
            addSplitExpenseField(mockTransaction, mockTransaction, undefined);
            await waitForBatchedUpdates();

            // Verify: 3 splits
            // Split 1: locked at 300
            // New split + Split 2: share remaining 700 -> 350 each
            const draftTransaction = await new Promise<OnyxEntry<Transaction>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${ORIGINAL_TRANSACTION_ID}`,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });

            const splitExpenses = draftTransaction?.comment?.splitExpenses ?? [];
            expect(splitExpenses.length).toBe(3);

            // Verify split 1 is still 300 and marked as edited
            const split1 = splitExpenses.find((s) => s.transactionID === 'split1');
            expect(split1?.amount).toBe(300);
            expect(split1?.isManuallyEdited).toBe(true);

            // Verify total matches
            const totalAmount = splitExpenses.reduce((sum, split) => sum + split.amount, 0);
            expect(totalAmount).toBe(TOTAL_AMOUNT);
        });
    });

    describe('removeSplitExpenseField', () => {
        it('should redistribute evenly when removing a split from 3 unedited splits', async () => {
            // Setup: 3 splits at ~$3.33/$3.33/$3.34
            const initialSplits = [createSplitExpense('split1', 333, false), createSplitExpense('split2', 333, false), createSplitExpense('split3', 334, false)];

            const mockTransaction = createMockDraftTransaction(initialSplits);

            await Onyx.set(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${ORIGINAL_TRANSACTION_ID}`, mockTransaction);
            await waitForBatchedUpdates();

            // Action: Remove split 3
            removeSplitExpenseField(mockTransaction, 'split3');
            await waitForBatchedUpdates();

            // Verify: Should be 2 splits at $5/$5 (50/50)
            const draftTransaction = await new Promise<OnyxEntry<Transaction>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${ORIGINAL_TRANSACTION_ID}`,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });

            const splitExpenses = draftTransaction?.comment?.splitExpenses ?? [];
            expect(splitExpenses.length).toBe(2);
            expect(splitExpenses.find((s) => s.transactionID === 'split3')).toBeUndefined();

            // Each remaining split should be 500
            expect(splitExpenses.every((s) => s.amount === 500)).toBe(true);

            // Total should equal original amount
            const totalAmount = splitExpenses.reduce((sum, split) => sum + split.amount, 0);
            expect(totalAmount).toBe(TOTAL_AMOUNT);
        });

        it('should preserve edited splits and redistribute remaining to unedited when removing', async () => {
            // Setup: 3 splits:
            // split1: 300 (edited/locked)
            // split2: 350 (unedited)
            // split3: 350 (unedited)
            // Total: 1000
            const initialSplits = [createSplitExpense('split1', 300, true), createSplitExpense('split2', 350, false), createSplitExpense('split3', 350, false)];

            const mockTransaction = createMockDraftTransaction(initialSplits);

            await Onyx.set(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${ORIGINAL_TRANSACTION_ID}`, mockTransaction);
            await waitForBatchedUpdates();

            // Action: Remove split 3
            removeSplitExpenseField(mockTransaction, 'split3');
            await waitForBatchedUpdates();

            // Verify: 2 splits
            // split1 preserved at 300
            // split2 takes remaining 700 (1000 - 300)
            const draftTransaction = await new Promise<OnyxEntry<Transaction>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${ORIGINAL_TRANSACTION_ID}`,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });

            const splitExpenses = draftTransaction?.comment?.splitExpenses ?? [];
            expect(splitExpenses.length).toBe(2);

            const split1 = splitExpenses.find((s) => s.transactionID === 'split1');
            const split2 = splitExpenses.find((s) => s.transactionID === 'split2');

            expect(split1?.amount).toBe(300);
            expect(split1?.isManuallyEdited).toBe(true);

            expect(split2?.amount).toBe(700);
            expect(split2?.isManuallyEdited).toBe(false);

            const totalAmount = splitExpenses.reduce((sum, split) => sum + split.amount, 0);
            expect(totalAmount).toBe(TOTAL_AMOUNT);
        });

        it('should handle removing a manually edited split', async () => {
            // Setup: 3 splits:
            // split1: 300 (edited/locked)
            // split2: 350 (unedited)
            // split3: 350 (unedited)
            const initialSplits = [createSplitExpense('split1', 300, true), createSplitExpense('split2', 350, false), createSplitExpense('split3', 350, false)];

            const mockTransaction = createMockDraftTransaction(initialSplits);

            await Onyx.set(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${ORIGINAL_TRANSACTION_ID}`, mockTransaction);
            await waitForBatchedUpdates();

            // Action: Remove split 1 (the edited one)
            removeSplitExpenseField(mockTransaction, 'split1');
            await waitForBatchedUpdates();

            // Verify: 2 unedited splits remain
            // They should redistribute the full 1000 -> 500 each
            const draftTransaction = await new Promise<OnyxEntry<Transaction>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${ORIGINAL_TRANSACTION_ID}`,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });

            const splitExpenses = draftTransaction?.comment?.splitExpenses ?? [];
            expect(splitExpenses.length).toBe(2);
            expect(splitExpenses.find((s) => s.transactionID === 'split1')).toBeUndefined();

            expect(splitExpenses.every((s) => s.amount === 500)).toBe(true);

            const totalAmount = splitExpenses.reduce((sum, split) => sum + split.amount, 0);
            expect(totalAmount).toBe(TOTAL_AMOUNT);
        });
    });

    describe('updateSplitExpenseAmountField', () => {
        it('should mark edited split and redistribute remaining to unedited splits', async () => {
            // Setup: 3 unedited splits at $3.33/$3.33/$3.34
            const initialSplits = [createSplitExpense('split1', 333, false), createSplitExpense('split2', 333, false), createSplitExpense('split3', 334, false)];

            const mockTransaction = createMockDraftTransaction(initialSplits);

            await Onyx.set(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${ORIGINAL_TRANSACTION_ID}`, mockTransaction);
            await waitForBatchedUpdates();

            // Action: Edit split1 to $3.00
            updateSplitExpenseAmountField(mockTransaction, 'split1', 300);
            await waitForBatchedUpdates();

            // Verify
            const draftTransaction = await new Promise<OnyxEntry<Transaction>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${ORIGINAL_TRANSACTION_ID}`,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });

            const splitExpenses = draftTransaction?.comment?.splitExpenses ?? [];

            // Edited split should be locked at $3
            const editedSplit = splitExpenses.find((s) => s.transactionID === 'split1');
            expect(editedSplit?.amount).toBe(300);
            expect(editedSplit?.isManuallyEdited).toBe(true);

            // Remaining $7 should be split between 2 unedited splits
            const uneditedSplits = splitExpenses.filter((s) => !s.isManuallyEdited);
            expect(uneditedSplits.length).toBe(2);
            const uneditedTotal = uneditedSplits.reduce((sum, s) => sum + s.amount, 0);
            expect(uneditedTotal).toBe(700);

            // Total should equal original amount
            const totalAmount = splitExpenses.reduce((sum, split) => sum + split.amount, 0);
            expect(totalAmount).toBe(TOTAL_AMOUNT);
        });

        it('should not redistribute when all splits are manually edited', async () => {
            // Setup: 2 manually edited splits
            const initialSplits = [createSplitExpense('split1', 400, true), createSplitExpense('split2', 600, true)];

            const mockTransaction = createMockDraftTransaction(initialSplits);

            await Onyx.set(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${ORIGINAL_TRANSACTION_ID}`, mockTransaction);
            await waitForBatchedUpdates();

            // Action: Edit split1 to $5.00
            updateSplitExpenseAmountField(mockTransaction, 'split1', 500);
            await waitForBatchedUpdates();

            // Verify: split2 should remain unchanged
            const draftTransaction = await new Promise<OnyxEntry<Transaction>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${ORIGINAL_TRANSACTION_ID}`,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });

            const splitExpenses = draftTransaction?.comment?.splitExpenses ?? [];

            expect(splitExpenses.find((s) => s.transactionID === 'split1')?.amount).toBe(500);
            expect(splitExpenses.find((s) => s.transactionID === 'split2')?.amount).toBe(600);

            // Note: Total now exceeds original amount (user error case)
            const totalAmount = splitExpenses.reduce((sum, split) => sum + split.amount, 0);
            expect(totalAmount).toBe(1100);
        });

        it('should ignore NaN amount and preserve existing split values', async () => {
            // Setup: 2 unedited splits at $5/$5
            const initialSplits = [createSplitExpense('split1', 500, false), createSplitExpense('split2', 500, false)];

            const mockTransaction = createMockDraftTransaction(initialSplits);

            await Onyx.set(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${ORIGINAL_TRANSACTION_ID}`, mockTransaction);
            await waitForBatchedUpdates();

            // Action: Try to update with NaN amount (simulates user entering just "-")
            updateSplitExpenseAmountField(mockTransaction, 'split1', NaN);
            await waitForBatchedUpdates();

            // Verify: Splits should remain unchanged
            const draftTransaction = await new Promise<OnyxEntry<Transaction>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${ORIGINAL_TRANSACTION_ID}`,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });

            const splitExpenses = draftTransaction?.comment?.splitExpenses ?? [];
            expect(splitExpenses.find((s) => s.transactionID === 'split1')?.amount).toBe(500);
            expect(splitExpenses.find((s) => s.transactionID === 'split2')?.amount).toBe(500);

            // Total should still equal original amount
            const totalAmount = splitExpenses.reduce((sum, split) => sum + split.amount, 0);
            expect(totalAmount).toBe(TOTAL_AMOUNT);
        });
    });

    describe('evenlyDistributeSplitExpenseAmounts', () => {
        it('should reset isManuallyEdited and distribute evenly', async () => {
            // Setup: 3 splits with some manually edited
            const initialSplits = [createSplitExpense('split1', 300, true), createSplitExpense('split2', 400, true), createSplitExpense('split3', 300, false)];

            const mockTransaction = createMockDraftTransaction(initialSplits);

            await Onyx.set(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${ORIGINAL_TRANSACTION_ID}`, mockTransaction);
            await waitForBatchedUpdates();

            // Action: Make splits even
            evenlyDistributeSplitExpenseAmounts(mockTransaction);
            await waitForBatchedUpdates();

            // Verify
            const draftTransaction = await new Promise<OnyxEntry<Transaction>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${ORIGINAL_TRANSACTION_ID}`,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });

            const splitExpenses = draftTransaction?.comment?.splitExpenses ?? [];

            // All splits should now be unedited
            expect(splitExpenses.every((split) => !split.isManuallyEdited)).toBe(true);

            // Total should equal original amount
            const totalAmount = splitExpenses.reduce((sum, split) => sum + split.amount, 0);
            expect(totalAmount).toBe(TOTAL_AMOUNT);

            // Should be distributed as $3.33/$3.33/$3.34
            const amounts = splitExpenses.map((s) => s.amount).sort((a, b) => a - b);
            expect(amounts).toEqual([333, 333, 334]);
        });
    });
});
