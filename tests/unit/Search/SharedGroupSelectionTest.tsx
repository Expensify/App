import {act, renderHook} from '@testing-library/react-native';

import {useSearchRowSelectionActions, useSearchSelectionActions, useSearchSelectionContext} from '@components/Search/SearchContext';
import {SearchContextProvider} from '@components/Search/SearchContextProvider';
import type {TransactionCategoryGroupListItemType, TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import SearchWriteActionsProvider from '@components/Search/SearchWriteActionsProvider';
import {getGroupCheckboxState} from '@components/Search/selectionBuilders';
import type {SelectedTransactions} from '@components/Search/types';

import {getGroupKeysSelectedViaGroup} from '@hooks/useSearchBulkActions';

import type {SearchGroupKey} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';

import type * as ReactNavigation from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import {buildCategoryGroup, buildTransactionRow} from '../../utils/collections/searchListItems';
import createMock from '../../utils/createMock';
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

const MISSING_CATEGORY_KEY: SearchGroupKey = `${CONST.SEARCH.GROUP_PREFIX}${CONST.VIOLATIONS.MISSING_CATEGORY}`;
const OVER_LIMIT_KEY: SearchGroupKey = `${CONST.SEARCH.GROUP_PREFIX}${CONST.VIOLATIONS.OVER_LIMIT}`;

/** A row as a group lists it once expanded. Both groups list the same expenses under the same keys, as violation groups do. */
const buildRow = (index: number, selectionGroupKey: string) => buildTransactionRow(index, String(index), {currency: 'USD', amount: -100, report: {reportID: '11'}, selectionGroupKey});

/** Missing category holds four expenses, and only its first page of two has loaded. */
let missingCategoryGroup: TransactionCategoryGroupListItemType;

/** Over limit holds two expenses, the same two Missing category shows on its first page. */
let overLimitGroup: TransactionCategoryGroupListItemType;

function buildGroups(overLimitRows: TransactionListItemType[]) {
    missingCategoryGroup = {
        ...buildCategoryGroup(MISSING_CATEGORY_KEY, [buildRow(1, MISSING_CATEGORY_KEY), buildRow(2, MISSING_CATEGORY_KEY)]),
        count: 4,
        hasMoreTransactions: true,
    };
    overLimitGroup = {...buildCategoryGroup(OVER_LIMIT_KEY, overLimitRows), count: 2, hasMoreTransactions: overLimitRows.length === 0 ? undefined : false};
}

/** Whether the search still returns each group, which a refresh can drop once its expenses no longer carry the violation. */
let hasOverLimitGroup = true;
let hasMissingCategoryGroup = true;

function SharedGroupsWrapper({children}: {children: React.ReactNode}) {
    const groups = [...(hasMissingCategoryGroup ? [missingCategoryGroup] : []), ...(hasOverLimitGroup ? [overLimitGroup] : [])];
    const data: SearchResults['data'] = {};
    if (hasMissingCategoryGroup) {
        data[MISSING_CATEGORY_KEY] = {violation: CONST.VIOLATIONS.MISSING_CATEGORY, count: 4, total: -400, currency: 'USD'};
    }
    if (hasOverLimitGroup) {
        data[OVER_LIMIT_KEY] = {violation: CONST.VIOLATIONS.OVER_LIMIT, count: 2, total: -200, currency: 'USD'};
    }
    const searchResults = createMock<SearchResults>({data});
    return (
        <SearchContextProvider>
            <SearchWriteActionsProvider
                filteredData={groups}
                renderedData={groups}
                totalSelectableItemsCount={4}
                searchResults={searchResults}
                searchHash={1}
                transactions={undefined}
                isMobileSelectionModeEnabled={false}
                type={CONST.SEARCH.DATA_TYPES.EXPENSE}
                areItemsGrouped
                isExpenseReportType={false}
                doGroupsShareExpenses
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
        {wrapper: SharedGroupsWrapper},
    );

/** Opens Over limit, whose rows arrive as the same expenses Missing category already lists. */
function loadOverLimitRows(rerender: ReturnType<typeof renderSelection>['rerender']) {
    buildGroups([buildRow(1, OVER_LIMIT_KEY), buildRow(2, OVER_LIMIT_KEY)]);
    rerender({});
}

/**
 * Checks Over limit while it is collapsed, then Missing category over the two expenses they share, then expands Over limit.
 * Over limit is checked first because once Missing category covers its expenses its header reads as checked already.
 */
async function checkBothGroups(result: ReturnType<typeof renderSelection>['result'], rerender: ReturnType<typeof renderSelection>['rerender']) {
    await act(async () => {
        result.current.toggle(overLimitGroup, []);
        await waitForBatchedUpdatesWithAct();
    });
    await act(async () => {
        result.current.toggle(missingCategoryGroup, missingCategoryGroup.transactions);
        await waitForBatchedUpdatesWithAct();
    });
    loadOverLimitRows(rerender);
    await act(async () => waitForBatchedUpdatesWithAct());
}

/** Whether a group's header checkbox shows as checked for the given selection. */
function isGroupChecked(selectedTransactions: SelectedTransactions, group: TransactionCategoryGroupListItemType) {
    return getGroupCheckboxState({
        groupKey: group.keyForList,
        children: group.transactions,
        selectedTransactions,
        excludedTransactions: {},
        areAllMatchingItemsSelected: false,
        groupCount: group.count,
    }).isSelectAllChecked;
}

describe('Selecting groups that share expenses', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(async () => {
        buildGroups([]);
        hasOverLimitGroup = true;
        hasMissingCategoryGroup = true;
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    it('keeps a group wholly selected when another group loads the same expenses', async () => {
        // Given Missing category checked through its header, with two of its four expenses loaded
        const {result, rerender} = renderSelection();
        await act(async () => {
            result.current.toggle(missingCategoryGroup, missingCategoryGroup.transactions);
            await waitForBatchedUpdatesWithAct();
        });

        // When Over limit is expanded and lists those same two expenses
        loadOverLimitRows(rerender);
        await act(async () => waitForBatchedUpdatesWithAct());

        // Then the rows stay claimed by Missing category, so an export still covers its two unloaded expenses
        expect(result.current.selectedTransactions['1']).toEqual(expect.objectContaining({groupKey: MISSING_CATEGORY_KEY, isSelectedViaGroup: true}));
        expect(result.current.selectedTransactions['2']).toEqual(expect.objectContaining({groupKey: MISSING_CATEGORY_KEY, isSelectedViaGroup: true}));
        expect(getGroupKeysSelectedViaGroup(result.current.selectedTransactions)).toEqual([MISSING_CATEGORY_KEY]);
    });

    it('keeps both groups selected when both headers check the expenses they share', async () => {
        // Given Over limit checked while collapsed, and Missing category checked over the two expenses they share
        const {result, rerender} = renderSelection();
        await checkBothGroups(result, rerender);

        // When the data refreshes afterwards
        rerender({});
        await act(async () => waitForBatchedUpdatesWithAct());

        // Then both groups still stand for every expense in them, though each shared row is stored under one group
        expect(result.current.selectedTransactions['1']).toEqual(
            expect.objectContaining({groupKey: MISSING_CATEGORY_KEY, isSelectedViaGroup: true, otherClaimedGroupKeys: [OVER_LIMIT_KEY]}),
        );
        expect(getGroupKeysSelectedViaGroup(result.current.selectedTransactions).sort()).toEqual([MISSING_CATEGORY_KEY, OVER_LIMIT_KEY].sort());
    });

    it('stops counting a group as wholly selected once one of its expenses is unchecked under another group', async () => {
        // Given Over limit expanded with both its expenses loaded and checked through its header, so its rows read as the whole group
        buildGroups([buildRow(1, OVER_LIMIT_KEY), buildRow(2, OVER_LIMIT_KEY)]);
        const {result} = renderSelection();
        await act(async () => {
            result.current.toggle(overLimitGroup, overLimitGroup.transactions);
            await waitForBatchedUpdatesWithAct();
        });
        expect(result.current.selectedTransactions['2']).toEqual(expect.objectContaining({groupKey: OVER_LIMIT_KEY, isEntireGroupSelected: true}));
        const [sharedRow] = missingCategoryGroup.transactions;
        if (!sharedRow) {
            throw new Error('Expected Missing category to list the shared expenses');
        }

        // When one shared expense is unchecked under Missing category
        await act(async () => {
            result.current.toggle(sharedRow);
            await waitForBatchedUpdatesWithAct();
        });

        // Then the expense left in Over limit no longer reads as the whole group, so deleting it can't hide a group that still holds the unchecked one
        expect(result.current.selectedTransactions['1']).toBeUndefined();
        expect(result.current.selectedTransactions['2']).toEqual(expect.objectContaining({isSelected: true, groupKey: OVER_LIMIT_KEY}));
        expect(result.current.selectedTransactions['2']?.isEntireGroupSelected).toBe(false);
    });

    it('ends the claim of a group on every shared expense once a new expense joins it, including expenses no longer on its page', async () => {
        // Given both groups checked through their headers over the expenses they share
        const {result, rerender} = renderSelection();
        await checkBothGroups(result, rerender);

        // When a refresh of Over limit's first page brings a new, unchecked expense and no longer shows the second shared expense
        overLimitGroup = {...buildCategoryGroup(OVER_LIMIT_KEY, [buildRow(1, OVER_LIMIT_KEY), buildRow(3, OVER_LIMIT_KEY)]), count: 3, hasMoreTransactions: true};
        rerender({});
        await act(async () => waitForBatchedUpdatesWithAct());

        // Then neither shared expense claims Over limit any more, so an export and the union no longer take the whole group with the new expense in it
        expect(result.current.selectedTransactions['1']?.otherClaimedGroupKeys).toBeUndefined();
        expect(result.current.selectedTransactions['2']).toEqual(expect.objectContaining({isSelected: true, groupKey: MISSING_CATEGORY_KEY}));
        expect(result.current.selectedTransactions['2']?.otherClaimedGroupKeys).toBeUndefined();
        expect(result.current.selectedTransactions['3']).toBeUndefined();
        expect(getGroupKeysSelectedViaGroup(result.current.selectedTransactions)).toEqual([MISSING_CATEGORY_KEY]);
    });

    it('ends the claims of a group a refresh drops', async () => {
        // Given both groups checked through their headers over the expenses they share
        const {result, rerender} = renderSelection();
        await checkBothGroups(result, rerender);

        // When a refresh no longer returns Over limit, while Missing category still lists the shared expenses
        hasOverLimitGroup = false;
        rerender({});
        await act(async () => waitForBatchedUpdatesWithAct());

        // Then the expenses stay selected for Missing category only, so an export of the selected groups doesn't look for a group that's gone
        expect(result.current.selectedTransactions['1']).toEqual(expect.objectContaining({isSelected: true, groupKey: MISSING_CATEGORY_KEY, isSelectedViaGroup: true}));
        expect(result.current.selectedTransactions['1']?.otherClaimedGroupKeys).toBeUndefined();
        expect(getGroupKeysSelectedViaGroup(result.current.selectedTransactions)).toEqual([MISSING_CATEGORY_KEY]);
    });

    it('moves the shared expenses to the remaining group as checked through its header when a refresh drops the group they were stored under', async () => {
        // Given both groups checked through their headers, with the shared expenses stored under Missing category
        const {result, rerender} = renderSelection();
        await checkBothGroups(result, rerender);
        expect(result.current.selectedTransactions['1']).toEqual(expect.objectContaining({groupKey: MISSING_CATEGORY_KEY, otherClaimedGroupKeys: [OVER_LIMIT_KEY]}));

        // When a refresh no longer returns Missing category, while Over limit still lists the shared expenses
        hasMissingCategoryGroup = false;
        rerender({});
        await act(async () => waitForBatchedUpdatesWithAct());

        // Then the expenses move to Over limit as part of its header check, so it still reads as selected as a whole
        expect(result.current.selectedTransactions['1']).toEqual(expect.objectContaining({isSelected: true, groupKey: OVER_LIMIT_KEY, isSelectedViaGroup: true}));
        expect(result.current.selectedTransactions['1']?.otherClaimedGroupKeys).toBeUndefined();
        expect(getGroupKeysSelectedViaGroup(result.current.selectedTransactions)).toEqual([OVER_LIMIT_KEY]);
    });

    it('unchecks the shared expenses in both groups when one of the groups is unchecked', async () => {
        // Given both groups checked through their headers over the expenses they share
        const {result, rerender} = renderSelection();
        await checkBothGroups(result, rerender);

        // When Over limit's header is unchecked
        await act(async () => {
            result.current.toggle(overLimitGroup, overLimitGroup.transactions);
            await waitForBatchedUpdatesWithAct();
        });

        // Then the shared expenses are unchecked in Missing category too, since they are the same expenses, and Missing category's header
        // claim ends with them, so neither checkbox stays checked and the click is never a no-op
        expect(result.current.selectedTransactions['1']).toBeUndefined();
        expect(result.current.selectedTransactions['2']).toBeUndefined();
        expect(getGroupKeysSelectedViaGroup(result.current.selectedTransactions)).toEqual([]);
        expect(isGroupChecked(result.current.selectedTransactions, overLimitGroup)).toBe(false);
        expect(isGroupChecked(result.current.selectedTransactions, missingCategoryGroup)).toBe(false);
    });

    it('unchecks a group after Select all when all of its expenses are also in another group', async () => {
        // Given both groups expanded, so their rows are loaded, and every row checked through Select all
        const {result, rerender} = renderSelection();
        loadOverLimitRows(rerender);
        await act(async () => waitForBatchedUpdatesWithAct());
        await act(async () => {
            result.current.toggleAll();
            await waitForBatchedUpdatesWithAct();
        });
        expect(isGroupChecked(result.current.selectedTransactions, overLimitGroup)).toBe(true);

        // When Over limit's header is clicked, whose expenses Missing category lists as well
        await act(async () => {
            result.current.toggle(overLimitGroup, overLimitGroup.transactions);
            await waitForBatchedUpdatesWithAct();
        });

        // Then its checkbox unchecks, rather than staying checked because Missing category still covered its expenses
        expect(isGroupChecked(result.current.selectedTransactions, overLimitGroup)).toBe(false);
        expect(isGroupChecked(result.current.selectedTransactions, missingCategoryGroup)).toBe(false);
        expect(result.current.selectedTransactions['1']).toBeUndefined();
        expect(result.current.selectedTransactions['2']).toBeUndefined();
    });

    it('ends the claim of every group an unchecked expense sits in', async () => {
        // Given both groups checked through their headers over the expenses they share
        const {result, rerender} = renderSelection();
        await checkBothGroups(result, rerender);
        const [sharedRow] = overLimitGroup.transactions;
        if (!sharedRow) {
            throw new Error('Expected Over limit to list the shared expenses');
        }

        // When one shared expense is unchecked under Over limit
        await act(async () => {
            result.current.toggle(sharedRow);
            await waitForBatchedUpdatesWithAct();
        });

        // Then neither group stands for its whole contents any more, since the expense is unchecked in both,
        // and the other shared expense stays selected on its own
        expect(result.current.selectedTransactions['1']).toBeUndefined();
        expect(result.current.selectedTransactions['2']).toEqual(expect.objectContaining({isSelected: true, isSelectedViaGroup: false}));
        expect(result.current.selectedTransactions['2']?.otherClaimedGroupKeys).toBeUndefined();
        expect(getGroupKeysSelectedViaGroup(result.current.selectedTransactions)).toEqual([]);
    });
});
