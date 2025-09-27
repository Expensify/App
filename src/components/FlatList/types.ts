import type {ForwardedRef} from 'react';
import type {FlatList, FlatListProps} from 'react-native';

type CustomFlatListProps<T> = FlatListProps<T> & {
    /**
     * Whether to use the animated keyboard handler capabilities on native (iOS and Android)
     * Allows for interactive keyboard dimissal when the user drags the keyboard down
     */
    enableAnimatedKeyboardDismissal?: boolean;

    /**
     * Ref to the FlatList component
     */
    ref?: ForwardedRef<FlatList>;
};

// eslint-disable-next-line import/prefer-default-export
export type {CustomFlatListProps};
