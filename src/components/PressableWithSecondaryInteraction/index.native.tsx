import type {ReactNode} from 'react';
import React from 'react';
import type {GestureResponderEvent, TextProps} from 'react-native';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import type PressableWithSecondaryInteractionProps from './types';

/** This is a special Pressable that calls onSecondaryInteraction when LongPressed. */
function PressableWithSecondaryInteraction({
    children,
    onSecondaryInteraction,
    inline = false,
    needsOffscreenAlphaCompositing = false,
    suppressHighlighting = false,
    activeOpacity = 1,
    preventDefaultContextMenu,
    withoutFocusOnSecondaryInteraction,
    enableLongPressWithHover,
    ref,
    ...rest
}: PressableWithSecondaryInteractionProps) {
    const executeSecondaryInteraction = (event: GestureResponderEvent) => {
        event.preventDefault();
        onSecondaryInteraction?.(event);
    };

    // Use Text node for inline mode to prevent content overflow.
    if (inline) {
        return (
            <Text
                // ESLint is disabled here to propagate all the props, enhancing PressableWithSecondaryInteraction's versatility across different use cases.
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...(rest as TextProps)}
                suppressHighlighting={suppressHighlighting}
                onLongPress={onSecondaryInteraction ? executeSecondaryInteraction : undefined}
            >
                {children as ReactNode}
            </Text>
        );
    }

    return (
        <PressableWithFeedback
            // ESLint is disabled here to propagate all the props, enhancing PressableWithSecondaryInteraction's versatility across different use cases.
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

export default PressableWithSecondaryInteraction;
