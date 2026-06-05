import React, {useEffect, useRef, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {isReportActionListItemType, isTaskListItemType, isTransactionListItemType} from '@libs/SearchUIUtils';
import {isTransactionPendingDelete} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {useSearchQueryContext, useSearchRowSelectionActions, useSearchSelectionActions, useSearchSelectionContext} from './SearchContext';
import {defaultSearchSelectionScreenContext, SearchRowSelectionActionsContext, SearchSelectionActionsContext, SearchSelectionContext} from './SearchContextDefinitions';
import type {ReportActionListItemType, TaskListItemType, TransactionGroupListItemType, TransactionListItemType} from './SearchList/ListItem/types';
import {deriveSelectedReports, mapEmptyReportToSelectedEntry, mapTransactionItemToSelectedEntry, prepareTransactionsList} from './selectionBuilders';
import type {
    SearchRowSelectionActionsValue,
    SearchSelectionActionsValue,
    SearchSelectionContextValue,
    SearchSelectionScreenContext,
    SelectedReports,
    SelectedTransactionInfo,
    SelectedTransactions,
} from './types';

type SearchSelectionProviderProps = {
    children: React.ReactNode;
};

type SelectionState = {
    selectedTransactions: SelectedTransactions;
    selectedTransactionIDs: string[];
    selectedReports: SelectedReports[];
    currentSelectedTransactionReportID: string | undefined;
    shouldTurnOffSelectionMode: boolean;
};

const defaultSelectionState: SelectionState = {
    selectedTransactions: {},
    selectedTransactionIDs: [],
    selectedReports: [],
    currentSelectedTransactionReportID: undefined,
    shouldTurnOffSelectionMode: false,
};

function SearchSelectionProvider({children}: SearchSelectionProviderProps) {
    const {currentSearchHash} = useSearchQueryContext();

    const areTransactionsEmpty = useRef(true);
    const [areAllMatchingItemsSelected, selectAllMatchingItems] = useState(false);
    const [selectionState, setSelectionState] = useState<SelectionState>(defaultSelectionState);

    const currentSearchHashRef = useRef(currentSearchHash);

    useEffect(() => {
        currentSearchHashRef.current = currentSearchHash;
    }, [currentSearchHash]);

    // When new data loads, the reconcile-with-data effect rebuilds `selectedTransactions`. This flag lets
    // `updateSelectAllMatchingItemsState` skip its "are all selected?" check while that rebuild is in flight,
    // so a reconcile doesn't spuriously turn select-all off. Set by `reconcileSelection`, cleared once the
    // new `selectedTransactions` commits.
    const isRefreshingSelection = useRef(false);

    // Screen-derived inputs for the write actions, populated by `SearchSelectionController` each render.
    const screenContextRef = useRef<SearchSelectionScreenContext>(defaultSearchSelectionScreenContext);

    // Latest committed selection, so the stable write actions can read it at call time without closing over
    // it (closing over it would give them a new identity on every selection change and re-render consumers).
    const selectedTransactionsRef = useRef(selectionState.selectedTransactions);
    useEffect(() => {
        selectedTransactionsRef.current = selectionState.selectedTransactions;
    });

    useEffect(() => {
        isRefreshingSelection.current = false;
    }, [selectionState.selectedTransactions]);

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
        // two state slices can't diverge for a render. Used by callers (e.g. the refresh-selection
        // effect) that already have `filteredData` in scope and react to it changing.
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

    const clearSelectedTransactions: SearchSelectionActionsValue['clearSelectedTransactions'] = (searchHashOrClearIDsFlag, shouldTurnOffSelectionMode = false) => {
        if (typeof searchHashOrClearIDsFlag === 'boolean') {
            setSelectedTransactions([]);
            return;
        }

        if (searchHashOrClearIDsFlag === currentSearchHashRef.current) {
            return;
        }

        setSelectionState((prevState) => {
            if (prevState.selectedReports.length === 0 && isEmptyObject(prevState.selectedTransactions) && !prevState.shouldTurnOffSelectionMode) {
                return prevState;
            }
            return {
                ...prevState,
                shouldTurnOffSelectionMode,
                selectedTransactions: {},
                selectedReports: [],
            };
        });

        selectAllMatchingItems(false);
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

    // Turn select-all off once the selection no longer covers every selectable item. Reads the count from the
    // screen-context ref so it stays in lock-step with whatever `SearchSelectionController` last reported.
    const updateSelectAllMatchingItemsState = (updatedSelectedTransactions: SelectedTransactions) => {
        const {totalSelectableItemsCount} = screenContextRef.current;
        if (!totalSelectableItemsCount || isRefreshingSelection.current) {
            return;
        }
        if (totalSelectableItemsCount !== Object.keys(updatedSelectedTransactions).length) {
            selectAllMatchingItems(false);
        }
    };

    // Atomically replace the selection (and derive `selectedReports` in the same commit) from freshly-loaded
    // data, flagging the refresh so `updateSelectAllMatchingItemsState` doesn't fight it for a render.
    const reconcileSelection: SearchRowSelectionActionsValue['reconcileSelection'] = (newList, data) => {
        setSelectedTransactions(newList, data);
        isRefreshingSelection.current = true;
    };

    const toggle: SearchRowSelectionActionsValue['toggle'] = (item, itemTransactions) => {
        if (isReportActionListItemType(item)) {
            return;
        }
        if (isTaskListItemType(item)) {
            return;
        }

        const {transactions, searchResultsData, currentUserLogin, currentUserAccountID, outstandingReportsByPolicyID, selfDMReport, isProduction, areItemsGrouped, filteredData} =
            screenContextRef.current;
        const selectedTransactions = selectedTransactionsRef.current;

        if (isTransactionListItemType(item)) {
            if (!item.keyForList) {
                return;
            }
            if (isTransactionPendingDelete(item)) {
                return;
            }
            const itemTransaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${item.transactionID}`] as OnyxEntry<Transaction>;
            const originalItemTransaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${itemTransaction?.comment?.originalTransactionID}`];
            const itemParentReport = searchResultsData?.[`${ONYXKEYS.COLLECTION.REPORT}${item.report?.parentReportID}`] as OnyxEntry<Report>;
            const updatedTransactions = prepareTransactionsList(
                item,
                itemTransaction,
                originalItemTransaction,
                selectedTransactions,
                currentUserLogin,
                currentUserAccountID,
                outstandingReportsByPolicyID,
                itemParentReport,
                selfDMReport,
                isProduction,
            );

            // Tag individual transactions with their parent group key so export filtering can derive the group when needed.
            if (areItemsGrouped) {
                const parentGroup = (filteredData as TransactionGroupListItemType[]).find((group) => group.transactions.some((transaction) => transaction.keyForList === item.keyForList));
                if (parentGroup?.keyForList && updatedTransactions[item.keyForList]) {
                    updatedTransactions[item.keyForList] = {...updatedTransactions[item.keyForList], groupKey: parentGroup.keyForList};
                }
            }

            setSelectedTransactions(updatedTransactions);
            updateSelectAllMatchingItemsState(updatedTransactions);
            return;
        }

        const currentTransactions = itemTransactions ?? item.transactions;

        if (currentTransactions.length === 0 && item.keyForList) {
            const reportKey = item.keyForList;

            if (item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                return;
            }

            if (selectedTransactions[reportKey]?.isSelected) {
                const reducedSelectedTransactions: SelectedTransactions = {
                    ...selectedTransactions,
                };
                delete reducedSelectedTransactions[reportKey];
                setSelectedTransactions(reducedSelectedTransactions);
                updateSelectAllMatchingItemsState(reducedSelectedTransactions);
                return;
            }

            const [, emptyReportSelection] = mapEmptyReportToSelectedEntry(item);
            const updatedTransactions = {
                ...selectedTransactions,
                [reportKey]: emptyReportSelection,
            };
            setSelectedTransactions(updatedTransactions);
            updateSelectAllMatchingItemsState(updatedTransactions);
            return;
        }

        if (currentTransactions.some((transaction) => selectedTransactions[transaction.keyForList]?.isSelected)) {
            const reducedSelectedTransactions: SelectedTransactions = {
                ...selectedTransactions,
            };

            for (const transaction of currentTransactions) {
                delete reducedSelectedTransactions[transaction.keyForList];
            }

            setSelectedTransactions(reducedSelectedTransactions);
            updateSelectAllMatchingItemsState(reducedSelectedTransactions);
            return;
        }

        const updatedTransactions = {
            ...selectedTransactions,
            ...Object.fromEntries(
                currentTransactions
                    .filter((t) => !isTransactionPendingDelete(t))
                    .map((transactionItem) => {
                        const itemTransaction = (searchResultsData?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionItem.transactionID}`] ??
                            transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionItem.transactionID}`]) as OnyxEntry<Transaction>;
                        const originalItemTransaction =
                            searchResultsData?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${itemTransaction?.comment?.originalTransactionID}`] ??
                            transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${itemTransaction?.comment?.originalTransactionID}`];
                        const itemParentReport = searchResultsData?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionItem.report?.parentReportID}`] as OnyxEntry<Report>;
                        const [key, entry] = mapTransactionItemToSelectedEntry(
                            transactionItem,
                            itemTransaction,
                            originalItemTransaction,
                            currentUserLogin,
                            currentUserAccountID,
                            outstandingReportsByPolicyID,
                            true,
                            itemParentReport,
                            selfDMReport,
                            isProduction,
                        );
                        return [key, {...entry, groupKey: item.keyForList}];
                    }),
            ),
        };
        setSelectedTransactions(updatedTransactions);
        updateSelectAllMatchingItemsState(updatedTransactions);
    };

    const toggleAll: SearchRowSelectionActionsValue['toggleAll'] = () => {
        const selectedTransactions = selectedTransactionsRef.current;
        const {transactions, searchResultsData, currentUserLogin, currentUserAccountID, outstandingReportsByPolicyID, selfDMReport, isProduction, areItemsGrouped, filteredData} =
            screenContextRef.current;

        const totalSelected = Object.keys(selectedTransactions).length;

        if (totalSelected > 0) {
            clearSelectedTransactions();
            updateSelectAllMatchingItemsState({});
            return;
        }

        let updatedTransactions: SelectedTransactions;
        if (areItemsGrouped) {
            const allSelections: Array<[string, SelectedTransactionInfo]> = (filteredData as TransactionGroupListItemType[]).flatMap((item) => {
                if (item.transactions.length === 0 && item.keyForList) {
                    if (item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                        return [];
                    }
                    return [mapEmptyReportToSelectedEntry(item)];
                }
                return item.transactions
                    .filter((t) => !isTransactionPendingDelete(t))
                    .map((transactionItem) => {
                        const itemTransaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionItem.transactionID}`] as OnyxEntry<Transaction>;
                        const originalItemTransaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${itemTransaction?.comment?.originalTransactionID}`];
                        const itemParentReport = searchResultsData?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionItem.report?.parentReportID}`] as OnyxEntry<Report>;
                        const [key, entry] = mapTransactionItemToSelectedEntry(
                            transactionItem,
                            itemTransaction,
                            originalItemTransaction,
                            currentUserLogin,
                            currentUserAccountID,
                            outstandingReportsByPolicyID,
                            true,
                            itemParentReport,
                            selfDMReport,
                            isProduction,
                        );
                        return [key, {...entry, groupKey: item.keyForList}] as [string, SelectedTransactionInfo];
                    });
            });
            updatedTransactions = Object.fromEntries(allSelections);
        } else {
            // When items are not grouped, data is TransactionListItemType[] not TransactionGroupListItemType[]
            updatedTransactions = Object.fromEntries(
                (filteredData as TransactionListItemType[])
                    .filter((t) => !isTransactionPendingDelete(t))
                    .map((transactionItem) => {
                        const itemTransaction = searchResultsData?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionItem.transactionID}`] as OnyxEntry<Transaction>;
                        const originalItemTransaction = searchResultsData?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${itemTransaction?.comment?.originalTransactionID}`];
                        const itemParentReport = searchResultsData?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionItem.report?.parentReportID}`] as OnyxEntry<Report>;
                        return mapTransactionItemToSelectedEntry(
                            transactionItem,
                            itemTransaction,
                            originalItemTransaction,
                            currentUserLogin,
                            currentUserAccountID,
                            outstandingReportsByPolicyID,
                            true,
                            itemParentReport,
                            selfDMReport,
                            isProduction,
                        );
                    }),
            );
        }
        setSelectedTransactions(updatedTransactions, filteredData);
        updateSelectAllMatchingItemsState(updatedTransactions);
    };

    const clearAll: SearchRowSelectionActionsValue['clearAll'] = () => {
        clearSelectedTransactions();
        updateSelectAllMatchingItemsState({});
    };

    const hasSelectedTransactions = selectionState.selectedTransactionIDs.length > 0 || Object.values(selectionState.selectedTransactions).some((t) => t.isSelected);

    const selectionValue: SearchSelectionContextValue = {
        ...selectionState,
        hasSelectedTransactions,
        areAllMatchingItemsSelected,
    };

    const selectionActionsValue: SearchSelectionActionsValue = {
        setSelectedTransactions,
        setSelectedReports,
        setCurrentSelectedTransactionReportID,
        clearSelectedTransactions,
        removeTransaction,
        selectAllMatchingItems,
    };

    const rowSelectionActionsValue: SearchRowSelectionActionsValue = {
        toggle,
        toggleAll,
        clearAll,
        reconcileSelection,
        screenContextRef,
    };

    return (
        <SearchSelectionContext value={selectionValue}>
            <SearchSelectionActionsContext value={selectionActionsValue}>
                <SearchRowSelectionActionsContext value={rowSelectionActionsValue}>{children}</SearchRowSelectionActionsContext>
            </SearchSelectionActionsContext>
        </SearchSelectionContext>
    );
}

/**
 * Derives `selectedReports` from the current selection + visible rows and syncs it into context.
 * Used by the Search component so `toggleTransaction` can stay independent of `filteredData`.
 *
 * Note: `selectedTransactionIDs` and `selectedTransactions` are two separate properties.
 * Setting or clearing one of them does not influence the other.
 * IDs should be used if transaction details are not required.
 *
 * `data` is read via a ref so this effect only fires when `selectedTransactions` changes.
 * Without that, a `data` change (e.g. Onyx push) would fire this effect with a stale
 * `selectedTransactions` from closure and clobber any atomic update made in the same commit.
 */
function useSyncSelectedReports(data: TransactionListItemType[] | TransactionGroupListItemType[] | ReportActionListItemType[] | TaskListItemType[]) {
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

/**
 * Narrow per-row selection read. Replaces `joinedItem.isSelected` consumption inside rows so the
 * screen-level `applySelectionToItem` no longer needs to mint new item objects on selection change.
 */
function useRowSelection(keyForList: string | undefined): {isSelected: boolean} {
    const {selectedTransactions, areAllMatchingItemsSelected} = useSearchSelectionContext();
    if (!keyForList) {
        return {isSelected: false};
    }
    return {isSelected: areAllMatchingItemsSelected || !!selectedTransactions[keyForList]?.isSelected};
}

/**
 * Aggregate selection count for the top bar. `total`/`isAllSelected`/`isIndeterminate` belong to
 * the SearchList header migration and land with that consumer (see PRD `useSelectionCounts`).
 */
function useSelectionCounts(): {selected: number} {
    const {selectedTransactions} = useSearchSelectionContext();
    const selected = Object.values(selectedTransactions).filter((value) => value?.isSelected).length;
    return {selected};
}

/**
 * Stable-identity selection write actions for rows and the table header. Sourced from the dedicated
 * row-selection actions context, so dispatching a toggle never re-renders the screen or the rows.
 */
function useRowSelectionActions(): Pick<SearchRowSelectionActionsValue, 'toggle' | 'toggleAll' | 'clearAll'> {
    const {toggle, toggleAll, clearAll} = useSearchRowSelectionActions();
    return {toggle, toggleAll, clearAll};
}

export {SearchSelectionProvider, useSyncSelectedReports, useRowSelection, useSelectionCounts, useRowSelectionActions};
