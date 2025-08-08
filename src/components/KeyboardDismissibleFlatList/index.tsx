import type {ForwardedRef} from 'react';
import React from 'react';
import type {FlatList} from 'react-native';
import type {CustomAnimatedFlatListProps} from '@components/CustomAnimatedFlatList';
import CustomAnimatedFlatList from '@components/CustomAnimatedFlatList';
import useKeyboardDismissibleFlatListValues from '@hooks/useKeyboardDismissibleFlatListValues';

function KeyboardDismissibleFlatList<T>(props: CustomAnimatedFlatListProps<T>, ref: ForwardedRef<FlatList>) {
    const {onScroll} = useKeyboardDismissibleFlatListValues();

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
