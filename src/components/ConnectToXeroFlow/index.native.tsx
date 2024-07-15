import React, {useEffect, useRef, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import {WebView} from 'react-native-webview';
import AccountingConnectionConfirmationModal from '@components/AccountingConnectionConfirmationModal';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import useLocalize from '@hooks/useLocalize';
import {removePolicyConnection} from '@libs/actions/connections';
import {getXeroSetupLink} from '@libs/actions/connections/ConnectToXero';
import getUAForWebView from '@libs/getUAForWebView';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Session} from '@src/types/onyx';
import type {ConnectToXeroFlowProps} from './types';

type ConnectToXeroFlowOnyxProps = {
    /** Session info for the currently logged in user. */
    session: OnyxEntry<Session>;
};

function ConnectToXeroFlow({policyID, session, shouldDisconnectIntegrationBeforeConnecting, integrationToDisconnect}: ConnectToXeroFlowProps & ConnectToXeroFlowOnyxProps) {
    const {translate} = useLocalize();
    const webViewRef = useRef<WebView>(null);
    const [isWebViewOpen, setWebViewOpen] = useState(false);

    const authToken = session?.authToken ?? null;

    const renderLoading = () => <FullScreenLoadingIndicator />;
    const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);

    useEffect(() => {
        if (shouldDisconnectIntegrationBeforeConnecting && integrationToDisconnect) {
            setIsDisconnectModalOpen(true);
            return;
        }
        setWebViewOpen(true);
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
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

ConnectToXeroFlow.displayName = 'ConnectToXeroFlow';

export default withOnyx<ConnectToXeroFlowProps & ConnectToXeroFlowOnyxProps, ConnectToXeroFlowOnyxProps>({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(ConnectToXeroFlow);
