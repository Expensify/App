import escapeCsvField from '@libs/escapeCsvField';

describe('escapeCsvField', () => {
    it.each([
        ['', ''],
        ['Café', 'Café'],
        ['123.45', '123.45'],
        ['Shop, "Central"\r\nBranch', '"Shop, ""Central""\r\nBranch"'],
    ])('escapes CSV text %p without changing its contents', (value, expected) => {
        // Given text that must remain in one spreadsheet cell
        // When CSV escaping is applied
        const result = escapeCsvField(value);

        // Then delimiters are quoted and embedded quotes are doubled
        expect(result).toBe(expected);
    });

    it.each(['=1+1', '+1+1', '-1+1', '@SUM(A1:A2)', '  =1+1', '\tvalue', '\rvalue', '\nvalue'])('prevents spreadsheet formulas in %p', (value) => {
        // Given text beginning with a spreadsheet formula or control character
        // When it is exported as a CSV field
        const result = escapeCsvField(value);

        // Then an apostrophe forces text interpretation, while line breaks stay inside quotes
        const safeValue = `'${value}`;
        const expected = /[\r\n]/.test(value) ? `"${safeValue}"` : safeValue;
        expect(result).toBe(expected);
    });
});
