import type PressHandlerProps from './types';

/**
 * This is a workaround for a known issue on certain Samsung Android devices
 * So, we use `onPressIn` for Android to ensure the button is pressable.
 * This will be removed once the issue https://github.com/Expensify/App/issues/59953 is resolved.
 */
function createPressHandler(onPress?: () => void): PressHandlerProps {
    return {
        onPressIn: onPress,
    };
}

export default createPressHandler;
