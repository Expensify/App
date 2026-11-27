/**
 * Lists the Gmail accounts the current user connected for receipt sync, with their sync status and a way to remove each.
 */
import UserAvatar from '@components/Avatar/UserAvatar';
import Badge from '@components/Badge';
import FormHelpMessage from '@components/FormHelpMessage';
import Header from '@components/Header';
import MenuItem from '@components/MenuItem';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import ThreeDotsMenu from '@components/ThreeDotsMenu';

import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getGmailConnections, getLastSearchedDatetime} from '@libs/OAuthConnectionUtils';
import type {GmailConnection} from '@libs/OAuthConnectionUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import {clearOAuthConnectionErrors, disconnectGmail} from '@userActions/OAuthConnections';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';
import {View} from 'react-native';

type ConnectionsGmailPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CONNECTIONS_GMAIL>;

function ConnectionsGmailPage({route}: ConnectionsGmailPageProps) {
    const policyID = route.params.policyID;
    const styles = useThemeStyles();
    const {translate, datetimeToRelative} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const {showConfirmModal} = useConfirmModal();
    const icons = useMemoizedLazyExpensifyIcons(['GmailSquare', 'Trashcan']);
    const [oauthConnections] = useOnyx(ONYXKEYS.NVP_PRIVATE_OAUTH_CONNECTIONS);
    const connections = getGmailConnections(oauthConnections);

    const goBack = () => Navigation.goBack(ROUTES.WORKSPACE_CONNECTIONS.getRoute(policyID));

    const confirmRemoveConnection = (connection: GmailConnection) => {
        showConfirmModal({
            title: translate('workspace.connections.gmail.removeConnectionTitle'),
            prompt: translate('workspace.connections.gmail.removeConnectionPrompt', connection.id),
            confirmText: translate('workspace.connections.gmail.removeConnection'),
            cancelText: translate('common.cancel'),
            buttonVariant: CONST.BUTTON_VARIANT.DANGER,
        }).then(({action}) => {
            if (action !== ModalActions.CONFIRM) {
                return;
            }
            // The page has nothing left to show once the last connection goes, so leave it before removing
            if (connections.length === 1) {
                Navigation.goBack(ROUTES.WORKSPACE_CONNECTIONS.getRoute(policyID), {afterTransition: () => disconnectGmail(connection.connectionID)});
                return;
            }
            disconnectGmail(connection.connectionID);
        });
    };

    const renderConnection = (connection: GmailConnection) => {
        const lastSearchedDatetime = getLastSearchedDatetime(connection.lastSearchedAt);
        let statusMessage = translate('workspace.connections.gmail.notSyncedYet');
        if (connection.error) {
            statusMessage = translate('workspace.connections.gmail.notSynced');
        } else if (lastSearchedDatetime) {
            statusMessage = datetimeToRelative(lastSearchedDatetime);
        }

        return (
            <OfflineWithFeedback
                key={connection.connectionID}
                pendingAction={connection.pendingAction}
                errors={connection.errors}
                onClose={() => clearOAuthConnectionErrors(connection.connectionID)}
                errorRowStyles={styles.ph5}
            >
                {/* The row has no press action, so it stays out of the accessibility tree and the menu button stays reachable */}
                <MenuItem.Root shouldBeAccessible={false}>
                    <MenuItem.Row>
                        <MenuItem.Leading>
                            <UserAvatar
                                source={icons.GmailSquare}
                                accountID={CONST.DEFAULT_NUMBER_ID}
                                // The Gmail logo is transparent, so it needs a white backdrop in both themes
                                imageStyles={styles.backgroundWhite}
                            />
                        </MenuItem.Leading>
                        <MenuItem.Content>
                            <MenuItem.Title>{connection.id}</MenuItem.Title>
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.mt1]}>
                                <Badge
                                    text={translate(connection.error ? 'workspace.connections.gmail.inactive' : 'workspace.connections.active')}
                                    success={!connection.error}
                                    error={!!connection.error}
                                    isCondensed
                                    badgeStyles={styles.ml0}
                                />
                                <Text style={[styles.textLabelSupporting, styles.textLineHeightNormal, styles.flex1, styles.ml2]}>{statusMessage}</Text>
                            </View>
                        </MenuItem.Content>
                        <MenuItem.Trailing>
                            <ThreeDotsMenu
                                shouldSelfPosition
                                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.CONNECTIONS.GMAIL_MENU}
                                menuItems={[
                                    {
                                        icon: icons.Trashcan,
                                        text: translate('workspace.connections.gmail.removeConnection'),
                                        sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.CONNECTIONS.GMAIL_MENU_REMOVE,
                                        onSelected: () => confirmRemoveConnection(connection),
                                    },
                                ]}
                                anchorAlignment={{
                                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                                }}
                            />
                        </MenuItem.Trailing>
                    </MenuItem.Row>
                </MenuItem.Root>
                {!!connection.error && (
                    <FormHelpMessage
                        isError
                        message={translate(`workspace.connections.gmail.error.${connection.error}`)}
                        style={[styles.ph5, styles.mb3]}
                    />
                )}
            </OfflineWithFeedback>
        );
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            shouldBeBlocked={!isBetaEnabled(CONST.BETAS.RECEIPT_SYNC) || !connections.length}
            fullPageNotFoundViewProps={{onBackButtonPress: goBack}}
        >
            <ScreenWrapper
                testID="ConnectionsGmailPage"
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <Header>
                    <Header.BackButton onPress={goBack} />
                    <Header.Title title={translate('workspace.common.existingConnections')} />
                </Header>
                <ScrollView
                    contentContainerStyle={styles.pt3}
                    addBottomSafeAreaPadding
                >
                    {connections.map(renderConnection)}
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default ConnectionsGmailPage;
