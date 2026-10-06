/** Turns pointer travel into column widths, kept within the drag bounds. */
import CONST from '@src/CONST';

import type {AbsorbingColumn} from './getAbsorbedColumnWidths';

import getAbsorbedColumnWidths from './getAbsorbedColumnWidths';

const {MIN_WIDTH, MAX_WIDTH} = CONST.TABLES.COLUMN_RESIZE;

/** The columns paying for a resize, with the widths they pay from. */
type AbsorberWidths = Array<AbsorbingColumn & {columnKey: string}>;

function clampColumnWidth(width: number, minWidth: number = MIN_WIDTH): number {
    return Math.min(Math.max(Math.round(width), minWidth), MAX_WIDTH);
}

/** The width a drag puts the column at: its start width plus the pointer's travel, within the drag bounds. */
function getDraggedColumnWidth(startWidth: number, startClientX: number, clientX: number, minWidth: number = MIN_WIDTH): number {
    return clampColumnWidth(startWidth + (clientX - startClientX), minWidth);
}

/** Every width a resize writes: the column's own, and each paying column's after giving up its share of the difference. */
function getResizedColumnWidths(columnKey: string, width: number, startWidth: number, absorberStartWidths: AbsorberWidths): Record<string, number> {
    const resizedWidths: Record<string, number> = {[columnKey]: width};
    const absorbedWidths = getAbsorbedColumnWidths(absorberStartWidths, width - startWidth);

    for (const [index, absorber] of absorberStartWidths.entries()) {
        const absorbedWidth = absorbedWidths.at(index);

        if (absorbedWidth === undefined) {
            continue;
        }

        resizedWidths[absorber.columnKey] = absorbedWidth;
    }

    return resizedWidths;
}

export {getDraggedColumnWidth, getResizedColumnWidths};
export type {AbsorberWidths};
