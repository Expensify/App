import {renderHook} from '@testing-library/react-native';

import useOptimisticSearchTracking from '@components/Search/hooks/useOptimisticSearchTracking';
import type {SearchQueryJSON} from '@components/Search/types';

import {flushPendingSearchWrite, getSearchWriteWatchKey, hasPendingSearchWrite} from '@libs/pendingSearchWrite';

import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';
import type SearchResults from '@src/types/onyx/SearchResults';

import type {OnyxCollection} from 'react-native-onyx';

jest.mock('@libs/pendingSearchWrite', () => ({
    getSearchWriteWatchKey: jest.fn(),
    hasPendingSearchWrite: jest.fn(),
    flushPendingSearchWrite: jest.fn(),
}));

jest.mock('@libs/SearchUIUtils', () => ({
    isSearchDataLoaded: jest.fn(() => true),
    isTransactionSearchType: jest.fn((type: string | undefined) => type === 'expense' || type === 'invoice'),
}));

jest.mock('@libs/telemetry/submitFollowUpAction', () => ({
    getPendingSubmitFollowUpAction: jest.fn(() => undefined),
}));

const mockGetSearchWriteWatchKey = jest.mocked(getSearchWriteWatchKey);
const mockHasPendingSearchWrite = jest.mocked(hasPendingSearchWrite);

const TRANSACTION_KEY = 'transactions_stale-tx-96982';
const OTHER_TRANSACTION_KEY = 'transactions_other-tx';

const queryJSON: SearchQueryJSON = {
    inputQuery: 'type:expense description:Vampire',
    hash: 96982,
    recentSearchHash: 96982,
    similarSearchHash: 96982,
    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
    view: CONST.SEARCH.VIEW.TABLE,
    sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
    sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
    flatFilters: [],
    filters: {
        operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
        left: CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE,
        right: CONST.SEARCH.DATA_TYPES.EXPENSE,
    },
};

function makeTransaction(overrides: Partial<Transaction> = {}): Transaction {
    const transaction: Transaction = {
        amount: 100,
        created: '2026-01-01',
        currency: CONST.CURRENCY.USD,
        merchant: 'Distance',
        reportID: '42',
        transactionID: 'stale-tx-96982',
    };
    Object.assign(transaction, overrides);
    return transaction;
}

const snapshotData: SearchResults['data'] = {
    [OTHER_TRANSACTION_KEY]: makeTransaction({transactionID: 'other-tx', reportID: '1'}),
};

const searchResults: SearchResults = {
    data: snapshotData,
    search: {
        offset: 0,
        hash: 96982,
        type: CONST.SEARCH.DATA_TYPES.EXPENSE,
        hasMoreResults: false,
        hasResults: true,
        isLoading: false,
        sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
        sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
    },
};

function renderTrackingHook(transaction: Transaction) {
    const transactions: OnyxCollection<Transaction> = {
        [TRANSACTION_KEY]: transaction,
    };
    return renderHook(() =>
        useOptimisticSearchTracking({
            searchResults,
            queryJSON,
            transactions,
            reportActions: {},
        }),
    );
}

describe('useOptimisticSearchTracking', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetSearchWriteWatchKey.mockReturnValue(TRANSACTION_KEY);
        mockHasPendingSearchWrite.mockReturnValue(false);
    });

    it('does not inject a settled transaction when the snapshot excludes it (#96982)', () => {
        const settledTransaction = makeTransaction({pendingAction: undefined});
        const {result} = renderTrackingHook(settledTransaction);

        expect(result.current.searchDataWithOptimisticTransaction).toBe(snapshotData);
        expect(result.current.searchDataWithOptimisticTransaction?.[TRANSACTION_KEY]).toBeUndefined();
    });

    it('still injects a transaction that is pending creation', () => {
        const pendingTransaction = makeTransaction({pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});
        const {result} = renderTrackingHook(pendingTransaction);

        expect(result.current.searchDataWithOptimisticTransaction?.[TRANSACTION_KEY]).toBe(pendingTransaction);
    });

    it('does not inject a split-parent transaction even when pending creation', () => {
        const splitParent = makeTransaction({
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            reportID: CONST.REPORT.SPLIT_REPORT_ID,
        });
        const {result} = renderTrackingHook(splitParent);

        expect(result.current.searchDataWithOptimisticTransaction).toBe(snapshotData);
        expect(result.current.searchDataWithOptimisticTransaction?.[TRANSACTION_KEY]).toBeUndefined();
    });

    it('does not inject when the transaction is already present in the snapshot', () => {
        const pendingTransaction = makeTransaction({pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});
        const snapshotWithTransaction: SearchResults['data'] = {
            ...snapshotData,
            [TRANSACTION_KEY]: pendingTransaction,
        };
        const resultsWithTransaction: SearchResults = {...searchResults, data: snapshotWithTransaction};

        const {result} = renderHook(() =>
            useOptimisticSearchTracking({
                searchResults: resultsWithTransaction,
                queryJSON,
                transactions: {[TRANSACTION_KEY]: pendingTransaction},
                reportActions: {},
            }),
        );

        expect(result.current.searchDataWithOptimisticTransaction).toBe(snapshotWithTransaction);
    });

    it('flushes the pending search write on unmount when not navigating to search', () => {
        const {unmount} = renderTrackingHook(makeTransaction());
        unmount();
        expect(flushPendingSearchWrite).toHaveBeenCalled();
    });
});
