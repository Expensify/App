/**
 * Which Spend table columns are pinned to the table's start, and how a row holds them in place. Pinned cells only translate. Each row
 * paints one cover behind them (`PinnedRowCover`), which hides the columns scrolling beneath and draws the divider.
 */
import type {StyleProp, ViewStyle} from 'react-native';

import React, {createContext, useContext} from 'react';
import {View} from 'react-native';

import type {SearchColumnType} from './types';

import {PINNED_CELL_CONTAINER_STYLE, PINNED_START_CELL_STYLE} from './pinnedCellStyles';

/** The row states that change a row's background, which its cover paints to match. */
type PinnedRowState = {
    isSelected?: boolean;

    /** Whether the row shows its hover background, which keyboard focus also brings. */
    isHovered?: boolean;
};

const NO_PINNED_COLUMNS: SearchColumnType[] = [];

/** The shown columns pinned to the table's start, in their order. */
const PinnedColumnsContext = createContext<SearchColumnType[]>(NO_PINNED_COLUMNS);

const PinnedRowContext = createContext<PinnedRowState>({});

type PinnedColumnsProviderProps = React.PropsWithChildren<{
    /** The shown columns pinned to the table's start, in their order. */
    leftPinned: SearchColumnType[];
}>;

function PinnedColumnsProvider({leftPinned, children}: PinnedColumnsProviderProps) {
    return <PinnedColumnsContext.Provider value={leftPinned}>{children}</PinnedColumnsContext.Provider>;
}

function PinnedRowProvider({isSelected, isHovered, children}: React.PropsWithChildren<PinnedRowState>) {
    return <PinnedRowContext.Provider value={{isSelected, isHovered}}>{children}</PinnedRowContext.Provider>;
}

function useLeftPinnedColumns(): SearchColumnType[] {
    return useContext(PinnedColumnsContext);
}

function usePinnedRow(): PinnedRowState {
    return useContext(PinnedRowContext);
}

type PinnedColumnStyles = {
    /** The style a column's cell adds to hold it in place, or `undefined` when the column isn't pinned. */
    getPinnedColumnStyle: (columnName: SearchColumnType) => ViewStyle | undefined;

    /** Marks a pinned heading, and the one at the region's inner edge, which the region is measured from. */
    getPinnedHeadingDataSet: (columnName: SearchColumnType) => Record<string, string | undefined> | undefined;

    /** For what sits before the columns (the checkbox, a row's error line), which stays with the left pins whenever there are any. */
    leadingStyle: ViewStyle | undefined;

    /** For every view between a row (which holds the cover) and its cells, so the pinned cells can stack above the cover. */
    cellContainerStyle: ViewStyle | undefined;
};

function usePinnedColumnStyles(): PinnedColumnStyles {
    const leftPinned = useLeftPinnedColumns();
    const hasPinnedColumns = leftPinned.length > 0;

    const getPinnedColumnStyle = (columnName: SearchColumnType) => (leftPinned.includes(columnName) ? PINNED_START_CELL_STYLE : undefined);

    const getPinnedHeadingDataSet = (columnName: SearchColumnType) => {
        if (columnName === leftPinned.at(-1)) {
            return {pinnedHeading: 'true', pinnedStartEdge: 'true'};
        }
        return leftPinned.includes(columnName) ? {pinnedHeading: 'true'} : undefined;
    };

    return {
        getPinnedColumnStyle,
        getPinnedHeadingDataSet,
        leadingStyle: hasPinnedColumns ? PINNED_START_CELL_STYLE : undefined,
        cellContainerStyle: hasPinnedColumns ? PINNED_CELL_CONTAINER_STYLE : undefined,
    };
}

type PinnedViewProps = React.PropsWithChildren<{
    /** The view's own style, which the pin's style goes on top of. */
    style?: StyleProp<ViewStyle>;
}>;

/**
 * Holds what sits before the columns (a checkbox) beside the left pins. A checkbox wraps itself in a Reanimated view, which would
 * take the pin's scroll-driven animation for its own, so the pin goes on this plain View instead. Without pins it adds no view.
 */
function PinnedLeadingView({style, children}: PinnedViewProps) {
    const {leadingStyle} = usePinnedColumnStyles();

    if (!leadingStyle) {
        return children;
    }

    return <View style={[style, leadingStyle]}>{children}</View>;
}

/** A view between a row and its cells, which lets the pinned cells stack above the row's cover. */
function PinnedCellContainerView({style, children}: PinnedViewProps) {
    const {cellContainerStyle} = usePinnedColumnStyles();

    return <View style={[style, cellContainerStyle]}>{children}</View>;
}

export {PinnedColumnsProvider, PinnedRowProvider, PinnedLeadingView, PinnedCellContainerView, useLeftPinnedColumns, usePinnedRow, usePinnedColumnStyles};
