import React from 'react';
import BaseHTMLEngineProvider from './BaseHTMLEngineProvider';
import type {HTMLEngineProviderProps} from './types';

function HTMLEngineProvider({children}: HTMLEngineProviderProps) {
    return <BaseHTMLEngineProvider enableExperimentalBRCollapsing>{children}</BaseHTMLEngineProvider>;
}

HTMLEngineProvider.displayName = 'HTMLEngineProvider';

export default HTMLEngineProvider;
