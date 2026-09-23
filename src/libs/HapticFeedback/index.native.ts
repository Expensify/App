import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {Presets} from 'react-native-pulsar';

import type HapticFeedback from './types';

const hapticFeedback: HapticFeedback = {
    press: () => {
        ReactNativeHapticFeedback.trigger('impactLight', {
            enableVibrateFallback: true,
        });
    },
    longPress: () => {
        ReactNativeHapticFeedback.trigger('impactHeavy', {
            enableVibrateFallback: true,
        });
    },
    success: () => {
        ReactNativeHapticFeedback.trigger('notificationSuccess', {
            enableVibrateFallback: true,
        });
    },
    error: () => {
        ReactNativeHapticFeedback.trigger('notificationError', {
            enableVibrateFallback: true,
        });
    },
    selection: () => {
        Presets.System.selection();
    },
    expenseSuccess: () => {
        Presets.herald();
    },
    expenseCreateError: () => {
        Presets.batter();
    },
    loading: () => {
        Presets.wave();
    },
    expenseSubmitSuccess: () => {
        Presets.chime();
    },
};

export default hapticFeedback;
