import {fireEvent, render, screen} from '@testing-library/react-native';

import {useSearchSelectionActions, useSearchSelectionContext} from '@components/Search/SearchContext';
import {SearchQueryContext} from '@components/Search/SearchContextDefinitions';
import {SearchSelectionProvider} from '@components/Search/SearchSelectionProvider';
import type {SearchQueryContextValue} from '@components/Search/types';
import Text from '@components/Text';

import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

import React, {useEffect} from 'react';

const queryJSON = buildSearchQueryJSON('type:expense');
if (!queryJSON) {
    throw new Error('Expected the search query to be valid');
}

const buildQueryContext = (currentSearchHash: number): SearchQueryContextValue => ({
    currentSearchHash,
    currentSimilarSearchHash: currentSearchHash,
    currentSearchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
    currentSearchQueryJSON: queryJSON,
    suggestedSearches: getEmptyObject<SearchQueryContextValue['suggestedSearches']>(),
    shouldResetSearchQuery: false,
});

/** Mirrors useSearchPageSetup: a descendant of the provider clearing from a passive effect, keyed on the hash. */
function SearchPageStandIn({hash}: {hash: number}) {
    const {clearSelectedTransactions} = useSearchSelectionActions();

    useEffect(() => {
        clearSelectedTransactions(hash);
    }, [hash, clearSelectedTransactions]);

    return null;
}

function SelectionProbe() {
    const {areAllMatchingItemsSelected} = useSearchSelectionContext();
    const {selectAllMatchingItems} = useSearchSelectionActions();

    return (
        <Text
            testID="probe"
            onPress={() => selectAllMatchingItems(true)}
        >
            {areAllMatchingItemsSelected ? 'all-matching' : 'nothing'}
        </Text>
    );
}

function Harness({hash}: {hash: number}) {
    return (
        <SearchQueryContext value={buildQueryContext(hash)}>
            <SearchSelectionProvider>
                <SearchPageStandIn hash={hash} />
                <SelectionProbe />
            </SearchSelectionProvider>
        </SearchQueryContext>
    );
}

describe('clearing the selection when the search query changes', () => {
    it('clears a select-all-matching selection, which no later pass restores', () => {
        const {rerender} = render(<Harness hash={111} />);

        // Given every matching item selected under the first query
        fireEvent.press(screen.getByTestId('probe'));
        expect(screen.getByTestId('probe')).toHaveTextContent('all-matching');

        // When the query changes in place, which is what a filter chip or a sort does
        rerender(<Harness hash={222} />);

        // Then it is cleared, rather than carrying into a query whose rows it was never chosen against
        expect(screen.getByTestId('probe')).toHaveTextContent('nothing');
    });

    it('leaves the selection alone while the query is unchanged', () => {
        const {rerender} = render(<Harness hash={111} />);

        fireEvent.press(screen.getByTestId('probe'));
        rerender(<Harness hash={111} />);

        expect(screen.getByTestId('probe')).toHaveTextContent('all-matching');
    });
});
