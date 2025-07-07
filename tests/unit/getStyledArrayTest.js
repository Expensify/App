"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GetStyledTextArray_1 = require("../../src/libs/GetStyledTextArray");
describe('getStyledTextArray', function () {
    test('returns an array with a single object with isColored true when prefix matches entire name', function () {
        var result = (0, GetStyledTextArray_1.default)('sm', 'sm');
        expect(result).toEqual([{ text: 'sm', isColored: true }]);
    });
    test('returns an array with two objects, the first with isColored true, when prefix matches the beginning of name', function () {
        var result = (0, GetStyledTextArray_1.default)('smile', 'sm');
        expect(result).toEqual([
            { text: 'sm', isColored: true },
            { text: 'ile', isColored: false },
        ]);
    });
    test('returns an array with three objects, the second with isColored true, when prefix matches in the middle of name', function () {
        var result = (0, GetStyledTextArray_1.default)('smile', 'il');
        expect(result).toEqual([
            { text: 'sm', isColored: false },
            { text: 'il', isColored: true },
            { text: 'e', isColored: false },
        ]);
    });
});
