import {ModalActions} from '@components/Modal/Global/ModalContext';

import useCardFeeds from '@hooks/useCardFeeds';
import useCardsLists from '@hooks/useCardsLists';
import useConfirmModal from '@hooks/useConfirmModal';
import useHasReusablePoliciesConnectedTo from '@hooks/useHasReusablePoliciesConnectedTo';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import {removePolicyConnection} from '@libs/actions/connections';
import Navigation from '@libs/Navigation/Navigation';
import {isControlPolicy, tryNavigateToSubmitWorkspaceUpgrade} from '@libs/PolicyUtils';

import {getAccountingIntegrationData} from '@pages/workspace/accounting/utils';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type Policy from '@src/types/onyx/Policy';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import type {RefObject} from 'react';
import type {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import type {ActiveIntegration, ActiveIntegrationState} from './types';

import {AccountingActionsContext, AccountingStateContext, useAccountingActions, useAccountingState} from './contexts';
import {popoverAnchorRefsInitialValue} from './default';

type AccountingContextProviderProps = ChildrenProps & {
    policy: OnyxEntry<Policy>;
};

function AccountingContextProvider({children, policy}: AccountingContextProviderProps) {
    const popoverAnchorRefs = useRef<Record<string, RefObject<View | null>>>(popoverAnchorRefsInitialValue);
    const [activeIntegration, setActiveIntegration] = useState<ActiveIntegrationState>();
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const policyID = policy?.id;

    // `removePolicyConnection` only runs once the user confirms, which can be a while after the flow started, so the
    // policy is read at that point instead of the one captured when the prompt was shown.
    const policyRef = useRef(policy);
    useEffect(() => {
        policyRef.current = policy;
    }, [policy]);

    const closeConfirmationModal = useCallback(() => {
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
    }, []);

    const accountingIcons = useMemoizedLazyExpensifyIcons([
        'IntacctSquare',
        'IntuitSquare',
        'QBOSquare',
        'XeroSquare',
        'NetSuiteSquare',
        'QBDSquare',
        'CertiniaSquare',
        'RilletSquare',
        'DualEntrySquare',
        'CampfireSquare',
    ]);
    const hasReusablePoliciesConnectedToSageIntacct = useHasReusablePoliciesConnectedTo(CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT, policyID);
    const hasReusablePoliciesConnectedToQBD = useHasReusablePoliciesConnectedTo(CONST.POLICY.CONNECTIONS.NAME.QBD, policyID);
    const hasReusablePoliciesConnectedToCertinia = useHasReusablePoliciesConnectedTo(CONST.POLICY.CONNECTIONS.NAME.CERTINIA, policyID);
    const hasReusablePoliciesConnectedToRillet = useHasReusablePoliciesConnectedTo(CONST.POLICY.CONNECTIONS.NAME.RILLET, policyID);
    const hasReusablePoliciesConnectedToDualEntry = useHasReusablePoliciesConnectedTo(CONST.POLICY.CONNECTIONS.NAME.DUALENTRY, policyID);
    const hasReusablePoliciesConnectedToCampfire = useHasReusablePoliciesConnectedTo(CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE, policyID);
    const [cardFeeds] = useCardFeeds(policyID);
    const [cardLists] = useCardsLists();

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
                    dualEntry: hasReusablePoliciesConnectedToDualEntry,
                    campfire: hasReusablePoliciesConnectedToCampfire,
                },
                undefined,
                undefined,
                newActiveIntegration.integrationToDisconnect,
                newActiveIntegration.shouldDisconnectIntegrationBeforeConnecting,
                undefined,
                accountingIcons,
                cardFeeds,
                cardLists,
                newActiveIntegration.isIntuitEnterpriseSuite,
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

            const integrationToDisconnect = newActiveIntegration.integrationToDisconnect;
            if (!newActiveIntegration.shouldDisconnectIntegrationBeforeConnecting || !integrationToDisconnect) {
                return;
            }

            // Mirrors `shouldShowConfirmationModal` below, which keeps `renderActiveIntegration()` from mounting the
            // setup flow until the user has decided what to do with the connection that has to be disconnected first.
            const connectionName = newActiveIntegration.isIntuitEnterpriseSuite
                ? translate('workspace.accounting.intuitEnterpriseSuite')
                : (CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[newActiveIntegration.name] ?? newActiveIntegration.name);

            showConfirmModal({
                title: translate('workspace.accounting.connectTitle', connectionName),
                prompt: translate('workspace.accounting.connectPrompt', connectionName),
                confirmText: translate('workspace.accounting.setup'),
                cancelText: translate('common.cancel'),
                buttonVariant: CONST.BUTTON_VARIANT.SUCCESS,
            }).then((result) => {
                if (result.action !== ModalActions.CONFIRM) {
                    setActiveIntegration(undefined);
                    return;
                }

                const currentPolicy = policyRef.current;

                // The deprecated handler returned before `closeConfirmationModal()` when the policy was missing, so it
                // could never release the setup flow for an integration whose predecessor had not been disconnected.
                // Keep that guard: if the policy went away while the prompt was open, leave the confirmation state
                // intact so `renderActiveIntegration()` stays held back.
                if (!currentPolicy) {
                    return;
                }

                removePolicyConnection(currentPolicy, integrationToDisconnect);

                // Clearing the flag lets `renderActiveIntegration()` mount the setup flow for the new integration.
                closeConfirmationModal();
            });
        },
        [
            closeConfirmationModal,
            policy,
            policyID,
            showConfirmModal,
            translate,
            hasReusablePoliciesConnectedToSageIntacct,
            hasReusablePoliciesConnectedToQBD,
            hasReusablePoliciesConnectedToCertinia,
            hasReusablePoliciesConnectedToRillet,
            hasReusablePoliciesConnectedToDualEntry,
            hasReusablePoliciesConnectedToCampfire,
            accountingIcons,
            cardFeeds,
            cardLists,
        ],
    );

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
                dualEntry: hasReusablePoliciesConnectedToDualEntry,
                campfire: hasReusablePoliciesConnectedToCampfire,
            },
            policy,
            activeIntegration.key,
            undefined,
            undefined,
            undefined,
            accountingIcons,
            cardFeeds,
            cardLists,
            activeIntegration.isIntuitEnterpriseSuite,
        )?.setupConnectionFlow;
    };

    // The confirmation prompt itself lives on the global modal stack and is shown from `startIntegrationFlow`, but this
    // flag still has to gate the setup flow so it does not mount behind the prompt.
    const shouldShowConfirmationModal = !!activeIntegration?.shouldDisconnectIntegrationBeforeConnecting && !!activeIntegration?.integrationToDisconnect;

    return (
        <AccountingStateContext.Provider value={stateValue}>
            <AccountingActionsContext.Provider value={actionsValue}>
                {children}
                {!shouldShowConfirmationModal && renderActiveIntegration()}
            </AccountingActionsContext.Provider>
        </AccountingStateContext.Provider>
    );
}

export {AccountingContextProvider, useAccountingState, useAccountingActions};
