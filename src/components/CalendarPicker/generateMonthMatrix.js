import moment from 'moment';

/**
 * Generates a matrix representation of a month's calendar given the year and month.
 * @param {number} year - The year for which to generate the month matrix.
 * @param {number} month - The month (0-indexed) for which to generate the month matrix.
 * @returns {Array.<Array.<number|null>>} - A 2D array of the month's calendar days, with null values representing days outside the current month.
 */
export default function generateMonthMatrix(year, month) {
    if (typeof year !== 'number') {
        throw new TypeError('Year must be a number');
    }
    if (year < 0) {
        throw new TypeError('Year must be a positive integer');
    }
    if (typeof month !== 'number') {
        throw new TypeError('Month must be a number');
    }
    if (month < 0) {
        throw new TypeError('Month cannot be less than 0');
    }
    if (month > 11) {
        throw new TypeError('Month cannot be greater than 11');
    }

    const daysInMonth = moment([year, month]).daysInMonth();
    const firstDay = moment([year, month, 1]).startOf('month').locale('en');
    const matrix = [];
    let currentWeek = [];
    for (let i = 0; i < firstDay.weekday(); i++) {
        currentWeek.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        const day = moment([year, month, i]).locale('en');
        currentWeek.push(day.date());
        if (day.weekday() === 6) {
            matrix.push(currentWeek);
            currentWeek = [];
        }
    }
    if (currentWeek.length > 0) {
        for (let i = currentWeek.length; i < 7; i++) {
            currentWeek.push(null);
        }
        matrix.push(currentWeek);
    }
    return matrix;
}
