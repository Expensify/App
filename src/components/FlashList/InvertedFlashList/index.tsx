import type FlatListRefType from '@components/FlashList/types';

import type {FlashListProps} from '@shopify/flash-list';

import React from 'react';

import FlashList from '..';
import CellRendererComponent from './CellRendererComponent';

type InvertedFlashListProps<T> = FlashListProps<T> & {
    data: T[];
    keyExtractor: (item: T, index: number) => string;

    /** Ref to the underlying list instance. */
    ref: FlatListRefType;
};

function InvertedFlashList<T>(props: InvertedFlashListProps<T>) {
    return (
        <FlashList<T>
            {...props}
            inverted
            CellRendererComponent={CellRendererComponent}
        />
    );
}

export default InvertedFlashList;
