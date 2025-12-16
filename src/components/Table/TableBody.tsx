import React from 'react';
import type {FlatListProps, StyleProp, ViewStyle} from 'react-native';
import {FlatList, View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import {useTableContext} from './TableContext';

type TableBodyProps<T> = {
    renderItem: (item: T, index: number) => React.ReactNode;
    keyExtractor?: (item: T, index: number) => string;
    ListEmptyComponent?: React.ComponentType | React.ReactElement | null;
    contentContainerStyle?: StyleProp<ViewStyle>;
    onScroll?: FlatListProps<T>['onScroll'];
    onEndReached?: FlatListProps<T>['onEndReached'];
    onEndReachedThreshold?: number;
    // Allow other FlatList props to be passed through
    [key: string]: unknown;
};

function TableBody<T>({renderItem, keyExtractor, ListEmptyComponent, contentContainerStyle, onScroll, onEndReached, onEndReachedThreshold, ...flatListProps}: TableBodyProps<T>) {
    const styles = useThemeStyles();
    const {filteredAndSortedData} = useTableContext<T>();

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

    const renderItemWithIndex = ({item, index}: {item: T; index: number}) => {
        return <>{renderItem(item, index)}</>;
    };

    return (
        <FlatList
            data={filteredAndSortedData}
            renderItem={renderItemWithIndex}
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
