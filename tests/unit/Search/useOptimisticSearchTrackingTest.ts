import {renderHook} from '@testing-library/react-native';

import useOptimisticSearchTracking from '@components/Search/hooks/useOptimisticSearchTracking';
import type {SearchQueryJSON} from '@components/Search/types';

import {acquireSearchWriteBarrier, flushPendingSearchWrite, markPendingSearchWrite, resetForTesting, setSearchWriteWatchKey} from '@libs/pendingSearchWrite';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import type SearchResults from '@src/types/onyx/SearchResults';

import type {OnyxCollection} from 'react-native-onyx';

jest.mock('@libs/SearchUIUtils', () => ({
    isSearchDataLoaded: () => true,
    isTransactionSearchType: () => true,
}));
jest.mock('@libs/ReportActionsUtils', () => ({
    getOriginalMessage: () => undefined,
    isMoneyRequestAction: () => false,
}));

const TRANSACTION_ID = '9876543210';
const TRANSACTION_KEY = `${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}` as const;

const transactions: OnyxCollection<Transaction> = {
    [TRANSACTION_KEY]: {
        transactionID: TRANSACTION_ID,
        reportID: '1',
        merchant: 'Unique merchant',
        amount: 4200,
        currency: 'USD',
        created: '2026-09-29',
    },
};

function makeQueryJSON(hash: number): SearchQueryJSON {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return {
        hash,
        type: CONST.SEARCH.DATA_TYPES.EXPENSE,
        sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
        sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
    } as SearchQueryJSON;
}

function makeSearchResults(): SearchResults {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return {
        data: {personalDetailsList: {}},
        search: {isLoading: false, hasMoreResults: false, type: CONST.SEARCH.DATA_TYPES.EXPENSE},
    } as unknown as SearchResults;
}

function renderTracking(hash: number) {
    return renderHook(() =>
        useOptimisticSearchTracking({
            searchResults: makeSearchResults(),
            queryJSON: makeQueryJSON(hash),
            transactions,
            reportActions: undefined,
        }),
    );
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
        markPendingSearchWrite();
        setSearchWriteWatchKey(TRANSACTION_KEY);

        // When Search mounts while that write is still pending
        const {result} = renderTracking(111);

        // Then the transaction is added to the snapshot, so its row shows before the server indexes it
        expect(result.current.searchDataWithOptimisticTransaction).toHaveProperty(TRANSACTION_KEY);
    });

    it('does not add the transaction of a released write to a search mounted afterwards', () => {
        // Given a submission whose write was already released, leaving its watch key readable
        markPendingSearchWrite();
        setSearchWriteWatchKey(TRANSACTION_KEY);
        acquireSearchWriteBarrier();
        flushPendingSearchWrite();

        // When a different query mounts Search with no write of its own pending
        const {result} = renderTracking(222);

        // Then the earlier expense is left out, since it has no relation to this query's filters
        expect(result.current.searchDataWithOptimisticTransaction).not.toHaveProperty(TRANSACTION_KEY);
    });
});
