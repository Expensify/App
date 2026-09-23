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

import type {ComponentRef, RefObject} from 'react';
import type {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import type {ActiveIntegration, ActiveIntegrationState} from './types';

import {AccountingActionsContext, AccountingStateContext, useAccountingActions, useAccountingState} from './contexts';
import {popoverAnchorRefsInitialValue} from './default';

type AccountingContextProviderProps = ChildrenProps & {
    policy: OnyxEntry<Policy>;
};

// Names the connect-confirmation prompt on the global modal stack, so the two places that reach for it below cannot
// drift apart.
const ACCOUNTING_CONNECTION_CONFIRMATION_MODAL_ID = 'accountingConnectionConfirmation';

function AccountingContextProvider({children, policy}: AccountingContextProviderProps) {
    const popoverAnchorRefs = useRef<Record<string, RefObject<ComponentRef<typeof View> | null>>>(popoverAnchorRefsInitialValue);
    const [activeIntegration, setActiveIntegration] = useState<ActiveIntegrationState>();
    const {translate} = useLocalize();
    const {showConfirmModal, closeModalByID} = useConfirmModal();
    const policyID = policy?.id;

    // `removePolicyConnection` only runs once the user confirms, which can be a while after the flow started, so the
    // policy is read at that point instead of the one captured when the prompt was shown.
    const policyRef = useRef(policy);
    useEffect(() => {
        policyRef.current = policy;
    }, [policy]);

    const isDisconnectConfirmationPendingRef = useRef(false);

    // Read through a ref so the unmount cleanup below can be registered once. `closeModalByID` takes a new identity
    // whenever the modal stack changes, and an effect that listed it as a dependency would tear the prompt down as
    // soon as any other modal opened.
    const closeModalByIDRef = useRef(closeModalByID);
    useEffect(() => {
        closeModalByIDRef.current = closeModalByID;
    }, [closeModalByID]);

    useEffect(
        () => () => {
            // The prompt lives on the global modal stack, so it outlives this provider. An unanswered entry left
            // behind would hand the next accounting provider the same promise under the same id, and the one answer
            // the user eventually gives would then also run this provider's handler, against the workspace it
            // captured rather than the one on screen.
            if (!isDisconnectConfirmationPendingRef.current) {
                return;
            }
            isDisconnectConfirmationPendingRef.current = false;
            closeModalByIDRef.current(ACCOUNTING_CONNECTION_CONFIRMATION_MODAL_ID);
        },
        [],
    );

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
        'BusinessCentralSquare',
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

            isDisconnectConfirmationPendingRef.current = true;

            showConfirmModal({
                // `startIntegrationFlow` can run more than once for the same flow (the `useFocusEffect` in
                // `PolicyAccountingPage` re-fires whenever `startIntegrationFlow` is re-created). A stable id keeps the
                // repeat call updating this prompt in place instead of stacking a second copy behind it.
                id: ACCOUNTING_CONNECTION_CONFIRMATION_MODAL_ID,
                title: translate('workspace.accounting.connectTitle', connectionName),
                prompt: translate('workspace.accounting.connectPrompt', connectionName),
                confirmText: translate('workspace.accounting.setup'),
                cancelText: translate('common.cancel'),
                buttonVariant: CONST.BUTTON_VARIANT.SUCCESS,
            }).then((result) => {
                // A repeat call for the same id is handed back the promise the first call got, so every call's handler
                // runs on a single user answer. Only the first one may act, or the disconnect would be requested twice.
                if (!isDisconnectConfirmationPendingRef.current) {
                    return;
                }
                isDisconnectConfirmationPendingRef.current = false;

                if (result.action !== ModalActions.CONFIRM) {
                    setActiveIntegration(undefined);
                    return;
                }

                const currentPolicy = policyRef.current;

                // If the policy went away while the prompt was open there is nothing to disconnect, so leave the
                // confirmation state intact and keep `renderActiveIntegration()` held back.
                if (!currentPolicy) {
                    return;
                }

                removePolicyConnection(currentPolicy, integrationToDisconnect);

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
