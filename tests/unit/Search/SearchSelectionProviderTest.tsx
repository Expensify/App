import {act, renderHook} from '@testing-library/react-native';

import {useSearchSelectionActions, useSearchSelectionContext} from '@components/Search/SearchContext';
import {SearchQueryContext} from '@components/Search/SearchContextDefinitions';
import {SearchSelectionProvider} from '@components/Search/SearchSelectionProvider';
import type {SearchQueryContextValue, SelectedTransactions} from '@components/Search/types';

import CONST from '@src/CONST';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

import React from 'react';

const queryContextValue: SearchQueryContextValue = {
    currentSearchHash: 1,
    currentSimilarSearchHash: 1,
    currentSearchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
    currentSearchQueryJSON: undefined,
    suggestedSearches: getEmptyObject<SearchQueryContextValue['suggestedSearches']>(),
    shouldResetSearchQuery: false,
};

function buildSelected(...keys: string[]): SelectedTransactions {
    return Object.fromEntries(
        keys.map((key) => [
            key,
            {
                isSelected: true,
                canReject: false,
                canHold: false,
                canSplit: false,
                hasBeenSplit: false,
                canChangeReport: false,
                isHeld: false,
                canUnhold: false,
                isFromOneTransactionReport: false,
                action: CONST.SEARCH.ACTION_TYPES.VIEW,
                reportID: 'report_1',
                policyID: 'policy_1',
                amount: 100,
                currency: 'USD',
            },
        ]),
    );
}

function wrapper({children}: {children: React.ReactNode}) {
    return (
        <SearchQueryContext value={queryContextValue}>
            <SearchSelectionProvider>{children}</SearchSelectionProvider>
        </SearchQueryContext>
    );
}

function renderSelection() {
    return renderHook(
        () => ({
            state: useSearchSelectionContext(),
            actions: useSearchSelectionActions(),
        }),
        {wrapper},
    );
}

function seedAllMatchingSelection(result: ReturnType<typeof renderSelection>['result']) {
    act(() => {
        result.current.actions.selectAllMatchingItems(true);
        result.current.actions.setSelectedTransactions(buildSelected('tx_1', 'tx_2'));
    });
}

function removeTransaction(selectedTransactions: SelectedTransactions, transactionID: string): SelectedTransactions {
    const nextSelection = {...selectedTransactions};
    delete nextSelection[transactionID];
    return nextSelection;
}

describe('SearchSelectionProvider all-matching exclusions', () => {
    it('keeps all-matching active and records a row exclusion', () => {
        const {result} = renderSelection();
        seedAllMatchingSelection(result);

        act(() => {
            result.current.actions.applySelection((selectedTransactions) => removeTransaction(selectedTransactions, 'tx_1'), {
                totalSelectableItemsCount: 2,
                shouldPreserveAllMatchingSelection: true,
            });
        });

        expect(result.current.state.areAllMatchingItemsSelected).toBe(true);
        expect(result.current.state.hasSelectedTransactions).toBe(true);
        expect(Object.keys(result.current.state.selectedTransactions)).toEqual(['tx_2']);
        expect(Object.keys(result.current.state.excludedTransactions)).toEqual(['tx_1']);
    });

    it('keeps a semantic selection when every loaded row is excluded', () => {
        const {result} = renderSelection();
        seedAllMatchingSelection(result);

        act(() => {
            result.current.actions.applySelection(() => ({}), {
                totalSelectableItemsCount: 2,
                shouldPreserveAllMatchingSelection: true,
            });
        });

        expect(result.current.state.selectedTransactions).toEqual({});
        expect(Object.keys(result.current.state.excludedTransactions)).toEqual(['tx_1', 'tx_2']);
        expect(result.current.state.areAllMatchingItemsSelected).toBe(true);
        expect(result.current.state.hasSelectedTransactions).toBe(true);
    });

    it('removes an exclusion when the row is rechecked', () => {
        const {result} = renderSelection();
        seedAllMatchingSelection(result);
        const tx1 = result.current.state.selectedTransactions.tx_1;
        if (!tx1) {
            throw new Error('Expected tx_1 to be selected');
        }

        act(() => {
            result.current.actions.applySelection((selectedTransactions) => removeTransaction(selectedTransactions, 'tx_1'), {
                totalSelectableItemsCount: 2,
                shouldPreserveAllMatchingSelection: true,
            });
        });
        act(() => {
            result.current.actions.applySelection(
                (selectedTransactions) => {
                    const nextSelection = {...selectedTransactions};
                    nextSelection.tx_1 = tx1;
                    return nextSelection;
                },
                {
                    totalSelectableItemsCount: 2,
                    shouldPreserveAllMatchingSelection: true,
                },
            );
        });

        expect(result.current.state.areAllMatchingItemsSelected).toBe(true);
        expect(Object.keys(result.current.state.excludedTransactions)).toEqual([]);
        expect(Object.keys(result.current.state.selectedTransactions)).toEqual(['tx_2', 'tx_1']);
    });

    it('exits all-matching and clears exclusions when the header deselects all', () => {
        const {result} = renderSelection();
        seedAllMatchingSelection(result);

        act(() => {
            result.current.actions.applySelection((selectedTransactions) => removeTransaction(selectedTransactions, 'tx_1'), {
                totalSelectableItemsCount: 2,
                shouldPreserveAllMatchingSelection: true,
            });
        });
        act(() => {
            result.current.actions.applySelection(() => ({}), {totalSelectableItemsCount: 2});
        });

        expect(result.current.state.areAllMatchingItemsSelected).toBe(false);
        expect(result.current.state.selectedTransactions).toEqual({});
        expect(result.current.state.excludedTransactions).toEqual({});
    });

    it('clears exclusions when selection is cleared or a new all-matching session starts', () => {
        const {result} = renderSelection();
        seedAllMatchingSelection(result);

        act(() => {
            result.current.actions.applySelection((selectedTransactions) => removeTransaction(selectedTransactions, 'tx_1'), {
                totalSelectableItemsCount: 2,
                shouldPreserveAllMatchingSelection: true,
            });
        });
        act(() => result.current.actions.selectAllMatchingItems(true));
        expect(result.current.state.excludedTransactions).toEqual({});

        act(() => result.current.actions.clearSelectedTransactions());
        expect(result.current.state.areAllMatchingItemsSelected).toBe(false);
        expect(result.current.state.excludedTransactions).toEqual({});
    });

    it('retains ordinary page-selection behavior', () => {
        const {result} = renderSelection();
        act(() => result.current.actions.setSelectedTransactions(buildSelected('tx_1', 'tx_2')));

        act(() => {
            result.current.actions.applySelection((selectedTransactions) => removeTransaction(selectedTransactions, 'tx_1'), {
                totalSelectableItemsCount: 2,
                shouldPreserveAllMatchingSelection: true,
            });
        });

        expect(result.current.state.areAllMatchingItemsSelected).toBe(false);
        expect(Object.keys(result.current.state.selectedTransactions)).toEqual(['tx_2']);
        expect(result.current.state.excludedTransactions).toEqual({});
    });
});
