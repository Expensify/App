import {getColumnWidthValue, getColumnWidthVariableName, getColumnsWidthExpression, getGrowableColumnTrack} from '@components/Table/columnResize/columnWidthExpressions';

describe('columnWidthExpressions', () => {
    describe('getColumnWidthVariableName', () => {
        // Given a column key that is already a valid CSS identifier
        // When it is turned into a custom property name
        // Then it is used verbatim, so the name stays readable in devtools
        it('keeps an identifier-safe column key as it is', () => {
            expect(getColumnWidthVariableName('displayName')).toBe('--table-column-width-displayName');
        });

        // Given a column key holding characters CSS does not allow in a custom property name
        // When it is turned into a custom property name
        // Then each of them is replaced, because a name CSS cannot parse is a width nothing can read
        it('replaces characters that are not valid in a custom property name', () => {
            expect(getColumnWidthVariableName('tax.rate value')).toBe('--table-column-width-tax_rate_value');
        });
    });

    describe('getColumnWidthValue', () => {
        // Given a column that resolved to a width
        // When its layout value is built
        // Then the resolved width is the custom property's fallback, which is what paints before a drag writes one
        it('falls back to the resolved width', () => {
            expect(getColumnWidthValue('amount', 120)).toBe('var(--table-column-width-amount, 120px)');
        });
    });

    describe('getGrowableColumnTrack', () => {
        // Given the column that takes the row's leftover width
        // When its grid track is built
        // Then it is floored at its own width and grows into the rest, so the row's trailing chrome stays pinned right
        it('floors the track at the column width and lets it grow', () => {
            expect(getGrowableColumnTrack('var(--table-column-width-action, 40px)')).toBe('minmax(var(--table-column-width-action, 40px), 1fr)');
        });
    });

    describe('getColumnsWidthExpression', () => {
        // Given a table with no columns to sum
        // When the width is built
        // Then it is still floored, so an empty sum can't collapse the rows
        it('floors a table with no columns at the floor it was given', () => {
            expect(getColumnsWidthExpression([], 64, '100%')).toBe('max(100%, 64px)');
        });

        // Given columns whose widths are custom properties, plus the chrome around them
        // When the scrolled content's width is built
        // Then it sums to an expression floored at the table's width, so narrowing a column never shrinks the table
        // and widening one past its edge starts the horizontal scroller without React rendering anything
        it('sums the columns and the chrome, floored at the table width', () => {
            expect(getColumnsWidthExpression(['var(--table-column-width-name, 200px)', '80px'], 64, '100%')).toBe('max(100%, calc(var(--table-column-width-name, 200px) + 80px + 64px))');
        });

        // Given a row's own box, whose containing block is the cell the list positions it in
        // When its width is built
        // Then the floor is a length rather than `100%`, because a percentage there resolves against a block that is
        // already the row's margin wider than the row and would leave it overhanging its cell
        it('takes a length floor for a box measured against its own cell', () => {
            expect(getColumnsWidthExpression(['var(--table-column-width-name, 200px)'], 24, '860px')).toBe('max(860px, calc(var(--table-column-width-name, 200px) + 24px))');
        });
    });
});
