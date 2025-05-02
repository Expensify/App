import React, {useEffect, useRef, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import {WebView} from 'react-native-webview';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import useLocalize from '@hooks/useLocalize';
import {getQuickbooksOnlineSetupLink} from '@libs/actions/connections/QuickbooksOnline';
import {enablePolicyTaxes} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ConnectToQuickbooksOnlineFlowProps} from './types';

const renderLoading = () => <FullScreenLoadingIndicator />;

function ConnectToQuickbooksOnlineFlow({policyID}: ConnectToQuickbooksOnlineFlowProps) {
    const {translate} = useLocalize();
    const webViewRef = useRef<WebView>(null);
    const [isWebViewOpen, setWebViewOpen] = useState(false);
    const [session] = useOnyx(ONYXKEYS.SESSION);

    const authToken = session?.authToken ?? null;

    useEffect(() => {
        // Since QBO doesn't support Taxes, we should disable them from the LHN when connecting to QBO
        enablePolicyTaxes(policyID, false);
        setWebViewOpen(true);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    if (isWebViewOpen) {
        return (
            <Modal
                onClose={() => setWebViewOpen(false)}
                fullscreen
                isVisible
                type={CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE}
            >
                <HeaderWithBackButton
                    title={translate('workspace.accounting.title')}
                    onBackButtonPress={() => setWebViewOpen(false)}
                    shouldDisplayHelpButton={false}
                />
                <FullPageOfflineBlockingView>
                    <WebView
                        ref={webViewRef}
                        source={{
                            uri: getQuickbooksOnlineSetupLink(policyID),
                            headers: {
                                Cookie: `authToken=${authToken}`,
                            },
                        }}
                        incognito // 'incognito' prop required for Android, issue here https://github.com/react-native-webview/react-native-webview/issues/1352
                        startInLoadingState
                        renderLoading={renderLoading}
                    />
                </FullPageOfflineBlockingView>
            </Modal>
        );
    }
}

ConnectToQuickbooksOnlineFlow.displayName = 'ConnectToQuickbooksOnlineFlow';

export default ConnectToQuickbooksOnlineFlow;
