import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useDebouncedAccessibilityAnnouncement from '@hooks/useDebouncedAccessibilityAnnouncement';
import useLocalize from '@hooks/useLocalize';
import useScrollEnabled from '@hooks/useScrollEnabled';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ListRenderItemInfo, ViewToken} from '@shopify/flash-list';
import type {StyleProp, ViewProps, ViewStyle} from 'react-native';

import {FlashList} from '@shopify/flash-list';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';

import type {TableData} from '.';
import type {TableListMetadata} from './buildTableListData';

import {buildTableListData, getAdjustedStickyHeaderIndices, getDataIndex, getListIndex, getSyntheticRowKind} from './buildTableListData';
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
    const scrollEnabled = useScrollEnabled();
    const [isListLoaded, setIsListLoaded] = useState(false);
    const [hasActivatedStickyHeader, setHasActivatedStickyHeader] = useState(false);
    const [activeStickyHeaderIndex, setActiveStickyHeaderIndex] = useState(-1);
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
    } = useTableContext<TableData>();
    const {
        ListEmptyComponent,
        ListEmptyComponentStyle,
        ListFooterComponent,
        ListFooterComponentStyle,
        ListHeaderComponent,
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

    const shouldRenderStickyHeader = tableListMetadata.shouldRenderStickyHeader;
    const hasRows = filteredAndSortedData.length > 0;
    const shouldRenderFlashList = hasRows || (tableListMetadata.hasPageHeader && isEmptyResult);
    const isTableSemanticsEnabled = shouldUseTableSemantics(shouldUseNarrowTableLayout);
    const shouldApplyPageHeaderTable = isTableSemanticsEnabled && tableListMetadata.hasPageHeader && hasRows;
    const shouldApplyBodyRowGroup = isTableSemanticsEnabled && !tableListMetadata.hasPageHeader;
    const semanticTableHasHeader = !tableListMetadata.hasPageHeader || tableListMetadata.shouldRenderStickyHeader;
    const semanticColumnCount = columns.length + (selectionEnabled ? 1 : 0);
    const tableBodyAccessibilityProps = tableListMetadata.hasPageHeader
        ? getTableContainerAccessibilityProps(shouldApplyPageHeaderTable, title, filteredAndSortedData.length, semanticColumnCount, semanticTableHasHeader)
        : getRowGroupAccessibilityProps(shouldApplyBodyRowGroup);
    const currentListState = {shouldRenderFlashList, shouldRenderStickyHeader};
    const [previousListState, setPreviousListState] = useState(currentListState);
    const shouldResetListLoad = previousListState.shouldRenderFlashList !== shouldRenderFlashList;
    const shouldResetStickyHeader = previousListState.shouldRenderStickyHeader !== shouldRenderStickyHeader;

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
        if (!hasRows || !tableListMetadata.shouldRenderStickyHeader || !isListLoaded || hasActivatedStickyHeader) {
            return;
        }

        const frame = requestAnimationFrame(() => setHasActivatedStickyHeader(true));
        return () => cancelAnimationFrame(frame);
    }, [hasActivatedStickyHeader, hasRows, isListLoaded, tableListMetadata.shouldRenderStickyHeader]);

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
        <View>
            {renderListComponent(ListHeaderComponent)}
            {listHeaderElement}
        </View>
    ) : null;

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
    const canRenderStickyHeader = !tableListMetadata.shouldRenderStickyHeader || (isListLoaded && hasActivatedStickyHeader);
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
                showsVerticalScrollIndicator={false}
                maintainVisibleContentPosition={{disabled: true}}
                ListHeaderComponent={pageHeaderElement}
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
