import React from 'react';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import BaseHTMLEngineProvider from './BaseHTMLEngineProvider';
import {HTMLEngineProviderProps} from './types';

function HTMLEngineProvider({debug = false, children = null}: HTMLEngineProviderProps) {
    const {isSmallScreenWidth} = useWindowDimensions();

    return (
        <BaseHTMLEngineProvider
            debug={debug}
            textSelectable={!DeviceCapabilities.canUseTouchScreen() || isSmallScreenWidth}
        >
            {children}
        </BaseHTMLEngineProvider>
    );
}

HTMLEngineProvider.displayName = 'HTMLEngineProvider';

export default HTMLEngineProvider;
