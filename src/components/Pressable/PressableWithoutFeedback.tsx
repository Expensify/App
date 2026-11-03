import React from 'react';

import type PressableProps from './GenericPressable/types';

import GenericPressable from './GenericPressable';

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
