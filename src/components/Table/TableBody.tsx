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
    const [stickyHeaderDataReady, setStickyHeaderDataReady] = React.useState<DataType[] | null>(null);
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
        onLoad,
        renderItem,
        stickyHeaderIndices,
        ...restListProps
    } = listProps ?? {};

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
    const listData = shouldRenderStickyHeader ? [tableHeaderItem, ...filteredAndSortedData] : filteredAndSortedData;
    const getDataIndex = (index: number) => (shouldRenderStickyHeader ? index - 1 : index);
    const isTableHeaderItem = (index: number) => shouldRenderStickyHeader && index === 0;
    const canRenderStickyHeader = shouldRenderStickyHeader && isListLoaded && stickyHeaderDataReady === filteredAndSortedData;

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
        if (!shouldRenderStickyHeader || !isListLoaded) {
            return undefined;
        }

        const frame = requestAnimationFrame(() => setStickyHeaderDataReady(filteredAndSortedData));
        return () => cancelAnimationFrame(frame);
    }, [filteredAndSortedData, isListLoaded, shouldRenderStickyHeader]);

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
                ListHeaderComponent={headerComponent ?? ListHeaderComponent}
                ListEmptyComponent={isEmptyResult ? EmptyResultComponent : ListEmptyComponent}
                onLoad={handleLoad}
                stickyHeaderIndices={canRenderStickyHeader ? [0] : stickyHeaderIndices}
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
