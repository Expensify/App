import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useDebouncedAccessibilityAnnouncement from '@hooks/useDebouncedAccessibilityAnnouncement';
import useLocalize from '@hooks/useLocalize';
import useScrollEnabled from '@hooks/useScrollEnabled';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ListRenderItemInfo, ViewToken} from '@shopify/flash-list';
import type {StyleProp, ViewProps, ViewStyle} from 'react-native';

import {FlashList} from '@shopify/flash-list';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';

import type {TableData} from '.';
import type {TableListMetadata} from './buildTableListData';

import {
    buildTableListData,
    getAdjustedStickyHeaderIndices,
    getDataIndex,
    getListIndex,
    getSyntheticRowKind,
    rendersColumnHeader,
    rendersColumnHeaderAsStickyRow,
    rendersColumnHeaderInListHeader,
} from './buildTableListData';
import {getRowGroupAccessibilityProps, getTableContainerAccessibilityProps, getVirtualizedRowSemanticID, shouldUseTableSemantics} from './tableAccessibility';
import {TableRowSemanticIDContext, useTableContext} from './TableContext';

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
 * Makes the list's own scroller scroll the columns horizontally too. Must land on the internal ScrollView, which
 * renders `overflowX: 'hidden'` for a vertical list, hence `overrideProps` rather than the list's own `style`.
 */
const columnScrollOverrideStyle = {overflowX: 'auto'};

/**
 * Pins the page header and its filter bar to the scroller's left edge, so they stay put while the columns move under
 * them.
 *
 * Held at the measured table width rather than the scrolled content's: a box spanning the full scroll range has
 * nothing to be pinned within and would travel with the columns, and a percentage would resolve against that same
 * range, stretching the search input across it and pushing the pills out to its far end.
 */
const columnScrollPageHeaderStyle = {position: 'sticky', left: 0} as ViewStyle;

/**
 * Holds the column header at the top of the scroller once the page header above it has scrolled past.
 *
 * Both share one list-header box, so sticking that box at minus the page header's height lets exactly that much
 * travel off the top and leaves the column header flush. Sticking the column header alone would confine it to the box
 * and it would scroll away with it. Offsets resolve against the content container, which spans the rows, so it stays
 * put for the whole scroll. `zIndex` is needed because the rows paint later in tree order.
 */
function getColumnScrollListHeaderStyle(pageHeaderHeight: number): ViewStyle {
    return {position: 'sticky', top: -pageHeaderHeight, zIndex: 1} as ViewStyle;
}

type ViewabilityInfo = {
    viewableItems: Array<ViewToken<TableData>>;
    changed: Array<ViewToken<TableData>>;
};

function getDataViewabilityInfo(info: ViewabilityInfo, metadata: TableListMetadata): ViewabilityInfo {
    const getDataViewToken = (token: ViewToken<TableData>) => {
        if (token.index === null) {
            return token;
        }

        if (getSyntheticRowKind(token.index, metadata) !== 'data') {
            return null;
        }

        return {...token, index: getDataIndex(token.index, metadata)};
    };

    return {
        viewableItems: info.viewableItems.map(getDataViewToken).filter((token): token is ViewToken<TableData> => token !== null),
        changed: info.changed.map(getDataViewToken).filter((token): token is ViewToken<TableData> => token !== null),
    };
}

/**
 * Whether `TableBody` still renders when the table has no data rows because an empty-state or page-header list slot
 * is supplied. Single source of truth for that condition, mirrored by the early `return null` below and read by
 * `Table`.
 */
function doesBodyRenderWhenEmpty(listProps: {ListEmptyComponent?: unknown; ListHeaderComponent?: unknown} | undefined, listHeaderElement?: unknown): boolean {
    return !!listProps?.ListEmptyComponent || !!listProps?.ListHeaderComponent || !!listHeaderElement;
}

/**
 * Renders the table body using FlashList when data rows are present or a page-header search/filter has no results.
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
    const StyleUtils = useStyleUtils();
    const scrollEnabled = useScrollEnabled();
    const [isListLoaded, setIsListLoaded] = useState(false);
    const [hasActivatedStickyHeader, setHasActivatedStickyHeader] = useState(false);
    const [activeStickyHeaderIndex, setActiveStickyHeaderIndex] = useState(-1);
    // The page header is consumer content, so its height isn't known until it lays out. `0` keeps the list header
    // unstuck until then.
    const [pageHeaderHeight, setPageHeaderHeight] = useState(0);
    const {
        processedData: filteredAndSortedData,
        listProps,
        listRef,
        listContainerRef,
        trackScrollOffset,
        title,
        columns,
        selectionEnabled,
        shouldUseNarrowTableLayout,
        listHeaderElement,
        tableHeaderElement,
        emptyStateElement,
        noResultsStateElement,
        tableListMetadata,
        isEmptyResult,
        scrollWidth,
        tableWidth,
    } = useTableContext<TableData>();
    const {
        ListEmptyComponent,
        ListEmptyComponentStyle,
        ListFooterComponent,
        ListFooterComponentStyle,
        ListHeaderComponent,
        ListHeaderComponentStyle,
        contentContainerStyle: listContentContainerStyle,
        getItemType,
        initialScrollIndex,
        keyExtractor,
        onEndReached,
        onLoad,
        onChangeStickyIndex,
        onScroll,
        onStartReached,
        onViewableItemsChanged,
        overrideItemLayout,
        overrideProps,
        renderItem,
        stickyHeaderIndices,
        viewabilityConfigCallbackPairs,
        ...restListProps
    } = listProps ?? {};

    const tableBodyContentContainerStyle = useBottomSafeSafeAreaPaddingStyle({
        addBottomSafeAreaPadding: true,
        addOfflineIndicatorBottomSafeAreaPadding: true,
        style: shouldUseNarrowTableLayout ? styles.pb20 : styles.pb4,
    });
    const flattenedListContentContainerStyle = StyleSheet.flatten(listContentContainerStyle);
    const flattenedContentContainerStyle = StyleSheet.flatten(contentContainerStyle);
    const listContentContainerStyleWithoutMinHeight = flattenedListContentContainerStyle ? {...flattenedListContentContainerStyle, minHeight: undefined} : undefined;
    const contentContainerStyleWithoutMinHeight = flattenedContentContainerStyle ? {...flattenedContentContainerStyle, minHeight: undefined} : undefined;
    const contentMinHeight = flattenedContentContainerStyle?.minHeight;
    const {paddingBottom: tableBodyBottomPadding} = StyleSheet.flatten(tableBodyContentContainerStyle) ?? {};

    const shouldRenderColumnHeaderAsStickyRow = rendersColumnHeaderAsStickyRow(tableListMetadata);
    const shouldRenderColumnHeaderInListHeader = rendersColumnHeaderInListHeader(tableListMetadata);
    const hasRows = filteredAndSortedData.length > 0;
    const shouldRenderFlashList = hasRows || (tableListMetadata.hasPageHeader && isEmptyResult);

    // The columns are wider than the table, so this list's scroller takes the horizontal axis as well (see
    // `columnScrollOverrideStyle`). Only tables that keep their filter bar in the list scroll here — the rest are
    // scrolled by an ancestor (see `TableSemanticContainer`). Web-only: native can't measure text, so it never
    // content-sizes columns and its tables always fit.
    const isColumnScrollEnabled = !!scrollWidth && tableListMetadata.hasPageHeader;
    const isTableSemanticsEnabled = shouldUseTableSemantics(shouldUseNarrowTableLayout);
    const shouldApplyPageHeaderTable = isTableSemanticsEnabled && tableListMetadata.hasPageHeader && hasRows;
    const shouldApplyBodyRowGroup = isTableSemanticsEnabled && !tableListMetadata.hasPageHeader;
    const semanticTableHasHeader = rendersColumnHeader(tableListMetadata);
    const semanticColumnCount = columns.length + (selectionEnabled ? 1 : 0);
    const tableBodyAccessibilityProps = tableListMetadata.hasPageHeader
        ? getTableContainerAccessibilityProps(shouldApplyPageHeaderTable, title, filteredAndSortedData.length, semanticColumnCount, semanticTableHasHeader)
        : getRowGroupAccessibilityProps(shouldApplyBodyRowGroup);
    const currentListState = {shouldRenderFlashList, shouldRenderColumnHeaderAsStickyRow};
    const [previousListState, setPreviousListState] = useState(currentListState);
    const shouldResetListLoad = previousListState.shouldRenderFlashList !== shouldRenderFlashList;
    const shouldResetStickyHeader = previousListState.shouldRenderColumnHeaderAsStickyRow !== shouldRenderColumnHeaderAsStickyRow;

    if (shouldResetListLoad || shouldResetStickyHeader) {
        setPreviousListState(currentListState);

        if (shouldResetListLoad) {
            setIsListLoaded(false);
        }

        if (shouldResetStickyHeader) {
            setHasActivatedStickyHeader(false);
            setActiveStickyHeaderIndex(-1);
        }
    }

    useEffect(() => {
        if (!hasRows || !shouldRenderColumnHeaderAsStickyRow || !isListLoaded || hasActivatedStickyHeader) {
            return;
        }

        const frame = requestAnimationFrame(() => setHasActivatedStickyHeader(true));
        return () => cancelAnimationFrame(frame);
    }, [hasActivatedStickyHeader, hasRows, isListLoaded, shouldRenderColumnHeaderAsStickyRow]);

    const handleChangeStickyIndex: NonNullable<typeof onChangeStickyIndex> = useCallback(
        (current, previous) => {
            setActiveStickyHeaderIndex((activeIndex) => (activeIndex === current ? activeIndex : current));
            onChangeStickyIndex?.(current, previous);
        },
        [onChangeStickyIndex],
    );

    const handleViewableItemsChanged: NonNullable<typeof onViewableItemsChanged> = useCallback(
        (info) => onViewableItemsChanged?.(getDataViewabilityInfo(info, tableListMetadata)),
        [onViewableItemsChanged, tableListMetadata],
    );

    const viewabilityConfigCallbackPairsForList = useMemo(
        () =>
            viewabilityConfigCallbackPairs?.map((pair) => ({
                ...pair,
                onViewableItemsChanged: pair.onViewableItemsChanged ? (info: ViewabilityInfo) => pair.onViewableItemsChanged?.(getDataViewabilityInfo(info, tableListMetadata)) : null,
            })),
        [tableListMetadata, viewabilityConfigCallbackPairs],
    );

    const overrideItemLayoutForList: NonNullable<typeof overrideItemLayout> = useCallback(
        (layout, item, index, maxColumns, extraData) => {
            if (getSyntheticRowKind(index, tableListMetadata) !== 'data') {
                return;
            }

            overrideItemLayout?.(layout, item, getDataIndex(index, tableListMetadata), maxColumns, extraData);
        },
        [overrideItemLayout, tableListMetadata],
    );

    const initialScrollIndexForList = initialScrollIndex == null ? initialScrollIndex : getListIndex(initialScrollIndex, tableListMetadata);

    const renderListComponent = (component: typeof ListHeaderComponent | typeof ListEmptyComponent | typeof ListFooterComponent) => {
        if (!component) {
            return null;
        }

        if (React.isValidElement(component)) {
            return component;
        }

        return React.createElement(component);
    };

    const pageHeaderElement = tableListMetadata.hasPageHeader ? (
        <View
            style={isColumnScrollEnabled && [columnScrollPageHeaderStyle, tableWidth > 0 && StyleUtils.getWidthStyle(tableWidth)]}
            // Measured unconditionally, so the height is already known by the time the columns overflow and the
            // column header has to be stacked against it.
            onLayout={(event) => setPageHeaderHeight(event.nativeEvent.layout.height)}
        >
            {renderListComponent(ListHeaderComponent)}
            {listHeaderElement}
        </View>
    ) : null;

    // While the columns scroll, the column header lives in the list header rather than FlashList's sticky-row
    // overlay, so the scroller carries it sideways with the columns it labels. One copy instead of the overlay's two,
    // so there is no duplicate to hide from screen readers either.
    const listHeaderContent = shouldRenderColumnHeaderInListHeader ? (
        <>
            {pageHeaderElement}
            {tableHeaderElement}
        </>
    ) : (
        pageHeaderElement
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
        tableListMetadata.hasPageHeader && isEmptyResult ? (noResultsStateElement ?? EmptyResultComponent) : (emptyStateElement ?? renderListComponent(ListEmptyComponent));
    const footerElement = renderListComponent(ListFooterComponent);
    // Consumer footer flex growth is useful below normal rows, but inside the combined empty-state
    // footer it can expand over the page header. Preserve the remaining style while disabling growth.
    const emptyStateFooterStyle = [ListFooterComponentStyle, styles.flexGrow0];
    const emptyStateContainerStyle = [
        styles.flex1,
        styles.mnh0,
        tableListMetadata.hasPageHeader ? listContentContainerStyleWithoutMinHeight : listContentContainerStyle,
        tableListMetadata.hasPageHeader ? contentContainerStyleWithoutMinHeight : contentContainerStyle,
        !tableListMetadata.hasPageHeader &&
            shouldUseNarrowTableLayout &&
            typeof contentMinHeight === 'number' &&
            typeof tableBodyBottomPadding === 'number' && {
                minHeight: contentMinHeight + tableBodyBottomPadding,
            },
    ];

    if (!shouldRenderFlashList) {
        return (
            <View
                ref={listContainerRef}
                style={[styles.flex1, styles.mnh0, styles.flexColumn, style]}
                onLayout={onLayout}
                {...getRowGroupAccessibilityProps(shouldApplyBodyRowGroup)}
                {...props}
            >
                {pageHeaderElement}
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

    // Keep the page header in the same FlashList across rows -> no results -> rows transitions.
    // FlashList renders ListHeaderComponent outside its virtualized item collection, so controls such
    // as the search input keep their identity. The full-layout wrapper below is the semantic table ancestor;
    // keeping rows in their physical accessibility tree avoids focus/scroll jumps caused by detached aria-owns rows.
    // A truly empty table still uses the standalone centered layout above.
    const listData = buildTableListData<TableData>(filteredAndSortedData, tableListMetadata);
    const adjustedStickyHeaderIndices = getAdjustedStickyHeaderIndices(tableListMetadata, stickyHeaderIndices);
    const canRenderStickyHeader = !shouldRenderColumnHeaderAsStickyRow || (isListLoaded && hasActivatedStickyHeader);
    const isTableHeaderSticky = activeStickyHeaderIndex === tableListMetadata.stickyTableHeaderIndex;
    const shouldRenderEmptyStateInList = !hasRows && tableListMetadata.hasPageHeader;

    const handleLoad: NonNullable<typeof onLoad> = (info) => {
        setIsListLoaded(true);
        onLoad?.(info);
    };

    const renderListItem = (info: ListRenderItemInfo<TableData>) => {
        const rowKind = getSyntheticRowKind(info.index, tableListMetadata);

        switch (rowKind) {
            case 'tableHeader': {
                if (!tableHeaderElement) {
                    return null;
                }

                const isAccessibleTableHeader = info.target === (isTableHeaderSticky ? 'StickyHeader' : 'Cell');
                const isAccessibilityHidden = isTableSemanticsEnabled && !isAccessibleTableHeader;
                return React.cloneElement(tableHeaderElement, {
                    isStickyListHeader: true,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'aria-hidden': isAccessibilityHidden ? true : undefined,
                    isAccessibilityHidden,
                });
            }
            case 'data':
            default: {
                const dataIndex = getDataIndex(info.index, tableListMetadata);
                const semanticRowID = getVirtualizedRowSemanticID(isTableSemanticsEnabled, info.target);
                return (
                    <TableRowSemanticIDContext.Provider value={semanticRowID}>
                        {renderItem?.({
                            ...info,
                            index: dataIndex,
                        }) ?? null}
                    </TableRowSemanticIDContext.Provider>
                );
            }
        }
    };

    const keyExtractorForList = (item: TableData, index: number) => {
        const rowKind = getSyntheticRowKind(index, tableListMetadata);

        if (rowKind !== 'data') {
            return item.keyForList;
        }

        return keyExtractor?.(item, getDataIndex(index, tableListMetadata)) ?? item.keyForList;
    };

    const getItemTypeForList = (item: TableData, index: number, extraData: unknown) => {
        const rowKind = getSyntheticRowKind(index, tableListMetadata);

        if (rowKind !== 'data') {
            return item.keyForList;
        }

        return getItemType?.(item, getDataIndex(index, tableListMetadata), extraData);
    };

    return (
        <View
            ref={listContainerRef}
            style={[styles.flex1, styles.mnh0, style]}
            onLayout={onLayout}
            {...tableBodyAccessibilityProps}
            {...props}
        >
            <FlashList<TableData>
                ref={listRef}
                data={listData}
                style={[styles.flex1, styles.mnh0]}
                // The web scroller hides both scrollbars at once, so the vertical one has to come back to get the
                // horizontal one, the only affordance for scrolling sideways.
                showsVerticalScrollIndicator={isColumnScrollEnabled ? undefined : false}
                maintainVisibleContentPosition={{disabled: true}}
                ListHeaderComponent={listHeaderContent}
                ListHeaderComponentStyle={[
                    ListHeaderComponentStyle,
                    // An unmeasured page header leaves nothing to offset the stack by, and 0 would pin the page
                    // header itself. Better unstuck for that one layout pass.
                    pageHeaderHeight > 0 && shouldRenderColumnHeaderInListHeader && getColumnScrollListHeaderStyle(pageHeaderHeight),
                ]}
                ListEmptyComponent={shouldRenderEmptyStateInList ? emptyStateContent : ListEmptyComponent}
                ListEmptyComponentStyle={[ListEmptyComponentStyle, shouldRenderEmptyStateInList && styles.flexGrow1, shouldRenderEmptyStateInList && styles.justifyContentCenter]}
                ListFooterComponent={ListFooterComponent}
                ListFooterComponentStyle={shouldRenderEmptyStateInList ? emptyStateFooterStyle : ListFooterComponentStyle}
                onLoad={handleLoad}
                onChangeStickyIndex={handleChangeStickyIndex}
                stickyHeaderIndices={hasRows && canRenderStickyHeader ? adjustedStickyHeaderIndices : undefined}
                contentContainerStyle={[
                    listContentContainerStyle,
                    tableBodyContentContainerStyle,
                    contentContainerStyle,
                    // The rows are absolutely positioned, so they don't widen the scroller's content. This holds
                    // the scroll extent open for them.
                    isColumnScrollEnabled && StyleUtils.getMinimumWidth(scrollWidth),
                    shouldRenderEmptyStateInList && styles.flexGrow1,
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
                initialScrollIndex={initialScrollIndexForList}
                onViewableItemsChanged={hasRows && onViewableItemsChanged ? handleViewableItemsChanged : undefined}
                overrideItemLayout={overrideItemLayout ? overrideItemLayoutForList : undefined}
                viewabilityConfigCallbackPairs={hasRows ? viewabilityConfigCallbackPairsForList : undefined}
                onScroll={(event) => {
                    trackScrollOffset(event);
                    onScroll?.(event);
                }}
                {...restListProps}
                scrollEnabled={scrollEnabled}
                // Merged after the spread, so a consumer's own `overrideProps` and the table's horizontal axis
                // can't silently drop each other.
                overrideProps={isColumnScrollEnabled ? {...overrideProps, style: [overrideProps?.style, columnScrollOverrideStyle]} : overrideProps}
            />
        </View>
    );
}

function TableBody(props: TableBodyProps) {
    const {translate} = useLocalize();
    const {activeSearchString, hasActiveFilters, hasSearchString, listHeaderElement, isEmptyResult, listProps, originalDataLength, isDefaultViewEmpty} = useTableContext<TableData>();
    let emptyMessage = '';

    if (hasSearchString) {
        emptyMessage = translate('common.noResultsFoundMatching', activeSearchString);
    } else if (hasActiveFilters) {
        emptyMessage = translate('common.noResultsFound');
    }

    useDebouncedAccessibilityAnnouncement(emptyMessage, isEmptyResult, activeSearchString);

    // Keep the body mounted when a page header or list empty state must remain visible without rows.
    if ((isEmptyResult || isDefaultViewEmpty || !originalDataLength) && !doesBodyRenderWhenEmpty(listProps, listHeaderElement)) {
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
export {doesBodyRenderWhenEmpty};
