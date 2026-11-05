import type FlatListRefType from '@components/FlashList/types';

import useRecordScrollForFrameDrops from '@hooks/useRecordScrollForFrameDrops';

import type {FlashListProps} from '@shopify/flash-list';
import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';

import React from 'react';

import FlashList from '..';
import CellRendererComponent from './CellRendererComponent';

type InvertedFlashListProps<T> = FlashListProps<T> & {
    data: T[];
    keyExtractor: (item: T, index: number) => string;

    /** Ref to the underlying list instance. */
    ref: FlatListRefType;
};

function InvertedFlashList<T>({onScroll, ...props}: InvertedFlashListProps<T>) {
    const recordScrollForFrameDrops = useRecordScrollForFrameDrops();

    const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        onScroll?.(e);
        recordScrollForFrameDrops();
    };

    return (
        <FlashList<T>
            {...props}
            inverted
            onScroll={handleScroll}
            CellRendererComponent={CellRendererComponent}
        />
    );
}

export default InvertedFlashList;
