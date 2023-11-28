import React from 'react';
import withWindowDimensions from '@components/withWindowDimensions';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import BaseHTMLEngineProvider from './BaseHTMLEngineProvider';
import {defaultProps, propTypes} from './htmlEnginePropTypes';

function HTMLEngineProvider(props) {
    return (
        <BaseHTMLEngineProvider
            debug={props.debug}
            textSelectable={!DeviceCapabilities.canUseTouchScreen() || !props.isSmallScreenWidth}
        >
            {props.children}
        </BaseHTMLEngineProvider>
    );
}

HTMLEngineProvider.displayName = 'HTMLEngineProvider';
HTMLEngineProvider.propTypes = propTypes;
HTMLEngineProvider.defaultProps = defaultProps;

export default withWindowDimensions(HTMLEngineProvider);
