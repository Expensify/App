"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rand64 = rand64;
exports.generateHexadecimalValue = generateHexadecimalValue;
exports.generateRandomInt = generateRandomInt;
exports.parseFloatAnyLocale = parseFloatAnyLocale;
exports.roundToTwoDecimalPlaces = roundToTwoDecimalPlaces;
exports.clamp = clamp;
exports.generateNewRandomInt = generateNewRandomInt;
var CONST_1 = require("@src/CONST");
/**
 * Generates a random positive 64 bit numeric string by randomly generating the left, middle, and right parts and concatenating them. Used to generate client-side ids.
 *
 * @returns string representation of a randomly generated 64 bit signed integer
 */
function rand64() {
    // Max 64-bit signed:
    // 9,223,372,036,854,775,807
    // The left part of the max 64-bit number *+1* because we're flooring it.
    var left = Math.floor(Math.random() * (CONST_1.default.MAX_64BIT_LEFT_PART + 1));
    var middle;
    var right;
    // If the left is any number but the highest possible, we can actually have any value for the middle part, because even if it's all `9`s, the final value will not overflow the maximum
    // 64-bit number.
    if (left !== CONST_1.default.MAX_64BIT_LEFT_PART) {
        middle = Math.floor(Math.random() * CONST_1.default.MAX_INT_FOR_RANDOM_7_DIGIT_VALUE);
    }
    else {
        middle = Math.floor(Math.random() * (CONST_1.default.MAX_64BIT_MIDDLE_PART + 1));
    }
    // And unless both the left and middle parts were the maximums, the right part can be any value as well.
    if (left !== CONST_1.default.MAX_64BIT_LEFT_PART || middle !== CONST_1.default.MAX_64BIT_MIDDLE_PART) {
        right = Math.floor(Math.random() * CONST_1.default.MAX_INT_FOR_RANDOM_7_DIGIT_VALUE);
    }
    else {
        right = Math.floor(Math.random() * (CONST_1.default.MAX_64BIT_RIGHT_PART + 1));
    }
    // Pad the middle and right with zeros.
    var middleString = middle.toString().padStart(7, '0');
    var rightString = right.toString().padStart(7, '0');
    return left + middleString + rightString;
}
/**
 * Returns a hexadecimal value of the specified length
 */
function generateHexadecimalValue(num) {
    var result = [];
    for (var i = 0; i < num; i++) {
        result.push(Math.floor(Math.random() * 16).toString(16));
    }
    return result.join('').toUpperCase();
}
/**
 * Generates a random integer between a and b
 * It's and equivalent of _.random(a, b)
 *
 * @returns random integer between a and b
 */
function generateRandomInt(a, b) {
    var lower = Math.ceil(Math.min(a, b));
    var upper = Math.floor(Math.max(a, b));
    return Math.floor(lower + Math.random() * (upper - lower + 1));
}
/**
 * Parses a numeric string value containing a decimal separator from any locale.
 *
 * @param value the string value to parse
 * @returns a floating point number parsed from the string value
 */
function parseFloatAnyLocale(value) {
    return parseFloat(value ? value.replace(',', '.') : value);
}
/**
 * Rounds a number to two decimal places.
 * @returns the rounded value
 */
function roundToTwoDecimalPlaces(value) {
    return Math.round(value * 100) / 100;
}
/**
 * Clamps a value between a minimum and maximum value.
 * @returns the clamped value
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
function generateNewRandomInt(old, min, max) {
    var newNum = old;
    while (newNum === old) {
        newNum = generateRandomInt(min, max);
    }
    return newNum;
}
