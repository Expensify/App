import {use} from 'react';
import type {AccessibilityState} from 'react-native';
import type PressableProps from '@components/Pressable/GenericPressable/types';
import composeEventHandlers from '@libs/composeEventHandlers';
import PressResponderContext from './PressResponderContext';
import type {RegisterKind, SecondaryInteractionHandler} from './PressResponderContext';

/** Slot props the hook merges from `<PressResponder>`. `ref` is intentionally NOT here — pass it to `useResponderRef` separately so React Compiler can statically prove no ref is leaked through a generic object. */
type ConsumablePressProps = {
    onPress?: PressableProps['onPress'];
    onSecondaryInteraction?: SecondaryInteractionHandler;
    accessibilityState?: AccessibilityState;
    nativeID?: string;
    accessibilityControls?: string | string[];
};

function usePressResponderProps(consumer: ConsumablePressProps, kind: RegisterKind = 'press'): ConsumablePressProps {
    const responder = use(PressResponderContext);
    if (!responder) {
        return consumer;
    }
    responder.register(kind);
    return {
        ...consumer,
        onPress: responder.onPress ? composeEventHandlers(consumer.onPress, responder.onPress as (event: Parameters<NonNullable<PressableProps['onPress']>>[0]) => void) : consumer.onPress,
        onSecondaryInteraction: responder.onSecondaryInteraction ? composeEventHandlers(consumer.onSecondaryInteraction, responder.onSecondaryInteraction) : consumer.onSecondaryInteraction,
        accessibilityState: responder.accessibilityState ? {...consumer.accessibilityState, ...responder.accessibilityState} : consumer.accessibilityState,
        nativeID: responder.nativeID ?? consumer.nativeID,
        accessibilityControls: responder.accessibilityControls ?? consumer.accessibilityControls,
    };
}

export default usePressResponderProps;
export type {ConsumablePressProps};
