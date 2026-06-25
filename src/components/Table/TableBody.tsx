import {FlashList} from '@shopify/flash-list';
import type {ListRenderItemInfo} from '@shopify/flash-list';
import React from 'react';
import {View} from 'react-native';
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
    const [isListLoaded, setIsListLoaded] = React.useState(false);
    const [hasActivatedStickyHeader, setHasActivatedStickyHeader] = React.useState(false);
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
    const listHeaderComponent = headerComponent ?? ListHeaderComponent;
    const hasListHeaderComponent = !!listHeaderComponent;
    const scrollOffsetYRef = React.useRef(0);
    const [listHeaderMeasurement, setListHeaderMeasurement] = React.useState({height: 0, isMeasured: false});
    const [hasScrolledPastListHeader, setHasScrolledPastListHeader] = React.useState(false);

    const tableBodyContentContainerStyle = useBottomSafeSafeAreaPaddingStyle({
        addBottomSafeAreaPadding: true,
        addOfflineIndicatorBottomSafeAreaPadding: true,
        style: shouldUseNarrowTableLayout ? styles.pb20 : styles.pb4,
    });

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

    // Synthetic sentinel row used only to render the sticky table header; it is never passed to renderItem as real data.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const tableHeaderItem = {keyForList: TABLE_HEADER_KEY} as DataType;
    const tableSyntheticHeaderItems = shouldRenderStickyHeader ? [tableHeaderItem] : [];
    const stickyTableHeaderIndex = 0;
    const listData = shouldRenderStickyHeader ? [...tableSyntheticHeaderItems, ...filteredAndSortedData] : filteredAndSortedData;
    const getDataIndex = (index: number) => (shouldRenderStickyHeader ? index - tableSyntheticHeaderItems.length : index);
    const isTableHeaderItem = (index: number) => shouldRenderStickyHeader && index === stickyTableHeaderIndex;
    const canRenderStickyHeader = shouldRenderStickyHeader && isListLoaded && hasActivatedStickyHeader && (!hasListHeaderComponent || hasScrolledPastListHeader);

    const updateListHeaderScrollState = (offsetY: number, headerHeight?: number, isMeasured?: boolean) => {
        const measuredHeaderHeight = headerHeight ?? listHeaderMeasurement.height;
        const isHeaderMeasured = isMeasured ?? listHeaderMeasurement.isMeasured;
        const nextHasScrolledPastListHeader = !hasListHeaderComponent || (isHeaderMeasured && offsetY >= measuredHeaderHeight);
        setHasScrolledPastListHeader((previousValue) => (previousValue === nextHasScrolledPastListHeader ? previousValue : nextHasScrolledPastListHeader));
    };

    const handleListHeaderLayout = (event: {nativeEvent: {layout: {height: number}}}) => {
        const nextHeight = event.nativeEvent.layout.height;
        setListHeaderMeasurement((previousMeasurement) => {
            if (previousMeasurement.isMeasured && previousMeasurement.height === nextHeight) {
                return previousMeasurement;
            }

            return {
                height: nextHeight,
                isMeasured: true,
            };
        });
        updateListHeaderScrollState(scrollOffsetYRef.current, nextHeight, true);
    };

    const handleScroll: NonNullable<typeof onScroll> = (event) => {
        const nextOffsetY = event.nativeEvent.contentOffset.y;
        scrollOffsetYRef.current = nextOffsetY;
        updateListHeaderScrollState(nextOffsetY);
        onScroll?.(event);
    };

    let listHeader: React.ReactElement | undefined;
    if (React.isValidElement(listHeaderComponent)) {
        listHeader = listHeaderComponent;
    } else if (listHeaderComponent) {
        listHeader = React.createElement(listHeaderComponent as React.ComponentType);
    }
    const listHeaderElement = listHeader ? (
        <View
            testID="table-list-header"
            onLayout={handleListHeaderLayout}
        >
            {listHeader}
        </View>
    ) : undefined;

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

    React.useEffect(() => {
        if (!shouldRenderStickyHeader || !isListLoaded || hasActivatedStickyHeader) {
            return undefined;
        }

        const frame = requestAnimationFrame(() => setHasActivatedStickyHeader(true));
        return () => cancelAnimationFrame(frame);
    }, [hasActivatedStickyHeader, isListLoaded, shouldRenderStickyHeader]);

    React.useEffect(() => {
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
                contentContainerStyle={[filteredAndSortedData.length === 0 && styles.flexGrow1, listContentContainerStyle, tableBodyContentContainerStyle, contentContainerStyle]}
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
