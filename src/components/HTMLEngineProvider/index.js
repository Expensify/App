import React from 'react';
import BaseHTMLEngineProvider from './BaseHTMLEngineProvider';
import {defaultProps, propTypes} from './htmlEnginePropTypes';
import withWindowDimensions from '../withWindowDimensions';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';

const HTMLEngineProvider = props => (
    <BaseHTMLEngineProvider
        debug={props.debug}
        textSelectable={!DeviceCapabilities.canUseTouchScreen() || !props.isSmallScreenWidth}
    >
        {props.children}
    </BaseHTMLEngineProvider>
);

HTMLEngineProvider.displayName = 'HTMLEngineProvider';
HTMLEngineProvider.propTypes = propTypes;
HTMLEngineProvider.defaultProps = defaultProps;

export default withWindowDimensions(HTMLEngineProvider);
