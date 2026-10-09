import {ModalActions} from '@components/Modal/Global/ModalContext';
import TextLink from '@components/TextLink';
import type ThreeDotsMenuProps from '@components/ThreeDotsMenu/types';

import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';

import {removePolicyConnection, syncConnection} from '@libs/actions/connections';
import {showMergeManualSyncLimitModalIfReached} from '@libs/merge/MergeUtils';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import type Policy from '@src/types/onyx/Policy';

import type {ReactNode} from 'react';

import React from 'react';

import type {MergeProviderCardDescriptor} from './types';

type UseMergeProviderCardDetailsParams = {
    card: MergeProviderCardDescriptor;
    policy: Policy | undefined;
    handleConnect: () => void;
    canWriteMoreFeatures: boolean;
    showReadOnlyModal: () => void;

    /** Runs once the user confirms disconnecting, before the connection is removed */
    onDisconnect?: () => void;
};

/** The status text, sync error and overflow menu of a Merge provider, shared by the HR and Recruiting cards and their Connections panel */
function useMergeProviderCardDetails({card, policy, handleConnect, canWriteMoreFeatures, showReadOnlyModal, onDisconnect}: UseMergeProviderCardDetailsParams) {
    const {translate, datetimeToRelative} = useLocalize();
    const styles = useThemeStyles();
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

    // Checked in this order: reconnect, then a stale selection, then any other sync failure. A stale
    // selection is reported here even if the same sync also failed for an unrelated reason.
    let lastSyncErrorMessage: ReactNode | undefined;
    if (card.needsReconnect) {
        lastSyncErrorMessage = (
            <>
                {`${translate('workspace.merge.authenticationError', card.displayName)} `}
                {!isOffline && (
                    <TextLink
                        style={[styles.link, styles.fontSizeLabel]}
                        onPress={handleConnect}
                    >
                        {translate('workspace.merge.reconnectLink')}
                    </TextLink>
                )}
            </>
        );
    } else if (card.staleGroupsRoute) {
        const staleGroupsRoute = card.staleGroupsRoute;
        lastSyncErrorMessage = (
            <>
                {`${translate('workspace.hr.mergeHR.groups.staleSelectionError', card.displayName)} `}
                <TextLink
                    style={[styles.link, styles.fontSizeLabel]}
                    onPress={() => {
                        if (!canWriteMoreFeatures) {
                            showReadOnlyModal();
                            return;
                        }
                        Navigation.navigate(staleGroupsRoute);
                    }}
                >
                    {translate('workspace.hr.mergeHR.groups.updateSelectionLink')}
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
                    onDisconnect?.();
                    removePolicyConnection(policy, card.connectionName);
                });
            },
            shouldCallAfterModalHide: true,
        },
    ];

    // While the setup is incomplete only the rows that failed to save are shown, so the admin is steered to the setup flow first.
    const visibleConfigRows = card.isConnected && !card.isInitialSyncInProgress ? (card.configRows ?? []).filter((row) => !card.completeSetupRoute || !!row.errors) : [];

    return {fallbackIcon, cardIcon, connectionDescription, lastSyncErrorMessage, overflowMenu, visibleConfigRows};
}

export default useMergeProviderCardDetails;
