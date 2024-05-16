import sanitizeStringForJSONParse from '../../.github/libs/sanitizeStringForJSONParse';

// Bad inputs should cause an error to be thrown
const badInputs: Array<null | undefined | number | boolean> = [null, undefined, 42, true];

// Invalid JSON Data should be able to get parsed and the parsed result should match the input text.
const invalidJSONData: Array<[string, string]> = [
    ['Hello \t world!', 'Hello \t world!'],
    ['Hello \n world!', 'Hello \n world!'],
    ['Hello \n\tworld!', 'Hello \n\tworld!'],
    ['"Hello world!"', '"Hello world!"'],
    ['Test "', 'Test "'],
    ['something `\\ something', 'something `\\ something'],

    // Real-life examples from git commits that broke getMergeLogsAsJSON
    // From https://github.com/Expensify/App/commit/e472470893867648cfbd85a5c2c5d24da1efece6
    ['Add \\', 'Add \\'],

    // From https://github.com/Expensify/App/pull/13500/commits/b730d5c43643f32baa3b189f0238f4de61aae0b7
    ['Prevent commit messages that end in `\\` from breaking `getMergeLogsAsJSON()`', 'Prevent commit messages that end in `\\` from breaking `getMergeLogsAsJSON()`'],
];

// Valid JSON Data should be able to get parsed and the input text should be unmodified.
const validJSONData: Array<[string, string]> = [
    ['', ''],
    ['Hello world!', 'Hello world!'],
    ['Hello\\\\world!', 'Hello\\\\world!'],
];

describe('santizeStringForJSONParse', () => {
    describe.each(badInputs)('willDetectBadInputs', (input) => {
        test('sanitizeStringForJSONParse', () => {
            // @ts-expect-error TODO: Remove this once sanitizeStringForJSONParse (https://github.com/Expensify/App/issues/25360) is migrated to TypeScript.
            expect(() => sanitizeStringForJSONParse(input)).toThrow();
        });
    });

    describe.each(invalidJSONData)('canHandleInvalidJSON', (input, expectedOutput) => {
        test('sanitizeStringForJSONParse', () => {
            const badJSON = `{"key": "${input}"}`;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- it's supposed to throw an error
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
