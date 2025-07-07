"use strict";
/* eslint-disable rulesdir/prefer-at */
// .at() has a performance overhead we explicitly want to avoid here
Object.defineProperty(exports, "__esModule", { value: true });
exports.END_CHAR_CODE = exports.DELIMITER_CHAR_CODE = exports.SPECIAL_CHAR_CODE = exports.ALPHABET_SIZE = exports.ALPHABET = void 0;
exports.stringToNumeric = stringToNumeric;
exports.convertToBase26 = convertToBase26;
/* eslint-disable no-continue */
var DynamicArrayBuffer_1 = require("@libs/DynamicArrayBuffer");
var CHAR_CODE_A = 'a'.charCodeAt(0);
var ALPHABET = 'abcdefghijklmnopqrstuvwxyz';
exports.ALPHABET = ALPHABET;
var LETTER_ALPHABET_SIZE = ALPHABET.length;
var ALPHABET_SIZE = LETTER_ALPHABET_SIZE + 3; // +3: special char, delimiter char, end char
exports.ALPHABET_SIZE = ALPHABET_SIZE;
var SPECIAL_CHAR_CODE = ALPHABET_SIZE - 3;
exports.SPECIAL_CHAR_CODE = SPECIAL_CHAR_CODE;
var DELIMITER_CHAR_CODE = ALPHABET_SIZE - 2;
exports.DELIMITER_CHAR_CODE = DELIMITER_CHAR_CODE;
var END_CHAR_CODE = ALPHABET_SIZE - 1;
exports.END_CHAR_CODE = END_CHAR_CODE;
// Store the results for a char code in a lookup table to avoid recalculating the same values (performance optimization)
var base26LookupTable = new Array();
/**
 * Converts a number to a base26 representation.
 */
function convertToBase26(num) {
    if (num < 0) {
        throw new Error('convertToBase26: Input must be a non-negative integer');
    }
    if (base26LookupTable[num]) {
        return base26LookupTable[num];
    }
    var result = [];
    var workingNum = num;
    do {
        workingNum--;
        result.unshift(workingNum % 26);
        workingNum = Math.floor(workingNum / 26);
    } while (workingNum > 0);
    base26LookupTable[num] = result;
    return result;
}
/**
 * Converts a string to an array of numbers representing the characters of the string.
 * Every number in the array is in the range [0, ALPHABET_SIZE-1] (0-28).
 *
 * The numbers are offset by the character code of 'a' (97).
 * - This is so that the numbers from a-z are in the range 0-28.
 * - 26 is for encoding special characters. Character numbers that are not within the range of a-z will be encoded as "specialCharacter + base26(charCode)"
 * - 27 is for the delimiter character
 * - 28 is for the end character
 *
 * Note: The string should be converted to lowercase first (otherwise uppercase letters get base26'ed taking more space than necessary).
 */
function stringToNumeric(
// The string we want to convert to a numeric representation
input, options) {
    var _a, _b, _c, _d, _e, _f, _g;
    // The out array might be longer than our input string length, because we encode special characters as multiple numbers using the base26 encoding.
    // * 6 is because the upper limit of encoding any char in UTF-8 to base26 is at max 6 numbers.
    var outArray = (_b = (_a = options === null || options === void 0 ? void 0 : options.out) === null || _a === void 0 ? void 0 : _a.array) !== null && _b !== void 0 ? _b : new DynamicArrayBuffer_1.default(input.length * 6, Uint8Array);
    var occurrenceToIndex = (_d = (_c = options === null || options === void 0 ? void 0 : options.out) === null || _c === void 0 ? void 0 : _c.occurrenceToIndex) !== null && _d !== void 0 ? _d : new DynamicArrayBuffer_1.default(input.length * 16 * 4, Uint32Array);
    var index = (_f = (_e = options === null || options === void 0 ? void 0 : options.out) === null || _e === void 0 ? void 0 : _e.index) !== null && _f !== void 0 ? _f : 0;
    // eslint-disable-next-line @typescript-eslint/prefer-for-of -- for-i is slightly faster
    for (var i = 0; i < input.length; i++) {
        var char = input[i];
        if ((_g = options === null || options === void 0 ? void 0 : options.charSetToSkip) === null || _g === void 0 ? void 0 : _g.has(char)) {
            continue;
        }
        var charCode = char.charCodeAt(0);
        if (char >= 'a' && char <= 'z') {
            // char is an alphabet character
            occurrenceToIndex.push(index);
            outArray.push(charCode - CHAR_CODE_A);
        }
        else {
            occurrenceToIndex.push(index);
            outArray.push(SPECIAL_CHAR_CODE);
            var asBase26Numeric = convertToBase26(charCode);
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (var j = 0; j < asBase26Numeric.length; j++) {
                occurrenceToIndex.push(index);
                outArray.push(asBase26Numeric[j]);
            }
        }
    }
    return {
        numeric: (options === null || options === void 0 ? void 0 : options.clamp) ? outArray.truncate() : outArray,
        occurrenceToIndex: occurrenceToIndex,
    };
}
