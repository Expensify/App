import React, {useContext, useEffect, useRef, useState} from 'react';
import {isMoneyRequestReport} from '@libs/ReportUtils';
import {isTransactionListItemType, isTransactionReportGroupListItemType} from '@libs/SearchUIUtils';
import {hasValidModifiedAmount} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {SearchSelectionActionsContext, SearchSelectionContext} from './SearchContextDefinitions';
import {useSearchQueryContext} from './SearchQueryProvider';
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

function SearchSelectionProvider({children}: SearchSelectionProviderProps) {
    const {currentSearchHash} = useSearchQueryContext();

    const areTransactionsEmpty = useRef(true);
    const [areAllMatchingItemsSelected, selectAllMatchingItems] = useState(false);
    const [shouldShowSelectAllMatchingItems, setShouldShowSelectAllMatchingItems] = useState(false);
    const [selectionState, setSelectionState] = useState<SelectionState>(defaultSelectionState);

    const currentSearchHashRef = useRef(currentSearchHash);
    useEffect(() => {
        currentSearchHashRef.current = currentSearchHash;
    }, [currentSearchHash]);

    const setSelectedTransactions: SearchSelectionActionsValue['setSelectedTransactions'] = (transactionIDs, data = []) => {
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

        // When selecting transactions, we also need to manage the reports to which these transactions belong. This is done to ensure proper exporting to CSV.
        let matchingReports: SelectedReports[] = [];

        if (data.length && data.every(isTransactionReportGroupListItemType)) {
            matchingReports = data
                .filter((item) => {
                    if (!isMoneyRequestReport(item)) {
                        return false;
                    }
                    if (item.transactions.length === 0) {
                        return !!item.keyForList && transactionIDs[item.keyForList]?.isSelected;
                    }
                    return item.transactions.every(({keyForList}) => transactionIDs[keyForList]?.isSelected);
                })
                .map(
                    ({
                        reportID,
                        action = CONST.SEARCH.ACTION_TYPES.VIEW,
                        total = CONST.DEFAULT_NUMBER_ID,
                        policyID,
                        allActions = [action],
                        currency,
                        chatReportID,
                        managerID,
                        ownerAccountID,
                        parentReportActionID,
                        parentReportID,
                        type,
                    }) => ({
                        reportID,
                        action,
                        total,
                        policyID,
                        allActions,
                        currency,
                        chatReportID,
                        managerID,
                        ownerAccountID,
                        parentReportActionID,
                        parentReportID,
                        type,
                    }),
                );
        } else if (data.length && data.every(isTransactionListItemType)) {
            matchingReports = data
                .filter(({keyForList}) => !!keyForList && transactionIDs[keyForList]?.isSelected)
                .map((item) => {
                    const total = hasValidModifiedAmount(item) ? Number(item.modifiedAmount) : (item.amount ?? CONST.DEFAULT_NUMBER_ID);
                    const action = item.action ?? CONST.SEARCH.ACTION_TYPES.VIEW;

                    return {
                        reportID: item.reportID,
                        action,
                        total,
                        policyID: item.policyID,
                        allActions: item.allActions ?? [action],
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

        setSelectionState((prevState) => ({
            ...prevState,
            selectedReports: matchingReports,
            selectedTransactions: transactionIDs,
            shouldTurnOffSelectionMode: false,
        }));
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

        setShouldShowSelectAllMatchingItems(false);
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
        shouldShowSelectAllMatchingItems,
        areAllMatchingItemsSelected,
    };

    const selectionActionsValue: SearchSelectionActionsValue = {
        setSelectedTransactions,
        setCurrentSelectedTransactionReportID,
        clearSelectedTransactions,
        removeTransaction,
        setShouldShowSelectAllMatchingItems,
        selectAllMatchingItems,
    };

    return (
        <SearchSelectionContext value={selectionValue}>
            <SearchSelectionActionsContext value={selectionActionsValue}>{children}</SearchSelectionActionsContext>
        </SearchSelectionContext>
    );
}

/**
 * Note: `selectedTransactionIDs` and `selectedTransactions` are two separate properties.
 * Setting or clearing one of them does not influence the other.
 * IDs should be used if transaction details are not required.
 */
function useSearchSelectionContext() {
    return useContext(SearchSelectionContext);
}

function useSearchSelectionActions() {
    return useContext(SearchSelectionActionsContext);
}

export {SearchSelectionProvider, useSearchSelectionContext, useSearchSelectionActions, SearchSelectionContext, SearchSelectionActionsContext};
