import {renderHook, waitFor} from '@testing-library/react-native';

import useHasMultipleSplitChildren from '@hooks/useHasMultipleSplitChildren';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import type {TransactionCollectionDataSet} from '@src/types/onyx/Transaction';

import Onyx from 'react-native-onyx';

import createRandomTransaction from '../../utils/collections/transaction';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const ORIGINAL_TRANSACTION_ID = 'original';

function buildSplitChild(index: number, overrides: Partial<Transaction> = {}): Transaction {
    const transaction = createRandomTransaction(index);
    return {
        ...transaction,
        transactionID: `child${index}`,
        reportID: `report${index}`,
        pendingAction: null,
        comment: {originalTransactionID: ORIGINAL_TRANSACTION_ID, source: CONST.IOU.TYPE.SPLIT},
        ...overrides,
    };
}

async function setTransactions(transactions: Transaction[]) {
    const collection: TransactionCollectionDataSet = {};
    for (const transaction of transactions) {
        collection[`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`] = transaction;
    }
    await Onyx.mergeCollection(ONYXKEYS.COLLECTION.TRANSACTION, collection);
    await waitForBatchedUpdates();
}

describe('useHasMultipleSplitChildren', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('returns true when the split still has two children', async () => {
        // Given a split with two active children on different reports
        await setTransactions([buildSplitChild(1), buildSplitChild(2)]);

        // When the hook checks the split
        const {result} = renderHook(() => useHasMultipleSplitChildren(ORIGINAL_TRANSACTION_ID));

        // Then the split indicator should be shown, because the split flow opens the existing splits
        await waitFor(() => expect(result.current).toBe(true));
    });

    it('returns false when only one child is left, even if its report was reopened', async () => {
        // Given the sibling was removed while the remaining child sat on an approved report, so the remaining child kept its split data
        await setTransactions([buildSplitChild(1)]);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}report1`, {reportID: 'report1', stateNum: CONST.REPORT.STATE_NUM.OPEN, statusNum: CONST.REPORT.STATUS_NUM.OPEN});

        // When the hook checks the split after the report is retracted back to open
        const {result} = renderHook(() => useHasMultipleSplitChildren(ORIGINAL_TRANSACTION_ID));
        await waitForBatchedUpdates();

        // Then the indicator should not be shown, because initSplitExpense would start a new split for a single child (issue #106633)
        expect(result.current).toBe(false);
    });

    it('counts an unreported child, like initSplitExpense does', async () => {
        // Given one child on a report and its sibling removed from the report
        await setTransactions([buildSplitChild(1), buildSplitChild(2, {reportID: CONST.REPORT.UNREPORTED_REPORT_ID})]);

        // When the hook checks the split
        const {result} = renderHook(() => useHasMultipleSplitChildren(ORIGINAL_TRANSACTION_ID));

        // Then the split is still treated as split, so the Amount label matches the Edit splits flow
        await waitFor(() => expect(result.current).toBe(true));
    });

    it('ignores a child that is pending delete', async () => {
        // Given two children where one is being deleted offline
        await setTransactions([buildSplitChild(1), buildSplitChild(2, {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE})]);

        // When the hook checks the split
        const {result} = renderHook(() => useHasMultipleSplitChildren(ORIGINAL_TRANSACTION_ID));
        await waitForBatchedUpdates();

        // Then only one child counts, so the split indicator is hidden
        expect(result.current).toBe(false);
    });

    it('returns false when there is no original transaction ID', async () => {
        // Given split children exist for some split
        await setTransactions([buildSplitChild(1), buildSplitChild(2)]);

        // When the hook is called for an expense that is not a split
        const {result} = renderHook(() => useHasMultipleSplitChildren(undefined));
        await waitForBatchedUpdates();

        // Then it should not report multiple splits
        expect(result.current).toBe(false);
    });
});
