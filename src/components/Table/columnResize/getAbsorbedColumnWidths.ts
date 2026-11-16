/** Splits a column's resize among the columns to its right, so the row keeps its width instead of overflowing. */
import CONST from '@src/CONST';

const {MIN_WIDTH} = CONST.TABLES.COLUMN_RESIZE;

/** A later column that absorbs another column's resize. */
type ColumnAbsorber = {
    columnKey: string;

    /** The layout's minimum, so a drag and a reload land on the same widths. */
    minWidth: number;

    /** Widest it may grow to, so a column meant to truncate long values never takes another column's freed width past its cap. */
    maxWidth: number;
};

/**
 * Splits a resize delta equally among the absorbers. An absorber that runs out of room between its minimum and maximum
 * stops absorbing and its share moves to the rest. Whatever none of them can absorb is left over, so the row overflows
 * and scrolls, or falls short and the growable column fills the gap. Shares are whole px and sum exactly. Absorbers without a start width are skipped. Returns each absorber's new width by column key.
 */
function getAbsorbedColumnWidths(absorbers: ColumnAbsorber[], startWidths: Record<string, number>, delta: number): Record<string, number> {
    const absorbersWithRoom = absorbers.flatMap(({columnKey, minWidth, maxWidth}) => {
        const startWidth = startWidths[columnKey];

        if (startWidth === undefined) {
            return [];
        }

        const roundedStartWidth = Math.round(startWidth);

        // How far it can move in the delta's direction: shrinking down to its minimum, or growing up to its maximum.
        const room = delta > 0 ? Math.max(roundedStartWidth - Math.max(Math.round(minWidth), MIN_WIDTH), 0) : Math.max(Math.round(maxWidth) - roundedStartWidth, 0);

        return [{columnKey, startWidth: roundedStartWidth, room}];
    });

    // Settled from the least room up, so an absorber hitting its minimum leaves its unabsorbed share to the rest. Stable, so ties keep render order.
    const settleOrder = absorbersWithRoom.toSorted((first, second) => first.room - second.room);
    const absorbedWidths: Record<string, number> = {};
    let remainingDelta = Math.round(delta);

    for (const [position, absorber] of settleOrder.entries()) {
        const equalShare = Math.round(remainingDelta / (settleOrder.length - position));
        const share = Math.max(Math.min(equalShare, absorber.room), -absorber.room);

        absorbedWidths[absorber.columnKey] = absorber.startWidth - share;
        remainingDelta -= share;
    }

    return absorbedWidths;
}

export default getAbsorbedColumnWidths;
export type {ColumnAbsorber};
