import React, {ForwardedRef} from 'react';
import {View} from 'react-native';
import GenericPressable from './GenericPressable';
import PressableProps from './GenericPressable/types';

function PressableWithoutFeedback(
    {pressStyle, hoverStyle, focusStyle, disabledStyle, screenReaderActiveStyle, shouldUseHapticsOnPress, shouldUseHapticsOnLongPress, ...rest}: PressableProps,
    ref: ForwardedRef<View>,
) {
    return (
        <GenericPressable
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
            ref={ref}
        />
    );
}

PressableWithoutFeedback.displayName = 'PressableWithoutFeedback';

export default React.forwardRef(PressableWithoutFeedback);
