import type {PropsWithChildren} from 'react';
import type {ScrollViewProps, StyleProp, ViewStyle} from 'react-native';

type ActionSheetAwareScrollViewProps = PropsWithChildren<ScrollViewProps> & {
    containerStyle?: StyleProp<ViewStyle>;
};

type RenderActionSheetAwareScrollViewComponent = ((props: ActionSheetAwareScrollViewProps) => React.ReactElement<ScrollViewProps>) | undefined;
export type {ActionSheetAwareScrollViewProps, RenderActionSheetAwareScrollViewComponent};
