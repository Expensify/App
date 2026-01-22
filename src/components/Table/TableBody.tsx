import {FlashList} from '@shopify/flash-list';
import React from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewProps, ViewStyle} from 'react-native';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {useTableContext} from './TableContext';

/**
 * Props for the TableBody component.
 */
type TableBodyProps = ViewProps & {
    /** Optional custom styles for the FlashList content container. */
    contentContainerStyle?: StyleProp<ViewStyle>;
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
function TableBody<T>({contentContainerStyle, ...props}: TableBodyProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {processedData: filteredAndSortedData, activeSearchString, listProps, hasActiveFilters, hasSearchString, isEmptyResult} = useTableContext<T>();
    const {ListEmptyComponent, contentContainerStyle: listContentContainerStyle, ...restListProps} = listProps ?? {};

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

    const EmptyResultComponent = (
        <View style={[styles.ph5, styles.pt3, styles.pb5]}>
            <Text style={[styles.textNormal, styles.colorMuted]}>{message}</Text>
        </View>
    );

    return (
        <View
            style={styles.flex1}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        >
            <FlashList<T>
                data={filteredAndSortedData}
                ListEmptyComponent={isEmptyResult ? EmptyResultComponent : ListEmptyComponent}
                contentContainerStyle={[filteredAndSortedData.length === 0 && styles.flex1, listContentContainerStyle, contentContainerStyle]}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...restListProps}
            />
        </View>
    );
}

export default TableBody;
