import React from 'react';
import _ from 'underscore';
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
        onPressIn={() => props.isSmallScreenWidth && canUseTouchScreen() && ControlSelection.block()}
        onPressOut={() => ControlSelection.unblock()}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...(_.omit(props, ['onPressIn', 'onPressOut']))}
    />
);

AnchorForCommentsOnly.propTypes = propTypes;
AnchorForCommentsOnly.defaultProps = defaultProps;
AnchorForCommentsOnly.displayName = 'AnchorForCommentsOnly';

export default withWindowDimensions(AnchorForCommentsOnly);
