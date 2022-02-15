import React from 'react';
import {propTypes, defaultProps} from './kycWallPropTypes';
import BaseKYCWall from './BaseKYCWall';

const KYCWall = props => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <BaseKYCWall {...props} shouldListenForResize />
);

KYCWall.propTypes = propTypes;
KYCWall.defaultProps = defaultProps;
KYCWall.displayName = 'KYCWall';

export default KYCWall;
