/** The Spend table's column pins: reading them from a search query, changing them, and ordering the table's columns around them. */
import type {SearchColumnType, SearchQueryJSON} from '@components/Search/types';

import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type PinnedColumnSide = ValueOf<typeof CONST.SEARCH.PINNED_COLUMN_SIDE>;

/** The columns pinned to each edge of the table, each in the order it was pinned. A column is pinned to one edge at most. */
type PinnedColumns = Record<PinnedColumnSide, SearchColumnType[]>;

type QueryPins = Pick<SearchQueryJSON, 'leftPinnedColumns' | 'rightPinnedColumns'>;

const NO_PINNED_COLUMNS: PinnedColumns = {left: [], right: []};

/** Columns a table adds even when its query's saved columns leave them out: Type on expenses, Total on reports, and Violations under a violation filter. */
const COLUMNS_SHOWN_WITHOUT_SAVING = new Set<SearchColumnType>([CONST.SEARCH.TABLE_COLUMNS.TYPE, CONST.SEARCH.TABLE_COLUMNS.TOTAL, CONST.SEARCH.TABLE_COLUMNS.VIOLATIONS]);

/** Reads the query's pins. A query can name a column twice, so the left list wins, and within a list its first mention does. */
function getPinnedColumns({leftPinnedColumns, rightPinnedColumns}: QueryPins): PinnedColumns {
    const left = [...new Set<SearchColumnType>([leftPinnedColumns ?? []].flat())];
    const leftSet = new Set(left);
    const right = [...new Set<SearchColumnType>([rightPinnedColumns ?? []].flat())].filter((column) => !leftSet.has(column));
    return {left, right};
}

/** The edge a column is pinned to, if any. */
function getPinnedSide(pinnedColumns: PinnedColumns, column: SearchColumnType): PinnedColumnSide | undefined {
    if (pinnedColumns.left.includes(column)) {
        return CONST.SEARCH.PINNED_COLUMN_SIDE.LEFT;
    }
    if (pinnedColumns.right.includes(column)) {
        return CONST.SEARCH.PINNED_COLUMN_SIDE.RIGHT;
    }
    return undefined;
}

/** Pins a column to an edge, after the columns already there, or unpins it when no edge is given. Pinning to the other edge moves it. */
function setColumnPin(pinnedColumns: PinnedColumns, column: SearchColumnType, side: PinnedColumnSide | undefined): PinnedColumns {
    const left = pinnedColumns.left.filter((pinnedColumn) => pinnedColumn !== column);
    const right = pinnedColumns.right.filter((pinnedColumn) => pinnedColumn !== column);
    if (side === CONST.SEARCH.PINNED_COLUMN_SIDE.LEFT) {
        left.push(column);
    } else if (side === CONST.SEARCH.PINNED_COLUMN_SIDE.RIGHT) {
        right.push(column);
    }
    return {left, right};
}

/**
 * Drops the pins on columns a query no longer saves, so a column taken off the table doesn't come back pinned when it's added again.
 * With no saved columns the table shows its default ones, which can't be told apart here, so every pin is kept. Pins on the columns
 * a table adds by itself are kept too, since those can't be taken off the table.
 */
function getPinsOnSavedColumns(pinnedColumns: PinnedColumns, savedColumns: SearchColumnType | SearchColumnType[] | undefined): PinnedColumns {
    const saved = new Set([savedColumns ?? []].flat());
    if (saved.size === 0) {
        return pinnedColumns;
    }
    const isKept = (column: SearchColumnType) => saved.has(column) || COLUMNS_SHOWN_WITHOUT_SAVING.has(column);
    return {left: pinnedColumns.left.filter(isKept), right: pinnedColumns.right.filter(isKept)};
}

/** The query with its pins replaced, keeping only pins on the columns it saves. An edge with no pins is left out of the query rather than written empty. */
function getQueryWithPinnedColumns(queryJSON: SearchQueryJSON, pinnedColumns: PinnedColumns): SearchQueryJSON {
    const {left, right} = getPinsOnSavedColumns(pinnedColumns, queryJSON.columns);
    return {
        ...queryJSON,
        leftPinnedColumns: left.length > 0 ? left : undefined,
        rightPinnedColumns: right.length > 0 ? right : undefined,
    };
}

/**
 * Orders the shown columns around their pins: the left pins, the unpinned columns, then the right pins. The header, the rows and the
 * column widths all read this one order, so a pinned column moves everywhere at once. Pins on columns the table doesn't show are ignored.
 */
function getPinnedColumnOrder(columns: SearchColumnType[], pinnedColumns: PinnedColumns): SearchColumnType[] {
    const shownColumns = new Set(columns);
    const leftPinned = pinnedColumns.left.filter((column) => shownColumns.has(column));
    const rightPinned = pinnedColumns.right.filter((column) => shownColumns.has(column));

    if (leftPinned.length === 0 && rightPinned.length === 0) {
        return columns;
    }

    const pinned = new Set([...leftPinned, ...rightPinned]);
    const unpinned = columns.filter((column) => !pinned.has(column));

    // The action column ends the row, so the right pins go before it rather than after it.
    const trailingColumn = unpinned.at(-1) === CONST.SEARCH.TABLE_COLUMNS.ACTION && rightPinned.length > 0 ? unpinned.pop() : undefined;

    return [...leftPinned, ...unpinned, ...rightPinned, ...(trailingColumn ? [trailingColumn] : [])];
}

export {NO_PINNED_COLUMNS, getPinnedColumns, getPinnedSide, setColumnPin, getPinsOnSavedColumns, getQueryWithPinnedColumns, getPinnedColumnOrder};
export type {PinnedColumnSide, PinnedColumns};
