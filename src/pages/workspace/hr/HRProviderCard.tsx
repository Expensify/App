import React from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import RenderHTML from '@components/RenderHTML';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import type ThreeDotsMenuProps from '@components/ThreeDotsMenu/types';
import useConfirmModal from '@hooks/useConfirmModal';
import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import {removePolicyConnection, syncConnection} from '@libs/actions/connections';
import {clearHRConnectionErrorField} from '@libs/actions/connections/MergeHR';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import type Policy from '@src/types/onyx/Policy';
import type IconAsset from '@src/types/utils/IconAsset';
import type {HRCardDescriptor} from './utils';

type HRProviderCardProps = {
    /** Descriptor object containing the HR provider's display info, connection state, and sync status. */
    card: HRCardDescriptor;

    /** The workspace policy that owns this HR integration. */
    policy: Policy | undefined;

    /** Callback invoked when the user taps the "Connect" button for an unconnected provider. */
    handleConnect: () => void;

    /** Whether the current user can edit this HR connection. */
    canWriteMoreFeatures: boolean;

    /** Shows the read-only action modal. */
    showReadOnlyModal: () => void;
};

function HRProviderCard({card, policy, handleConnect, canWriteMoreFeatures, showReadOnlyModal}: HRProviderCardProps) {
    const {translate, datetimeToRelative} = useLocalize();
    const styles = useThemeStyles();
    const {environmentURL} = useEnvironment();
    const {isOffline} = useNetwork();
    const icons = useMemoizedLazyExpensifyIcons(['Sync', 'Trashcan', 'Building', 'CheckCircle']);
    const {showConfirmModal} = useConfirmModal();

    const fallbackIcon = icons.Building;
    // Some integrations have a hardcoded icon, others are passing icon url.
    const cardIcon = typeof card.icon === 'string' && card.icon.startsWith('http') ? card.icon : (card.icon as IconAsset) || fallbackIcon;

    let connectionDescription: string | undefined;
    if (card.isSyncInProgress) {
        connectionDescription = card.syncStageInProgress ? translate('workspace.hr.syncStageName', {stage: card.syncStageInProgress}) : translate('workspace.hr.syncing');
    } else if (card.successfulDate && !card.hasError) {
        connectionDescription = translate('workspace.hr.lastSync', datetimeToRelative(card.successfulDate));
    }

    let lastSyncErrorMessage: string | undefined;
    if (card.hasError) {
        const genericError = translate('workspace.hr.syncError', card.displayName);
        lastSyncErrorMessage = card.lastSyncErrorMessage ? `${genericError} ("${card.lastSyncErrorMessage}")` : genericError;
    }

    const overflowMenu: ThreeDotsMenuProps['menuItems'] = [
        card.completeSetupRoute
            ? {
                  icon: icons.CheckCircle,
                  text: translate('workspace.hr.mergeHR.completeSetup'),
                  onSelected: () => {
                      if (!canWriteMoreFeatures) {
                          showReadOnlyModal();
                          return;
                      }
                      if (card.completeSetupRoute) {
                          Navigation.navigate(card.completeSetupRoute);
                      }
                  },
                  disabled: isOffline,
              }
            : {
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
                    if (result?.action !== ModalActions.CONFIRM || !policy) {
                        return;
                    }
                    removePolicyConnection(policy, card.connectionName);
                });
            },
            shouldCallAfterModalHide: true,
        },
    ];

    let rightInset: React.ReactNode;
    if (!card.isConnected) {
        rightInset = (
            <Button
                small
                text={translate('workspace.hr.connect')}
                onPress={() => {
                    if (!canWriteMoreFeatures) {
                        showReadOnlyModal();
                        return;
                    }
                    handleConnect();
                }}
                innerStyles={!canWriteMoreFeatures ? [styles.buttonOpacityDisabled, styles.buttonDisabled] : undefined}
                hoverStyles={!canWriteMoreFeatures ? [styles.buttonOpacityDisabled, styles.buttonDisabled] : undefined}
                isDisabled={isOffline}
            />
        );
    } else if (card.isSyncInProgress) {
        rightInset = (
            <ActivityIndicator
                style={[styles.popoverMenuIcon, styles.alignSelfCenter]}
                reasonAttributes={{context: `HRProviderCard.${card.key}Sync`}}
            />
        );
    } else {
        rightInset = (
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

    const rightComponent = <View style={styles.alignSelfCenter}>{rightInset}</View>;

    return (
        <>
            <MenuItem
                title={card.displayName}
                icon={cardIcon}
                iconType={CONST.ICON_TYPE_AVATAR}
                wrapperStyle={[styles.ph0, styles.pv2, !!lastSyncErrorMessage && styles.pb0]}
                interactive={false}
                description={!card.completeSetupRoute && card.isConnected ? connectionDescription : undefined}
                descriptionAddon={
                    card.completeSetupRoute ? (
                        <RenderHTML html={translate('workspace.hr.mergeHR.setupIncomplete', canWriteMoreFeatures ? `${environmentURL}/${card.completeSetupRoute}` : undefined)} />
                    ) : undefined
                }
                errorText={lastSyncErrorMessage}
                errorTextStyle={styles.mt5}
                shouldShowRedDotIndicator
                shouldShowRightComponent={!!rightInset}
                brickRoadIndicator={card.completeSetupRoute ? CONST.BRICK_ROAD_INDICATOR_STATUS.INFO : undefined}
                rightComponent={rightComponent}
                fallbackIcon={fallbackIcon}
            />
            {card.isConnected && !card.isInitialSyncInProgress && !!card.configRows?.some((row) => !card.completeSetupRoute || !!row.errors) && (
                <View style={styles.mt2}>
                    {card.configRows
                        .filter((row) => !card.completeSetupRoute || !!row.errors)
                        .map((row) => (
                            <OfflineWithFeedback
                                key={row.field}
                                pendingAction={row.pendingAction}
                                errors={row.errors}
                                onClose={() => clearHRConnectionErrorField(policy?.id, card.connectionName, row.field)}
                            >
                                <MenuItemWithTopDescription
                                    description={row.description}
                                    title={row.title}
                                    style={styles.sectionMenuItemTopDescription}
                                    shouldShowRightIcon={canWriteMoreFeatures}
                                    brickRoadIndicator={row.errors ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                                    onPress={() => Navigation.navigate(row.route)}
                                    interactive={canWriteMoreFeatures}
                                />
                            </OfflineWithFeedback>
                        ))}
                </View>
            )}
        </>
    );
}

export default HRProviderCard;
