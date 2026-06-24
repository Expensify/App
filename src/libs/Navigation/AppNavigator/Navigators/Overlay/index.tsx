import React from 'react';
import type {BaseOverlayProps} from './BaseOverlay';
import BaseOverlay from './BaseOverlay';

function Overlay({...rest}: Omit<BaseOverlayProps, 'shouldUseNativeStyles'>) {
    return <BaseOverlay {...rest} />;
}

export default Overlay;
