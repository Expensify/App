import React from 'react';
import BaseKYCWall from './BaseKYCWall';
import type {KYCWallProps} from './types';

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
