import {getReimbursableSplitDiff} from '@libs/actions/IOU/SplitTransactionUpdate';
import type {SplitTransactionSplitsParam} from '@libs/API/parameters';

import type {Transaction} from '@src/types/onyx';

import createRandomTransaction from '../../utils/collections/transaction';

let transactionIndex = 0;

function buildSplit(amount: number, reimbursable?: boolean): SplitTransactionSplitsParam[number] {
    return {transactionID: `split-${amount}-${String(reimbursable)}`, amount, created: '2026-01-01', reimbursable};
}

function buildChildTransaction(amount: number, reimbursable?: boolean): Transaction {
    transactionIndex += 1;
    return {...createRandomTransaction(transactionIndex), amount, reimbursable};
}

describe('getReimbursableSplitDiff', () => {
    describe('creation of splits', () => {
        it('excludes the non-reimbursable portion when a reimbursable expense is split into reimbursable + non-reimbursable parts', () => {
            // Given a $100 reimbursable expense split into $60 reimbursable + $40 non-reimbursable
            const diff = getReimbursableSplitDiff({
                splits: [buildSplit(6000, true), buildSplit(4000, false)],
                originalTransaction: buildChildTransaction(-10000, true),
                originalChildTransactions: [],
                splitExpensesTotal: 10000,
                isCreationOfSplits: true,
            });

            // Then Your spend should drop by the $40 that became non-reimbursable
            expect(diff).toBe(-4000);
        });

        it('nets to 0 when the whole reimbursable expense stays reimbursable', () => {
            const diff = getReimbursableSplitDiff({
                splits: [buildSplit(6000, true), buildSplit(4000, true)],
                originalTransaction: buildChildTransaction(-10000, true),
                originalChildTransactions: [],
                splitExpensesTotal: 10000,
                isCreationOfSplits: true,
            });

            expect(diff).toBe(0);
        });

        it('treats a split with an undefined reimbursable flag as reimbursable', () => {
            const diff = getReimbursableSplitDiff({
                splits: [buildSplit(6000), buildSplit(4000, false)],
                originalTransaction: buildChildTransaction(-10000, true),
                originalChildTransactions: [],
                splitExpensesTotal: 10000,
                isCreationOfSplits: true,
            });

            expect(diff).toBe(-4000);
        });

        it('adds only the reimbursable portion when the original expense was non-reimbursable', () => {
            const diff = getReimbursableSplitDiff({
                splits: [buildSplit(6000, true), buildSplit(4000, false)],
                originalTransaction: buildChildTransaction(-10000, false),
                originalChildTransactions: [],
                splitExpensesTotal: 10000,
                isCreationOfSplits: true,
            });

            expect(diff).toBe(6000);
        });
    });

    describe('editing existing splits', () => {
        it('compares reimbursable totals using existing child transactions (magnitude)', () => {
            // Given two reimbursable $50 children, re-split so one becomes non-reimbursable
            const diff = getReimbursableSplitDiff({
                splits: [buildSplit(5000, true), buildSplit(5000, false)],
                originalTransaction: buildChildTransaction(-10000, true),
                originalChildTransactions: [buildChildTransaction(-5000, true), buildChildTransaction(-5000, true)],
                splitExpensesTotal: 10000,
                isCreationOfSplits: false,
            });

            // Then Your spend should drop by the $50 that became non-reimbursable
            expect(diff).toBe(-5000);
        });

        it('nets to 0 when reimbursable totals are unchanged', () => {
            const diff = getReimbursableSplitDiff({
                splits: [buildSplit(6000, true), buildSplit(4000, false)],
                originalTransaction: buildChildTransaction(-10000, true),
                originalChildTransactions: [buildChildTransaction(-6000, true), buildChildTransaction(-4000, false)],
                splitExpensesTotal: 10000,
                isCreationOfSplits: false,
            });

            expect(diff).toBe(0);
        });
    });
});
