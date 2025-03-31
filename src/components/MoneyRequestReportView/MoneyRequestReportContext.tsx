import React, {useCallback, useContext, useMemo, useState} from 'react';
import type {Transaction} from '@src/types/onyx';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type TMoneyRequestReportContext = {
    selectedTransactions: Record<string, Transaction[]>;
    setSelectedTransactions: (reportID: string) => (transactions: Transaction[]) => void;
    toggleTransaction: (reportID: string) => (transaction: Transaction) => void;
    removeTransaction: (reportID: string) => (transactionID: string) => void;
    isTransactionSelected: (reportID: string) => (transaction: Transaction) => boolean;
};

const defaultMoneyRequestReportContext = {
    selectedTransactions: {},
    setSelectedTransactions: () => () => {},
    toggleTransaction: () => () => {},
    removeTransaction: () => () => {},
    isTransactionSelected: () => () => false,
};

const Context = React.createContext<TMoneyRequestReportContext>(defaultMoneyRequestReportContext);

function MoneyRequestReportContextProvider({children}: ChildrenProps) {
    const [selectedTransactionsForReport, setSelectedTransactionsForReport] = useState<Record<string, Transaction[]>>({});

    const setSelectedTransactions = useCallback(
        (reportID: string) => (transactions: Transaction[]) => {
            setSelectedTransactionsForReport((prev) => ({...prev, [reportID]: transactions}));
        },
        [],
    );

    const toggleTransaction = useCallback(
        (reportID: string) => (transaction: Transaction) => {
            setSelectedTransactionsForReport((prev) => {
                const prevTransactions = prev[reportID] ?? [];
                if (prevTransactions.includes(transaction)) {
                    return {...prev, [reportID]: prevTransactions.filter((t) => t !== transaction)};
                }
                return {...prev, [reportID]: [...prevTransactions, transaction]};
            });
        },
        [],
    );

    const removeTransaction = useCallback(
        (reportID: string) => (transactionID: string) => {
            setSelectedTransactionsForReport((prev) => {
                const prevTransactions = prev[reportID] ?? [];
                return {...prev, [reportID]: prevTransactions.filter((t) => t.transactionID !== transactionID)};
            });
        },
        [],
    );

    const isTransactionSelected = useCallback(
        (reportID: string) => (transaction: Transaction) => (selectedTransactionsForReport[reportID] ?? []).includes(transaction),
        [selectedTransactionsForReport],
    );

    const context = useMemo(
        () => ({
            selectedTransactions: selectedTransactionsForReport,
            setSelectedTransactions,
            toggleTransaction,
            isTransactionSelected,
            removeTransaction,
        }),
        [isTransactionSelected, removeTransaction, selectedTransactionsForReport, setSelectedTransactions, toggleTransaction],
    );

    return <Context.Provider value={context}>{children}</Context.Provider>;
}

function useMoneyRequestReportContext(reportID = '') {
    const context = useContext(Context);

    return useMemo(
        () => ({
            selectedTransactions: context.selectedTransactions[reportID] ?? [],
            setSelectedTransactions: context.setSelectedTransactions(reportID),
            toggleTransaction: context.toggleTransaction(reportID),
            isTransactionSelected: context.isTransactionSelected(reportID),
            removeTransaction: context.removeTransaction(reportID),
        }),
        [context, reportID],
    );
}

MoneyRequestReportContextProvider.displayName = 'MoneyRequestReportContextProvider';

export {MoneyRequestReportContextProvider, useMoneyRequestReportContext};
