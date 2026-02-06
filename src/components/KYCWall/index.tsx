import React from 'react';
import BaseKYCWall from './BaseKYCWall';
import type {KYCWallProps} from './types';

function KYCWall({ref, ...props}: KYCWallProps) {
    return (
        <BaseKYCWall
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            shouldListenForResize
            ref={ref}
        />
    );
}

export default KYCWall;
