import Text from '@components/Text';

import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useDebouncedAccessibilityAnnouncement from '@hooks/useDebouncedAccessibilityAnnouncement';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ListRenderItemInfo} from '@shopify/flash-list';
import type {StyleProp, ViewProps, ViewStyle} from 'react-native';

import {FlashList} from '@shopify/flash-list';
import React from 'react';
import {StyleSheet, View} from 'react-native';

import type {TableData} from '.';

import {buildTableListData, getAdjustedStickyHeaderIndices, getDataIndex, getSyntheticRowKind} from './buildTableListData';
import {useTableContext} from './TableContext';
import TableHeader from './TableHeader';

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
function TableBody<DataType extends TableData>({contentContainerStyle, style, ...props}: TableBodyProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {
        processedData: filteredAndSortedData,
        activeSearchString,
        listProps,
        listRef,
        shouldUseNarrowTableLayout,
        hasActiveFilters,
        hasSearchString,
        headerComponent,
        isEmptyResult,
        tableListMetadata,
    } = useTableContext<DataType>();
    const {
        ListEmptyComponent,
        ListHeaderComponent,
        contentContainerStyle: listContentContainerStyle,
        getItemType,
        keyExtractor,
        renderItem,
        stickyHeaderIndices,
        ...restListProps
    } = listProps ?? {};

    const tableBodyContentContainerStyle = useBottomSafeSafeAreaPaddingStyle({
        addBottomSafeAreaPadding: true,
        addOfflineIndicatorBottomSafeAreaPadding: true,
        style: shouldUseNarrowTableLayout ? styles.pb20 : styles.pb4,
    });
    const {minHeight: contentMinHeight} = StyleSheet.flatten(contentContainerStyle) ?? {};
    const {paddingBottom: tableBodyBottomPadding} = StyleSheet.flatten(tableBodyContentContainerStyle) ?? {};

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

    const renderListComponent = (component: typeof ListHeaderComponent | typeof ListEmptyComponent) => {
        if (!component) {
            return null;
        }

        if (React.isValidElement(component)) {
            return component;
        }

        return React.createElement(component);
    };

    const pageHeaderElement = (
        <>
            {renderListComponent(ListHeaderComponent)}
            {headerComponent}
        </>
    );
    const listData = buildTableListData<DataType>(filteredAndSortedData, tableListMetadata);
    const adjustedStickyHeaderIndices = getAdjustedStickyHeaderIndices(tableListMetadata, stickyHeaderIndices);

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
    let listEmptyComponent = ListEmptyComponent;
    if (tableListMetadata.shouldRenderSyntheticEmptyRow) {
        listEmptyComponent = undefined;
    } else if (isEmptyResult) {
        listEmptyComponent = EmptyResultComponent;
    }

    const renderListItem = (info: ListRenderItemInfo<DataType>) => {
        const rowKind = getSyntheticRowKind(info.index, tableListMetadata);

        switch (rowKind) {
            case 'pageHeader':
                return pageHeaderElement;
            case 'tableHeader':
                return <TableHeader isStickyListHeader />;
            case 'emptyResult':
                return EmptyResultComponent;
            case 'listEmpty':
                return renderListComponent(ListEmptyComponent);
            case 'data':
            default:
                return renderItem?.({...info, index: getDataIndex(info.index, tableListMetadata)}) ?? null;
        }
    };

    const keyExtractorForList = (item: DataType, index: number) => {
        const rowKind = getSyntheticRowKind(index, tableListMetadata);

        if (rowKind !== 'data') {
            return item.keyForList;
        }

        return keyExtractor?.(item, getDataIndex(index, tableListMetadata)) ?? item.keyForList;
    };

    const getItemTypeForList = (item: DataType, index: number, extraData: unknown) => {
        const rowKind = getSyntheticRowKind(index, tableListMetadata);

        if (rowKind !== 'data') {
            return item.keyForList;
        }

        return getItemType?.(item, getDataIndex(index, tableListMetadata), extraData);
    };

    return (
        <View
            style={[styles.flex1, styles.mnh0, style]}
            {...props}
        >
            <FlashList<DataType>
                ref={listRef}
                data={listData}
                style={[styles.flex1, styles.mnh0]}
                showsVerticalScrollIndicator={false}
                maintainVisibleContentPosition={{disabled: true}}
                ListEmptyComponent={listEmptyComponent}
                stickyHeaderIndices={adjustedStickyHeaderIndices}
                contentContainerStyle={[
                    filteredAndSortedData.length === 0 && styles.flexGrow1,
                    listContentContainerStyle,
                    tableBodyContentContainerStyle,
                    contentContainerStyle,
                    shouldUseNarrowTableLayout &&
                        typeof contentMinHeight === 'number' &&
                        typeof tableBodyBottomPadding === 'number' && {minHeight: contentMinHeight + tableBodyBottomPadding},
                ]}
                keyboardShouldPersistTaps="handled"
                renderItem={renderListItem}
                keyExtractor={keyExtractorForList}
                getItemType={getItemTypeForList}
                {...restListProps}
            />
        </View>
    );
}

export default TableBody;
