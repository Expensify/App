import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {StyleSheet, View} from 'react-native';

import type {ParticipantPickerProps} from './types';

import BaseParticipantPicker from './BaseParticipantPicker';

/**
 * On iOS, presenting this picker as a native <Modal> while it is embedded inside the create-expense RHP (itself a modal
 * presentation) deadlocks the main thread - opening the picker and then interacting with the confirmation freezes the
 * whole app (#96609 / #96550). So iOS uses a plain absolute-fill overlay that is only mounted while visible instead.
 */
function ParticipantPicker(props: ParticipantPickerProps) {
    const styles = useThemeStyles();
    const {isVisible = true, onClose} = props;

    if (!onClose) {
        return <BaseParticipantPicker {...props} />;
    }

    if (!isVisible) {
        return null;
    }

    return (
        <View style={[StyleSheet.absoluteFill, styles.appBG, styles.zIndex10]}>
            <BaseParticipantPicker {...props} />
        </View>
    );
}

ParticipantPicker.displayName = 'ParticipantPicker';

export default ParticipantPicker;
