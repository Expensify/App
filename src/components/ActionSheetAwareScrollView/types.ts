import type {PropsWithChildren, Ref} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView, ScrollViewProps} from 'react-native';

type ActionSheetAwareScrollViewAnimationProps = {
    /** Whether the child ScrollView is inverted */
    isInvertedScrollView?: boolean;
    ref?: Ref<ScrollView>;
};
type ActionSheetAwareScrollViewProps = PropsWithChildren<ScrollViewProps> & ActionSheetAwareScrollViewAnimationProps;
type RenderActionSheetAwareScrollViewComponent = ((props: ActionSheetAwareScrollViewProps) => React.ReactElement<ScrollViewProps>) | undefined;
export type {ActionSheetAwareScrollViewProps, RenderActionSheetAwareScrollViewComponent};
