import React from 'react';
import {FlatList} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import {useTableContext} from './TableContext';

function TableBody<T>() {
    const styles = useThemeStyles();
    const {filteredAndSortedData, flatListProps} = useTableContext<T>();
    const {keyExtractor, ListEmptyComponent, contentContainerStyle, onScroll, onEndReached, onEndReachedThreshold} = flatListProps ?? {};

    const defaultKeyExtractor = (item: T, index: number): string => {
        if (keyExtractor) {
            return keyExtractor(item, index);
        }

        // Try to extract a key from common object properties
        if (typeof item === 'object' && item !== null) {
            const obj = item as Record<string, unknown>;
            if ('id' in obj && typeof obj.id === 'string') {
                return obj.id;
            }
            if ('key' in obj && typeof obj.key === 'string') {
                return obj.key;
            }
        }

        return `item-${index}`;
    };

    return (
        <FlatList<T>
            data={filteredAndSortedData}
            keyExtractor={defaultKeyExtractor}
            ListEmptyComponent={ListEmptyComponent}
            contentContainerStyle={[contentContainerStyle, filteredAndSortedData.length === 0 && styles.flex1]}
            onScroll={onScroll}
            onEndReached={onEndReached}
            onEndReachedThreshold={onEndReachedThreshold}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...flatListProps}
        />
    );
}

TableBody.displayName = 'TableBody';

export default TableBody;
