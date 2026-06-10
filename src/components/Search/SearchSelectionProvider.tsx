import React, {useEffect, useRef, useState} from 'react';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {useSearchQueryContext, useSearchSelectionActions, useSearchSelectionContext} from './SearchContext';
import {SearchSelectionActionsContext, SearchSelectionContext} from './SearchContextDefinitions';
import {deriveSelectedReports} from './selectionBuilders';
import type {SearchData, SearchSelectionActionsValue, SearchSelectionContextValue, SelectedReports, SelectedTransactions} from './types';

type SearchSelectionProviderProps = {
    children: React.ReactNode;
};

type SelectionState = {
    selectedTransactions: SelectedTransactions;
    selectedTransactionIDs: string[];
    selectedReports: SelectedReports[];
    currentSelectedTransactionReportID: string | undefined;
    shouldTurnOffSelectionMode: boolean;
    areAllMatchingItemsSelected: boolean;
};

const defaultSelectionState: SelectionState = {
    selectedTransactions: {},
    selectedTransactionIDs: [],
    selectedReports: [],
    currentSelectedTransactionReportID: undefined,
    shouldTurnOffSelectionMode: false,
    areAllMatchingItemsSelected: false,
};

// Owns selection state + pure setters only; the write actions (toggle/toggleAll) live in SearchWriteActionsProvider.
function SearchSelectionProvider({children}: SearchSelectionProviderProps) {
    const {currentSearchHash} = useSearchQueryContext();

    const areTransactionsEmpty = useRef(true);
    const [selectionState, setSelectionState] = useState<SelectionState>(defaultSelectionState);

    const currentSearchHashRef = useRef(currentSearchHash);
    useEffect(() => {
        currentSearchHashRef.current = currentSearchHash;
    }, [currentSearchHash]);

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
    // untouched, which is what the former `isRefreshingSelection` flag protected.
    const applySelection: SearchSelectionActionsValue['applySelection'] = (updater, options) => {
        setSelectionState((prevState) => {
            const selectedTransactions = updater(prevState.selectedTransactions);
            if (selectedTransactions === prevState.selectedTransactions) {
                return prevState;
            }

            const totalSelectableItemsCount = options?.totalSelectableItemsCount;
            const areAllMatchingItemsSelected =
                totalSelectableItemsCount && totalSelectableItemsCount !== Object.keys(selectedTransactions).length ? false : prevState.areAllMatchingItemsSelected;

            return {
                ...prevState,
                selectedTransactions,
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

    const selectAllMatchingItems: SearchSelectionActionsValue['selectAllMatchingItems'] = (on) => {
        setSelectionState((prevState) => {
            if (prevState.areAllMatchingItemsSelected === on) {
                return prevState;
            }
            return {
                ...prevState,
                areAllMatchingItemsSelected: on,
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
            if (prevState.selectedReports.length === 0 && isEmptyObject(prevState.selectedTransactions) && !prevState.shouldTurnOffSelectionMode && !prevState.areAllMatchingItemsSelected) {
                return prevState;
            }
            return {
                ...prevState,
                shouldTurnOffSelectionMode,
                selectedTransactions: {},
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
            const hasSelectedIDs = prevState.selectedTransactionIDs.length > 0;

            if (!hasSelectedTransactions && !hasSelectedIDs) {
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
            if (hasSelectedIDs) {
                newState.selectedTransactionIDs = prevState.selectedTransactionIDs.filter((ID) => transactionID !== ID);
            }
            return newState;
        });
    };

    const hasSelectedTransactions = selectionState.selectedTransactionIDs.length > 0 || Object.values(selectionState.selectedTransactions).some((t) => t.isSelected);

    const selectionValue: SearchSelectionContextValue = {
        ...selectionState,
        hasSelectedTransactions,
    };

    const selectionActionsValue: SearchSelectionActionsValue = {
        setSelectedTransactions,
        applySelection,
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
function useRowSelection(keyForList: string | undefined): {isSelected: boolean} {
    const {selectedTransactions, areAllMatchingItemsSelected} = useSearchSelectionContext();
    if (!keyForList) {
        return {isSelected: false};
    }
    return {isSelected: areAllMatchingItemsSelected || !!selectedTransactions[keyForList]?.isSelected};
}

/** Aggregate count of currently-selected transactions, for the selection top bar. */
function useSelectionCounts(): {selected: number} {
    const {selectedTransactions} = useSearchSelectionContext();
    const selected = Object.values(selectedTransactions).filter((value) => value?.isSelected).length;
    return {selected};
}

export {SearchSelectionProvider, useSyncSelectedReports, useRowSelection, useSelectionCounts};
