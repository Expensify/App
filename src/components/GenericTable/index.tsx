import React, {useCallback, useMemo, useState} from 'react';
import type {ListRenderItemInfo} from 'react-native';
import {FlatList, View} from 'react-native';
import type {SortOrder} from '@components/Search/types';
import SearchBar from '@components/SearchBar';
import SortableHeaderText from '@components/SelectionListWithSections/SortableHeaderText';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import FilterButtons from './FilterButtons';
import type {GenericTableProps} from './types';

/**
 * A generic table component that provides search, filter, and sort capabilities.
 * Extracted from WorkspaceCompanyCardsList and Search page patterns.
 */
function GenericTable<T>({
    data,
    columns,
    renderRow,
    keyExtractor,
    filterData,
    sortData = (d) => d,
    searchLabel,
    shouldShowSearchBar = true,
    searchItemLimit = CONST.SEARCH_ITEM_LIMIT,
    filterOptions,
    activeFilter,
    onFilterChange,
    sortBy,
    sortOrder = CONST.SEARCH.SORT_ORDER.ASC as SortOrder,
    onSortPress,
    shouldShowSorting = false,
    ListEmptyComponent,
    contentContainerStyle,
    ListHeaderComponent,
}: GenericTableProps<T>) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [searchQuery, setSearchQuery] = useState('');

    const filteredSortedData = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();

        const filtered = normalizedQuery.length > 0 ? data.filter((item) => filterData(item, normalizedQuery)) : [...data];

        return sortData(filtered);
    }, [data, searchQuery, filterData, sortData]);

    const isSearchEmpty = filteredSortedData.length === 0 && searchQuery.length > 0;
    const showSearchBar = shouldShowSearchBar && data.length > searchItemLimit;

    const handleSortPress = useCallback(
        (columnName: string, order: SortOrder) => {
            onSortPress?.(columnName, order);
        },
        [onSortPress],
    );

    const renderItem = useCallback(
        ({item, index}: ListRenderItemInfo<T>): React.ReactElement | null => {
            return renderRow(item, index);
        },
        [renderRow],
    );

    const renderListHeader = useMemo(
        () => (
            <>
                {ListHeaderComponent}

                {showSearchBar && (
                    <SearchBar
                        label={searchLabel ?? translate('common.search')}
                        inputValue={searchQuery}
                        onChangeText={setSearchQuery}
                        shouldShowEmptyState={isSearchEmpty}
                        style={styles.mt5}
                    />
                )}

                {!!filterOptions && !!activeFilter && !!onFilterChange && (
                    <FilterButtons
                        options={filterOptions}
                        activeValue={activeFilter}
                        onPress={onFilterChange}
                        style={[styles.mh5, styles.mt3]}
                    />
                )}

                {columns.length > 0 && !isSearchEmpty && (
                    <View style={[styles.flexRow, styles.appBG, styles.justifyContentBetween, styles.mh5, styles.gap5, styles.p4]}>
                        {columns.map((column) => {
                            const isActive = sortBy === column.columnName;
                            const columnText = column.translationKey ? translate(column.translationKey) : '';

                            if (shouldShowSorting && column.isSortable) {
                                return (
                                    <SortableHeaderText
                                        key={column.columnName}
                                        text={columnText}
                                        icon={column.icon}
                                        isActive={isActive}
                                        sortOrder={sortOrder}
                                        isSortable
                                        containerStyle={column.style}
                                        onPress={(order: SortOrder) => handleSortPress(column.columnName, order)}
                                    />
                                );
                            }

                            return (
                                <View
                                    key={column.columnName}
                                    style={column.style}
                                >
                                    <Text
                                        numberOfLines={1}
                                        style={styles.textMicroSupporting}
                                    >
                                        {columnText}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                )}
            </>
        ),
        [
            ListHeaderComponent,
            showSearchBar,
            searchLabel,
            searchQuery,
            isSearchEmpty,
            filterOptions,
            activeFilter,
            onFilterChange,
            shouldShowSorting,
            columns,
            sortBy,
            sortOrder,
            handleSortPress,
            styles,
            translate,
        ],
    );

    return (
        <FlatList
            contentContainerStyle={[styles.flexGrow1, contentContainerStyle]}
            data={filteredSortedData}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            ListHeaderComponent={renderListHeader}
            ListEmptyComponent={ListEmptyComponent}
            keyboardShouldPersistTaps="handled"
        />
    );
}

GenericTable.displayName = 'GenericTable';

export default GenericTable;
