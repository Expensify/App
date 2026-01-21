import React from 'react';
import FlashList from '@components/FlashList';
import type InvertedFlashListProps from './types';

// Adapted from https://github.com/facebook/react-native/blob/29a0d7c3b201318a873db0d1b62923f4ce720049/packages/virtualized-lists/Lists/VirtualizeUtils.js#L237
function defaultKeyExtractor<T>(item: T | {key: string} | {id: string}, index: number): string {
    if (item != null) {
        if (typeof item === 'object' && 'key' in item) {
            return item.key;
        }
        if (typeof item === 'object' && 'id' in item) {
            return item.id;
        }
    }
    return String(index);
}

function InvertedFlatList<T>({keyExtractor = defaultKeyExtractor, ...restProps}: InvertedFlashListProps<T>) {
    return (
        <FlashList<T>
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            inverted
            keyExtractor={keyExtractor}
        />
    );
}

export default InvertedFlatList;
