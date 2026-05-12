import {createContext} from 'react';
import type {AccessibilityState, GestureResponderEvent} from 'react-native';
import type PressableProps from '@components/Pressable/GenericPressable/types';

type SecondaryInteractionHandler = (event: GestureResponderEvent | MouseEvent) => void;

type RegisterKind = 'press' | 'secondary';

// Matches react-native-web's accessibilityHasPopup shape; ignored on native.
type AccessibilityHasPopup = 'dialog' | 'grid' | 'listbox' | 'menu' | 'tree' | false;

type PressResponderContextValue = {
    onPress?: PressableProps['onPress'];
    onSecondaryInteraction?: SecondaryInteractionHandler;
    accessibilityState?: AccessibilityState;
    accessibilityHasPopup?: AccessibilityHasPopup;
    nativeID?: string;
    accessibilityControls?: string | string[];
    ref: PressableProps['ref'];
    register: (kind: RegisterKind) => void;
    registerRef: () => void;
};

const PressResponderContext = createContext<PressResponderContextValue | null>(null);
PressResponderContext.displayName = 'PressResponderContext';

export default PressResponderContext;
export type {AccessibilityHasPopup, PressResponderContextValue, SecondaryInteractionHandler, RegisterKind};
