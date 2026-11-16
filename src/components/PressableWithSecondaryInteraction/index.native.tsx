import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import usePressResponderProps from '@components/Pressable/PressResponder/usePressResponderProps';
import Text from '@components/Text';

import castToSentryLabel from '@libs/castToSentryLabel';

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
    const {onSecondaryInteraction, accessibilityState, accessibilityHasPopup, nativeID, accessibilityControls, sentryLabel} = usePressResponderProps({
        onSecondaryInteraction: rawOnSecondaryInteraction,
        accessibilityState: rest.accessibilityState,
        accessibilityHasPopup: rest.accessibilityHasPopup,
        nativeID: rest.nativeID,
        accessibilityControls: rest.accessibilityControls,
        sentryLabel: rest.sentryLabel,
    });

    const executeSecondaryInteraction = (event: GestureResponderEvent) => {
        event.preventDefault();
        onSecondaryInteraction?.(event);
    };

    // Use Text node for inline mode to prevent content overflow.
    if (inline) {
        return (
            <Text
                // The press props stay out of the cast, since TypeScript can't relate them to the label after it. The
                // label still travels with them in `rest`.
                {...(rest as Omit<TextProps, 'onPress' | 'onLongPress' | 'sentryLabel'>)}
                // The long press runs the secondary interaction, which can come from a press responder with its own label.
                sentryLabel={castToSentryLabel(sentryLabel)}
                onLongPress={onSecondaryInteraction ? executeSecondaryInteraction : undefined}
                suppressHighlighting={suppressHighlighting}
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
            sentryLabel={castToSentryLabel(sentryLabel)}
            onLongPress={onSecondaryInteraction ? executeSecondaryInteraction : undefined}
            needsOffscreenAlphaCompositing={needsOffscreenAlphaCompositing}
            pressDimmingValue={activeOpacity}
        >
            {children}
        </PressableWithFeedback>
    );
}

export default PressableWithSecondaryInteraction;
