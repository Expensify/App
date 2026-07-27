import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useDebouncedAccessibilityAnnouncement from '@hooks/useDebouncedAccessibilityAnnouncement';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ListRenderItemInfo} from '@shopify/flash-list';
import type {StyleProp, ViewProps, ViewStyle} from 'react-native';

import {FlashList} from '@shopify/flash-list';
import React, {useEffect, useState} from 'react';
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

type TableBodyListProps = TableBodyProps & {
    /** Message shown when the filtered table is empty. */
    emptyMessage: string;
};

/**
 * Renders the table body using FlashList when data rows or a scrolling page header are present.
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
function TableBodyList({contentContainerStyle, emptyMessage, onLayout, style, ...props}: TableBodyListProps) {
    const styles = useThemeStyles();
    const [isListLoaded, setIsListLoaded] = useState(false);
    const [hasActivatedStickyHeader, setHasActivatedStickyHeader] = useState(false);
    const {
        processedData: filteredAndSortedData,
        listProps,
        listRef,
        listContainerRef,
        trackScrollOffset,
        shouldUseNarrowTableLayout,
        headerComponent,
        emptyStateElement,
        noResultsStateElement,
        tableListMetadata,
    } = useTableContext<TableData>();
    const {
        ListEmptyComponent,
        ListFooterComponent,
        ListFooterComponentStyle,
        ListHeaderComponent,
        contentContainerStyle: listContentContainerStyle,
        getItemType,
        keyExtractor,
        onEndReached,
        onLoad,
        onScroll,
        onStartReached,
        onViewableItemsChanged,
        renderItem,
        stickyHeaderIndices,
        ...restListProps
    } = listProps ?? {};

    const tableBodyContentContainerStyle = useBottomSafeSafeAreaPaddingStyle({
        addBottomSafeAreaPadding: true,
        addOfflineIndicatorBottomSafeAreaPadding: true,
        style: shouldUseNarrowTableLayout ? styles.pb20 : styles.pb4,
    });
    const flattenedContentContainerStyle = StyleSheet.flatten(contentContainerStyle);
    const contentMinHeight = flattenedContentContainerStyle?.minHeight;
    const {paddingBottom: tableBodyBottomPadding} = StyleSheet.flatten(tableBodyContentContainerStyle) ?? {};

    const shouldRenderStickyHeader = tableListMetadata.shouldRenderStickyHeader;
    const hasRows = filteredAndSortedData.length > 0;
    const [previousHasRows, setPreviousHasRows] = useState(hasRows);
    if (previousHasRows !== hasRows) {
        setPreviousHasRows(hasRows);
        // A table with a page header keeps the same FlashList mounted while its rows change.
        // Tables without one still replace the list with the standalone empty layout.
        if (!tableListMetadata.hasPageHeader) {
            setIsListLoaded(false);
        }
        setHasActivatedStickyHeader(false);
    }

    const [previousShouldRenderStickyHeader, setPreviousShouldRenderStickyHeader] = useState(shouldRenderStickyHeader);
    if (previousShouldRenderStickyHeader !== shouldRenderStickyHeader) {
        setPreviousShouldRenderStickyHeader(shouldRenderStickyHeader);
        setHasActivatedStickyHeader(false);
    }

    useEffect(() => {
        if (!hasRows || !tableListMetadata.shouldRenderStickyHeader || !isListLoaded || hasActivatedStickyHeader) {
            return undefined;
        }

        const frame = requestAnimationFrame(() => setHasActivatedStickyHeader(true));
        return () => cancelAnimationFrame(frame);
    }, [hasActivatedStickyHeader, hasRows, isListLoaded, tableListMetadata.shouldRenderStickyHeader]);

    const renderListComponent = (component: typeof ListHeaderComponent | typeof ListEmptyComponent | typeof ListFooterComponent) => {
        if (!component) {
            return null;
        }

        if (React.isValidElement(component)) {
            return component;
        }

        return React.createElement(component);
    };

    const pageHeaderElement = (
        <View>
            {renderListComponent(ListHeaderComponent)}
            {headerComponent}
        </View>
    );

    const EmptyResultComponent = (
        <View style={[styles.ph5, styles.pt3, styles.pb5]}>
            <Text
                style={[styles.textNormal, styles.colorMuted]}
                aria-hidden
            >
                {emptyMessage}
            </Text>
        </View>
    );

    const emptyStateContent =
        tableListMetadata.hasPageHeader && tableListMetadata.isEmptyResult ? (noResultsStateElement ?? EmptyResultComponent) : (emptyStateElement ?? renderListComponent(ListEmptyComponent));
    const footerElement = renderListComponent(ListFooterComponent);
    // Consumer footer flex growth is useful below normal rows, but inside the combined empty-state
    // footer it can expand over the page header. Preserve the remaining style while disabling growth.
    const emptyStateFooterStyle = [ListFooterComponentStyle, styles.flexGrow0];
    const emptyStateContainerStyle = [
        styles.flex1,
        styles.mnh0,
        listContentContainerStyle,
        contentContainerStyle,
        shouldUseNarrowTableLayout &&
            typeof contentMinHeight === 'number' &&
            typeof tableBodyBottomPadding === 'number' && {
                minHeight: contentMinHeight + tableBodyBottomPadding,
            },
    ];

    if (!hasRows && !tableListMetadata.hasPageHeader) {
        return (
            <View
                ref={listContainerRef}
                style={[styles.flex1, styles.mnh0, styles.flexColumn, style]}
                onLayout={onLayout}
                {...props}
            >
                <View style={emptyStateContainerStyle}>
                    {/* Keep empty content centered when it fits, but let it scroll when the keyboard
                    or a short viewport leaves less space than the empty card needs. */}
                    <ScrollView
                        testID="table-empty-state-scroll-view"
                        style={[styles.flex1, styles.mnh0]}
                        contentContainerStyle={[styles.flexGrow1, tableBodyContentContainerStyle]}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={[styles.flexGrow1, styles.justifyContentCenter]}>{emptyStateContent}</View>
                        {!!footerElement && <View style={emptyStateFooterStyle}>{footerElement}</View>}
                    </ScrollView>
                </View>
            </View>
        );
    }

    // Keep the page-header row in one FlashList across rows -> no results -> rows transitions.
    // Empty content follows it in the natural footer flow instead of becoming a recycled cell or
    // remounting controls such as the search input. The footer must not flex-grow: FlashList lays
    // footer cells independently, and growing one can visually cover the page-header row on native.
    const renderedTableListMetadata = hasRows
        ? tableListMetadata
        : {
              ...tableListMetadata,
              shouldRenderStickyHeader: false,
              syntheticRowsBeforeData: 1,
              listDataRowOffset: 1,
          };
    const listData = buildTableListData<TableData>(filteredAndSortedData, renderedTableListMetadata);
    const adjustedStickyHeaderIndices = getAdjustedStickyHeaderIndices(renderedTableListMetadata, stickyHeaderIndices);
    const canRenderStickyHeader = !renderedTableListMetadata.shouldRenderStickyHeader || (isListLoaded && hasActivatedStickyHeader);
    const shouldRenderEmptyStateInFooter = !hasRows && tableListMetadata.hasPageHeader;
    const emptyStateListFooter = (
        <View>
            <View>{emptyStateContent}</View>
            {!!footerElement && <View style={emptyStateFooterStyle}>{footerElement}</View>}
        </View>
    );

    const handleLoad: NonNullable<typeof onLoad> = (info) => {
        setIsListLoaded(true);
        onLoad?.(info);
    };

    const renderListItem = (info: ListRenderItemInfo<TableData>) => {
        const rowKind = getSyntheticRowKind(info.index, renderedTableListMetadata);

        switch (rowKind) {
            case 'pageHeader':
                return pageHeaderElement;
            case 'tableHeader':
                return <TableHeader isStickyListHeader />;
            case 'data':
            default:
                return (
                    renderItem?.({
                        ...info,
                        index: getDataIndex(info.index, renderedTableListMetadata),
                    }) ?? null
                );
        }
    };

    const keyExtractorForList = (item: TableData, index: number) => {
        const rowKind = getSyntheticRowKind(index, renderedTableListMetadata);

        if (rowKind !== 'data') {
            return item.keyForList;
        }

        return keyExtractor?.(item, getDataIndex(index, renderedTableListMetadata)) ?? item.keyForList;
    };

    const getItemTypeForList = (item: TableData, index: number, extraData: unknown) => {
        const rowKind = getSyntheticRowKind(index, renderedTableListMetadata);

        if (rowKind !== 'data') {
            return item.keyForList;
        }

        return getItemType?.(item, getDataIndex(index, renderedTableListMetadata), extraData);
    };

    return (
        <View
            ref={listContainerRef}
            style={[styles.flex1, styles.mnh0, style]}
            onLayout={onLayout}
            {...props}
        >
            <FlashList<TableData>
                ref={listRef}
                data={listData}
                style={[styles.flex1, styles.mnh0]}
                showsVerticalScrollIndicator={false}
                maintainVisibleContentPosition={{disabled: true}}
                ListEmptyComponent={ListEmptyComponent}
                ListFooterComponent={shouldRenderEmptyStateInFooter ? emptyStateListFooter : ListFooterComponent}
                ListFooterComponentStyle={shouldRenderEmptyStateInFooter ? undefined : ListFooterComponentStyle}
                onLoad={handleLoad}
                stickyHeaderIndices={hasRows && canRenderStickyHeader ? adjustedStickyHeaderIndices : undefined}
                contentContainerStyle={[
                    listContentContainerStyle,
                    tableBodyContentContainerStyle,
                    contentContainerStyle,
                    shouldUseNarrowTableLayout &&
                        typeof contentMinHeight === 'number' &&
                        typeof tableBodyBottomPadding === 'number' && {
                            minHeight: contentMinHeight + tableBodyBottomPadding,
                        },
                ]}
                keyboardShouldPersistTaps="handled"
                renderItem={renderListItem}
                keyExtractor={keyExtractorForList}
                getItemType={getItemTypeForList}
                onEndReached={hasRows ? onEndReached : undefined}
                onStartReached={hasRows ? onStartReached : undefined}
                onViewableItemsChanged={hasRows ? onViewableItemsChanged : undefined}
                onScroll={(event) => {
                    trackScrollOffset(event);
                    onScroll?.(event);
                }}
                {...restListProps}
            />
        </View>
    );
}

function TableBody(props: TableBodyProps) {
    const {translate} = useLocalize();
    const {activeSearchString, hasActiveFilters, hasSearchString, isEmptyResult, listProps, originalDataLength, tableListMetadata} = useTableContext<TableData>();
    const {ListEmptyComponent} = listProps ?? {};
    let emptyMessage = '';

    if (hasSearchString) {
        emptyMessage = translate('common.noResultsFoundMatching', activeSearchString);
    } else if (hasActiveFilters) {
        emptyMessage = translate('common.noResultsFound');
    }

    useDebouncedAccessibilityAnnouncement(emptyMessage, isEmptyResult, activeSearchString);

    // Tables without a scrolling page header keep the default contract: an empty table renders
    // nothing here so the declarative Table.EmptyState/Table.NoResultsState siblings take over.
    // With a page header (or a ListEmptyComponent) the body must stay mounted even when empty,
    // otherwise the header (tabs, buttons, search) or the empty view would disappear with the rows.
    if (!tableListMetadata.hasPageHeader && (isEmptyResult || !originalDataLength) && !ListEmptyComponent) {
        return null;
    }

    return (
        <TableBodyList
            emptyMessage={emptyMessage}
            {...props}
        />
    );
}

export default TableBody;
