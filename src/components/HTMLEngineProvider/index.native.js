import React from 'react';
import BaseHTMLEngineProvider from './BaseHTMLEngineProvider';
import {propTypes, defaultProps} from './htmlEnginePropTypes';

const HTMLEngineProvider = ({debug, children}) => (
    <BaseHTMLEngineProvider debug={debug}>
        {children}
    </BaseHTMLEngineProvider>
);

HTMLEngineProvider.displayName = 'HTMLEngineProvider';
HTMLEngineProvider.propTypes = propTypes;
HTMLEngineProvider.defaultProps = defaultProps;

export default HTMLEngineProvider;
