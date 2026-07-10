import AccountingConnectionConfirmationModal from '@components/AccountingConnectionConfirmationModal';

import useCardFeeds from '@hooks/useCardFeeds';
import useHasReusablePoliciesConnectedTo from '@hooks/useHasReusablePoliciesConnectedTo';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {removePolicyConnection} from '@libs/actions/connections';
import Navigation from '@libs/Navigation/Navigation';
import {isControlPolicy, tryNavigateToSubmitWorkspaceUpgrade} from '@libs/PolicyUtils';

import {getAccountingIntegrationData} from '@pages/workspace/accounting/utils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type Policy from '@src/types/onyx/Policy';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import type {RefObject} from 'react';
import type {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import React, {createContext, useCallback, useContext, useMemo, useRef, useState} from 'react';

import type {AccountingActionsContextType, AccountingStateContextType, ActiveIntegration, ActiveIntegrationState} from './types';

import {defaultAccountingActionsContextValue, defaultAccountingStateContextValue, popoverAnchorRefsInitialValue} from './default';

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
    const accountingIcons = useMemoizedLazyExpensifyIcons(['IntacctSquare', 'QBOSquare', 'XeroSquare', 'NetSuiteSquare', 'QBDSquare', 'CertiniaSquare', 'RilletSquare']);
    const hasReusablePoliciesConnectedToSageIntacct = useHasReusablePoliciesConnectedTo(CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT, policyID);
    const hasReusablePoliciesConnectedToQBD = useHasReusablePoliciesConnectedTo(CONST.POLICY.CONNECTIONS.NAME.QBD, policyID);
    const hasReusablePoliciesConnectedToCertinia = useHasReusablePoliciesConnectedTo(CONST.POLICY.CONNECTIONS.NAME.CERTINIA, policyID);
    const hasReusablePoliciesConnectedToRillet = useHasReusablePoliciesConnectedTo(CONST.POLICY.CONNECTIONS.NAME.RILLET, policyID);
    const [cardFeeds] = useCardFeeds(policyID);
    const [cardList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}`);

    const startIntegrationFlow = useCallback(
        (newActiveIntegration: ActiveIntegration) => {
            if (!policyID) {
                return;
            }

            if (tryNavigateToSubmitWorkspaceUpgrade(policy, true, CONST.UPGRADE_FEATURE_INTRO_MAPPING.accounting.alias)) {
                return;
            }

            const accountingIntegrationData = getAccountingIntegrationData(
                newActiveIntegration.name,
                policyID,
                translate,
                {
                    sageIntacct: hasReusablePoliciesConnectedToSageIntacct,
                    qbd: hasReusablePoliciesConnectedToQBD,
                    certinia: hasReusablePoliciesConnectedToCertinia,
                    rillet: hasReusablePoliciesConnectedToRillet,
                },
                undefined,
                undefined,
                newActiveIntegration.integrationToDisconnect,
                newActiveIntegration.shouldDisconnectIntegrationBeforeConnecting,
                undefined,
                accountingIcons,
                cardFeeds,
                cardList,
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
        [
            policy,
            policyID,
            translate,
            hasReusablePoliciesConnectedToSageIntacct,
            hasReusablePoliciesConnectedToQBD,
            hasReusablePoliciesConnectedToCertinia,
            hasReusablePoliciesConnectedToRillet,
            accountingIcons,
        ],
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
            {
                sageIntacct: hasReusablePoliciesConnectedToSageIntacct,
                qbd: hasReusablePoliciesConnectedToQBD,
                certinia: hasReusablePoliciesConnectedToCertinia,
                rillet: hasReusablePoliciesConnectedToRillet,
            },
            policy,
            activeIntegration.key,
            undefined,
            undefined,
            undefined,
            accountingIcons,
            cardFeeds,
            cardList,
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

export {AccountingContextProvider, useAccountingState, useAccountingActions};
