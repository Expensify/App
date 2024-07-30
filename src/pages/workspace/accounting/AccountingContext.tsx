import type {MutableRefObject, RefObject} from 'react';
import React, {useMemo, useRef, useState} from 'react';
import type {View} from 'react-native';
import AccountingConnectionConfirmationModal from '@components/AccountingConnectionConfirmationModal';
import useLocalize from '@hooks/useLocalize';
import {removePolicyConnection} from '@libs/actions/connections';
import Navigation from '@libs/Navigation/Navigation';
import {isControlPolicy} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {ConnectionName} from '@src/types/onyx/Policy';
import type Policy from '@src/types/onyx/Policy';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import {getAccountingIntegrationData} from './utils';

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
    const [activeIntegration, setActiveIntegration] = useState<ActiveIntegrationState>();
    const {translate} = useLocalize();
    const policyID = policy.id;

    const startIntegrationFlow = React.useCallback(
        (newActiveIntegration: ActiveIntegration) => {
            const accountingIntegrationData = getAccountingIntegrationData(newActiveIntegration.name, policyID, translate);
            if (accountingIntegrationData?.requiresControlPolicy && !isControlPolicy(policy)) {
                Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.netsuite.alias));
                return;
            }
            setActiveIntegration({
                ...newActiveIntegration,
                key: Math.random(),
            });
        },
        [policy, policyID, translate],
    );

    const closeConfirmationModal = () => {
        setActiveIntegration((prev) => {
            if (prev) {
                return {
                    ...prev,
                    shouldDisconnectIntegrationBeforeConnecting: false,
                    integrationToDisconnect: undefined,
                };
            }
            return undefined;
        });
    };

    const accountingContext = useMemo(
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

        return getAccountingIntegrationData(activeIntegration.name, policyID, translate, policy, activeIntegration.key)?.setupConnectionFlow;
    };

    const shouldShowConfirmationModal = activeIntegration?.shouldDisconnectIntegrationBeforeConnecting && activeIntegration?.integrationToDisconnect;

    return (
        <AccountingContext.Provider value={accountingContext}>
            {children}
            {!shouldShowConfirmationModal && renderActiveIntegration()}
            {shouldShowConfirmationModal && activeIntegration?.integrationToDisconnect && (
                <AccountingConnectionConfirmationModal
                    onConfirm={() => {
                        if (!activeIntegration?.integrationToDisconnect) {
                            return;
                        }
                        removePolicyConnection(policyID, activeIntegration?.integrationToDisconnect);
                        closeConfirmationModal();
                    }}
                    integrationToConnect={activeIntegration?.integrationToDisconnect}
                    onCancel={() => {
                        setActiveIntegration(undefined);
                    }}
                />
            )}
        </AccountingContext.Provider>
    );
}

function useAccountingContext() {
    return React.useContext(AccountingContext);
}

export default AccountingContext;
export {AccountingContextProvider, useAccountingContext};
export type {ActiveIntegrationState};
