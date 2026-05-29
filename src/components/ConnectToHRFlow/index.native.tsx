import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {WebView} from 'react-native-webview';
import type {WebViewOpenWindowEvent} from 'react-native-webview/lib/WebViewTypes';
import ActivityIndicator from '@components/ActivityIndicator';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getShortLivedAuthTokenURL} from '@userActions/Link';
import CONST from '@src/CONST';
import type ConnectToHRFlowProps from './types';

function ConnectToHRFlow({setupLink}: ConnectToHRFlowProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [isWebViewOpen, setIsWebViewOpen] = useState(true);
    const [popupUrl, setPopupUrl] = useState<string | null>(null);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [authenticatedUrl, setAuthenticatedUrl] = useState<string | null>(null);
    const [cookiesCleared, setCookiesCleared] = useState(false);

    useEffect(() => {
        getShortLivedAuthTokenURL(setupLink).then(setAuthenticatedUrl);
    }, [setupLink]);

    const renderLoading = () => (
        <View style={[StyleSheet.absoluteFill, styles.fullScreenLoading]}>
            <ActivityIndicator
                size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                reasonAttributes={{context: 'ConnectToHRFlow'}}
            />
        </View>
    );

    const handleOpenWindow = (event: WebViewOpenWindowEvent) => {
        setPopupUrl(event.nativeEvent.targetUrl);
        setIsPopupVisible(true);
    };

    const handleBackPress = () => {
        if (isPopupVisible) {
            // Keep the popup WebView mounted (hidden) so in-flight OAuth redirects
            // can complete and shared cookies remain intact for Merge Link.
            setIsPopupVisible(false);
            return;
        }
        setIsWebViewOpen(false);
    };

    const isReady = cookiesCleared && !!authenticatedUrl;

    return (
        <Modal
            onClose={() => setIsWebViewOpen(false)}
            fullscreen
            isVisible={isWebViewOpen}
            type={CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE}
        >
            <HeaderWithBackButton
                title={translate('workspace.common.hr')}
                onBackButtonPress={handleBackPress}
                shouldDisplayHelpButton={false}
            />
            <FullPageOfflineBlockingView>
                <View style={styles.flex1}>
                    {!cookiesCleared && (
                        <WebView
                            source={{uri: 'about:blank'}}
                            incognito
                            onLoadEnd={() => {
                                // Brief delay to ensure the incognito WebView has fully cleared cookies
                                // before mounting the main WebView. No deterministic completion signal is
                                // available from the incognito session teardown.
                                setTimeout(() => setCookiesCleared(true), CONST.MERGE_HR.COOKIE_CLEAR_DELAY_MS);
                            }}
                            style={styles.opacity0}
                        />
                    )}
                    {!isReady && renderLoading()}
                    {isReady && (
                        // Not using incognito here so the popup WebView can share cookies
                        // with the main flow (required for OAuth handoffs).
                        <WebView
                            source={{uri: authenticatedUrl}}
                            onOpenWindow={handleOpenWindow}
                            startInLoadingState
                            renderLoading={renderLoading}
                        />
                    )}
                    {!!popupUrl && (
                        <View
                            style={[StyleSheet.absoluteFill, !isPopupVisible && styles.opacity0]}
                            pointerEvents={isPopupVisible ? 'auto' : 'none'}
                        >
                            <WebView
                                source={{uri: popupUrl}}
                                onOpenWindow={handleOpenWindow}
                                startInLoadingState
                                renderLoading={renderLoading}
                            />
                        </View>
                    )}
                </View>
            </FullPageOfflineBlockingView>
        </Modal>
    );
}

export default ConnectToHRFlow;
