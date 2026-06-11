import React, {useEffect, useRef, useState} from 'react';
import {getReimbursableTotal, isMoneyRequestReport} from '@libs/ReportUtils';
import {isTransactionListItemType, isTransactionReportGroupListItemType} from '@libs/SearchUIUtils';
import {hasValidModifiedAmount} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {useSearchQueryContext, useSearchSelectionActions, useSearchSelectionContext} from './SearchContext';
import {SearchSelectionActionsContext, SearchSelectionContext} from './SearchContextDefinitions';
import type {ReportActionListItemType, TaskListItemType, TransactionGroupListItemType, TransactionListItemType} from './SearchList/ListItem/types';
import type {SearchSelectionActionsValue, SearchSelectionContextValue, SelectedReports, SelectedTransactions} from './types';

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

function deriveSelectedReports(
    transactionIDs: SelectedTransactions,
    data: TransactionListItemType[] | TransactionGroupListItemType[] | ReportActionListItemType[] | TaskListItemType[],
): SelectedReports[] {
    if (data.length && data.every(isTransactionReportGroupListItemType)) {
        return data
            .filter((item) => {
                if (!isMoneyRequestReport(item)) {
                    return false;
                }
                if (item.transactions.length === 0) {
                    return !!item.keyForList && transactionIDs[item.keyForList]?.isSelected;
                }
                return item.transactions.every(({keyForList}) => transactionIDs[keyForList]?.isSelected);
            })
            .map((item) => ({
                reportID: item.reportID,
                action: item.action ?? CONST.SEARCH.ACTION_TYPES.VIEW,
                total: getReimbursableTotal({
                    total: item.total ?? CONST.DEFAULT_NUMBER_ID,
                    nonReimbursableTotal: item.nonReimbursableTotal,
                    reimbursableTotal: item.reimbursableTotal,
                }),
                policyID: item.policyID,
                canPay: item.canPay,
                canApprove: item.canApprove,
                canSubmit: item.canSubmit,
                canChangeApprover: item.canChangeApprover,
                currency: item.currency,
                chatReportID: item.chatReportID,
                managerID: item.managerID,
                ownerAccountID: item.ownerAccountID,
                parentReportActionID: item.parentReportActionID,
                parentReportID: item.parentReportID,
                type: item.type,
            }));
    }
    if (data.length && data.every(isTransactionListItemType)) {
        return data
            .filter(({keyForList}) => !!keyForList && transactionIDs[keyForList]?.isSelected)
            .map((item) => {
                const total = hasValidModifiedAmount(item) ? Number(item.modifiedAmount) : (item.amount ?? CONST.DEFAULT_NUMBER_ID);
                const action = item.action ?? CONST.SEARCH.ACTION_TYPES.VIEW;

                return {
                    reportID: item.reportID,
                    action,
                    total,
                    policyID: item.policyID,
                    canPay: item.canPay,
                    canApprove: item.canApprove,
                    canSubmit: item.canSubmit,
                    canChangeApprover: item.canChangeApprover,
                    currency: item.currency,
                    chatReportID: item.report?.chatReportID,
                    managerID: item.report?.managerID,
                    ownerAccountID: item.report?.ownerAccountID,
                    parentReportActionID: item.report?.parentReportActionID,
                    parentReportID: item.report?.parentReportID,
                    type: item.report?.type,
                };
            });
    }
    return [];
}

function SearchSelectionProvider({children}: SearchSelectionProviderProps) {
    const {currentSearchHash} = useSearchQueryContext();

    const areTransactionsEmpty = useRef(true);
    const [areAllMatchingItemsSelected, selectAllMatchingItems] = useState(false);
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

    return (
        <SearchSelectionContext value={selectionValue}>
            <SearchSelectionActionsContext value={selectionActionsValue}>{children}</SearchSelectionActionsContext>
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

export {SearchSelectionProvider, useSyncSelectedReports, useRowSelection, useSelectionCounts};
