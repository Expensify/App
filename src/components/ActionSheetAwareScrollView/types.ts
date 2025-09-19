import type {PropsWithChildren} from 'react';
import type {ScrollViewProps} from 'react-native';

type ActionSheetAwareScrollViewAnimationProps = {
    /** Whether the child ScrollView is inverted */
    isInvertedScrollView?: boolean;
};
type ActionSheetAwareScrollViewProps = PropsWithChildren<ScrollViewProps> & ActionSheetAwareScrollViewAnimationProps;
type RenderActionSheetAwareScrollViewComponent = ((props: ActionSheetAwareScrollViewProps) => React.ReactElement<ScrollViewProps>) | undefined;
export type {ActionSheetAwareScrollViewProps, RenderActionSheetAwareScrollViewComponent};
