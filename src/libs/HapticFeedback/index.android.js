import {Platform} from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

function trigger() {
    // The constant effectHeavyClick is added in API level 29.
    // Docs: https://developer.android.com/reference/android/os/VibrationEffect#EFFECT_HEAVY_CLICK
    // We use keyboardTap added in API level 8 as a fallback.
    // Docs: https://developer.android.com/reference/android/view/HapticFeedbackConstants#KEYBOARD_TAP
    if (Platform.Version >= 29) {
        ReactNativeHapticFeedback.trigger('effectHeavyClick');
        return;
    }
    ReactNativeHapticFeedback.trigger('keyboardTap');
}

export default {
    trigger,
};
