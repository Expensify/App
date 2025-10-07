import type {ReactNode} from 'react';
import type {AnimatedRef, AnimatedScrollViewProps, ScrollHandlerProcessed, SharedValue} from 'react-native-reanimated';
import type Reanimated from 'react-native-reanimated';
import type {ActionWithPayload, State} from '@hooks/useWorkletStateMachine';

type ActionSheetAwareScrollViewMeasurements = {
    frameY?: number;
    popoverHeight?: number;
    height?: number;
    composerHeight?: number;
};

type ActionSheetAwareScrollViewState = State<ActionSheetAwareScrollViewMeasurements>;

/** Holds all information that is needed to coordinate the state value for the action sheet state machine. */
const INITIAL_ACTION_SHEET_STATE: ActionSheetAwareScrollViewState = {
    previous: {
        state: 'idle',
        payload: null,
    },
    current: {
        state: 'idle',
        payload: null,
    },
};

type ActionSheetAwareScrollViewContextValue = {
    currentActionSheetState: SharedValue<ActionSheetAwareScrollViewState>;
    transitionActionSheetState: (action: ActionWithPayload) => void;
    transitionActionSheetStateWorklet: (action: ActionWithPayload) => void;
    resetStateMachine: () => void;
};

type ActionSheetAwareScrollViewProps = Omit<AnimatedScrollViewProps, 'onScroll'> & {
    children?: ReactNode | SharedValue<ReactNode>;
    onScroll?: ScrollHandlerProcessed<Record<string, unknown>>;
    ref?: React.Ref<Reanimated.ScrollView> | AnimatedRef<Reanimated.ScrollView>;
};

export type {ActionSheetAwareScrollViewProps, ActionSheetAwareScrollViewContextValue, ActionSheetAwareScrollViewMeasurements, ActionSheetAwareScrollViewState};

export {INITIAL_ACTION_SHEET_STATE};
