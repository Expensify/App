import React from 'react';
import GenericPressable from './GenericPressable';
import type PressableProps from './GenericPressable/types';

function PressableWithoutFeedback({pressStyle, focusStyle, screenReaderActiveStyle, shouldUseHapticsOnPress, shouldUseHapticsOnLongPress = false, ref, ...rest}: PressableProps) {
    return (
        <GenericPressable
            {...rest}
            ref={ref}
            shouldUseHapticsOnLongPress={shouldUseHapticsOnLongPress}
        />
    );
}

export default PressableWithoutFeedback;
