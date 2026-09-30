import {act, renderHook} from '@testing-library/react-native';

import {useSearchRowSelectionActions, useSearchSelectionActions, useSearchSelectionContext} from '@components/Search/SearchContext';
import {SearchContextProvider} from '@components/Search/SearchContextProvider';
import type {TransactionCategoryGroupListItemType, TransactionListItemType, TransactionReportGroupListItemType} from '@components/Search/SearchList/ListItem/types';
import SearchWriteActionsProvider from '@components/Search/SearchWriteActionsProvider';

import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';

import type * as ReactNavigation from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

let mockIsFocused = true;

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigation>('@react-navigation/native'),
    useIsFocused: () => mockIsFocused,
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
    {transactionID: '1', keyForList: '1', currency: 'USD', amount: -642, report: {reportID: '11'}, selectionGroupKey: GROUP_KEY},
    {transactionID: '2', keyForList: '2', currency: 'USD', amount: -642, report: {reportID: '11'}, selectionGroupKey: GROUP_KEY},
] as unknown as TransactionListItemType[];

const makeReportTransaction = (transactionID: string, reportID: string, amount = -500) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- minimal fixture: only fields read by selection builders are required
    ({
        transactionID,
        keyForList: transactionID,
        currency: 'USD',
        amount,
        reportID,
        report: {reportID},
        action: CONST.SEARCH.ACTION_TYPES.VIEW,
    }) as unknown as TransactionListItemType;

const makeExpenseReport = (reportID: string, transactionIDs: string[], transactionAmount = -500) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- minimal fixture: only fields read by report selection are required
    ({
        groupedBy: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
        reportID,
        keyForList: reportID,
        transactions: transactionIDs.map((transactionID) => makeReportTransaction(transactionID, reportID, transactionAmount)),
        currency: 'USD',
        total: transactionAmount * transactionIDs.length,
        type: CONST.REPORT.TYPE.EXPENSE,
    }) as unknown as TransactionReportGroupListItemType;

const firstReport = makeExpenseReport('report-1', ['report-1-transaction-1', 'report-1-transaction-2']);
const secondReport = makeExpenseReport('report-2', ['report-2-transaction-1']);
const thirdReport = makeExpenseReport('report-3', ['report-3-transaction-1']);
let reportFilteredData: TransactionReportGroupListItemType[] = [firstReport, secondReport];

function makeReportSearchResults(): SearchResults {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- minimal fixture: only fields read by the selection reconciliation are required
    return {
        data: {},
        search: {
            type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
            hash: 2,
            sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
            offset: 0,
            hasMoreResults: true,
            hasResults: true,
            isLoading: false,
        },
    } as unknown as SearchResults;
}

let reportSearchResults = makeReportSearchResults();

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

const makeLoadedChild = (id: string) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- minimal fixture: only the fields the selection logic reads are needed
    ({
        transactionID: id,
        keyForList: id,
        currency: 'USD',
        amount: -642,
        report: {reportID: '11'},
        selectionGroupKey: GROUP_KEY,
    }) as unknown as TransactionListItemType;

let expandedGroup: TransactionCategoryGroupListItemType = {
    ...categoryGroup,
    transactions: loadedChildren,
};

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

function FlatWrapper({children}: {children: React.ReactNode}) {
    return (
        <SearchContextProvider>
            <SearchWriteActionsProvider
                filteredData={flatFilteredData}
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

function ReportsWrapper({children}: {children: React.ReactNode}) {
    const totalSelectableItemsCount = reportFilteredData.reduce((count, report) => count + report.transactions.length, 0);
    return (
        <SearchContextProvider>
            <SearchWriteActionsProvider
                filteredData={reportFilteredData}
                totalSelectableItemsCount={totalSelectableItemsCount}
                searchResults={reportSearchResults}
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

function ExpandedGroupWrapper({children}: {children: React.ReactNode}) {
    return (
        <SearchContextProvider>
            <SearchWriteActionsProvider
                filteredData={[expandedGroup]}
                totalSelectableItemsCount={expandedGroup.count ?? expandedGroup.transactions.length}
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

const renderExpandedGroupSelection = () =>
    renderHook(
        () => ({
            ...useSearchSelectionContext(),
            ...useSearchSelectionActions(),
            ...useSearchRowSelectionActions(),
        }),
        {wrapper: ExpandedGroupWrapper},
    );

const renderSelection = () =>
    renderHook(
        () => ({
            ...useSearchSelectionContext(),
            ...useSearchSelectionActions(),
            ...useSearchRowSelectionActions(),
        }),
        {wrapper: Wrapper},
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

const renderReportSelection = () =>
    renderHook(
        () => ({
            ...useSearchSelectionContext(),
            ...useSearchSelectionActions(),
            ...useSearchRowSelectionActions(),
        }),
        {wrapper: ReportsWrapper},
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
        mockIsFocused = true;
        flatExpense = makeFlatExpense(-3000);
        flatFilteredData = [flatExpense];
        flatSearchResults = makeFlatSearchResults(flatExpense);
        reportFilteredData = [firstReport, secondReport];
        reportSearchResults = makeReportSearchResults();
        expandedGroup = {
            ...categoryGroup,
            count: 2,
            transactions: loadedChildren,
        };
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
        expect(result.current.selectedTransactions['1']?.isSelectedViaGroup).toBe(true);
        expect(result.current.selectedTransactions['2']?.isSelectedViaGroup).toBe(true);
        expect(result.current.selectedTransactions['1']?.isEntireGroupSelected).toBe(true);
        expect(result.current.selectedTransactions['2']?.isEntireGroupSelected).toBe(true);
    });

    it('marks isEntireGroupSelected when every child is selected individually', async () => {
        const {result} = renderSelection();
        const firstChild = loadedChildren.at(0);
        const secondChild = loadedChildren.at(1);
        if (!firstChild || !secondChild) {
            throw new Error('Expected two loaded children');
        }

        await act(async () => {
            result.current.toggle(firstChild);
            await waitForBatchedUpdatesWithAct();
        });
        expect(result.current.selectedTransactions['1']?.isSelectedViaGroup).toBeFalsy();
        expect(result.current.selectedTransactions['1']?.isEntireGroupSelected).toBe(false);

        await act(async () => {
            result.current.toggle(secondChild);
            await waitForBatchedUpdatesWithAct();
        });

        expect(result.current.selectedTransactions['1']?.isSelectedViaGroup).toBeFalsy();
        expect(result.current.selectedTransactions['2']?.isSelectedViaGroup).toBeFalsy();
        expect(result.current.selectedTransactions['1']?.isEntireGroupSelected).toBe(true);
        expect(result.current.selectedTransactions['2']?.isEntireGroupSelected).toBe(true);
    });

    it('does not mark isEntireGroupSelected when the group checkbox selects fewer children than the group count', async () => {
        const {result} = renderSelection();
        const truncatedGroup = {...categoryGroup, count: 5};

        await act(async () => {
            result.current.toggle(truncatedGroup, loadedChildren);
            await waitForBatchedUpdatesWithAct();
        });

        expect(result.current.selectedTransactions['1']?.isSelected).toBe(true);
        expect(result.current.selectedTransactions['2']?.isSelected).toBe(true);
        expect(result.current.selectedTransactions['1']?.isSelectedViaGroup).toBe(true);
        expect(result.current.selectedTransactions['2']?.isSelectedViaGroup).toBe(true);
        expect(result.current.selectedTransactions['1']?.isEntireGroupSelected).toBe(false);
        expect(result.current.selectedTransactions['2']?.isEntireGroupSelected).toBe(false);
    });

    it('clears isEntireGroupSelected when a new child lands in a fully selected group', async () => {
        const {result, rerender} = renderExpandedGroupSelection();
        const firstChild = loadedChildren.at(0);
        const secondChild = loadedChildren.at(1);
        if (!firstChild || !secondChild) {
            throw new Error('Expected two loaded children');
        }

        await act(async () => {
            result.current.toggle(firstChild);
            result.current.toggle(secondChild);
            await waitForBatchedUpdatesWithAct();
        });
        expect(result.current.selectedTransactions['1']?.isEntireGroupSelected).toBe(true);
        expect(result.current.selectedTransactions['2']?.isEntireGroupSelected).toBe(true);

        expandedGroup = {
            ...categoryGroup,
            count: 3,
            transactions: [...loadedChildren, makeLoadedChild('3')],
        };
        rerender({});
        await act(async () => waitForBatchedUpdatesWithAct());

        expect(result.current.selectedTransactions['1']?.isSelected).toBe(true);
        expect(result.current.selectedTransactions['2']?.isSelected).toBe(true);
        expect(result.current.selectedTransactions['3']).toBeUndefined();
        expect(result.current.selectedTransactions['1']?.isEntireGroupSelected).toBe(false);
        expect(result.current.selectedTransactions['2']?.isEntireGroupSelected).toBe(false);
    });

    it('clears the parent exclusion when an expanded group is reselected', async () => {
        const {result} = renderSelection();

        await act(async () => {
            result.current.toggleAll();
            result.current.selectAllMatchingItems(true);
            await waitForBatchedUpdatesWithAct();
        });
        await act(async () => {
            result.current.toggle(categoryGroup, []);
            await waitForBatchedUpdatesWithAct();
        });
        expect(result.current.excludedTransactions[GROUP_KEY]).toBeDefined();

        await act(async () => {
            result.current.toggle(categoryGroup, loadedChildren);
            await waitForBatchedUpdatesWithAct();
        });

        expect(result.current.excludedTransactions).toEqual({});
        expect(result.current.selectedTransactions['1']?.isSelected).toBe(true);
        expect(result.current.selectedTransactions['2']?.isSelected).toBe(true);
        expect(result.current.areAllMatchingItemsSelected).toBe(true);
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

    it('clears a multi-page all-matching report selection from the header', async () => {
        const {result} = renderReportSelection();

        await act(async () => {
            result.current.toggleAll();
            result.current.selectAllMatchingItems(true);
            await waitForBatchedUpdatesWithAct();
        });
        expect(result.current.areAllMatchingItemsSelected).toBe(true);

        await act(async () => {
            result.current.toggleAll();
            await waitForBatchedUpdatesWithAct();
        });

        expect(result.current.selectedTransactions).toEqual({});
        expect(result.current.excludedTransactions).toEqual({});
        expect(result.current.areAllMatchingItemsSelected).toBe(false);
        expect(result.current.hasSelectedTransactions).toBe(false);
    });

    it('keeps an excluded report unchecked while selecting reports loaded by pagination', async () => {
        const {result, rerender} = renderReportSelection();

        await act(async () => {
            result.current.toggleAll();
            result.current.selectAllMatchingItems(true);
            await waitForBatchedUpdatesWithAct();
        });

        await act(async () => {
            result.current.toggle(firstReport);
            await waitForBatchedUpdatesWithAct();
        });

        expect(result.current.areAllMatchingItemsSelected).toBe(true);
        expect(Object.keys(result.current.selectedTransactions)).toEqual(['report-2-transaction-1']);
        expect(Object.keys(result.current.excludedTransactions)).toEqual(['report-1-transaction-1', 'report-1-transaction-2']);
        expect(result.current.selectedReports.map((report) => report.reportID)).toEqual(['report-2']);

        reportFilteredData = [firstReport, secondReport, thirdReport];
        rerender({});
        await act(async () => waitForBatchedUpdatesWithAct());

        expect(Object.keys(result.current.selectedTransactions)).toEqual(['report-2-transaction-1', 'report-3-transaction-1']);
        expect(Object.keys(result.current.excludedTransactions)).toEqual(['report-1-transaction-1', 'report-1-transaction-2']);

        await act(async () => {
            result.current.toggle(firstReport);
            await waitForBatchedUpdatesWithAct();
        });

        expect(result.current.areAllMatchingItemsSelected).toBe(true);
        expect(Object.keys(result.current.selectedTransactions)).toEqual(['report-2-transaction-1', 'report-3-transaction-1', 'report-1-transaction-1', 'report-1-transaction-2']);
        expect(result.current.excludedTransactions).toEqual({});
    });

    it("refreshes an excluded report's expenses when their live amounts change", async () => {
        const {result, rerender} = renderReportSelection();

        await act(async () => {
            result.current.toggleAll();
            result.current.selectAllMatchingItems(true);
            await waitForBatchedUpdatesWithAct();
        });
        await act(async () => {
            result.current.toggle(firstReport);
            await waitForBatchedUpdatesWithAct();
        });

        expect(result.current.excludedTransactions['report-1-transaction-1']?.amount).toBe(-500);
        expect(result.current.excludedTransactions['report-1-transaction-2']?.amount).toBe(-500);

        const updatedFirstReport = makeExpenseReport('report-1', ['report-1-transaction-1', 'report-1-transaction-2'], -700);
        reportFilteredData = [updatedFirstReport, secondReport];
        reportSearchResults = makeReportSearchResults();
        rerender({});
        await act(async () => waitForBatchedUpdatesWithAct());

        expect(result.current.excludedTransactions['report-1-transaction-1']?.amount).toBe(-700);
        expect(result.current.excludedTransactions['report-1-transaction-2']?.amount).toBe(-700);
        expect(result.current.areAllMatchingItemsSelected).toBe(true);
    });

    it('selects an excluded expense after it moves to a selected report', async () => {
        const {result, rerender} = renderReportSelection();

        await act(async () => {
            result.current.toggleAll();
            result.current.selectAllMatchingItems(true);
            await waitForBatchedUpdatesWithAct();
        });
        await act(async () => {
            result.current.toggle(firstReport);
            await waitForBatchedUpdatesWithAct();
        });

        reportFilteredData = [makeExpenseReport('report-1', ['report-1-transaction-2']), makeExpenseReport('report-2', ['report-2-transaction-1', 'report-1-transaction-1'])];
        reportSearchResults = makeReportSearchResults();
        rerender({});
        await act(async () => waitForBatchedUpdatesWithAct());

        expect(new Set(Object.keys(result.current.selectedTransactions))).toEqual(new Set(['report-2-transaction-1', 'report-1-transaction-1']));
        expect(Object.keys(result.current.excludedTransactions)).toEqual(['report-1-transaction-2']);
        expect(result.current.excludedTransactions['report-1-transaction-2']?.reportID).toBe('report-1');
        expect(result.current.selectedReports.map((report) => report.reportID)).toEqual(['report-2']);
        expect(result.current.areAllMatchingItemsSelected).toBe(true);
    });

    it('selects an excluded expense immediately when it moves while the Reports screen is behind an RHP', async () => {
        const {result, rerender} = renderReportSelection();

        await act(async () => {
            result.current.toggleAll();
            result.current.selectAllMatchingItems(true);
            await waitForBatchedUpdatesWithAct();
        });
        await act(async () => {
            result.current.toggle(firstReport);
            await waitForBatchedUpdatesWithAct();
        });

        mockIsFocused = false;
        reportFilteredData = [makeExpenseReport('report-1', ['report-1-transaction-2']), makeExpenseReport('report-2', ['report-2-transaction-1', 'report-1-transaction-1'])];
        reportSearchResults = makeReportSearchResults();
        rerender({});
        await act(async () => waitForBatchedUpdatesWithAct());

        expect(new Set(Object.keys(result.current.selectedTransactions))).toEqual(new Set(['report-2-transaction-1', 'report-1-transaction-1']));
        expect(Object.keys(result.current.excludedTransactions)).toEqual(['report-1-transaction-2']);
        expect(result.current.selectedReports.map((report) => report.reportID)).toEqual(['report-2']);
        expect(result.current.areAllMatchingItemsSelected).toBe(true);
    });

    it('keeps a moved expense excluded when its destination report is excluded', async () => {
        const {result, rerender} = renderReportSelection();

        await act(async () => {
            result.current.toggleAll();
            result.current.selectAllMatchingItems(true);
            await waitForBatchedUpdatesWithAct();
        });
        await act(async () => {
            result.current.toggle(firstReport);
            result.current.toggle(secondReport);
            await waitForBatchedUpdatesWithAct();
        });

        reportFilteredData = [makeExpenseReport('report-1', ['report-1-transaction-2']), makeExpenseReport('report-2', ['report-2-transaction-1', 'report-1-transaction-1'])];
        reportSearchResults = makeReportSearchResults();
        rerender({});
        await act(async () => waitForBatchedUpdatesWithAct());

        expect(result.current.selectedTransactions).toEqual({});
        expect(new Set(Object.keys(result.current.excludedTransactions))).toEqual(new Set(['report-1-transaction-2', 'report-2-transaction-1', 'report-1-transaction-1']));
        expect(result.current.excludedTransactions['report-1-transaction-1']?.reportID).toBe('report-2');
        expect(result.current.selectedReports).toEqual([]);
        expect(result.current.areAllMatchingItemsSelected).toBe(true);
    });

    it('keeps an emptied source report excluded when its last expense moves to a selected report', async () => {
        const sourceReport = makeExpenseReport('source-report', ['moved-transaction']);
        const destinationReport = makeExpenseReport('destination-report', ['destination-transaction']);
        reportFilteredData = [sourceReport, destinationReport];
        const {result, rerender} = renderReportSelection();

        await act(async () => {
            result.current.toggleAll();
            result.current.selectAllMatchingItems(true);
            await waitForBatchedUpdatesWithAct();
        });
        await act(async () => {
            result.current.toggle(sourceReport);
            await waitForBatchedUpdatesWithAct();
        });

        reportFilteredData = [makeExpenseReport('source-report', []), makeExpenseReport('destination-report', ['destination-transaction', 'moved-transaction'])];
        reportSearchResults = makeReportSearchResults();
        rerender({});
        await act(async () => waitForBatchedUpdatesWithAct());

        expect(new Set(Object.keys(result.current.selectedTransactions))).toEqual(new Set(['destination-transaction', 'moved-transaction']));
        expect(Object.keys(result.current.excludedTransactions)).toEqual(['source-report']);
        expect(result.current.excludedTransactions['source-report']?.reportID).toBe('source-report');
        expect(result.current.selectedReports.map((report) => report.reportID)).toEqual(['destination-report']);
        expect(result.current.areAllMatchingItemsSelected).toBe(true);
    });

    it('excludes a selected expense after it moves into an excluded report', async () => {
        const {result, rerender} = renderReportSelection();

        await act(async () => {
            result.current.toggleAll();
            result.current.selectAllMatchingItems(true);
            await waitForBatchedUpdatesWithAct();
        });
        await act(async () => {
            result.current.toggle(secondReport);
            await waitForBatchedUpdatesWithAct();
        });

        reportFilteredData = [makeExpenseReport('report-1', ['report-1-transaction-2']), makeExpenseReport('report-2', ['report-2-transaction-1', 'report-1-transaction-1'])];
        reportSearchResults = makeReportSearchResults();
        rerender({});
        await act(async () => waitForBatchedUpdatesWithAct());

        expect(Object.keys(result.current.selectedTransactions)).toEqual(['report-1-transaction-2']);
        expect(new Set(Object.keys(result.current.excludedTransactions))).toEqual(new Set(['report-1-transaction-1', 'report-2-transaction-1']));
        expect(result.current.excludedTransactions['report-1-transaction-1']?.reportID).toBe('report-2');
        expect(result.current.selectedReports.map((report) => report.reportID)).toEqual(['report-1']);
        expect(result.current.areAllMatchingItemsSelected).toBe(true);
    });

    it('keeps a new expense excluded when it is added to an excluded report', async () => {
        const {result, rerender} = renderReportSelection();

        await act(async () => {
            result.current.selectAllMatchingItems(true);
            await waitForBatchedUpdatesWithAct();
        });
        await act(async () => {
            result.current.toggle(firstReport);
            await waitForBatchedUpdatesWithAct();
        });

        const updatedFirstReport = makeExpenseReport('report-1', ['report-1-transaction-1', 'report-1-transaction-2', 'report-1-transaction-3']);
        reportFilteredData = [updatedFirstReport, secondReport];
        reportSearchResults = makeReportSearchResults();
        rerender({});
        await act(async () => waitForBatchedUpdatesWithAct());

        expect(Object.keys(result.current.selectedTransactions)).toEqual(['report-2-transaction-1']);
        expect(Object.keys(result.current.excludedTransactions)).toEqual(['report-1-transaction-3', 'report-1-transaction-1', 'report-1-transaction-2']);
        expect(result.current.selectedReports.map((report) => report.reportID)).toEqual(['report-2']);
        expect(result.current.areAllMatchingItemsSelected).toBe(true);
    });

    it('removes a deleted expense from an excluded report', async () => {
        const {result, rerender} = renderReportSelection();

        await act(async () => {
            result.current.toggleAll();
            result.current.selectAllMatchingItems(true);
            await waitForBatchedUpdatesWithAct();
        });
        await act(async () => {
            result.current.toggle(firstReport);
            await waitForBatchedUpdatesWithAct();
        });

        reportFilteredData = [makeExpenseReport('report-1', ['report-1-transaction-1']), secondReport];
        reportSearchResults = makeReportSearchResults();
        rerender({});
        await act(async () => waitForBatchedUpdatesWithAct());

        expect(Object.keys(result.current.selectedTransactions)).toEqual(['report-2-transaction-1']);
        expect(Object.keys(result.current.excludedTransactions)).toEqual(['report-1-transaction-1']);
        expect(result.current.selectedReports.map((report) => report.reportID)).toEqual(['report-2']);
        expect(result.current.areAllMatchingItemsSelected).toBe(true);
    });

    it('keeps an excluded report unchecked when its last expense is deleted', async () => {
        const {result, rerender} = renderReportSelection();

        await act(async () => {
            result.current.toggleAll();
            result.current.selectAllMatchingItems(true);
            await waitForBatchedUpdatesWithAct();
        });
        await act(async () => {
            result.current.toggle(firstReport);
            await waitForBatchedUpdatesWithAct();
        });

        reportFilteredData = [makeExpenseReport('report-1', []), secondReport];
        reportSearchResults = makeReportSearchResults();
        rerender({});
        await act(async () => waitForBatchedUpdatesWithAct());

        expect(Object.keys(result.current.selectedTransactions)).toEqual(['report-2-transaction-1']);
        expect(Object.keys(result.current.excludedTransactions)).toEqual(['report-1']);
        expect(result.current.excludedTransactions['report-1']?.reportID).toBe('report-1');
        expect(result.current.selectedReports.map((report) => report.reportID)).toEqual(['report-2']);
        expect(result.current.areAllMatchingItemsSelected).toBe(true);
    });

    it('keeps a report excluded when its first expense is added', async () => {
        const emptyReport = makeExpenseReport('empty-report', []);
        reportFilteredData = [emptyReport, secondReport];
        const {result, rerender} = renderReportSelection();

        await act(async () => {
            result.current.toggleAll();
            result.current.selectAllMatchingItems(true);
            await waitForBatchedUpdatesWithAct();
        });
        await act(async () => {
            result.current.toggle(emptyReport);
            await waitForBatchedUpdatesWithAct();
        });

        expect(result.current.excludedTransactions['empty-report']).toBeDefined();

        reportFilteredData = [makeExpenseReport('empty-report', ['empty-report-transaction-1']), secondReport];
        reportSearchResults = makeReportSearchResults();
        rerender({});
        await act(async () => waitForBatchedUpdatesWithAct());

        expect(result.current.excludedTransactions['empty-report']).toBeUndefined();
        expect(Object.keys(result.current.excludedTransactions)).toEqual(['empty-report-transaction-1']);
        expect(result.current.excludedTransactions['empty-report-transaction-1']?.reportID).toBe('empty-report');
        expect(result.current.selectedTransactions['empty-report-transaction-1']).toBeUndefined();
        expect(result.current.areAllMatchingItemsSelected).toBe(true);
    });
});
