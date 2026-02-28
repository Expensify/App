import React from 'react';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import BaseHTMLEngineProvider from './BaseHTMLEngineProvider';

function HTMLEngineProvider({children}: ChildrenProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return <BaseHTMLEngineProvider textSelectable={!DeviceCapabilities.canUseTouchScreen() || !shouldUseNarrowLayout}>{children}</BaseHTMLEngineProvider>;
}

export default HTMLEngineProvider;
