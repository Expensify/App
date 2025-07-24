import type {ForwardedRef} from 'react';
import React, {forwardRef} from 'react';
import BaseKYCWall from './BaseKYCWall';
import type {KYCWallProps, KYCWallRef} from './types';

function KYCWall(props: KYCWallProps, ref: ForwardedRef<KYCWallRef>) {
    return (
        <BaseKYCWall
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            shouldListenForResize
            ref={ref}
        />
    );
}

KYCWall.displayName = 'KYCWall';

export default forwardRef(KYCWall);
