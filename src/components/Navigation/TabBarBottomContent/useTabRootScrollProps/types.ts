import type {ScrollViewProps, StyleProp, ViewStyle} from 'react-native';

type TabRootScrollProps = Pick<ScrollViewProps, 'contentContainerStyle' | 'contentInsetAdjustmentBehavior'>;

/** A list that already adds the bottom safe area passes `hasBottomSafeAreaPadding`, so the safe area is not added twice. */
type UseTabRootScrollProps = (style?: StyleProp<ViewStyle>, hasBottomSafeAreaPadding?: boolean) => TabRootScrollProps;

export default UseTabRootScrollProps;
