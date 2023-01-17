import sanitizeStringForJSONParse from '../../src/libs/sanitizeStringForJSONParse';

// Bad inputs should just be ignored and an empty string returned.
const badInputs = [
    ['', ''],
    [null, ''],
    [undefined, ''],
    [42, ''],
    [true, ''],
];

// Invalid JSON Data should be able to get parsed and the parsed result should match the input text.
const invalidJSONData = [
    ['Hello \t world!', 'Hello \t world!'],
    ['Hello \n world!', 'Hello \n world!'],
    ['Hello \n\tworld!', 'Hello \n\tworld!'],
    ['Hello \\', 'Hello \\'],
    ['"Hello world!"', '"Hello world!"'],
];

// Valid JSON Data should be able to get parsed and the input text should be unmodified.
const validJSONData = [
    ['Hello world!', 'Hello world!'],
    ['Hello\\\\world!', 'Hello\\\\world!'],
];

describe('santizeStringForJSONParse', () => {
    describe.each(badInputs)('canHandleBadInputs', (input, expectedOutput) => {
        test('sanitizeStringForJSONParse', () => {
            const result = sanitizeStringForJSONParse(input);
            expect(result).toStrictEqual(expectedOutput);
        });
    });

    describe.each(invalidJSONData)('canHandleInvalidJSON', (input, expectedOutput) => {
        test('sanitizeStringForJSONParse', () => {
            const badJSON = `{"key": "${input}"}`;
            expect(() => JSON.parse(badJSON)).toThrow();
            const goodJSON = JSON.parse(`{"key": "${sanitizeStringForJSONParse(input)}"}`);
            expect(goodJSON.key).toStrictEqual(expectedOutput);
        });
    });

    describe.each(validJSONData)('canHandleValidJSON', (input, expectedOutput) => {
        test('sanitizeStringForJSONParse', () => {
            const goodJSON = JSON.parse(`{"key": "${sanitizeStringForJSONParse(input)}"}`);
            expect(goodJSON.key).toStrictEqual(expectedOutput);
        });
    });
});
