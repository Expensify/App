import React from 'react';
import WebView from 'react-native-webview';
import type EmbeddedDemoProps from './types';

function EmbeddedDemo({url, webViewProps}: EmbeddedDemoProps) {
    return (
        <WebView
            source={{
                uri: url,
            }}
            originWhitelist={['http://', 'https://', 'about:']}
            style={{
                flex: 1,
            }}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...webViewProps}
        />
    );
}

EmbeddedDemo.displayName = 'EmbeddedDemo';

export default EmbeddedDemo;
