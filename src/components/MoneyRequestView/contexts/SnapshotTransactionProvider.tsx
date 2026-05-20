import React, {createContext, useContext} from 'react';
import type {Transaction} from '@src/types/onyx';
import TransactionPolicyProvider from './TransactionPolicyContext';

type SnapshotTransactionContextValue = {
    source: Transaction;
};

const SnapshotTransactionContext = createContext<SnapshotTransactionContextValue | null>(null);

type SnapshotTransactionProviderProps = {
    source: Transaction;
    policyID: string | undefined;
    children: React.ReactNode;
};

function SnapshotTransactionProvider({source, policyID, children}: SnapshotTransactionProviderProps) {
    const value: SnapshotTransactionContextValue = {source};
    return (
        <SnapshotTransactionContext.Provider value={value}>
            <TransactionPolicyProvider policyID={policyID}>{children}</TransactionPolicyProvider>
        </SnapshotTransactionContext.Provider>
    );
}

function useSnapshotTransactionContext(): SnapshotTransactionContextValue {
    const ctx = useContext(SnapshotTransactionContext);
    if (!ctx) {
        throw new Error('SnapshotTransactionProvider missing');
    }
    return ctx;
}

function useSnapshotTransactionField<T>(selector: (tx: Transaction) => T): T {
    const {source} = useSnapshotTransactionContext();
    return selector(source);
}

export default SnapshotTransactionProvider;
export {useSnapshotTransactionField};
