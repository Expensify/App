import type {Ref} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView, ScrollViewProps} from 'react-native';
import type Reanimated from 'react-native-reanimated';
import type {SharedValue} from 'react-native-reanimated';
import type {ActionWithPayload, State} from '@hooks/useWorkletStateMachine';

type ActionSheetAwareScrollViewMeasurements = {
    frameY?: number;
    popoverHeight?: number;
    height?: number;
    composerHeight?: number;
};

type ActionSheetAwareScrollViewState = State<ActionSheetAwareScrollViewMeasurements>;

type ActionSheetAwareScrollViewStateContextValue = {
    currentActionSheetState: SharedValue<ActionSheetAwareScrollViewState>;
};

type ActionSheetAwareScrollViewActionsContextValue = {
    transitionActionSheetState: (action: ActionWithPayload) => void;
    transitionActionSheetStateWorklet: (action: ActionWithPayload) => void;
    resetStateMachine: () => void;
};

type ActionSheetAwareScrollViewContextValue = ActionSheetAwareScrollViewStateContextValue & ActionSheetAwareScrollViewActionsContextValue;

type ActionSheetAwareScrollViewHandle = ScrollView | Reanimated.ScrollView;

type ActionSheetAwareScrollViewProps = ScrollViewProps & {
    ref?: Ref<ActionSheetAwareScrollViewHandle>;
};

type RenderActionSheetAwareScrollViewComponent = (props: ActionSheetAwareScrollViewProps) => React.ReactElement<ScrollViewProps>;

export type {
    ActionSheetAwareScrollViewProps,
    ActionSheetAwareScrollViewHandle,
    RenderActionSheetAwareScrollViewComponent,
    ActionSheetAwareScrollViewContextValue,
    ActionSheetAwareScrollViewStateContextValue,
    ActionSheetAwareScrollViewActionsContextValue,
    ActionSheetAwareScrollViewMeasurements,
    ActionSheetAwareScrollViewState,
};
