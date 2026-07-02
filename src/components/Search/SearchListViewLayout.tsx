import React from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import HorizontalTableScroll from './primitives/HorizontalTableScroll';
import type {SearchColumnType, SearchQueryJSON} from './types';

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
    children,
}: SearchListViewLayoutProps) {
    const styles = useThemeStyles();

    return (
        <HorizontalTableScroll
            columns={columns}
            type={type}
            isActionColumnWide={isActionColumnWide}
            isHeaderVisible={isHeaderVisible}
            dataKey={dataKey}
        >
            <View style={[styles.flex1, !isKeyboardShown && safeAreaPaddingBottomStyle, containerStyle]}>{children}</View>
        </HorizontalTableScroll>
    );
}

SearchListViewLayout.displayName = 'SearchListViewLayout';

export default SearchListViewLayout;
