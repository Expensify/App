import React, {ForwardedRef, forwardRef} from 'react';
import {GestureResponderEvent, Text as RNText, TextProps, View} from 'react-native';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import PressableWithSecondaryInteractionProps, {PressableWithSecondaryInteractionRef} from './types';

/** This is a special Pressable that calls onSecondaryInteraction when LongPressed. */
function PressableWithSecondaryInteraction(
    {children, onSecondaryInteraction, inline = false, needsOffscreenAlphaCompositing = false, ...rest}: PressableWithSecondaryInteractionProps,
    ref: PressableWithSecondaryInteractionRef,
) {
    const executeSecondaryInteraction = (event: GestureResponderEvent) => {
        event.preventDefault();
        onSecondaryInteraction?.(event);
    };

    // Use Text node for inline mode to prevent content overflow.
    if (inline) {
        return (
            <Text
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...(rest as TextProps)}
                ref={ref as ForwardedRef<RNText>}
                onLongPress={onSecondaryInteraction ? executeSecondaryInteraction : undefined}
            >
                {children}
            </Text>
        );
    }

    return (
        <PressableWithFeedback
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
            ref={ref as ForwardedRef<View>}
            onLongPress={onSecondaryInteraction ? executeSecondaryInteraction : undefined}
            needsOffscreenAlphaCompositing={needsOffscreenAlphaCompositing}
        >
            {children}
        </PressableWithFeedback>
    );
}

PressableWithSecondaryInteraction.displayName = 'PressableWithSecondaryInteraction';

export default forwardRef(PressableWithSecondaryInteraction);
