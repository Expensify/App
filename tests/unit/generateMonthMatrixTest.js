"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var generateMonthMatrix_1 = require("@src/components/DatePicker/CalendarPicker/generateMonthMatrix");
describe('generateMonthMatrix', function () {
    it('returns the correct matrix for January 2022', function () {
        var expected = [
            [undefined, undefined, undefined, undefined, undefined, 1, 2],
            [3, 4, 5, 6, 7, 8, 9],
            [10, 11, 12, 13, 14, 15, 16],
            [17, 18, 19, 20, 21, 22, 23],
            [24, 25, 26, 27, 28, 29, 30],
            [31, undefined, undefined, undefined, undefined, undefined, undefined],
        ];
        expect((0, generateMonthMatrix_1.default)(2022, 0)).toEqual(expected);
    });
    it('returns the correct matrix for February 2022', function () {
        var expected = [
            [undefined, 1, 2, 3, 4, 5, 6],
            [7, 8, 9, 10, 11, 12, 13],
            [14, 15, 16, 17, 18, 19, 20],
            [21, 22, 23, 24, 25, 26, 27],
            [28, undefined, undefined, undefined, undefined, undefined, undefined],
        ];
        expect((0, generateMonthMatrix_1.default)(2022, 1)).toEqual(expected);
    });
    it('returns the correct matrix for leap year February 2020', function () {
        var expected = [
            [undefined, undefined, undefined, undefined, undefined, 1, 2],
            [3, 4, 5, 6, 7, 8, 9],
            [10, 11, 12, 13, 14, 15, 16],
            [17, 18, 19, 20, 21, 22, 23],
            [24, 25, 26, 27, 28, 29, undefined],
        ];
        expect((0, generateMonthMatrix_1.default)(2020, 1)).toEqual(expected);
    });
    it('returns the correct matrix for March 2022', function () {
        var expected = [
            [undefined, 1, 2, 3, 4, 5, 6],
            [7, 8, 9, 10, 11, 12, 13],
            [14, 15, 16, 17, 18, 19, 20],
            [21, 22, 23, 24, 25, 26, 27],
            [28, 29, 30, 31, undefined, undefined, undefined],
        ];
        expect((0, generateMonthMatrix_1.default)(2022, 2)).toEqual(expected);
    });
    it('returns the correct matrix for April 2022', function () {
        var expected = [
            [undefined, undefined, undefined, undefined, 1, 2, 3],
            [4, 5, 6, 7, 8, 9, 10],
            [11, 12, 13, 14, 15, 16, 17],
            [18, 19, 20, 21, 22, 23, 24],
            [25, 26, 27, 28, 29, 30, undefined],
        ];
        expect((0, generateMonthMatrix_1.default)(2022, 3)).toEqual(expected);
    });
    it('returns the correct matrix for December 2022', function () {
        var expected = [
            [undefined, undefined, undefined, 1, 2, 3, 4],
            [5, 6, 7, 8, 9, 10, 11],
            [12, 13, 14, 15, 16, 17, 18],
            [19, 20, 21, 22, 23, 24, 25],
            [26, 27, 28, 29, 30, 31, undefined],
        ];
        expect((0, generateMonthMatrix_1.default)(2022, 11)).toEqual(expected);
    });
    it('returns the correct matrix for January 2025', function () {
        var expected = [
            [undefined, undefined, 1, 2, 3, 4, 5],
            [6, 7, 8, 9, 10, 11, 12],
            [13, 14, 15, 16, 17, 18, 19],
            [20, 21, 22, 23, 24, 25, 26],
            [27, 28, 29, 30, 31, undefined, undefined],
        ];
        expect((0, generateMonthMatrix_1.default)(2025, 0)).toEqual(expected);
    });
    it('returns the correct matrix for February 2025', function () {
        var expected = [
            [undefined, undefined, undefined, undefined, undefined, 1, 2],
            [3, 4, 5, 6, 7, 8, 9],
            [10, 11, 12, 13, 14, 15, 16],
            [17, 18, 19, 20, 21, 22, 23],
            [24, 25, 26, 27, 28, undefined, undefined],
        ];
        expect((0, generateMonthMatrix_1.default)(2025, 1)).toEqual(expected);
    });
    it('returns the correct matrix for June 2025', function () {
        var expected = [
            [undefined, undefined, undefined, undefined, undefined, undefined, 1],
            [2, 3, 4, 5, 6, 7, 8],
            [9, 10, 11, 12, 13, 14, 15],
            [16, 17, 18, 19, 20, 21, 22],
            [23, 24, 25, 26, 27, 28, 29],
            [30, undefined, undefined, undefined, undefined, undefined, undefined],
        ];
        expect((0, generateMonthMatrix_1.default)(2025, 5)).toEqual(expected);
    });
    it('returns the correct matrix for December 2025', function () {
        var expected = [
            [1, 2, 3, 4, 5, 6, 7],
            [8, 9, 10, 11, 12, 13, 14],
            [15, 16, 17, 18, 19, 20, 21],
            [22, 23, 24, 25, 26, 27, 28],
            [29, 30, 31, undefined, undefined, undefined, undefined],
        ];
        expect((0, generateMonthMatrix_1.default)(2025, 11)).toEqual(expected);
    });
    it('throws an error if month is less than 0', function () {
        expect(function () { return (0, generateMonthMatrix_1.default)(2022, -1); }).toThrow();
    });
    it('throws an error if month is greater than 11', function () {
        expect(function () { return (0, generateMonthMatrix_1.default)(2022, 12); }).toThrow();
    });
    it('throws an error if year is negative', function () {
        expect(function () { return (0, generateMonthMatrix_1.default)(-1, 0); }).toThrow();
    });
    it('returns a matrix with 6 rows and 7 columns for January 2022', function () {
        var _a;
        var matrix = (0, generateMonthMatrix_1.default)(2022, 0);
        expect(matrix === null || matrix === void 0 ? void 0 : matrix.length).toBe(6);
        expect((_a = matrix === null || matrix === void 0 ? void 0 : matrix.at(0)) === null || _a === void 0 ? void 0 : _a.length).toBe(7);
    });
});
