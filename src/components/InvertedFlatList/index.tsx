import React from 'react';
import BaseInvertedFlatList from './BaseInvertedFlatList';
import shouldRemoveClippedSubviews from './BaseInvertedFlatList/shouldRemoveClippedSubviews';
import type {BaseInvertedFlatListProps} from './BaseInvertedFlatList/types';
import CellRendererComponent from './CellRendererComponent';

function InvertedFlatListWithRef<T>({ref, ...props}: BaseInvertedFlatListProps<T>) {
    return (
        <BaseInvertedFlatList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            CellRendererComponent={CellRendererComponent}
            removeClippedSubviews={shouldRemoveClippedSubviews}
        />
    );
}

InvertedFlatListWithRef.displayName = 'InvertedFlatListWithRef';

export default InvertedFlatListWithRef;
