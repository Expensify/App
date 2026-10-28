/**
 * Uber for Business row on the receipt partners page. Shows the partner, a claim-offer badge and either a setup
 * button or, once connected, a three-dots menu to re-enter credentials or disconnect.
 */
import UserAvatar from '@components/Avatar/UserAvatar';
import Badge from '@components/Badge';
import Button from '@components/Button';
import FormHelpMessage from '@components/FormHelpMessage';
import MenuItem from '@components/MenuItem';
import MenuItemSectionRoot from '@components/MenuItem/presets/MenuItemSectionRoot';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import ThreeDotsMenu from '@components/ThreeDotsMenu';

import useConfirmModal from '@hooks/useConfirmModal';
import useGetReceiptPartnersIntegrationData from '@hooks/useGetReceiptPartnersIntegrationData';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@navigation/Navigation';

import getSynchronizationErrorMessage from '@pages/workspace/receiptPartners/utils';

import {openExternalLink} from '@userActions/Link';
import {openPolicyReceiptPartnersPage, removePolicyReceiptPartnersConnection} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {AnchorPosition} from '@src/styles';

import type {ComponentRef} from 'react';

import React, {useRef} from 'react';
import {View} from 'react-native';

import type {ReceiptPartnerRowProps} from './types';

const UBER = CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER;

function UberConnectionRow({policyID}: ReceiptPartnerRowProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Key', 'NewWindow', 'Trashcan']);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isOffline} = useNetwork();
    const {showConfirmModal} = useConfirmModal();
    const overflowMenuAnchorRef = useRef<ComponentRef<typeof View>>(null);
    const policy = usePolicy(policyID);
    const uber = policy?.receiptPartners?.uber;
    const {getReceiptPartnersIntegrationData, shouldShowEnterCredentialsError, isUberConnected} = useGetReceiptPartnersIntegrationData(policyID);
    const {canWrite, showReadOnlyModal} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.MORE_FEATURES);
    const integrationData = getReceiptPartnersIntegrationData(UBER);

    if (!integrationData) {
        return null;
    }

    const hasError = !!integrationData.errorFields || shouldShowEnterCredentialsError;

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

    const getOverflowMenuAnchorPosition = () => {
        if (shouldUseNarrowLayout) {
            return Promise.resolve({horizontal: 0, vertical: 0});
        }
        return new Promise<AnchorPosition>((resolve) => {
            overflowMenuAnchorRef.current?.measureInWindow((x, y, width, height) => {
                resolve({horizontal: x + width, vertical: y + height});
            });
        });
    };

    let overflowMenuItems: PopoverMenuItem[] = [];
    if (canWrite && shouldShowEnterCredentialsError) {
        overflowMenuItems = [
            {
                icon: icons.Key,
                text: translate('workspace.accounting.enterCredentials'),
                onSelected: openUberConnect,
                shouldCallAfterModalHide: true,
                disabled: isOffline,
                iconRight: icons.NewWindow,
            },
        ];
    } else if (canWrite && isUberConnected) {
        overflowMenuItems = [
            {
                icon: icons.Trashcan,
                text: translate('workspace.accounting.disconnect'),
                onSelected: disconnect,
                shouldCallAfterModalHide: true,
            },
        ];
    }

    const badge = (
        <Badge
            text={translate('workspace.accounting.claimOffer.badgeText')}
            success
            onPress={canWrite ? () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_CLAIM_OFFER.getRoute(policyID, UBER)) : undefined}
            pressable={canWrite}
            badgeStyles={shouldUseNarrowLayout ? [styles.alignSelfStart, styles.ml13, styles.mt2] : [styles.ml0, hasError && styles.mr1]}
        />
    );

    return (
        <MenuItemSectionRoot>
            <MenuItem.Row>
                <MenuItem.Leading>
                    <UserAvatar
                        source={integrationData.icon}
                        accountID={CONST.DEFAULT_NUMBER_ID}
                    />
                </MenuItem.Leading>
                <MenuItem.Content>
                    <MenuItem.Title>{integrationData.title}</MenuItem.Title>
                    <MenuItem.Description numberOfLines={5}>{integrationData.description}</MenuItem.Description>
                </MenuItem.Content>
                <MenuItem.Trailing>
                    {!shouldUseNarrowLayout && badge}
                    {hasError && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                    {overflowMenuItems.length > 0 ? (
                        <View ref={overflowMenuAnchorRef}>
                            <ThreeDotsMenu
                                getAnchorPosition={getOverflowMenuAnchorPosition}
                                menuItems={overflowMenuItems}
                                anchorAlignment={{
                                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                                }}
                            />
                        </View>
                    ) : (
                        <Button
                            onPress={canWrite ? openUberConnect : showReadOnlyModal}
                            style={styles.justifyContentCenter}
                            innerStyles={canWrite ? undefined : styles.buttonOpacityDisabled}
                            hoverStyles={canWrite ? undefined : styles.buttonOpacityDisabled}
                            size={CONST.BUTTON_SIZE.SMALL}
                            isLoading={!uber && !isOffline && !!policy?.isLoadingReceiptPartners}
                            isDisabled={canWrite && isOffline}
                        >
                            <Button.Text>{translate('workspace.accounting.setup')}</Button.Text>
                        </Button>
                    )}
                </MenuItem.Trailing>
            </MenuItem.Row>
            {shouldUseNarrowLayout && badge}
            {shouldShowEnterCredentialsError && (
                <FormHelpMessage
                    isError
                    shouldShowRedDotIndicator={false}
                    message={getSynchronizationErrorMessage(integrationData.title, translate, styles)}
                    style={[styles.menuItemError, styles.mt3]}
                />
            )}
        </MenuItemSectionRoot>
    );
}

export default UberConnectionRow;
