import React from 'react';
import BaseKYCWall from './BaseKYCWall';
import type {KYCWallProps} from './types';

function KYCWall(props: KYCWallProps) {
    return (
        <BaseKYCWall
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            shouldListenForResize
        />
    );
}

KYCWall.displayName = 'KYCWall';

export default KYCWall;
