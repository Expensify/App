import React from 'react';
import BaseHTMLEngineProvider from './BaseHTMLEngineProvider';
import {propTypes, defaultProps} from './htmlEnginePropTypes';

const HTMLEngineProvider = props => (
    <BaseHTMLEngineProvider debug={props.debug} enableExperimentalBRCollapsing>
        {props.children}
    </BaseHTMLEngineProvider>
);

HTMLEngineProvider.displayName = 'HTMLEngineProvider';
HTMLEngineProvider.propTypes = propTypes;
HTMLEngineProvider.defaultProps = defaultProps;

export default HTMLEngineProvider;
