import {FlashList} from '@shopify/flash-list';
import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useDebouncedAccessibilityAnnouncement from '@hooks/useDebouncedAccessibilityAnnouncement';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {SharedListProps, TableValue} from './types';

/**
 * Props for the TableBody component.
 */
type TableBodyProps<DataType, ColumnKey extends string = string, FilterKey extends string = string> = SharedListProps<DataType> & {
    table: TableValue<DataType, ColumnKey, FilterKey>;
};

/**
 * Renders the table body using FlashList.
 *
 * This component consumes the Table context to access processed data and FlashList props.
 * It automatically handles empty states, including a special "no results found" message
 * when search returns no results but original data exists.
 *
 * @template T - The type of items in the table's data array.
 *
 * @example
 * ```tsx
 * <Table data={items} columns={columns} renderItem={renderItem}>
 *   <Table.Body />
 * </Table>
 * ```
 *
 * @example With custom empty component
 * ```tsx
 * <Table
 *   data={items}
 *   columns={columns}
 *   renderItem={renderItem}
 *   ListEmptyComponent={<CustomEmptyState />}
 * >
 *   <Table.Body />
 * </Table>
 * ```
 */
function TableBody<DataType, ColumnKey extends string = string, FilterKey extends string = string>({
    table,
    contentContainerStyle,
    ListEmptyComponent,
    ...props
}: TableBodyProps<DataType, ColumnKey, FilterKey>) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {processedData: filteredAndSortedData, activeSearchString, hasActiveFilters, hasSearchString, isEmptyResult} = table;

    // Determine the message based on what caused the empty result
    const getEmptyMessage = () => {
        if (hasSearchString) {
            return translate('common.noResultsFoundMatching', activeSearchString);
        }
        if (hasActiveFilters) {
            return translate('common.noResultsFound');
        }
        return '';
    };

    const message = getEmptyMessage();

    useDebouncedAccessibilityAnnouncement(message, isEmptyResult, activeSearchString);

    const EmptyResultComponent = (
        <View style={[styles.ph5, styles.pt3, styles.pb5]}>
            <Text
                style={[styles.textNormal, styles.colorMuted]}
                aria-hidden
            >
                {message}
            </Text>
        </View>
    );

    return (
        <FlashList<DataType>
            data={filteredAndSortedData}
            ListEmptyComponent={isEmptyResult ? EmptyResultComponent : ListEmptyComponent}
            contentContainerStyle={[filteredAndSortedData.length === 0 && styles.flex1, contentContainerStyle]}
            keyboardShouldPersistTaps="handled"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

export default TableBody;
