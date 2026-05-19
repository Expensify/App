import type {FlashListProps} from '@shopify/flash-list';
import React from 'react';
import type {FlashListRefType, FlatListRefType} from '@pages/inbox/ReportScreenContext';
import FlashList from '..';
import CellRendererComponent from './CellRendererComponent';

type InvertedFlashListProps<T> = FlashListProps<T> & {
    /** The array of items to render in the list. */
    data: T[];

    /** Key of the item to initially scroll to when the list first renders. */
    initialScrollKey?: string | null;

    /** Ref to the underlying list instance. */
    ref: FlashListRefType<T> | FlatListRefType<T> | null;
};

function InvertedFlashList<T>({data, keyExtractor, initialScrollKey, initialScrollIndex: initialScrollIndexProp, ...restProps}: InvertedFlashListProps<T>) {
    const targetIndex = initialScrollKey == null ? -1 : data.findIndex((item, index) => keyExtractor?.(item, index) === initialScrollKey);
    const initialScrollIndexForKey = targetIndex < 0 ? undefined : targetIndex;
    const initialScrollIndex = initialScrollIndexProp ?? initialScrollIndexForKey;

    return (
        <FlashList<T>
            {...restProps}
            inverted
            data={data}
            keyExtractor={keyExtractor}
            initialScrollIndex={initialScrollIndex}
            CellRendererComponent={CellRendererComponent}
        />
    );
}

export default InvertedFlashList;
