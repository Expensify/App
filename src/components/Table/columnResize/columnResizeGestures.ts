/** Turns pointer travel into column widths, kept within the drag bounds. */
import CONST from '@src/CONST';

import type {ColumnAbsorber} from './types';

import getAbsorbedColumnWidths from './getAbsorbedColumnWidths';

const {MIN_WIDTH, MAX_WIDTH} = CONST.TABLES.COLUMN_RESIZE;

function clampColumnWidth(width: number, minWidth: number = MIN_WIDTH): number {
    return Math.min(Math.max(Math.round(width), minWidth), MAX_WIDTH);
}

/** The width a drag puts the column at: its start width plus the pointer's travel, within the drag bounds. */
function getDraggedColumnWidth(startWidth: number, startClientX: number, clientX: number, minWidth: number = MIN_WIDTH): number {
    return clampColumnWidth(startWidth + (clientX - startClientX), minWidth);
}

type GetResizedColumnWidthsParams = {
    columnKey: string;

    /** The width the column is resized to. */
    width: number;

    /** The column's width before the resize. */
    startWidth: number;

    /** Later columns that absorb the difference. */
    absorbers: ColumnAbsorber[];

    /** Absorbers' widths before the resize, by column key. */
    absorberStartWidths: Record<string, number>;
};

/**
 * Every width a resize writes: the column's own, and each absorber's after giving up its share of the difference.
 * Shared by the drag and the resolver so columns don't jump on release.
 */
function getResizedColumnWidths({columnKey, width, startWidth, absorbers, absorberStartWidths}: GetResizedColumnWidthsParams): Record<string, number> {
    return {...getAbsorbedColumnWidths(absorbers, absorberStartWidths, width - startWidth), [columnKey]: width};
}

export {getDraggedColumnWidth, getResizedColumnWidths};
