import React from 'react';
import BaseKYCWall from './BaseKYCWall';
import {defaultProps, propTypes} from './kycWallPropTypes';

function KYCWall(props) {
    return (
        <BaseKYCWall
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            shouldListenForResize
        />
    );
}

KYCWall.propTypes = propTypes;
KYCWall.defaultProps = defaultProps;
KYCWall.displayName = 'KYCWall';

export default KYCWall;
