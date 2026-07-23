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
 * Renders the table body using FlashList when data rows are present.
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
        ListHeaderComponent,
        contentContainerStyle: listContentContainerStyle,
        getItemType,
        keyExtractor,
        onLoad,
        onScroll,
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

    const shouldRenderStickyHeader = tableListMetadata.shouldRenderStickyHeader;
    const [previousShouldRenderStickyHeader, setPreviousShouldRenderStickyHeader] = useState(shouldRenderStickyHeader);
    if (previousShouldRenderStickyHeader !== shouldRenderStickyHeader) {
        setPreviousShouldRenderStickyHeader(shouldRenderStickyHeader);
        setHasActivatedStickyHeader(false);
    }

    useEffect(() => {
        if (!filteredAndSortedData.length) {
            setIsListLoaded(false);
            setHasActivatedStickyHeader(false);
        }
    }, [filteredAndSortedData.length]);

    useEffect(() => {
        if (!tableListMetadata.shouldRenderStickyHeader || !isListLoaded || hasActivatedStickyHeader) {
            return undefined;
        }

        const frame = requestAnimationFrame(() => setHasActivatedStickyHeader(true));
        return () => cancelAnimationFrame(frame);
    }, [hasActivatedStickyHeader, isListLoaded, tableListMetadata.shouldRenderStickyHeader]);

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
    const emptyStateContainerStyle = [
        styles.flex1,
        styles.justifyContentCenter,
        listContentContainerStyle,
        tableBodyContentContainerStyle,
        contentContainerStyle,
        shouldUseNarrowTableLayout &&
            typeof contentMinHeight === 'number' &&
            typeof tableBodyBottomPadding === 'number' && {
                minHeight: contentMinHeight + tableBodyBottomPadding,
            },
    ];

    if (!filteredAndSortedData.length) {
        return (
            <View
                ref={listContainerRef}
                style={[styles.flex1, styles.mnh0, styles.flexColumn, style]}
                onLayout={onLayout}
                {...props}
            >
                {tableListMetadata.hasPageHeader && pageHeaderElement}
                <View style={emptyStateContainerStyle}>{emptyStateContent}</View>
            </View>
        );
    }

    const listData = buildTableListData<TableData>(filteredAndSortedData, tableListMetadata);
    const adjustedStickyHeaderIndices = getAdjustedStickyHeaderIndices(tableListMetadata, stickyHeaderIndices);
    const canRenderStickyHeader = !tableListMetadata.shouldRenderStickyHeader || (isListLoaded && hasActivatedStickyHeader);

    const handleLoad: NonNullable<typeof onLoad> = (info) => {
        setIsListLoaded(true);
        onLoad?.(info);
    };

    const renderListItem = (info: ListRenderItemInfo<TableData>) => {
        const rowKind = getSyntheticRowKind(info.index, tableListMetadata);

        switch (rowKind) {
            case 'pageHeader':
                return pageHeaderElement;
            case 'tableHeader':
                return <TableHeader isStickyListHeader />;
            case 'emptyResult':
                return noResultsStateElement ?? EmptyResultComponent;
            case 'listEmpty':
                return emptyStateElement ?? renderListComponent(ListEmptyComponent);
            case 'data':
            default:
                return renderItem?.({...info, index: getDataIndex(info.index, tableListMetadata)}) ?? null;
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
            {...props}
        >
            <FlashList<TableData>
                ref={listRef}
                data={listData}
                style={[styles.flex1, styles.mnh0]}
                showsVerticalScrollIndicator={false}
                maintainVisibleContentPosition={{disabled: true}}
                ListEmptyComponent={ListEmptyComponent}
                onLoad={handleLoad}
                stickyHeaderIndices={canRenderStickyHeader ? adjustedStickyHeaderIndices : undefined}
                contentContainerStyle={[
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
