import React from 'react';
import ControlSelection from '@libs/ControlSelection';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import BaseAnchorForCommentsOnly from './BaseAnchorForCommentsOnly';
import type {AnchorForCommentsOnlyProps} from './types';

function AnchorForCommentsOnly(props: AnchorForCommentsOnlyProps) {
    return (
        <BaseAnchorForCommentsOnly
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            onPressIn={() => DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
            onPressOut={() => ControlSelection.unblock()}
        />
    );
}

export default AnchorForCommentsOnly;
