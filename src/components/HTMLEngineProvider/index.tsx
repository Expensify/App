import React from 'react';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import BaseHTMLEngineProvider from './BaseHTMLEngineProvider';
import type {HTMLEngineProviderProps} from './types';

function HTMLEngineProvider({children = null}: HTMLEngineProviderProps) {
    const {isSmallScreenWidth} = useWindowDimensions();

    return (
        <BaseHTMLEngineProvider
            textSelectable={!DeviceCapabilities.canUseTouchScreen() || !isSmallScreenWidth}
        >
            {children}
        </BaseHTMLEngineProvider>
    );
}

HTMLEngineProvider.displayName = 'HTMLEngineProvider';

export default HTMLEngineProvider;
