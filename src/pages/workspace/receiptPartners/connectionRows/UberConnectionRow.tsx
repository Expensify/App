import {ModalActions} from '@components/Modal/Global/ModalContext';
import type {PopoverMenuItem} from '@components/PopoverMenu';

import useConfirmModal from '@hooks/useConfirmModal';
import useGetReceiptPartnersIntegrationData from '@hooks/useGetReceiptPartnersIntegrationData';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@navigation/Navigation';

import getSynchronizationErrorMessage from '@pages/workspace/receiptPartners/utils';

import {openExternalLink} from '@userActions/Link';
import {openPolicyReceiptPartnersPage, removePolicyReceiptPartnersConnection} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';

import type {ReceiptPartnerRowProps} from './types';

import ReceiptPartnerConnectionRow from './ReceiptPartnerConnectionRow';

const UBER = CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER;

function UberConnectionRow({policyID}: ReceiptPartnerRowProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Key', 'NewWindow', 'Trashcan']);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {showConfirmModal} = useConfirmModal();
    const policy = usePolicy(policyID);
    const uber = policy?.receiptPartners?.uber;
    const {getReceiptPartnersIntegrationData, shouldShowEnterCredentialsError, isUberConnected} = useGetReceiptPartnersIntegrationData(policyID);
    const {canWrite, showReadOnlyModal} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.MORE_FEATURES);
    const integrationData = getReceiptPartnersIntegrationData(UBER);

    if (!integrationData) {
        return null;
    }

    const openUberConnect = () => openExternalLink(`${CONST.UBER_CONNECT_URL}?${uber?.connectFormData}`);

    const disconnect = () => {
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
            removePolicyReceiptPartnersConnection(policyID, UBER, uber);
            openPolicyReceiptPartnersPage(policyID);
        });
    };

    const enterCredentialsMenuItem: PopoverMenuItem = {
        icon: icons.Key,
        text: translate('workspace.accounting.enterCredentials'),
        onSelected: openUberConnect,
        shouldCallAfterModalHide: true,
        disabled: isOffline,
        iconRight: icons.NewWindow,
    };

    const disconnectMenuItem: PopoverMenuItem = {
        icon: icons.Trashcan,
        text: translate('workspace.accounting.disconnect'),
        onSelected: disconnect,
        shouldCallAfterModalHide: true,
    };

    let overflowMenuItems: PopoverMenuItem[] = [];
    if (canWrite && shouldShowEnterCredentialsError) {
        overflowMenuItems = [enterCredentialsMenuItem];
    } else if (canWrite && isUberConnected) {
        overflowMenuItems = [disconnectMenuItem];
    }

    return (
        <ReceiptPartnerConnectionRow
            icon={integrationData.icon}
            title={integrationData.title}
            description={integrationData.description}
            overflowMenuItems={overflowMenuItems}
            onSetUp={canWrite ? openUberConnect : showReadOnlyModal}
            isSetUpLoading={!uber && !isOffline && !!policy?.isLoadingReceiptPartners}
            isReadOnly={!canWrite}
            badge={{
                text: translate('workspace.accounting.claimOffer.badgeText'),
                onPress: canWrite ? () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_CLAIM_OFFER.getRoute(policyID, UBER)) : undefined,
            }}
            hasError={!!integrationData.errorFields || shouldShowEnterCredentialsError}
            errorMessage={shouldShowEnterCredentialsError ? getSynchronizationErrorMessage(integrationData.title, translate, styles) : undefined}
        />
    );
}

export default UberConnectionRow;
