import React from 'react';
import * as anchorForAttachmentsOnlyPropTypes from './anchorForAttachmentsOnlyPropTypes';
import BaseAnchorForAttachmentsOnly from './BaseAnchorForAttachmentsOnly';
import canUseTouchScreen from '../../libs/canUseTouchscreen';
import ControlSelection from '../../libs/ControlSelection';

const AnchorForAttachmentsOnly = props => (
    <BaseAnchorForAttachmentsOnly
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        onPressIn={() => canUseTouchScreen() && ControlSelection.block()}
        onPressOut={() => ControlSelection.unblock()}
    />
);

AnchorForAttachmentsOnly.propTypes = anchorForAttachmentsOnlyPropTypes.propTypes;
AnchorForAttachmentsOnly.defaultProps = anchorForAttachmentsOnlyPropTypes.defaultProps;
AnchorForAttachmentsOnly.displayName = 'AnchorForAttachmentsOnly';

export default AnchorForAttachmentsOnly;
