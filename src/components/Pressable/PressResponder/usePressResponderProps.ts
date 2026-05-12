import {use} from 'react';
import type {AccessibilityState} from 'react-native';
import type PressableProps from '@components/Pressable/GenericPressable/types';
import PressResponderContext from './PressResponderContext';
import type {AccessibilityHasPopup, RegisterKind, SecondaryInteractionHandler} from './PressResponderContext';

/** Slot props the hook merges from `<PressResponder>`. `ref` is intentionally NOT here — pass it to `useResponderRef` separately so React Compiler can statically prove no ref is leaked through a generic object. */
type ConsumablePressProps = {
    onPress?: PressableProps['onPress'];
    onSecondaryInteraction?: SecondaryInteractionHandler;
    accessibilityState?: AccessibilityState;
    accessibilityHasPopup?: AccessibilityHasPopup;
    nativeID?: string;
    accessibilityControls?: string | string[];
};

/** Chains consumer then responder. No implicit gate — publishers read `event.defaultPrevented` themselves. */
function usePressResponderProps(consumer: ConsumablePressProps, kind: RegisterKind = 'press'): ConsumablePressProps {
    const responder = use(PressResponderContext);
    if (!responder) {
        return consumer;
    }
    responder.register(kind);
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
