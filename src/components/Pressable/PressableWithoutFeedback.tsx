import React from 'react';
import GenericPressable from './GenericPressable';
import type PressableProps from './GenericPressable/types';

function PressableWithoutFeedback(
    {pressStyle, focusStyle, screenReaderActiveStyle, shouldUseHapticsOnPress, shouldUseHapticsOnLongPress = false, ref, ...rest}: PressableProps,
) {
    return (
        <GenericPressable
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
            ref={ref}
            shouldUseHapticsOnLongPress={shouldUseHapticsOnLongPress}
        />
    );
}

PressableWithoutFeedback.displayName = 'PressableWithoutFeedback';

export default PressableWithoutFeedback;
