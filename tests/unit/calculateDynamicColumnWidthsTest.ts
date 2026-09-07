import type {DynamicColumnConstraints} from '@components/Table/calculateDynamicColumnWidths';
import calculateDynamicColumnWidths from '@components/Table/calculateDynamicColumnWidths';

/**
 * A free-text column: squeezable down to `minWidth`, and uncapped, which is what the hook passes when a column doesn't
 * set a `maxWidth` of its own.
 */
function buildConstraints(contentWidth: number, minWidth = Math.min(contentWidth, 180), maxWidth = Number.POSITIVE_INFINITY): DynamicColumnConstraints {
    return {contentWidth, minWidth, maxWidth};
}

/** A column whose values come from a known, short set, so it is never squeezed below its content. */
function buildFitContentConstraints(contentWidth: number): DynamicColumnConstraints {
    return {contentWidth, minWidth: contentWidth, maxWidth: Number.POSITIVE_INFINITY};
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
    });

    describe('behavior 1: every column fits in an equal share', () => {
        it('leaves the columns equal', () => {
            // An equal share is 300px and no column needs more than that.
            const result = calculateDynamicColumnWidths([buildConstraints(120), buildConstraints(300), buildConstraints(80)], 900);

            expect(result).toEqual({widths: [], shouldScrollHorizontally: false});
        });

        it('sizes the columns explicitly when a maximum is narrower than an equal share', () => {
            // Both columns' content fits in an equal share (450px), but equal tracks would stretch the capped column to
            // 450px, past its 200px maximum.
            const result = calculateDynamicColumnWidths([buildConstraints(100, 100, 200), buildConstraints(100)], 900);

            expect(result.widths.at(0)).toBe(200);
            expect(sumOf(result.widths)).toBe(900);
        });
    });

    describe('behavior 2: the content fits but unevenly', () => {
        it('gives the long column exactly what it needs and splits the rest equally', () => {
            const result = calculateDynamicColumnWidths([buildConstraints(600), buildConstraints(100), buildConstraints(80)], 900);

            expect(result.shouldScrollHorizontally).toBe(false);
            expect(sumOf(result.widths)).toBe(900);
            // Only the first column can't fit an equal share (300px), so it takes its 600px of content and the other two
            // split the remaining 300px equally, rather than the widest column also taking the largest share of the slack.
            expect(result.widths).toEqual([600, 150, 150]);
        });

        it('settles a second column when the first one shrinks the share for the rest', () => {
            // An equal share starts at 300px, so only the 600px column is settled first. That drops the share for the
            // rest to 150px, which the 200px column no longer fits, so it settles too and the last column takes the rest.
            const result = calculateDynamicColumnWidths([buildConstraints(600), buildConstraints(200), buildConstraints(80)], 900);

            expect(result.widths).toEqual([600, 200, 100]);
            expect(sumOf(result.widths)).toBe(900);
        });

        it('does not let a column grow past its maximum width', () => {
            const result = calculateDynamicColumnWidths([buildConstraints(800, 180, 500), buildConstraints(100), buildConstraints(80)], 900);

            expect(result.shouldScrollHorizontally).toBe(false);
            expect(sumOf(result.widths)).toBe(900);
            // The capped column stops at 500px and the other two split the remaining 400px equally.
            expect(result.widths).toEqual([500, 200, 200]);
        });

        it('leaves space unclaimed when every column has reached its maximum', () => {
            // A maximum outranks filling the row, so the columns stop at 200px each rather than absorbing the leftover.
            const result = calculateDynamicColumnWidths([buildConstraints(100, 100, 200), buildConstraints(100, 100, 200)], 900);

            expect(result.widths).toEqual([200, 200]);
            expect(result.shouldScrollHorizontally).toBe(false);
        });
    });

    describe('behavior 3: the content does not fit, so the columns are squeezed', () => {
        it('squeezes every column in proportion to how much room it has to give', () => {
            // 1200px of content in a 700px row, with 200px of that already committed to minimum widths, so the 500px of
            // squeezable room is shared out at 50%.
            const result = calculateDynamicColumnWidths([buildConstraints(900, 100), buildConstraints(300, 100)], 700);

            expect(result.shouldScrollHorizontally).toBe(false);
            expect(sumOf(result.widths)).toBe(700);
            expect(result.widths).toEqual([500, 200]);
        });

        it('does not squeeze a column that has to fit its content, and takes the room from the others instead', () => {
            // The second column's minimum is its content, so it keeps all 300px and the first column absorbs the squeeze.
            const result = calculateDynamicColumnWidths([buildConstraints(900, 100), buildFitContentConstraints(300)], 700);

            expect(result.shouldScrollHorizontally).toBe(false);
            expect(result.widths).toEqual([400, 300]);
            expect(sumOf(result.widths)).toBe(700);
        });

        it('does not scroll when the content adds up to exactly the available width', () => {
            const result = calculateDynamicColumnWidths([buildConstraints(600), buildConstraints(300)], 900);

            expect(result.shouldScrollHorizontally).toBe(false);
            expect(result.widths).toEqual([600, 300]);
        });

        it('truncates rather than squeezing further for a column that set a maximum', () => {
            // Capping the first column at 400px brings the total to 700px, which fits inside 900px, so nothing is
            // squeezed and that column truncates instead.
            const result = calculateDynamicColumnWidths([buildConstraints(2000, 180, 400), buildConstraints(300)], 900);

            expect(result.shouldScrollHorizontally).toBe(false);
            expect(result.widths.at(0)).toBe(400);
            expect(sumOf(result.widths)).toBe(900);
        });
    });

    describe('behavior 4: not even the minimum widths fit', () => {
        it('stops at the minimum widths and scrolls', () => {
            const result = calculateDynamicColumnWidths([buildConstraints(900, 400), buildConstraints(300, 300)], 600);

            expect(result).toEqual({widths: [400, 300], shouldScrollHorizontally: true});
        });

        it('does not scroll when the minimum widths add up to exactly the available width', () => {
            const result = calculateDynamicColumnWidths([buildConstraints(900, 400), buildConstraints(300, 200)], 600);

            expect(result).toEqual({widths: [400, 200], shouldScrollHorizontally: false});
        });

        it('scrolls wide enough for a column that has to fit its content', () => {
            // Two columns that must show their content in full, in a row too narrow for both.
            const result = calculateDynamicColumnWidths([buildFitContentConstraints(500), buildFitContentConstraints(400)], 600);

            expect(result).toEqual({widths: [500, 400], shouldScrollHorizontally: true});
        });

        it('rounds up so a column is never a fraction of a pixel short of its minimum', () => {
            const result = calculateDynamicColumnWidths([buildFitContentConstraints(900.2), buildFitContentConstraints(300.7)], 700);

            expect(result).toEqual({widths: [901, 301], shouldScrollHorizontally: true});
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
