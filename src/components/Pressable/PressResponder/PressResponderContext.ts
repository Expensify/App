import {createContext} from 'react';
import type {AccessibilityState, GestureResponderEvent} from 'react-native';
import type PressableProps from '@components/Pressable/GenericPressable/types';

type SecondaryInteractionHandler = (event: GestureResponderEvent | MouseEvent) => void;

type PressResponderContextValue = {
    onPress?: PressableProps['onPress'];
    onSecondaryInteraction?: SecondaryInteractionHandler;
    accessibilityState?: AccessibilityState;
    nativeID?: string;
    accessibilityControls?: string | string[];
    ref?: PressableProps['ref'];
    register?: () => void;
};

const PressResponderContext = createContext<PressResponderContextValue | null>(null);
PressResponderContext.displayName = 'PressResponderContext';

export default PressResponderContext;
export type {PressResponderContextValue, SecondaryInteractionHandler};
