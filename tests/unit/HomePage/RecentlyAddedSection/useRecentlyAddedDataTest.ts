/**
 * Behavior asserted for the Recently added data hook:
 *   - sources expenses from the current user's server-backed Search snapshot (type:expense from:<accountID>),
 *     not the on-demand `transactions_` Onyx collection
 *   - returns the current user's expenses, most recent first
 *   - sorts strictly by the `inserted` (creation/insertion) timestamp, never by `created` (expense date);
 *   - caps the list at CONST.HOME.SECTION_VISIBLE_LIMIT (5) rows
 *   - includes expenses regardless of report status (no recency-window / draft-only filter)
 *   - defensively excludes expenses owned by another account when the snapshot carries the parent report
 *   - keeps a just-created expense visible after `pendingAction` clears but before the refreshed snapshot arrives,
 *     then shows the snapshot copy once it lands - without dropping or duplicating the row
 *   - keeps a deleted expense hidden after the delete succeeds but while the snapshot still lists it, and brings it
 *     back if the delete fails
 */
import {renderHook} from '@testing-library/react-native';

import type {SearchQueryJSON} from '@components/Search/types';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useNetwork from '@hooks/useNetwork';

import {buildQueryStringFromFilterFormValues, buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import type {RecentlyAddedExpense} from '@pages/home/RecentlyAddedSection/useRecentlyAddedData';
import {useRecentlyAddedData} from '@pages/home/RecentlyAddedSection/useRecentlyAddedData';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, SearchResults, Transaction} from '@src/types/onyx';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';

const ACCOUNT_ID = 12345;
const OTHER_ACCOUNT_ID = 67890;
const SNAPSHOT_HASH = 1;
/** A second hash, so a change of account resolves to a different snapshot key. */
const OTHER_SNAPSHOT_HASH = 2;
/** Onyx keys error entries by microsecond timestamp; the exact value is irrelevant, only that an entry exists. */
const ERROR_TIMESTAMP = '1787000000000000';
const LOADED: Partial<SearchResults['search']> = {state: CONST.SEARCH.SNAPSHOT_STATE.LOADED};

// Module mocks

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: jest.fn(() => ({accountID: ACCOUNT_ID, login: `${ACCOUNT_ID}@test.com`})),
}));

jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: jest.fn(() => ({isOffline: false})),
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

const mockedUseNetwork = jest.mocked(useNetwork);
const mockedBuildQueryStringFromFilterFormValues = jest.mocked(buildQueryStringFromFilterFormValues);
const mockedBuildSearchQueryJSON = jest.mocked(buildSearchQueryJSON);

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

/** Only `hash` is read by the hook, but the real parser returns a full query, so build one rather than assert a partial. */
function makeQueryJSON(hash: number): SearchQueryJSON {
    return {
        hash,
        recentSearchHash: hash,
        similarSearchHash: hash,
        inputQuery: `type:expense from:${ACCOUNT_ID}`,
        type: CONST.SEARCH.DATA_TYPES.EXPENSE,
        sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
        sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
        view: CONST.SEARCH.VIEW.TABLE,
        filters: {operator: CONST.SEARCH.SYNTAX_OPERATORS.AND, left: CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM, right: String(ACCOUNT_ID)},
        flatFilters: [],
    };
}

function makeReport(reportID: string, ownerAccountID: number, overrides: Partial<Report> = {}): Report {
    return {
        reportID,
        ownerAccountID,
        ...overrides,
    } as Report;
}

/** The `search` metadata and `data` last seeded, so `failSearch` can preserve them the way an Onyx merge would. */
let lastSeededSearchMeta: Partial<SearchResults['search']> = {};
let lastSeededSnapshotData: Record<string, unknown> | undefined;

/** Seeds the current user's expense snapshot with the given transactions and reports. */
function setupSnapshot(transactions: Transaction[], reports: Report[], searchMeta: Partial<SearchResults['search']> = {}) {
    lastSeededSearchMeta = searchMeta;
    const data: Record<string, unknown> = {};
    for (const report of reports) {
        data[`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`] = report;
    }
    for (const transaction of transactions) {
        data[`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`] = transaction;
    }
    lastSeededSnapshotData = data;
    onyxData[`${ONYXKEYS.COLLECTION.SNAPSHOT}${SNAPSHOT_HASH}`] = {data, search: searchMeta};
}

/** Mirrors failureData: an error marker and a response code, leaving any stored results untouched. */
function failSearch() {
    const previous = onyxData[`${ONYXKEYS.COLLECTION.SNAPSHOT}${SNAPSHOT_HASH}`];
    const failed: {data?: Record<string, unknown>; search: Partial<SearchResults['search']>; errors: SearchResults['errors']} = {
        data: lastSeededSnapshotData,
        // `state` reaching `loaded` on a failure is exactly why it cannot be read on its own.
        search: {...lastSeededSearchMeta, isLoading: false, state: CONST.SEARCH.SNAPSHOT_STATE.LOADED, responseJsonCode: 0},
        errors: {[ERROR_TIMESTAMP]: 'common.genericErrorMessage'},
    };
    onyxData[`${ONYXKEYS.COLLECTION.SNAPSHOT}${SNAPSHOT_HASH}`] = previous ? failed : {search: failed.search, errors: failed.errors};
}

/** Seeds the local `transactions_` collection (mirrors what optimistic expense creation writes to Onyx). */
function setupLocalTransactions(transactions: Transaction[]) {
    const collection: Record<string, Transaction> = {};
    for (const transaction of transactions) {
        collection[`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`] = transaction;
    }
    onyxData[ONYXKEYS.COLLECTION.TRANSACTION] = collection;
}

function resultTransactionIDs(transactions: RecentlyAddedExpense[]): string[] {
    return transactions.map((t) => t.transactionID);
}

beforeEach(() => {
    for (const k of Object.keys(onyxData)) {
        delete onyxData[k];
    }
    mockUseOnyx.mockClear();
    mockedBuildQueryStringFromFilterFormValues.mockClear();
    mockedUseNetwork.mockReturnValue({isOffline: false});
    // Hash follows the account, as in production. A fixed hash would let the hook's `queryJSON` memo hide the change.
    mockedBuildQueryStringFromFilterFormValues.mockImplementation((values) => `type:expense from:${values.from?.at(0) ?? ''}`);
    mockedBuildSearchQueryJSON.mockImplementation((query) => makeQueryJSON(query.includes(String(OTHER_ACCOUNT_ID)) ? OTHER_SNAPSHOT_HASH : SNAPSHOT_HASH));
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

    it('shows a just-created expense from creation through the snapshot catching up, without dropping or duplicating it', () => {
        // Render 1: created offline, pending ADD, not yet in the snapshot.
        setupSnapshot([], [makeReport('report_owned', ACCOUNT_ID)]);
        setupLocalTransactions([makeTransaction({transactionID: 'new', inserted: '2026-06-02 10:00:00', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD})]);

        const {result, rerender} = renderHook(() => useRecentlyAddedData());
        expect(resultTransactionIDs(result.current.transactions)).toEqual(['new']);

        // Render 2: synced, pendingAction cleared, but the refreshed snapshot hasn't landed yet.
        setupLocalTransactions([makeTransaction({transactionID: 'new', inserted: '2026-06-02 10:00:00'})]);
        rerender({});
        expect(resultTransactionIDs(result.current.transactions)).toEqual(['new']);

        // Render 3: the refreshed snapshot now carries it (local copy still present), shown exactly once.
        setupSnapshot([makeTransaction({transactionID: 'new', inserted: '2026-06-02 10:00:00'})], [makeReport('report_owned', ACCOUNT_ID)]);
        setupLocalTransactions([makeTransaction({transactionID: 'new', inserted: '2026-06-02 10:00:00'})]);
        rerender({});
        expect(resultTransactionIDs(result.current.transactions)).toEqual(['new']);
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

describe('useRecentlyAddedData — deleted expenses', () => {
    it('keeps the row visible with a DELETE pending action while the delete is still queued', () => {
        setupSnapshot([makeTransaction({transactionID: 'doomed', inserted: '2026-06-01 10:00:00'})], [makeReport('report_owned', ACCOUNT_ID)]);
        setupLocalTransactions([makeTransaction({transactionID: 'doomed', inserted: '2026-06-01 10:00:00', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE})]);

        const {result} = renderHook(() => useRecentlyAddedData());

        expect(resultTransactionIDs(result.current.transactions)).toEqual(['doomed']);
        expect(result.current.transactions.at(0)?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    });

    it('hides the row once the delete succeeds, even though the stale snapshot still lists the expense', () => {
        // Render 1: the delete is queued, so the local copy carries pendingAction DELETE.
        setupSnapshot(
            [makeTransaction({transactionID: 'doomed', inserted: '2026-06-02 10:00:00'}), makeTransaction({transactionID: 'kept', inserted: '2026-06-01 10:00:00'})],
            [makeReport('report_owned', ACCOUNT_ID)],
        );
        setupLocalTransactions([makeTransaction({transactionID: 'doomed', inserted: '2026-06-02 10:00:00', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE})]);

        const {result, rerender} = renderHook(() => useRecentlyAddedData());
        expect(resultTransactionIDs(result.current.transactions)).toEqual(['doomed', 'kept']);

        // Render 2: the delete succeeded, removing the local copy. The snapshot was fetched before the delete reached
        // the server, so it still lists the expense — without the suppression the row would return as a live expense.
        setupLocalTransactions([]);
        rerender({});
        expect(resultTransactionIDs(result.current.transactions)).toEqual(['kept']);

        // Render 3: the refreshed snapshot finally drops it, and it stays gone.
        setupSnapshot([makeTransaction({transactionID: 'kept', inserted: '2026-06-01 10:00:00'})], [makeReport('report_owned', ACCOUNT_ID)]);
        rerender({});
        expect(resultTransactionIDs(result.current.transactions)).toEqual(['kept']);
    });

    it('brings the row back when the delete fails and the local copy is restored without a pending action', () => {
        setupSnapshot([makeTransaction({transactionID: 'doomed', inserted: '2026-06-01 10:00:00'})], [makeReport('report_owned', ACCOUNT_ID)]);
        setupLocalTransactions([makeTransaction({transactionID: 'doomed', inserted: '2026-06-01 10:00:00', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE})]);

        const {result, rerender} = renderHook(() => useRecentlyAddedData());
        expect(resultTransactionIDs(result.current.transactions)).toEqual(['doomed']);

        // The delete request failed, so failureData restores the transaction with its pending action cleared.
        setupLocalTransactions([makeTransaction({transactionID: 'doomed', inserted: '2026-06-01 10:00:00'})]);
        rerender({});

        expect(resultTransactionIDs(result.current.transactions)).toEqual(['doomed']);
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

describe('useRecentlyAddedData — surviving a failed search', () => {
    it('keeps the rows it already had when a search fails', () => {
        setupSnapshot([makeTransaction({transactionID: 't1', inserted: '2026-06-01 10:00:00'})], [makeReport('report_owned', ACCOUNT_ID)], LOADED);

        const {result, rerender} = renderHook(() => useRecentlyAddedData());
        expect(resultTransactionIDs(result.current.transactions)).toEqual(['t1']);

        failSearch();
        rerender({});

        expect(resultTransactionIDs(result.current.transactions)).toEqual(['t1']);
    });

    it('replaces the remembered rows once a newer snapshot lands', () => {
        setupSnapshot([makeTransaction({transactionID: 't1', inserted: '2026-06-01 10:00:00'})], [makeReport('report_owned', ACCOUNT_ID)], LOADED);

        const {result, rerender} = renderHook(() => useRecentlyAddedData());
        failSearch();
        rerender({});

        setupSnapshot([makeTransaction({transactionID: 't2', inserted: '2026-06-02 10:00:00'})], [makeReport('report_owned', ACCOUNT_ID)], LOADED);
        rerender({});

        expect(resultTransactionIDs(result.current.transactions)).toEqual(['t2']);
        expect(result.current.isAwaitingFirstResult).toBe(false);
    });

    it('never shows one account rows to another', () => {
        setupSnapshot([makeTransaction({transactionID: 't1', inserted: '2026-06-01 10:00:00'})], [makeReport('report_owned', ACCOUNT_ID)], LOADED);

        const {result, rerender} = renderHook(() => useRecentlyAddedData());
        expect(resultTransactionIDs(result.current.transactions)).toEqual(['t1']);

        // A delegate switch clears Onyx without unmounting Home, so rows fetched for the previous account must not appear.
        mockedUseCurrentUserPersonalDetails.mockReturnValue({accountID: OTHER_ACCOUNT_ID, login: `${OTHER_ACCOUNT_ID}@test.com`} as CurrentUserPersonalDetails);
        rerender({});

        expect(result.current.transactions).toEqual([]);
        // Empty rows plus a settled verdict is the bug this guards: the delegate would be told they have no expenses.
        expect(result.current.isAwaitingFirstResult).toBe(true);
    });
});

describe('useRecentlyAddedData — awaiting the first result', () => {
    it('waits while a search is in flight and nothing has been rendered yet', () => {
        // A snapshot that exists but holds no data yet still counts as nothing rendered.
        onyxData[`${ONYXKEYS.COLLECTION.SNAPSHOT}${SNAPSHOT_HASH}`] = {search: {isLoading: true, state: CONST.SEARCH.SNAPSHOT_STATE.LOADING}};

        const {result} = renderHook(() => useRecentlyAddedData());

        expect(result.current.isAwaitingFirstResult).toBe(true);
    });

    it('stops waiting for a terminal response that carried no data at all', () => {
        // What finallyData writes on a 460 no-op. Without the `state` clause this would shimmer forever.
        onyxData[`${ONYXKEYS.COLLECTION.SNAPSHOT}${SNAPSHOT_HASH}`] = {search: LOADED};

        const {result} = renderHook(() => useRecentlyAddedData());

        expect(result.current.transactions).toEqual([]);
        expect(result.current.isAwaitingFirstResult).toBe(false);
    });

    it('stops waiting when no query could be built, because nothing was ever issued', () => {
        mockedBuildSearchQueryJSON.mockReturnValue(undefined);
        onyxData[`${ONYXKEYS.COLLECTION.SNAPSHOT}${SNAPSHOT_HASH}`] = undefined;

        const {result} = renderHook(() => useRecentlyAddedData());

        expect(result.current.isAwaitingFirstResult).toBe(false);
    });

    it('stops waiting for a successful search that genuinely found no expenses', () => {
        setupSnapshot([], [], LOADED);

        const {result} = renderHook(() => useRecentlyAddedData());

        // The only case that may legitimately show "no expenses".
        expect(result.current.transactions).toEqual([]);
        expect(result.current.isAwaitingFirstResult).toBe(false);
    });

    it('stops waiting after a failure with nothing cached, rather than shimmering forever', () => {
        failSearch();

        const {result} = renderHook(() => useRecentlyAddedData());

        expect(result.current.transactions).toEqual([]);
        expect(result.current.isAwaitingFirstResult).toBe(false);
    });

    it('stops waiting when offline, because no request was issued', () => {
        mockedUseNetwork.mockReturnValue({isOffline: true});
        onyxData[`${ONYXKEYS.COLLECTION.SNAPSHOT}${SNAPSHOT_HASH}`] = undefined;

        const {result} = renderHook(() => useRecentlyAddedData());

        expect(result.current.isAwaitingFirstResult).toBe(false);
    });

    it('stops waiting for a snapshot written without a state field', () => {
        // The IOU optimistic update writes `data` plus a `search` object that carries no `state`.
        setupSnapshot([makeTransaction({transactionID: 't1', inserted: '2026-06-01 10:00:00'})], [makeReport('report_owned', ACCOUNT_ID)], {hasResults: true, isLoading: false});

        const {result} = renderHook(() => useRecentlyAddedData());

        expect(resultTransactionIDs(result.current.transactions)).toEqual(['t1']);
        expect(result.current.isAwaitingFirstResult).toBe(false);
    });
});
