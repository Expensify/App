"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var times_1 = require("@src/utils/times");
describe('times', function () {
    it('should create an array of n elements', function () {
        var result = (0, times_1.default)(3);
        expect(result).toEqual([0, 1, 2]);
    });
    it('should create an array of n elements with values from the function', function () {
        var result = (0, times_1.default)(3, function (i) { return i * 2; });
        expect(result).toEqual([0, 2, 4]);
    });
    it('should create an empty array if n is 0', function () {
        var result = (0, times_1.default)(0);
        expect(result).toEqual([]);
    });
    it('should create an array of undefined if no function is provided', function () {
        var result = (0, times_1.default)(3, function () { return undefined; });
        expect(result).toEqual([undefined, undefined, undefined]);
    });
    it('should create an array of n elements with string values from the function', function () {
        var result = (0, times_1.default)(3, function (i) { return "item ".concat(i); });
        expect(result).toEqual(['item 0', 'item 1', 'item 2']);
    });
    it('should create an array of n elements with constant string value', function () {
        var result = (0, times_1.default)(3, function () { return 'constant'; });
        expect(result).toEqual(['constant', 'constant', 'constant']);
    });
});
