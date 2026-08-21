import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import usePressResponderProps from '@components/Pressable/PressResponder/usePressResponderProps';
import Text from '@components/Text';

import type {ReactNode} from 'react';
import type {GestureResponderEvent, TextProps} from 'react-native';

import React from 'react';

import type PressableWithSecondaryInteractionProps from './types';

/** This is a special Pressable that calls onSecondaryInteraction when LongPressed. */
function PressableWithSecondaryInteraction({
    children,
    onSecondaryInteraction: rawOnSecondaryInteraction,
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
    // Forward the a11y slot so it reaches the underlying pressable even when the descendant isn't `<PressableWithFeedback>`.
    const {onSecondaryInteraction, accessibilityState, accessibilityHasPopup, nativeID, accessibilityControls} = usePressResponderProps({
        onSecondaryInteraction: rawOnSecondaryInteraction,
        accessibilityState: rest.accessibilityState,
        accessibilityHasPopup: rest.accessibilityHasPopup,
        nativeID: rest.nativeID,
        accessibilityControls: rest.accessibilityControls,
    });

    const executeSecondaryInteraction = (event: GestureResponderEvent) => {
        event.preventDefault();
        onSecondaryInteraction?.(event);
    };

    // Use Text node for inline mode to prevent content overflow.
    if (inline) {
        return (
            <Text
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
            {...rest}
            accessibilityState={accessibilityState}
            accessibilityHasPopup={accessibilityHasPopup}
            nativeID={nativeID}
            accessibilityControls={accessibilityControls}
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
