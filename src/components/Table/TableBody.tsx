import {FlashList} from '@shopify/flash-list';
import type {ListRenderItemInfo} from '@shopify/flash-list';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {StyleProp, ViewProps, ViewStyle} from 'react-native';
import Text from '@components/Text';
import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useDebouncedAccessibilityAnnouncement from '@hooks/useDebouncedAccessibilityAnnouncement';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {TableData} from '.';
import {useTableContext} from './TableContext';
import TableHeader from './TableHeader';

const PAGE_HEADER_KEY = '__table_page_header__';
const TABLE_HEADER_KEY = '__table_header__';
const EMPTY_RESULT_KEY = '__table_empty_result__';
const LIST_EMPTY_KEY = '__table_empty__';

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
        shouldRenderStickyHeader,
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
    const hasPageHeader = !!ListHeaderComponent || !!headerComponent;

    // FlashList data must be DataType[], but these synthetic rows are intercepted before consumer renderItem/keyExtractor.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const pageHeaderItem = {keyForList: PAGE_HEADER_KEY} as DataType;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const tableHeaderItem = {keyForList: TABLE_HEADER_KEY} as DataType;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const emptyResultItem = {keyForList: EMPTY_RESULT_KEY} as DataType;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const listEmptyItem = {keyForList: LIST_EMPTY_KEY} as DataType;

    const syntheticRowsBeforeData = (hasPageHeader ? 1 : 0) + (shouldRenderStickyHeader ? 1 : 0);
    const stickyTableHeaderIndex = hasPageHeader ? 1 : 0;
    const shouldRenderSyntheticEmptyRow = filteredAndSortedData.length === 0 && hasPageHeader && (isEmptyResult || !!ListEmptyComponent);
    const listData = [
        ...(hasPageHeader ? [pageHeaderItem] : []),
        ...(shouldRenderStickyHeader ? [tableHeaderItem] : []),
        ...filteredAndSortedData,
        ...(shouldRenderSyntheticEmptyRow ? [isEmptyResult ? emptyResultItem : listEmptyItem] : []),
    ];
    const getDataIndex = (index: number) => index - syntheticRowsBeforeData;
    const isPageHeaderItem = (index: number) => hasPageHeader && index === 0;
    const isTableHeaderItem = (index: number) => shouldRenderStickyHeader && index === stickyTableHeaderIndex;
    const isSyntheticEmptyResultItem = (index: number) => shouldRenderSyntheticEmptyRow && isEmptyResult && index === syntheticRowsBeforeData;
    const isSyntheticListEmptyItem = (index: number) => shouldRenderSyntheticEmptyRow && !isEmptyResult && index === syntheticRowsBeforeData;
    const adjustedStickyHeaderIndices = stickyHeaderIndices?.map((index) => index + (hasPageHeader ? 1 : 0));

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

    const renderListItem = (info: ListRenderItemInfo<DataType>) => {
        if (isPageHeaderItem(info.index)) {
            return pageHeaderElement;
        }

        if (isTableHeaderItem(info.index)) {
            return <TableHeader />;
        }

        if (isSyntheticEmptyResultItem(info.index)) {
            return EmptyResultComponent;
        }

        if (isSyntheticListEmptyItem(info.index)) {
            return renderListComponent(ListEmptyComponent);
        }

        return renderItem?.({...info, index: getDataIndex(info.index)}) ?? null;
    };

    const keyExtractorForList = (item: DataType, index: number) => {
        if (isPageHeaderItem(index)) {
            return PAGE_HEADER_KEY;
        }

        if (isTableHeaderItem(index)) {
            return TABLE_HEADER_KEY;
        }

        if (isSyntheticEmptyResultItem(index)) {
            return EMPTY_RESULT_KEY;
        }

        if (isSyntheticListEmptyItem(index)) {
            return LIST_EMPTY_KEY;
        }

        return keyExtractor?.(item, getDataIndex(index)) ?? item.keyForList;
    };

    const getItemTypeForList = (item: DataType, index: number, extraData: unknown) => {
        if (isPageHeaderItem(index)) {
            return PAGE_HEADER_KEY;
        }

        if (isTableHeaderItem(index)) {
            return TABLE_HEADER_KEY;
        }

        if (isSyntheticEmptyResultItem(index)) {
            return EMPTY_RESULT_KEY;
        }

        if (isSyntheticListEmptyItem(index)) {
            return LIST_EMPTY_KEY;
        }

        return getItemType?.(item, getDataIndex(index), extraData);
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
                ListEmptyComponent={isEmptyResult ? EmptyResultComponent : ListEmptyComponent}
                stickyHeaderIndices={shouldRenderStickyHeader ? [stickyTableHeaderIndex] : adjustedStickyHeaderIndices}
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
