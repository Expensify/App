/**
 * Lists the Gmail accounts the current user connected for receipt sync, with their sync status and a way to remove each.
 */
import HeaderCentralPane from '@components/Header/composed/HeaderCentralPane';
import MenuItem from '@components/MenuItem';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';

import useConfirmModal from '@hooks/useConfirmModal';
import useDocumentTitle from '@hooks/useDocumentTitle';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import {getGmailConnections} from '@libs/OAuthConnectionUtils';
import type {GmailConnection} from '@libs/OAuthConnectionUtils';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import {disconnectGmail} from '@userActions/OAuthConnections';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import {View} from 'react-native';

import GmailAvatar from './GmailAvatar';
import GmailConnectionRow from './GmailConnectionRow';

function ConnectionsPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBetaEnabled} = usePermissions();
    const {showConfirmModal} = useConfirmModal();
    const [oauthConnections] = useOnyx(ONYXKEYS.NVP_PRIVATE_OAUTH_CONNECTIONS);
    const connections = getGmailConnections(oauthConnections);

    useDocumentTitle(translate('connectionsPage.title'));

    if (!isBetaEnabled(CONST.BETAS.RECEIPT_SYNC)) {
        return <NotFoundPage />;
    }

    const confirmRemoveConnection = (connection: GmailConnection) => {
        showConfirmModal({
            title: translate('connectionsPage.gmail.removeConnectionTitle'),
            prompt: translate('connectionsPage.gmail.removeConnectionPrompt', connection.id),
            confirmText: translate('connectionsPage.gmail.removeConnection'),
            cancelText: translate('common.cancel'),
            buttonVariant: CONST.BUTTON_VARIANT.DANGER,
        }).then(({action}) => {
            if (action !== ModalActions.CONFIRM) {
                return;
            }
            disconnectGmail(connection.connectionID);
        });
    };

    return (
        <ScreenWrapper
            testID="ConnectionsPage"
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
        >
            {({safeAreaPaddingBottomStyle}) => (
                <>
                    <HeaderCentralPane
                        title={translate('connectionsPage.title')}
                        shouldDisplaySearchRouter
                    />
                    <ScrollView contentContainerStyle={styles.pt3}>
                        <View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection, safeAreaPaddingBottomStyle]}>
                            <Section
                                title={translate('connectionsPage.title')}
                                isCentralPane
                                titleStyles={styles.accountSettingsSectionTitle}
                                childrenStyles={styles.pt3}
                            >
                                {connections.length ? (
                                    connections.map((connection) => (
                                        <GmailConnectionRow
                                            key={connection.connectionID}
                                            connection={connection}
                                            onRemove={confirmRemoveConnection}
                                        />
                                    ))
                                ) : (
                                    <MenuItem.Root shouldBeAccessible={false}>
                                        <MenuItem.Row>
                                            <MenuItem.Leading>
                                                <GmailAvatar />
                                            </MenuItem.Leading>
                                            <MenuItem.Content>
                                                <MenuItem.Title>{translate('connectionsPage.gmail.title')}</MenuItem.Title>
                                                <MenuItem.Description>{translate('connectionsPage.gmail.description')}</MenuItem.Description>
                                            </MenuItem.Content>
                                        </MenuItem.Row>
                                    </MenuItem.Root>
                                )}
                            </Section>
                        </View>
                    </ScrollView>
                </>
            )}
        </ScreenWrapper>
    );
}

export default ConnectionsPage;
