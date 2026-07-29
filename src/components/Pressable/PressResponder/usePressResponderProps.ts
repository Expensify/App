import type PressableProps from '@components/Pressable/GenericPressable/types';

import type {AccessibilityState} from 'react-native';

import {use} from 'react';

import type {AccessibilityHasPopup, SecondaryInteractionHandler} from './PressResponderContext';

import PressResponderContext from './PressResponderContext';

/** `ref` is intentionally not here — pass it to `useResponderRef` so React Compiler can verify ref flow narrowly. */
type ConsumablePressProps = {
    onPress?: PressableProps['onPress'];
    onSecondaryInteraction?: SecondaryInteractionHandler;
    accessibilityState?: AccessibilityState;
    accessibilityHasPopup?: AccessibilityHasPopup;
    nativeID?: string;
    accessibilityControls?: string | string[];
};

/** Chains consumer then responder; publishers gate via `event.defaultPrevented`. */
function usePressResponderProps(consumer: ConsumablePressProps): ConsumablePressProps {
    const responder = use(PressResponderContext);
    if (!responder) {
        return consumer;
    }
    const responderOnPress = responder.onPress;
    const responderOnSecondaryInteraction = responder.onSecondaryInteraction;
    return {
        ...consumer,
        onPress: responderOnPress
            ? (event) => {
                  consumer.onPress?.(event);
                  responderOnPress(event);
              }
            : consumer.onPress,
        onSecondaryInteraction: responderOnSecondaryInteraction
            ? (event) => {
                  consumer.onSecondaryInteraction?.(event);
                  responderOnSecondaryInteraction(event);
              }
            : consumer.onSecondaryInteraction,
        accessibilityState: responder.accessibilityState ? {...consumer.accessibilityState, ...responder.accessibilityState} : consumer.accessibilityState,
        accessibilityHasPopup: responder.accessibilityHasPopup ?? consumer.accessibilityHasPopup,
        nativeID: responder.nativeID ?? consumer.nativeID,
        accessibilityControls: responder.accessibilityControls ?? consumer.accessibilityControls,
    };
}

export default usePressResponderProps;
export type {ConsumablePressProps};
