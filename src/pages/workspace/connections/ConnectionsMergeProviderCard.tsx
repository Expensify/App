import ActivityIndicator from '@components/ActivityIndicator';
import UserAvatar from '@components/Avatar/UserAvatar';
import FormHelpMessage from '@components/FormHelpMessage';
import Header from '@components/Header';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import RenderHTML from '@components/RenderHTML';
import ScrollView from '@components/ScrollView';

import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearMergeConnectionErrorField} from '@libs/actions/connections/merge';
import Navigation from '@libs/Navigation/Navigation';

import type {MergeProviderCardDescriptor} from '@pages/workspace/merge/types';
import useMergeProviderCardDetails from '@pages/workspace/merge/useMergeProviderCardDetails';

import CONST from '@src/CONST';
import type Policy from '@src/types/onyx/Policy';

import React from 'react';
import {View} from 'react-native';

type ConnectionsMergeProviderCardProps = {
    /** Descriptor object containing the Merge provider's display info, connection state, and sync status. */
    card: MergeProviderCardDescriptor;

    /** The workspace policy that owns this Merge integration. */
    policy: Policy | undefined;

    /** Callback invoked when the user taps the "Connect" or "Reconnect" button. */
    handleConnect: () => void;

    /** Called once the user confirms disconnecting, right before the connection is removed */
    onDisconnect?: () => void;

    /** Called when the header's back button is pressed. */
    onBackButtonPress: () => void;

    /** Whether the current user can edit this Merge connection. */
    canWriteMoreFeatures: boolean;

    /** Shows the read-only action modal. */
    showReadOnlyModal: () => void;
};

function ConnectionsMergeProviderCard({card, policy, handleConnect, onDisconnect, onBackButtonPress, canWriteMoreFeatures, showReadOnlyModal}: ConnectionsMergeProviderCardProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {environmentURL} = useEnvironment();
    const {cardIcon, connectionDescription, lastSyncErrorMessage, overflowMenu, visibleConfigRows} = useMergeProviderCardDetails({
        card,
        policy,
        handleConnect,
        canWriteMoreFeatures,
        showReadOnlyModal,
        onDisconnect,
    });

    return (
        <>
            <Header>
                <Header.BackButton onPress={onBackButtonPress} />
                <UserAvatar
                    containerStyles={[StyleUtils.getWidthAndHeightStyle(StyleUtils.getAvatarSize(CONST.AVATAR_SIZE.DEFAULT)), styles.mr3]}
                    // Many partner logos are transparent, so they need a white backdrop in both themes
                    imageStyles={styles.backgroundWhite}
                    size={CONST.AVATAR_SIZE.DEFAULT}
                    source={cardIcon}
                    accountID={CONST.DEFAULT_NUMBER_ID}
                />
                <Header.Title
                    title={card.displayName}
                    subtitle={!card.completeSetupRoute && card.isConnected ? connectionDescription : undefined}
                    titleStyles={[styles.textNormal, styles.lineHeightLarge]}
                />
                <Header.Right>
                    {card.isSyncInProgress && <ActivityIndicator style={styles.popoverMenuIcon} />}
                    {card.isConnected && !card.isSyncInProgress && <Header.ThreeDotsMenu items={overflowMenu} />}
                </Header.Right>
            </Header>
            <ScrollView
                contentContainerStyle={styles.pt3}
                addBottomSafeAreaPadding
            >
                {!!card.completeSetupRoute && (
                    <View style={[styles.ph5, styles.mb3]}>
                        <RenderHTML html={translate(`workspace.${card.category}.setupIncomplete`, canWriteMoreFeatures ? `${environmentURL}/${card.completeSetupRoute}` : undefined)} />
                    </View>
                )}
                {!!lastSyncErrorMessage && (
                    <FormHelpMessage
                        isError
                        message={lastSyncErrorMessage}
                        style={[styles.ph5, styles.mb3]}
                    />
                )}
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
                                shouldShowRightIcon={canWriteMoreFeatures}
                                brickRoadIndicator={row.errors ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                                onPress={() => Navigation.navigate(row.route)}
                                interactive={canWriteMoreFeatures}
                            />
                        </OfflineWithFeedback>
                    );
                })}
            </ScrollView>
        </>
    );
}

export default ConnectionsMergeProviderCard;
