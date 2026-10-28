import {act, renderHook} from '@testing-library/react-native';

import {useSearchRowSelectionActions, useSearchSelectionActions, useSearchSelectionContext} from '@components/Search/SearchContext';
import {SearchContextProvider} from '@components/Search/SearchContextProvider';
import type {TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import SearchWriteActionsProvider from '@components/Search/SearchWriteActionsProvider';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';

import type * as ReactNavigation from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import {buildTransactionRow} from '../../utils/collections/searchListItems';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigation>('@react-navigation/native'),
    useIsFocused: () => true,
    useRoute: jest.fn(() => ({key: 'search-test-route'})),
    useRootNavigationState: jest.fn(() => undefined),
    useNavigation: jest.fn(() => ({
        getState: jest.fn(() => undefined),
        addListener: jest.fn(() => jest.fn()),
        navigate: jest.fn(),
    })),
}));

/** The search the rows were selected in. */
const SEARCH_HASH = 1;

/** A filter change, which lands on a different search altogether. */
const OTHER_SEARCH_HASH = 3;

const buildRow = (index: number) => buildTransactionRow(index, `${index}`, {currency: 'USD', amount: -500});

/** The first page the search answers with. */
const firstPageRowA = buildRow(1);
const firstPageRowB = buildRow(2);

/** Rows that only arrive once the user scrolls and the next page loads in. */
const laterPageRowA = buildRow(3);
const laterPageRowB = buildRow(4);

const firstPage = [firstPageRowA, firstPageRowB];
const bothPages = [...firstPage, laterPageRowA, laterPageRowB];

function makeSearchResults(hash: number, rows: TransactionListItemType[]): SearchResults {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- minimal fixture: only the fields the selection reconciliation reads are required
    return {
        data: Object.fromEntries(rows.map((row) => [`${ONYXKEYS.COLLECTION.TRANSACTION}${row.transactionID}`, row])),
        search: {
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            hash,
            sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
            offset: 0,
            hasMoreResults: true,
            hasResults: true,
            isLoading: false,
            count: bothPages.length,
            total: 200000,
            currency: 'USD',
        },
    } as unknown as SearchResults;
}

/** What the list is rendering. Swapped between renders to stand for a page load or a re-run of the search. */
let renderedRows: TransactionListItemType[] = bothPages;
let renderedHash = SEARCH_HASH;

function Wrapper({children}: {children: React.ReactNode}) {
    return (
        <SearchContextProvider>
            <SearchWriteActionsProvider
                filteredData={renderedRows}
                renderedData={renderedRows}
                totalSelectableItemsCount={renderedRows.length}
                searchResults={makeSearchResults(renderedHash, renderedRows)}
                searchHash={renderedHash}
                transactions={undefined}
                isMobileSelectionModeEnabled={false}
                type={CONST.SEARCH.DATA_TYPES.EXPENSE}
                areItemsGrouped={false}
                isExpenseReportType={false}
                isSearchResultsEmpty={false}
            >
                {children}
            </SearchWriteActionsProvider>
        </SearchContextProvider>
    );
}

const renderSelection = () =>
    renderHook(
        () => ({
            ...useSearchSelectionContext(),
            ...useSearchSelectionActions(),
            ...useSearchRowSelectionActions(),
        }),
        {wrapper: Wrapper},
    );

describe('Selection as the search data changes', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(() => {
        renderedRows = bothPages;
        renderedHash = SEARCH_HASH;
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('still drops a row that disappears without the search changing', async () => {
        // Given a selected row the current search did show
        const {result, rerender} = renderSelection();
        await act(async () => {
            result.current.toggle(laterPageRowB);
            await waitForBatchedUpdatesWithAct();
        });
        expect(Object.keys(result.current.selectedTransactions)).toEqual(['4']);

        // When it leaves the data on the same hash, which is what a delete looks like
        renderedRows = firstPage;
        rerender({});
        await waitForBatchedUpdatesWithAct();

        // Then it is pruned, as before
        expect(result.current.selectedTransactions).toEqual({});
    });

    it('still drops unloaded rows when the query change is a real one', async () => {
        const {result, rerender} = renderSelection();
        await act(async () => {
            result.current.toggle(laterPageRowB);
            await waitForBatchedUpdatesWithAct();
        });

        // When a filter change moves the search onto another hash
        renderedRows = firstPage;
        renderedHash = OTHER_SEARCH_HASH;
        rerender({});
        await waitForBatchedUpdatesWithAct();

        // Then the selection is not carried into it
        expect(result.current.selectedTransactions).toEqual({});
    });
});
