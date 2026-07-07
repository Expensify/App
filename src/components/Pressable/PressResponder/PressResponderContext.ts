import type PressableProps from '@components/Pressable/GenericPressable/types';

import type {AccessibilityState, GestureResponderEvent} from 'react-native';

import {createContext} from 'react';

type SecondaryInteractionHandler = (event: GestureResponderEvent | MouseEvent) => void;

// `| false` matches `PressableProps['accessibilityHasPopup']`.
type AccessibilityHasPopup = 'dialog' | 'grid' | 'listbox' | 'menu' | 'tree' | false;

type PressResponderContextValue = {
    onPress?: PressableProps['onPress'];
    onSecondaryInteraction?: SecondaryInteractionHandler;
    accessibilityState?: AccessibilityState;
    accessibilityHasPopup?: AccessibilityHasPopup;
    nativeID?: string;
    accessibilityControls?: string | string[];
    ref?: PressableProps['ref'];
};

const PressResponderContext = createContext<PressResponderContextValue | null>(null);
PressResponderContext.displayName = 'PressResponderContext';

export default PressResponderContext;
export type {AccessibilityHasPopup, PressResponderContextValue, SecondaryInteractionHandler};
