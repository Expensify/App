import type {FlashListProps} from '@shopify/flash-list';
import React from 'react';
import useFlashListScrollKey from '@components/FlashList/useFlashListScrollKey';
import type {FlatListRefType} from '@pages/inbox/ReportScreenContext';
import FlashList from '..';
import CellRendererComponent from './CellRendererComponent';

type InvertedFlashListProps<T> = FlashListProps<T> & {
    initialScrollKey?: string | null;
    data: T[];
    keyExtractor: (item: T, index: number) => string;
    ref: FlatListRefType;
};

function InvertedFlashList<T>({data, keyExtractor, initialScrollKey, onStartReached: onStartReachedProp, ...restProps}: InvertedFlashListProps<T>) {
    const {displayedData, onStartReached} = useFlashListScrollKey<T>({
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
        />
    );
}

export default InvertedFlashList;
