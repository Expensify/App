/** Splits a column's resize among the columns to its right, so the row keeps its width instead of overflowing. */
import CONST from '@src/CONST';

const {MIN_WIDTH} = CONST.TABLES.COLUMN_RESIZE;

/** A later column that absorbs another column's resize. */
type ColumnAbsorber = {
    columnKey: string;

    /** Narrowest it may be squeezed to, usually its content width so absorbing never truncates what it shows. */
    minWidth: number;
};

/**
 * Splits a resize delta equally among the absorbers. An absorber that runs out of room above its minimum stops
 * absorbing and its share moves to the rest; whatever none of them can absorb overflows and scrolls. Shares are whole px
 * and sum exactly. Absorbers without a start width are skipped. Returns each absorber's new width by column key.
 */
function getAbsorbedColumnWidths(absorbers: ColumnAbsorber[], startWidths: Record<string, number>, delta: number): Record<string, number> {
    const absorbersWithRoom = absorbers.flatMap(({columnKey, minWidth}) => {
        const startWidth = startWidths[columnKey];

        if (startWidth === undefined) {
            return [];
        }

        const roundedStartWidth = Math.round(startWidth);

        // Narrowing the resized column hands its width out equally, with nothing to cap.
        const room = delta > 0 ? Math.max(roundedStartWidth - Math.max(Math.round(minWidth), MIN_WIDTH), 0) : Number.POSITIVE_INFINITY;

        return [{columnKey, startWidth: roundedStartWidth, room}];
    });

    // Settled from the least room up, so an absorber hitting its minimum leaves its unabsorbed share to the rest. Stable, so ties keep render order.
    const settleOrder = absorbersWithRoom.toSorted((first, second) => first.room - second.room);
    const absorbedWidths: Record<string, number> = {};
    let remainingDelta = Math.round(delta);

    for (const [position, absorber] of settleOrder.entries()) {
        const share = Math.min(absorber.room, Math.round(remainingDelta / (settleOrder.length - position)));

        absorbedWidths[absorber.columnKey] = absorber.startWidth - share;
        remainingDelta -= share;
    }

    return absorbedWidths;
}

export default getAbsorbedColumnWidths;
export type {ColumnAbsorber};
