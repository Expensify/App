import type {MutableRefObject, RefObject} from 'react';
import React, {useEffect, useRef} from 'react';
import type {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';
import type {ConnectionName} from '@src/types/onyx/Policy';
import type Policy from '@src/types/onyx/Policy';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import {accountingIntegrationData} from './utils';

type ActiveIntegration = {
    name: ConnectionName;
    shouldDisconnectIntegrationBeforeConnecting?: boolean;
    integrationToDisconnect?: ConnectionName;
};

type ActiveIntegrationState = ActiveIntegration & {key: number};

type AccountingContextType = {
    activeIntegration?: ActiveIntegration;
    startIntegrationFlow: (activeIntegration: ActiveIntegration) => void;

    /*
     * This stores refs to integration buttons, so the PopoverMenu can be positioned correctly
     */
    integrationRefs: RefObject<Record<string, MutableRefObject<View | null>>>;
};

const integrationRefsInitialValue = Object.values(CONST.POLICY.CONNECTIONS.NAME).reduce((acc, key) => {
    acc[key] = {current: null};
    return acc;
}, {} as Record<ConnectionName, MutableRefObject<View | null>>);

const defaultAccountingContext = {
    activeIntegration: undefined,
    startIntegrationFlow: () => {},
    integrationRefs: {
        current: integrationRefsInitialValue,
    },
};

const AccountingContext = React.createContext<AccountingContextType>(defaultAccountingContext);

type AccountingContextProviderProps = ChildrenProps & {
    policy: Policy;
};

function AccountingContextProvider({children, policy}: AccountingContextProviderProps) {
    const integrationRefs = useRef<Record<string, MutableRefObject<View | null>>>(defaultAccountingContext.integrationRefs.current);
    const [activeIntegration, rawStartIntegrationFlow] = React.useState<ActiveIntegrationState>();
    const {translate} = useLocalize();
    const policyID = policy.id;

    const startIntegrationFlow = React.useCallback(
        (newActiveIntegration: ActiveIntegration) => {
            rawStartIntegrationFlow({
                ...newActiveIntegration,
                key: Math.random(),
            });
        },
        [rawStartIntegrationFlow],
    );

    const accountingContext = React.useMemo(
        () => ({
            activeIntegration,
            startIntegrationFlow,
            integrationRefs,
        }),
        [activeIntegration, startIntegrationFlow],
    );

    const renderActiveIntegration = () => {
        if (!activeIntegration) {
            return null;
        }

        return accountingIntegrationData(activeIntegration.name, policyID, translate, true, activeIntegration.integrationToDisconnect, policy, activeIntegration.key)?.setupConnectionButton;
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
