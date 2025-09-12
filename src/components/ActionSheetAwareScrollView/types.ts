import type {ScrollViewProps, ViewProps} from 'react-native';
import type {SharedValue} from 'react-native-reanimated';

type ActionSheetAwareScrollViewAnimationProps = {
    /** Whether the child ScrollView is inverted */
    isInvertedScrollView?: boolean;
};

type ActionSheetKeyboardSpaceProps = ViewProps &
    ActionSheetAwareScrollViewAnimationProps & {
        /** scroll offset of the parent ScrollView */
        position?: SharedValue<number>;
    };

type ActionSheetAwareScrollViewProps = ScrollViewProps & ActionSheetAwareScrollViewAnimationProps;

type RenderScrollComponentType = ((props: ActionSheetAwareScrollViewProps) => React.JSX.Element) | undefined;

export type {ActionSheetKeyboardSpaceProps, ActionSheetAwareScrollViewProps, RenderScrollComponentType};
