import type {ForwardedRef, PropsWithChildren} from 'react';
import React from 'react';
import type {FlatList, FlatListProps} from 'react-native';
import CustomAnimatedFlatList from '@components/CustomAnimatedFlatList';
import {useKeyboardDismissableFlatListContext} from './KeyboardDismissableFlatListContext';

type KeyboardDismissableFlatListProps<T> = Omit<FlatListProps<T>, 'CellRendererComponent'> & {
    CellRendererComponent?: React.FC<PropsWithChildren> | null;
};

function KeyboardDismissableFlatList<T>(props: KeyboardDismissableFlatListProps<T>, ref: ForwardedRef<FlatList>) {
    const {onScroll} = useKeyboardDismissableFlatListContext();

    return (
        <CustomAnimatedFlatList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            onScroll={onScroll}
        />
    );
}

export default React.forwardRef(KeyboardDismissableFlatList);
