import React from 'react';
import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import type ThreeDotsMenuProps from '@components/ThreeDotsMenu/types';
import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import {removePolicyConnection, syncConnection} from '@libs/actions/connections';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import type Policy from '@src/types/onyx/Policy';
import type IconAsset from '@src/types/utils/IconAsset';
import type {HRCardDescriptor} from './utils';

type HRProviderCardProps = {
    card: HRCardDescriptor;
    policy: Policy | undefined;
    isFirst?: boolean;
    onConnect: () => void;
};

function HRProviderCard({card, policy, isFirst, onConnect}: HRProviderCardProps) {
    const {translate, datetimeToRelative} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const icons = useMemoizedLazyExpensifyIcons(['Sync', 'Trashcan', 'Building']);
    const {showConfirmModal} = useConfirmModal();

    const fallbackIcon = icons.Building;
    const cardIcon = typeof card.icon === 'string' && card.icon.startsWith('http') ? card.icon : (card.icon as IconAsset) || fallbackIcon;

    let connectionDescription: string | undefined;
    if (!card.isSyncInProgress && card.successfulDate && !card.hasError) {
        connectionDescription = translate('workspace.hr.lastSync', datetimeToRelative(String(card.successfulDate)));
    }

    const lastSyncErrorMessage = card.hasError ? translate('workspace.hr.syncError', card.displayName) : undefined;

    const overflowMenu: ThreeDotsMenuProps['menuItems'] = [
        {
            icon: icons.Sync,
            text: translate('workspace.hr.syncNow'),
            onSelected: () => syncConnection(policy, card.connectionName),
            disabled: isOffline,
        },
        {
            icon: icons.Trashcan,
            text: translate('workspace.hr.disconnect'),
            onSelected: () => {
                showConfirmModal({
                    title: translate('workspace.hr.disconnectTitle', card.displayName),
                    prompt: translate('workspace.hr.disconnectPrompt', card.displayName),
                    confirmText: translate('workspace.hr.disconnect'),
                    cancelText: translate('common.cancel'),
                    danger: true,
                }).then((result) => {
                    if (!result) {
                        return;
                    }
                    if (policy) {
                        removePolicyConnection(policy, card.connectionName);
                    }
                });
            },
            shouldCallAfterModalHide: true,
        },
    ];

    let rightComponent;
    if (!card.isConnected) {
        rightComponent = (
            <Button
                small
                text={translate('workspace.hr.connect')}
                onPress={onConnect}
            />
        );
    } else if (card.isSyncInProgress) {
        rightComponent = (
            <ActivityIndicator
                style={[styles.popoverMenuIcon]}
                reasonAttributes={{context: `HRProviderCard.${card.key}Sync`}}
            />
        );
    } else {
        rightComponent = (
            <ThreeDotsMenu
                shouldSelfPosition
                menuItems={overflowMenu}
                anchorAlignment={{
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                }}
            />
        );
    }

    const {approvalModeRoute, finalApproverRoute} = card;

    return (
        <>
            <MenuItem
                title={card.displayName}
                icon={cardIcon}
                iconType={card.iconType}
                wrapperStyle={[styles.ph0, styles.pv2, isFirst && styles.mt4, !!lastSyncErrorMessage && styles.pb0]}
                interactive={false}
                description={connectionDescription}
                errorText={lastSyncErrorMessage}
                errorTextStyle={[styles.mt5]}
                shouldShowRedDotIndicator
                shouldShowRightComponent
                rightComponent={rightComponent}
                fallbackIcon={fallbackIcon}
            />
            {card.isConnected && !!approvalModeRoute && (
                <OfflineWithFeedback pendingAction={card.config?.pendingFields?.approvalMode}>
                    <MenuItemWithTopDescription
                        description={translate('workspace.hr.approvalMode')}
                        title={card.approvalModeLabel}
                        style={[styles.sectionMenuItemTopDescription, styles.mt2]}
                        shouldShowRightIcon
                        brickRoadIndicator={card.config?.errorFields?.approvalMode ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        onPress={() => Navigation.navigate(approvalModeRoute)}
                    />
                </OfflineWithFeedback>
            )}
            {card.isConnected && !!finalApproverRoute && (
                <OfflineWithFeedback pendingAction={card.config?.pendingFields?.finalApprover}>
                    <MenuItemWithTopDescription
                        description={translate('workspace.hr.finalApprover')}
                        title={card.finalApproverDisplayName}
                        style={styles.sectionMenuItemTopDescription}
                        shouldShowRightIcon
                        brickRoadIndicator={card.config?.errorFields?.finalApprover ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        onPress={() => Navigation.navigate(finalApproverRoute)}
                    />
                </OfflineWithFeedback>
            )}
        </>
    );
}

export default HRProviderCard;
