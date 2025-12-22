import type {ForwardedRef} from 'react';
import type {CellRendererProps, FlatList, FlatListProps} from 'react-native';

type CustomFlatListProps<T> = Omit<FlatListProps<T>, 'CellRendererComponent'> & {
    /**
     * Ref to the FlatList component
     */
    ref?: ForwardedRef<FlatList>;

    /**
     * Whether to disable the visible content position
     */
    shouldDisableVisibleContentPosition?: boolean;

    /**
     * Whether to use the animated keyboard handler capabilities on native (iOS and Android)
     * Allows for interactive keyboard dismissal when the user drags the keyboard down
     */
    enableAnimatedKeyboardDismissal?: boolean;

    /**
     * Custom cell renderer component
     */
    CellRendererComponent?: React.ComponentType<CellRendererProps<T>> | null;

    /**
     * Whether to hide the content (e.g. when first displaying the report actions list, we initially show only the top report actions. We then show the full report actions list after the user scrolls)
     */
    shouldHideContent?: boolean;
};

// eslint-disable-next-line import/prefer-default-export
export type {CustomFlatListProps};
