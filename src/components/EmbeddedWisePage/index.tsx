import useThemeStyles from '@hooks/useThemeStyles';

import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';

import type {EmbeddedWisePageProps} from './types';

import {handleWiseFlowMessage} from './wiseFlowMessages';

function EmbeddedWisePage({url, title, onReady, onDone, onCancel, onError}: EmbeddedWisePageProps) {
    const styles = useThemeStyles();
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        const handleMessage = (event: MessageEvent<unknown>) => {
            // Any window can post to ours, so only Wise's frame is trusted
            if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) {
                return;
            }
            handleWiseFlowMessage(event.data, {onReady, onDone, onCancel, onError});
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [onReady, onDone, onCancel, onError]);

    return (
        <View style={styles.flex1}>
            <iframe
                ref={iframeRef}
                src={url}
                title={title}
                height="100%"
                width="100%"
                // Wise's required attributes; camera and microphone are for the ID and liveness checks
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                allow="camera; microphone;"
                style={{border: 'none'}}
            />
        </View>
    );
}

export default EmbeddedWisePage;
