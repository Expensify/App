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

function InvertedFlashList<T>({data, keyExtractor, initialScrollKey, ...restProps}: InvertedFlashListProps<T>) {
    const {displayedData} = useFlashListScrollKey<T>({
        data,
        keyExtractor,
        initialScrollKey,
    });

    return (
        <FlashList<T>
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            inverted
            data={displayedData}
            keyExtractor={keyExtractor}
            CellRendererComponent={CellRendererComponent}
        />
    );
}

export default InvertedFlashList;
