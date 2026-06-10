import {FlashList} from '@shopify/flash-list';
import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewProps, ViewStyle} from 'react-native';
import Text from '@components/Text';
import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useDebouncedAccessibilityAnnouncement from '@hooks/useDebouncedAccessibilityAnnouncement';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {TableData} from '.';
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
function TableBody<DataType extends TableData>({contentContainerStyle, style, ...props}: TableBodyProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {
        processedData: filteredAndSortedData,
        originalDataLength,
        activeSearchString,
        listProps,
        listRef,
        shouldUseNarrowTableLayout,
        hasActiveFilters,
        hasSearchString,
        isEmptyResult,
    } = useTableContext<DataType>();
    const {ListEmptyComponent, contentContainerStyle: listContentContainerStyle, ...restListProps} = listProps ?? {};

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

    // When the underlying data transitions from empty to populated, reset the scroll position to the top so the first row is
    // visible. While the list is empty its content container is stretched with flexGrow1, so in a short (landscape) viewport the
    // empty-state content can be taller than the viewport and leave the list scrolled past the top. FlashList does not reset that
    // offset on the empty -> populated transition, which hides the newly added first row until the user scrolls.
    //
    // We key off originalDataLength (the unfiltered count) rather than the processed length so that clearing a search/filter from
    // a zero-result state does not also trigger the reset — only genuine data arriving (e.g. creating the first workspace) does.
    // The reset is deferred to the next frame with requestAnimationFrame so it lands after FlashList has laid out the newly added
    // first row, rather than racing the render that reveals it.
    const previousOriginalDataLengthRef = useRef(originalDataLength);
    useEffect(() => {
        const previousOriginalDataLength = previousOriginalDataLengthRef.current;
        previousOriginalDataLengthRef.current = originalDataLength;
        if (previousOriginalDataLength !== 0 || originalDataLength === 0) {
            return;
        }
        const rafId = requestAnimationFrame(() => listRef?.current?.scrollToOffset({offset: 0, animated: false}));
        return () => cancelAnimationFrame(rafId);
    }, [originalDataLength, listRef]);

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
                data={filteredAndSortedData}
                style={[styles.flex1, styles.mnh0]}
                showsVerticalScrollIndicator={false}
                maintainVisibleContentPosition={{disabled: true}}
                ListEmptyComponent={isEmptyResult ? EmptyResultComponent : ListEmptyComponent}
                contentContainerStyle={[filteredAndSortedData.length === 0 && styles.flexGrow1, listContentContainerStyle, tableBodyContentContainerStyle, contentContainerStyle]}
                keyboardShouldPersistTaps="handled"
                {...restListProps}
            />
        </View>
    );
}

export default TableBody;
