import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/ButtonComposed';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import RenderHTML from '@components/RenderHTML';
import TextLink from '@components/TextLink';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import type ThreeDotsMenuProps from '@components/ThreeDotsMenu/types';

import useConfirmModal from '@hooks/useConfirmModal';
import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';

import {removePolicyConnection, syncConnection} from '@libs/actions/connections';
import {clearMergeConnectionErrorField} from '@libs/actions/connections/merge';
import {showMergeManualSyncLimitModalIfReached} from '@libs/merge/MergeUtils';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import type Policy from '@src/types/onyx/Policy';

import type {ReactNode} from 'react';

import React from 'react';
import {View} from 'react-native';

import type {MergeProviderCardDescriptor} from './types';

type MergeProviderCardProps = {
    /** Descriptor object containing the Merge provider's display info, connection state, and sync status. */
    card: MergeProviderCardDescriptor;

    /** The workspace policy that owns this Merge integration. */
    policy: Policy | undefined;

    /** Callback invoked when the user taps the "Connect" or "Reconnect" button. */
    handleConnect: () => void;

    /** Whether the current user can edit this Merge connection. */
    canWriteMoreFeatures: boolean;

    /** Shows the read-only action modal. */
    showReadOnlyModal: () => void;
};

function MergeProviderCard({card, policy, handleConnect, canWriteMoreFeatures, showReadOnlyModal}: MergeProviderCardProps) {
    const {translate, datetimeToRelative} = useLocalize();
    const styles = useThemeStyles();
    const {environmentURL} = useEnvironment();
    const {isOffline} = useNetwork();
    const icons = useMemoizedLazyExpensifyIcons(['Sync', 'Trashcan', 'Building', 'CheckCircle']);
    const {showConfirmModal} = useConfirmModal();

    const fallbackIcon = icons.Building;
    const cardIcon = card.icon || fallbackIcon;

    let connectionDescription: string;
    if (card.isSyncInProgress) {
        connectionDescription = card.syncStageInProgress ? translate('workspace.hr.syncStageName', card.syncStageInProgress) : translate(`workspace.${card.category}.syncing`);
    } else if (!card.successfulDate) {
        connectionDescription = translate('workspace.merge.notSync');
    } else {
        connectionDescription = translate('workspace.merge.lastSync', datetimeToRelative(card.successfulDate));
    }

    let lastSyncErrorMessage: ReactNode | undefined;
    if (card.needsReconnect) {
        lastSyncErrorMessage = (
            <>
                {`${translate('workspace.merge.authenticationError', card.displayName)} `}
                <TextLink
                    style={[styles.link, styles.fontSizeLabel]}
                    onPress={handleConnect}
                >
                    {translate('workspace.merge.reconnectLink')}
                </TextLink>
            </>
        );
    } else if (card.hasError) {
        const genericError = translate('workspace.merge.syncError', card.displayName);
        lastSyncErrorMessage = card.lastSyncErrorMessage ? `${genericError} ("${card.lastSyncErrorMessage}")` : genericError;
    }

    const getPrimaryMenuItem = (): ThreeDotsMenuProps['menuItems'][number] => {
        if (card.needsReconnect) {
            return {
                icon: icons.Sync,
                text: translate('workspace.merge.reconnect'),
                onSelected: handleConnect,
                disabled: isOffline,
            };
        }
        if (card.completeSetupRoute) {
            return {
                icon: icons.CheckCircle,
                text: translate('workspace.merge.completeSetup'),
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
            };
        }
        return {
            icon: icons.Sync,
            text: translate('workspace.merge.syncNow'),
            onSelected: () => {
                if (showMergeManualSyncLimitModalIfReached(policy, card.connectionName, translate, showConfirmModal)) {
                    return;
                }
                syncConnection(policy, card.connectionName);
            },
            disabled: isOffline,
            shouldCallAfterModalHide: true,
        };
    };

    const overflowMenu: ThreeDotsMenuProps['menuItems'] = [
        getPrimaryMenuItem(),
        {
            icon: icons.Trashcan,
            text: translate('workspace.merge.disconnect'),
            onSelected: () => {
                showConfirmModal({
                    title: translate('workspace.merge.disconnectTitle', card.displayName),
                    prompt: translate('workspace.merge.disconnectPrompt', card.displayName),
                    confirmText: translate('workspace.merge.disconnect'),
                    cancelText: translate('common.cancel'),
                    buttonVariant: CONST.BUTTON_VARIANT.DANGER,
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
                size={CONST.BUTTON_SIZE.SMALL}
                onPress={handleConnect}
                innerStyles={!canWriteMoreFeatures ? [styles.buttonOpacityDisabled, styles.buttonDisabled] : undefined}
                hoverStyles={!canWriteMoreFeatures ? [styles.buttonOpacityDisabled, styles.buttonDisabled] : undefined}
                isDisabled={isOffline}
            >
                <Button.Text>{translate('workspace.merge.connect')}</Button.Text>
            </Button>
        );
    } else if (card.isSyncInProgress) {
        rightInset = <ActivityIndicator style={[styles.popoverMenuIcon, styles.alignSelfCenter]} />;
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

    // While the setup is incomplete only the rows that failed to save are shown, so the admin is steered to the setup flow first.
    const visibleConfigRows = card.isConnected && !card.isInitialSyncInProgress ? (card.configRows ?? []).filter((row) => !card.completeSetupRoute || !!row.errors) : [];

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
                        <RenderHTML html={translate(`workspace.${card.category}.setupIncomplete`, canWriteMoreFeatures ? `${environmentURL}/${card.completeSetupRoute}` : undefined)} />
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
            {visibleConfigRows.length > 0 && (
                <View style={styles.mt2}>
                    {visibleConfigRows.map((row) => {
                        const RowMenuItem = row.shouldRenderAsMenuItem ? MenuItem : MenuItemWithTopDescription;

                        return (
                            <OfflineWithFeedback
                                key={row.field}
                                pendingAction={row.pendingAction}
                                errors={row.errors}
                                onClose={() => clearMergeConnectionErrorField(policy?.id, card.connectionName, row.field)}
                            >
                                <RowMenuItem
                                    description={row.description}
                                    title={row.title}
                                    icon={row.icon}
                                    style={styles.sectionMenuItemTopDescription}
                                    shouldShowRightIcon={canWriteMoreFeatures}
                                    brickRoadIndicator={row.errors ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                                    onPress={() => Navigation.navigate(row.route)}
                                    interactive={canWriteMoreFeatures}
                                />
                            </OfflineWithFeedback>
                        );
                    })}
                </View>
            )}
        </>
    );
}

export default MergeProviderCard;
