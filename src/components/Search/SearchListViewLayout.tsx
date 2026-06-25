import React from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import HorizontalTableScroll from './primitives/HorizontalTableScroll';
import SelectionTopBar from './primitives/SelectionTopBar';
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

    /** Props for the sticky select-all/header bar. Omit to hide the bar entirely. */
    selectionTopBar?: React.ComponentProps<typeof SelectionTopBar>;

    /** The list body (BaseSearchList), owned by the view so view-specific list props stay with the view. */
    children: React.ReactNode;

    /** The bottom-docked long-press menu, rendered as a sibling of the list. */
    modal: React.JSX.Element;
};

/**
 * The shared chrome around every Search list view: the horizontal table scroller, the keyboard/safe-area
 * aware container, the optional sticky select-all header, and the long-press menu. Purely presentational,
 * each view computes its rows, columns, and selection counts and passes them in, then renders its own
 * BaseSearchList as children so view-specific list props (grouping, footers) stay with the view.
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
    selectionTopBar,
    children,
    modal,
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
            <View style={[styles.flex1, !isKeyboardShown && safeAreaPaddingBottomStyle, containerStyle]}>
                {!!selectionTopBar && <SelectionTopBar {...selectionTopBar} />}
                {children}
                {modal}
            </View>
        </HorizontalTableScroll>
    );
}

SearchListViewLayout.displayName = 'SearchListViewLayout';

export default SearchListViewLayout;
