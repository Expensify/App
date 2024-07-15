import React from 'react';
import useLocalize from '@hooks/useLocalize';
import type {ConnectionName} from '@src/types/onyx/Policy';
import type Policy from '@src/types/onyx/Policy';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import {accountingIntegrationData} from './utils';

type ActiveIntegration = {
    name: ConnectionName;
    shouldDisconnectIntegrationBeforeConnecting?: boolean;
    integrationToDisconnect?: ConnectionName;
};

type AccountingContextType = {
    activeIntegration?: ActiveIntegration;
    startIntegrationFlow: (activeIntegration: ActiveIntegration) => void;
};

const defaultAccountingContext = {
    activeIntegration: undefined,
    startIntegrationFlow: () => {},
};

const AccountingContext = React.createContext<AccountingContextType>(defaultAccountingContext);

type AccountingContextProviderProps = ChildrenProps & {
    policy: Policy;
};

function AccountingContextProvider({children, policy}: AccountingContextProviderProps) {
    const [activeIntegration, startIntegrationFlow] = React.useState<ActiveIntegration>();
    const {translate} = useLocalize();
    const policyID = policy.id;

    const accountingContext = React.useMemo(
        () => ({
            activeIntegration,
            startIntegrationFlow,
        }),
        [activeIntegration],
    );

    const renderActiveIntegration = () => {
        if (!activeIntegration) {
            return null;
        }

        return accountingIntegrationData(activeIntegration.name, policyID, translate, true, activeIntegration.integrationToDisconnect)?.setupConnectionButton;
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
