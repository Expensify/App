import {renderHook} from '@testing-library/react-native';
import React from 'react';
import {SearchSelectionActionsContext, SearchSelectionContext} from '@components/Search/SearchContext';
import {useRowSelection, useSelectionCounts} from '@components/Search/SearchSelectionProvider';
import type {SearchSelectionActionsValue, SearchSelectionContextValue, SelectedTransactions} from '@components/Search/types';
import CONST from '@src/CONST';

const baseSelectionContext = {
    currentSelectedTransactionReportID: undefined,
    selectedTransactionIDs: [],
    selectedReports: [],
    shouldTurnOffSelectionMode: false,
    hasSelectedTransactions: false,
    areAllMatchingItemsSelected: false,
} satisfies Omit<SearchSelectionContextValue, 'selectedTransactions'>;

const noopSelectionActions: SearchSelectionActionsValue = {
    setCurrentSelectedTransactionReportID: () => {},
    setSelectedTransactions: () => {},
    setSelectedReports: () => {},
    removeTransaction: () => {},
    clearSelectedTransactions: () => {},
    selectAllMatchingItems: () => {},
};

function buildSelected(...keys: string[]): SelectedTransactions {
    return keys.reduce<SelectedTransactions>((acc, key) => {
        acc[key] = {
            isSelected: true,
            canReject: true,
            canHold: true,
            canSplit: false,
            hasBeenSplit: false,
            canChangeReport: false,
            isHeld: false,
            canUnhold: true,
            isFromOneTransactionReport: false,
            action: CONST.SEARCH.ACTION_TYPES.VIEW,
            reportID: 'report_1',
            policyID: 'policy_1',
            amount: 100,
            currency: 'USD',
        };
        return acc;
    }, {});
}

function renderWithSelection<T>(hook: () => T, selectionValue: SearchSelectionContextValue): T {
    const {result} = renderHook(hook, {
        wrapper: ({children}: {children: React.ReactNode}) => (
            <SearchSelectionContext value={selectionValue}>
                <SearchSelectionActionsContext value={noopSelectionActions}>{children}</SearchSelectionActionsContext>
            </SearchSelectionContext>
        ),
    });
    return result.current;
}

function renderRowSelection({
    keyForList,
    selectedTransactions,
    areAllMatchingItemsSelected,
}: {
    keyForList: string | undefined;
    selectedTransactions: SelectedTransactions;
    areAllMatchingItemsSelected: boolean;
}): {isSelected: boolean} {
    return renderWithSelection(() => useRowSelection(keyForList), {...baseSelectionContext, areAllMatchingItemsSelected, selectedTransactions});
}

function renderSelectionCounts(selectedTransactions: SelectedTransactions): {selected: number} {
    return renderWithSelection(() => useSelectionCounts(), {...baseSelectionContext, selectedTransactions});
}

describe('useRowSelection', () => {
    it('reads per-key selection state when areAllMatchingItemsSelected is false', () => {
        expect(renderRowSelection({keyForList: 'tx_1', selectedTransactions: buildSelected('tx_1'), areAllMatchingItemsSelected: false}).isSelected).toBe(true);
        expect(renderRowSelection({keyForList: 'tx_2', selectedTransactions: buildSelected('tx_1'), areAllMatchingItemsSelected: false}).isSelected).toBe(false);
    });

    it('marks the row selected when areAllMatchingItemsSelected is true even if the key is absent', () => {
        expect(renderRowSelection({keyForList: 'tx_not_in_map', selectedTransactions: {}, areAllMatchingItemsSelected: true}).isSelected).toBe(true);
    });

    it('returns not-selected when keyForList is undefined', () => {
        expect(renderRowSelection({keyForList: undefined, selectedTransactions: buildSelected('tx_1'), areAllMatchingItemsSelected: false}).isSelected).toBe(false);
    });
});

describe('useSelectionCounts', () => {
    it('counts only entries flagged isSelected', () => {
        const selected = buildSelected('tx_1', 'tx_2');
        selected.tx_3 = {...selected.tx_1, isSelected: false};
        expect(renderSelectionCounts(selected).selected).toBe(2);
    });

    it('returns 0 when nothing is selected', () => {
        expect(renderSelectionCounts({}).selected).toBe(0);
    });
});
