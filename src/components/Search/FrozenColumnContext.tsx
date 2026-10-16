import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import React, {createContext, useContext, useState} from 'react';

import type {SearchColumnType, SearchQueryJSON} from './types';

const PIN_SIDE = {
    LEFT: 'left',
    RIGHT: 'right',
} as const;

type PinSide = ValueOf<typeof PIN_SIDE>;

type PinnedColumns = Record<PinSide, SearchColumnType[]>;

/**
 * Columns that lead the table like the checkbox does. They can't be pinned, and while any column is pinned left they
 * move to the front and stay frozen ahead of the pinned columns.
 */
const ANCHORED_LEFT_COLUMNS = new Set<SearchColumnType>([CONST.SEARCH.TABLE_COLUMNS.RECEIPT, CONST.SEARCH.TABLE_COLUMNS.TYPE]);

const NO_PINNED_COLUMNS: PinnedColumns = {left: [], right: []};

type FrozenColumnState = {
    /** The columns pinned to each side of the table, which stay in place while the table scrolls horizontally. */
    pinnedColumns: PinnedColumns;

    /** Whether the current search shows the table that supports pinning columns. */
    canPinColumns: boolean;
};

type FrozenColumnActions = {
    /** Pins the column to the given side, moving it off the other side if it was pinned there. */
    pinColumn: (column: SearchColumnType, side: PinSide) => void;

    /** Unpins the column, returning it to its place among the unpinned columns. */
    unpinColumn: (column: SearchColumnType) => void;
};

/**
 * Defaults to nothing pinned, because the rows and headers that read this also render outside the Search page, where no
 * provider is mounted.
 */
const FrozenColumnStateContext = createContext<FrozenColumnState>({pinnedColumns: NO_PINNED_COLUMNS, canPinColumns: false});

const FrozenColumnActionsContext = createContext<FrozenColumnActions>({pinColumn: () => {}, unpinColumn: () => {}});

function isAnchoredLeftColumn(column: SearchColumnType) {
    return ANCHORED_LEFT_COLUMNS.has(column);
}

function hasPinnedColumns(pinnedColumns: PinnedColumns) {
    return pinnedColumns.left.length > 0 || pinnedColumns.right.length > 0;
}

/** Which side the column is frozen to. Anchored columns freeze to the left along with the pinned ones. */
function getPinnedSide(column: SearchColumnType, pinnedColumns: PinnedColumns): PinSide | null {
    if (pinnedColumns.left.length > 0 && (isAnchoredLeftColumn(column) || pinnedColumns.left.includes(column))) {
        return PIN_SIDE.LEFT;
    }
    if (pinnedColumns.right.includes(column)) {
        return PIN_SIDE.RIGHT;
    }
    return null;
}

type FrozenCellPosition = {
    /** The side the cell stays on. */
    side: PinSide;

    /** Whether the cell borders the scrolling columns: the last left-frozen cell or the first right-frozen one. */
    isEdge: boolean;
};

/** Where a visible column's cells are frozen, or null when they scroll with the table. */
function getFrozenCellPosition(column: SearchColumnType, visibleColumns: SearchColumnType[], pinnedColumns: PinnedColumns): FrozenCellPosition | null {
    const side = getPinnedSide(column, pinnedColumns);
    if (!side) {
        return null;
    }
    const sameSideColumns = visibleColumns.filter((visibleColumn) => getPinnedSide(visibleColumn, pinnedColumns) === side);
    const edgeColumn = side === PIN_SIDE.LEFT ? sameSideColumns.at(-1) : sameSideColumns.at(0);
    return {side, isEdge: edgeColumn === column};
}

/**
 * Moves the left-frozen columns to the front and the right-pinned columns to the end. Each group keeps the columns'
 * original relative order, so an unpinned column returns to where it was.
 */
function orderColumnsByPin(columns: SearchColumnType[], pinnedColumns: PinnedColumns): SearchColumnType[] {
    if (!hasPinnedColumns(pinnedColumns)) {
        return columns;
    }
    const left: SearchColumnType[] = [];
    const middle: SearchColumnType[] = [];
    const right: SearchColumnType[] = [];
    for (const column of columns) {
        const side = getPinnedSide(column, pinnedColumns);
        if (side === PIN_SIDE.LEFT) {
            left.push(column);
        } else if (side === PIN_SIDE.RIGHT) {
            right.push(column);
        } else {
            middle.push(column);
        }
    }
    // Anchored columns lead the left group, ahead of the pinned columns.
    left.sort((a, b) => Number(isAnchoredLeftColumn(b)) - Number(isAnchoredLeftColumn(a)));
    return [...left, ...middle, ...right];
}

type FrozenColumnProviderProps = React.PropsWithChildren<{
    /** The current search, which decides whether pinning applies. Only the flat expense table supports it. */
    queryJSON: SearchQueryJSON | undefined;
}>;

/** Holds the pinned columns in memory only, so they reset on reload and never leave the client. */
function FrozenColumnProvider({queryJSON, children}: FrozenColumnProviderProps) {
    const [pinnedColumns, setPinnedColumns] = useState<PinnedColumns>(NO_PINNED_COLUMNS);
    const canPinColumns = queryJSON?.type === CONST.SEARCH.DATA_TYPES.EXPENSE && !queryJSON?.groupBy;

    const unpinColumn = (column: SearchColumnType) => {
        setPinnedColumns((current) => ({
            left: current.left.filter((pinned) => pinned !== column),
            right: current.right.filter((pinned) => pinned !== column),
        }));
    };

    const pinColumn = (column: SearchColumnType, side: PinSide) => {
        setPinnedColumns((current) => {
            const next: PinnedColumns = {
                left: current.left.filter((pinned) => pinned !== column),
                right: current.right.filter((pinned) => pinned !== column),
            };
            next[side] = [...next[side], column];
            return next;
        });
    };

    return (
        <FrozenColumnActionsContext.Provider value={{pinColumn, unpinColumn}}>
            <FrozenColumnStateContext.Provider value={{pinnedColumns: canPinColumns ? pinnedColumns : NO_PINNED_COLUMNS, canPinColumns}}>{children}</FrozenColumnStateContext.Provider>
        </FrozenColumnActionsContext.Provider>
    );
}

function useFrozenColumnState() {
    return useContext(FrozenColumnStateContext);
}

function useFrozenColumnActions() {
    return useContext(FrozenColumnActionsContext);
}

export {PIN_SIDE, FrozenColumnProvider, getFrozenCellPosition, getPinnedSide, hasPinnedColumns, isAnchoredLeftColumn, orderColumnsByPin, useFrozenColumnState, useFrozenColumnActions};
export type {FrozenCellPosition, PinSide, PinnedColumns};
