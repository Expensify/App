import {act, renderHook} from '@testing-library/react-native';

import {useSearchSelectionActions, useSearchSelectionContext, useSelectionClearGeneration} from '@components/Search/SearchContext';
import {SearchQueryContext} from '@components/Search/SearchContextDefinitions';
import {SearchSelectionProvider, useRowSelection} from '@components/Search/SearchSelectionProvider';
import type {SearchQueryContextValue, SelectedTransactions} from '@components/Search/types';

import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

import React from 'react';

const expenseQueryJSON = buildSearchQueryJSON('type:expense');
const expenseReportQueryJSON = buildSearchQueryJSON('type:expense-report');
if (!expenseQueryJSON || !expenseReportQueryJSON) {
    throw new Error('Expected the search queries to be valid');
}

let mockCurrentSearchQueryJSON = expenseQueryJSON;

const queryContextValue: SearchQueryContextValue = {
    currentSearchHash: 1,
    currentSimilarSearchHash: 1,
    currentSearchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
    currentSearchQueryJSON: expenseQueryJSON,
    currentDefaultSearchQueryJSON: undefined,
    currentDefaultSearchQueryFilterKeys: new Set(),
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
                displayAmount: 100,
                currency: 'USD',
            },
        ]),
    );
}

function wrapper({children}: {children: React.ReactNode}) {
    return (
        <SearchQueryContext value={{...queryContextValue, currentSearchQueryJSON: mockCurrentSearchQueryJSON}}>
            <SearchSelectionProvider>{children}</SearchSelectionProvider>
        </SearchQueryContext>
    );
}

function renderSelection() {
    return renderHook(
        () => ({
            state: useSearchSelectionContext(),
            actions: useSearchSelectionActions(),
            groupedChildState: useRowSelection('tx_1', 'group_1'),
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
    beforeEach(() => {
        mockCurrentSearchQueryJSON = expenseQueryJSON;
    });

    it('keeps all-matching active and records a row exclusion', () => {
        // Given every matching item selected, with two rows loaded
        const {result} = renderSelection();
        seedAllMatchingSelection(result);

        // When one of them is unchecked
        act(() => {
            result.current.actions.applySelection((selectedTransactions) => removeTransaction(selectedTransactions, 'tx_1'), {
                totalSelectableItemsCount: 2,
                shouldPreserveAllMatchingSelection: true,
            });
        });

        // Then the flag stays on and the dropped row is named, which is the only way to say "everything but this"
        expect(result.current.state.areAllMatchingItemsSelected).toBe(true);
        expect(result.current.state.hasSelectedTransactions).toBe(true);
        expect(Object.keys(result.current.state.selectedTransactions)).toEqual(['tx_2']);
        expect(Object.keys(result.current.state.excludedTransactions)).toEqual(['tx_1']);
    });

    it('keeps a semantic selection when every loaded row is excluded and more results exist', () => {
        // Given every matching item selected, with more results still to page in
        const {result} = renderSelection();
        seedAllMatchingSelection(result);

        // When every row on screen is unchecked
        act(() => {
            result.current.actions.applySelection(() => ({}), {
                totalSelectableItemsCount: 2,
                shouldPreserveAllMatchingSelection: true,
            });
        });

        // Then the selection still means something: an empty map plus exclusions is "every match except these"
        expect(result.current.state.selectedTransactions).toEqual({});
        expect(Object.keys(result.current.state.excludedTransactions)).toEqual(['tx_1', 'tx_2']);
        expect(result.current.state.areAllMatchingItemsSelected).toBe(true);
        expect(result.current.state.hasSelectedTransactions).toBe(true);
    });

    it('does not visually reselect a lazy child whose parent group is excluded', () => {
        // Given a group selected under its own key while every matching item is selected
        const {result} = renderSelection();
        act(() => {
            result.current.actions.selectAllMatchingItems(true);
            result.current.actions.setSelectedTransactions(buildSelected('group_1'));
        });

        // When the group is taken back out of the selection
        act(() => {
            result.current.actions.applySelection(() => ({}), {
                totalSelectableItemsCount: 1,
                shouldPreserveAllMatchingSelection: true,
            });
        });

        // Then its children read unchecked, since the group's exclusion covers the rows it stands for
        expect(result.current.state.areAllMatchingItemsSelected).toBe(true);
        expect(Object.keys(result.current.state.excludedTransactions)).toEqual(['group_1']);
        expect(result.current.groupedChildState.isSelected).toBe(false);
    });

    it('shows a child picked back out of an excluded group as selected, since its own entry outranks the group', () => {
        const {result} = renderSelection();

        // Given every matching item selected, then the group taken back out of it
        act(() => {
            result.current.actions.selectAllMatchingItems(true);
            result.current.actions.setSelectedTransactions(buildSelected('group_1'));
        });
        act(() => {
            result.current.actions.applySelection(() => ({}), {totalSelectableItemsCount: 1, shouldPreserveAllMatchingSelection: true});
        });
        expect(result.current.groupedChildState.isSelected).toBe(false);

        // When one of its children is picked on its own
        act(() => {
            result.current.actions.applySelection(() => buildSelected('tx_1'), {shouldPreserveAllMatchingSelection: true});
        });

        // Then it reads selected, and the exclusion that covered it through the group is gone
        expect(result.current.groupedChildState.isSelected).toBe(true);
        expect(result.current.state.excludedTransactions.tx_1).toBeUndefined();
    });

    it('clears all-matching selection when every result is excluded', () => {
        // Given every matching item selected, in a search with nothing left to page in
        const {result} = renderSelection();
        seedAllMatchingSelection(result);

        // When the last row is unchecked
        act(() => {
            result.current.actions.applySelection(() => ({}), {
                totalSelectableItemsCount: 2,
                shouldPreserveAllMatchingSelection: true,
                shouldClearAllMatchingSelectionWhenEmpty: true,
            });
        });

        // Then the flag goes off, rather than a footer advertising every match over a selection the user emptied
        expect(result.current.state.selectedTransactions).toEqual({});
        expect(result.current.state.excludedTransactions).toEqual({});
        expect(result.current.state.areAllMatchingItemsSelected).toBe(false);
        expect(result.current.state.hasSelectedTransactions).toBe(false);
    });

    it('removes an exclusion when the row is rechecked', () => {
        // Given a row unchecked out of an all-matching selection, and then checked again
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
        // When it is put back
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

        // Then nothing is left excluded, or a bulk action would skip the row the user just re-checked
        expect(result.current.state.areAllMatchingItemsSelected).toBe(true);
        expect(Object.keys(result.current.state.excludedTransactions)).toEqual([]);
        expect(Object.keys(result.current.state.selectedTransactions)).toEqual(['tx_2', 'tx_1']);
    });

    it('atomically refreshes and prunes exclusions during data reconciliation', () => {
        // Given a row excluded from an all-matching selection
        const {result} = renderSelection();
        seedAllMatchingSelection(result);

        act(() => {
            result.current.actions.applySelection((selectedTransactions) => removeTransaction(selectedTransactions, 'tx_1'), {
                totalSelectableItemsCount: 2,
                shouldPreserveAllMatchingSelection: true,
            });
        });

        // When a data push rebuilds that exclusion with a new amount, and later prunes it
        const refreshedExclusion = buildSelected('tx_1');
        if (!refreshedExclusion.tx_1) {
            throw new Error('Expected tx_1 exclusion fixture');
        }
        refreshedExclusion.tx_1.amount = 500;
        act(() => {
            result.current.actions.applySelection((selectedTransactions) => selectedTransactions, {reconciledExcludedTransactions: refreshedExclusion});
        });

        // Then the exclusion follows the live row, and the flag survives both commits
        expect(result.current.state.excludedTransactions.tx_1?.amount).toBe(500);
        expect(result.current.state.areAllMatchingItemsSelected).toBe(true);

        act(() => {
            result.current.actions.applySelection((selectedTransactions) => selectedTransactions, {reconciledExcludedTransactions: {}});
        });

        expect(result.current.state.excludedTransactions).toEqual({});
        expect(result.current.state.areAllMatchingItemsSelected).toBe(true);
    });

    it('exits all-matching and clears exclusions when the header deselects all', () => {
        // Given an all-matching selection carrying one exclusion
        const {result} = renderSelection();
        seedAllMatchingSelection(result);

        // When the header checkbox clears everything, which commits without asking to preserve the flag
        act(() => {
            result.current.actions.applySelection((selectedTransactions) => removeTransaction(selectedTransactions, 'tx_1'), {
                totalSelectableItemsCount: 2,
                shouldPreserveAllMatchingSelection: true,
            });
        });
        act(() => {
            result.current.actions.applySelection(() => ({}), {totalSelectableItemsCount: 2});
        });

        // Then the flag and its exclusions go together, rather than leaving exclusions nothing is selected against
        expect(result.current.state.areAllMatchingItemsSelected).toBe(false);
        expect(result.current.state.selectedTransactions).toEqual({});
        expect(result.current.state.excludedTransactions).toEqual({});
    });

    it('clears exclusions when selection is cleared or a new all-matching session starts', () => {
        // Given an all-matching selection carrying one exclusion
        const {result} = renderSelection();
        seedAllMatchingSelection(result);

        act(() => {
            result.current.actions.applySelection((selectedTransactions) => removeTransaction(selectedTransactions, 'tx_1'), {
                totalSelectableItemsCount: 2,
                shouldPreserveAllMatchingSelection: true,
            });
        });
        // When a fresh all-matching session starts, the exclusions it overrode are gone
        act(() => result.current.actions.selectAllMatchingItems(true));
        expect(result.current.state.excludedTransactions).toEqual({});

        // Then a clear takes the flag with it, so nothing survives to be subtracted from the next selection
        act(() => result.current.actions.clearSelectedTransactions());
        expect(result.current.state.areAllMatchingItemsSelected).toBe(false);
        expect(result.current.state.excludedTransactions).toEqual({});
    });

    it('retains ordinary page-selection behavior', () => {
        // Given two rows picked on the page, with no all-matching selection behind them
        const {result} = renderSelection();
        act(() => result.current.actions.setSelectedTransactions(buildSelected('tx_1', 'tx_2')));

        // When one is unchecked
        act(() => {
            result.current.actions.applySelection((selectedTransactions) => removeTransaction(selectedTransactions, 'tx_1'), {
                totalSelectableItemsCount: 2,
                shouldPreserveAllMatchingSelection: true,
            });
        });

        // Then it simply leaves the map: exclusions are for all-matching, the one state that can carry them
        expect(result.current.state.areAllMatchingItemsSelected).toBe(false);
        expect(Object.keys(result.current.state.selectedTransactions)).toEqual(['tx_2']);
        expect(result.current.state.excludedTransactions).toEqual({});
    });

    it('keeps the original expense-report behavior when a report is deselected', () => {
        // Given an all-matching selection in a Reports search, where a row is a whole report
        mockCurrentSearchQueryJSON = expenseReportQueryJSON;
        const {result} = renderSelection();
        seedAllMatchingSelection(result);

        // When a report is deselected, which commits without asking to preserve the flag
        act(() => {
            result.current.actions.applySelection((selectedTransactions) => removeTransaction(selectedTransactions, 'tx_1'), {
                totalSelectableItemsCount: 2,
                shouldPreserveAllMatchingSelection: false,
            });
        });

        // Then the flag drops, which is main's behaviour for that surface and is left as it was
        expect(result.current.state.areAllMatchingItemsSelected).toBe(false);
        expect(Object.keys(result.current.state.selectedTransactions)).toEqual(['tx_2']);
        expect(result.current.state.excludedTransactions).toEqual({});
    });

    it('does not treat an empty expense-report all-matching state as a loaded selection', () => {
        // Given a Reports search with nothing loaded
        mockCurrentSearchQueryJSON = expenseReportQueryJSON;
        const {result} = renderSelection();

        // When every matching item is selected from the menu
        act(() => result.current.actions.selectAllMatchingItems(true));

        // Then the flag is on while nothing is loaded to act on, which is what the bulk bar reads
        expect(result.current.state.areAllMatchingItemsSelected).toBe(true);
        expect(result.current.state.hasSelectedTransactions).toBe(false);
    });
});

describe('SearchSelectionProvider clear generation', () => {
    function renderClearGeneration() {
        return renderHook(() => ({state: useSearchSelectionContext(), actions: useSearchSelectionActions(), clearGeneration: useSelectionClearGeneration()}), {wrapper});
    }

    it('moves only when a clear empties the search selection, so a no-op clear cannot end a range session', () => {
        // Given nothing selected
        const {result} = renderClearGeneration();

        // When a clear finds nothing to clear, on either surface
        act(() => result.current.actions.clearSelectedTransactions(true));
        act(() => result.current.actions.clearSelectedTransactions());

        // Then the counter stays where it was
        expect(result.current.clearGeneration).toBe(0);
    });

    it('stays put when the ID list is cleared, since that is the report list’s selection and not the one it speaks for', () => {
        // Given rows selected by ID, which only the report list reads
        const {result} = renderClearGeneration();
        act(() => result.current.actions.setSelectedTransactions(['tx_1']));

        // When that list is cleared
        act(() => result.current.actions.clearSelectedTransactions(true));

        // Then the IDs go, and no range over the search rows is told to end
        expect(result.current.state.selectedTransactionIDs).toEqual([]);
        expect(result.current.clearGeneration).toBe(0);
    });

    it('moves when the search selection is emptied, which is what a range over those rows can no longer narrow', () => {
        // Given rows selected in the search
        const {result} = renderClearGeneration();
        act(() => result.current.actions.setSelectedTransactions(buildSelected('tx_1')));

        // When the selection is cleared
        act(() => result.current.actions.clearSelectedTransactions());

        // Then the counter moves once
        expect(result.current.state.selectedTransactions).toEqual({});
        expect(result.current.clearGeneration).toBe(1);
    });
});
