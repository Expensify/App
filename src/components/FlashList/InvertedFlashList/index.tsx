import type {FlashListProps} from '@shopify/flash-list';
import React from 'react';
import useFlashListScrollKey from '@components/FlashList/useFlashListScrollKey';
import type {FlatListRefType} from '@pages/inbox/ReportScreenContext';
import FlashList from '..';
import CellRendererComponent from './CellRendererComponent';

type InvertedFlashListProps<T> = FlashListProps<T> & {
    /** Key of the item to initially scroll to when the list first renders. */
    initialScrollKey?: string | null;

    /** The array of items to render in the list. */
    data: T[];

    /** Function that extracts a unique key for each item in the list. */
    keyExtractor: (item: T, index: number) => string;

    /** Ref to the underlying list instance. */
    ref: FlatListRefType;
};

function InvertedFlashList<T>({data, keyExtractor, initialScrollKey, onStartReached: onStartReachedProp, ...restProps}: InvertedFlashListProps<T>) {
    const {displayedData, onStartReached, maintainVisibleContentPosition} = useFlashListScrollKey<T>({
        data,
        keyExtractor,
        initialScrollKey,
        onStartReached: onStartReachedProp,
    });

    return (
        <FlashList<T>
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            inverted
            onStartReached={onStartReached}
            data={displayedData}
            keyExtractor={keyExtractor}
            CellRendererComponent={CellRendererComponent}
            maintainVisibleContentPosition={maintainVisibleContentPosition}
        />
    );
}

export default InvertedFlashList;
