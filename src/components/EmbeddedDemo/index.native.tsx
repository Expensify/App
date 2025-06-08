import React from 'react';
import WebView from 'react-native-webview';
import useThemeStyles from '@hooks/useThemeStyles';
import getOnboardingMessages from '@libs/actions/Welcome/OnboardingFlowTasks';
import CONST from '@src/CONST';
import type EmbeddedDemoProps from './types';

function EmbeddedDemo({url, webViewProps}: EmbeddedDemoProps) {
    const styles = useThemeStyles();
    const {testDrive} = getOnboardingMessages();

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

EmbeddedDemo.displayName = 'EmbeddedDemo';

export default EmbeddedDemo;
