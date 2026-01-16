import React from 'react';
import ControlSelection from '@libs/ControlSelection';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import BaseAnchorForAttachmentsOnly from './BaseAnchorForAttachmentsOnly';
import type AnchorForAttachmentsOnlyProps from './types';

function AnchorForAttachmentsOnly(props: AnchorForAttachmentsOnlyProps) {
    return (
        <BaseAnchorForAttachmentsOnly
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            onPressIn={() => DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
            onPressOut={() => ControlSelection.unblock()}
        />
    );
}

export default AnchorForAttachmentsOnly;
