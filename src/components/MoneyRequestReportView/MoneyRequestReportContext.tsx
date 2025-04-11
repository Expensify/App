import React, {useCallback, useContext, useMemo, useState} from 'react';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type TMoneyRequestReportContext = {
    selectedTransactionsID: Record<string, string[]>;
    setSelectedTransactionsID: (reportID: string) => (transactionsID: string[]) => void;
    toggleTransaction: (reportID: string) => (transactionID: string) => void;
    removeTransaction: (reportID: string) => (transactionID?: string) => void;
    isTransactionSelected: (reportID: string) => (transactionID: string) => boolean;
};

const defaultMoneyRequestReportContext = {
    selectedTransactionsID: {},
    setSelectedTransactionsID: () => () => {},
    toggleTransaction: () => () => {},
    removeTransaction: () => () => {},
    isTransactionSelected: () => () => false,
};

const Context = React.createContext<TMoneyRequestReportContext>(defaultMoneyRequestReportContext);

// TODO merge it with SearchContext in follow-up - https://github.com/Expensify/App/issues/59431
function MoneyRequestReportContextProvider({children}: ChildrenProps) {
    const [selectedTransactionsForReport, setSelectedTransactionsForReport] = useState<Record<string, string[]>>({});

    const setSelectedTransactionsID = useCallback(
        (reportID: string) => (transactionsID: string[]) => {
            setSelectedTransactionsForReport((prev) => ({...prev, [reportID]: transactionsID}));
        },
        [],
    );

    const toggleTransaction = useCallback(
        (reportID: string) => (transactionID: string) => {
            setSelectedTransactionsForReport((prev) => {
                const prevTransactions = prev[reportID] ?? [];
                if (prevTransactions.includes(transactionID)) {
                    return {...prev, [reportID]: prevTransactions.filter((t) => t !== transactionID)};
                }
                return {...prev, [reportID]: [...prevTransactions, transactionID]};
            });
        },
        [],
    );

    const removeTransaction = useCallback(
        (reportID: string) => (transactionID?: string) => {
            setSelectedTransactionsForReport((prev) => {
                const prevTransactions = prev[reportID] ?? [];
                return {...prev, [reportID]: prevTransactions.filter((t) => t !== transactionID)};
            });
        },
        [],
    );

    const isTransactionSelected = useCallback(
        (reportID: string) => (transactionID: string) => (selectedTransactionsForReport[reportID] ?? []).includes(transactionID),
        [selectedTransactionsForReport],
    );

    const context = useMemo(
        () => ({
            selectedTransactionsID: selectedTransactionsForReport,
            setSelectedTransactionsID,
            toggleTransaction,
            isTransactionSelected,
            removeTransaction,
        }),
        [isTransactionSelected, removeTransaction, selectedTransactionsForReport, setSelectedTransactionsID, toggleTransaction],
    );

    return <Context.Provider value={context}>{children}</Context.Provider>;
}

function useMoneyRequestReportContext(reportID?: string) {
    const context = useContext(Context);

    return useMemo(
        () => ({
            selectedTransactionsID: reportID ? context.selectedTransactionsID[reportID] ?? [] : [],
            setSelectedTransactionsID: reportID ? context.setSelectedTransactionsID(reportID) : () => {},
            toggleTransaction: reportID ? context.toggleTransaction(reportID) : () => {},
            isTransactionSelected: reportID ? context.isTransactionSelected(reportID) : () => false,
            removeTransaction: reportID ? context.removeTransaction(reportID) : () => {},
        }),
        [context, reportID],
    );
}

MoneyRequestReportContextProvider.displayName = 'MoneyRequestReportContextProvider';

export {MoneyRequestReportContextProvider, useMoneyRequestReportContext};
