import React, {useCallback, useContext, useMemo, useRef, useState} from 'react';
import {isMoneyRequestReport} from '@libs/ReportUtils';
import {isTransactionListItemType, isTransactionReportGroupListItemType} from '@libs/SearchUIUtils';
import {hasValidModifiedAmount} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {SearchSelectionContextProps, SelectedTransactions} from './types';
import {useSearchContext} from './SearchContext';

const defaultSearchSelectionContext: SearchSelectionContextProps = {
    selectedTransactions: {},
    selectedTransactionIDs: [],
    selectedReports: [],
    shouldTurnOffSelectionMode: false,
    setSelectedTransactions: () => {},
    clearSelectedTransactions: () => {},
    removeTransaction: () => {},
    showSelectAllMatchingItems: false,
    shouldShowSelectAllMatchingItems: () => {},
    areAllMatchingItemsSelected: false,
    selectAllMatchingItems: () => {},
};

const SearchSelectionContext = React.createContext<SearchSelectionContextProps>(defaultSearchSelectionContext);

function SearchSelectionContextProvider({children}: ChildrenProps) {
    const {currentSearchHash} = useSearchContext();
    const [showSelectAllMatchingItems, shouldShowSelectAllMatchingItems] = useState(false);
    const [areAllMatchingItemsSelected, selectAllMatchingItems] = useState(false);
    const [selectionData, setSelectionData] = useState({
        selectedTransactions: {} as SelectedTransactions,
        selectedTransactionIDs: [] as string[],
        selectedReports: [] as SearchSelectionContextProps['selectedReports'],
        shouldTurnOffSelectionMode: false,
    });
    const areTransactionsEmpty = useRef(true);
    const selectionDataRef = useRef(selectionData);
    selectionDataRef.current = selectionData;

    const setSelectedTransactions: SearchSelectionContextProps['setSelectedTransactions'] = useCallback((selectedTransactions, data = []) => {
        if (selectedTransactions instanceof Array) {
            if (!selectedTransactions.length && areTransactionsEmpty.current) {
                areTransactionsEmpty.current = true;
                return;
            }
            areTransactionsEmpty.current = false;
            return setSelectionData((prevState) => ({
                ...prevState,
                selectedTransactionIDs: selectedTransactions,
            }));
        }

        let selectedReports: SearchSelectionContextProps['selectedReports'] = [];

        if (data.length && data.every(isTransactionReportGroupListItemType)) {
            selectedReports = data
                .filter((item) => {
                    if (!isMoneyRequestReport(item)) {
                        return false;
                    }
                    if (item.transactions.length === 0) {
                        return !!item.keyForList && selectedTransactions[item.keyForList]?.isSelected;
                    }
                    return item.transactions.every(({keyForList}) => selectedTransactions[keyForList]?.isSelected);
                })
                .map(({reportID, action = CONST.SEARCH.ACTION_TYPES.VIEW, total = CONST.DEFAULT_NUMBER_ID, policyID, allActions = [action], currency, chatReportID}) => ({
                    reportID,
                    action,
                    total,
                    policyID,
                    allActions,
                    currency,
                    chatReportID,
                }));
        } else if (data.length && data.every(isTransactionListItemType)) {
            selectedReports = data
                .filter(({keyForList}) => !!keyForList && selectedTransactions[keyForList]?.isSelected)
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
                    };
                });
        }

        setSelectionData((prevState) => ({
            ...prevState,
            selectedTransactions,
            shouldTurnOffSelectionMode: false,
            selectedReports,
        }));
    }, []);

    const clearSelectedTransactions: SearchSelectionContextProps['clearSelectedTransactions'] = useCallback(
        (searchHashOrClearIDsFlag, shouldTurnOffSelectionMode = false) => {
            if (typeof searchHashOrClearIDsFlag === 'boolean') {
                setSelectedTransactions([]);
                return;
            }

            const data = selectionDataRef.current;

            if (searchHashOrClearIDsFlag === currentSearchHash) {
                return;
            }

            if (data.selectedReports.length === 0 && isEmptyObject(data.selectedTransactions) && !data.shouldTurnOffSelectionMode) {
                return;
            }
            setSelectionData((prevState) => ({
                ...prevState,
                shouldTurnOffSelectionMode,
                selectedTransactions: {},
                selectedReports: [],
            }));

            shouldShowSelectAllMatchingItems(false);
            selectAllMatchingItems(false);
        },
        [currentSearchHash, setSelectedTransactions],
    );

    const removeTransaction: SearchSelectionContextProps['removeTransaction'] = useCallback(
        (transactionID) => {
            if (!transactionID) {
                return;
            }
            const selectedTransactionIDs = selectionData.selectedTransactionIDs;

            if (!isEmptyObject(selectionData.selectedTransactions)) {
                const newSelectedTransactions = Object.entries(selectionData.selectedTransactions).reduce((acc, [key, value]) => {
                    if (key === transactionID) {
                        return acc;
                    }
                    acc[key] = value;
                    return acc;
                }, {} as SelectedTransactions);

                setSelectionData((prevState) => ({
                    ...prevState,
                    selectedTransactions: newSelectedTransactions,
                }));
            }

            if (selectedTransactionIDs.length > 0) {
                setSelectionData((prevState) => ({
                    ...prevState,
                    selectedTransactionIDs: selectedTransactionIDs.filter((ID) => transactionID !== ID),
                }));
            }
        },
        [selectionData.selectedTransactionIDs, selectionData.selectedTransactions],
    );

    const value = useMemo<SearchSelectionContextProps>(
        () => ({
            ...selectionData,
            setSelectedTransactions,
            clearSelectedTransactions,
            removeTransaction,
            showSelectAllMatchingItems,
            shouldShowSelectAllMatchingItems,
            areAllMatchingItemsSelected,
            selectAllMatchingItems,
        }),
        [
            selectionData,
            setSelectedTransactions,
            clearSelectedTransactions,
            removeTransaction,
            showSelectAllMatchingItems,
            shouldShowSelectAllMatchingItems,
            areAllMatchingItemsSelected,
            selectAllMatchingItems,
        ],
    );

    return <SearchSelectionContext.Provider value={value}>{children}</SearchSelectionContext.Provider>;
}

function useSearchSelectionContext() {
    return useContext(SearchSelectionContext);
}

export {SearchSelectionContextProvider, useSearchSelectionContext, SearchSelectionContext};
