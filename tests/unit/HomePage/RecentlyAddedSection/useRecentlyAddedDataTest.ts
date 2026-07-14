/**
 * Behavior asserted for the Recently added data hook:
 *   - sources expenses from the current user's server-backed Search snapshot (type:expense from:<accountID>),
 *     not the on-demand `transactions_` Onyx collection
 *   - returns the current user's expenses, most recent first
 *   - sorts strictly by the `inserted` (creation/insertion) timestamp, never by `created` (expense date);
 *   - caps the list at CONST.HOME.SECTION_VISIBLE_LIMIT (5) rows
 *   - includes expenses regardless of report status (no recency-window / draft-only filter)
 *   - defensively excludes expenses owned by another account when the snapshot carries the parent report
 */
import {renderHook} from '@testing-library/react-native';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';

import {useRecentlyAddedData} from '@pages/home/RecentlyAddedSection/useRecentlyAddedData';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction} from '@src/types/onyx';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';

const ACCOUNT_ID = 12345;
const OTHER_ACCOUNT_ID = 67890;
const SNAPSHOT_HASH = 1;

// Module mocks

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: jest.fn(() => ({accountID: ACCOUNT_ID, login: `${ACCOUNT_ID}@test.com`})),
}));

jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: () => ({isOffline: false}),
}));

jest.mock('@react-navigation/native', () => ({
    useIsFocused: () => true,
    createNavigationContainerRef: () => ({}),
}));

jest.mock('@libs/actions/Search', () => ({
    search: jest.fn(),
}));

// Deterministic query/hash so the hook reads a known snapshot key.
jest.mock('@libs/SearchQueryUtils', () => ({
    buildQueryStringFromFilterFormValues: jest.fn(() => `type:expense from:${ACCOUNT_ID}`),
    buildSearchQueryJSON: jest.fn(() => ({hash: SNAPSHOT_HASH})),
}));

// useOnyx mock — applies the provided selector to seeded Onyx data.

const onyxData: Record<string, unknown> = {};

const mockUseOnyx = jest.fn((key: string, options?: {selector?: (v: unknown) => unknown}) => {
    const value = onyxData[key];
    const selected = options?.selector ? options.selector(value) : value;
    return [selected];
});

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: string, options?: {selector?: (v: unknown) => unknown}) => mockUseOnyx(key, options),
}));

const mockedUseCurrentUserPersonalDetails = jest.mocked(useCurrentUserPersonalDetails);

// Helpers

function makeTransaction(overrides: Partial<Transaction> & {transactionID: string}): Transaction {
    return {
        reportID: 'report_owned',
        amount: 1000,
        currency: CONST.CURRENCY.USD,
        merchant: 'Merchant',
        created: '2026-06-01',
        ...overrides,
    } as Transaction;
}

function makeReport(reportID: string, ownerAccountID: number, overrides: Partial<Report> = {}): Report {
    return {
        reportID,
        ownerAccountID,
        ...overrides,
    } as Report;
}

/** Seeds the current user's expense snapshot with the given transactions and reports. */
function setupSnapshot(transactions: Transaction[], reports: Report[]) {
    const data: Record<string, unknown> = {};
    for (const report of reports) {
        data[`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`] = report;
    }
    for (const transaction of transactions) {
        data[`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`] = transaction;
    }
    onyxData[`${ONYXKEYS.COLLECTION.SNAPSHOT}${SNAPSHOT_HASH}`] = {data};
}

/** Seeds the local `transactions_` collection (mirrors what optimistic expense creation writes to Onyx). */
function setupLocalTransactions(transactions: Transaction[]) {
    const collection: Record<string, Transaction> = {};
    for (const transaction of transactions) {
        collection[`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`] = transaction;
    }
    onyxData[ONYXKEYS.COLLECTION.TRANSACTION] = collection;
}

function resultTransactionIDs(transactions: Transaction[]): string[] {
    return transactions.map((t) => t.transactionID);
}

beforeEach(() => {
    for (const k of Object.keys(onyxData)) {
        delete onyxData[k];
    }
    mockUseOnyx.mockClear();
    mockedUseCurrentUserPersonalDetails.mockReturnValue({accountID: ACCOUNT_ID, login: `${ACCOUNT_ID}@test.com`} as CurrentUserPersonalDetails);
    // Default: a single report owned by the current user that owned transactions can attach to.
    setupSnapshot([], [makeReport('report_owned', ACCOUNT_ID)]);
});

describe('useRecentlyAddedData — ordering', () => {
    it('returns the current user expenses sorted by inserted timestamp, most recent first', () => {
        setupSnapshot(
            [
                makeTransaction({transactionID: 't1', inserted: '2026-06-01 10:00:00'}),
                makeTransaction({transactionID: 't3', inserted: '2026-06-03 10:00:00'}),
                makeTransaction({transactionID: 't2', inserted: '2026-06-02 10:00:00'}),
            ],
            [makeReport('report_owned', ACCOUNT_ID)],
        );

        const {result} = renderHook(() => useRecentlyAddedData());

        expect(resultTransactionIDs(result.current.transactions)).toEqual(['t3', 't2', 't1']);
    });

    it('breaks ties between equal inserted timestamps deterministically by transactionID', () => {
        setupSnapshot(
            [
                makeTransaction({transactionID: 'aaa', created: '2026-06-01', inserted: '2026-06-05 10:00:00'}),
                makeTransaction({transactionID: 'ccc', created: '2026-06-09', inserted: '2026-06-05 10:00:00'}),
                makeTransaction({transactionID: 'bbb', created: '2026-06-05', inserted: '2026-06-05 10:00:00'}),
            ],
            [makeReport('report_owned', ACCOUNT_ID)],
        );

        const {result} = renderHook(() => useRecentlyAddedData());

        // Equal `inserted` timestamps tie-break on transactionID (descending) rather than the differing created dates,
        // giving a stable order that never silently reshuffles across renders.
        expect(resultTransactionIDs(result.current.transactions)).toEqual(['ccc', 'bbb', 'aaa']);
    });

    it('ranks an old-dated expense first when it was inserted most recently', () => {
        setupSnapshot(
            [
                makeTransaction({transactionID: 'oldDateRecentInsert', created: '2026-03-01', inserted: '2026-06-09 09:00:00'}),
                makeTransaction({transactionID: 'recentDateOldInsert', created: '2026-06-08', inserted: '2026-06-08 09:00:00'}),
            ],
            [makeReport('report_owned', ACCOUNT_ID)],
        );

        const {result} = renderHook(() => useRecentlyAddedData());

        expect(resultTransactionIDs(result.current.transactions)).toEqual(['oldDateRecentInsert', 'recentDateOldInsert']);
    });
});

describe('useRecentlyAddedData — row cap', () => {
    it('returns at most CONST.HOME.SECTION_VISIBLE_LIMIT rows', () => {
        const sevenTransactions = Array.from({length: 7}, (_, i) =>
            makeTransaction({
                transactionID: `t${i}`,
                inserted: `2026-06-${String(i + 1).padStart(2, '0')} 10:00:00`,
            }),
        );
        setupSnapshot(sevenTransactions, [makeReport('report_owned', ACCOUNT_ID)]);

        const {result} = renderHook(() => useRecentlyAddedData());

        expect(result.current.transactions).toHaveLength(CONST.HOME.SECTION_VISIBLE_LIMIT);
        // Keeps the five most recently inserted.
        expect(resultTransactionIDs(result.current.transactions)).toEqual(['t6', 't5', 't4', 't3', 't2']);
    });
});

describe('useRecentlyAddedData — current-user scope', () => {
    it('excludes expenses owned by another account when the snapshot carries the parent report', () => {
        setupSnapshot(
            [
                makeTransaction({transactionID: 'mine', reportID: 'report_owned', inserted: '2026-06-02 10:00:00'}),
                makeTransaction({transactionID: 'theirs', reportID: 'report_other', inserted: '2026-06-03 10:00:00'}),
            ],
            [makeReport('report_owned', ACCOUNT_ID), makeReport('report_other', OTHER_ACCOUNT_ID)],
        );

        const {result} = renderHook(() => useRecentlyAddedData());

        expect(resultTransactionIDs(result.current.transactions)).toEqual(['mine']);
    });
});

describe('useRecentlyAddedData — unreported expenses', () => {
    it('includes the current user unreported expenses even though they have no parent report', () => {
        setupSnapshot(
            [
                makeTransaction({transactionID: 'reported', reportID: 'report_owned', inserted: '2026-06-01 10:00:00'}),
                makeTransaction({transactionID: 'unreported', reportID: CONST.REPORT.UNREPORTED_REPORT_ID, inserted: '2026-06-02 10:00:00'}),
            ],
            [makeReport('report_owned', ACCOUNT_ID)],
        );

        const {result} = renderHook(() => useRecentlyAddedData());

        expect(resultTransactionIDs(result.current.transactions)).toEqual(['unreported', 'reported']);
    });
});

describe('useRecentlyAddedData — locally pending (offline-created) expenses', () => {
    it('surfaces a locally-pending expense that has not yet reached the snapshot', () => {
        setupSnapshot([makeTransaction({transactionID: 'synced', inserted: '2026-06-01 10:00:00'})], [makeReport('report_owned', ACCOUNT_ID)]);
        setupLocalTransactions([makeTransaction({transactionID: 'pending', inserted: '2026-06-02 10:00:00', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD})]);

        const {result} = renderHook(() => useRecentlyAddedData());

        // The pending expense is newer, so it ranks ahead of the synced one.
        expect(resultTransactionIDs(result.current.transactions)).toEqual(['pending', 'synced']);
    });

    it('exposes the pending action so the row can render the offline pending treatment', () => {
        setupSnapshot([], [makeReport('report_owned', ACCOUNT_ID)]);
        setupLocalTransactions([makeTransaction({transactionID: 'pending', inserted: '2026-06-02 10:00:00', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD})]);

        const {result} = renderHook(() => useRecentlyAddedData());

        expect(result.current.transactions.at(0)?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
    });

    it('does not duplicate an expense present in both the snapshot and the local collection', () => {
        setupSnapshot([makeTransaction({transactionID: 'shared', inserted: '2026-06-01 10:00:00'})], [makeReport('report_owned', ACCOUNT_ID)]);
        setupLocalTransactions([makeTransaction({transactionID: 'shared', inserted: '2026-06-01 10:00:00', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD})]);

        const {result} = renderHook(() => useRecentlyAddedData());

        expect(resultTransactionIDs(result.current.transactions)).toEqual(['shared']);
    });

    it('ignores local transactions that are not pending creation (on-demand data is not a source of expenses)', () => {
        setupSnapshot([makeTransaction({transactionID: 'synced', inserted: '2026-06-01 10:00:00'})], [makeReport('report_owned', ACCOUNT_ID)]);
        setupLocalTransactions([makeTransaction({transactionID: 'onDemand', inserted: '2026-06-09 10:00:00'})]);

        const {result} = renderHook(() => useRecentlyAddedData());

        expect(resultTransactionIDs(result.current.transactions)).toEqual(['synced']);
    });
});

describe('useRecentlyAddedData — split expenses', () => {
    it('drops the original expense once it is split, keeping only the resulting splits', () => {
        // Splitting reassigns the original transaction to the synthetic SPLIT_REPORT_ID and adds the split children
        // as new pending expenses. The snapshot still carries the (now reassigned) original.
        setupSnapshot(
            [
                makeTransaction({transactionID: 'splitParent', reportID: CONST.REPORT.SPLIT_REPORT_ID, inserted: '2026-06-01 10:00:00'}),
                makeTransaction({transactionID: 'unrelated', reportID: 'report_owned', inserted: '2026-06-02 10:00:00'}),
            ],
            [makeReport('report_owned', ACCOUNT_ID)],
        );
        setupLocalTransactions([
            makeTransaction({transactionID: 'splitParent', reportID: CONST.REPORT.SPLIT_REPORT_ID, inserted: '2026-06-01 10:00:00'}),
            makeTransaction({transactionID: 'splitChild1', reportID: 'report_owned', inserted: '2026-06-03 10:00:00', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}),
            makeTransaction({transactionID: 'splitChild2', reportID: 'report_owned', inserted: '2026-06-04 10:00:00', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}),
        ]);

        const {result} = renderHook(() => useRecentlyAddedData());

        expect(resultTransactionIDs(result.current.transactions)).toEqual(['splitChild2', 'splitChild1', 'unrelated']);
    });

    it('drops the split-parent when only its local copy has been reassigned (snapshot not yet refreshed)', () => {
        // Offline split: the snapshot still holds the original reportID, but the local copy is already reassigned.
        setupSnapshot([makeTransaction({transactionID: 'splitParent', reportID: 'report_owned', inserted: '2026-06-01 10:00:00'})], [makeReport('report_owned', ACCOUNT_ID)]);
        setupLocalTransactions([makeTransaction({transactionID: 'splitParent', reportID: CONST.REPORT.SPLIT_REPORT_ID, inserted: '2026-06-01 10:00:00'})]);

        const {result} = renderHook(() => useRecentlyAddedData());

        expect(resultTransactionIDs(result.current.transactions)).toEqual([]);
    });
});

describe('useRecentlyAddedData — offline-edited expenses', () => {
    it('surfaces the pending action for an expense edited offline, derived from its local pendingFields', () => {
        // The snapshot keeps the stale, pre-edit copy; the offline edit lives only on the local `transactions_` copy.
        setupSnapshot([makeTransaction({transactionID: 'edited', amount: 1000, merchant: 'Old Merchant', inserted: '2026-06-01 10:00:00'})], [makeReport('report_owned', ACCOUNT_ID)]);
        setupLocalTransactions([
            makeTransaction({
                transactionID: 'edited',
                amount: 2500,
                merchant: 'New Merchant',
                inserted: '2026-06-01 10:00:00',
                pendingFields: {amount: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE, merchant: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
            }),
        ]);

        const {result} = renderHook(() => useRecentlyAddedData());

        // A single row (no duplicate), reflecting the optimistic edit and flagged as a pending UPDATE.
        expect(resultTransactionIDs(result.current.transactions)).toEqual(['edited']);
        expect(result.current.transactions.at(0)?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
        expect(result.current.transactions.at(0)?.amount).toBe(2500);
        expect(result.current.transactions.at(0)?.merchant).toBe('New Merchant');
    });

    it('leaves a fully-synced expense without a pending action', () => {
        setupSnapshot([makeTransaction({transactionID: 'synced', inserted: '2026-06-01 10:00:00'})], [makeReport('report_owned', ACCOUNT_ID)]);

        const {result} = renderHook(() => useRecentlyAddedData());

        expect(result.current.transactions.at(0)?.pendingAction).toBeNull();
    });
});

describe('useRecentlyAddedData — amount sign', () => {
    it('preserves the negative sign for self-DM credits/refunds', () => {
        setupSnapshot(
            [makeTransaction({transactionID: 'selfDMCredit', reportID: 'selfDM', amount: 1000, inserted: '2026-06-01 10:00:00'})],
            [makeReport('selfDM', ACCOUNT_ID, {type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.SELF_DM})],
        );

        const {result} = renderHook(() => useRecentlyAddedData());

        expect(result.current.transactions.at(0)?.amount).toBe(-1000);
    });

    it('preserves the negative sign for unreported (tracked) credits/refunds', () => {
        setupSnapshot([makeTransaction({transactionID: 'trackedCredit', reportID: CONST.REPORT.UNREPORTED_REPORT_ID, amount: 1000, inserted: '2026-06-01 10:00:00'})], []);

        const {result} = renderHook(() => useRecentlyAddedData());

        expect(result.current.transactions.at(0)?.amount).toBe(-1000);
    });

    it('negates the inverted sign of expense-report transactions', () => {
        setupSnapshot(
            [makeTransaction({transactionID: 'expense', reportID: 'report_owned', amount: 1000, inserted: '2026-06-01 10:00:00'})],
            [makeReport('report_owned', ACCOUNT_ID, {type: CONST.REPORT.TYPE.EXPENSE})],
        );

        const {result} = renderHook(() => useRecentlyAddedData());

        expect(result.current.transactions.at(0)?.amount).toBe(-1000);
    });

    it('returns the absolute amount for non self-DM, non expense-report transactions', () => {
        setupSnapshot(
            [makeTransaction({transactionID: 'iou', reportID: 'report_iou', amount: -1000, inserted: '2026-06-01 10:00:00'})],
            [makeReport('report_iou', ACCOUNT_ID, {type: CONST.REPORT.TYPE.IOU})],
        );

        const {result} = renderHook(() => useRecentlyAddedData());

        expect(result.current.transactions.at(0)?.amount).toBe(1000);
    });
});

describe('useRecentlyAddedData — empty snapshot', () => {
    it('returns no expenses when the snapshot has not loaded yet', () => {
        delete onyxData[`${ONYXKEYS.COLLECTION.SNAPSHOT}${SNAPSHOT_HASH}`];

        const {result} = renderHook(() => useRecentlyAddedData());

        expect(result.current.transactions).toEqual([]);
    });
});

describe('useRecentlyAddedData — status agnostic', () => {
    it('includes the current user expenses regardless of their report status', () => {
        setupSnapshot(
            [
                makeTransaction({transactionID: 'open', reportID: 'report_open', inserted: '2026-06-01 10:00:00'}),
                makeTransaction({transactionID: 'submitted', reportID: 'report_submitted', inserted: '2026-06-02 10:00:00'}),
                makeTransaction({transactionID: 'approved', reportID: 'report_approved', inserted: '2026-06-03 10:00:00'}),
                makeTransaction({transactionID: 'reimbursed', reportID: 'report_reimbursed', inserted: '2026-06-04 10:00:00'}),
            ],
            [
                makeReport('report_open', ACCOUNT_ID, {statusNum: CONST.REPORT.STATUS_NUM.OPEN, stateNum: CONST.REPORT.STATE_NUM.OPEN}),
                makeReport('report_submitted', ACCOUNT_ID, {statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED, stateNum: CONST.REPORT.STATE_NUM.SUBMITTED}),
                makeReport('report_approved', ACCOUNT_ID, {statusNum: CONST.REPORT.STATUS_NUM.APPROVED, stateNum: CONST.REPORT.STATE_NUM.APPROVED}),
                makeReport('report_reimbursed', ACCOUNT_ID, {statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED, stateNum: CONST.REPORT.STATE_NUM.APPROVED}),
            ],
        );

        const {result} = renderHook(() => useRecentlyAddedData());

        expect(resultTransactionIDs(result.current.transactions)).toEqual(['reimbursed', 'approved', 'submitted', 'open']);
    });
});
