import type {ForwardedRef} from 'react';
import React from 'react';
import type {FlatList} from 'react-native';
import type {CustomAnimatedFlatListProps} from '@components/CustomAnimatedFlatList';
import CustomAnimatedFlatList from '@components/CustomAnimatedFlatList';
import {useKeyboardDismissibleFlatListContext} from './KeyboardDismissibleFlatListContext';

function KeyboardDismissibleFlatList<T>(props: CustomAnimatedFlatListProps<T>, ref: ForwardedRef<FlatList>) {
    const {onScroll} = useKeyboardDismissibleFlatListContext();

    return (
        <CustomAnimatedFlatList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            onScroll={onScroll}
        />
    );
}

export default React.forwardRef(KeyboardDismissibleFlatList);
