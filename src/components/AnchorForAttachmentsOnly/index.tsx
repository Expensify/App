import React from 'react';
import ControlSelection from '@libs/ControlSelection';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import BaseAnchorForAttachmentsOnly from './BaseAnchorForAttachmentsOnly';
import AnchorForAttachmentsOnlyProps from './AnchorForAttachmentsOnlyTypes';

function AnchorForAttachmentsOnly({source, displayName, style}: AnchorForAttachmentsOnlyProps) {
    return (
        <BaseAnchorForAttachmentsOnly
            source={source}
            displayName={displayName}
            style={style}
            onPressIn={() => DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
            onPressOut={() => ControlSelection.unblock()}
        />
    );
}

AnchorForAttachmentsOnly.displayName = 'AnchorForAttachmentsOnly';

export default AnchorForAttachmentsOnly;
