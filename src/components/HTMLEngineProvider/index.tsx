import React from 'react';
import withWindowDimensions from '@components/withWindowDimensions';
import {WindowDimensionsProps} from '@components/withWindowDimensions/types';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import BaseHTMLEngineProvider from './BaseHTMLEngineProvider';
import HTMLEngineProviderProps from './types';

type HTMLEngineProviderWithWindowDimensionsProps = HTMLEngineProviderProps & WindowDimensionsProps;

function HTMLEngineProvider({debug = false, children = null, isSmallScreenWidth}: HTMLEngineProviderWithWindowDimensionsProps) {
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

export default withWindowDimensions(HTMLEngineProvider);
