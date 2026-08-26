import type ChildrenProps from '@src/types/utils/ChildrenProps';

import React from 'react';

import BaseHTMLEngineProvider from './BaseHTMLEngineProvider';

function HTMLEngineProvider({children}: ChildrenProps) {
    return <BaseHTMLEngineProvider enableExperimentalBRCollapsing>{children}</BaseHTMLEngineProvider>;
}

export default HTMLEngineProvider;
