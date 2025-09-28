import type {ForwardedRef} from 'react';
import type {CellRendererProps, FlatList, FlatListProps, NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
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

    additionalOnScrollHandler?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
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
