import React from 'react';
import {propTypes as anchorForCommentsOnlyPropTypes, defaultProps} from './anchorForCommentsOnlyPropTypes';
import BaseAnchorForCommentsOnly from './BaseAnchorForCommentsOnly';
import canUseTouchScreen from '../../libs/canUseTouchscreen';
import ControlSelection from '../../libs/ControlSelection';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';

const propTypes = {
    ...anchorForCommentsOnlyPropTypes,
    ...windowDimensionsPropTypes,
};

const AnchorForCommentsOnly = props => (
    <BaseAnchorForCommentsOnly
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        onPressIn={() => props.isSmallScreenWidth && canUseTouchScreen() && ControlSelection.block()}
        onPressOut={() => ControlSelection.unblock()}
    />
);

AnchorForCommentsOnly.propTypes = propTypes;
AnchorForCommentsOnly.defaultProps = defaultProps;
AnchorForCommentsOnly.displayName = 'AnchorForCommentsOnly';

export default withWindowDimensions(AnchorForCommentsOnly);
