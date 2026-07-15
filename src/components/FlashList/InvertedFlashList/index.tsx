import type {CustomFlashListProps} from '@components/FlashList/types';

import React from 'react';

import FlashList from '..';
import CellRendererComponent from './CellRendererComponent';

function InvertedFlashList<T>(props: CustomFlashListProps<T>) {
    return (
        <FlashList<T>
            {...props}
            inverted
            CellRendererComponent={CellRendererComponent}
        />
    );
}

export default InvertedFlashList;
