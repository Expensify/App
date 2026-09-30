import {act, renderHook} from '@testing-library/react-native';

import useMoneyRequestReportTransactionSelection from '@components/MoneyRequestReportView/useMoneyRequestReportTransactionSelection';

import {navigationRef} from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import type {GroupedTransactions, Transaction} from '@src/types/onyx';

import type * as ReactNavigationNative from '@react-navigation/native';

import createRandomTransaction from '../utils/collections/transaction';
import createMock from '../utils/createMock';

type FocusCallback = () => void | (() => void);

const mockUseFocusEffect = jest.fn<void, [FocusCallback]>();

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native'),
    useFocusEffect: (callback: FocusCallback) => {
        mockUseFocusEffect(callback);
    },
}));

let mockSelectedTransactionIDs: string[] = [];

const mockSetSelectedTransactions = jest.fn((ids: string[]) => {
    mockSelectedTransactionIDs = ids;
});
const mockClearSelectedTransactions = jest.fn(() => {
    mockSelectedTransactionIDs = [];
});

jest.mock('@components/Search/SearchContext', () => ({
    __esModule: true,
    useSearchSelectionContext: () => ({selectedTransactionIDs: mockSelectedTransactionIDs}),
    useSearchSelectionActions: () => ({
        setSelectedTransactions: mockSetSelectedTransactions,
        clearSelectedTransactions: mockClearSelectedTransactions,
    }),
}));

jest.mock('@hooks/useHandleSelectionMode', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@hooks/useMobileSelectionMode', () => ({__esModule: true, default: jest.fn(() => false)}));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigationRef: {
        getRootState: jest.fn(),
    },
}));

const REPORT_ID = '1';

const mockGetRootState = jest.spyOn(navigationRef, 'getRootState');

let transactionSequence = 0;

function buildTransaction(pendingAction?: Transaction['pendingAction']): Transaction {
    transactionSequence += 1;
    return {
        ...createRandomTransaction(transactionSequence),
        transactionID: `${transactionSequence}`,
        reportID: REPORT_ID,
        pendingAction,
        pendingFields: undefined,
    };
}

function buildGroup(groupKey: string, transactions: Transaction[]): GroupedTransactions {
    return createMock<GroupedTransactions>({groupKey, transactions});
}

function getFocusCallback(): FocusCallback {
    const callback = mockUseFocusEffect.mock.calls.at(-1)?.[0];
    if (!callback) {
        throw new Error('useFocusEffect was not called');
    }
    return callback;
}

function blur() {
    const cleanup = getFocusCallback()();
    act(() => {
        cleanup?.();
    });
}

function rootStateWithTopRoute(routeName: string): ReactNavigationNative.NavigationState {
    return createMock<ReactNavigationNative.NavigationState>({routes: [{name: routeName}]});
}

beforeEach(() => {
    jest.clearAllMocks();
    transactionSequence = 0;
    mockSelectedTransactionIDs = [];
    mockGetRootState.mockReturnValue(rootStateWithTopRoute('SomeOtherNavigator'));
});

describe('useMoneyRequestReportTransactionSelection', () => {
    it('clears the selection when the report changes', () => {
        // Given a report opened with a leftover selection from the previous report
        const {rerender} = renderHook(({reportID}) => useMoneyRequestReportTransactionSelection({reportID, groupedTransactions: []}), {
            initialProps: {reportID: REPORT_ID},
        });
        mockClearSelectedTransactions.mockClear();
        mockSelectedTransactionIDs = ['1'];

        // When the user switches to another report
        rerender({reportID: '2'});

        // Then the selection is dropped, so a transaction of the previous report cannot be paid or
        // deleted through the new report's action bar
        expect(mockClearSelectedTransactions).toHaveBeenCalledWith(true);
        expect(mockSelectedTransactionIDs).toEqual([]);
    });

    it('clears the selection when leaving the screen', () => {
        // Given transactions of the report are selected while the screen is focused
        renderHook(() => useMoneyRequestReportTransactionSelection({reportID: REPORT_ID, groupedTransactions: []}));
        mockClearSelectedTransactions.mockClear();
        mockSelectedTransactionIDs = ['1'];

        // When the user navigates away to a plain screen
        blur();

        // Then
        expect(mockClearSelectedTransactions).toHaveBeenCalledWith(true);
        expect(mockSelectedTransactionIDs).toEqual([]);
    });

    it('keeps the selection when the screen is covered by the right modal navigator', () => {
        // Given transactions of the report are selected while the screen is focused
        renderHook(() => useMoneyRequestReportTransactionSelection({reportID: REPORT_ID, groupedTransactions: []}));
        mockClearSelectedTransactions.mockClear();
        mockSelectedTransactionIDs = ['1'];
        mockGetRootState.mockReturnValue(rootStateWithTopRoute(NAVIGATORS.RIGHT_MODAL_NAVIGATOR));

        // When the user opens a transaction in the right modal, which remove focus from the report list
        blur();

        // Then the selection survives, otherwise opening a transaction would silently deselect it
        expect(mockClearSelectedTransactions).not.toHaveBeenCalled();
        expect(mockSelectedTransactionIDs).toEqual(['1']);
    });

    it('adds and removes a single transaction from the selection', () => {
        // Given nothing is selected
        const first = buildTransaction();
        const second = buildTransaction();
        const {result, rerender} = renderHook(({transactions}) => useMoneyRequestReportTransactionSelection({reportID: REPORT_ID, groupedTransactions: [buildGroup('g1', transactions)]}), {
            initialProps: {transactions: [first, second]},
        });

        // When the user taps a transaction row
        act(() => {
            result.current.toggleTransaction(first.transactionID);
        });

        // Then it becomes the only selected transaction
        expect(mockSetSelectedTransactions).toHaveBeenCalledWith([first.transactionID]);
        mockSetSelectedTransactions.mockClear();

        // When the context hands the new selection back and the user taps the same row again
        rerender({transactions: [first, second]});
        act(() => {
            result.current.toggleTransaction(first.transactionID);
        });

        // Then it is removed, leaving the selection empty rather than accumulating duplicates
        expect(mockSetSelectedTransactions).toHaveBeenCalledWith([]);
    });

    it('reports whether each transaction is selected', () => {
        // Given one transaction is selected
        const first = buildTransaction();
        const second = buildTransaction();
        mockSelectedTransactionIDs = [second.transactionID];
        const {result} = renderHook(() => useMoneyRequestReportTransactionSelection({reportID: REPORT_ID, groupedTransactions: [buildGroup('g1', [first, second])]}));

        // When the list asks for the checkbox state of each row
        // Then only the selected row is checked
        expect(result.current.isTransactionSelected(first.transactionID)).toBe(false);
        expect(result.current.isTransactionSelected(second.transactionID)).toBe(true);
    });

    it('marks a group header as fully selected when every selectable transaction is selected', () => {
        // Given all transactions of the group are selected
        const transactions = [buildTransaction(), buildTransaction()];
        mockSelectedTransactionIDs = transactions.map((t) => t.transactionID);
        const {result} = renderHook(() => useMoneyRequestReportTransactionSelection({reportID: REPORT_ID, groupedTransactions: [buildGroup('g1', transactions)]}));

        // When the section header renders its checkbox
        // Then it is checked with no indeterminate dash, so tapping it deselects the group
        expect(result.current.groupSelectionState.get('g1')).toEqual({
            isSelected: true,
            isIndeterminate: false,
            isDisabled: false,
            pendingAction: undefined,
        });
    });

    it('marks a group header as indeterminate when only some transactions are selected', () => {
        // Given one of two transactions in the group is selected
        const first = buildTransaction();
        const second = buildTransaction();
        mockSelectedTransactionIDs = [first.transactionID];
        const {result} = renderHook(() => useMoneyRequestReportTransactionSelection({reportID: REPORT_ID, groupedTransactions: [buildGroup('g1', [first, second])]}));

        // When
        // Then the header shows the mixed state, and tapping it selects the rest instead of clearing
        expect(result.current.groupSelectionState.get('g1')).toEqual({
            isSelected: false,
            isIndeterminate: true,
            isDisabled: false,
            pendingAction: undefined,
        });
    });

    it('excludes transactions pending deletion from the group selection state', () => {
        // Given the group holds one live transaction and one whose delete is still in flight, and only
        // the live one is selected
        const live = buildTransaction();
        const pendingDelete = buildTransaction(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
        mockSelectedTransactionIDs = [live.transactionID];
        const {result} = renderHook(() => useMoneyRequestReportTransactionSelection({reportID: REPORT_ID, groupedTransactions: [buildGroup('g1', [live, pendingDelete])]}));

        // When the section header renders
        // Then the group counts as fully selected: the transaction being deleted cannot be selected,
        // so ignoring it is what makes "select all in group" reachable. The header still shows the
        // in-flight marker, because a member of the group has an unsynced action.
        expect(result.current.groupSelectionState.get('g1')).toEqual({
            isSelected: true,
            isIndeterminate: false,
            isDisabled: false,
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
        });
    });

    it('disables a group header whose transactions are all pending deletion', () => {
        // Given every transaction in the group is being deleted, so there is nothing to select
        const pendingDeletes = [buildTransaction(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE), buildTransaction(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)];
        const {result} = renderHook(() => useMoneyRequestReportTransactionSelection({reportID: REPORT_ID, groupedTransactions: [buildGroup('g1', pendingDeletes)]}));

        // When
        // Then the checkbox is disabled rather than offering an empty selection
        expect(result.current.groupSelectionState.get('g1')).toEqual({
            isSelected: false,
            isIndeterminate: false,
            isDisabled: true,
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
        });
    });

    it('marks a group header as pending while one of its transactions has an unsynced change', () => {
        // Given one transaction in the group carries an offline update (no pendingAction, only a
        // pending field), which the pending-action helper reports as an update
        const first = buildTransaction();
        const second = buildTransaction();
        second.pendingFields = {comment: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE};
        const {result} = renderHook(() => useMoneyRequestReportTransactionSelection({reportID: REPORT_ID, groupedTransactions: [buildGroup('g1', [first, second])]}));

        // When
        // Then the header is greyed out with the in-flight indicator, matching how a single
        // transaction with an unsynced change is shown
        expect(result.current.groupSelectionState.get('g1')).toEqual({
            isSelected: false,
            isIndeterminate: false,
            isDisabled: false,
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
        });
    });

    it('selects every selectable transaction of a group when its header is tapped with nothing selected', () => {
        // Given an unselected group that also contains a transaction pending deletion
        const live = [buildTransaction(), buildTransaction()];
        const pendingDelete = buildTransaction(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
        const {result} = renderHook(() => useMoneyRequestReportTransactionSelection({reportID: REPORT_ID, groupedTransactions: [buildGroup('g1', [...live, pendingDelete])]}));

        // When the user taps the group header
        act(() => {
            result.current.toggleGroupSelection('g1');
        });

        // Then the live transactions are selected and the one being deleted is left out
        expect(mockSetSelectedTransactions).toHaveBeenCalledWith(live.map((t) => t.transactionID));
    });

    it('deselects a group when its header is tapped with any transaction already selected', () => {
        // Given a group whose selection is partial
        const first = buildTransaction();
        const second = buildTransaction();
        mockSelectedTransactionIDs = [first.transactionID, 'outside_group'];
        const {result} = renderHook(() => useMoneyRequestReportTransactionSelection({reportID: REPORT_ID, groupedTransactions: [buildGroup('g1', [first, second])]}));

        // When the user taps the group header again
        act(() => {
            result.current.toggleGroupSelection('g1');
        });

        // Then only that group is emptied; selection in other groups is untouched
        expect(mockSetSelectedTransactions).toHaveBeenCalledWith(['outside_group']);
    });

    it('ignores a group toggle for a group that is no longer rendered', () => {
        // Given the group list changed since the header was rendered (e.g. the group-by changed)
        const {result} = renderHook(() => useMoneyRequestReportTransactionSelection({reportID: REPORT_ID, groupedTransactions: []}));

        // When a stale group key is toggled
        act(() => {
            result.current.toggleGroupSelection('gone');
        });

        // Then nothing is selected, instead of an error or a partial update
        expect(mockSetSelectedTransactions).not.toHaveBeenCalled();
    });
});
