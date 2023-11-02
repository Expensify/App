import React from 'react';
import ControlSelection from '@libs/ControlSelection';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as anchorForCommentsOnlyPropTypes from './anchorForCommentsOnlyPropTypes';
import BaseAnchorForCommentsOnly from './BaseAnchorForCommentsOnly';

function AnchorForCommentsOnly(props) {
    return (
        <BaseAnchorForCommentsOnly
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            onPressIn={() => DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
            onPressOut={() => ControlSelection.unblock()}
        />
    );
}

AnchorForCommentsOnly.propTypes = anchorForCommentsOnlyPropTypes.propTypes;
AnchorForCommentsOnly.defaultProps = anchorForCommentsOnlyPropTypes.defaultProps;
AnchorForCommentsOnly.displayName = 'AnchorForCommentsOnly';

export default AnchorForCommentsOnly;
