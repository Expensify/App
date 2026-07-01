import {FlashList} from '@shopify/flash-list';
import type {ListRenderItemInfo} from '@shopify/flash-list';
import React, {useEffect, useRef, useState} from 'react';
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

const TABLE_HEADER_KEY = '__table_header__';

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
    const [isListLoaded, setIsListLoaded] = useState(false);
    const [hasActivatedStickyHeader, setHasActivatedStickyHeader] = useState(false);
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
        onScroll,
        onLoad,
        renderItem,
        scrollEventThrottle,
        stickyHeaderIndices,
        ...restListProps
    } = listProps ?? {};
    const hasScrollableHeader = !!headerComponent;
    const scrollOffsetYRef = useRef(0);
    const [scrollableHeaderMeasurement, setScrollableHeaderMeasurement] = useState({height: 0, isMeasured: false});
    const [hasScrolledPastScrollableHeader, setHasScrolledPastScrollableHeader] = useState(false);

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

    // FlashList data must be DataType[], but this synthetic row is intercepted before consumer renderItem/keyExtractor.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const tableHeaderItem = {keyForList: TABLE_HEADER_KEY} as DataType;
    const tableSyntheticHeaderItems = shouldRenderStickyHeader ? [tableHeaderItem] : [];
    const stickyTableHeaderIndex = 0;
    const listData = shouldRenderStickyHeader ? [...tableSyntheticHeaderItems, ...filteredAndSortedData] : filteredAndSortedData;
    const getDataIndex = (index: number) => (shouldRenderStickyHeader ? index - tableSyntheticHeaderItems.length : index);
    const isTableHeaderItem = (index: number) => shouldRenderStickyHeader && index === stickyTableHeaderIndex;
    const canRenderStickyHeader = shouldRenderStickyHeader && isListLoaded && hasActivatedStickyHeader && (!hasScrollableHeader || hasScrolledPastScrollableHeader);

    // ListHeaderComponent is outside FlashList data, so wait until that header has scrolled away before enabling the sticky data row.
    const updateScrollableHeaderScrollState = (offsetY: number, headerHeight?: number, isMeasured?: boolean) => {
        const measuredHeaderHeight = headerHeight ?? scrollableHeaderMeasurement.height;
        const isHeaderMeasured = isMeasured ?? scrollableHeaderMeasurement.isMeasured;
        const nextHasScrolledPastScrollableHeader = !hasScrollableHeader || (isHeaderMeasured && offsetY >= measuredHeaderHeight);
        setHasScrolledPastScrollableHeader((previousValue) => (previousValue === nextHasScrolledPastScrollableHeader ? previousValue : nextHasScrolledPastScrollableHeader));
    };

    const handleScrollableHeaderLayout = (event: {nativeEvent: {layout: {height: number}}}) => {
        const nextHeight = event.nativeEvent.layout.height;
        setScrollableHeaderMeasurement((previousMeasurement) => {
            if (previousMeasurement.isMeasured && previousMeasurement.height === nextHeight) {
                return previousMeasurement;
            }

            return {
                height: nextHeight,
                isMeasured: true,
            };
        });
        updateScrollableHeaderScrollState(scrollOffsetYRef.current, nextHeight, true);
    };

    const handleScroll: NonNullable<typeof onScroll> = (event) => {
        const nextOffsetY = event.nativeEvent.contentOffset.y;
        scrollOffsetYRef.current = nextOffsetY;
        updateScrollableHeaderScrollState(nextOffsetY);
        onScroll?.(event);
    };

    const listHeaderElement = headerComponent ? (
        <View
            testID="table-list-header"
            onLayout={handleScrollableHeaderLayout}
        >
            {headerComponent}
        </View>
    ) : (
        ListHeaderComponent
    );

    const renderListItem = (info: ListRenderItemInfo<DataType>) => {
        if (isTableHeaderItem(info.index)) {
            return (
                <View style={styles.appBG}>
                    <TableHeader />
                </View>
            );
        }

        return renderItem?.({...info, index: getDataIndex(info.index)}) ?? null;
    };

    const keyExtractorForList = (item: DataType, index: number) => {
        if (isTableHeaderItem(index)) {
            return TABLE_HEADER_KEY;
        }

        return keyExtractor?.(item, getDataIndex(index)) ?? item.keyForList;
    };

    const getItemTypeForList = (item: DataType, index: number, extraData: unknown) => {
        if (isTableHeaderItem(index)) {
            return TABLE_HEADER_KEY;
        }

        return getItemType?.(item, getDataIndex(index), extraData);
    };

    const handleLoad: NonNullable<typeof onLoad> = (info) => {
        setIsListLoaded(true);
        onLoad?.(info);
    };

    useEffect(() => {
        if (!shouldRenderStickyHeader || !isListLoaded || hasActivatedStickyHeader) {
            return undefined;
        }

        const frame = requestAnimationFrame(() => setHasActivatedStickyHeader(true));
        return () => cancelAnimationFrame(frame);
    }, [hasActivatedStickyHeader, isListLoaded, shouldRenderStickyHeader]);

    useEffect(() => {
        if (shouldRenderStickyHeader || !hasActivatedStickyHeader) {
            return undefined;
        }

        const frame = requestAnimationFrame(() => setHasActivatedStickyHeader(false));
        return () => cancelAnimationFrame(frame);
    }, [hasActivatedStickyHeader, shouldRenderStickyHeader]);

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
                ListHeaderComponent={listHeaderElement}
                ListEmptyComponent={isEmptyResult ? EmptyResultComponent : ListEmptyComponent}
                onLoad={handleLoad}
                onScroll={handleScroll}
                stickyHeaderIndices={canRenderStickyHeader ? [stickyTableHeaderIndex] : stickyHeaderIndices}
                scrollEventThrottle={scrollEventThrottle ?? 16}
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
