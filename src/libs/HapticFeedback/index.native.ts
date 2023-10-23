import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import HapticFeedback from './types';

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
};

export default hapticFeedback;
