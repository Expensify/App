import React, {createContext, useContext} from 'react';

type TransactionPolicyContextValue = {
    policyID: string | undefined;
};

const TransactionPolicyContext = createContext<TransactionPolicyContextValue | null>(null);

type TransactionPolicyProviderProps = {
    policyID: string | undefined;
    children: React.ReactNode;
};

function TransactionPolicyProvider({policyID, children}: TransactionPolicyProviderProps) {
    const value: TransactionPolicyContextValue = {policyID};
    return <TransactionPolicyContext.Provider value={value}>{children}</TransactionPolicyContext.Provider>;
}

function useTransactionPolicyID(): string | undefined {
    const ctx = useContext(TransactionPolicyContext);
    if (!ctx) {
        throw new Error('TransactionPolicyContext missing');
    }
    return ctx.policyID;
}

export default TransactionPolicyProvider;
export {useTransactionPolicyID};
