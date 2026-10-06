import {clampColumnWidth, getDraggedColumnWidth} from '@components/Table/columnResize/columnResizeGestures';

import CONST from '@src/CONST';

const {MIN_WIDTH, MAX_WIDTH} = CONST.TABLES.COLUMN_RESIZE;

describe('columnResizeGestures', () => {
    describe('clampColumnWidth', () => {
        it('keeps widths within the drag bounds as whole px', () => {
            // Given widths below and above the drag bounds, plus a fractional one
            const tooNarrow = MIN_WIDTH - 20;
            const tooWide = MAX_WIDTH + 20;
            const fractional = 150.6;

            // When they are clamped
            const clamped = [tooNarrow, tooWide, fractional].map((width) => clampColumnWidth(width));

            // Then each lands inside the bounds as whole px, so a column can neither vanish nor push the rest out of reach
            expect(clamped).toEqual([MIN_WIDTH, MAX_WIDTH, 151]);
        });
    });

    describe('getDraggedColumnWidth', () => {
        it('adds the pointer travel to the start width', () => {
            // Given a 200px column whose edge was pressed at x=100
            const startWidth = 200;
            const startClientX = 100;

            // When the pointer moves 40px right, and separately 40px left
            const widenedWidth = getDraggedColumnWidth(startWidth, startClientX, 140);
            const narrowedWidth = getDraggedColumnWidth(startWidth, startClientX, 60);

            // Then the column follows the pointer's travel from where it started, not from wherever the last move left it
            expect(widenedWidth).toBe(240);
            expect(narrowedWidth).toBe(160);
        });

        it('stops at the drag bounds', () => {
            // Given a 200px column whose edge was pressed at x=100
            const startWidth = 200;
            const startClientX = 100;

            // When the pointer travels further than the column may shrink or grow
            const narrowestWidth = getDraggedColumnWidth(startWidth, startClientX, -1000);
            const widestWidth = getDraggedColumnWidth(startWidth, startClientX, 5000);

            // Then the width stops at the bounds, so the edge stays reachable however far the pointer goes
            expect(narrowestWidth).toBe(MIN_WIDTH);
            expect(widestWidth).toBe(MAX_WIDTH);
        });

        it('stops at a tighter floor when given one', () => {
            // Given a 200px column that may not shrink below 180px
            const startWidth = 200;
            const startClientX = 100;

            // When the pointer travels 100px left
            const narrowedWidth = getDraggedColumnWidth(startWidth, startClientX, 0, 180);

            // Then the width stops at that floor rather than the default bound
            expect(narrowedWidth).toBe(180);
        });
    });
});
