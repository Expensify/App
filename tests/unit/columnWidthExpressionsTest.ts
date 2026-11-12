import {getColumnWidthVariableName, getColumnsWidthExpression} from '@components/Table/columnResize/columnWidthExpressions';

describe('columnWidthExpressions', () => {
    // Given a column key holding characters CSS does not allow in a custom property name
    // When it is turned into a custom property name
    // Then each of them is replaced, because a name CSS cannot parse is a width nothing can read
    it('replaces characters that are not valid in a custom property name', () => {
        expect(getColumnWidthVariableName('tax.rate value')).toBe('--table-column-width-tax_rate_value');
    });

    // Given a table with no columns to sum
    // When its width is built
    // Then it is still a valid expression floored at the given floor, since an empty `calc()` would drop the whole width
    it('floors a table with no columns at the floor it was given', () => {
        expect(getColumnsWidthExpression([], 64, '100%')).toBe('max(100%, 64px)');
    });
});
