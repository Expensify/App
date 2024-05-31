import React from 'react';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import BaseHTMLEngineProvider from './BaseHTMLEngineProvider';

function HTMLEngineProvider({children}: ChildrenProps) {
    const {isSmallScreenWidth} = useWindowDimensions();

    return <BaseHTMLEngineProvider textSelectable={!DeviceCapabilities.canUseTouchScreen() || !isSmallScreenWidth}>{children}</BaseHTMLEngineProvider>;
}

HTMLEngineProvider.displayName = 'HTMLEngineProvider';

export default HTMLEngineProvider;
