import React from 'react';
import Overlay from '@libs/Navigation/AppNavigator/Navigators/Overlay';
import type CenteredModalLayoutOverlayProps from './types';

/** On web the navigation `Overlay` is used as the backdrop. */
function CenteredModalLayoutOverlay({onBackdropPress}: CenteredModalLayoutOverlayProps) {
    return <Overlay onPress={onBackdropPress} />;
}

export default CenteredModalLayoutOverlay;
