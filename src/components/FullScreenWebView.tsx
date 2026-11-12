import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type {WebViewProps} from 'react-native-webview';

import React, {useRef} from 'react';
import {StyleSheet, View} from 'react-native';
import {WebView} from 'react-native-webview';

import FullPageErrorView from './BlockingViews/FullPageErrorView';
import FullScreenLoadingIndicator from './FullscreenLoadingIndicator';

type FullScreenWebViewProps = Omit<WebViewProps, 'startInLoadingState' | 'renderLoading' | 'renderError'> & {
    /** Leaves the screen from the loading and error views */
    onGoBack: () => void;
};

/**
 * A WebView that fills the screen without our header, for pages that bring their own way out.
 * Until the page loads there is no such way out, so the loading and error views offer one.
 */
function FullScreenWebView({onGoBack, ...webViewProps}: FullScreenWebViewProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const webViewRef = useRef<WebView>(null);

    return (
        <WebView
            {...webViewProps}
            ref={webViewRef}
            startInLoadingState
            renderLoading={() => (
                <FullScreenLoadingIndicator
                    shouldUseGoBackButton
                    onGoBack={onGoBack}
                />
            )}
            // The WebView renders the error view next to the failed page, so the view covers it
            renderError={() => (
                <View style={[StyleSheet.absoluteFill, styles.appBG]}>
                    <FullPageErrorView
                        shouldShow
                        title={translate('errorPage.title', {isBreakLine: false})}
                        subtitle={translate('errorPage.subtitle')}
                        buttonTranslationKey="common.tryAgain"
                        onButtonPress={() => webViewRef.current?.reload()}
                        linkTranslationKey="common.goBack"
                        onLinkPress={onGoBack}
                    />
                </View>
            )}
        />
    );
}

export default FullScreenWebView;
