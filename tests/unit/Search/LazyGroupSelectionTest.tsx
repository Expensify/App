import {act, renderHook} from '@testing-library/react-native';

import {useSearchRowSelectionActions, useSearchSelectionActions, useSearchSelectionContext, useSearchShiftRangeChildren} from '@components/Search/SearchContext';
import {SearchContextProvider} from '@components/Search/SearchContextProvider';
import type {TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import SearchWriteActionsProvider from '@components/Search/SearchWriteActionsProvider';

import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';

import type * as ReactNavigation from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import {buildCategoryGroup, buildTransactionRow} from '../../utils/collections/searchListItems';
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

/** A child as it looks once its group has been expanded and the snapshot has loaded. */
const buildChild = (index: number, key: string) => buildTransactionRow(index, key, {currency: 'USD', amount: -642, report: {reportID: '11'}});

/**
 * A `group-by:category` group. Its children are fetched into a separate snapshot only once the row is expanded,
 * so `transactions` stays empty on the group itself for the whole lifetime of the list.
 */
const categoryGroup = buildCategoryGroup(GROUP_KEY, [], buildSearchQueryJSON('type:expense category:Advertising'));

const loadedChildren = [buildChild(1, '1'), buildChild(2, '2')];

/** The same group with a third child, for ranges that leave a row untouched on either side. */
const threeLoadedChildren = [...loadedChildren, buildChild(5, '5')];

/** The same group as the server sees it: five rows in total, of which only the first page has loaded. */
const partiallyLoadedGroup = {...categoryGroup, count: 5};

const EARLIER_GROUP_KEY = 'Office';

/** A group rendered above `categoryGroup`, used to prove a range does not start from the top of the list. */
const earlierGroup = buildCategoryGroup(EARLIER_GROUP_KEY, [], buildSearchQueryJSON('type:expense category:Office'));

/** The earlier group's children, expanded and loaded. */
const earlierChildren = [buildChild(3, '3'), buildChild(4, '4')];

function PartiallyLoadedWrapper({children}: {children: React.ReactNode}) {
    return (
        <SearchContextProvider>
            <SearchWriteActionsProvider
                filteredData={[partiallyLoadedGroup]}
                renderedData={[partiallyLoadedGroup]}
                totalSelectableItemsCount={5}
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

function TwoGroupWrapper({children}: {children: React.ReactNode}) {
    return (
        <SearchContextProvider>
            <SearchWriteActionsProvider
                filteredData={[earlierGroup, categoryGroup]}
                renderedData={[earlierGroup, categoryGroup]}
                totalSelectableItemsCount={4}
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

const FLAT_TRANSACTION_ID = 'flat-1';

const makeFlatExpense = (amount: number) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- minimal fixture: only fields read by selection builders are required
    ({
        transactionID: FLAT_TRANSACTION_ID,
        keyForList: FLAT_TRANSACTION_ID,
        currency: 'USD',
        amount,
        groupAmount: amount,
        reportID: '11',
        report: {reportID: '11'},
        action: CONST.SEARCH.ACTION_TYPES.VIEW,
    }) as unknown as TransactionListItemType;

function makeFlatSearchResults(expense: TransactionListItemType | undefined): SearchResults {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- minimal fixture: only fields read by the selection reconciliation are required
    return {
        data: expense ? {[`${ONYXKEYS.COLLECTION.TRANSACTION}${FLAT_TRANSACTION_ID}`]: expense} : {},
        search: {
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            hash: 1,
            sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
            offset: 0,
            hasMoreResults: true,
            hasResults: true,
            isLoading: false,
            count: expense ? 2 : 1,
            total: expense ? 13000 : 10000,
            currency: 'USD',
        },
    } as unknown as SearchResults;
}

let flatExpense = makeFlatExpense(-3000);
let flatFilteredData: TransactionListItemType[] = [flatExpense];
let flatSearchResults = makeFlatSearchResults(flatExpense);

function Wrapper({children}: {children: React.ReactNode}) {
    return (
        <SearchContextProvider>
            <SearchWriteActionsProvider
                filteredData={[categoryGroup]}
                renderedData={[categoryGroup]}
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

function FlatWrapper({children}: {children: React.ReactNode}) {
    return (
        <SearchContextProvider>
            <SearchWriteActionsProvider
                filteredData={flatFilteredData}
                renderedData={flatFilteredData}
                totalSelectableItemsCount={flatFilteredData.length}
                searchResults={flatSearchResults}
                transactions={undefined}
                isMobileSelectionModeEnabled={false}
                type={CONST.SEARCH.DATA_TYPES.EXPENSE}
                areItemsGrouped={false}
                isExpenseReportType={false}
                isSearchResultsEmpty={flatFilteredData.length === 0}
            >
                {children}
            </SearchWriteActionsProvider>
        </SearchContextProvider>
    );
}

const renderSelection = (wrapper: React.ComponentType<{children: React.ReactNode}> = Wrapper) =>
    renderHook(
        () => ({
            ...useSearchSelectionContext(),
            ...useSearchSelectionActions(),
            ...useSearchRowSelectionActions(),
            ...useSearchShiftRangeChildren(),
        }),
        {wrapper},
    );

const renderFlatSelection = () =>
    renderHook(
        () => ({
            ...useSearchSelectionContext(),
            ...useSearchSelectionActions(),
            ...useSearchRowSelectionActions(),
        }),
        {wrapper: FlatWrapper},
    );

async function excludeFlatExpense(result: ReturnType<typeof renderFlatSelection>['result']) {
    await act(async () => {
        result.current.toggleAll();
        result.current.selectAllMatchingItems(true);
        await waitForBatchedUpdatesWithAct();
    });
    await act(async () => {
        result.current.toggle(flatExpense);
        await waitForBatchedUpdatesWithAct();
    });
}

describe('Lazily loaded group selection', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(async () => {
        flatExpense = makeFlatExpense(-3000);
        flatFilteredData = [flatExpense];
        flatSearchResults = makeFlatSearchResults(flatExpense);
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

    it('narrows a selection held under the group key when shift+click collapses the range onto one child', async () => {
        const {result} = renderSelection();
        const [firstChild] = loadedChildren;

        // Given a group whose children have loaded and been registered
        await act(async () => {
            result.current.registerGroupChildren(GROUP_KEY, loadedChildren);
            await waitForBatchedUpdatesWithAct();
        });

        // Given Select All, which lands under the group key since the group carries no transactions itself
        await act(async () => {
            result.current.toggleAll();
            await waitForBatchedUpdatesWithAct();
        });
        expect(result.current.selectedTransactions[GROUP_KEY]?.isSelected).toBe(true);

        // When shift+click collapses the seeded range onto the first child
        await act(async () => {
            result.current.toggle(firstChild, undefined, true);
            await waitForBatchedUpdatesWithAct();
        });

        // Then the group entry is spelled out into its children, so the rest can be dropped
        expect(result.current.selectedTransactions[GROUP_KEY]).toBeUndefined();
        expect(result.current.selectedTransactions['1']?.isSelected).toBe(true);
        expect(result.current.selectedTransactions['2']).toBeUndefined();
    });

    it('deselects a single child of a group that was selected before its children loaded', async () => {
        const {result} = renderSelection();
        const [firstChild] = loadedChildren;

        // Given a group selected while it was still collapsed, whose children have since loaded and been registered
        await act(async () => {
            result.current.toggle(categoryGroup, []);
            result.current.registerGroupChildren(GROUP_KEY, loadedChildren);
            await waitForBatchedUpdatesWithAct();
        });
        expect(result.current.selectedTransactions[GROUP_KEY]?.isSelected).toBe(true);

        // When one of those children, which renders as selected through the group, is clicked
        await act(async () => {
            result.current.toggle(firstChild);
            await waitForBatchedUpdatesWithAct();
        });

        // Then only that child is dropped and the rest of the group stays selected
        expect(result.current.selectedTransactions[GROUP_KEY]).toBeUndefined();
        expect(result.current.selectedTransactions['1']).toBeUndefined();
        expect(result.current.selectedTransactions['2']?.isSelected).toBe(true);
    });

    it('narrows a group selected before its children loaded once shift+click shrinks the range', async () => {
        const {result} = renderSelection();
        const [firstChild, secondChild] = loadedChildren;

        // Given a group selected while it was still collapsed, whose children have since loaded and been registered
        await act(async () => {
            result.current.toggle(categoryGroup, []);
            result.current.registerGroupChildren(GROUP_KEY, loadedChildren);
            await waitForBatchedUpdatesWithAct();
        });

        // When a shift+click covers both children and a second one shrinks the range back to the first
        await act(async () => {
            result.current.toggle(secondChild, undefined, true);
            await waitForBatchedUpdatesWithAct();
        });
        await act(async () => {
            result.current.toggle(firstChild, undefined, true);
            await waitForBatchedUpdatesWithAct();
        });

        // Then the second child drops out, rather than staying selected through the group
        expect(result.current.selectedTransactions[GROUP_KEY]).toBeUndefined();
        expect(result.current.selectedTransactions['1']?.isSelected).toBe(true);
        expect(result.current.selectedTransactions['2']).toBeUndefined();
    });

    it('anchors inside the selected group rather than at the top of the list, with an expanded group above it', async () => {
        const {result} = renderSelection(TwoGroupWrapper);
        const [, secondChild] = loadedChildren;

        // Given an expanded, unselected group above a group that was selected while it was still collapsed
        await act(async () => {
            result.current.registerGroupChildren(EARLIER_GROUP_KEY, earlierChildren);
            result.current.toggle(categoryGroup, []);
            result.current.registerGroupChildren(GROUP_KEY, loadedChildren);
            await waitForBatchedUpdatesWithAct();
        });

        // When shift+click lands on the second child of the selected group
        await act(async () => {
            result.current.toggle(secondChild, undefined, true);
            await waitForBatchedUpdatesWithAct();
        });

        // Then the range stays inside that group and never reaches the group above
        expect(result.current.selectedTransactions['1']?.isSelected).toBe(true);
        expect(result.current.selectedTransactions['2']?.isSelected).toBe(true);
        expect(result.current.selectedTransactions['3']).toBeUndefined();
        expect(result.current.selectedTransactions['4']).toBeUndefined();
    });

    it('leaves no untouched child behind when a range narrows a group of three', async () => {
        const {result} = renderSelection();
        const [firstChild, secondChild] = threeLoadedChildren;

        // Given a group selected while it was still collapsed, whose three children have since loaded and been registered
        await act(async () => {
            result.current.toggle(categoryGroup, []);
            result.current.registerGroupChildren(GROUP_KEY, threeLoadedChildren);
            await waitForBatchedUpdatesWithAct();
        });

        // When a shift+click covers the first two children and a second one shrinks the range back to the first
        await act(async () => {
            result.current.toggle(secondChild, undefined, true);
            await waitForBatchedUpdatesWithAct();
        });
        await act(async () => {
            result.current.toggle(firstChild, undefined, true);
            await waitForBatchedUpdatesWithAct();
        });

        // Then only the clicked child survives, rather than the third child hanging on because no range ever covered it
        expect(result.current.selectedTransactions[GROUP_KEY]).toBeUndefined();
        expect(result.current.selectedTransactions['1']?.isSelected).toBe(true);
        expect(result.current.selectedTransactions['2']).toBeUndefined();
        expect(result.current.selectedTransactions['5']).toBeUndefined();
    });

    it('drops the group entry when a range covers every child, rather than holding both', async () => {
        const {result} = renderSelection();
        const [, secondChild] = loadedChildren;

        // Given a group selected while it was still collapsed, whose children have since loaded and been registered
        await act(async () => {
            result.current.toggle(categoryGroup, []);
            result.current.registerGroupChildren(GROUP_KEY, loadedChildren);
            await waitForBatchedUpdatesWithAct();
        });

        // When one shift+click covers the whole group, so nothing is deselected
        await act(async () => {
            result.current.toggle(secondChild, undefined, true);
            await waitForBatchedUpdatesWithAct();
        });

        // Then the selection is the children alone, not the children plus the group they were already selected through
        expect(result.current.selectedTransactions[GROUP_KEY]).toBeUndefined();
        expect(Object.keys(result.current.selectedTransactions)).toEqual(['1', '2']);
    });

    it('keeps a group selected as a whole while its rows are still paging in', async () => {
        const {result} = renderSelection(PartiallyLoadedWrapper);
        const [firstChild] = loadedChildren;

        // Given a group of five selected while collapsed, of which only two rows have loaded so far
        await act(async () => {
            result.current.toggle(partiallyLoadedGroup, []);
            result.current.registerGroupChildren(GROUP_KEY, loadedChildren);
            await waitForBatchedUpdatesWithAct();
        });
        expect(result.current.selectedTransactions[GROUP_KEY]?.isSelected).toBe(true);

        // When one of the loaded rows is clicked, which would otherwise write the group out as just those two
        await act(async () => {
            result.current.toggle(firstChild);
            await waitForBatchedUpdatesWithAct();
        });

        // Then the group stays selected as a whole, rather than silently dropping the three rows that never arrived
        expect(result.current.selectedTransactions[GROUP_KEY]?.isSelected).toBe(true);
    });

    it('anchors in the group just selected, not at a row selected earlier in another group', async () => {
        const {result} = renderSelection(TwoGroupWrapper);
        const [earlierFirstChild] = earlierChildren;
        const [, secondChild] = loadedChildren;

        // Given a child selected in the group above, then the lower group selected while it was still collapsed
        await act(async () => {
            result.current.registerGroupChildren(EARLIER_GROUP_KEY, earlierChildren);
            result.current.toggle(earlierFirstChild);
            result.current.toggle(categoryGroup, []);
            await waitForBatchedUpdatesWithAct();
        });

        // When that group's children load and a shift+click lands on its second child
        await act(async () => {
            result.current.registerGroupChildren(GROUP_KEY, loadedChildren);
            await waitForBatchedUpdatesWithAct();
        });
        await act(async () => {
            result.current.toggle(secondChild, undefined, true);
            await waitForBatchedUpdatesWithAct();
        });

        // Then the range stays inside the group the user just selected, leaving the other group's second child alone
        expect(result.current.selectedTransactions['4']).toBeUndefined();
    });

    it('narrows a group selected while collapsed with a cached snapshot, whose children were stored individually', async () => {
        const {result} = renderSelection();
        const [firstChild] = loadedChildren;

        // Given the group selected while collapsed but already cached, so the header passes its children and they are stored one by one
        await act(async () => {
            result.current.toggle(categoryGroup, loadedChildren);
            await waitForBatchedUpdatesWithAct();
        });
        expect(result.current.selectedTransactions['2']?.isSelected).toBe(true);

        // When the group is re-expanded and a shift+click collapses the range onto the first child
        await act(async () => {
            result.current.registerGroupChildren(GROUP_KEY, loadedChildren);
            await waitForBatchedUpdatesWithAct();
        });
        await act(async () => {
            result.current.toggle(firstChild, undefined, true);
            await waitForBatchedUpdatesWithAct();
        });

        // Then the range narrows it, rather than the header's own rows counting as hand-picked and resisting the collapse
        expect(result.current.selectedTransactions['1']?.isSelected).toBe(true);
        expect(result.current.selectedTransactions['2']).toBeUndefined();
    });

    it('never records a whole group as excluded when a range narrows under select-all-matching', async () => {
        const {result} = renderSelection(TwoGroupWrapper);
        const [firstChild, secondChild] = loadedChildren;

        const [earlierFirstChild] = earlierChildren;

        // Given a range that covers every row, and every matching item selected
        await act(async () => {
            result.current.registerGroupChildren(EARLIER_GROUP_KEY, earlierChildren);
            result.current.registerGroupChildren(GROUP_KEY, loadedChildren);
            result.current.toggle(earlierFirstChild);
            await waitForBatchedUpdatesWithAct();
        });
        await act(async () => {
            result.current.toggle(secondChild, undefined, true);
            result.current.selectAllMatchingItems(true);
            await waitForBatchedUpdatesWithAct();
        });
        expect(result.current.areAllMatchingItemsSelected).toBe(true);

        // When a shift+click shrinks that range so the last rows fall out of it
        await act(async () => {
            result.current.toggle(firstChild, undefined, true);
            await waitForBatchedUpdatesWithAct();
        });

        // Then no group is written off as excluded, which would drop every one of its rows from a bulk action
        expect(Object.keys(result.current.excludedTransactions)).not.toContain(GROUP_KEY);
        expect(Object.keys(result.current.excludedTransactions)).not.toContain(EARLIER_GROUP_KEY);
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

    it('refreshes an excluded expense when its live row changes', async () => {
        const {result, rerender} = renderFlatSelection();
        await excludeFlatExpense(result);
        expect(result.current.excludedTransactions[FLAT_TRANSACTION_ID]?.groupAmount).toBe(-3000);

        flatExpense = makeFlatExpense(-5000);
        flatFilteredData = [flatExpense];
        flatSearchResults = makeFlatSearchResults(flatExpense);
        rerender({});
        await act(async () => waitForBatchedUpdatesWithAct());

        expect(result.current.excludedTransactions[FLAT_TRANSACTION_ID]?.groupAmount).toBe(-5000);
        expect(result.current.areAllMatchingItemsSelected).toBe(true);
    });

    it('prunes an excluded expense after it leaves the settled search results', async () => {
        const {result, rerender} = renderFlatSelection();
        await excludeFlatExpense(result);
        expect(result.current.excludedTransactions[FLAT_TRANSACTION_ID]).toBeDefined();

        flatFilteredData = [];
        flatSearchResults = makeFlatSearchResults(undefined);
        rerender({});
        await act(async () => waitForBatchedUpdatesWithAct());

        expect(result.current.excludedTransactions).toEqual({});
        expect(result.current.areAllMatchingItemsSelected).toBe(true);
    });
});
