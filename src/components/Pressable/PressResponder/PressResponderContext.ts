import type PressableProps from '@components/Pressable/GenericPressable/types';

import type {WithSentryLabelWhenPressable} from '@src/types/utils/SentryLabel';

import type {AccessibilityState, GestureResponderEvent} from 'react-native';

import {createContext} from 'react';

type SecondaryInteractionHandler = (event: GestureResponderEvent | MouseEvent) => void;

// `| false` matches `PressableProps['accessibilityHasPopup']`.
type AccessibilityHasPopup = 'dialog' | 'grid' | 'listbox' | 'menu' | 'tree' | false;

// A responder adds its handlers to the pressable below it, so it brings the label for them too.
type PressResponderContextValue = WithSentryLabelWhenPressable<'onPress' | 'onSecondaryInteraction'> & {
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
