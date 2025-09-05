import React, {useEffect, useRef, useState} from 'react';
import {WebView} from 'react-native-webview';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import RequireTwoFactorAuthenticationModal from '@components/RequireTwoFactorAuthenticationModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {getXeroSetupLink} from '@libs/actions/connections/Xero';
import {close} from '@libs/actions/Modal';
import getUAForWebView from '@libs/getUAForWebView';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ConnectToXeroFlowProps} from './types';

function ConnectToXeroFlow({policyID}: ConnectToXeroFlowProps) {
    const {translate} = useLocalize();
    const webViewRef = useRef<WebView>(null);
    const [isWebViewOpen, setIsWebViewOpen] = useState(false);
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const authToken = session?.authToken ?? null;

    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: false});
    const is2FAEnabled = account?.requiresTwoFactorAuth ?? false;

    const renderLoading = () => <FullScreenLoadingIndicator />;
    const [isRequire2FAModalOpen, setIsRequire2FAModalOpen] = useState(false);

    useEffect(() => {
        if (!is2FAEnabled) {
            setIsRequire2FAModalOpen(true);
            return;
        }
        setIsWebViewOpen(true);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            {!is2FAEnabled && (
                <RequireTwoFactorAuthenticationModal
                    onSubmit={() => {
                        setIsRequire2FAModalOpen(false);
                        close(() => Navigation.navigate(ROUTES.SETTINGS_2FA_ROOT.getRoute(ROUTES.POLICY_ACCOUNTING.getRoute(policyID), getXeroSetupLink(policyID))));
                    }}
                    onCancel={() => setIsRequire2FAModalOpen(false)}
                    isVisible={isRequire2FAModalOpen}
                    description={translate('twoFactorAuth.twoFactorAuthIsRequiredDescription')}
                />
            )}
            <Modal
                onClose={() => setIsWebViewOpen(false)}
                fullscreen
                isVisible={isWebViewOpen}
                type={CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE}
            >
                <HeaderWithBackButton
                    title={translate('workspace.accounting.title')}
                    onBackButtonPress={() => setIsWebViewOpen(false)}
                    shouldDisplayHelpButton={false}
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
