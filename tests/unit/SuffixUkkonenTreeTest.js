"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var DynamicArrayBuffer_1 = require("@libs/DynamicArrayBuffer");
var index_1 = require("@libs/SuffixUkkonenTree/index");
var utils_1 = require("@libs/SuffixUkkonenTree/utils");
describe('SuffixUkkonenTree', function () {
    // The suffix tree doesn't take strings, but expects an array buffer, where strings have been separated by a delimiter.
    function helperStringsToNumericForTree(strings, charSetToSkip) {
        var numericLists = strings.map(function (s) { return index_1.default.stringToNumeric(s, { clamp: true, charSetToSkip: charSetToSkip }); });
        var numericList = numericLists.reduce(function (acc, _a) {
            var numeric = _a.numeric;
            acc.push.apply(acc, __spreadArray(__spreadArray([], numeric, false), [index_1.default.DELIMITER_CHAR_CODE], false));
            return acc;
        }, 
        // The value we pass to makeTree needs to be offset by one
        [0]);
        numericList.push(index_1.default.END_CHAR_CODE);
        var arrayBuffer = new DynamicArrayBuffer_1.default(numericList.length, Uint8Array);
        numericList.forEach(function (n) { return arrayBuffer.push(n); });
        return arrayBuffer;
    }
    it('should build strings correctly', function () {
        var string = 'abc';
        var numeric = index_1.default.stringToNumeric(string, { clamp: true }).numeric;
        expect(Array.from(numeric)).toEqual(expect.arrayContaining([0, 1, 2]));
    });
    it('should insert, build, and find all occurrences', function () {
        var strings = ['banana', 'pancake'];
        var numericIntArray = helperStringsToNumericForTree(strings);
        var tree = index_1.default.makeTree(numericIntArray);
        tree.build();
        var searchValue = index_1.default.stringToNumeric('an', { clamp: true }).numeric;
        expect(tree.findSubstring(Array.from(searchValue))).toEqual(expect.arrayContaining([2, 4, 9]));
    });
    it('should find by first character', function () {
        var strings = ['pancake', 'banana'];
        var numericIntArray = helperStringsToNumericForTree(strings);
        var tree = index_1.default.makeTree(numericIntArray);
        tree.build();
        var searchValue = index_1.default.stringToNumeric('p', { clamp: true }).numeric;
        expect(tree.findSubstring(Array.from(searchValue))).toEqual(expect.arrayContaining([1]));
    });
    it('should handle identical words', function () {
        var strings = ['banana', 'banana', 'x'];
        var numericIntArray = helperStringsToNumericForTree(strings);
        var tree = index_1.default.makeTree(numericIntArray);
        tree.build();
        var searchValue = index_1.default.stringToNumeric('an', { clamp: true }).numeric;
        expect(tree.findSubstring(Array.from(searchValue))).toEqual(expect.arrayContaining([2, 4, 9, 11]));
    });
    it('should convert string to numeric with a list of chars to skip', function () {
        var numeric = index_1.default.stringToNumeric('abc abc', {
            charSetToSkip: new Set(['b', ' ']),
            clamp: true,
        }).numeric;
        expect(Array.from(numeric)).toEqual([0, 2, 0, 2]);
    });
    it('should convert string outside of a-z to numeric with clamping', function () {
        var numeric = index_1.default.stringToNumeric('2', {
            clamp: true,
        }).numeric;
        // "2" in ASCII is 50, so base26(50) = [0, 23]
        expect(Array.from(numeric)).toEqual([index_1.default.SPECIAL_CHAR_CODE, 0, 23]);
    });
    it('should find words that contain chars to skip', function () {
        // cspell:disable-next-line
        var strings = ['b.an.ana', 'panca.ke'];
        var numericIntArray = helperStringsToNumericForTree(strings, new Set(['.']));
        var tree = index_1.default.makeTree(numericIntArray);
        tree.build();
        var searchValue = index_1.default.stringToNumeric('an', { clamp: true }).numeric;
        expect(tree.findSubstring(Array.from(searchValue))).toEqual(expect.arrayContaining([2, 4, 9]));
    });
});
describe('convertToBase26', function () {
    it('should correctly convert small numbers to base-26', function () {
        expect((0, utils_1.convertToBase26)(1)).toEqual([0]); // A
        expect((0, utils_1.convertToBase26)(26)).toEqual([25]); // Z
        expect((0, utils_1.convertToBase26)(27)).toEqual([0, 0]); // AA
    });
    it('should correctly convert numbers around 26 and 32', function () {
        // Numbers where division by 26 and 32 behave differently
        expect((0, utils_1.convertToBase26)(52)).toEqual([0, 25]); // AZ
        expect((0, utils_1.convertToBase26)(53)).toEqual([1, 0]); // BA
        expect((0, utils_1.convertToBase26)(57)).toEqual([1, 4]); // BE
        expect((0, utils_1.convertToBase26)(63)).toEqual([1, 10]); // BK
    });
    it('should throw an error on negative input', function () {
        expect(function () { return (0, utils_1.convertToBase26)(-1); }).toThrow('convertToBase26: Input must be a non-negative integer');
    });
});
