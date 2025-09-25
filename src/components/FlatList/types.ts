import type {ForwardedRef} from 'react';
import type {FlatList, FlatListProps} from 'react-native';

type AdditionalFlatListProps = {
    /**
     * iOS and Android only - Uses the animated keyboard handler capabilities
     */
    withAnimatedKeyboardHandler?: boolean;
};

type CustomFlatListProps<T> = FlatListProps<T> &
    AdditionalFlatListProps & {
        ref?: ForwardedRef<FlatList>;
    };

export type {AdditionalFlatListProps, CustomFlatListProps};
