import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

import type EmbeddedDemoProps from './types';

function EmbeddedDemo({url, iframeTitle, iframeProps}: EmbeddedDemoProps) {
    const styles = useThemeStyles();

    return (
        <iframe
            title={iframeTitle}
            src={url}
            style={styles.embeddedDemoIframe}
            {...iframeProps}
        />
    );
}

export default EmbeddedDemo;
