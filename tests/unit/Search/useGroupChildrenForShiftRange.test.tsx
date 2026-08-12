import {renderHook} from '@testing-library/react-native';

import {SearchShiftRangeChildrenContext} from '@components/Search/SearchContextDefinitions';
import type {TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import useGroupChildrenForShiftRange from '@components/Search/SearchList/ListItem/useGroupChildrenForShiftRange';
import {mapEmptyReportToSelectedEntry} from '@components/Search/selectionBuilders';
import type {SelectedTransactions} from '@components/Search/types';

import type * as SearchUIUtils from '@libs/SearchUIUtils';

import type {SearchResults} from '@src/types/onyx';

import React from 'react';

import {buildReportGroup, buildTransactionRow} from '../../utils/collections/searchListItems';

const GROUP_KEY = 'Advertising';

const FIRST_CHILD_KEY = '1';

const snapshotRows = [buildTransactionRow(1, FIRST_CHILD_KEY), buildTransactionRow(2, '2')];

// Only the rows getSections derives from it matter here, so an empty snapshot stands in for the loaded page.
const snapshotData: SearchResults['data'] = {};

const mockGetSections = jest.fn(() => [snapshotRows]);
jest.mock('@libs/SearchUIUtils', () => ({
    ...jest.requireActual<typeof SearchUIUtils>('@libs/SearchUIUtils'),
    getSections: () => mockGetSections(),
}));

// Each stands in for a context value, so it has to keep the same identity across renders as the real one does.
jest.mock('@hooks/useCurrentUserPersonalDetails', () => {
    const details = {accountID: 1, email: 'a@b.com'};
    return {__esModule: true, default: () => details};
});
jest.mock('@hooks/useLocalize', () => {
    const localize = {translate: (key: string) => key, formatPhoneNumber: (phone: string) => phone, dateFnsLocale: undefined};
    return {__esModule: true, default: () => localize};
});
jest.mock('@hooks/useActionLoadingReportIDs', () => {
    const loadingReportIDs = new Set<string>();
    return {__esModule: true, default: () => loadingReportIDs};
});
jest.mock('@hooks/useCurrencyList', () => {
    const actions = {convertToDisplayString: (amount: number) => `${amount}`};
    return {useCurrencyListActions: () => actions};
});

/** A real selection entry, so the fixtures carry the same shape the provider writes. */
const selectEntry = (key: string): SelectedTransactions => {
    const [, entry] = mapEmptyReportToSelectedEntry(buildReportGroup(9, key));
    return {[key]: {...entry, isSelected: true}};
};

const mockSelectedTransactions: {current: SelectedTransactions} = {current: {}};
const mockExcludedTransactions: {current: SelectedTransactions} = {current: {}};
jest.mock('@components/Search/SearchContext', () => ({
    ...jest.requireActual<Record<string, unknown>>('@components/Search/SearchContext'),
    useSearchSelectionContext: () => ({selectedTransactions: mockSelectedTransactions.current, excludedTransactions: mockExcludedTransactions.current, areAllMatchingItemsSelected: false}),
}));

type HookArgs = Parameters<typeof useGroupChildrenForShiftRange>[0];

const baseArgs: HookArgs = {
    groupKey: GROUP_KEY,
    isExpenseReportType: false,
    groupTransactions: [],
    snapshotData,
    bankAccountList: undefined,
    cardFeeds: undefined,
    conciergeReportID: undefined,
};

function renderGroupChildren(overrides: Partial<HookArgs> = {}) {
    const registerGroupChildren = jest.fn();
    const addGroupToRange = jest.fn();
    const removeGroupFromRange = jest.fn();
    const wrapper = ({children}: {children: React.ReactNode}) => (
        <SearchShiftRangeChildrenContext value={{registerGroupChildren, addGroupToRange, removeGroupFromRange, registryGeneration: 1}}>{children}</SearchShiftRangeChildrenContext>
    );
    const view = renderHook((props: Partial<HookArgs>) => useGroupChildrenForShiftRange({...baseArgs, ...props}), {wrapper, initialProps: overrides});
    return {registerGroupChildren, addGroupToRange, removeGroupFromRange, ...view};
}

describe('useGroupChildrenForShiftRange', () => {
    beforeEach(() => {
        mockSelectedTransactions.current = {};
        mockExcludedTransactions.current = {};
        mockGetSections.mockClear();
    });

    it('registers the rows it derived from an open group snapshot', () => {
        const {registerGroupChildren, result} = renderGroupChildren();
        expect(registerGroupChildren).toHaveBeenCalledWith(GROUP_KEY, snapshotRows);
        expect(result.current.transactions.map((row) => row.keyForList)).toEqual(['1', '2']);
    });

    it('leaves openness to the component that owns it, rather than deciding it here', () => {
        const {addGroupToRange, removeGroupFromRange} = renderGroupChildren();
        expect(addGroupToRange).not.toHaveBeenCalled();
        expect(removeGroupFromRange).not.toHaveBeenCalled();
    });

    it('stamps the parent key on each row, which is how a row checks whether its group was excluded', () => {
        const {result} = renderGroupChildren();
        expect(result.current.transactions.map((row) => row.selectionGroupKey)).toEqual([GROUP_KEY, GROUP_KEY]);
    });

    it('reads a group selected before its children loaded as selected, since the selection sits under the group key', () => {
        mockSelectedTransactions.current = selectEntry(GROUP_KEY);
        const {result} = renderGroupChildren();
        expect(result.current.isGroupSelected).toBe(true);
        expect(result.current.transactions.every((row) => row.isSelected)).toBe(true);
    });

    it('unstamps a child that was excluded out of a group selected as a whole', () => {
        const [, groupEntry] = mapEmptyReportToSelectedEntry(buildReportGroup(9, GROUP_KEY));
        mockSelectedTransactions.current = {[GROUP_KEY]: {...groupEntry, isSelected: true}};
        mockExcludedTransactions.current = selectEntry(FIRST_CHILD_KEY);
        const {result} = renderGroupChildren();
        expect(result.current.transactions.map((row) => row.isSelected)).toEqual([false, true]);
    });

    it('marks only the individually selected rows when the group itself is not selected', () => {
        mockSelectedTransactions.current = selectEntry(FIRST_CHILD_KEY);
        const {result} = renderGroupChildren();
        expect(result.current.isGroupSelected).toBe(false);
        expect(result.current.transactions.map((row) => row.isSelected)).toEqual([true, false]);
    });

    it('keeps the registered rows unchanged when only the selection moves, so a checkbox press cannot churn them', () => {
        const {registerGroupChildren, rerender} = renderGroupChildren();
        expect(registerGroupChildren).toHaveBeenCalledTimes(1);
        mockSelectedTransactions.current = selectEntry(FIRST_CHILD_KEY);
        rerender({});
        expect(registerGroupChildren).toHaveBeenCalledTimes(1);
    });

    it('uses the rows the provider already derived rather than deriving them again', () => {
        const groupTransactions: TransactionListItemType[] = [buildTransactionRow(4, '4')];
        const {registerGroupChildren, result} = renderGroupChildren({groupTransactions});
        expect(mockGetSections).not.toHaveBeenCalled();
        expect(registerGroupChildren).toHaveBeenCalledWith(GROUP_KEY, groupTransactions);
        expect(result.current.transactions.map((row) => row.keyForList)).toEqual(['4']);
    });

    it('passes expense-report rows straight through, since they arrive ready to render', () => {
        const groupTransactions: TransactionListItemType[] = [buildTransactionRow(3, '3')];
        const {result} = renderGroupChildren({isExpenseReportType: true, groupTransactions});
        expect(result.current.transactions).toBe(groupTransactions);
        expect(mockGetSections).not.toHaveBeenCalled();
    });

    it('registers nothing in expense-report views, where the group rows are already part of the list', () => {
        const {registerGroupChildren} = renderGroupChildren({isExpenseReportType: true, groupTransactions: [buildTransactionRow(3, '3')]});
        expect(registerGroupChildren).not.toHaveBeenCalled();
    });

    it('publishes an empty list before the snapshot arrives, rather than leaving a stale one in place', () => {
        const {registerGroupChildren, result} = renderGroupChildren({snapshotData: undefined});
        expect(result.current.transactions).toEqual([]);
        expect(registerGroupChildren).toHaveBeenCalledWith(GROUP_KEY, []);
    });
});
