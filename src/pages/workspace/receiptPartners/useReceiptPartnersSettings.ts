import {ModalActions} from '@components/Modal/Global/ModalContext';
import type {PopoverMenuItem} from '@components/PopoverMenu';

import useConfirmModal from '@hooks/useConfirmModal';
import useGetReceiptPartnersIntegrationData from '@hooks/useGetReceiptPartnersIntegrationData';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';

import {openExternalLink} from '@userActions/Link';
import {openPolicyReceiptPartnersPage, removePolicyReceiptPartnersConnection, togglePolicyUberAutoInvite, togglePolicyUberAutoRemove} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import {useEffect} from 'react';

type UseReceiptPartnersSettingsOptions = {
    /** Runs once the user confirms disconnecting, before the connection is removed */
    onDisconnectConfirmed?: () => void;
};

/** State and actions for the workspace's receipt partner connections, shared by the Receipt partners page and its Connections panel */
function useReceiptPartnersSettings(policyID: string, {onDisconnectConfirmed}: UseReceiptPartnersSettingsOptions = {}) {
    const icons = useMemoizedLazyExpensifyIcons(['Key', 'NewWindow', 'Trashcan']);
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const policy = usePolicy(policyID);
    const {getReceiptPartnersIntegrationData, shouldShowEnterCredentialsError, isUberConnected} = useGetReceiptPartnersIntegrationData(policyID);
    const integrations = policy?.receiptPartners;
    const isAutoRemove = !!integrations?.uber?.autoRemove;
    const isAutoInvite = !!integrations?.uber?.autoInvite;
    const {canWrite: canWriteMoreFeatures, showReadOnlyModal, withReadOnlyFallback} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.MORE_FEATURES);

    const fetchReceiptPartners = () => {
        openPolicyReceiptPartnersPage(policyID);
    };

    const {isOffline} = useNetwork({onReconnect: fetchReceiptPartners});

    useEffect(() => {
        openPolicyReceiptPartnersPage(policyID);
    }, [policyID]);

    const startIntegrationFlow = ({name}: {name: string}) => {
        switch (name) {
            case CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER: {
                openExternalLink(`${CONST.UBER_CONNECT_URL}?${integrations?.uber?.connectFormData}`);
                break;
            }
            default: {
                break;
            }
        }
    };

    const toggleUberAutoInvite = () => {
        togglePolicyUberAutoInvite(policyID, !isAutoInvite);
    };

    const toggleUberAutoRemove = () => {
        togglePolicyUberAutoRemove(policyID, !isAutoRemove);
    };

    const disconnectPartner = (partner: ValueOf<typeof CONST.POLICY.RECEIPT_PARTNERS.NAME>) => {
        if (!policyID) {
            return;
        }
        removePolicyReceiptPartnersConnection(policyID, partner, integrations?.[partner]);
        fetchReceiptPartners();
    };

    const getOverflowMenu = (integration: string): PopoverMenuItem[] => {
        switch (integration) {
            case CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER:
                if (shouldShowEnterCredentialsError) {
                    return [
                        {
                            icon: icons.Key,
                            text: translate('workspace.accounting.enterCredentials'),
                            onSelected: () =>
                                startIntegrationFlow({
                                    name: CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER,
                                }),
                            shouldCallAfterModalHide: true,
                            disabled: isOffline,
                            iconRight: icons.NewWindow,
                        },
                    ];
                }

                return [
                    {
                        icon: icons.Trashcan,
                        text: translate('workspace.accounting.disconnect'),
                        onSelected: () => {
                            showConfirmModal({
                                title: translate('workspace.moreFeatures.receiptPartnersWarningModal.featureEnabledTitle'),
                                prompt: translate('workspace.moreFeatures.receiptPartnersWarningModal.description'),
                                confirmText: translate('workspace.accounting.disconnect'),
                                cancelText: translate('common.cancel'),
                                buttonVariant: CONST.BUTTON_VARIANT.DANGER,
                            }).then(({action}) => {
                                if (action !== ModalActions.CONFIRM) {
                                    return;
                                }
                                onDisconnectConfirmed?.();
                                disconnectPartner(CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER);
                            });
                        },
                        shouldCallAfterModalHide: true,
                    },
                ];
            default:
                return [];
        }
    };

    return {
        policy,
        integrations,
        isAutoInvite,
        isAutoRemove,
        isUberConnected,
        shouldShowEnterCredentialsError,
        getReceiptPartnersIntegrationData,
        isOffline,
        canWriteMoreFeatures,
        showReadOnlyModal,
        withReadOnlyFallback,
        startIntegrationFlow,
        toggleUberAutoInvite,
        toggleUberAutoRemove,
        getOverflowMenu,
    };
}

export default useReceiptPartnersSettings;
