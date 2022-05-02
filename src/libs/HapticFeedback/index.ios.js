
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

function trigger() {
    ReactNativeHapticFeedback.trigger('selection', {
        enableVibrateFallback: true,
    });
}

export default {
    trigger,
};
