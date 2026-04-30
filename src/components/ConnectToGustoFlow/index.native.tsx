import React, {useCallback, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {WebView} from 'react-native-webview';
import ActivityIndicator from '@components/ActivityIndicator';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import getGustoSetupLink from '@libs/actions/connections/Gusto';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type ConnectToGustoFlowProps from './types';

function ConnectToGustoFlow({policyID}: ConnectToGustoFlowProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const webViewRef = useRef<WebView>(null);
    const [isWebViewOpen, setIsWebViewOpen] = useState(true);
    const [session] = useOnyx(ONYXKEYS.SESSION);

    const renderLoading = useCallback(
        () => (
            <View style={[StyleSheet.absoluteFill, styles.fullScreenLoading]}>
                <ActivityIndicator
                    size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                    reasonAttributes={{context: 'ConnectToGustoFlow'}}
                />
            </View>
        ),
        [styles.fullScreenLoading],
    );

    const authToken = session?.authToken ?? null;
    return (
        <Modal
            onClose={() => setIsWebViewOpen(false)}
            fullscreen
            isVisible={isWebViewOpen}
            type={CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE}
        >
            <HeaderWithBackButton
                title={translate('workspace.common.hr')}
                onBackButtonPress={() => setIsWebViewOpen(false)}
                shouldDisplayHelpButton={false}
            />
            <FullPageOfflineBlockingView>
                <WebView
                    ref={webViewRef}
                    source={{
                        uri: getGustoSetupLink(policyID),
                        headers: {
                            Cookie: `authToken=${authToken}`,
                        },
                    }}
                    incognito
                    startInLoadingState
                    renderLoading={renderLoading}
                />
            </FullPageOfflineBlockingView>
        </Modal>
    );
}

export default ConnectToGustoFlow;
