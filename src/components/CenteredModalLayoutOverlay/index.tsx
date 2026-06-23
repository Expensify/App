import React from 'react';
import Overlay from '@libs/Navigation/AppNavigator/Navigators/Overlay';
import type CenteredModalLayoutOverlayProps from './types';

/**
 * On web the navigation `Overlay` is used as the backdrop: it provides the dimmed,
 * animated layer tied to the card transition (it relies on `position: fixed`, which only
 * works on web) and handles closing the modal when the area outside the card is pressed.
 */
function CenteredModalLayoutOverlay({onBackdropPress}: CenteredModalLayoutOverlayProps) {
    return <Overlay onPress={onBackdropPress} />;
}

export default CenteredModalLayoutOverlay;
