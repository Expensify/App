import variables from '@styles/variables';

import React from 'react';

import type {BaseOverlayProps} from './BaseOverlay';

import Overlay from '.';

type RHPOverlayProps = Omit<BaseOverlayProps, 'maxOpacity'>;

/** Overlay for the RHP stack. Its scrim is lighter than the one the other modal backdrops use. */
function RHPOverlay({...rest}: RHPOverlayProps) {
    return (
        <Overlay
            {...rest}
            maxOpacity={variables.rhpOverlayOpacity}
        />
    );
}

export default RHPOverlay;
