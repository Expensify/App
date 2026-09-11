import type {ForwardedRef} from 'react';
import type {CellRendererProps, FlatList, FlatListProps} from 'react-native';

type CustomFlatListProps<T> = Omit<FlatListProps<T>, 'CellRendererComponent'> & {
    ref?: ForwardedRef<FlatList>;
    shouldDisableVisibleContentPosition?: boolean;

    /**
     * Whether to use the animated keyboard handler capabilities on native (iOS and Android)
     * Allows for interactive keyboard dismissal when the user drags the keyboard down
     */
    enableAnimatedKeyboardDismissal?: boolean;

    CellRendererComponent?: React.ComponentType<CellRendererProps<T>> | null;

    /**
     * Whether to hide the content (e.g. when first displaying the report actions list, we initially show only the top report actions. We then show the full report actions list after the user scrolls)
     */
    shouldHideContent?: boolean;
};

// eslint-disable-next-line import/prefer-default-export
export type {CustomFlatListProps};
