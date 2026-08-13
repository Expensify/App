import CONST from '@src/CONST';
import {getEmptyObject, isEmptyObject} from '@src/types/utils/EmptyObject';

import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';

import type {SearchData, SearchSelectionActionsValue, SearchSelectionContextValue, SelectedReports, SelectedTransactions} from './types';

import {useSearchQueryContext, useSearchSelectionActions, useSearchSelectionContext} from './SearchContext';
import {SearchSelectionActionsContext, SearchSelectionContext} from './SearchContextDefinitions';
import {deriveSelectedReports, isRowChecked} from './selectionBuilders';

type SearchSelectionProviderProps = {
    children: React.ReactNode;
};

type SelectionState = {
    selectedTransactions: SelectedTransactions;
    excludedTransactions: SelectedTransactions;
    selectedTransactionIDs: string[];
    selectedReports: SelectedReports[];
    currentSelectedTransactionReportID: string | undefined;
    shouldTurnOffSelectionMode: boolean;
    areAllMatchingItemsSelected: boolean;
};

const defaultSelectionState: SelectionState = {
    selectedTransactions: {},
    excludedTransactions: {},
    selectedTransactionIDs: [],
    selectedReports: [],
    currentSelectedTransactionReportID: undefined,
    shouldTurnOffSelectionMode: false,
    areAllMatchingItemsSelected: false,
};

// Owns selection state + pure setters only; the write actions (toggle/toggleAll) live in SearchWriteActionsProvider.
function SearchSelectionProvider({children}: SearchSelectionProviderProps) {
    const {currentSearchHash, currentSearchQueryJSON} = useSearchQueryContext();
    const isExpenseSearch = currentSearchQueryJSON?.type === CONST.SEARCH.DATA_TYPES.EXPENSE;

    const areTransactionsEmpty = useRef(true);
    const [selectionState, setSelectionState] = useState<SelectionState>(defaultSelectionState);

    const currentSearchHashRef = useRef(currentSearchHash);
    useEffect(() => {
        currentSearchHashRef.current = currentSearchHash;
    }, [currentSearchHash]);

    // Read through this ref so selectionActionsValue stays stable and actions-only consumers don't re-render on every selection change.
    // Refreshed during the commit, so a click handler reading it decides the same way the reducer will.
    const selectedTransactionsRef = useRef(selectionState.selectedTransactions);
    useLayoutEffect(() => {
        selectedTransactionsRef.current = selectionState.selectedTransactions;
    }, [selectionState.selectedTransactions]);

    // The same for the exclusions, which are rebuilt on every commit, so reading them in render would re-render every row on each press.
    const excludedTransactionsRef = useRef(selectionState.excludedTransactions);
    useLayoutEffect(() => {
        excludedTransactionsRef.current = selectionState.excludedTransactions;
    }, [selectionState.excludedTransactions]);

    // And the flag, so a handler deciding what a row shows reads all three at the same freshness.
    const areAllMatchingItemsSelectedRef = useRef(selectionState.areAllMatchingItemsSelected);
    useLayoutEffect(() => {
        areAllMatchingItemsSelectedRef.current = selectionState.areAllMatchingItemsSelected;
    }, [selectionState.areAllMatchingItemsSelected]);

    const setSelectedTransactions: SearchSelectionActionsValue['setSelectedTransactions'] = (transactionIDs, data) => {
        if (transactionIDs instanceof Array) {
            if (!transactionIDs.length && areTransactionsEmpty.current) {
                areTransactionsEmpty.current = true;
                return;
            }
            areTransactionsEmpty.current = false;
            setSelectionState((prevState) => ({
                ...prevState,
                selectedTransactionIDs: transactionIDs,
            }));
            return;
        }

        // When the caller provides `data`, derive `selectedReports` in the same commit so the
        // two state slices can't diverge for a render.
        if (data) {
            setSelectionState((prevState) => ({
                ...prevState,
                selectedTransactions: transactionIDs,
                selectedReports: deriveSelectedReports(transactionIDs, data),
                shouldTurnOffSelectionMode: false,
            }));
            return;
        }

        setSelectionState((prevState) => ({
            ...prevState,
            selectedTransactions: transactionIDs,
            shouldTurnOffSelectionMode: false,
        }));
    };

    // Read-modify-write the selection atomically. The updater receives the previous map so write actions never
    // need to close over (and re-render on) selection state. `totalSelectableItemsCount` unchecks select-all when
    // the new selection no longer covers every item; omitting it (e.g. during data reconcile) leaves select-all
    // untouched, which is what the former `isRefreshingSelection` flag protected. Expense row toggles preserve
    // an all-matching selection and record their removed entries as explicit exclusions.
    const applySelection: SearchSelectionActionsValue['applySelection'] = (updater, options) => {
        setSelectionState((prevState) => {
            const selectedTransactions = updater(prevState.selectedTransactions);
            const reconciledExcludedTransactions = options?.reconciledExcludedTransactions;
            // An empty map means the selection ran out, unless the caller is naming a row it just took out of it: that row was checked, so something was still selected.
            const hasNamedDeselection = !isEmptyObject(options?.deselectedWithoutEntry ?? {});
            const canRecordNamedDeselection = hasNamedDeselection && !!options?.shouldPreserveAllMatchingSelection;
            const shouldClearAllMatchingSelection = options?.shouldClearAllMatchingSelectionWhenEmpty && isEmptyObject(selectedTransactions) && !canRecordNamedDeselection;
            // A deselection can only be recorded as an exclusion while an all-matching selection is being preserved.
            const shouldRecordExclusions = prevState.areAllMatchingItemsSelected && !!options?.shouldPreserveAllMatchingSelection && !shouldClearAllMatchingSelection;
            const hasDeselectedWithoutEntry = shouldRecordExclusions && hasNamedDeselection;
            // Turning the flag off is a change even when the selection map is untouched, since it is what the rows read to render checked.
            const needsAllMatchingClear = !!shouldClearAllMatchingSelection && prevState.areAllMatchingItemsSelected;
            if (
                selectedTransactions === prevState.selectedTransactions &&
                !hasDeselectedWithoutEntry &&
                !needsAllMatchingClear &&
                (!reconciledExcludedTransactions || reconciledExcludedTransactions === prevState.excludedTransactions)
            ) {
                return prevState;
            }

            const totalSelectableItemsCount = options?.totalSelectableItemsCount;
            let areAllMatchingItemsSelected =
                totalSelectableItemsCount && totalSelectableItemsCount !== Object.keys(selectedTransactions).length ? false : prevState.areAllMatchingItemsSelected;
            let excludedTransactions = reconciledExcludedTransactions ?? prevState.excludedTransactions;

            if (shouldClearAllMatchingSelection) {
                areAllMatchingItemsSelected = false;
            }
            if (shouldRecordExclusions) {
                areAllMatchingItemsSelected = true;
                // Built on whatever the caller passed, so a reconcile that pruned or refreshed exclusions in the same commit is not thrown away.
                excludedTransactions = {...excludedTransactions};
                for (const [key, transaction] of Object.entries(prevState.selectedTransactions)) {
                    if (!Object.hasOwn(selectedTransactions, key)) {
                        excludedTransactions[key] = transaction;
                    }
                }
                for (const key of Object.keys(selectedTransactions)) {
                    if (!Object.hasOwn(prevState.selectedTransactions, key) && Object.hasOwn(excludedTransactions, key)) {
                        delete excludedTransactions[key];
                    }
                }
                // The diff above cannot see a row leave the selection when it was never in it, so the caller names those.
                for (const [key, transaction] of Object.entries(options?.deselectedWithoutEntry ?? {})) {
                    if (!Object.hasOwn(selectedTransactions, key)) {
                        excludedTransactions[key] = transaction;
                    }
                }
                // Under all-matching the exclusions are the whole story, so the selection has run out once they cover every selectable row.
                const fullyExcludedItemCount = options?.countFullyExcludedItems?.(excludedTransactions);
                if (
                    options?.shouldClearAllMatchingSelectionWhenEmpty &&
                    totalSelectableItemsCount !== undefined &&
                    fullyExcludedItemCount !== undefined &&
                    isEmptyObject(selectedTransactions) &&
                    fullyExcludedItemCount >= totalSelectableItemsCount
                ) {
                    areAllMatchingItemsSelected = false;
                    excludedTransactions = {};
                }
            } else if (!areAllMatchingItemsSelected) {
                excludedTransactions = {};
            }

            return {
                ...prevState,
                selectedTransactions,
                excludedTransactions,
                areAllMatchingItemsSelected,
                selectedReports: options?.data ? deriveSelectedReports(selectedTransactions, options.data) : prevState.selectedReports,
                shouldTurnOffSelectionMode: false,
            };
        });
    };

    const setSelectedReports: SearchSelectionActionsValue['setSelectedReports'] = (reports) => {
        setSelectionState((prevState) => {
            if (prevState.selectedReports.length === 0 && reports.length === 0) {
                return prevState;
            }
            return {
                ...prevState,
                selectedReports: reports,
            };
        });
    };

    const setCurrentSelectedTransactionReportID: SearchSelectionActionsValue['setCurrentSelectedTransactionReportID'] = (reportID) => {
        setSelectionState((prevState) => {
            if (reportID === prevState.currentSelectedTransactionReportID) {
                return prevState;
            }
            return {
                ...prevState,
                currentSelectedTransactionReportID: reportID,
            };
        });
    };

    const selectAllMatchingItems: SearchSelectionActionsValue['selectAllMatchingItems'] = (shouldSelectAll) => {
        setSelectionState((prevState) => {
            if (prevState.areAllMatchingItemsSelected === shouldSelectAll && isEmptyObject(prevState.excludedTransactions)) {
                return prevState;
            }
            return {
                ...prevState,
                areAllMatchingItemsSelected: shouldSelectAll,
                excludedTransactions: {},
            };
        });
    };

    const clearSelectedTransactions: SearchSelectionActionsValue['clearSelectedTransactions'] = (searchHashOrClearIDsFlag, shouldTurnOffSelectionMode = false) => {
        if (typeof searchHashOrClearIDsFlag === 'boolean') {
            setSelectedTransactions([]);
            return;
        }

        if (searchHashOrClearIDsFlag === currentSearchHashRef.current) {
            return;
        }

        setSelectionState((prevState) => {
            if (
                prevState.selectedReports.length === 0 &&
                isEmptyObject(prevState.selectedTransactions) &&
                isEmptyObject(prevState.excludedTransactions) &&
                !prevState.shouldTurnOffSelectionMode &&
                !prevState.areAllMatchingItemsSelected
            ) {
                return prevState;
            }
            return {
                ...prevState,
                shouldTurnOffSelectionMode,
                selectedTransactions: {},
                excludedTransactions: {},
                selectedReports: [],
                areAllMatchingItemsSelected: false,
            };
        });
    };

    const removeTransaction: SearchSelectionActionsValue['removeTransaction'] = (transactionID) => {
        if (!transactionID) {
            return;
        }

        setSelectionState((prevState) => {
            const hasSelectedTransactions = !isEmptyObject(prevState.selectedTransactions);
            const hasExcludedTransactions = !isEmptyObject(prevState.excludedTransactions);
            const hasSelectedIDs = prevState.selectedTransactionIDs.length > 0;

            if (!hasSelectedTransactions && !hasExcludedTransactions && !hasSelectedIDs) {
                return prevState;
            }

            const newState = {...prevState};
            if (hasSelectedTransactions) {
                const newSelectedTransactions = Object.entries(prevState.selectedTransactions).reduce((acc, [key, value]) => {
                    if (key === transactionID) {
                        return acc;
                    }
                    acc[key] = value;
                    return acc;
                }, {} as SelectedTransactions);
                newState.selectedTransactions = newSelectedTransactions;
            }
            if (hasExcludedTransactions) {
                const newExcludedTransactions = {...prevState.excludedTransactions};
                delete newExcludedTransactions[transactionID];
                newState.excludedTransactions = newExcludedTransactions;
            }
            if (hasSelectedIDs) {
                newState.selectedTransactionIDs = prevState.selectedTransactionIDs.filter((ID) => transactionID !== ID);
            }
            return newState;
        });
    };

    const hasSelectedTransactions =
        (isExpenseSearch && selectionState.areAllMatchingItemsSelected) ||
        selectionState.selectedTransactionIDs.length > 0 ||
        Object.values(selectionState.selectedTransactions).some((t) => t.isSelected);

    const selectionValue: SearchSelectionContextValue = {
        ...selectionState,
        hasSelectedTransactions,
    };

    const selectionActionsValue: SearchSelectionActionsValue = {
        setSelectedTransactions,
        applySelection,
        getSelectedTransactions: () => selectedTransactionsRef.current,
        getExcludedTransactions: () => excludedTransactionsRef.current,
        getAreAllMatchingItemsSelected: () => areAllMatchingItemsSelectedRef.current,
        setSelectedReports,
        setCurrentSelectedTransactionReportID,
        clearSelectedTransactions,
        removeTransaction,
        selectAllMatchingItems,
    };

    return (
        <SearchSelectionContext value={selectionValue}>
            <SearchSelectionActionsContext value={selectionActionsValue}>{children}</SearchSelectionActionsContext>
        </SearchSelectionContext>
    );
}

/**
 * Derives `selectedReports` from the current selection + visible rows and syncs it into context.
 *
 * Note: `selectedTransactionIDs` and `selectedTransactions` are two separate properties.
 * Setting or clearing one of them does not influence the other.
 * IDs should be used if transaction details are not required.
 *
 * `data` is read via a ref so this effect only fires when `selectedTransactions` changes.
 * Without that, a `data` change (e.g. Onyx push) would fire this effect with a stale
 * `selectedTransactions` from closure and clobber any atomic update made in the same commit.
 */
function useSyncSelectedReports(data: SearchData) {
    const {selectedTransactions} = useSearchSelectionContext();
    const {setSelectedReports} = useSearchSelectionActions();

    const dataRef = useRef(data);
    useEffect(() => {
        dataRef.current = data;
    });

    useEffect(() => {
        setSelectedReports(deriveSelectedReports(selectedTransactions, dataRef.current));
    }, [selectedTransactions, setSelectedReports]);
}

/** Narrow per-row selection read: whether the row for `keyForList` is selected (or covered by select-all). */
function useRowSelection(keyForList: string | undefined, parentGroupKey?: string): {isSelected: boolean} {
    const {selectedTransactions, excludedTransactions = getEmptyObject<SelectedTransactions>(), areAllMatchingItemsSelected} = useSearchSelectionContext();
    if (!keyForList) {
        return {isSelected: false};
    }
    return {isSelected: isRowChecked({rowKey: keyForList, parentGroupKey, selectedTransactions, excludedTransactions, areAllMatchingItemsSelected})};
}

/** Aggregate count of currently-selected transactions, for the selection top bar. */
function useSelectionCounts(): {selected: number} {
    const {selectedTransactions} = useSearchSelectionContext();
    const selected = Object.values(selectedTransactions).filter((value) => value?.isSelected).length;
    return {selected};
}

export {SearchSelectionProvider, useSyncSelectedReports, useRowSelection, useSelectionCounts};
