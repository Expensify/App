import useThemeStyles from '@hooks/useThemeStyles';

import {Portal} from '@gorhom/portal';
import React from 'react';
import {StyleSheet, View} from 'react-native';

import type {ParticipantPickerProps} from './types';

import BaseParticipantPicker from './BaseParticipantPicker';
import {useParticipantPickerOverlayHostName} from './OverlayHost';

/**
 * On iOS, presenting this picker as a native <Modal> while it is embedded inside the create-expense RHP (itself a modal
 * presentation) deadlocks the main thread - opening the picker and then interacting with the confirmation freezes the
 * whole app (#96609 / #96550). So iOS uses a plain absolute-fill overlay that is only mounted while visible instead.
 *
 * An overlay covers the view it is declared in, which is the confirmation form alone on a page that draws a header
 * and a tab bar above it. Such a page renders a `ParticipantPickerOverlayHost` below its chrome, and the overlay
 * goes there so it reads as its own page rather than as a panel pushed in under the chrome.
 */
function ParticipantPicker(props: ParticipantPickerProps) {
    const styles = useThemeStyles();
    const overlayHostName = useParticipantPickerOverlayHostName();
    const {isVisible = true, onClose} = props;

    if (!onClose) {
        return <BaseParticipantPicker {...props} />;
    }

    if (!isVisible) {
        return null;
    }

    const overlay = (
        <View style={[StyleSheet.absoluteFill, styles.appBG, styles.zIndex10]}>
            <BaseParticipantPicker {...props} />
        </View>
    );

    // Without a host the overlay stays put, which already fills the screen on the confirmation's own route.
    if (!overlayHostName) {
        return overlay;
    }

    return <Portal hostName={overlayHostName}>{overlay}</Portal>;
}

ParticipantPicker.displayName = 'ParticipantPicker';

export default ParticipantPicker;
