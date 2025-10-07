import type {ReactNode} from 'react';
import type {AnimatedRef, AnimatedScrollViewProps, ScrollHandlerProcessed, SharedValue} from 'react-native-reanimated';
import type Reanimated from 'react-native-reanimated';

type ActionSheetAwareScrollViewProps = Omit<AnimatedScrollViewProps, 'onScroll'> & {
    children?: ReactNode | SharedValue<ReactNode>;
    onScroll?: ScrollHandlerProcessed<Record<string, unknown>>;
    ref?: React.Ref<Reanimated.ScrollView> | AnimatedRef<Reanimated.ScrollView>;
};

// eslint-disable-next-line import/prefer-default-export
export type {ActionSheetAwareScrollViewProps};
