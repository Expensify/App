import {renderHook} from '@testing-library/react-native';

import useOptimisticSearchTracking from '@components/Search/hooks/useOptimisticSearchTracking';
import type {SearchQueryJSON} from '@components/Search/types';

import {acquireSearchWriteBarrier, flushPendingSearchWrite, hasPendingSearchWrite, markPendingSearchWrite, resetForTesting, setSearchWriteWatchKey} from '@libs/pendingSearchWrite';

import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';
import type SearchResults from '@src/types/onyx/SearchResults';

import type {OnyxCollection} from 'react-native-onyx';

const TRANSACTION_ID = '9876543210';
const TRANSACTION_KEY = 'transactions_9876543210';

const queryJSON: SearchQueryJSON = {
    inputQuery: 'type:expense',
    hash: 111,
    recentSearchHash: 111,
    similarSearchHash: 111,
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
        amount: 4200,
        created: '2026-09-29',
        currency: CONST.CURRENCY.USD,
        merchant: 'Unique merchant',
        reportID: '1',
        transactionID: TRANSACTION_ID,
    };
    Object.assign(transaction, overrides);
    return transaction;
}

function makeSearchResults(data: SearchResults['data'] = {}): SearchResults {
    return {
        data,
        search: {
            offset: 0,
            hash: queryJSON.hash,
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            hasMoreResults: false,
            hasResults: true,
            isLoading: false,
            sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
        },
    };
}

function renderTracking(transaction: Transaction, data: SearchResults['data'] = {}) {
    const transactions: OnyxCollection<Transaction> = {
        [TRANSACTION_KEY]: transaction,
    };
    return renderHook(() =>
        useOptimisticSearchTracking({
            searchResults: makeSearchResults(data),
            queryJSON,
            transactions,
            reportActions: {},
        }),
    );
}

function markPendingWriteForTransaction() {
    markPendingSearchWrite();
    setSearchWriteWatchKey(TRANSACTION_KEY);
}

beforeEach(() => {
    resetForTesting();
});

afterEach(() => {
    resetForTesting();
});

describe('useOptimisticSearchTracking', () => {
    it('adds the optimistic transaction while its write is still pending', () => {
        // Given a submission that marked the signal and published its watch key
        markPendingWriteForTransaction();
        const pendingTransaction = makeTransaction({pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});

        // When Search mounts while that write is still pending
        const {result} = renderTracking(pendingTransaction);

        // Then the transaction is added to the snapshot, so its row shows before the server indexes it
        expect(result.current.searchDataWithOptimisticTransaction).toHaveProperty(TRANSACTION_KEY);
    });

    it('does not add the transaction of a released write to a search mounted afterwards', () => {
        // Given a submission whose write was already released, leaving its watch key readable
        markPendingWriteForTransaction();
        acquireSearchWriteBarrier();
        flushPendingSearchWrite();
        const pendingTransaction = makeTransaction({pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});

        // When a different query mounts Search with no write of its own pending
        const {result} = renderTracking(pendingTransaction);

        // Then the earlier expense is left out, since it has no relation to this query's filters
        expect(result.current.searchDataWithOptimisticTransaction).not.toHaveProperty(TRANSACTION_KEY);
    });

    it('does not inject a settled transaction even while its write is still pending', () => {
        markPendingWriteForTransaction();
        const settledTransaction = makeTransaction({pendingAction: undefined});

        const {result} = renderTracking(settledTransaction);

        expect(result.current.searchDataWithOptimisticTransaction).not.toHaveProperty(TRANSACTION_KEY);
    });

    it('does not inject a split-parent transaction even when pending creation', () => {
        markPendingWriteForTransaction();
        const splitParent = makeTransaction({
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            reportID: CONST.REPORT.SPLIT_REPORT_ID,
        });

        const {result} = renderTracking(splitParent);

        expect(result.current.searchDataWithOptimisticTransaction).not.toHaveProperty(TRANSACTION_KEY);
    });

    it('does not inject when the transaction is already present in the snapshot', () => {
        markPendingWriteForTransaction();
        const pendingTransaction = makeTransaction({pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});
        const snapshotData: SearchResults['data'] = {
            [TRANSACTION_KEY]: pendingTransaction,
        };

        const {result} = renderTracking(pendingTransaction, snapshotData);

        expect(result.current.searchDataWithOptimisticTransaction).toBe(snapshotData);
    });

    it('flushes the pending search write on unmount when not navigating to search', () => {
        markPendingSearchWrite();
        const {unmount} = renderTracking(makeTransaction());

        unmount();
        acquireSearchWriteBarrier();

        expect(hasPendingSearchWrite()).toBe(false);
    });
});
