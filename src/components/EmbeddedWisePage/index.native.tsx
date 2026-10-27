import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {ShouldStartLoadRequest, WebViewMessageEvent, WebViewOpenWindowEvent} from 'react-native-webview/lib/WebViewTypes';

import React from 'react';
import {Linking} from 'react-native';
import {WebView} from 'react-native-webview';

import type {EmbeddedWisePageProps} from './types';

import {handleWiseFlowMessage, handleWiseRedirect} from './wiseFlowMessages';

// Wise's page posts to window.parent, which in a top-level WebView is the page itself. Messages from frames inside it are dropped.
const FORWARD_WISE_MESSAGES_SCRIPT = `
    window.addEventListener('message', function (event) {
        if (event.source !== window) {
            return;
        }
        window.ReactNativeWebView.postMessage(JSON.stringify(event.data));
    });
    true;
`;

function isWiseURL(url: string): boolean {
    return CONST.WISE_EMBEDDED_FLOW.ORIGINS.some((origin) => url === origin || url.startsWith(`${origin}/`));
}

function EmbeddedWisePage({url, title, onReady, onDone, onCancel, onError}: EmbeddedWisePageProps) {
    const styles = useThemeStyles();
    const callbacks = {onReady, onDone, onCancel, onError};

    const handleMessage = (event: WebViewMessageEvent) => {
        handleWiseFlowMessage(event.nativeEvent.data, callbacks);
    };

    const handleShouldStartLoad = (request: ShouldStartLoadRequest) => {
        if (handleWiseRedirect(request.url, callbacks)) {
            return false;
        }

        // Frames inside Wise's page, such as an ID check provider, load where they need to
        if (request.isTopFrame === false || isWiseURL(request.url)) {
            return true;
        }
        Linking.openURL(request.url);
        return false;
    };

    // Links that open a new window, such as Wise's terms, open in the system browser
    const handleOpenWindow = (event: WebViewOpenWindowEvent) => {
        Linking.openURL(event.nativeEvent.targetUrl);
    };

    return (
        <WebView
            source={{uri: url}}
            accessibilityLabel={title}
            style={styles.flex1}
            originWhitelist={['https://*']}
            injectedJavaScriptBeforeContentLoaded={FORWARD_WISE_MESSAGES_SCRIPT}
            onMessage={handleMessage}
            onShouldStartLoadWithRequest={handleShouldStartLoad}
            onOpenWindow={handleOpenWindow}
            // Keeps nothing from Wise's page on the device once it closes, since a phone can be shared
            incognito
            // The ID and liveness checks show the camera inline and ask for it without a second WebKit prompt
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            mediaCapturePermissionGrantType="grant"
        />
    );
}

export default EmbeddedWisePage;
