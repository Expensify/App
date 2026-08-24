import {renderHook} from '@testing-library/react-native';

import type {TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import useGroupChildren from '@components/Search/SearchList/ListItem/useGroupChildren';
import {mapEmptyReportToSelectedEntry} from '@components/Search/selectionBuilders';
import type {SelectedTransactions} from '@components/Search/types';

import CONST from '@src/CONST';

import {buildReportGroup, buildTransactionRow} from '../../utils/collections/searchListItems';

const GROUP_KEY = 'Advertising';

const FIRST_CHILD_KEY = '1';

const firstRow = buildTransactionRow(1, FIRST_CHILD_KEY);

const rows = [firstRow, buildTransactionRow(2, '2')];

/** A real selection entry, so the fixtures carry the same shape the provider writes. */
const selectEntry = (key: string): SelectedTransactions => {
    const [, entry] = mapEmptyReportToSelectedEntry(buildReportGroup(9, key));
    return {[key]: {...entry, isSelected: true}};
};

const mockSelectedTransactions: {current: SelectedTransactions} = {current: {}};
const mockExcludedTransactions: {current: SelectedTransactions} = {current: {}};
const mockAreAllMatchingItemsSelected = {current: false};
jest.mock('@components/Search/SearchContext', () => ({
    ...jest.requireActual<Record<string, unknown>>('@components/Search/SearchContext'),
    useSearchSelectionContext: () => ({
        selectedTransactions: mockSelectedTransactions.current,
        excludedTransactions: mockExcludedTransactions.current,
        areAllMatchingItemsSelected: mockAreAllMatchingItemsSelected.current,
    }),
}));

type HookArgs = Parameters<typeof useGroupChildren>[0];

const baseArgs: HookArgs = {
    groupKey: GROUP_KEY,
    groupTransactions: rows,
};

const renderGroupChildren = (overrides: Partial<HookArgs> = {}) => renderHook(() => useGroupChildren({...baseArgs, ...overrides}));

describe('useGroupChildren', () => {
    beforeEach(() => {
        mockSelectedTransactions.current = {};
        mockExcludedTransactions.current = {};
        mockAreAllMatchingItemsSelected.current = false;
    });

    it('returns the rows the group carries', () => {
        const {result} = renderGroupChildren();
        expect(result.current.transactions.map((transaction) => transaction.keyForList)).toEqual([FIRST_CHILD_KEY, '2']);
    });

    it('stamps each row with the group it is rendered under, which is how a row sees its group excluded', () => {
        const {result} = renderGroupChildren();
        expect(result.current.transactions.every((transaction) => transaction.selectionGroupKey === GROUP_KEY)).toBe(true);
    });

    it('stamps a row selected on its own as checked', () => {
        mockSelectedTransactions.current = selectEntry(FIRST_CHILD_KEY);
        const {result} = renderGroupChildren();
        expect(result.current.transactions.at(0)?.isSelected).toBe(true);
        expect(result.current.transactions.at(1)?.isSelected).toBe(false);
    });

    it('stamps every row as checked while select-all-matching covers them', () => {
        mockAreAllMatchingItemsSelected.current = true;
        const {result} = renderGroupChildren();
        expect(result.current.transactions.every((transaction) => transaction.isSelected)).toBe(true);
    });

    it('leaves an excluded row unstamped, even though the wider selection covers it', () => {
        mockAreAllMatchingItemsSelected.current = true;
        mockExcludedTransactions.current = selectEntry(FIRST_CHILD_KEY);
        const {result} = renderGroupChildren();
        expect(result.current.transactions.at(0)?.isSelected).toBe(false);
        expect(result.current.transactions.at(1)?.isSelected).toBe(true);
    });

    it('leaves every row unstamped while the group itself is excluded, since that exclusion covers them all', () => {
        mockAreAllMatchingItemsSelected.current = true;
        mockExcludedTransactions.current = selectEntry(GROUP_KEY);
        const {result} = renderGroupChildren();
        expect(result.current.transactions.every((transaction) => transaction.isSelected)).toBe(false);
    });

    it('answers for a group carrying no rows from its own key, since there is nothing else to ask', () => {
        mockSelectedTransactions.current = selectEntry(GROUP_KEY);
        const {result} = renderGroupChildren({groupTransactions: [] as TransactionListItemType[]});
        expect(result.current.isSelectAllChecked).toBe(true);
        expect(result.current.transactions).toEqual([]);
    });

    it('does not read a group as checked from its key alone once that key is excluded', () => {
        mockAreAllMatchingItemsSelected.current = true;
        mockExcludedTransactions.current = selectEntry(GROUP_KEY);
        const {result} = renderGroupChildren({groupTransactions: [] as TransactionListItemType[]});
        expect(result.current.isSelectAllChecked).toBe(false);
    });

    it('reads checked once every row it carries is, and indeterminate while only some are', () => {
        mockSelectedTransactions.current = selectEntry(FIRST_CHILD_KEY);
        const {result, rerender} = renderGroupChildren();
        expect({checked: result.current.isSelectAllChecked, indeterminate: result.current.isIndeterminate}).toEqual({checked: false, indeterminate: true});

        mockSelectedTransactions.current = {...selectEntry(FIRST_CHILD_KEY), ...selectEntry('2')};
        rerender({});
        expect({checked: result.current.isSelectAllChecked, indeterminate: result.current.isIndeterminate}).toEqual({checked: true, indeterminate: false});
    });

    it('leaves a row being deleted out of the count, so the checkbox cannot read checked and indeterminate at once', () => {
        const deletedRow = {...buildTransactionRow(3, '3'), pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE};
        mockSelectedTransactions.current = selectEntry(FIRST_CHILD_KEY);
        const {result} = renderGroupChildren({groupTransactions: [firstRow, deletedRow]});
        expect({checked: result.current.isSelectAllChecked, indeterminate: result.current.isIndeterminate}).toEqual({checked: true, indeterminate: false});
    });

    it('reads unchecked while every row it carries is being deleted, rather than answering from its own key', () => {
        const deletedRow = {...buildTransactionRow(3, '3'), pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE};
        // Carrying no rows is what makes a group answer from its own key. Carrying only rows it cannot select is a different thing.
        mockAreAllMatchingItemsSelected.current = true;
        const {result} = renderGroupChildren({groupTransactions: [deletedRow]});
        expect({checked: result.current.isSelectAllChecked, indeterminate: result.current.isIndeterminate}).toEqual({checked: false, indeterminate: false});
    });
});
