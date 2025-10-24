import type {ReactNode} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView} from 'react-native';
import type Reanimated from 'react-native-reanimated';
import type {AnimatedScrollViewProps, ScrollHandlerProcessed, SharedValue} from 'react-native-reanimated';
import type {ActionWithPayload, State} from '@hooks/useWorkletStateMachine';

type ActionSheetAwareScrollViewMeasurements = {
    frameY?: number;
    popoverHeight?: number;
    height?: number;
    composerHeight?: number;
};

type ActionSheetAwareScrollViewState = State<ActionSheetAwareScrollViewMeasurements>;

type ActionSheetAwareScrollViewContextValue = {
    currentActionSheetState: SharedValue<ActionSheetAwareScrollViewState>;
    transitionActionSheetState: (action: ActionWithPayload) => void;
    transitionActionSheetStateWorklet: (action: ActionWithPayload) => void;
    resetStateMachine: () => void;
};

type ActionSheetAwareScrollViewProps = Omit<AnimatedScrollViewProps, 'onScroll'> & {
    children?: ReactNode | SharedValue<ReactNode>;
    onScroll?: ScrollHandlerProcessed<Record<string, unknown>>;
};

type ActionSheetAwareScrollViewHandle = ScrollView | Reanimated.ScrollView;

export type {
    ActionSheetAwareScrollViewProps,
    ActionSheetAwareScrollViewHandle,
    ActionSheetAwareScrollViewContextValue,
    ActionSheetAwareScrollViewMeasurements,
    ActionSheetAwareScrollViewState,
};
