/**
 * Which Spend table columns are pinned, and how a row holds them in place. Pinned cells only translate. Each row paints one
 * cover behind them (`PinnedRowCovers`), which hides the columns scrolling beneath and draws the divider.
 */
import type {ViewStyle} from 'react-native';

import React, {createContext, useContext} from 'react';

import type {SearchColumnType} from './types';

import {PINNED_CELL_CONTAINER_STYLE, PINNED_START_CELL_STYLE} from './pinnedCellStyles';
import {PINNED_EDGE} from './pinnedCellStyles/pinnedScrollVariables';

type PinnedColumnsState = {
    /** The shown columns pinned to the table's start, in their order. */
    leftPinned: SearchColumnType[];
};

/** The row states that change a row's background, which its cover paints to match. */
type PinnedRowState = {
    isSelected?: boolean;

    /** Whether the row shows its hover background, which keyboard focus also brings. */
    isHovered?: boolean;
};

const NO_PINNED_COLUMNS: PinnedColumnsState = {leftPinned: []};

const PinnedColumnsContext = createContext<PinnedColumnsState>(NO_PINNED_COLUMNS);

const PinnedRowContext = createContext<PinnedRowState>({});

function PinnedColumnsProvider({leftPinned, children}: React.PropsWithChildren<PinnedColumnsState>) {
    return <PinnedColumnsContext.Provider value={{leftPinned}}>{children}</PinnedColumnsContext.Provider>;
}

function PinnedRowProvider({isSelected, isHovered, children}: React.PropsWithChildren<PinnedRowState>) {
    return <PinnedRowContext.Provider value={{isSelected, isHovered}}>{children}</PinnedRowContext.Provider>;
}

function usePinnedColumns(): PinnedColumnsState {
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
    const {leftPinned} = usePinnedColumns();
    const hasPinnedColumns = leftPinned.length > 0;

    const getPinnedColumnStyle = (columnName: SearchColumnType) => (leftPinned.includes(columnName) ? PINNED_START_CELL_STYLE : undefined);

    const getPinnedHeadingDataSet = (columnName: SearchColumnType) => {
        if (columnName === leftPinned.at(-1)) {
            return {pinnedHeading: 'true', pinnedEdge: PINNED_EDGE.START};
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

export {PinnedColumnsProvider, PinnedRowProvider, usePinnedColumns, usePinnedRow, usePinnedColumnStyles};
