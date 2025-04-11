import React from 'react';
import type EmbeddedDemoProps from './types';

function EmbeddedDemo({url, iframeTitle, iframeProps}: EmbeddedDemoProps) {
    return (
        <iframe
            title={iframeTitle}
            src={url}
            style={{height: '100%', width: '100%', border: 'none'}}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...iframeProps}
        />
    );
}

EmbeddedDemo.displayName = 'EmbeddedDemo';

export default EmbeddedDemo;
