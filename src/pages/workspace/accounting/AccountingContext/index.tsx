import React, {createContext, useCallback, useContext, useMemo, useRef, useState} from 'react';
import type {RefObject} from 'react';
import type {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import AccountingConnectionConfirmationModal from '@components/AccountingConnectionConfirmationModal';
import useHasPoliciesConnectedToSageIntacct from '@hooks/useHasPoliciesConnectedToSageIntacct';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useReusablePoliciesConnectedToQBD from '@hooks/useReusablePoliciesConnectedToQBD';
import {removePolicyConnection} from '@libs/actions/connections';
import Navigation from '@libs/Navigation/Navigation';
import {isControlPolicy} from '@libs/PolicyUtils';
import {getAccountingIntegrationData} from '@pages/workspace/accounting/utils';
import ROUTES from '@src/ROUTES';
import type Policy from '@src/types/onyx/Policy';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import {defaultAccountingActionsContextValue, defaultAccountingStateContextValue, popoverAnchorRefsInitialValue} from './default';
import type {AccountingActionsContextType, AccountingStateContextType, ActiveIntegration, ActiveIntegrationState} from './types';

const AccountingStateContext = createContext<AccountingStateContextType>(defaultAccountingStateContextValue);
const AccountingActionsContext = createContext<AccountingActionsContextType>(defaultAccountingActionsContextValue);

type AccountingContextProviderProps = ChildrenProps & {
    policy: OnyxEntry<Policy>;
};

function AccountingContextProvider({children, policy}: AccountingContextProviderProps) {
    const popoverAnchorRefs = useRef<Record<string, RefObject<View | null>>>(popoverAnchorRefsInitialValue);
    const [activeIntegration, setActiveIntegration] = useState<ActiveIntegrationState>();
    const {translate} = useLocalize();
    const policyID = policy?.id;
    const accountingIcons = useMemoizedLazyExpensifyIcons(['IntacctSquare', 'QBOSquare', 'XeroSquare', 'NetSuiteSquare', 'QBDSquare']);
    const hasPoliciesConnectedToSageIntacct = useHasPoliciesConnectedToSageIntacct();
    const {hasReusablePoliciesConnectedToQBD} = useReusablePoliciesConnectedToQBD(policyID);

    const startIntegrationFlow = useCallback(
        (newActiveIntegration: ActiveIntegration) => {
            if (!policyID) {
                return;
            }

            const accountingIntegrationData = getAccountingIntegrationData(
                newActiveIntegration.name,
                policyID,
                translate,
                {sageIntacct: hasPoliciesConnectedToSageIntacct, qbd: hasReusablePoliciesConnectedToQBD},
                undefined,
                undefined,
                newActiveIntegration.integrationToDisconnect,
                newActiveIntegration.shouldDisconnectIntegrationBeforeConnecting,
                undefined,
                accountingIcons,
            );
            const workspaceUpgradeNavigationDetails = accountingIntegrationData?.workspaceUpgradeNavigationDetails;
            if (workspaceUpgradeNavigationDetails && !isControlPolicy(policy)) {
                Navigation.navigate(
                    ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, workspaceUpgradeNavigationDetails.integrationAlias, workspaceUpgradeNavigationDetails.backToAfterWorkspaceUpgradeRoute),
                );
                return;
            }
            setActiveIntegration({
                ...newActiveIntegration,
                key: Math.random(),
            });
        },
        [policy, policyID, translate, hasPoliciesConnectedToSageIntacct, hasReusablePoliciesConnectedToQBD, accountingIcons],
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

    const stateValue = useMemo(
        () => ({
            activeIntegration,
            popoverAnchorRefs,
        }),
        [activeIntegration],
    );

    const actionsValue = useMemo(
        () => ({
            startIntegrationFlow,
        }),
        [startIntegrationFlow],
    );

    const renderActiveIntegration = () => {
        if (!policyID || !activeIntegration) {
            return null;
        }

        return getAccountingIntegrationData(
            activeIntegration.name,
            policyID,
            translate,
            {sageIntacct: hasPoliciesConnectedToSageIntacct, qbd: hasReusablePoliciesConnectedToQBD},
            policy,
            activeIntegration.key,
            undefined,
            undefined,
            undefined,
            accountingIcons,
        )?.setupConnectionFlow;
    };

    const shouldShowConfirmationModal = !!activeIntegration?.shouldDisconnectIntegrationBeforeConnecting && !!activeIntegration?.integrationToDisconnect;

    return (
        <AccountingStateContext.Provider value={stateValue}>
            <AccountingActionsContext.Provider value={actionsValue}>
                {children}
                {!shouldShowConfirmationModal && renderActiveIntegration()}
                {shouldShowConfirmationModal && (
                    <AccountingConnectionConfirmationModal
                        onConfirm={() => {
                            if (!policyID || !activeIntegration?.integrationToDisconnect) {
                                return;
                            }
                            removePolicyConnection(policy, activeIntegration?.integrationToDisconnect);
                            closeConfirmationModal();
                        }}
                        integrationToConnect={activeIntegration?.name}
                        onCancel={() => {
                            setActiveIntegration(undefined);
                        }}
                    />
                )}
            </AccountingActionsContext.Provider>
        </AccountingStateContext.Provider>
    );
}

function useAccountingState(): AccountingStateContextType {
    return useContext(AccountingStateContext);
}

function useAccountingActions(): AccountingActionsContextType {
    return useContext(AccountingActionsContext);
}

export default AccountingContextProvider;
export {AccountingStateContext, AccountingActionsContext, AccountingContextProvider, useAccountingState, useAccountingActions};
export type {AccountingActionsContextType, AccountingStateContextType, ActiveIntegration} from './types';
