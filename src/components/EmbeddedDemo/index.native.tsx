import React from 'react';
import WebView from 'react-native-webview';
import useOnboardingMessages from '@hooks/useOnboardingMessages';
import useThemeStyles from '@hooks/useThemeStyles';
import type EmbeddedDemoProps from './types';

function EmbeddedDemo({url, webViewProps}: EmbeddedDemoProps) {
    const styles = useThemeStyles();
    const {testDrive} = useOnboardingMessages();

    return (
        <WebView
            source={{uri: url}}
            originWhitelist={testDrive.EMBEDDED_DEMO_WHITELIST}
            style={styles.flex1}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...webViewProps}
        />
    );
}

export default EmbeddedDemo;
