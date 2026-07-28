import ControlSelection from '@libs/ControlSelection';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';

import React from 'react';

import type AnchorForAttachmentsOnlyProps from './types';

import BaseAnchorForAttachmentsOnly from './BaseAnchorForAttachmentsOnly';

function AnchorForAttachmentsOnly(props: AnchorForAttachmentsOnlyProps) {
    return (
        <BaseAnchorForAttachmentsOnly
            {...props}
            onPressIn={() => DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
            onPressOut={() => ControlSelection.unblock()}
        />
    );
}

export default AnchorForAttachmentsOnly;
