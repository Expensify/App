import React from 'react';
import BaseHTMLEngineProvider from './BaseHTMLEngineProvider';
import {HTMLEngineProviderProps} from './types';

function HTMLEngineProvider({debug = false, children}: HTMLEngineProviderProps) {
    return (
        <BaseHTMLEngineProvider
            debug={debug}
            enableExperimentalBRCollapsing
        >
            {children}
        </BaseHTMLEngineProvider>
    );
}

HTMLEngineProvider.displayName = 'HTMLEngineProvider';

export default HTMLEngineProvider;
