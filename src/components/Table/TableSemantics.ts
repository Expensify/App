/** The ARIA table primitives, free of any component so a second table implementation can consume them without pulling in the first. */
import type {Route} from '@src/ROUTES';
import {isEmptyValueObject} from '@src/types/utils/EmptyObject';

import type {ReactNode} from 'react';

import {createContext, useContext} from 'react';

/** Builds a row's footer, or nothing when that row has none. Returning nothing is what keeps it out of the row count. */
type RenderRowFooter<TRow> = (row: TRow) => ReactNode;

type TableSemanticsContextValue = {
    /** Whether the caller is inside a table, and so should expose itself as a `row`/`cell`/`columnheader`. */
    isInTableGrid: boolean;

    /** Where each data row sits in the index contract, by its position in the data. */
    dataRowIndexes: number[];

    /** The table's total row count: the header, every data row, and the extra rows each of them may render. */
    rowCount: number;
};

const NO_TABLE_SEMANTICS: TableSemanticsContextValue = {isInTableGrid: false, dataRowIndexes: [], rowCount: 0};

const TableSemanticsContext = createContext(NO_TABLE_SEMANTICS);

/** Whether the caller is inside a table. Read it through this rather than the context, which is an always-truthy object. */
function useIsInTableGrid() {
    return useContext(TableSemanticsContext).isInTableGrid;
}

type TableRowActionContextValue = {
    /** What the row does when activated */
    onPress: (() => void) | undefined;

    /** Whether the row's action is unavailable */
    isDisabled: boolean;

    /** Where the row leads, when it leads anywhere. Its presence is what makes the row a link rather than a button. */
    route: Route | undefined;
};

/** Carries the row's action to the affordance that sits inside a cell. */
const TableRowActionContext = createContext<TableRowActionContextValue>({onPress: undefined, isDisabled: false, route: undefined});

/** The header occupies row 1, so `aria-rowindex` numbers the data rows from 2. */
const HEADER_ROW_INDEX = 1;

/** A row with errors renders a second row beneath it, so it occupies two positions in the index contract. */
function hasErrorRow(row: {errors?: unknown} | undefined) {
    return !isEmptyValueObject(row?.errors);
}

/**
 * How many extra rows a row renders beneath itself. The renderer and the index contract must agree on this, so both
 * derive it from here rather than from their own reading of the row.
 */
function getExtraRowCount<TRow extends {errors?: unknown}>(row: TRow | undefined, renderRowFooter: RenderRowFooter<TRow> | undefined) {
    if (!row) {
        return 0;
    }

    return (hasErrorRow(row) ? 1 : 0) + (renderRowFooter?.(row) ? 1 : 0);
}

/**
 * Establishes the index contract by walking the rows once. A row would otherwise have to count everything above it to
 * learn its own index, which costs the whole list on every row that renders.
 */
function getTableSemantics<TRow extends {errors?: unknown}>(rows: TRow[], renderRowFooter: RenderRowFooter<TRow> | undefined, isInTableGrid: boolean): TableSemanticsContextValue {
    if (!isInTableGrid) {
        return NO_TABLE_SEMANTICS;
    }

    const dataRowIndexes: number[] = [];
    let nextRowIndex = HEADER_ROW_INDEX + 1;

    for (const row of rows) {
        dataRowIndexes.push(nextRowIndex);
        nextRowIndex += 1 + getExtraRowCount(row, renderRowFooter);
    }

    return {isInTableGrid, dataRowIndexes, rowCount: rows.length ? nextRowIndex - 1 : 0};
}

export {TableSemanticsContext, TableRowActionContext, HEADER_ROW_INDEX, getTableSemantics, hasErrorRow, useIsInTableGrid};
export type {RenderRowFooter};
