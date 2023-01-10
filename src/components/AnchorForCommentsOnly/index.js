import React from 'react';
import * as anchorForCommentsOnlyPropTypes from './anchorForCommentsOnlyPropTypes';
import BaseAnchorForCommentsOnly from './BaseAnchorForCommentsOnly';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';
import ControlSelection from '../../libs/ControlSelection';

const AnchorForCommentsOnly = props => (
    <BaseAnchorForCommentsOnly
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        onPressIn={() => DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
        onPressOut={() => ControlSelection.unblock()}
    />
);

AnchorForCommentsOnly.propTypes = anchorForCommentsOnlyPropTypes.propTypes;
AnchorForCommentsOnly.defaultProps = anchorForCommentsOnlyPropTypes.defaultProps;
AnchorForCommentsOnly.displayName = 'AnchorForCommentsOnly';

export default AnchorForCommentsOnly;
