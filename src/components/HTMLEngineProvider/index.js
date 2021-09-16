import React from 'react';
import BaseHTMLEngineProvider from './BaseHTMLEngineProvider';
import {defaultProps, propTypes} from './htmlEnginePropTypes';
import withWindowDimensions from '../withWindowDimensions';
import canUseTouchScreen from '../../libs/canUseTouchscreen';

const HTMLEngineProvider = ({isSmallScreenWidth, debug, children}) => (
    <BaseHTMLEngineProvider
        debug={debug}
        textSelectable={!canUseTouchScreen() || !isSmallScreenWidth}
    >
        {children}
    </BaseHTMLEngineProvider>
);

HTMLEngineProvider.displayName = 'HTMLEngineProvider';
HTMLEngineProvider.propTypes = propTypes;
HTMLEngineProvider.defaultProps = defaultProps;

export default withWindowDimensions(HTMLEngineProvider);
