import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {isTransactionListItemType} from '@libs/SearchUIUtils';

import type {GetReportTableColumnStylesParams} from '@styles/utils';

import type {CardList, PolicyCategories, PolicyTagLists} from '@src/types/onyx';

import type {LayoutChangeEvent, StyleProp, ViewStyle} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';

import React, {useState} from 'react';
import {View} from 'react-native';

import type {SearchListItem} from './SearchList/ListItem/types';
import type {SearchColumnType, SearchQueryJSON} from './types';

import useSearchColumnWidths from './hooks/useSearchColumnWidths';
import HorizontalTableScroll from './primitives/HorizontalTableScroll';
import {SearchColumnWidthsProvider} from './SearchColumnWidthsContext';

type SearchListViewLayoutProps = {
    /** Columns rendered in the table (drives the min-width for horizontal scroll). */
    columns: SearchColumnType[];

    /** Search data type (sizes the action column). */
    type: SearchQueryJSON['type'];

    /** Whether the action column uses its wider variant. */
    isActionColumnWide: boolean;

    /** Whether a column header is present (gates horizontal scroll). */
    isHeaderVisible: boolean;

    /** Re-restores the saved horizontal offset whenever it changes (typically the list data). */
    dataKey: unknown;

    /** Whether the keyboard is shown (suppresses the bottom safe-area padding). */
    isKeyboardShown: boolean;

    /** The bottom safe-area padding style applied when the keyboard is hidden. */
    safeAreaPaddingBottomStyle: StyleProp<ViewStyle>;

    /** Outer container style for the list wrapper. */
    containerStyle: StyleProp<ViewStyle>;

    /** The rendered transactions, so the free-text columns can be sized from them. Left out, columns keep their widths. */
    data?: SearchListItem[];

    /** The viewer's non-personal and workspace cards, so the card column can be sized from the names it renders. */
    nonPersonalAndWorkspaceCards?: CardList;

    /** Every policy's categories, so the category GL code column can be sized from the codes it renders. */
    policyCategories?: OnyxCollection<PolicyCategories>;

    /** Every policy's tag lists, so the tag GL code column can be sized from the codes it renders. */
    policyTags?: OnyxCollection<PolicyTagLists>;

    /** The list and any header/modal blocks, composed by the view (e.g. SelectionTopBar, BaseSearchList, long-press menu). */
    children: React.ReactNode;
};

/**
 * The shared chrome around every Search list view: the horizontal table scroller and the keyboard/safe-area
 * aware container. Purely presentational, each view composes its own header, list, and long-press menu as
 * children so view-specific blocks and list props (grouping, footers) stay with the view.
 */
function SearchListViewLayout({
    columns,
    type,
    isActionColumnWide,
    isHeaderVisible,
    dataKey,
    isKeyboardShown,
    safeAreaPaddingBottomStyle,
    containerStyle,
    data,
    nonPersonalAndWorkspaceCards,
    policyCategories,
    policyTags,
    children,
}: SearchListViewLayoutProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const [tableWidth, setTableWidth] = useState(0);

    const handleTableLayout = (event: LayoutChangeEvent) => {
        setTableWidth(event.nativeEvent.layout.width);
    };

    const columnWidths = useSearchColumnWidths({
        columns,
        data: data ?? [],
        // A header is only rendered in the table layout. Narrow layouts render rows as cards with no columns to size.
        isEnabled: isHeaderVisible && !!data,
        measurementContext: {nonPersonalAndWorkspaceCards, policyCategories, policyTags},
    });

    // The scroller decides whether to scroll by summing what each column refuses to shrink below, which it otherwise has
    // to estimate. Every minimum it can be told exactly is resolved here instead.
    //
    // While sizing is active a dynamic column knows its own minimum, and every other column is pinned to the width it
    // declares, so that declared width is its minimum. When sizing is off the columns keep their flex behavior and the
    // scroller's own estimates still apply, which is why nothing is resolved for them here.
    const isSizingColumns = Object.keys(columnWidths).length > 0;
    const columnMinWidths: Partial<Record<SearchColumnType, number>> = {};

    // Each row decides for itself whether these columns take their wide variant, from the value it renders: an amount
    // long enough to need the room, or a date carrying a year. The table has to fit the widest row it holds, so one
    // wide row widens the column for the whole table.
    const transactionItems = (data ?? []).filter(isTransactionListItemType);
    const columnSizeOptions: GetReportTableColumnStylesParams = {
        isActionColumnWide,
        isAmountColumnWide: transactionItems.some((item) => item.isAmountColumnWide),
        isTaxAmountColumnWide: transactionItems.some((item) => item.isTaxAmountColumnWide),
        isDateColumnWide: transactionItems.some((item) => item.shouldShowYear),
        isSubmittedColumnWide: transactionItems.some((item) => item.shouldShowYearSubmitted),
        isApprovedColumnWide: transactionItems.some((item) => item.shouldShowYearApproved),
        isPostedColumnWide: transactionItems.some((item) => item.shouldShowYearPosted),
        isExportedColumnWide: transactionItems.some((item) => item.shouldShowYearExported),
    };

    // What each column would rather have than its minimum. Only the dynamic columns differ between the two: everything
    // else is pinned to one width, so it wants exactly what it is never squeezed below.
    const columnContentWidths: Partial<Record<SearchColumnType, number>> = {};

    for (const column of columns) {
        const sizing = columnWidths[column];

        if (sizing) {
            columnMinWidths[column] = sizing.minWidth;
            columnContentWidths[column] = sizing.contentWidth;
        } else if (isSizingColumns) {
            const declaredWidth = StyleUtils.getReportTableColumnStyles(column, columnSizeOptions).width;

            // A column styled with flex alone declares no width, so the scroller keeps estimating that one.
            if (typeof declaredWidth === 'number') {
                columnMinWidths[column] = declaredWidth;
                columnContentWidths[column] = declaredWidth;
            }
        }
    }

    return (
        // Measured outside the scroller, so this reports the width the table has to fit into rather than the width its
        // content grew to. The page is inset from the window, so the window is wider and can't answer this.
        <View
            style={styles.flex1}
            onLayout={handleTableLayout}
        >
            <SearchColumnWidthsProvider columnWidths={columnWidths}>
                <HorizontalTableScroll
                    columns={columns}
                    type={type}
                    isActionColumnWide={isActionColumnWide}
                    isHeaderVisible={isHeaderVisible}
                    dataKey={dataKey}
                    columnMinWidths={columnMinWidths}
                    columnContentWidths={columnContentWidths}
                    availableWidth={tableWidth}
                >
                    <View style={[styles.flex1, !isKeyboardShown && safeAreaPaddingBottomStyle, containerStyle]}>{children}</View>
                </HorizontalTableScroll>
            </SearchColumnWidthsProvider>
        </View>
    );
}

SearchListViewLayout.displayName = 'SearchListViewLayout';

export default SearchListViewLayout;
