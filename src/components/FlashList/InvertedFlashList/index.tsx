import type {FlatListRefType} from '@pages/inbox/ReportScreenContext';

import type {FlashListProps} from '@shopify/flash-list';

import React from 'react';

import FlashList from '..';
import CellRendererComponent from './CellRendererComponent';

type InvertedFlashListProps<T> = FlashListProps<T> & {
    /** The array of items to render in the list. */
    data: T[];

    /** Function that extracts a unique key for each item in the list. */
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
