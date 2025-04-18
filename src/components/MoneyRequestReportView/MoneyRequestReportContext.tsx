import React, {useCallback, useContext, useMemo, useState} from 'react';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type TMoneyRequestReportContext = {
    selectedTransactionsID: string[];
    setSelectedTransactionsID: (transactionsID: string[]) => void;
    toggleTransaction: (transactionID: string) => void;
    removeTransaction: (transactionID?: string) => void;
    isTransactionSelected: (transactionID: string) => boolean;
};

const defaultMoneyRequestReportContext = {
    selectedTransactionsID: [],
    setSelectedTransactionsID: () => {},
    toggleTransaction: () => {},
    removeTransaction: () => {},
    isTransactionSelected: () => false,
};

const Context = React.createContext<TMoneyRequestReportContext>(defaultMoneyRequestReportContext);

// TODO merge it with SearchContext in follow-up - https://github.com/Expensify/App/issues/59431
function MoneyRequestReportContextProvider({children}: ChildrenProps) {
    const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);

    const setSelectedTransactionsID = useCallback((transactionsID: string[]) => {
        setSelectedTransactions(transactionsID);
    }, []);

    const toggleTransaction = useCallback((transactionID: string) => {
        setSelectedTransactions((prev) => {
            if (prev.includes(transactionID)) {
                return prev.filter((t) => t !== transactionID);
            }
            return [...prev, transactionID];
        });
    }, []);

    const removeTransaction = useCallback((transactionID?: string) => {
        setSelectedTransactions((prev) => {
            return prev.filter((t) => t !== transactionID);
        });
    }, []);

    const isTransactionSelected = useCallback((transactionID: string) => selectedTransactions.includes(transactionID), [selectedTransactions]);

    const context = useMemo(
        () => ({
            selectedTransactionsID: selectedTransactions,
            setSelectedTransactionsID,
            toggleTransaction,
            isTransactionSelected,
            removeTransaction,
        }),
        [isTransactionSelected, removeTransaction, selectedTransactions, setSelectedTransactionsID, toggleTransaction],
    );

    return <Context.Provider value={context}>{children}</Context.Provider>;
}

function useMoneyRequestReportContext() {
    const context = useContext(Context);

    return context;
}

MoneyRequestReportContextProvider.displayName = 'MoneyRequestReportContextProvider';

export {MoneyRequestReportContextProvider, useMoneyRequestReportContext};
