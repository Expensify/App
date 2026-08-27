import useThemeStyles from '@hooks/useThemeStyles';

import type {LayoutChangeEvent, StyleProp, ViewStyle} from 'react-native';

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

    /**
     * The transactions the table renders. Passed by the expense views to size the free-text columns from their content;
     * views that leave it out keep the columns' fixed and flex widths.
     */
    data?: SearchListItem[];

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
    children,
}: SearchListViewLayoutProps) {
    const styles = useThemeStyles();

    const [tableWidth, setTableWidth] = useState(0);

    const handleTableLayout = (event: LayoutChangeEvent) => {
        setTableWidth(event.nativeEvent.layout.width);
    };

    const columnWidths = useSearchColumnWidths({
        columns,
        data: data ?? [],
        // A header is only rendered in the table layout; narrow layouts render rows as cards with no columns to size.
        isEnabled: isHeaderVisible && !!data,
    });

    // The scroller sizes the table from what its columns refuse to shrink below, so it has to know the minimums the
    // dynamic columns measured for themselves rather than the estimates it would otherwise assume for them.
    const measuredColumnMinWidths = Object.fromEntries(Object.entries(columnWidths).map(([column, sizing]) => [column, sizing.minWidth]));

    return (
        // Measured outside the scroller so the node reports the width the table has to fit into, not the width its own
        // content grew to. The window is wider than this, since the page is inset from it, which is why the scroller
        // can't decide whether the table fits by looking at the window.
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
                    measuredColumnMinWidths={measuredColumnMinWidths}
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
