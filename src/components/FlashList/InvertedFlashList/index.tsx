import type {FlashListProps} from '@shopify/flash-list';
import React from 'react';
import type {FlatListRefType} from '@pages/inbox/ReportScreenContext';
import FlashList from '..';
import CellRendererComponent from './CellRendererComponent';

type InvertedFlashListProps<T> = FlashListProps<T> & {
    /** The array of items to render in the list. */
    data: T[];

    /** Function that extracts a unique key for each item in the list. */
    keyExtractor: (item: T, index: number) => string;

    /** Ref to the underlying list instance. */
    ref: FlatListRefType;

    /** Whether the list should handle `maintainVisibleContentPosition` */
    shouldMaintainVisibleContentPosition?: boolean;
};

function InvertedFlashList<T>({maintainVisibleContentPosition: maintainVisibleContentPositionProp, shouldMaintainVisibleContentPosition, ...restProps}: InvertedFlashListProps<T>) {
    const maintainVisibleContentPosition = maintainVisibleContentPositionProp
        ? {disabled: !shouldMaintainVisibleContentPosition, ...maintainVisibleContentPositionProp}
        : {disabled: !shouldMaintainVisibleContentPosition};

    return (
        <FlashList<T>
            {...restProps}
            inverted
            CellRendererComponent={CellRendererComponent}
            maintainVisibleContentPosition={maintainVisibleContentPosition}
        />
    );
}

export default InvertedFlashList;
