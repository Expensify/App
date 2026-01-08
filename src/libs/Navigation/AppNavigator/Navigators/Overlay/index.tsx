import React from 'react';
import type {BaseOverlayProps} from './BaseOverlay';
import BaseOverlay from './BaseOverlay';

function Overlay({...rest}: Omit<BaseOverlayProps, 'shouldUseNativeStyles'>) {
    return (
        <BaseOverlay
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        />
    );
}

export default Overlay;
