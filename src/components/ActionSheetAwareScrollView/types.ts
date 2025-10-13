import type {PropsWithChildren, Ref} from 'react';
import type {ScrollViewProps} from 'react-native';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports, no-restricted-imports
import {ScrollView} from 'react-native';

type ActionSheetAwareScrollViewProps = PropsWithChildren<ScrollViewProps> & {
    /** Whether to add top spacing for sticky content in inverted list */
    shouldAddTopSpacing?: boolean;

    /** Data array passed from FlatList when used as renderScrollComponent */
    data?: readonly unknown[];

    /** Ref to the ScrollView component */
    ref?: Ref<ScrollView>;
};
type RenderActionSheetAwareScrollViewComponent = ((props: ActionSheetAwareScrollViewProps) => React.ReactElement<ScrollViewProps>) | undefined;
export type {ActionSheetAwareScrollViewProps, RenderActionSheetAwareScrollViewComponent};
