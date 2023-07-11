import React from 'react';
import {propTypes, defaultProps} from './kycWallPropTypes';
import BaseKYCWall from './BaseKYCWall';

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
