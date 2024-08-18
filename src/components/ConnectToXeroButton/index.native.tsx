import React, {useRef, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx, withOnyx} from 'react-native-onyx';
import {WebView} from 'react-native-webview';
import AccountingConnectionConfirmationModal from '@components/AccountingConnectionConfirmationModal';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import RequireTwoFactorAuthenticationModal from '@components/RequireTwoFactorAuthenticationModal';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import {removePolicyConnection} from '@libs/actions/connections';
import {getXeroSetupLink} from '@libs/actions/connections/ConnectToXero';
import getUAForWebView from '@libs/getUAForWebView';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Session} from '@src/types/onyx';
import type {ConnectToXeroButtonProps} from './types';

type ConnectToXeroButtonOnyxProps = {
    /** Session info for the currently logged in user. */
    session: OnyxEntry<Session>;
};

function ConnectToXeroButton({policyID, session, shouldDisconnectIntegrationBeforeConnecting, integrationToDisconnect}: ConnectToXeroButtonProps & ConnectToXeroButtonOnyxProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const webViewRef = useRef<WebView>(null);
    const [isWebViewOpen, setWebViewOpen] = useState(false);

    const authToken = session?.authToken ?? null;
    const {isOffline} = useNetwork();

    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const is2FAEnabled = account?.requiresTwoFactorAuth ?? false;

    const renderLoading = () => <FullScreenLoadingIndicator />;
    const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
    const [isRequire2FAModalOpen, setIsRequire2FAModalOpen] = useState(false);

    return (
        <>
            <Button
                onPress={() => {
                    if (!is2FAEnabled) {
                        setIsRequire2FAModalOpen(true);
                        return;
                    }

                    if (shouldDisconnectIntegrationBeforeConnecting && integrationToDisconnect) {
                        setIsDisconnectModalOpen(true);
                        return;
                    }
                    setWebViewOpen(true);
                }}
                text={translate('workspace.accounting.setup')}
                style={styles.justifyContentCenter}
                small
                isDisabled={isOffline}
            />
            {shouldDisconnectIntegrationBeforeConnecting && isDisconnectModalOpen && integrationToDisconnect && (
                <AccountingConnectionConfirmationModal
                    onConfirm={() => {
                        removePolicyConnection(policyID, integrationToDisconnect);
                        setIsDisconnectModalOpen(false);
                        setWebViewOpen(true);
                    }}
                    integrationToConnect={CONST.POLICY.CONNECTIONS.NAME.XERO}
                    onCancel={() => setIsDisconnectModalOpen(false)}
                />
            )}
            {isRequire2FAModalOpen && (
                <RequireTwoFactorAuthenticationModal
                    onSubmit={() => {
                        setIsRequire2FAModalOpen(false);
                        Navigation.dismissModal();
                        Navigation.navigate(ROUTES.SETTINGS_2FA.getRoute(ROUTES.POLICY_ACCOUNTING.getRoute(policyID), getXeroSetupLink(policyID)));
                    }}
                    onCancel={() => setIsRequire2FAModalOpen(false)}
                    isVisible
                    description={translate('twoFactorAuth.twoFactorAuthIsRequiredDescription')}
                />
            )}
            <Modal
                onClose={() => setWebViewOpen(false)}
                fullscreen
                isVisible={isWebViewOpen}
                type={CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE}
            >
                <HeaderWithBackButton
                    title={translate('workspace.accounting.title')}
                    onBackButtonPress={() => setWebViewOpen(false)}
                />
                <FullPageOfflineBlockingView>
                    <WebView
                        ref={webViewRef}
                        source={{
                            uri: getXeroSetupLink(policyID),
                            headers: {
                                Cookie: `authToken=${authToken}`,
                            },
                        }}
                        userAgent={getUAForWebView()}
                        incognito
                        startInLoadingState
                        renderLoading={renderLoading}
                    />
                </FullPageOfflineBlockingView>
            </Modal>
        </>
    );
}

ConnectToXeroButton.displayName = 'ConnectToXeroButton';

export default withOnyx<ConnectToXeroButtonProps & ConnectToXeroButtonOnyxProps, ConnectToXeroButtonOnyxProps>({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(ConnectToXeroButton);
