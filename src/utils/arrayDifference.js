"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This function is an equivalent of _.difference, it takes two arrays and returns the difference between them.
 * It returns an array of items that are in the first array but not in the second array.
 */
function arrayDifference(array1, array2) {
    return [array1, array2].reduce(function (a, b) { return a.filter(function (c) { return !b.includes(c); }); });
}
exports.default = arrayDifference;
