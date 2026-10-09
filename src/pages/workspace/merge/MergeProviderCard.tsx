import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import ButtonDisabledWhenOffline from '@components/Button/composed/ButtonDisabledWhenOffline';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import RenderHTML from '@components/RenderHTML';
import ThreeDotsMenu from '@components/ThreeDotsMenu';

import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearMergeConnectionErrorField} from '@libs/actions/connections/merge';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import type Policy from '@src/types/onyx/Policy';

import React from 'react';
import {View} from 'react-native';

import type {MergeProviderCardDescriptor} from './types';

import useMergeProviderCardDetails from './useMergeProviderCardDetails';

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
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {environmentURL} = useEnvironment();
    const {fallbackIcon, cardIcon, connectionDescription, lastSyncErrorMessage, overflowMenu, visibleConfigRows} = useMergeProviderCardDetails({
        card,
        policy,
        handleConnect,
        canWriteMoreFeatures,
        showReadOnlyModal,
    });

    let rightInset: React.ReactNode;
    if (!card.isConnected) {
        rightInset = (
            <ButtonDisabledWhenOffline
                size={CONST.BUTTON_SIZE.SMALL}
                onPress={handleConnect}
                innerStyles={!canWriteMoreFeatures ? [styles.buttonOpacityDisabled, styles.buttonDisabled] : undefined}
                hoverStyles={!canWriteMoreFeatures ? [styles.buttonOpacityDisabled, styles.buttonDisabled] : undefined}
            >
                <Button.Text>{translate('workspace.merge.connect')}</Button.Text>
            </ButtonDisabledWhenOffline>
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
                                    numberOfLinesTitle={row.numberOfLinesTitle}
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
