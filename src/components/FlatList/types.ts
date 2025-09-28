import type {ForwardedRef} from 'react';
import type {CellRendererProps, FlatList, FlatListProps} from 'react-native';
import type {AnimatedFlatListWithCellRendererProps} from '@components/AnimatedFlatListWithCellRenderer';

type CustomFlatListProps<T> = Omit<FlatListProps<T>, 'CellRendererComponent' | 'onScroll'> & {
    /**
     * Whether to use the animated keyboard handler capabilities on native (iOS and Android)
     * Allows for interactive keyboard dimissal when the user drags the keyboard down
     */
    enableAnimatedKeyboardDismissal?: boolean;

    /**
     * Custom cell renderer component
     */
    CellRendererComponent?: React.ComponentType<CellRendererProps<T>> | null;

    /**
     * Ref to the FlatList component
     */
    ref?: ForwardedRef<FlatList>;

    /**
     * Regular React Native FlatList onScroll handler. This callback is called either
     * from an animated scroll handler or from the regular React Native FlatList
     * onScroll handler, depending on the enableAnimatedKeyboardDismissal prop.
     */
    regularOnScrollHandler?: FlatListProps<T>['onScroll'];
} & (
        | {
              enableAnimatedKeyboardDismissal: true;
              onScroll?: AnimatedFlatListWithCellRendererProps['onScroll'];
          }
        | {
              enableAnimatedKeyboardDismissal?: false;
              onScroll?: FlatListProps<T>['onScroll'];
          }
    );

// eslint-disable-next-line import/prefer-default-export
export type {CustomFlatListProps};
