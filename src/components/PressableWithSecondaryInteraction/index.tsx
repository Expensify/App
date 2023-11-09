import React, {ForwardedRef, forwardRef, useEffect, useRef} from 'react';
import {GestureResponderEvent, View} from 'react-native';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import styles from '@styles/styles';
import * as StyleUtils from '@styles/StyleUtils';
import PressableWithSecondaryInteractionProps, {PressableWithSecondaryInteractionRef} from './types';

/** This is a special Pressable that calls onSecondaryInteraction when LongPressed, or right-clicked. */
function PressableWithSecondaryInteraction(
    {
        children,
        onPress,
        onPressOut,
        inline = false,
        style,
        enableLongPressWithHover = false,
        withoutFocusOnSecondaryInteraction = false,
        needsOffscreenAlphaCompositing = false,
        preventDefaultContextMenu = true,
        onSecondaryInteraction,
        activeOpacity = 1,
        ...rest
    }: PressableWithSecondaryInteractionProps,
    ref: PressableWithSecondaryInteractionRef,
) {
    const pressableRef = useRef<HTMLDivElement | null>(null);

    const executeSecondaryInteraction = (event: GestureResponderEvent) => {
        if (DeviceCapabilities.hasHoverSupport() && !enableLongPressWithHover) {
            return;
        }
        if (withoutFocusOnSecondaryInteraction && pressableRef.current) {
            pressableRef.current.blur();
        }
        onSecondaryInteraction?.(event);
    };

    useEffect(() => {
        if (!pressableRef.current) {
            return;
        }

        if (ref) {
            if (typeof ref === 'function') {
                ref(pressableRef.current);
            } else {
                // eslint-disable-next-line no-param-reassign
                ref.current = pressableRef.current;
            }
        }

        const element = pressableRef.current;

        /**
         * @param event - A right-click MouseEvent.
         * https://developer.mozilla.org/en-US/docs/Web/API/Element/contextmenu_event
         */
        const executeSecondaryInteractionOnContextMenu = (event: MouseEvent) => {
            if (!onSecondaryInteraction) {
                return;
            }

            event.stopPropagation();
            if (preventDefaultContextMenu) {
                event.preventDefault();
            }

            onSecondaryInteraction(event);

            /**
             * This component prevents the tapped element from capturing focus.
             * We need to blur this element when clicked as it opens modal that implements focus-trapping.
             * When the modal is closed it focuses back to the last active element.
             * Therefore it shifts the element to bring it back to focus.
             * https://github.com/Expensify/App/issues/14148
             */
            if (withoutFocusOnSecondaryInteraction) {
                element.blur();
            }
        };

        element.addEventListener('contextmenu', executeSecondaryInteractionOnContextMenu);

        return () => {
            element.removeEventListener('contextmenu', executeSecondaryInteractionOnContextMenu);
        };
    }, [ref, onSecondaryInteraction, preventDefaultContextMenu, withoutFocusOnSecondaryInteraction]);

    const inlineStyle = inline ? styles.dInline : {};

    // On Web, Text does not support LongPress events thus manage inline mode with styling instead of using Text.
    return (
        <PressableWithFeedback
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
            wrapperStyle={StyleUtils.combineStyles(DeviceCapabilities.canUseTouchScreen() ? [styles.userSelectNone, styles.noSelect] : [], inlineStyle)}
            onLongPress={onSecondaryInteraction ? executeSecondaryInteraction : undefined}
            pressDimmingValue={activeOpacity}
            onPress={onPress}
            ref={pressableRef as ForwardedRef<View>}
            style={(state) => [StyleUtils.parseStyleFromFunction(style, state), inlineStyle]}
            needsOffscreenAlphaCompositing={needsOffscreenAlphaCompositing}
        >
            {children}
        </PressableWithFeedback>
    );
}

PressableWithSecondaryInteraction.displayName = 'PressableWithSecondaryInteraction';

export default forwardRef(PressableWithSecondaryInteraction);
