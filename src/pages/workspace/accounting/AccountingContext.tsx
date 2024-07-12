import React from 'react';
import useLocalize from '@hooks/useLocalize';
import type {ConnectionName} from '@src/types/onyx/Policy';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import {accountingIntegrationData} from './utils';

type ActiveIntegration = {
    name: ConnectionName;
    policyID: string;
    shouldDisconnectIntegrationBeforeConnecting?: boolean;
    integrationToDisconnect?: ConnectionName;
};

type AccountingContextType = {
    activeIntegration?: ActiveIntegration;
    setActiveIntegration: (activeIntegration: ActiveIntegration) => void;
};

const defaultAccountingContext = {
    activeIntegration: undefined,
    setActiveIntegration: () => {},
};

const AccountingContext = React.createContext<AccountingContextType>(defaultAccountingContext);

function AccountingContextProvider({children}: ChildrenProps) {
    const [activeIntegration, setActiveIntegration] = React.useState<ActiveIntegration>();
    const {translate} = useLocalize();

    const accountingContext = React.useMemo(
        () => ({
            activeIntegration,
            setActiveIntegration,
        }),
        [activeIntegration],
    );

    const renderActiveIntegration = () => {
        if (!activeIntegration) {
            return null;
        }

        return accountingIntegrationData(activeIntegration.name, activeIntegration.policyID, translate, true, activeIntegration.integrationToDisconnect)?.setupConnectionButton;
    };

    return (
        <AccountingContext.Provider value={accountingContext}>
            {children}
            {renderActiveIntegration()}
        </AccountingContext.Provider>
    );
}

function useAccountingContext() {
    return React.useContext(AccountingContext);
}

export default AccountingContext;
export {AccountingContextProvider, useAccountingContext};
