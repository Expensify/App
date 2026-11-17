import {renderHook, waitFor} from '@testing-library/react-native';

import useMergeTransactions from '@hooks/useMergeTransactions';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {MergeTransaction, SearchResults} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createRandomTransaction from '../../utils/collections/transaction';
import createMock from '../../utils/createMock';

let mockCurrentSearchResults: SearchResults | undefined;

jest.mock('@components/Search/SearchContext', () => ({
    useSearchQueryContext: () => ({
        currentSearchHash: 12345,
    }),
    useSearchResultsContext: () => ({
        currentSearchResults: mockCurrentSearchResults,
    }),
}));

jest.mock('@hooks/usePolicyForMovingExpenses', () => ({
    __esModule: true,
    default: () => ({policyForMovingExpensesID: undefined}),
}));

describe('useMergeTransactions', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        mockCurrentSearchResults = undefined;
    });

    it('falls back to the Onyx transactions while the search snapshot has no data yet', async () => {
        // Given a merge started from search while the new search's snapshot only has `search` (optimistic loading state),
        // with transactions that exist in Onyx but not in the merge draft, so the hook looks them up in the snapshot first
        mockCurrentSearchResults = createMock<SearchResults>({search: {type: CONST.SEARCH.DATA_TYPES.EXPENSE}});
        const onyxTransaction1 = createRandomTransaction(1);
        const onyxTransaction2 = createRandomTransaction(2);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}1`, onyxTransaction1);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}2`, onyxTransaction2);
        const mergeTransaction = createMock<MergeTransaction>({targetTransactionID: '1', sourceTransactionID: '2'});

        // When the hook resolves the target and source transactions
        const {result} = renderHook(() => useMergeTransactions({mergeTransaction}));

        // Then it falls back to the Onyx transactions instead of throwing on the missing snapshot data
        await waitFor(() => {
            expect(result.current.targetTransaction).toEqual(onyxTransaction1);
            expect(result.current.sourceTransaction).toEqual(onyxTransaction2);
        });
    });
});
