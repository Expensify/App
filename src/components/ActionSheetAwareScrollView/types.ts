import type {PropsWithChildren, Ref} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView, ScrollViewProps} from 'react-native';

type ActionSheetAwareScrollViewProps = PropsWithChildren<ScrollViewProps> & {
    /** Reference to the outer element */
    ref?: Ref<ScrollView>;
};
type RenderActionSheetAwareScrollViewComponent = ((props: ActionSheetAwareScrollViewProps) => React.ReactElement<ScrollViewProps>) | undefined;
export type {ActionSheetAwareScrollViewProps, RenderActionSheetAwareScrollViewComponent};
