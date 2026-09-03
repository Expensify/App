import {renderHook} from '@testing-library/react-native';

import useFrozenSplitTransactionIDs from '@hooks/useFrozenSplitTransactionIDs';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction} from '@src/types/onyx';
import type {SplitExpense} from '@src/types/onyx/IOU';

import type {OnyxCollection} from 'react-native-onyx';

import createRandomTransaction from '../../utils/collections/transaction';

function makeSplit(transactionID: string): SplitExpense {
    return {transactionID, amount: 100, created: '2024-01-01'};
}

function makeReportsCollection(reports: Array<[reportID: string, overrides: Partial<Report>]>): OnyxCollection<Report> {
    const collection: OnyxCollection<Report> = {};
    for (const [reportID, overrides] of reports) {
        collection[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] = {reportID, ...overrides};
    }
    return collection;
}

function makeTransactionsCollection(transactions: Array<[transactionID: string, reportID: string]>): OnyxCollection<Transaction> {
    const collection: OnyxCollection<Transaction> = {};
    for (const [transactionID, reportID] of transactions) {
        collection[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`] = {...createRandomTransaction(0), transactionID, reportID};
    }
    return collection;
}

describe('useFrozenSplitTransactionIDs', () => {
    it('returns an empty set when there are no splits', () => {
        const {result} = renderHook(() => useFrozenSplitTransactionIDs([], {}, {}, undefined));
        expect(result.current.size).toBe(0);
    });

    it('excludes a split whose own report is still open', () => {
        const split = makeSplit('tx1');
        const transactions = makeTransactionsCollection([['tx1', 'report1']]);
        const reports = makeReportsCollection([['report1', {stateNum: CONST.REPORT.STATE_NUM.OPEN, statusNum: CONST.REPORT.STATUS_NUM.OPEN}]]);

        const {result} = renderHook(() => useFrozenSplitTransactionIDs([split], transactions, reports, undefined));

        expect(result.current.has('tx1')).toBe(false);
    });

    it('includes a split whose own report is approved', () => {
        const split = makeSplit('tx1');
        const transactions = makeTransactionsCollection([['tx1', 'report1']]);
        const reports = makeReportsCollection([['report1', {stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.APPROVED}]]);

        const {result} = renderHook(() => useFrozenSplitTransactionIDs([split], transactions, reports, undefined));

        expect(result.current.has('tx1')).toBe(true);
    });

    it('includes a split whose own report is paid (reimbursed)', () => {
        const split = makeSplit('tx1');
        const transactions = makeTransactionsCollection([['tx1', 'report1']]);
        const reports = makeReportsCollection([['report1', {stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED}]]);

        const {result} = renderHook(() => useFrozenSplitTransactionIDs([split], transactions, reports, undefined));

        expect(result.current.has('tx1')).toBe(true);
    });

    it('includes a split whose own report is marked as done (closed)', () => {
        const split = makeSplit('tx1');
        const transactions = makeTransactionsCollection([['tx1', 'report1']]);
        const reports = makeReportsCollection([['report1', {stateNum: CONST.REPORT.STATE_NUM.SUBMITTED, statusNum: CONST.REPORT.STATUS_NUM.CLOSED}]]);

        const {result} = renderHook(() => useFrozenSplitTransactionIDs([split], transactions, reports, undefined));

        expect(result.current.has('tx1')).toBe(true);
    });

    it('falls back to the given report when the split transaction has no report of its own', () => {
        const split = makeSplit('tx1');
        const fallbackReport: Report = {reportID: 'fallback', stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.APPROVED};

        const {result} = renderHook(() => useFrozenSplitTransactionIDs([split], {}, {}, fallbackReport));

        expect(result.current.has('tx1')).toBe(true);
    });

    it('only marks the actually frozen splits among a mix of several', () => {
        const draftSplit = makeSplit('draft');
        const frozenSplit = makeSplit('frozen');
        const transactions = makeTransactionsCollection([
            ['draft', 'reportOpen'],
            ['frozen', 'reportApproved'],
        ]);
        const reports = makeReportsCollection([
            ['reportOpen', {stateNum: CONST.REPORT.STATE_NUM.OPEN, statusNum: CONST.REPORT.STATUS_NUM.OPEN}],
            ['reportApproved', {stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.APPROVED}],
        ]);

        const {result} = renderHook(() => useFrozenSplitTransactionIDs([draftSplit, frozenSplit], transactions, reports, undefined));

        expect(result.current.has('draft')).toBe(false);
        expect(result.current.has('frozen')).toBe(true);
        expect(result.current.size).toBe(1);
    });
});
