import type {PropsWithChildren} from 'react';
import type {ScrollViewProps} from 'react-native';

type ActionSheetAwareScrollViewProps = PropsWithChildren<ScrollViewProps> & {
    /** Whether to add top spacing for sticky content in inverted list */
    shouldAddTopSpacing?: boolean;
    /** Data array passed from FlatList when used as renderScrollComponent */
    data?: readonly unknown[];
};
type RenderActionSheetAwareScrollViewComponent = ((props: ActionSheetAwareScrollViewProps) => React.ReactElement<ScrollViewProps>) | undefined;
export type {ActionSheetAwareScrollViewProps, RenderActionSheetAwareScrollViewComponent};
