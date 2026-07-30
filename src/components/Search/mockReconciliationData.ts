import CONST from '@src/CONST';
import type {SearchResults} from '@src/types/onyx';
import type {SearchWithdrawalIDGroup} from '@src/types/onyx/SearchResults';

import type {SearchQueryJSON} from './types';

/**
 * ⚠️ DEV-ONLY SCAFFOLDING — DO NOT MERGE ⚠️
 *
 * Fake withdrawal-ID groups for the Bank reconciliation tab (Reports > Bank reconciliation), so the table can be
 * worked on without an account that has real Expensify Card settlement history.
 *
 * The mock is applied on read in `SearchResultsProvider`, not written to Onyx, so a real `Search` response never
 * clobbers it. To turn it off, flip `SHOULD_MOCK_RECONCILIATION_DATA` to `false`.
 *
 * To remove entirely: delete this file plus the two `mockReconciliationData` lines in `SearchResultsProvider.tsx`.
 */
const SHOULD_MOCK_RECONCILIATION_DATA = true;

/** Replace the real snapshot instead of appending to it. Set to `false` to see mock rows alongside real ones. */
const SHOULD_REPLACE_REAL_RESULTS = true;

const MOCK_CURRENCY = 'USD';

/**
 * A date `daysAgo` days back, as the `YYYY-MM-DD` string the backend sends for `debitPosted`.
 * Relative so the rows stay inside the tab's `withdrawn:last-month` window as time passes.
 */
function daysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().slice(0, 10);
}

/**
 * Settlement `state` values, per the mapping in `SearchUIUtils.settlementStatusMap`:
 * 5/6/7 = Failed, 8/9 = Cleared, anything else = Pending.
 */
const SETTLEMENT_STATE = {
    PENDING: 1,
    FAILED: 5,
    CLEARED: 8,
} as const;

/**
 * The cash back credit row this feature adds. `isCashbackCredit` is not on `SearchWithdrawalIDGroup` yet — it is the
 * discriminator the deployed backend is expected to send, so it is cast in here until the type is updated.
 *
 * `count: 0` (blank Expenses cell) and a negative `total` (a credit back to the bank account) match the approved mock.
 */
const mockCashbackGroup = {
    entryID: 990000001,
    count: 0,
    total: -100,
    currency: MOCK_CURRENCY,
    accountNumber: '1234567890',
    bankName: CONST.BANK_NAMES.CHASE,
    debitPosted: daysAgo(3),
    state: SETTLEMENT_STATE.CLEARED,
    isCashbackCredit: true,
} as SearchWithdrawalIDGroup;

/** Ordinary card settlements, so the cash back row can be compared against the rows it sits next to. */
const mockSettlementGroups: SearchWithdrawalIDGroup[] = [
    {
        entryID: 990000002,
        count: 12,
        total: 40000,
        currency: MOCK_CURRENCY,
        accountNumber: '1234567890',
        bankName: CONST.BANK_NAMES.CHASE,
        debitPosted: daysAgo(4),
        state: SETTLEMENT_STATE.CLEARED,
    },
    {
        entryID: 990000003,
        count: 3,
        total: 12550,
        currency: MOCK_CURRENCY,
        accountNumber: '9876543210',
        bankName: CONST.BANK_NAMES.BANK_OF_AMERICA,
        debitPosted: daysAgo(11),
        state: SETTLEMENT_STATE.PENDING,
    },
    {
        entryID: 990000004,
        count: 2,
        total: 8900,
        currency: MOCK_CURRENCY,
        accountNumber: '9876543210',
        bankName: CONST.BANK_NAMES.BANK_OF_AMERICA,
        debitPosted: daysAgo(18),
        state: SETTLEMENT_STATE.FAILED,
    },
];

const mockGroups: SearchWithdrawalIDGroup[] = [mockCashbackGroup, ...mockSettlementGroups];

/**
 * Merge the mock groups into the reconciliation snapshot.
 *
 * `search.hash`, `sortBy`, `sortOrder` and `type` are taken from the live `queryJSON` because `isSearchDataLoaded`
 * re-derives the query hash from them — if they don't line up, the tab renders the empty state instead of the table.
 */
function getMockReconciliationResults(searchResults: SearchResults | undefined, queryJSON: SearchQueryJSON | undefined): SearchResults | undefined {
    if (!SHOULD_MOCK_RECONCILIATION_DATA || !queryJSON) {
        return searchResults;
    }

    const mockData: SearchResults['data'] = {};
    for (const group of mockGroups) {
        mockData[`${CONST.SEARCH.GROUP_PREFIX}${group.entryID}`] = group;
    }
    const data = SHOULD_REPLACE_REAL_RESULTS ? mockData : {...searchResults?.data, ...mockData};

    return {
        ...searchResults,
        search: {
            ...searchResults?.search,
            offset: 0,
            hash: queryJSON.hash,
            type: queryJSON.type,
            sortBy: queryJSON.sortBy,
            sortOrder: queryJSON.sortOrder,
            state: CONST.SEARCH.SNAPSHOT_STATE.LOADED,
            hasResults: true,
            hasMoreResults: false,
            isLoading: false,
            count: mockGroups.reduce((acc, group) => acc + group.count, 0),
            total: mockGroups.reduce((acc, group) => acc + group.total, 0),
            currency: MOCK_CURRENCY,
        },
        data,
    };
}

export default getMockReconciliationResults;
export {SHOULD_MOCK_RECONCILIATION_DATA};
