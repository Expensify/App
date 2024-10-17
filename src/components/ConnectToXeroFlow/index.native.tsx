import React, {useEffect, useRef, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import {WebView} from 'react-native-webview';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import RequireTwoFactorAuthenticationModal from '@components/RequireTwoFactorAuthenticationModal';
import useLocalize from '@hooks/useLocalize';
import {getXeroSetupLink} from '@libs/actions/connections/Xero';
import getUAForWebView from '@libs/getUAForWebView';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ConnectToXeroFlowProps} from './types';

function ConnectToXeroFlow({policyID}: ConnectToXeroFlowProps) {
    const {translate} = useLocalize();
    const webViewRef = useRef<WebView>(null);
    const [isWebViewOpen, setWebViewOpen] = useState(false);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const authToken = session?.authToken ?? null;

    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const is2FAEnabled = account?.requiresTwoFactorAuth ?? false;

    const renderLoading = () => <FullScreenLoadingIndicator />;
    const [isRequire2FAModalOpen, setIsRequire2FAModalOpen] = useState(false);

    useEffect(() => {
        if (!is2FAEnabled) {
            setIsRequire2FAModalOpen(true);
            return;
        }
        setWebViewOpen(true);
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <RequireTwoFactorAuthenticationModal
                onSubmit={() => {
                    setIsRequire2FAModalOpen(false);
                    Navigation.navigate(ROUTES.SETTINGS_2FA.getRoute(ROUTES.POLICY_ACCOUNTING.getRoute(policyID), getXeroSetupLink(policyID)));
                }}
                onCancel={() => setIsRequire2FAModalOpen(false)}
                isVisible={isRequire2FAModalOpen}
                description={translate('twoFactorAuth.twoFactorAuthIsRequiredDescription')}
            />
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

export default ConnectToXeroFlow;
