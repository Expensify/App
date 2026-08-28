import {act, renderHook} from '@testing-library/react-native';

import {useSearchRowSelectionActions, useSearchSelectionActions, useSearchSelectionContext, useSearchShiftRangeGroups} from '@components/Search/SearchContext';
import {SearchContextProvider} from '@components/Search/SearchContextProvider';
import type {TransactionGroupListItemType, TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import SearchWriteActionsProvider from '@components/Search/SearchWriteActionsProvider';
import {isRowChecked, mapEmptyReportToSelectedEntry} from '@components/Search/selectionBuilders';

import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';

import type * as ReactNavigation from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import {buildCategoryGroup, buildReportGroup, buildTransactionRow} from '../../utils/collections/searchListItems';
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

/** The query the rows belong to. Everything scoped to one search is keyed on it. */
const SEARCH_HASH = 1;

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

/** The same group with its sub-snapshot cached, so it carries its first page while the rest are unloaded. */
const cachedPartialGroup = {...categoryGroup, count: 5, transactions: loadedChildren};

/** A search with every page in, which is what lets select-all-matching be turned off. */
const settledGroupedResults: SearchResults = {
    ...makeFlatSearchResults(undefined),
    search: {...makeFlatSearchResults(undefined).search, hasMoreResults: false},
};

/** The same group, in a search with every page in. */
function SettledGroupWrapper({children}: {children: React.ReactNode}) {
    return (
        <SearchContextProvider>
            <SearchWriteActionsProvider
                filteredData={[cachedPartialGroup]}
                renderedData={[cachedPartialGroup]}
                totalSelectableItemsCount={loadedChildren.length}
                searchResults={settledGroupedResults}
                searchHash={SEARCH_HASH}
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

const EARLIER_GROUP_KEY = 'Office';

/** A group rendered above `categoryGroup`. */
const earlierGroup = buildCategoryGroup(EARLIER_GROUP_KEY, [], buildSearchQueryJSON('type:expense category:Office'));

/** The earlier group's children, expanded and loaded. */
const earlierChildren = [buildChild(3, '3'), buildChild(4, '4')];

/** The same group as the list sees it: empty at first, carrying the loaded rows afterwards. */
let pagingGroup: TransactionGroupListItemType = partiallyLoadedGroup;

function PagingWrapper({children}: {children: React.ReactNode}) {
    return (
        <SearchContextProvider>
            <SearchWriteActionsProvider
                filteredData={[pagingGroup]}
                renderedData={[pagingGroup]}
                totalSelectableItemsCount={5}
                searchResults={undefined}
                searchHash={SEARCH_HASH}
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
                searchHash={SEARCH_HASH}
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

let groupedSearchResults: SearchResults | undefined;
let groupedSearchHash = SEARCH_HASH;

/** The same group under a search that can change identity, for the rows a registry must not carry across searches. */
function SearchChangeWrapper({children}: {children: React.ReactNode}) {
    return (
        <SearchContextProvider>
            <SearchWriteActionsProvider
                filteredData={[categoryGroup]}
                renderedData={[categoryGroup]}
                totalSelectableItemsCount={2}
                searchResults={groupedSearchResults}
                searchHash={groupedSearchHash}
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

function Wrapper({children}: {children: React.ReactNode}) {
    return (
        <SearchContextProvider>
            <SearchWriteActionsProvider
                filteredData={[categoryGroup]}
                renderedData={[categoryGroup]}
                totalSelectableItemsCount={2}
                searchResults={undefined}
                searchHash={groupedSearchHash}
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
                searchHash={SEARCH_HASH}
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

/** Expense-report views make the report row the selectable unit, so a range spans reports. */
const reportGroups = [buildReportGroup(6, 'report-1', [buildChild(6, '6')]), buildReportGroup(7, 'report-2', [buildChild(7, '7')]), buildReportGroup(8, 'report-3', [])];

function ExpenseReportWrapper({children}: {children: React.ReactNode}) {
    return (
        <SearchContextProvider>
            <SearchWriteActionsProvider
                filteredData={reportGroups}
                renderedData={reportGroups}
                totalSelectableItemsCount={3}
                searchResults={undefined}
                searchHash={SEARCH_HASH}
                transactions={undefined}
                isMobileSelectionModeEnabled={false}
                type={CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT}
                areItemsGrouped
                isExpenseReportType
                isSearchResultsEmpty={false}
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
            ...useSearchShiftRangeGroups(),
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

/**
 * Every fixture that stands for the same group. A group's rows reach a range through the list itself, so making them
 * arrive means putting them on the group the wrapper under test renders.
 */
const groupFixturesByKey: Record<string, TransactionGroupListItemType[]> = {
    [GROUP_KEY]: [categoryGroup, partiallyLoadedGroup, cachedPartialGroup],
    [EARLIER_GROUP_KEY]: [earlierGroup],
};

/** The rows a group carries once its page has arrived. Mutated in place: the provider holds the fixture, not a copy of it. */
function carryRows(groupKey: string, children: TransactionListItemType[]) {
    for (const fixture of groupFixturesByKey[groupKey] ?? []) {
        fixture.transactions = children;
    }
}

function expandGroup(result: ReturnType<typeof renderSelection>['result'], groupKey: string, children: TransactionListItemType[]) {
    carryRows(groupKey, children);
    result.current.addGroupToRange(groupKey);
}

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
        groupedSearchResults = undefined;
        groupedSearchHash = SEARCH_HASH;
        // The fixtures are mutated as their pages arrive, so each test starts from the state its name describes.
        categoryGroup.transactions = [];
        earlierGroup.transactions = [];
        partiallyLoadedGroup.transactions = [];
        cachedPartialGroup.transactions = loadedChildren;
        pagingGroup = partiallyLoadedGroup;
        flatExpense = makeFlatExpense(-3000);
        flatFilteredData = [flatExpense];
        flatSearchResults = makeFlatSearchResults(flatExpense);
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    it('keeps the row actions stable when a group opens, so expanding one does not re-render every row', async () => {
        const {result} = renderSelection();
        const toggleBefore = result.current.toggle;
        const toggleAllBefore = result.current.toggleAll;

        // When a group opens, which changes the rows a range spans and the parent each belongs to
        await act(async () => {
            expandGroup(result, GROUP_KEY, loadedChildren);
            await waitForBatchedUpdatesWithAct();
        });

        // Then the actions every row holds are the same functions, since the write path reads that index at the gesture
        expect(result.current.toggle).toBe(toggleBefore);
        expect(result.current.toggleAll).toBe(toggleAllBefore);
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

        // Given Select All while the group still carries no rows, so the selection lands under its key
        await act(async () => {
            result.current.toggleAll();
            await waitForBatchedUpdatesWithAct();
        });
        expect(result.current.selectedTransactions[GROUP_KEY]?.isSelected).toBe(true);

        // When its rows arrive and a shift+click collapses the seeded range onto the first child
        await act(async () => {
            expandGroup(result, GROUP_KEY, loadedChildren);
            await waitForBatchedUpdatesWithAct();
        });
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
            expandGroup(result, GROUP_KEY, loadedChildren);
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
            expandGroup(result, GROUP_KEY, loadedChildren);
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
            expandGroup(result, EARLIER_GROUP_KEY, earlierChildren);
            result.current.toggle(categoryGroup, []);
            expandGroup(result, GROUP_KEY, loadedChildren);
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
            expandGroup(result, GROUP_KEY, threeLoadedChildren);
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
            expandGroup(result, GROUP_KEY, loadedChildren);
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

    it('stops marking a group as covering the rows a range left on the far side of the anchor', async () => {
        const {result} = renderSelection(TwoGroupWrapper);
        const [earlierFirstChild] = earlierChildren;
        const [, secondChild] = loadedChildren;

        // Given the lower group selected from its header, so both of its rows are marked as covered by the group
        await act(async () => {
            expandGroup(result, EARLIER_GROUP_KEY, earlierChildren);
            expandGroup(result, GROUP_KEY, loadedChildren);
            await waitForBatchedUpdatesWithAct();
        });
        await act(async () => {
            result.current.toggle(categoryGroup, loadedChildren);
            await waitForBatchedUpdatesWithAct();
        });
        expect(result.current.selectedTransactions[secondChild.keyForList]?.isSelectedViaGroup).toBe(true);

        // When a shift+click reaches up into the group above, so the block's second row is left on the far side of the anchor
        await act(async () => {
            result.current.toggle(earlierFirstChild, undefined, true);
            await waitForBatchedUpdatesWithAct();
        });
        expect(result.current.selectedTransactions[secondChild.keyForList]?.isSelected).toBe(true);

        // Then that row stops claiming its group covers it, or an export would send a whole-group filter and reach every row in it
        expect(result.current.selectedTransactions[secondChild.keyForList]?.isSelectedViaGroup).toBeFalsy();
    });

    it('writes a group out into the rows that arrived when one of them is clicked, rather than refusing the click', async () => {
        const {result, rerender} = renderSelection(PagingWrapper);
        const [firstChild, secondChild] = loadedChildren;

        // Given a group of five selected while collapsed, so the selection is held under its key
        await act(async () => {
            result.current.toggle(pagingGroup, []);
            await waitForBatchedUpdatesWithAct();
        });
        expect(result.current.selectedTransactions[GROUP_KEY]?.isSelected).toBe(true);

        // When its first page arrives and one of those rows is clicked
        pagingGroup = cachedPartialGroup;
        rerender({});
        await act(async () => {
            expandGroup(result, GROUP_KEY, loadedChildren);
            await waitForBatchedUpdatesWithAct();
        });
        await act(async () => {
            result.current.toggle(firstChild);
            await waitForBatchedUpdatesWithAct();
        });

        // Then the click lands: the rows that arrived carry the selection and the clicked one is out of it
        expect(result.current.selectedTransactions[GROUP_KEY]).toBeUndefined();
        expect(result.current.selectedTransactions[firstChild.keyForList]).toBeUndefined();
        expect(result.current.selectedTransactions[secondChild.keyForList]?.isSelected).toBe(true);
    });

    it('unchecks a child of a group selected while collapsed, once that group’s first page reaches the list', async () => {
        pagingGroup = partiallyLoadedGroup;
        const {result, rerender} = renderSelection(PagingWrapper);
        const [firstChild] = loadedChildren;

        // Given a group of five selected while collapsed, so the selection is held under its own key
        await act(async () => {
            result.current.toggle(pagingGroup, []);
            await waitForBatchedUpdatesWithAct();
        });
        expect(result.current.selectedTransactions[GROUP_KEY]?.isSelected).toBe(true);

        // When its first page arrives, which is the same commit that makes those rows clickable
        pagingGroup = cachedPartialGroup;
        rerender({});
        await act(async () => {
            expandGroup(result, GROUP_KEY, loadedChildren);
            await waitForBatchedUpdatesWithAct();
        });

        // Then the group has been written out into the rows that arrived, rather than staying an unnameable block
        expect(result.current.selectedTransactions[GROUP_KEY]).toBeUndefined();
        expect(result.current.selectedTransactions[firstChild.keyForList]?.isSelected).toBe(true);

        // And clicking one of them unchecks it, rather than the paging refusal making the checkbox dead
        await act(async () => {
            result.current.toggle(firstChild);
            await waitForBatchedUpdatesWithAct();
        });
        expect(result.current.selectedTransactions[firstChild.keyForList]).toBeUndefined();
    });

    it('narrows a group that is still paging in down to the rows a range keeps', async () => {
        const {result, rerender} = renderSelection(PagingWrapper);
        const [firstChild, secondChild] = loadedChildren;

        // Given a group of five selected while collapsed, whose first page has since arrived
        await act(async () => {
            result.current.toggle(pagingGroup, []);
            await waitForBatchedUpdatesWithAct();
        });
        pagingGroup = cachedPartialGroup;
        rerender({});
        await act(async () => {
            expandGroup(result, GROUP_KEY, loadedChildren);
            await waitForBatchedUpdatesWithAct();
        });

        // When a range is drawn across the loaded rows and then pulled back onto the first
        await act(async () => {
            result.current.toggle(secondChild, undefined, true);
            await waitForBatchedUpdatesWithAct();
        });
        await act(async () => {
            result.current.toggle(firstChild, undefined, true);
            await waitForBatchedUpdatesWithAct();
        });

        // Then the range gives back the row it no longer covers, the same as it would in a group with nothing left to page in
        expect(result.current.selectedTransactions[firstChild.keyForList]?.isSelected).toBe(true);
        expect(result.current.selectedTransactions[secondChild.keyForList]).toBeUndefined();
    });

    it('anchors in the group just selected, not at a row selected earlier in another group', async () => {
        const {result} = renderSelection(TwoGroupWrapper);
        const [earlierFirstChild] = earlierChildren;
        const [, secondChild] = loadedChildren;

        // Given a child selected in the group above, then the lower group selected while it was still collapsed
        await act(async () => {
            expandGroup(result, EARLIER_GROUP_KEY, earlierChildren);
            result.current.toggle(earlierFirstChild);
            result.current.toggle(categoryGroup, []);
            await waitForBatchedUpdatesWithAct();
        });

        // When that group's children load and a shift+click lands on its second child
        await act(async () => {
            expandGroup(result, GROUP_KEY, loadedChildren);
            await waitForBatchedUpdatesWithAct();
        });
        await act(async () => {
            result.current.toggle(secondChild, undefined, true);
            await waitForBatchedUpdatesWithAct();
        });

        // Then the range stays inside the group the user just selected, leaving the other group's second child alone
        expect(result.current.selectedTransactions['4']).toBeUndefined();
    });

    it('leaves another group’s rows alone when the block seeded for the next shift+click never loaded', async () => {
        const {result} = renderSelection(TwoGroupWrapper);
        const [earlierFirstChild] = earlierChildren;

        // Given the group above selected as a block, then the group below selected while it was still collapsed
        await act(async () => {
            expandGroup(result, EARLIER_GROUP_KEY, earlierChildren);
            result.current.toggle(earlierGroup, earlierChildren);
            result.current.toggle(categoryGroup, []);
            await waitForBatchedUpdatesWithAct();
        });
        expect(result.current.selectedTransactions['4']?.isSelected).toBe(true);

        // When a shift+click lands in the group above, with nothing of the seeded block on screen for it to narrow
        await act(async () => {
            result.current.toggle(earlierFirstChild, undefined, true);
            await waitForBatchedUpdatesWithAct();
        });

        // Then it starts a range at the row it landed on, rather than collapsing a block it was never pointed at
        expect(result.current.selectedTransactions['4']?.isSelected).toBe(true);
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
            expandGroup(result, GROUP_KEY, loadedChildren);
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
            expandGroup(result, EARLIER_GROUP_KEY, earlierChildren);
            expandGroup(result, GROUP_KEY, loadedChildren);
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

    it('forgets a block held for the next shift+click once an ordinary click starts a session of its own', async () => {
        const {result} = renderSelection(TwoGroupWrapper);
        const [earlierFirstChild] = earlierChildren;
        const [, secondChild] = loadedChildren;

        // Given a group clicked while its children were still unknown, which holds the block for the next shift+click
        await act(async () => {
            result.current.toggle(categoryGroup, []);
            expandGroup(result, GROUP_KEY, loadedChildren);
            expandGroup(result, EARLIER_GROUP_KEY, earlierChildren);
            await waitForBatchedUpdatesWithAct();
        });

        // When an ordinary click lands elsewhere first, and only then a shift+click
        await act(async () => {
            result.current.toggle(earlierFirstChild);
            await waitForBatchedUpdatesWithAct();
        });
        await act(async () => {
            result.current.toggle(secondChild, undefined, true);
            await waitForBatchedUpdatesWithAct();
        });

        // Then the range runs from the row just clicked, rather than the stale block resurrecting and collapsing onto it
        expect(result.current.selectedTransactions['3']?.isSelected).toBe(true);
        expect(result.current.selectedTransactions['4']?.isSelected).toBe(true);
        expect(result.current.selectedTransactions['1']?.isSelected).toBe(true);
    });

    it('selects every report a range covers in an expense-report view', async () => {
        const {result} = renderSelection(ExpenseReportWrapper);
        const [firstReport, secondReport] = reportGroups;

        // Given the first report clicked, then a shift+click on the second
        await act(async () => {
            result.current.toggle(firstReport, firstReport.transactions);
            await waitForBatchedUpdatesWithAct();
        });
        await act(async () => {
            result.current.toggle(secondReport, secondReport.transactions, true);
            await waitForBatchedUpdatesWithAct();
        });

        // Then both reports are selected through their child transactions, which is where a report row keeps its selection
        expect(result.current.selectedTransactions['6']?.isSelected).toBe(true);
        expect(result.current.selectedTransactions['7']?.isSelected).toBe(true);
        // And each row records the report it came in with, the same way clicking the report row records it
        expect(result.current.selectedTransactions['7']?.groupKey).toBe(secondReport.keyForList);
        expect(result.current.selectedTransactions['7']?.isSelectedViaGroup).toBe(true);
    });

    it('drops a report’s own entry when a range covers the rows that arrived under it', async () => {
        const {result} = renderSelection(ExpenseReportWrapper);
        const [firstReport] = reportGroups;

        // Given a report selected while it had no expenses of its own, whose expenses have since arrived
        await act(async () => {
            const [reportKey, reportEntry] = mapEmptyReportToSelectedEntry(firstReport);
            result.current.setSelectedTransactions({[reportKey]: reportEntry});
            await waitForBatchedUpdatesWithAct();
        });

        // When a range covers that report row
        await act(async () => {
            result.current.toggle(firstReport, firstReport.transactions, true);
            await waitForBatchedUpdatesWithAct();
        });

        // Then its rows carry the selection and the report's own entry goes, rather than the two being counted separately
        expect(result.current.selectedTransactions['6']?.isSelected).toBe(true);
        expect(result.current.selectedTransactions[firstReport.keyForList]).toBeUndefined();
    });

    it('gives back the reports a range no longer covers in an expense-report view', async () => {
        const {result} = renderSelection(ExpenseReportWrapper);
        const [firstReport, secondReport, emptyReport] = reportGroups;

        // Given a range stretched across all three reports
        await act(async () => {
            result.current.toggle(firstReport, firstReport.transactions);
            await waitForBatchedUpdatesWithAct();
        });
        await act(async () => {
            result.current.toggle(emptyReport, emptyReport.transactions, true);
            await waitForBatchedUpdatesWithAct();
        });
        expect(result.current.selectedTransactions['7']?.isSelected).toBe(true);

        // When a second shift+click pulls the range back to the second report
        await act(async () => {
            result.current.toggle(secondReport, secondReport.transactions, true);
            await waitForBatchedUpdatesWithAct();
        });

        // Then the report that fell out of the range is given back, rather than staying selected behind the range
        expect(result.current.selectedTransactions['6']?.isSelected).toBe(true);
        expect(result.current.selectedTransactions['7']?.isSelected).toBe(true);
        expect(result.current.selectedTransactions['report-3']).toBeUndefined();
    });

    it('keeps the remaining children selected when the data refreshes after a group is written out', async () => {
        const {result, rerender} = renderSelection();
        const [firstChild] = loadedChildren;

        // Given a group selected while collapsed, its children since published, and one of them unchecked
        await act(async () => {
            result.current.toggle(categoryGroup, []);
            expandGroup(result, GROUP_KEY, loadedChildren);
            await waitForBatchedUpdatesWithAct();
        });
        await act(async () => {
            result.current.toggle(firstChild);
            await waitForBatchedUpdatesWithAct();
        });
        expect(result.current.selectedTransactions['2']?.isSelected).toBe(true);

        // When a data push re-runs the reconcile
        rerender({});
        await act(async () => waitForBatchedUpdatesWithAct());

        // Then the child that is still selected survives it
        expect(result.current.selectedTransactions['2']?.isSelected).toBe(true);
    });

    it('commits nothing when a shift+click re-covers the rows it already holds', async () => {
        const {result} = renderSelection();
        const [firstChild, secondChild] = loadedChildren;

        // Given a range already covering both of a group's rows
        await act(async () => {
            expandGroup(result, GROUP_KEY, loadedChildren);
            await waitForBatchedUpdatesWithAct();
        });
        await act(async () => {
            result.current.toggle(firstChild);
            await waitForBatchedUpdatesWithAct();
        });
        await act(async () => {
            result.current.toggle(secondChild, undefined, true);
            await waitForBatchedUpdatesWithAct();
        });
        const selectionAfterRange = result.current.selectedTransactions;

        // When the same endpoint is shift+clicked again, so every row it covers is already selected the same way
        await act(async () => {
            result.current.toggle(secondChild, undefined, true);
            await waitForBatchedUpdatesWithAct();
        });

        // Then the selection is the same object, so the commit bails and no row re-renders
        expect(result.current.selectedTransactions).toBe(selectionAfterRange);
    });

    it('never anchors a cold shift+click on a row the user unchecked', async () => {
        const {result, rerender} = renderSelection();
        const [firstChild, , thirdChild] = threeLoadedChildren;

        // Given a group covered by select-all-matching with its first child taken back out
        await act(async () => {
            result.current.selectAllMatchingItems(true);
            expandGroup(result, GROUP_KEY, threeLoadedChildren);
            await waitForBatchedUpdatesWithAct();
        });
        await act(async () => {
            result.current.toggle(firstChild);
            await waitForBatchedUpdatesWithAct();
        });
        expect(result.current.excludedTransactions[firstChild.keyForList]).toBeDefined();

        // And no session left to continue, since the query changed after that click
        groupedSearchHash = SEARCH_HASH + 1;
        rerender({});
        await act(async () => {
            expandGroup(result, GROUP_KEY, threeLoadedChildren);
            await waitForBatchedUpdatesWithAct();
        });

        // When the next gesture is a shift+click, so the anchor has to be resolved from the rows themselves
        await act(async () => {
            result.current.toggle(thirdChild, undefined, true);
            await waitForBatchedUpdatesWithAct();
        });

        // Then the range starts at the first row that reads as checked, rather than sweeping the unchecked row back in
        expect(result.current.excludedTransactions[firstChild.keyForList]).toBeDefined();
        expect(result.current.selectedTransactions[firstChild.keyForList]).toBeUndefined();
    });

    it('unchecks a group in one click when select-all-matching is what checked it', async () => {
        const {result} = renderSelection();
        const [firstChild, secondChild] = loadedChildren;

        // Given every matching item selected from the menu, so the group reads checked without a single entry behind it
        await act(async () => {
            result.current.selectAllMatchingItems(true);
            expandGroup(result, GROUP_KEY, loadedChildren);
            await waitForBatchedUpdatesWithAct();
        });

        // When the group's header checkbox is pressed once
        await act(async () => {
            result.current.toggle(categoryGroup, loadedChildren);
            await waitForBatchedUpdatesWithAct();
        });

        // Then its rows stop reading as checked, rather than the click reading the group as unselected and selecting it again
        const isChecked = (rowKey: string) =>
            isRowChecked({
                rowKey,
                parentGroupKey: GROUP_KEY,
                selectedTransactions: result.current.selectedTransactions,
                excludedTransactions: result.current.excludedTransactions,
                areAllMatchingItemsSelected: result.current.areAllMatchingItemsSelected,
            });
        expect(isChecked(firstChild.keyForList)).toBe(false);
        expect(isChecked(secondChild.keyForList)).toBe(false);
        // And each row is named, since the group carries all of them and nothing is left for its own key to stand for
        expect(result.current.excludedTransactions[firstChild.keyForList]).toBeDefined();
        expect(result.current.excludedTransactions[secondChild.keyForList]).toBeDefined();
    });

    it('unchecks a group holding none of its rows, when select-all-matching is what checked it', async () => {
        const {result} = renderSelection();

        // Given every matching item selected, and a group whose children have never loaded
        await act(async () => {
            result.current.selectAllMatchingItems(true);
            await waitForBatchedUpdatesWithAct();
        });

        // When its header checkbox is pressed once
        await act(async () => {
            result.current.toggle(categoryGroup, []);
            await waitForBatchedUpdatesWithAct();
        });

        // Then the group is recorded as excluded, rather than the click reading it as unselected and selecting it outright
        expect(result.current.excludedTransactions[GROUP_KEY]).toBeDefined();
        expect(result.current.selectedTransactions[GROUP_KEY]).toBeUndefined();
    });

    it('leaves the selection untouched when a group has no row it can select', async () => {
        const {result} = renderSelection();
        const [firstLoadedChild] = loadedChildren;
        const deletedChild = {...firstLoadedChild, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE};

        // Given a group whose only row is being deleted, so its checkbox reads unchecked with nothing to check
        await act(async () => {
            expandGroup(result, GROUP_KEY, [deletedChild]);
            await waitForBatchedUpdatesWithAct();
        });
        const before = result.current.selectedTransactions;

        // When its header is pressed
        await act(async () => {
            result.current.toggle(categoryGroup, [deletedChild]);
            await waitForBatchedUpdatesWithAct();
        });

        // Then the commit is skipped entirely, rather than replacing the map with an equal one and re-rendering every row
        expect(result.current.selectedTransactions).toBe(before);
    });

    it('turns select-all-matching off once every group has been unchecked', async () => {
        const {result} = renderSelection(SettledGroupWrapper);

        // Given every matching item selected in a grouped search of one group
        await act(async () => {
            result.current.selectAllMatchingItems(true);
            expandGroup(result, GROUP_KEY, loadedChildren);
            await waitForBatchedUpdatesWithAct();
        });
        expect(result.current.areAllMatchingItemsSelected).toBe(true);

        // When that group is unchecked, so nothing the search can select is left
        await act(async () => {
            result.current.toggle(cachedPartialGroup, loadedChildren);
            await waitForBatchedUpdatesWithAct();
        });

        // Then the flag goes off, rather than a footer advertising every match over a selection the user emptied
        expect(result.current.areAllMatchingItemsSelected).toBe(false);
    });

    it('records what a narrowing dropped, so keeping select-all-matching on cannot silently re-include it', async () => {
        const {result} = renderSelection();
        const [firstChild, secondChild] = loadedChildren;

        // Given a range across both children, with every matching item selected
        await act(async () => {
            expandGroup(result, GROUP_KEY, loadedChildren);
            result.current.toggle(firstChild);
            await waitForBatchedUpdatesWithAct();
        });
        await act(async () => {
            result.current.toggle(secondChild, undefined, true);
            result.current.selectAllMatchingItems(true);
            await waitForBatchedUpdatesWithAct();
        });

        // When a shift+click narrows that range back to the first child
        await act(async () => {
            result.current.toggle(firstChild, undefined, true);
            await waitForBatchedUpdatesWithAct();
        });

        // Then the flag stays on, which is correct only because the dropped row is recorded as excluded
        expect(result.current.areAllMatchingItemsSelected).toBe(true);
        expect(result.current.excludedTransactions['2']).toBeDefined();
        expect(result.current.selectedTransactions['1']?.isSelected).toBe(true);
    });

    it('treats a shift+click on a group header as an ordinary header click, reaching no group between it and the last one', async () => {
        const {result} = renderSelection();

        // Given two collapsed groups, where the headers are the only rows carrying a checkbox
        await act(async () => {
            result.current.toggle(earlierGroup, []);
            await waitForBatchedUpdatesWithAct();
        });
        expect(result.current.selectedTransactions[EARLIER_GROUP_KEY]?.isSelected).toBe(true);

        // When the second header is shift+clicked
        await act(async () => {
            result.current.toggle(categoryGroup, [], true);
            await waitForBatchedUpdatesWithAct();
        });

        // Then it selects itself and nothing spans between the two, which is what design settled on
        expect(result.current.selectedTransactions[GROUP_KEY]?.isSelected).toBe(true);
        expect(result.current.selectedTransactions[EARLIER_GROUP_KEY]?.isSelected).toBe(true);
        expect(Object.keys(result.current.selectedTransactions).sort()).toEqual([EARLIER_GROUP_KEY, GROUP_KEY].sort());
    });

    it('leaves a select-all-matching selection alone when a shift+click lands in it, since narrowing it would need exclusions for rows never on screen', async () => {
        const {result} = renderSelection();
        const [firstChild, secondChild] = loadedChildren;

        // Given every matching item selected from the menu, which the reconcile pass writes out as an entry per visible row
        await act(async () => {
            result.current.selectAllMatchingItems(true);
            expandGroup(result, GROUP_KEY, loadedChildren);
            await waitForBatchedUpdatesWithAct();
        });

        // When a shift+click lands on the first row
        await act(async () => {
            result.current.toggle(firstChild, undefined, true);
            await waitForBatchedUpdatesWithAct();
        });

        // Then both rows stay checked: those entries carry no group, so they read as hand-picked and a range may not take them back
        const isChecked = (rowKey: string) =>
            isRowChecked({
                rowKey,
                parentGroupKey: GROUP_KEY,
                selectedTransactions: result.current.selectedTransactions,
                excludedTransactions: result.current.excludedTransactions,
                areAllMatchingItemsSelected: result.current.areAllMatchingItemsSelected,
            });
        expect(isChecked(firstChild.keyForList)).toBe(true);
        expect(isChecked(secondChild.keyForList)).toBe(true);
    });

    it('turns select-all-matching off when the header checkbox clears the selection', async () => {
        const {result} = renderFlatSelection();

        // Given every matching item selected
        await act(async () => {
            result.current.toggleAll();
            result.current.selectAllMatchingItems(true);
            await waitForBatchedUpdatesWithAct();
        });
        expect(result.current.areAllMatchingItemsSelected).toBe(true);

        // When the header checkbox is pressed again to clear everything
        await act(async () => {
            result.current.toggleAll();
            await waitForBatchedUpdatesWithAct();
        });

        // Then nothing is selected any more, rather than every unloaded match staying selected behind an empty page
        expect(result.current.areAllMatchingItemsSelected).toBe(false);
        expect(result.current.excludedTransactions).toEqual({});
    });

    it('drops a group’s published rows when the search changes, so a range cannot reach the previous results', async () => {
        groupedSearchResults = makeFlatSearchResults(undefined);
        const {result, rerender} = renderSelection(SearchChangeWrapper);
        const [, secondChild] = loadedChildren;

        // Given a group open with its rows published under one search
        await act(async () => {
            expandGroup(result, GROUP_KEY, loadedChildren);
            await waitForBatchedUpdatesWithAct();
        });

        // When the search changes and the group has not published anything yet under the new one
        groupedSearchHash = SEARCH_HASH + 1;
        rerender({});
        await act(async () => waitForBatchedUpdatesWithAct());

        // Then a shift+click reaches only the row it landed on, rather than sweeping in rows that belonged to the previous search
        await act(async () => {
            result.current.toggle(secondChild, undefined, true);
            await waitForBatchedUpdatesWithAct();
        });
        expect(result.current.selectedTransactions['2']?.isSelected).toBe(true);
        expect(result.current.selectedTransactions['1']).toBeUndefined();
    });

    it('starts a cold session when the search changes, so an old span cannot collapse rows in the new results', async () => {
        groupedSearchResults = makeFlatSearchResults(undefined);
        const {result, rerender} = renderSelection(SearchChangeWrapper);
        const [firstChild, secondChild] = loadedChildren;

        // Given a range painted across both children under one search
        await act(async () => {
            expandGroup(result, GROUP_KEY, loadedChildren);
            await waitForBatchedUpdatesWithAct();
        });
        await act(async () => {
            result.current.toggle(firstChild);
            await waitForBatchedUpdatesWithAct();
        });
        await act(async () => {
            result.current.toggle(secondChild, undefined, true);
            await waitForBatchedUpdatesWithAct();
        });
        expect(result.current.selectedTransactions['2']?.isSelected).toBe(true);

        // When the query changes and the same rows come back, since a transaction can match both searches
        groupedSearchHash = SEARCH_HASH + 1;
        rerender({});
        await act(async () => {
            expandGroup(result, GROUP_KEY, loadedChildren);
            await waitForBatchedUpdatesWithAct();
        });

        // Then a shift+click starts fresh rather than continuing the previous search's span and collapsing the row that fell out of it
        await act(async () => {
            result.current.toggle(firstChild, undefined, true);
            await waitForBatchedUpdatesWithAct();
        });
        expect(result.current.selectedTransactions['2']?.isSelected).toBe(true);
    });

    it('drops a group’s rows from ranges once they are gone, rather than ranging over transactions that no longer exist', async () => {
        const {result, rerender} = renderSelection();
        const [firstChild, , thirdChild] = threeLoadedChildren;

        // Given a group carrying its rows, and open
        await act(async () => {
            expandGroup(result, GROUP_KEY, threeLoadedChildren);
            await waitForBatchedUpdatesWithAct();
        });

        // When every one of its transactions goes away, so the group carries none
        carryRows(GROUP_KEY, []);
        rerender({});
        await act(async () => waitForBatchedUpdatesWithAct());

        // Then a range reaches none of them, rather than writing selections for rows that are no longer there
        await act(async () => {
            result.current.toggle(firstChild);
            await waitForBatchedUpdatesWithAct();
        });
        await act(async () => {
            result.current.toggle(thirdChild, undefined, true);
            await waitForBatchedUpdatesWithAct();
        });
        expect(result.current.selectedTransactions['2']).toBeUndefined();
    });

    it('still ranges a group reopened before its rows were published again', async () => {
        const {result} = renderSelection();
        const [firstChild, secondChild] = loadedChildren;

        // Given a group whose children loaded, then collapsed and reopened without the row republishing them
        await act(async () => {
            expandGroup(result, GROUP_KEY, loadedChildren);
            await waitForBatchedUpdatesWithAct();
        });
        await act(async () => {
            result.current.removeGroupFromRange(GROUP_KEY);
            await waitForBatchedUpdatesWithAct();
        });
        await act(async () => {
            result.current.addGroupToRange(GROUP_KEY);
            await waitForBatchedUpdatesWithAct();
        });

        // When a range runs across its rows
        await act(async () => {
            result.current.toggle(firstChild);
            await waitForBatchedUpdatesWithAct();
        });
        await act(async () => {
            result.current.toggle(secondChild, undefined, true);
            await waitForBatchedUpdatesWithAct();
        });

        // Then they are still reachable, because closing a group drops only its openness and not the rows it had published
        expect(result.current.selectedTransactions['1']?.isSelected).toBe(true);
        expect(result.current.selectedTransactions['2']?.isSelected).toBe(true);
    });

    it('selects a report with no expenses of its own when a range reaches it', async () => {
        const {result} = renderSelection(ExpenseReportWrapper);
        const [firstReport, , emptyReport] = reportGroups;

        // When a range stretches from the first report onto one that carries no expenses
        await act(async () => {
            result.current.toggle(firstReport, firstReport.transactions);
            await waitForBatchedUpdatesWithAct();
        });
        await act(async () => {
            result.current.toggle(emptyReport, emptyReport.transactions, true);
            await waitForBatchedUpdatesWithAct();
        });

        // Then it is selected under its own key, which is the only key an empty report has
        expect(result.current.selectedTransactions['report-3']?.isSelected).toBe(true);
    });
});
