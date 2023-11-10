import React, {forwardRef} from 'react';
import {GestureResponderEvent, TextProps} from 'react-native';
import {PressableRef} from '@components/Pressable/GenericPressable/types';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import PressableWithSecondaryInteractionProps from './types';

/** This is a special Pressable that calls onSecondaryInteraction when LongPressed. */
function PressableWithSecondaryInteraction(
    {
        children,
        onSecondaryInteraction,
        inline = false,
        needsOffscreenAlphaCompositing = false,
        activeOpacity = 1,
        preventDefaultContextMenu,
        withoutFocusOnSecondaryInteraction,
        enableLongPressWithHover,
        ...rest
    }: PressableWithSecondaryInteractionProps,
    ref: PressableRef,
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
            ref={ref}
            onLongPress={onSecondaryInteraction ? executeSecondaryInteraction : undefined}
            needsOffscreenAlphaCompositing={needsOffscreenAlphaCompositing}
            pressDimmingValue={activeOpacity}
        >
            {children}
        </PressableWithFeedback>
    );
}

PressableWithSecondaryInteraction.displayName = 'PressableWithSecondaryInteraction';

export default forwardRef(PressableWithSecondaryInteraction);
