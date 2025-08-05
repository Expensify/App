import type {ForwardedRef} from 'react';
import React from 'react';
import type {FlatList} from 'react-native';
import type {CustomAnimatedFlatListProps} from '@components/CustomAnimatedFlatList';
import CustomAnimatedFlatList from '@components/CustomAnimatedFlatList';
import {useKeyboardDismissableFlatListContext} from './KeyboardDismissableFlatListContext';

function KeyboardDismissableFlatList<T>(props: CustomAnimatedFlatListProps<T>, ref: ForwardedRef<FlatList>) {
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
