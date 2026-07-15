import type {ActionWithPayload, State} from '@hooks/useWorkletStateMachine';

import type {Ref} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView, ScrollViewProps} from 'react-native';
import type {KeyboardChatScrollViewProps} from 'react-native-keyboard-controller';
import type Reanimated from 'react-native-reanimated';
import type {SharedValue} from 'react-native-reanimated';

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

type ActionSheetAwareKeyboardScrollViewProps = ActionSheetAwareScrollViewProps & Pick<KeyboardChatScrollViewProps, 'inverted'>;

type RenderActionSheetAwareScrollViewComponent = (props: ActionSheetAwareScrollViewProps) => React.ReactElement<ScrollViewProps>;
type RenderActionSheetAwareKeyboardScrollViewComponent = (props: ActionSheetAwareKeyboardScrollViewProps) => React.ReactElement<ScrollViewProps>;

export type {
    ActionSheetAwareScrollViewProps,
    ActionSheetAwareKeyboardScrollViewProps,
    ActionSheetAwareScrollViewHandle,
    RenderActionSheetAwareScrollViewComponent,
    RenderActionSheetAwareKeyboardScrollViewComponent,
    ActionSheetAwareScrollViewContextValue,
    ActionSheetAwareScrollViewStateContextValue,
    ActionSheetAwareScrollViewActionsContextValue,
    ActionSheetAwareScrollViewMeasurements,
    ActionSheetAwareScrollViewState,
};
