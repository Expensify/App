import {normalizeImportedAmount} from '@libs/importSpreadsheetUtils';

describe('normalizeImportedAmount', () => {
    it.each([
        ['500', undefined, undefined, '500'],
        ['$1,234.56', '$', 'USD', '1234.56'],
        [' USD 1,234.56 ', '$', 'USD', '1234.56'],
        ['1,234.56 usd', '$', 'USD', '1234.56'],
        ['R$ 1,234.56', 'R$', 'BRL', '1234.56'],
        ['€ 1\u00a0234.56', undefined, undefined, '1234.56'],
        ['', '$', 'USD', ''],
        ['   ', '$', 'USD', ''],
        ['invalid', '$', 'USD', 'invalid'],
    ])('normalizes %j with symbol %j and code %j', (value, symbol, code, expected) => {
        // Given a CSV cell that may contain currency formatting or invalid text.
        // When it is normalized before amount validation.
        const result = normalizeImportedAmount(value ?? '', symbol, code);

        // Then formatting is removed while blank and invalid input remain available for validation.
        expect(result).toBe(expected);
    });
});
