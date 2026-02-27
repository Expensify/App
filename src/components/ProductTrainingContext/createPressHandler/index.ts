import type PressHandlerProps from './types';

function createPressHandler(onPress?: () => void): PressHandlerProps {
    return {
        onPress,
    };
}

export default createPressHandler;
