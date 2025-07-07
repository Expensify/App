"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = generateMonthMatrix;
var date_fns_1 = require("date-fns");
var DateUtils_1 = require("@libs/DateUtils");
/**
 * Generates a matrix representation of a month's calendar given the year and month.
 *
 * @param year - The year for which to generate the month matrix.
 * @param month - The month (0-indexed) for which to generate the month matrix.
 * @returns A 2D array of the month's calendar days, with null values representing days outside the current month.
 */
function generateMonthMatrix(year, month) {
    var _a, _b, _c;
    if (year < 0) {
        throw new Error('Year cannot be less than 0');
    }
    if (month < 0) {
        throw new Error('Month cannot be less than 0');
    }
    if (month > 11) {
        throw new Error('Month cannot be greater than 11');
    }
    // Get the week day for the end of week
    var weekEndsOn = DateUtils_1.default.getWeekEndsOn();
    // Get the number of days in the month and the first day of the month
    var firstDayOfMonth = (0, date_fns_1.startOfMonth)(new Date(year, month, 1));
    var daysInMonth = (0, date_fns_1.getDaysInMonth)(firstDayOfMonth);
    // Create a matrix to hold the calendar days
    var matrix = [];
    var currentWeek = [];
    // Add calendar days to the matrix
    for (var i = 1; i <= daysInMonth; i++) {
        var currentDate = (0, date_fns_1.addDays)(firstDayOfMonth, i - 1);
        currentWeek.push(Number((0, date_fns_1.format)(currentDate, 'd')));
        // Start a new row when the current week is full
        if ((0, date_fns_1.getDay)(currentDate) === weekEndsOn) {
            matrix.push(currentWeek);
            currentWeek = [];
        }
    }
    // Add null values for days after the last day of the month
    if (currentWeek.length > 0) {
        for (var i = currentWeek.length; i < 7; i++) {
            currentWeek.push(undefined);
        }
        matrix.push(currentWeek);
    }
    // Add null values for days before the first day of the month
    for (var i = (_b = (_a = matrix.at(0)) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0; i < 7; i++) {
        (_c = matrix.at(0)) === null || _c === void 0 ? void 0 : _c.unshift(undefined);
    }
    return matrix;
}
