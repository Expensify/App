import type {DynamicColumnConstraints} from '@components/Table/calculateDynamicColumnWidths';
import calculateDynamicColumnWidths from '@components/Table/calculateDynamicColumnWidths';

// Columns are uncapped by default, matching what the hook passes when a column doesn't set its own `maxWidth`.
function buildConstraints(contentWidth: number, maxWidth = Number.POSITIVE_INFINITY): DynamicColumnConstraints {
    return {contentWidth, maxWidth};
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
            const result = calculateDynamicColumnWidths([buildConstraints(100, 200), buildConstraints(100)], 900);

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
            const result = calculateDynamicColumnWidths([buildConstraints(800, 500), buildConstraints(100), buildConstraints(80)], 900);

            expect(result.shouldScrollHorizontally).toBe(false);
            expect(sumOf(result.widths)).toBe(900);
            // The capped column stops at 500px and the other two split the remaining 400px equally.
            expect(result.widths).toEqual([500, 200, 200]);
        });

        it('leaves space unclaimed when every column has reached its maximum', () => {
            // A maximum outranks filling the row, so the columns stop at 200px each rather than absorbing the leftover.
            const result = calculateDynamicColumnWidths([buildConstraints(100, 200), buildConstraints(100, 200)], 900);

            expect(result.widths).toEqual([200, 200]);
            expect(result.shouldScrollHorizontally).toBe(false);
        });
    });

    describe('behavior 3: the content does not fit', () => {
        it('scrolls at the width the content needs instead of truncating it', () => {
            const result = calculateDynamicColumnWidths([buildConstraints(900), buildConstraints(300)], 700);

            expect(result).toEqual({widths: [900, 300], shouldScrollHorizontally: true});
        });

        it('scrolls as soon as the content is one pixel too wide', () => {
            const result = calculateDynamicColumnWidths([buildConstraints(600), buildConstraints(301)], 900);

            expect(result).toEqual({widths: [600, 301], shouldScrollHorizontally: true});
        });

        it('does not scroll when the content adds up to exactly the available width', () => {
            const result = calculateDynamicColumnWidths([buildConstraints(600), buildConstraints(300)], 900);

            expect(result.shouldScrollHorizontally).toBe(false);
            expect(result.widths).toEqual([600, 300]);
        });

        it('truncates instead of scrolling further for a column that set a maximum', () => {
            // Capping the first column at 400px brings the total to 700px, which fits, so the table doesn't scroll and
            // that column truncates instead. This is the only way a caller chooses truncation over a wider scroll.
            const result = calculateDynamicColumnWidths([buildConstraints(2000, 400), buildConstraints(300)], 900);

            expect(result.shouldScrollHorizontally).toBe(false);
            expect(result.widths.at(0)).toBe(400);
            expect(sumOf(result.widths)).toBe(900);
        });

        it('rounds up so a column is never a fraction of a pixel short of its content', () => {
            const result = calculateDynamicColumnWidths([buildConstraints(900.2), buildConstraints(300.7)], 700);

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
