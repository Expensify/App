import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {HapticFeedbackError, HapticFeedbackLongPress, HapticFeedbackPress, HapticFeedbackSuccess} from './types';

const press: HapticFeedbackPress = () => {
    ReactNativeHapticFeedback.trigger('impactLight', {
        enableVibrateFallback: true,
    });
};

const longPress: HapticFeedbackLongPress = () => {
    ReactNativeHapticFeedback.trigger('impactHeavy', {
        enableVibrateFallback: true,
    });
};

const success: HapticFeedbackSuccess = () => {
    ReactNativeHapticFeedback.trigger('notificationSuccess', {
        enableVibrateFallback: true,
    });
};

const error: HapticFeedbackError = () => {
    ReactNativeHapticFeedback.trigger('notificationError', {
        enableVibrateFallback: true,
    });
};

export default {
    press,
    longPress,
    success,
    error,
};
