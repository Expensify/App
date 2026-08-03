import {act, renderHook} from '@testing-library/react-native';

import {useSearchRowSelectionActions, useSearchSelectionContext} from '@components/Search/SearchContext';
import {SearchContextProvider} from '@components/Search/SearchContextProvider';
import type {TransactionCategoryGroupListItemType, TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import SearchWriteActionsProvider from '@components/Search/SearchWriteActionsProvider';

import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type * as ReactNavigation from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

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

const GROUP_KEY = 'Advertising';

/**
 * A `group-by:category` group. Its children are fetched into a separate snapshot only once the row is expanded,
 * so `transactions` stays empty on the group itself for the whole lifetime of the list.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- minimal fixture: only the fields the selection logic reads are needed
const categoryGroup = {
    groupedBy: CONST.SEARCH.GROUP_BY.CATEGORY,
    category: 'Advertising',
    formattedCategory: 'Advertising',
    count: 2,
    total: -1284,
    currency: 'USD',
    transactions: [],
    transactionsQueryJSON: buildSearchQueryJSON('type:expense category:Advertising'),
    keyForList: GROUP_KEY,
} as unknown as TransactionCategoryGroupListItemType;

/** The children as they look once the group has been expanded and its snapshot has loaded. */
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- minimal fixture: only the fields the selection logic reads are needed
const loadedChildren = [
    {transactionID: '1', keyForList: '1', currency: 'USD', amount: -642, report: {reportID: '11'}},
    {transactionID: '2', keyForList: '2', currency: 'USD', amount: -642, report: {reportID: '11'}},
] as unknown as TransactionListItemType[];

function Wrapper({children}: {children: React.ReactNode}) {
    return (
        <SearchContextProvider>
            <SearchWriteActionsProvider
                filteredData={[categoryGroup]}
                totalSelectableItemsCount={2}
                searchResults={undefined}
                transactions={undefined}
                isMobileSelectionModeEnabled={false}
                type={CONST.SEARCH.DATA_TYPES.EXPENSE}
                areItemsGrouped
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
            ...useSearchRowSelectionActions(),
        }),
        {wrapper: Wrapper},
    );

describe('Lazily loaded group selection', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(async () => {
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    it('stores the selection under the group key while the children are still unknown', async () => {
        const {result} = renderSelection();

        // When the checkbox is pressed before the group has been expanded, so no children are loaded yet
        await act(async () => {
            result.current.toggle(categoryGroup, []);
            await waitForBatchedUpdatesWithAct();
        });

        // Then the group itself is selected, since there are no transaction IDs to select yet
        expect(result.current.selectedTransactions[GROUP_KEY]?.isSelected).toBe(true);
    });

    it('deselects a group that was selected before its children loaded', async () => {
        const {result} = renderSelection();

        // Given a group selected while it was still collapsed
        await act(async () => {
            result.current.toggle(categoryGroup, []);
            await waitForBatchedUpdatesWithAct();
        });
        expect(result.current.selectedTransactions[GROUP_KEY]?.isSelected).toBe(true);

        // When the group is expanded, its children load, and the checkbox is pressed again
        await act(async () => {
            result.current.toggle(categoryGroup, loadedChildren);
            await waitForBatchedUpdatesWithAct();
        });

        // Then the group-level selection is cleared rather than left behind, so nothing stays selected
        expect(result.current.selectedTransactions[GROUP_KEY]).toBeUndefined();
        expect(Object.keys(result.current.selectedTransactions)).toHaveLength(0);
    });

    it('selects every child of a group that was not already selected once its children loaded', async () => {
        const {result} = renderSelection();

        // When the checkbox is pressed on an expanded, unselected group whose children have loaded
        await act(async () => {
            result.current.toggle(categoryGroup, loadedChildren);
            await waitForBatchedUpdatesWithAct();
        });

        // Then each child is selected individually, and the group key is not used
        expect(result.current.selectedTransactions[GROUP_KEY]).toBeUndefined();
        expect(result.current.selectedTransactions['1']?.isSelected).toBe(true);
        expect(result.current.selectedTransactions['2']?.isSelected).toBe(true);
    });
});
