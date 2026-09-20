import {renderHook} from '@testing-library/react-native';

import useOptimisticSearchTracking from '@components/Search/hooks/useOptimisticSearchTracking';
import type {SearchQueryJSON} from '@components/Search/types';

import {flushDeferredWrite, getOptimisticWatchKey, hasDeferredWrite} from '@libs/deferredLayoutWrite';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import type SearchResults from '@src/types/onyx/SearchResults';

jest.mock('@libs/deferredLayoutWrite', () => ({
    getOptimisticWatchKey: jest.fn(),
    hasDeferredWrite: jest.fn(),
    flushDeferredWrite: jest.fn(),
}));

jest.mock('@libs/SearchUIUtils', () => ({
    isSearchDataLoaded: jest.fn(() => true),
    isTransactionSearchType: jest.fn((type: string | undefined) => type === 'expense' || type === 'invoice'),
}));

jest.mock('@libs/telemetry/submitFollowUpAction', () => ({
    getPendingSubmitFollowUpAction: jest.fn(() => undefined),
}));

const mockGetOptimisticWatchKey = jest.mocked(getOptimisticWatchKey);
const mockHasDeferredWrite = jest.mocked(hasDeferredWrite);

const TRANSACTION_ID = 'stale-tx-96982';
const TRANSACTION_KEY = `${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}` as const;

const queryJSON = {
    hash: 96982,
    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
    sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
    sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
    flatFilters: [],
} as SearchQueryJSON;

const snapshotData = {
    [`${ONYXKEYS.COLLECTION.TRANSACTION}other-tx`]: {transactionID: 'other-tx', reportID: '1'},
} as SearchResults['data'];

const searchResults = {
    data: snapshotData,
    search: {
        hash: 96982,
        type: CONST.SEARCH.DATA_TYPES.EXPENSE,
        isLoading: false,
    },
} as SearchResults;

function makeTransaction(overrides: Partial<Transaction> = {}): Transaction {
    return {
        transactionID: TRANSACTION_ID,
        reportID: '42',
        amount: 100,
        currency: CONST.CURRENCY.USD,
        ...overrides,
    } as Transaction;
}

function renderTrackingHook(transactions: Record<string, Transaction>) {
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
        mockGetOptimisticWatchKey.mockReturnValue(TRANSACTION_KEY);
        mockHasDeferredWrite.mockReturnValue(false);
    });

    it('does not inject a settled transaction when the snapshot excludes it (#96982)', () => {
        const settledTransaction = makeTransaction({pendingAction: undefined});
        const {result} = renderTrackingHook({[TRANSACTION_KEY]: settledTransaction});

        expect(result.current.searchDataWithOptimisticTransaction).toBe(snapshotData);
        expect(result.current.searchDataWithOptimisticTransaction?.[TRANSACTION_KEY]).toBeUndefined();
    });

    it('still injects a transaction that is pending creation', () => {
        const pendingTransaction = makeTransaction({pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});
        const {result} = renderTrackingHook({[TRANSACTION_KEY]: pendingTransaction});

        expect(result.current.searchDataWithOptimisticTransaction?.[TRANSACTION_KEY]).toBe(pendingTransaction);
    });

    it('does not inject a split-parent transaction even when pending creation', () => {
        const splitParent = makeTransaction({
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            reportID: CONST.REPORT.SPLIT_REPORT_ID,
        });
        const {result} = renderTrackingHook({[TRANSACTION_KEY]: splitParent});

        expect(result.current.searchDataWithOptimisticTransaction).toBe(snapshotData);
        expect(result.current.searchDataWithOptimisticTransaction?.[TRANSACTION_KEY]).toBeUndefined();
    });

    it('does not inject when the transaction is already present in the snapshot', () => {
        const pendingTransaction = makeTransaction({pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});
        const snapshotWithTransaction = {
            ...snapshotData,
            [TRANSACTION_KEY]: pendingTransaction,
        } as SearchResults['data'];
        const resultsWithTransaction = {...searchResults, data: snapshotWithTransaction} as SearchResults;

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

    it('flushes deferred write on unmount when not navigating to search', () => {
        const {unmount} = renderTrackingHook({[TRANSACTION_KEY]: makeTransaction()});
        unmount();
        expect(flushDeferredWrite).toHaveBeenCalledWith(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);
    });
});
