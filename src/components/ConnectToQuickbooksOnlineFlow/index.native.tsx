import React, {useCallback, useEffect, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {WebView} from 'react-native-webview';
import ActivityIndicator from '@components/ActivityIndicator';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getQuickbooksOnlineSetupLink} from '@libs/actions/connections/QuickbooksOnline';
import {enablePolicyTaxes} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ConnectToQuickbooksOnlineFlowProps} from './types';

function ConnectToQuickbooksOnlineFlow({policyID}: ConnectToQuickbooksOnlineFlowProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const webViewRef = useRef<WebView>(null);
    const [isWebViewOpen, setIsWebViewOpen] = useState(false);
    const [session] = useOnyx(ONYXKEYS.SESSION);

    const renderLoading = useCallback(
        () => (
            <View style={[StyleSheet.absoluteFill, styles.fullScreenLoading]}>
                <ActivityIndicator
                    size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                    reasonAttributes={{context: 'ConnectToQuickbooksOnlineFlow'}}
                />
            </View>
        ),
        [styles.fullScreenLoading],
    );

    const authToken = session?.authToken ?? null;

    useEffect(() => {
        // Since QBO doesn't support Taxes, we should disable them from the LHN when connecting to QBO
        enablePolicyTaxes(policyID, false);
        setIsWebViewOpen(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
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

export default ConnectToQuickbooksOnlineFlow;
