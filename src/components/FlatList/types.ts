import type {ForwardedRef} from 'react';
import type {FlatList, FlatListProps} from 'react-native';

type AdditionalFlatListProps = {
    /** Whether to use the animated keyboard handler capabilities on native (iOS and Android) */
    shouldUseAnimatedKeyboardHandler?: boolean;
};

type CustomFlatListProps<T> = FlatListProps<T> &
    AdditionalFlatListProps & {
        ref?: ForwardedRef<FlatList>;
    };

export type {AdditionalFlatListProps, CustomFlatListProps};
