import type {ReactNode} from 'react';
import type {AnimatedScrollViewProps, ScrollHandlerProcessed, SharedValue} from 'react-native-reanimated';

type ActionSheetAwareScrollViewProps = Omit<AnimatedScrollViewProps, 'onScroll'> & {
    children?: ReactNode | SharedValue<ReactNode>;
    onScroll?: ScrollHandlerProcessed<Record<string, unknown>>;
};

// eslint-disable-next-line import/prefer-default-export
export type {ActionSheetAwareScrollViewProps};
