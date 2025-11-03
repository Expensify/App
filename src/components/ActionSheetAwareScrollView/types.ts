import type {PropsWithChildren} from 'react';
import type {ScrollViewProps} from 'react-native';

type ActionSheetAwareScrollViewProps = PropsWithChildren<ScrollViewProps>;
type RenderActionSheetAwareScrollViewComponent = ((props: ActionSheetAwareScrollViewProps) => React.ReactElement<ScrollViewProps>) | undefined;
export type {ActionSheetAwareScrollViewProps, RenderActionSheetAwareScrollViewComponent};
