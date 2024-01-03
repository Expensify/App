import React, {ForwardedRef, forwardRef} from 'react';
import {FlatList, FlatListProps} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import BaseInvertedFlatList from './BaseInvertedFlatList';
import CellRendererComponent from './CellRendererComponent';

function BaseInvertedFlatListWithRef<T>(props: FlatListProps<T>, ref: ForwardedRef<FlatList>) {
    const styles = useThemeStyles();
    return (
        <BaseInvertedFlatList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            contentContainerStyle={styles.justifyContentEnd}
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
