import React, {useEffect, useRef, useState} from 'react';
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
    const webViewRef = useRef<WebView>(null);
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
                                setTimeout(() => setCookiesCleared(true), 500);
                            }}
                            style={styles.opacity0}
                        />
                    )}
                    {!isReady && renderLoading()}
                    {isReady && (
                        <WebView
                            ref={webViewRef}
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
