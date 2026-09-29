import type {DynamicColumnConstraints} from '@components/Table/calculateDynamicColumnWidths';
import calculateDynamicColumnWidths from '@components/Table/calculateDynamicColumnWidths';

import CONST from '@src/CONST';

const {MAX_COLUMN_WIDTH} = CONST.TABLES.DYNAMIC_COLUMNS;

/** A column capped at the width every column shares, which is what the hooks pass when a column sets no `maxWidth`. */
function buildConstraints(contentWidth: number, maxWidth: number = MAX_COLUMN_WIDTH): DynamicColumnConstraints {
    return {contentWidth, maxWidth};
}

function sumOf(values: number[]): number {
    return values.reduce((total, value) => total + value, 0);
}

describe('calculateDynamicColumnWidths', () => {
    describe('when no width has to be resolved', () => {
        it('keeps equal columns when there are no columns', () => {
            // Given no columns to size
            // When the widths are resolved
            // Then there is nothing to lay out and nothing to scroll
            expect(calculateDynamicColumnWidths([], 900)).toEqual({widths: [], shouldScrollHorizontally: false});
        });
    });

    describe('behavior 1: every column fits in an equal share', () => {
        it('leaves the columns equal', () => {
            // Given three columns in a 900px row, where an equal share is 300px and no column needs more
            // When the widths are resolved
            const result = calculateDynamicColumnWidths([buildConstraints(120), buildConstraints(300), buildConstraints(80)], 900);

            // Then the columns are left on the equal tracks they are already styled with
            expect(result).toEqual({widths: [], shouldScrollHorizontally: false});
        });

        it('sizes the columns explicitly when a maximum is narrower than an equal share', () => {
            // Given two columns whose content fits an equal share of 450px, one of them capped at 200px
            // When the widths are resolved
            const result = calculateDynamicColumnWidths([buildConstraints(100, 200), buildConstraints(100)], 900);

            // Then the columns are sized explicitly, because equal tracks would stretch the capped one past its cap
            expect(result.widths.at(0)).toBe(200);
            expect(sumOf(result.widths)).toBe(900);
        });
    });

    describe('behavior 2: the content fits but unevenly', () => {
        it('gives the long column exactly what it needs and splits the rest equally', () => {
            // Given one column needing more than an equal share of 300px, next to two that need less
            // When the widths are resolved
            const result = calculateDynamicColumnWidths([buildConstraints(600), buildConstraints(100), buildConstraints(80)], 900);

            // Then the long column takes its 600px of content and the other two split the remaining 300px equally,
            // rather than the widest column also taking the largest share of the slack
            expect(result.shouldScrollHorizontally).toBe(false);
            expect(sumOf(result.widths)).toBe(900);
            expect(result.widths).toEqual([600, 150, 150]);
        });

        it('settles a second column when the first one shrinks the share for the rest', () => {
            // Given a 600px column and a 200px column in a 900px row, where an equal share starts at 300px
            // When the widths are resolved
            const result = calculateDynamicColumnWidths([buildConstraints(600), buildConstraints(200), buildConstraints(80)], 900);

            // Then settling the 600px column drops the share to 150px, which the 200px column no longer fits, so it
            // settles at its content too and the last column takes what is left
            expect(result.widths).toEqual([600, 200, 100]);
            expect(sumOf(result.widths)).toBe(900);
        });

        it('does not let a column grow past its maximum width', () => {
            // Given a column with 800px of content capped at 500px
            // When the widths are resolved
            const result = calculateDynamicColumnWidths([buildConstraints(800, 500), buildConstraints(100), buildConstraints(80)], 900);

            // Then it stops at its cap and the other two split the remaining 400px equally
            expect(result.shouldScrollHorizontally).toBe(false);
            expect(sumOf(result.widths)).toBe(900);
            expect(result.widths).toEqual([500, 200, 200]);
        });

        it('leaves space unclaimed when every column has reached its maximum', () => {
            // Given two columns both capped at 200px in a 900px row
            // When the widths are resolved
            const result = calculateDynamicColumnWidths([buildConstraints(100, 200), buildConstraints(100, 200)], 900);

            // Then they stop at their caps rather than absorbing the leftover, because a maximum outranks filling the row
            expect(result.widths).toEqual([200, 200]);
            expect(result.shouldScrollHorizontally).toBe(false);
        });

        it('holds a capped column to its maximum while the others take up the slack', () => {
            // Given a row with more room than the columns need, where an equal split would leave the last column a
            // share wider than its 50px cap
            const constraints = [buildConstraints(300), buildConstraints(30, 60), buildConstraints(200, 50)];

            // When the widths are resolved
            const result = calculateDynamicColumnWidths(constraints, 400);

            // Then the capped column stops at 50px and the room it cannot use goes to the column that can
            expect(result.widths).toEqual([320, 30, 50]);
            expect(result.shouldScrollHorizontally).toBe(false);
        });
    });

    describe('behavior 3: the content does not fit, so the table scrolls', () => {
        it('keeps every column at its content width and scrolls', () => {
            // Given 800px of content in a 600px row
            const result = calculateDynamicColumnWidths([buildConstraints(500), buildConstraints(300)], 600);

            // When the widths are resolved
            // Then no column gives up room for another and the caller scrolls the row instead
            expect(result).toEqual({widths: [500, 300], shouldScrollHorizontally: true});
        });

        it('does not scroll when the content adds up to exactly the available width', () => {
            // Given two columns whose content fills the row exactly
            // When the widths are resolved
            const result = calculateDynamicColumnWidths([buildConstraints(600), buildConstraints(300)], 900);

            // Then they take their content widths and the row still fits
            expect(result.shouldScrollHorizontally).toBe(false);
            expect(result.widths).toEqual([600, 300]);
        });

        it('truncates a column past its maximum rather than scrolling for it', () => {
            // Given a column with 2000px of content capped at 400px, which brings the total to 700px inside a 900px row
            // When the widths are resolved
            const result = calculateDynamicColumnWidths([buildConstraints(2000, 400), buildConstraints(300)], 900);

            // Then that column truncates at its cap instead of widening the table
            expect(result.shouldScrollHorizontally).toBe(false);
            expect(result.widths.at(0)).toBe(400);
            expect(sumOf(result.widths)).toBe(900);
        });

        it('scrolls no wider than the shared maximum for an unusually long value', () => {
            // Given a column holding one value far longer than the width every column shares
            // When the widths are resolved
            const result = calculateDynamicColumnWidths([buildConstraints(5000), buildConstraints(300)], 900);

            // Then it stops at that maximum, so a single row cannot push every column after it out of view
            expect(result).toEqual({widths: [MAX_COLUMN_WIDTH, 300], shouldScrollHorizontally: true});
        });

        it('rounds up so a column is never a fraction of a pixel short of its content', () => {
            // Given columns whose measured content lands on fractional widths
            // When the widths are resolved
            const result = calculateDynamicColumnWidths([buildConstraints(500.2), buildConstraints(300.7)], 700);

            // Then each one is rounded up, since a column a fraction short would clip a character it is meant to show
            expect(result).toEqual({widths: [501, 301], shouldScrollHorizontally: true});
        });

        it('sizes the columns to their content and scrolls when the fixed columns leave nothing to share', () => {
            // Given a table whose fixed columns already fill it, so the dynamic ones share a budget of zero
            // When the widths are resolved
            const result = calculateDynamicColumnWidths([buildConstraints(400), buildConstraints(100)], 0);

            // Then each column takes its own content width, so an empty column stays narrow
            expect(result).toEqual({widths: [400, 100], shouldScrollHorizontally: true});
        });

        it('sizes the columns to their content and scrolls when the fixed columns need more room than the table has', () => {
            // Given a table showing 38 columns, 18 of them fixed, measured 751px wide with 1294px of fixed columns
            // When the widths are resolved
            const result = calculateDynamicColumnWidths([buildConstraints(400), buildConstraints(100)], -1119);

            // Then the negative budget is still resolved from content rather than from room the table never had
            expect(result).toEqual({widths: [400, 100], shouldScrollHorizontally: true});
        });
    });

    describe('rounding', () => {
        it('gives the rounding remainder to the widest column so the columns fill the row exactly', () => {
            // Given three columns sharing a row whose width does not divide evenly between them
            // When the widths are resolved
            const result = calculateDynamicColumnWidths([buildConstraints(500), buildConstraints(100), buildConstraints(100)], 701);

            // Then the remainder goes to the widest column that can still take it, leaving no sub-pixel gap in the row
            expect(sumOf(result.widths)).toBe(701);
            expect(result.widths.every((width) => Number.isInteger(width))).toBe(true);
            expect(result.widths.at(0)).toBe(Math.max(...result.widths));
        });
    });
});
