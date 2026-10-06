/** Splits a column's resize among the columns to its right, so the row keeps its width instead of overflowing. */
import CONST from '@src/CONST';

const {MIN_WIDTH} = CONST.TABLES.COLUMN_RESIZE;

/** A column paying for a resize. */
type AbsorbingColumn = {
    /** Width it pays from. */
    startWidth: number;

    /** Narrowest it may be squeezed to, usually its content width so paying never truncates what it shows. */
    minWidth: number;
};

/**
 * Splits a resize delta equally among the absorbing columns. A column that runs out of room above its minimum stops
 * paying and its share moves to the rest; whatever none of them can pay overflows and scrolls. Shares are whole px and
 * sum exactly. Shared by the drag and the resolver so columns don't jump on release.
 */
function getAbsorbedColumnWidths(absorbingColumns: AbsorbingColumn[], delta: number): number[] {
    const startWidths = absorbingColumns.map((column) => Math.round(column.startWidth));

    // Narrowing the resized column hands its width out equally, with nothing to cap.
    const slacks = absorbingColumns.map((column, index) => {
        const startWidth = startWidths.at(index) ?? 0;

        return delta > 0 ? Math.max(startWidth - Math.max(Math.round(column.minWidth), MIN_WIDTH), 0) : Number.POSITIVE_INFINITY;
    });

    // Settled from the least slack up, so a column hitting its minimum leaves its unpaid share to columns that can still pay.
    const order = slacks.map((slack, index) => index).sort((first, second) => (slacks.at(first) ?? 0) - (slacks.at(second) ?? 0) || first - second);
    const takes = absorbingColumns.map(() => 0);
    let remaining = Math.round(delta);

    for (const [position, index] of order.entries()) {
        const take = Math.min(slacks.at(index) ?? 0, Math.round(remaining / (order.length - position)));

        takes[index] = take;
        remaining -= take;
    }

    return startWidths.map((startWidth, index) => startWidth - (takes.at(index) ?? 0));
}

export default getAbsorbedColumnWidths;
export type {AbsorbingColumn};
