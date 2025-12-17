import React from 'react';
import {FlatList, View} from 'react-native';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {useTableContext} from './TableContext';

function TableBody<T>() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {filteredAndSortedData, originalDataLength, searchString, flatListProps} = useTableContext<T>();
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

    // Show "no results found" when search returns empty but original data exists
    const isEmptySearchResult = filteredAndSortedData.length === 0 && searchString.trim().length > 0 && originalDataLength > 0;

    const EmptySearchComponent = (
        <View style={[styles.ph5, styles.pt3, styles.pb5]}>
            <Text style={[styles.textNormal, styles.colorMuted]}>{translate('common.noResultsFoundMatching', searchString)}</Text>
        </View>
    );

    return (
        <FlatList<T>
            data={filteredAndSortedData}
            keyExtractor={defaultKeyExtractor}
            ListEmptyComponent={isEmptySearchResult ? EmptySearchComponent : ListEmptyComponent}
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
