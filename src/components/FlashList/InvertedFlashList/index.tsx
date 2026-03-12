import type {FlashListProps} from '@shopify/flash-list';
import React from 'react';
import FlashList from '..';
import CellRendererComponent from './CellRendererComponent';

function InvertedFlashList<T>(props: FlashListProps<T>) {
    return (
        <FlashList<T>
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            inverted
            CellRendererComponent={CellRendererComponent}
        />
    );
}

export default InvertedFlashList;
