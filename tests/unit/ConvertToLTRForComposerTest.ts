import convertToLTRForComposer from '@libs/convertToLTRForComposer';
import CONST from '@src/CONST';

describe('convertToLTRForComposer', () => {
    test('Input without RTL characters remains unchanged', () => {
        // Test when input contains no RTL characters
        const inputText = 'Hello, world!';
        const result = convertToLTRForComposer(inputText);
        expect(result).toBe(inputText);
    });

    test('Input with RTL characters is prefixed with LTR marker', () => {
        // Test when input contains RTL characters
        const inputText = 'مثال';
        const result = convertToLTRForComposer(inputText);
        expect(result).toBe(`${CONST.UNICODE.LTR}${inputText}`);
    });

    test('Input with mixed RTL and LTR characters is prefixed with LTR marker', () => {
        // Test when input contains mix of RTL and LTR characters
        const inputText = 'مثال test ';
        const result = convertToLTRForComposer(inputText);
        expect(result).toBe(`${CONST.UNICODE.LTR}${inputText}`);
    });

    test('Input with only space remains unchanged', () => {
        // Test when input contains only spaces
        const inputText = '   ';
        const result = convertToLTRForComposer(inputText);
        expect(result).toBe(inputText);
    });

    test('Input with existing LTR marker remains unchanged', () => {
        // Test when input already starts with the LTR marker
        const inputText = `${CONST.UNICODE.LTR}مثال`;
        const result = convertToLTRForComposer(inputText);
        expect(result).toBe(inputText);
    });

    test('Input starting with native emojis remains unchanged', () => {
        // Test when input starts with the native emojis
        const inputText = '🧶';
        const result = convertToLTRForComposer(inputText);
        expect(result).toBe(inputText);
    });

    test('Input is empty', () => {
        // Test when input is empty to check for draft comments
        const inputText = '';
        const result = convertToLTRForComposer(inputText);
        expect(result.length).toBe(0);
    });

    test('input with special characters remains unchanged', () => {
        // Test when input contains special characters
        const specialCharacters = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '-', '=', '{', '}', '[', ']', '"', ':', ';', '<', '>', '?', '`', '~'];
        for (const character of specialCharacters) {
            const result = convertToLTRForComposer(character);
            expect(result).toBe(character);
        }
    });
});
