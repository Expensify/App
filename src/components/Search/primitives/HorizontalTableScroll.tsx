import ScrollView from '@components/ScrollView';
import type {SearchColumnType, SearchQueryJSON} from '@components/Search/types';

import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import {getTableMinWidth} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';

// eslint-disable-next-line no-restricted-imports
import type {NativeScrollEvent, NativeSyntheticEvent, ScrollView as RNScrollView} from 'react-native';

import React, {useCallback, useLayoutEffect, useRef} from 'react';

// Keep a ref to the horizontal scroll offset so we can restore it if users change the search query
let savedHorizontalScrollOffset = 0;

type HorizontalTableScrollProps = {
    /** The table/list content to wrap. */
    children: React.ReactNode;

    /** Columns to render, drives the minimum table width. */
    columns: SearchColumnType[];

    /** Search data type, drives the action-column sizing in getTableMinWidth. */
    type: SearchQueryJSON['type'];

    /** Whether the action column uses its wider variant (e.g. a deleted transaction is present). */
    isActionColumnWide?: boolean;

    /** Whether a table header is shown. Horizontal scroll only engages when the header is visible. */
    isHeaderVisible: boolean;

    /** Re-restores the saved horizontal offset whenever this value changes (typically the list data). */
    dataKey: unknown;

    /** Known minimums for the columns that have one, replacing the estimates `getTableMinWidth` assumes for them. */
    columnMinWidths?: Partial<Record<SearchColumnType, number>>;

    /**
     * What each column wants rather than the least it can take. Used to size the scrolled content, so that once the
     * table scrolls its columns are laid out from what they hold instead of staying squeezed to the widths that only a
     * table short of room would have needed.
     */
    columnContentWidths?: Partial<Record<SearchColumnType, number>>;

    /**
     * Measured width of the area the table lays out into. The page is inset from the window, so the window is wider and
     * comparing against it would leave the table overflowing its container without ever scrolling. Falls back to the
     * window width until the first layout.
     */
    availableWidth?: number;
};

/**
 * Wraps the Search table in a horizontal ScrollView when it is wider than the viewport, and restores
 * the saved horizontal offset across query changes (before paint, to avoid a visible shift). Extracted
 * from SearchList so ExpenseFlatSearchView can reuse it.
 */
function HorizontalTableScroll({children, columns, type, isActionColumnWide, isHeaderVisible, dataKey, columnMinWidths, columnContentWidths, availableWidth}: HorizontalTableScrollProps) {
    const styles = useThemeStyles();
    const {windowWidth} = useWindowDimensions();
    const minTableWidth = getTableMinWidth(columns, type, isActionColumnWide, columnMinWidths);
    const tableWidth = availableWidth && availableWidth > 0 ? availableWidth : windowWidth;

    // Whether to scroll is decided on the minimums, so the table only gives up on fitting once it truly cannot. The
    // scrolled content is then laid out from what the columns want, since there is no longer any room to save by
    // squeezing them, and never narrower than the space already available.
    const shouldScrollHorizontally = isHeaderVisible && minTableWidth > tableWidth;
    const contentTableWidth = Math.max(getTableMinWidth(columns, type, isActionColumnWide, columnContentWidths), minTableWidth, tableWidth);

    const horizontalScrollViewRef = useRef<RNScrollView>(null);

    const handleHorizontalScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        savedHorizontalScrollOffset = event.nativeEvent.contentOffset.x;
    }, []);

    // Restore horizontal scroll position synchronously before paint using useLayoutEffect to avoid a visible shift on the table
    useLayoutEffect(() => {
        if (!shouldScrollHorizontally || savedHorizontalScrollOffset <= 0) {
            return;
        }
        horizontalScrollViewRef.current?.scrollTo({x: savedHorizontalScrollOffset, animated: false});
    }, [dataKey, shouldScrollHorizontally]);

    if (!shouldScrollHorizontally) {
        return children;
    }

    return (
        <ScrollView
            ref={horizontalScrollViewRef}
            horizontal
            showsHorizontalScrollIndicator
            style={styles.flex1}
            contentContainerStyle={{width: contentTableWidth}}
            contentOffset={{x: savedHorizontalScrollOffset, y: 0}}
            onScroll={handleHorizontalScroll}
            scrollEventThrottle={CONST.TIMING.MIN_SMOOTH_SCROLL_EVENT_THROTTLE}
        >
            {children}
        </ScrollView>
    );
}

export default HorizontalTableScroll;
