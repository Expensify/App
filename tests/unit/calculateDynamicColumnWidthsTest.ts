import type {DynamicColumnConstraints} from '@components/Table/calculateDynamicColumnWidths';
import calculateDynamicColumnWidths from '@components/Table/calculateDynamicColumnWidths';

function buildConstraints(contentWidth: number, minWidth = 50, maxWidth = 1000): DynamicColumnConstraints {
    return {contentWidth, minWidth, maxWidth};
}

function sumOf(values: number[]): number {
    return values.reduce((total, value) => total + value, 0);
}

describe('calculateDynamicColumnWidths', () => {
    describe('when no width has to be resolved', () => {
        it('keeps equal columns when there are no columns', () => {
            expect(calculateDynamicColumnWidths([], 900)).toEqual({widths: [], shouldScrollHorizontally: false});
        });

        it('keeps equal columns when the table has not been measured yet', () => {
            expect(calculateDynamicColumnWidths([buildConstraints(400), buildConstraints(100)], 0)).toEqual({widths: [], shouldScrollHorizontally: false});
        });

        it('keeps equal columns when every column fits inside an equal share', () => {
            // An equal share is 300px and no column needs more than that.
            const result = calculateDynamicColumnWidths([buildConstraints(120), buildConstraints(300), buildConstraints(80)], 900);

            expect(result).toEqual({widths: [], shouldScrollHorizontally: false});
        });
    });

    describe('when the content fits but unevenly', () => {
        it('grows the long column, shrinks the short ones, and fills the available width', () => {
            const result = calculateDynamicColumnWidths([buildConstraints(600), buildConstraints(100), buildConstraints(80)], 900);

            expect(result.shouldScrollHorizontally).toBe(false);
            expect(sumOf(result.widths)).toBe(900);
            // Each column gets its content width plus an equal share of the 120px left over.
            expect(result.widths).toEqual([640, 140, 120]);
        });

        it('does not let a column grow past its maximum width', () => {
            const result = calculateDynamicColumnWidths([buildConstraints(800, 50, 500), buildConstraints(100), buildConstraints(80)], 900);

            expect(result.shouldScrollHorizontally).toBe(false);
            expect(sumOf(result.widths)).toBe(900);
            // The first column is capped at 500px, so the 220px left over is split equally.
            expect(result.widths).toEqual([574, 173, 153]);
        });

        it('gives a column at least its minimum width even when its content is narrower', () => {
            const result = calculateDynamicColumnWidths([buildConstraints(600), buildConstraints(10, 200)], 900);

            expect(result.widths.at(1)).toBeGreaterThanOrEqual(200);
            expect(sumOf(result.widths)).toBe(900);
        });
    });

    describe('when the content does not fit', () => {
        it('shrinks every column toward its minimum width in proportion to its slack', () => {
            // 1200px of content in a 700px row, with 200px of that already committed to minimum widths.
            const result = calculateDynamicColumnWidths([buildConstraints(900, 100), buildConstraints(300, 100)], 700);

            expect(result.shouldScrollHorizontally).toBe(false);
            expect(sumOf(result.widths)).toBe(700);
            // 500px of slack is shared out at 50%: 100 + 800 * 0.5 and 100 + 200 * 0.5.
            expect(result.widths).toEqual([500, 200]);
        });

        it('pins the columns to their minimum widths and scrolls once even those do not fit', () => {
            const result = calculateDynamicColumnWidths([buildConstraints(900, 400), buildConstraints(300, 300)], 600);

            expect(result).toEqual({widths: [400, 300], shouldScrollHorizontally: true});
        });

        it('does not scroll when the minimum widths add up to exactly the available width', () => {
            const result = calculateDynamicColumnWidths([buildConstraints(900, 400), buildConstraints(300, 200)], 600);

            expect(result).toEqual({widths: [400, 200], shouldScrollHorizontally: false});
        });
    });

    describe('rounding', () => {
        it('gives the rounding remainder to the widest column so the columns fill the row exactly', () => {
            const result = calculateDynamicColumnWidths([buildConstraints(500), buildConstraints(100), buildConstraints(100)], 701);

            expect(sumOf(result.widths)).toBe(701);
            expect(result.widths.every((width) => Number.isInteger(width))).toBe(true);
            expect(result.widths.at(0)).toBe(Math.max(...result.widths));
        });
    });
});
