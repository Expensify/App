import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

function press() {
    ReactNativeHapticFeedback.trigger('impactLight', {
        enableVibrateFallback: true,
    });
}

function longPress() {
    ReactNativeHapticFeedback.trigger('impactHeavy', {
        enableVibrateFallback: true,
    });
}

function success() {
    ReactNativeHapticFeedback.trigger('notificationSuccess', {
        enableVibrateFallback: true,
    });
}

function error() {
    ReactNativeHapticFeedback.trigger('notificationError', {
        enableVibrateFallback: true,
    });
}

export default {
    press,
    longPress,
    success,
    error,
};
