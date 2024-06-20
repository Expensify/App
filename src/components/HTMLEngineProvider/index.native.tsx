import React from 'react';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import BaseHTMLEngineProvider from './BaseHTMLEngineProvider';

function HTMLEngineProvider({children}: ChildrenProps) {
    return <BaseHTMLEngineProvider enableExperimentalBRCollapsing>{children}</BaseHTMLEngineProvider>;
}

HTMLEngineProvider.displayName = 'HTMLEngineProvider';

export default HTMLEngineProvider;
