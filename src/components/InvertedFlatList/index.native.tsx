import type {ForwardedRef} from 'react';
import React, {forwardRef} from 'react';
import type {FlatList} from 'react-native';
import BaseInvertedFlatList from './BaseInvertedFlatList';
import type {BaseInvertedFlatListProps} from './BaseInvertedFlatList';
import CellRendererComponent from './CellRendererComponent';

function BaseInvertedFlatListWithRef<T>(props: BaseInvertedFlatListProps<T>, ref: ForwardedRef<FlatList>) {
    return (
        <BaseInvertedFlatList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            CellRendererComponent={CellRendererComponent}
            /**
             * To achieve absolute positioning and handle overflows for list items, the property must be disabled
             * for Android native builds.
             * Source: https://reactnative.dev/docs/0.71/optimizing-flatlist-configuration#removeclippedsubviews
             */
            removeClippedSubviews={false}
        />
    );
}

BaseInvertedFlatListWithRef.displayName = 'BaseInvertedFlatListWithRef';

export default forwardRef(BaseInvertedFlatListWithRef);
