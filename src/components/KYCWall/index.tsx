import React from 'react';

import type {KYCWallProps} from './types';

import BaseKYCWall from './BaseKYCWall';

function KYCWall({ref, ...props}: KYCWallProps) {
    return (
        <BaseKYCWall
            {...props}
            shouldListenForResize
            ref={ref}
        />
    );
}

export default KYCWall;
