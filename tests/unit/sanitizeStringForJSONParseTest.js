"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sanitizeStringForJSONParse_1 = require("../../.github/libs/sanitizeStringForJSONParse");
// Bad inputs should cause an error to be thrown
var badInputs = [null, undefined, 42, true];
// Invalid JSON Data should be able to get parsed and the parsed result should match the input text.
var invalidJSONData = [
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
var validJSONData = [
    ['', ''],
    ['Hello world!', 'Hello world!'],
    ['Hello\\\\world!', 'Hello\\\\world!'],
];
describe('sanitizeStringForJSONParse', function () {
    describe.each(badInputs)('willDetectBadInputs', function (input) {
        test('sanitizeStringForJSONParse', function () {
            expect(function () { return (0, sanitizeStringForJSONParse_1.default)(input); }).toThrow();
        });
    });
    describe.each(invalidJSONData)('canHandleInvalidJSON', function (input, expectedOutput) {
        test('sanitizeStringForJSONParse', function () {
            var badJSON = "{\"key\": \"".concat(input, "\"}");
            expect(function () { return JSON.parse(badJSON); }).toThrow();
            var goodJSON = JSON.parse("{\"key\": \"".concat((0, sanitizeStringForJSONParse_1.default)(input), "\"}"));
            expect(goodJSON.key).toStrictEqual(expectedOutput);
        });
    });
    describe.each(validJSONData)('canHandleValidJSON', function (input, expectedOutput) {
        test('sanitizeStringForJSONParse', function () {
            var goodJSON = JSON.parse("{\"key\": \"".concat((0, sanitizeStringForJSONParse_1.default)(input), "\"}"));
            expect(goodJSON.key).toStrictEqual(expectedOutput);
        });
    });
});
