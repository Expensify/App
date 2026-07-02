import React, {useCallback, useLayoutEffect, useRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {NativeScrollEvent, NativeSyntheticEvent, ScrollView as RNScrollView} from 'react-native';
import ScrollView from '@components/ScrollView';
import type {SearchColumnType, SearchQueryJSON} from '@components/Search/types';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {getTableMinWidth} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';

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
};

/**
 * Wraps the Search table in a horizontal ScrollView when it is wider than the viewport, and restores
 * the saved horizontal offset across query changes (before paint, to avoid a visible shift). Extracted
 * from SearchList so ExpenseFlatSearchView can reuse it.
 */
function HorizontalTableScroll({children, columns, type, isActionColumnWide, isHeaderVisible, dataKey}: HorizontalTableScrollProps) {
    const styles = useThemeStyles();
    const {windowWidth} = useWindowDimensions();
    const minTableWidth = getTableMinWidth(columns, type, isActionColumnWide);
    const shouldScrollHorizontally = isHeaderVisible && minTableWidth > windowWidth;

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
            contentContainerStyle={{width: minTableWidth}}
            contentOffset={{x: savedHorizontalScrollOffset, y: 0}}
            onScroll={handleHorizontalScroll}
            scrollEventThrottle={CONST.TIMING.MIN_SMOOTH_SCROLL_EVENT_THROTTLE}
        >
            {children}
        </ScrollView>
    );
}

export default HorizontalTableScroll;
